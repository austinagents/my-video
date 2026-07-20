import {mkdtemp, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {pathToFileURL} from "node:url";
import {build} from "esbuild";

const tempDir = await mkdtemp(path.join(os.tmpdir(), "antv-studio-"));
const entry = path.join(tempDir, "entry.ts");
const bundled = path.join(tempDir, "validate.mjs");

await writeFile(
  entry,
  `
	    import {antVStudioDesigns, getDesignCounts, validateRegistry} from ${JSON.stringify(path.resolve("src/antv-studio/registry.ts"))};
	    import {validateStudioDesignCompatibility} from ${JSON.stringify(path.resolve("src/antv-studio/compatibility.ts"))};
	    import {cloneContent} from ${JSON.stringify(path.resolve("src/antv-studio/sample-content.ts"))};
	    import {defaultControls} from ${JSON.stringify(path.resolve("src/antv-studio/theme.ts"))};

    if (process.argv.includes("--ids")) {
      console.log(antVStudioDesigns.map((design) => design.id).join("\\n"));
      process.exit(0);
    }

    const errors = validateRegistry();
    const counts = getDesignCounts();

	    for (const design of antVStudioDesigns) {
      const context = {
        content: cloneContent(design.defaultContent),
        controls: defaultControls,
        width: 620,
        height: design.engine === "s2" ? 520 : 650,
      };

      try {
        if (design.engine === "g2") {
          const options = design.createOptions(context);
          if (!options || typeof options !== "object") errors.push(\`\${design.id} returned an invalid G2 option object.\`);
        } else if (design.engine === "s2") {
          const config = design.createSheetConfig(context);
          if (!config.dataCfg?.data?.length || !config.options) errors.push(\`\${design.id} returned an invalid S2 sheet config.\`);
        } else {
          const config = design.createGraphConfig(context);
          if (!config.data?.nodes?.length) errors.push(\`\${design.id} returned an invalid G6 graph config.\`);
        }
      } catch (error) {
        errors.push(\`\${design.id} factory threw: \${error instanceof Error ? error.message : String(error)}\`);
      }
	    }

	    const fishbone = antVStudioDesigns.find((design) => design.id === "g6-fishbone");
	    const compactBox = antVStudioDesigns.find((design) => design.id === "g6-compact-box-tree");
	    const genericCauseMap = antVStudioDesigns.find((design) => design.id === "g6-why-it-happens");
	    if (!fishbone || !compactBox || !genericCauseMap) {
	      errors.push("Missing G6 compatibility sentinel designs.");
	    } else {
	      const compatibility = validateStudioDesignCompatibility({
	        design: fishbone,
	        content: cloneContent(genericCauseMap.defaultContent),
	        expectedEngine: "g6",
	      });
	      if (compatibility.ok) {
	        errors.push("g6-fishbone accepted generic graph content; expected hierarchy compatibility rejection.");
	      }

	      const validFishbone = validateStudioDesignCompatibility({
	        design: fishbone,
	        content: cloneContent(fishbone.defaultContent),
	        expectedEngine: "g6",
	      });
	      if (!validFishbone.ok) {
	        errors.push(\`g6-fishbone rejected valid hierarchy content: \${validFishbone.reasons.join(" ")}\`);
	      }

	      const validCompactBox = validateStudioDesignCompatibility({
	        design: compactBox,
	        content: cloneContent(compactBox.defaultContent),
	        expectedEngine: "g6",
	      });
	      if (!validCompactBox.ok) {
	        errors.push(\`g6-compact-box-tree rejected valid hierarchy content: \${validCompactBox.reasons.join(" ")}\`);
	      }

	      const hierarchyOnGeneric = validateStudioDesignCompatibility({
	        design: genericCauseMap,
	        content: cloneContent(fishbone.defaultContent),
	        expectedEngine: "g6",
	      });
	      if (hierarchyOnGeneric.ok) {
	        errors.push("generic G6 design accepted hierarchy content; expected generic graph compatibility rejection.");
	      }

	      const missingRoot = validateStudioDesignCompatibility({
	        design: fishbone,
	        content: {
	          ...cloneContent(fishbone.defaultContent),
	          providerData: {kind: "g6-hierarchy"},
	        },
	        expectedEngine: "g6",
	      });
	      if (missingRoot.ok || !missingRoot.reasons.join(" ").includes("requires hierarchical tree data")) {
	        errors.push("g6 hierarchy validation did not report a missing root.");
	      }

	      const duplicateId = validateStudioDesignCompatibility({
	        design: fishbone,
	        content: {
	          title: "Duplicate hierarchy",
	          rows: [{id: "nodes", label: "Nodes", value: 3}],
	          providerData: {
	            kind: "g6-hierarchy",
	            root: {
	              id: "root",
	              label: "Root",
	              children: [
	                {id: "dup", label: "First"},
	                {id: "dup", label: "Second"},
	              ],
	            },
	          },
	        },
	        expectedEngine: "g6",
	      });
	      if (duplicateId.ok || !duplicateId.reasons.join(" ").includes("Duplicate hierarchy node ID: dup")) {
	        errors.push("g6 hierarchy validation did not report duplicate IDs.");
	      }

	      const cycleRoot = {id: "root", label: "Root", children: []};
	      cycleRoot.children.push(cycleRoot);
	      const cycle = validateStudioDesignCompatibility({
	        design: fishbone,
	        content: {
	          title: "Cycle hierarchy",
	          rows: [{id: "nodes", label: "Nodes", value: 2}],
	          providerData: {kind: "g6-hierarchy", root: cycleRoot},
	        },
	        expectedEngine: "g6",
	      });
	      if (cycle.ok || !cycle.reasons.join(" ").includes("Hierarchy contains a cycle at root")) {
	        errors.push("g6 hierarchy validation did not report a cycle.");
	      }
	    }

	    if (errors.length > 0) {
      console.error(errors.join("\\n"));
      process.exit(1);
    }

    console.log(\`AntV studio registry OK: total=\${antVStudioDesigns.length}, g2=\${counts.g2}, s2=\${counts.s2}, g6=\${counts.g6}\`);
  `,
);

await build({
  entryPoints: [entry],
  outfile: bundled,
  bundle: true,
  platform: "node",
  format: "esm",
  logLevel: "silent",
  external: ["@antv/g2", "@antv/g6", "@antv/s2", "react"],
});

await import(pathToFileURL(bundled).href);
