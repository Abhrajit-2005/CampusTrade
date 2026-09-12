import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initSocket } from "./socket/index.js";

const server = http.createServer(app);

initSocket(server);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received. Shutting down server...`);

  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));