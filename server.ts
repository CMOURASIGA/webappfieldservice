import express from "express";
import http from "http";
import net from "net";
import path from "path";
import { createServer as createViteServer } from "vite";

async function findAvailablePort(startPort: number): Promise<number> {
  let currentPort = startPort;

  while (true) {
    const available = await new Promise<boolean>((resolve) => {
      const server = net.createServer();

      server.once("error", () => {
        resolve(false);
      });

      server.once("listening", () => {
        server.close(() => resolve(true));
      });

      server.listen(currentPort, "0.0.0.0");
    });

    if (available) {
      return currentPort;
    }

    currentPort += 1;
  }
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const preferredPort = Number(process.env.PORT ?? 3000);
  const isProduction = process.env.NODE_ENV === "production";
  const port = isProduction ? preferredPort : await findAvailablePort(preferredPort);

  // Vite middleware for development
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the dist directory
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
