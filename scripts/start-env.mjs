#!/usr/bin/env node
/**
 * Point the web app at DEV / UAT / PROD and start Next.js.
 *
 * Copies env/<env>.env → .env.local (which Next.js loads on top of .env), then
 * runs `next dev` so API_URL is always the one for the chosen environment.
 *
 * Usage: node scripts/start-env.mjs <dev|uat|prod>
 */
import { copyFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const env = process.argv[2];
const labels = { dev: "DEV  (local backend)", uat: "UAT  (AWS Lambda)", prod: "PROD" };

if (!labels[env]) {
    console.error("Usage: node scripts/start-env.mjs <dev|uat|prod>");
    process.exit(1);
}

const src = resolve(process.cwd(), "env", `${env}.env`);
const dst = resolve(process.cwd(), ".env.local");

if (!existsSync(src)) {
    console.error(`Missing ${src} — create env/dev.env, env/uat.env and env/prod.env.`);
    process.exit(1);
}

copyFileSync(src, dst);
console.log(`\n→ Web target: ${labels[env]}\n   (${src} → .env.local)\n`);

const result = spawnSync("next", ["dev", "-p", "3001"], { stdio: "inherit" });
if (result.error) {
    console.error(`Could not run next: ${result.error.message}`);
    console.error("Run `npm install` first (the next CLI lives in node_modules/.bin).");
    process.exit(1);
}
process.exit(result.status ?? 0);
