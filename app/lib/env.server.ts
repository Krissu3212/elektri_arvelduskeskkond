import { createRequire } from "node:module";

type DotenvModule = typeof import("dotenv");

const require = createRequire(import.meta.url);
const dotenv: DotenvModule = require("dotenv");

let initialized = false;

function loadEnv() {
  if (initialized) return;
  dotenv.config();
  initialized = true;
}

loadEnv();

export function getServerEnv(name: string, fallback?: string): string | undefined {
  loadEnv();
  const value = process.env[name];
  if (value === undefined || value === "") {
    return fallback;
  }
  return value;
}

