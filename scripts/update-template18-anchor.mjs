import fs from "node:fs";

const [templateId, scaleText] = process.argv.slice(2);
const scale = Number(scaleText);
if (!templateId || !Number.isFinite(scale)) {
  throw new Error("Usage: node scripts/update-template18-anchor.mjs <template-id> <scale>");
}
const path = `public/advanced-studio2-assets/blender/template18/${templateId}/placement.json`;
const placements = JSON.parse(fs.readFileSync(path, "utf8"));
if (placements.length !== 300) {
  throw new Error(`${templateId} does not have 300 placement entries`);
}
for (const placement of placements) placement.scale = scale;
fs.writeFileSync(path, JSON.stringify(placements, null, 2));
