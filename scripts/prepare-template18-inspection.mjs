import fs from "node:fs";

const source = JSON.parse(
  fs.readFileSync("output/advanced-studio2-project.json", "utf8"),
);
fs.mkdirSync("output/template18-inspection", {recursive: true});
fs.writeFileSync(
  "output/template18-inspection/props.json",
  JSON.stringify({
    ...source,
    templateId: process.argv[2],
    formatId: "square",
  }),
);
