import fs from "node:fs";
import path from "node:path";
import {renderToString} from "@antv/infographic/ssr";

const templates = [
  "sequence-interaction-default-animated-badge-card",
  "sequence-interaction-default-animated-compact-card",
  "sequence-interaction-default-animated-capsule-item",
  "sequence-interaction-default-animated-rounded-rect-node",

  "sequence-interaction-compact-animated-badge-card",
  "sequence-interaction-compact-animated-compact-card",
  "sequence-interaction-compact-animated-capsule-item",
  "sequence-interaction-compact-animated-rounded-rect-node",

  "sequence-interaction-wide-animated-badge-card",
  "sequence-interaction-wide-animated-compact-card",
  "sequence-interaction-wide-animated-capsule-item",
  "sequence-interaction-wide-animated-rounded-rect-node",
];

const outputDirectory = path.resolve(
  "public/antv-animation-proofs",
);

fs.mkdirSync(outputDirectory, {recursive: true});

const syntaxForTemplate = (template) => `
infographic ${template}
data
  title Sequence Interaction Animation
  desc Deterministic AntV and Remotion compatibility proof
  items
    - label Customer
      children
        - id customer-request
          label Send Request
          step 0
        - id customer-complete
          label Receive Result
          step 3
    - label Website
      children
        - id website-receive
          label Receive Request
          step 0
        - id website-response
          label Return Response
          step 2
    - label Server
      children
        - id server-process
          label Process Request
          step 1
        - id server-result
          label Build Result
          step 2
    - label Database
      children
        - id database-query
          label Run Query
          step 1
  relations
    - from customer-request
      to website-receive
      label Request
    - from website-receive
      to server-process
      label API Call
    - from server-process
      to database-query
      label Query
    - from database-query
      to server-result
      label Data
    - from server-result
      to website-response
      label Response
    - from website-response
      to customer-complete
      label Complete
`;

const results = [];

for (const template of templates) {
  try {
    const svg = await renderToString(
      syntaxForTemplate(template),
      {
        width: 900,
        height: 700,
      },
    );

    const animateCount =
      (svg.match(/<animate(?:\s|>)/g) || []).length;

    if (animateCount === 0) {
      throw new Error(
        "Rendered SVG does not contain an <animate> element.",
      );
    }

    const outputPath = path.join(
      outputDirectory,
      `${template}.svg`,
    );

    fs.writeFileSync(outputPath, svg, "utf8");

    results.push({
      template,
      status: "PASS",
      animateCount,
      outputPath,
    });

    console.log(
      `PASS ${template} (${animateCount} animations)`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    results.push({
      template,
      status: "FAIL",
      error: message,
    });

    console.error(`FAIL ${template}: ${message}`);
  }
}

const reportPath = path.resolve(
  "data/sequence-animation-proofs.json",
);

fs.mkdirSync(path.dirname(reportPath), {
  recursive: true,
});

fs.writeFileSync(
  reportPath,
  JSON.stringify(results, null, 2),
  "utf8",
);

const passed = results.filter(
  (result) => result.status === "PASS",
).length;

const failed = results.length - passed;

console.log("");
console.log(`Generated: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Report: ${reportPath}`);

if (failed > 0) {
  process.exitCode = 1;
}
