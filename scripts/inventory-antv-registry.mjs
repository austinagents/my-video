import {
  getTemplates,
  getTemplate,
  getStructures,
  getStructure,
} from "@antv/infographic";
import {writeFile} from "node:fs/promises";

const templateNames = await getTemplates();
const structureNames = await getStructures();

const templates = [];

for (const name of templateNames) {
  const template = await getTemplate(name);
  const design = template?.design ?? null;

  templates.push({
    name,
    structure: design?.structure?.type ?? null,
    title: design?.title ?? null,
    itemTypes: Array.isArray(design?.items)
      ? design.items.map((item) => item?.type ?? null)
      : [],
    design,
  });
}

const structures = [];

for (const name of structureNames) {
  const structure = await getStructure(name);

  structures.push({
    name,
    componentName:
      structure?.component?.displayName ??
      structure?.component?.name ??
      null,
    composites: Array.isArray(structure?.composites)
      ? structure.composites
      : [],
  });
}

const templatesByStructure = {};

for (const template of templates) {
  const structure = template.structure ?? "__unknown__";

  templatesByStructure[structure] ??= [];
  templatesByStructure[structure].push(template.name);
}

const structureSummary = Object.entries(templatesByStructure)
  .map(([structure, names]) => ({
    structure,
    templateCount: names.length,
    templates: names.sort(),
  }))
  .sort((a, b) => b.templateCount - a.templateCount);

const unknownStructures = templates
  .filter(
    (template) =>
      !template.structure ||
      !structureNames.includes(template.structure),
  )
  .map((template) => template.name);

const unusedStructures = structureNames.filter(
  (structure) => !templatesByStructure[structure],
);

const report = {
  packageVersion: "0.2.19",
  generatedAt: new Date().toISOString(),
  counts: {
    templates: templates.length,
    structures: structures.length,
    templatesWithUnknownStructure: unknownStructures.length,
    structuresWithoutTemplates: unusedStructures.length,
  },
  structureSummary,
  templates,
  structures,
  unknownStructures,
  unusedStructures,
};

await writeFile(
  "data/antv-registry-inventory.json",
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log("\nAntV Registry Inventory");
console.log("=======================");
console.log(`Templates: ${report.counts.templates}`);
console.log(`Structures: ${report.counts.structures}`);
console.log(
  `Templates with unknown structures: ${unknownStructures.length}`,
);
console.log(`Structures without templates: ${unusedStructures.length}`);

console.log("\nTemplates by structure:");
for (const entry of structureSummary) {
  console.log(
    `${String(entry.templateCount).padStart(3)}  ${entry.structure}`,
  );
}

if (unknownStructures.length > 0) {
  console.log("\nUnknown structure templates:");
  console.log(unknownStructures);
}

if (unusedStructures.length > 0) {
  console.log("\nStructures without templates:");
  console.log(unusedStructures);
}

console.log("\nWritten:");
console.log("data/antv-registry-inventory.json");
