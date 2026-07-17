import fs from "node:fs";
import path from "node:path";
import { renderToString } from "@antv/infographic/ssr";

const template =
  "relation-dagre-flow-tb-animated-simple-circle-node";

const syntax = `
infographic ${template}
data
  title AntV Native Animation Proof
  desc Verify built-in SVG animation and semantic output
  items
    - id A
      label Research
    - id B
      label Structure
    - id C
      label Animate
    - id D
      label Export
  relations
    - from A
      to B
    - from B
      to C
    - from C
      to D
`;

const svg = await renderToString(syntax, {
  width: 900,
  height: 700,
});

const outputPath = path.resolve("data/animation-proof.svg");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, svg, "utf8");

const animateCount = (svg.match(/<animate(?:\s|>)/g) || []).length;
const animateTransformCount =
  (svg.match(/<animateTransform(?:\s|>)/g) || []).length;

const semanticElementTypes = [
  ...new Set(
    [...svg.matchAll(/data-element-type="([^"]+)"/g)].map(
      (match) => match[1],
    ),
  ),
].sort();

const report = {
  template,
  outputPath,
  svgLength: svg.length,
  animateCount,
  animateTransformCount,
  dataIndexesCount:
    (svg.match(/data-indexes="[^"]*"/g) || []).length,
  dataValueCount:
    (svg.match(/data-value="[^"]*"/g) || []).length,
  semanticElementTypes,
};

fs.writeFileSync(
  path.resolve("data/animation-proof.json"),
  JSON.stringify(report, null, 2),
  "utf8",
);

console.log(JSON.stringify(report, null, 2));

if (animateCount === 0 && animateTransformCount === 0) {
  console.error(
    "\nFAIL: SSR rendered the template, but no animation elements were found.",
  );
  process.exit(2);
}

console.log("\nPASS: Native AntV animation detected through SSR.");
