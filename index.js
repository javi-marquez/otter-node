import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import { readdirSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { closePool } from "./src/database/db.js";

const app = express();
const PORT = 3000;
dotenv.config();

const endpoints = [];

for (const f of readdirSync("./src/routes", { recursive: true })) {
  if (f.endsWith(".js")) {
    const mod = await import(pathToFileURL(path.resolve("src/routes", f)));
    endpoints.push(mod.default || mod);
  }
}

app.use(cors());
app.use(express.json());

endpoints.forEach((element) => {
  app.use("/", element);
});

const host = "localhost";
const server = app.listen(PORT, () => {
  console.log(`SERVER : http://${host}:${PORT}`);
});

process.on("SIGINT", async () => {
  server.close(async (err) => {
    if (err) {
      console.error("\nError cerrando el servidor:", err);
      process.exit(1);
    } else {
      console.log("\nServidor cerrado");
      try {
        await closePool();
        console.log("Pool de conexiones cerrado");
        process.exit(0);
      } catch (poolError) {
        console.error("Error cerrando el pool de conexiones:", poolError);
        process.exit(1);
      }
    }
  });
});
