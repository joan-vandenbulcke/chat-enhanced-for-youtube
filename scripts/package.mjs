// Zips the built extension (dist/) into releases/chat-restyler-for-youtube-vX.Y.Z.zip
// ready to upload to the Chrome Web Store. The ZIP has manifest.json at its root,
// which is what the store requires. The version is read from the built manifest so
// the file name always matches what Chrome will see.
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const distDir = resolve(root, "dist");
const manifestPath = resolve(distDir, "manifest.json");

if (!existsSync(manifestPath)) {
  console.error("dist/manifest.json not found — run `npm run build` first.");
  process.exit(1);
}

const { version, name } = JSON.parse(readFileSync(manifestPath, "utf8"));
const outDir = resolve(root, "releases");
mkdirSync(outDir, { recursive: true });
const outFile = resolve(outDir, `chat-restyler-for-youtube-v${version}.zip`);

const zip = new AdmZip();
// Add the *contents* of dist/ at the ZIP root (no wrapping folder), so manifest.json
// sits at the archive root as the Chrome Web Store requires.
zip.addLocalFolder(distDir);
zip.writeZip(outFile);

const kb = (statSync(outFile).size / 1024).toFixed(1);
console.log(`✓ ${name} v${version} → releases/chat-restyler-for-youtube-v${version}.zip (${kb} KB)`);
