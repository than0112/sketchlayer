import { copyFile, mkdir, readFile, readdir, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const outputDirectory = new URL("../dist-lib/", import.meta.url);
await mkdir(outputDirectory, { recursive: true });
await copyFile(new URL("../src/sketchlayer.css", import.meta.url), new URL("styles.css", outputDirectory));
await copyFile(new URL("../src/pro.css", import.meta.url), new URL("pro.css", outputDirectory));

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const requiredFiles = ["sketchlayer.js", "pro.js", "index.d.ts", "pro/index.d.ts", "styles.css", "pro.css"];

for (const file of requiredFiles) {
  await stat(new URL(file, outputDirectory));
}

const bundle = await stat(new URL("sketchlayer.js", outputDirectory));
const budget = packageJson.sketchlayer?.bundleSizeBudgetBytes ?? 35_000;
if (bundle.size > budget) {
  throw new Error(`Library bundle is ${bundle.size} bytes; budget is ${budget} bytes.`);
}

const sharedFiles = (await readdir(outputDirectory)).filter((file) => file.endsWith(".js") && file !== "sketchlayer.js" && file !== "pro.js");
const sharedGzip = (await Promise.all(sharedFiles.map(async (file) => gzipSync(await readFile(new URL(file, outputDirectory))).byteLength)))
  .reduce((total, size) => total + size, 0);
const coreGzip = gzipSync(await readFile(new URL("sketchlayer.js", outputDirectory))).byteLength + sharedGzip;
const proGzip = gzipSync(await readFile(new URL("pro.js", outputDirectory))).byteLength + sharedGzip;
const coreGzipBudget = packageJson.sketchlayer?.coreGzipBudgetBytes ?? 7_000;
const proGzipBudget = packageJson.sketchlayer?.proGzipBudgetBytes ?? 75_000;
if (coreGzip > coreGzipBudget) throw new Error(`Core gzip is ${coreGzip} bytes; budget is ${coreGzipBudget} bytes.`);
if (proGzip > proGzipBudget) throw new Error(`Pro gzip is ${proGzip} bytes; budget is ${proGzipBudget} bytes.`);

console.log(`Package artifacts ready. Core: ${bundle.size} bytes (${coreGzip} gzip). Pro: ${proGzip} gzip / ${proGzipBudget}.`);
