import {defineConfig, type Plugin} from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";
import {getAdvancedStudioProjectDuration} from "./src/advanced-studio/scene-contract";
import {
  getProductTemplate,
  getProductVideoDuration,
} from "./src/advanced-studio2/product-templates";

const readBody = async (request: import("node:http").IncomingMessage) => {
  return await new Promise<string>((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
};

const readBinaryBody = async (
  request: import("node:http").IncomingMessage,
  maxBytes: number,
) => {
  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    request.on("data", (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        reject(new Error("Product images must be 20 MB or smaller."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
};

const runProcess = (
  command: string,
  args: string[],
): Promise<{code: number | null; stderr: string}> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      shell: false,
    });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => resolve({code, stderr}));
    child.on("error", reject);
  });

const studioApi = (): Plugin => ({
  name: "studio-api",

  configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      if (request.url === "/advanced-studio2") {
        request.url = "/advanced-studio2.html";
      }

      if (request.url === "/advanced-studio2-experimental") {
        request.url = "/advanced-studio2.html";
      }

      if (request.url?.startsWith("/antv-studio-previews/")) {
        const assetName = decodeURIComponent(
          request.url.replace("/antv-studio-previews/", "").split("?")[0],
        );
        const filePath = path.resolve("output", "antv-studio", "all", assetName);
        if (!assetName.endsWith(".png") || !fs.existsSync(filePath)) {
          response.statusCode = 404;
          response.end("Not found");
          return;
        }
        response.statusCode = 200;
        response.setHeader("Content-Type", "image/png");
        response.end(fs.readFileSync(filePath));
        return;
      }

      if (
        request.url?.startsWith("/api/export-advanced/") &&
        request.method === "GET"
      ) {
        const formatId = request.url
          .replace("/api/export-advanced/", "")
          .split("?")[0];
        if (!["portrait", "square", "vertical"].includes(formatId)) {
          response.statusCode = 400;
          response.end("Invalid Advanced Studio format.");
          return;
        }

        const fileName = `advanced-studio-${formatId}.mp4`;
        const filePath = path.resolve("output", fileName);
        if (!fs.existsSync(filePath)) {
          response.statusCode = 404;
          response.end("Export not found.");
          return;
        }

        response.statusCode = 200;
        response.setHeader("Content-Type", "video/mp4");
        response.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`,
        );
        response.setHeader("Content-Length", fs.statSync(filePath).size);
        fs.createReadStream(filePath).pipe(response);
        return;
      }

      if (
        request.url?.startsWith("/api/export-advanced2/") &&
        request.method === "GET"
      ) {
        const formatId = request.url
          .replace("/api/export-advanced2/", "")
          .split("?")[0];
        if (!["portrait", "square", "vertical"].includes(formatId)) {
          response.statusCode = 400;
          response.end("Invalid Advanced Studio 2 format.");
          return;
        }
        const fileName = `advanced-studio2-${formatId}.mp4`;
        const filePath = path.resolve("output", fileName);
        if (!fs.existsSync(filePath)) {
          response.statusCode = 404;
          response.end("Export not found.");
          return;
        }
        response.statusCode = 200;
        response.setHeader("Content-Type", "video/mp4");
        response.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`,
        );
        response.setHeader("Content-Length", fs.statSync(filePath).size);
        fs.createReadStream(filePath).pipe(response);
        return;
      }

      if (
        request.url === "/api/advanced-studio2/remove-background" &&
        request.method === "POST"
      ) {
        let temporaryDirectory = "";
        try {
          const contentType = request.headers["content-type"] ?? "";
          if (!["image/png", "image/jpeg", "image/webp"].includes(contentType)) {
            throw new Error("Choose a PNG, JPEG, or WebP product image.");
          }

          const image = await readBinaryBody(request, 20 * 1024 * 1024);
          if (image.length === 0) {
            throw new Error("The uploaded product image is empty.");
          }

          temporaryDirectory = fs.mkdtempSync(
            path.join(process.cwd(), ".advanced-studio2-background-"),
          );
          const extension =
            contentType === "image/png"
              ? "png"
              : contentType === "image/webp"
                ? "webp"
                : "jpg";
          const inputPath = path.join(temporaryDirectory, `input.${extension}`);
          const outputPath = path.join(temporaryDirectory, "product.png");
          fs.writeFileSync(inputPath, image);

          const result = await runProcess("xcrun", [
            "swift",
            path.resolve("scripts/remove-product-background.swift"),
            inputPath,
            outputPath,
          ]);
          if (result.code !== 0 || !fs.existsSync(outputPath)) {
            throw new Error(
              result.stderr.trim() ||
                "Apple Vision could not remove this image background.",
            );
          }

          const output = fs.readFileSync(outputPath);
          response.statusCode = 200;
          response.setHeader("Content-Type", "image/png");
          response.setHeader("Content-Length", output.length);
          response.end(output);
        } catch (error) {
          response.statusCode = 422;
          response.setHeader("Content-Type", "application/json");
          response.end(
            JSON.stringify({
              ok: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Background removal failed.",
            }),
          );
        } finally {
          if (temporaryDirectory) {
            fs.rmSync(temporaryDirectory, {recursive: true, force: true});
          }
        }
        return;
      }

      if (request.url === "/api/project" && request.method === "POST") {
        try {
          const body = await readBody(request);
          const project = JSON.parse(body);

          fs.mkdirSync(path.resolve("public"), {recursive: true});
          fs.writeFileSync(
            path.resolve("public/project.json"),
            JSON.stringify(project, null, 2),
          );

          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ok: true}));
        } catch (error) {
          response.statusCode = 500;
          response.end(
            JSON.stringify({
              ok: false,
              error:
                error instanceof Error ? error.message : "Save failed",
            }),
          );
        }

        return;
      }

      if (request.url === "/api/render" && request.method === "POST") {
        try {
          const body = await readBody(request);
          const project = JSON.parse(body);

          fs.mkdirSync(path.resolve("public"), {recursive: true});
          fs.mkdirSync(path.resolve("output"), {recursive: true});

          fs.writeFileSync(
            path.resolve("public/project.json"),
            JSON.stringify(project, null, 2),
          );

          const child = spawn(
            "npx",
            [
              "remotion",
              "render",
              "src/index.ts",
              "ExplainerVideo",
              "output/explainer.mp4",
              "--props=public/project.json",
              "--overwrite",
            ],
            {
              cwd: process.cwd(),
              stdio: "inherit",
              shell: false,
            },
          );

          child.on("close", (code) => {
            response.statusCode = code === 0 ? 200 : 500;
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify({
                ok: code === 0,
                output: "output/explainer.mp4",
              }),
            );
          });

          child.on("error", (error) => {
            response.statusCode = 500;
            response.end(
              JSON.stringify({
                ok: false,
                error: error.message,
              }),
            );
          });
        } catch (error) {
          response.statusCode = 500;
          response.end(
            JSON.stringify({
              ok: false,
              error:
                error instanceof Error ? error.message : "Render failed",
            }),
          );
        }

        return;
      }

      if (request.url === "/api/render-advanced" && request.method === "POST") {
        try {
          const body = await readBody(request);
          const props = JSON.parse(body);
          const formatId = props.formatId ?? "portrait";
          const compositionId =
            formatId === "square"
              ? "AdvancedStudioIntegrationProofSquare"
              : formatId === "vertical"
                ? "AdvancedStudioIntegrationProofVertical"
                : "AdvancedStudioIntegrationProofPortrait";
          if (!Array.isArray(props.project?.scenes)) {
            throw new Error("Advanced Studio project scenes must be an array.");
          }
          const durationFrames = getAdvancedStudioProjectDuration(props.project);

          fs.mkdirSync(path.resolve("public"), {recursive: true});
          fs.mkdirSync(path.resolve("output"), {recursive: true});

          fs.writeFileSync(
            path.resolve("output/advanced-project.json"),
            JSON.stringify(props, null, 2),
          );

          const child = spawn(
            "npx",
            [
              "remotion",
              "render",
              "src/index.ts",
              compositionId,
              `output/advanced-studio-${formatId}.mp4`,
              "--props=output/advanced-project.json",
              `--duration=${durationFrames}`,
              "--overwrite",
            ],
            {
              cwd: process.cwd(),
              stdio: "inherit",
              shell: false,
            },
          );

          child.on("close", (code) => {
            response.statusCode = code === 0 ? 200 : 500;
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify({
                ok: code === 0,
                output: `output/advanced-studio-${formatId}.mp4`,
                downloadUrl: `/api/export-advanced/${formatId}`,
              }),
            );
          });

          child.on("error", (error) => {
            response.statusCode = 500;
            response.end(
              JSON.stringify({
                ok: false,
                error: error.message,
              }),
            );
          });
        } catch (error) {
          response.statusCode = 500;
          response.end(
            JSON.stringify({
              ok: false,
              error:
                error instanceof Error ? error.message : "Render failed",
            }),
          );
        }

        return;
      }

      if (request.url === "/api/render-advanced2" && request.method === "POST") {
        try {
          const body = await readBody(request);
          const props = JSON.parse(body);
          const formatId = props.formatId ?? "portrait";
          if (!["portrait", "square", "vertical"].includes(formatId)) {
            throw new Error("Invalid Advanced Studio 2 format.");
          }
          const durationInFrames = getProductVideoDuration(props.templateId);
          const batch = getProductTemplate(props.templateId).batch;
          const compositionPrefix =
            batch === 8
              ? "AdvancedStudio2ProductBatch8"
              : batch === 7
              ? "AdvancedStudio2ProductBatch7"
              : batch === 6
              ? "AdvancedStudio2ProductBatch6"
              : batch === 5
              ? "AdvancedStudio2ProductBatch5"
              : batch === 4
                ? "AdvancedStudio2ProductBatch4"
              : batch === 3
                ? "AdvancedStudio2ProductBatch3"
              : batch === 2
                ? "AdvancedStudio2ProductBatch2"
                : "AdvancedStudio2Product";
          const compositionId =
            formatId === "square"
              ? `${compositionPrefix}Square`
              : formatId === "vertical"
                ? `${compositionPrefix}Vertical`
                : `${compositionPrefix}Portrait`;
          fs.mkdirSync(path.resolve("output"), {recursive: true});
          const propsPath = path.resolve("output/advanced-studio2-project.json");
          fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));
          const child = spawn(
            "npx",
            [
              "remotion",
              "render",
              "src/index.ts",
              compositionId,
              `output/advanced-studio2-${formatId}.mp4`,
              "--props=output/advanced-studio2-project.json",
              `--duration=${durationInFrames}`,
              "--overwrite",
            ],
            {
              cwd: process.cwd(),
              stdio: "inherit",
              shell: false,
            },
          );
          child.on("close", (code) => {
            response.statusCode = code === 0 ? 200 : 500;
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify({
                ok: code === 0,
                downloadUrl: `/api/export-advanced2/${formatId}`,
                error: code === 0 ? undefined : "Remotion render failed.",
              }),
            );
          });
          child.on("error", (error) => {
            response.statusCode = 500;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ok: false, error: error.message}));
          });
        } catch (error) {
          response.statusCode = 500;
          response.setHeader("Content-Type", "application/json");
          response.end(
            JSON.stringify({
              ok: false,
              error:
                error instanceof Error ? error.message : "Render failed.",
            }),
          );
        }
        return;
      }

      next();
    });
  },
});

export default defineConfig({
  root: "studio",
  plugins: [react(), studioApi()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "studio/index.html"),
        advanced: path.resolve(__dirname, "studio/advanced-studio.html"),
        advanced2: path.resolve(__dirname, "studio/advanced-studio2.html"),
      },
    },
  },
});
