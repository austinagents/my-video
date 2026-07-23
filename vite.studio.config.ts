import {defineConfig, type Plugin} from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";
import {createHash} from "node:crypto";
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

const polyHavenHeaders = {
  "User-Agent": "Framepoint-Studio/advanced-studio2-experimental",
  Accept: "application/json",
};

type PolyHavenAsset = {
  name: string;
  description?: string;
  thumbnail_url: string;
  category?: string;
  tags?: string[];
  files_hash: string;
  authors?: Record<string, string>;
  download_count?: number;
  type: number;
};

let polyHavenTextureCatalog:
  | Record<string, PolyHavenAsset>
  | undefined;

const getPolyHavenTextureCatalog = async () => {
  if (polyHavenTextureCatalog) return polyHavenTextureCatalog;
  const result = await fetch("https://api.polyhaven.com/assets?type=textures", {
    headers: polyHavenHeaders,
  });
  if (!result.ok) {
    throw new Error(`Poly Haven catalog request failed (${result.status}).`);
  }
  polyHavenTextureCatalog =
    (await result.json()) as Record<string, PolyHavenAsset>;
  return polyHavenTextureCatalog;
};

const sendJson = (
  response: import("node:http").ServerResponse,
  statusCode: number,
  body: unknown,
) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
};

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
        request.url?.startsWith(
          "/advanced-studio2-assets/polyhaven/",
        ) &&
        request.method === "GET"
      ) {
        const fileName = decodeURIComponent(
          request.url
            .replace("/advanced-studio2-assets/polyhaven/", "")
            .split("?")[0],
        );
        if (
          !/^[a-zA-Z0-9_-]+\.(jpg|json)$/.test(fileName) ||
          path.basename(fileName) !== fileName
        ) {
          response.statusCode = 400;
          response.end("Invalid local asset path.");
          return;
        }
        const filePath = path.resolve(
          "public",
          "advanced-studio2-assets",
          "polyhaven",
          fileName,
        );
        if (!fs.existsSync(filePath)) {
          response.statusCode = 404;
          response.end("Local asset not found.");
          return;
        }
        response.statusCode = 200;
        response.setHeader(
          "Content-Type",
          fileName.endsWith(".jpg") ? "image/jpeg" : "application/json",
        );
        response.setHeader("Content-Length", fs.statSync(filePath).size);
        fs.createReadStream(filePath).pipe(response);
        return;
      }

      if (
        request.url?.startsWith("/api/advanced-studio2/polyhaven/assets") &&
        request.method === "GET"
      ) {
        try {
          const requestUrl = new URL(request.url, "http://localhost");
          const query = (requestUrl.searchParams.get("q") ?? "")
            .trim()
            .toLowerCase();
          const page = Math.max(
            1,
            Number.parseInt(requestUrl.searchParams.get("page") ?? "1", 10) ||
              1,
          );
          const catalog = await getPolyHavenTextureCatalog();
          const matches = Object.entries(catalog)
            .filter(([, asset]) => asset.type === 1)
            .filter(([assetId, asset]) => {
              if (!query) return true;
              return [
                assetId,
                asset.name,
                asset.description ?? "",
                asset.category ?? "",
                ...(asset.tags ?? []),
              ]
                .join(" ")
                .toLowerCase()
                .includes(query);
            })
            .sort(
              ([, left], [, right]) =>
                (right.download_count ?? 0) - (left.download_count ?? 0),
            );
          const pageSize = 48;
          const items = matches
            .slice((page - 1) * pageSize, page * pageSize)
            .map(([assetId, asset]) => ({
              assetId,
              name: asset.name,
              description: asset.description ?? "",
              thumbnailUrl: asset.thumbnail_url,
              category: asset.category ?? "",
              tags: asset.tags ?? [],
              filesHash: asset.files_hash,
              authors: Object.keys(asset.authors ?? {}),
              downloadCount: asset.download_count ?? 0,
            }));
          sendJson(response, 200, {
            ok: true,
            items,
            page,
            pageSize,
            total: matches.length,
          });
        } catch (error) {
          sendJson(response, 502, {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Poly Haven catalog unavailable.",
          });
        }
        return;
      }

      if (
        request.url === "/api/advanced-studio2/polyhaven/download" &&
        request.method === "POST"
      ) {
        try {
          const body = JSON.parse(await readBody(request)) as {
            assetId?: string;
          };
          const assetId = body.assetId ?? "";
          if (!/^[a-zA-Z0-9_-]{1,100}$/.test(assetId)) {
            throw new Error("Invalid Poly Haven asset ID.");
          }
          const catalog = await getPolyHavenTextureCatalog();
          const asset = catalog[assetId];
          if (!asset || asset.type !== 1) {
            throw new Error("Poly Haven texture not found.");
          }
          const filesResponse = await fetch(
            `https://api.polyhaven.com/files/${encodeURIComponent(assetId)}`,
            {headers: polyHavenHeaders},
          );
          if (!filesResponse.ok) {
            throw new Error(
              `Poly Haven file request failed (${filesResponse.status}).`,
            );
          }
          const files = (await filesResponse.json()) as {
            Diffuse?: {
              "2k"?: {
                jpg?: {size?: number; md5?: string; url?: string};
              };
            };
          };
          const source = files.Diffuse?.["2k"]?.jpg;
          if (!source?.url || !source.md5) {
            throw new Error("This texture has no supported 2K diffuse JPG.");
          }
          if ((source.size ?? 0) > 15 * 1024 * 1024) {
            throw new Error("The selected texture exceeds the 15 MB limit.");
          }
          const sourceUrl = new URL(source.url);
          if (
            sourceUrl.protocol !== "https:" ||
            sourceUrl.hostname !== "dl.polyhaven.org" ||
            !sourceUrl.pathname.startsWith("/file/ph-assets/Textures/")
          ) {
            throw new Error("Poly Haven returned an unsupported file host.");
          }
          const assetDirectory = path.resolve(
            "public",
            "advanced-studio2-assets",
            "polyhaven",
          );
          fs.mkdirSync(assetDirectory, {recursive: true});
          const fileName = `${assetId}-${source.md5}.jpg`;
          const filePath = path.join(assetDirectory, fileName);
          if (!fs.existsSync(filePath)) {
            const download = await fetch(sourceUrl, {
              headers: {
                "User-Agent":
                  "Framepoint-Studio/advanced-studio2-experimental",
              },
            });
            if (!download.ok) {
              throw new Error(
                `Poly Haven download failed (${download.status}).`,
              );
            }
            const contentType = download.headers.get("content-type") ?? "";
            if (!contentType.startsWith("image/jpeg")) {
              throw new Error("Poly Haven returned an unsupported file type.");
            }
            const bytes = Buffer.from(await download.arrayBuffer());
            if (bytes.length === 0 || bytes.length > 15 * 1024 * 1024) {
              throw new Error("Poly Haven returned an invalid file size.");
            }
            const md5 = createHash("md5").update(bytes).digest("hex");
            if (md5 !== source.md5) {
              throw new Error("Poly Haven file checksum did not match.");
            }
            const temporaryPath = `${filePath}.download`;
            fs.writeFileSync(temporaryPath, bytes);
            fs.renameSync(temporaryPath, filePath);
          }
          const sha256 = createHash("sha256")
            .update(fs.readFileSync(filePath))
            .digest("hex");
          const selection = {
            assetId,
            name: asset.name,
            localSrc: `/advanced-studio2-assets/polyhaven/${fileName}`,
            thumbnailUrl: asset.thumbnail_url,
            filesHash: asset.files_hash,
            resolution: "2k",
            mapType: "Diffuse",
            format: "jpg",
            sourceUrl: source.url,
            authors: Object.keys(asset.authors ?? {}),
          };
          fs.writeFileSync(
            path.join(assetDirectory, `${assetId}-${source.md5}.json`),
            JSON.stringify(
              {
                ...selection,
                sha256,
                downloadedAt: new Date().toISOString(),
                license: "CC0-1.0",
                licenseUrl: "https://polyhaven.com/license",
              },
              null,
              2,
            ),
          );
          sendJson(response, 200, {ok: true, selection});
        } catch (error) {
          sendJson(response, 422, {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Poly Haven texture download failed.",
          });
        }
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
            batch === 12
              ? "AdvancedStudio2ProductBatch12"
              : batch === 11
              ? "AdvancedStudio2ProductBatch11"
              : batch === 10
              ? "AdvancedStudio2ProductBatch10"
              : batch === 9
              ? "AdvancedStudio2ProductBatch9"
              : batch === 8
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
