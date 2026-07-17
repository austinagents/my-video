import {defineConfig, type Plugin} from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";

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

const studioApi = (): Plugin => ({
  name: "studio-api",

  configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
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
      },
    },
  },
});
