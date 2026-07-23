import {createHash} from "node:crypto";
import {mkdtemp, readFile, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {pathToFileURL} from "node:url";
import {getTemplates} from "@antv/infographic";
import {build} from "esbuild";

const infographicTemplates = getTemplates();

const template1Source = await readFile(
  path.resolve("src/advanced-studio/AdvancedStudioIntegrationProof.tsx"),
  "utf8",
);
const template1Start = template1Source.indexOf(
  "const styleReferenceBoardProject",
);
const template1End = template1Source.indexOf(
  "export const advancedStudioIntegrationProofDuration",
);
if (template1Start < 0 || template1End < 0) {
  throw new Error("Unable to locate the Template 1 authored project.");
}
const template1Digest = createHash("sha256")
  .update(template1Source.slice(template1Start, template1End))
  .digest("hex");
if (
  template1Digest !==
  "0d542271814f54089f53853ca0600aef2549420802b759b6aaf665ff6fc9f2b0"
) {
  throw new Error(`Template 1 authored content changed: ${template1Digest}.`);
}

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
	    import {
	      getAdvancedStudioProjectDuration,
	      getAdvancedStudioTimedScenes,
	    } from ${JSON.stringify(path.resolve("src/advanced-studio/scene-contract.ts"))};
	    import {advancedStudioTemplate2Project} from ${JSON.stringify(path.resolve("src/advanced-studio/template-2-project.ts"))};

    if (process.argv.includes("--ids")) {
      console.log(antVStudioDesigns.map((design) => design.id).join("\\n"));
      process.exit(0);
    }

    const errors = validateRegistry();
    const counts = getDesignCounts();
	    const infographicTemplates = new Set(${JSON.stringify(infographicTemplates)});

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

		    const copyProject = (project) => JSON.parse(JSON.stringify(project));
		    const assertDurationCase = ({
		      label,
		      project,
		      expectedDuration,
		      expectedFirstDuration,
		      expectedSecondStart,
		    }) => {
		      try {
		        const duration = getAdvancedStudioProjectDuration(project);
		        const timedScenes = getAdvancedStudioTimedScenes(project);
		        if (duration !== expectedDuration) {
		          errors.push(\`\${label} duration was \${duration}; expected \${expectedDuration}.\`);
		        }
		        if (timedScenes[0]?.endFrame - timedScenes[0]?.startFrame !== expectedFirstDuration) {
		          errors.push(\`\${label} first scene visible length was incorrect.\`);
		        }
		        if (timedScenes[1]?.startFrame !== expectedSecondStart) {
		          errors.push(\`\${label} following scene start was \${timedScenes[1]?.startFrame}; expected \${expectedSecondStart}.\`);
		        }
		      } catch (error) {
		        errors.push(\`\${label} duration validation threw: \${error instanceof Error ? error.message : String(error)}\`);
		      }
		    };

		    const template1Project = {
		      title: "Template 1 duration fixture",
		      scenes: [
		        {id: "scene-1", durationFrames: 90},
		        {id: "scene-2", durationFrames: 90},
		        {id: "scene-3", durationFrames: 90},
		        {id: "scene-4", durationFrames: 75},
		        {id: "scene-5", durationFrames: 75},
		        {id: "scene-6", durationFrames: 105},
		        {id: "scene-7", durationFrames: 90},
		        {id: "scene-8", durationFrames: 90},
		        {id: "scene-9", durationFrames: 90},
		        {id: "scene-10", durationFrames: 105},
		        {id: "scene-11", durationFrames: 75},
		        {id: "scene-12", durationFrames: 90},
		        {id: "scene-13", durationFrames: 90},
		        {id: "scene-14", durationFrames: 105},
		      ],
		    };

		    assertDurationCase({
		      label: "Template 1",
		      project: copyProject(template1Project),
		      expectedDuration: 1260,
		      expectedFirstDuration: 90,
		      expectedSecondStart: 90,
		    });

		    const shortenedProject = copyProject(template1Project);
		    shortenedProject.scenes[0].durationFrames = 60;
		    assertDurationCase({
		      label: "Shortened project",
		      project: shortenedProject,
		      expectedDuration: 1230,
		      expectedFirstDuration: 60,
		      expectedSecondStart: 60,
		    });

		    const lengthenedProject = copyProject(template1Project);
		    lengthenedProject.scenes[0].durationFrames = 150;
		    assertDurationCase({
		      label: "Lengthened project",
		      project: lengthenedProject,
		      expectedDuration: 1320,
		      expectedFirstDuration: 150,
		      expectedSecondStart: 150,
		    });

		    const baselineTimedScenes = getAdvancedStudioTimedScenes(template1Project);
		    const shortenedTimedScenes = getAdvancedStudioTimedScenes(shortenedProject);
		    const lengthenedTimedScenes = getAdvancedStudioTimedScenes(lengthenedProject);
		    for (let index = 1; index < baselineTimedScenes.length; index += 1) {
		      if (
		        shortenedTimedScenes[index].startFrame !==
		        baselineTimedScenes[index].startFrame - 30
		      ) {
		        errors.push(\`Shortening scene 1 did not shift scene \${index + 1} by -30 frames.\`);
		      }
		      if (
		        lengthenedTimedScenes[index].startFrame !==
		        baselineTimedScenes[index].startFrame + 60
		      ) {
		        errors.push(\`Lengthening scene 1 did not shift scene \${index + 1} by +60 frames.\`);
		      }
		    }

		    for (const invalidDuration of [0, -1, 1.5]) {
		      const invalidProject = copyProject(template1Project);
		      invalidProject.scenes[0].durationFrames = invalidDuration;
		      try {
		        getAdvancedStudioProjectDuration(invalidProject);
		        errors.push(\`Advanced Studio accepted invalid scene duration \${invalidDuration}.\`);
		      } catch {
		        // Expected.
		      }
		    }

		    try {
		      getAdvancedStudioProjectDuration({title: "Empty", scenes: []});
		      errors.push("Advanced Studio accepted a zero-duration project.");
		    } catch {
		      // Expected.
		    }

		    const validateAuthoredProject = ({
		      label,
		      project,
		      expectedDuration,
		    }) => {
		      let timedScenes = [];
		      try {
		        const duration = getAdvancedStudioProjectDuration(project);
		        timedScenes = getAdvancedStudioTimedScenes(project);
		        if (duration !== expectedDuration) {
		          errors.push(\`\${label} duration was \${duration}; expected \${expectedDuration}.\`);
		        }
		      } catch (error) {
		        errors.push(\`\${label} timing validation threw: \${error instanceof Error ? error.message : String(error)}\`);
		        return;
		      }

		      timedScenes.forEach((scene, index) => {
		        const expectedStart = index === 0 ? 0 : timedScenes[index - 1].endFrame;
		        if (scene.startFrame !== expectedStart) {
		          errors.push(\`\${label} scene \${scene.id} starts at \${scene.startFrame}; expected \${expectedStart}.\`);
		        }
		        if (scene.endFrame !== scene.startFrame + scene.durationFrames) {
		          errors.push(\`\${label} scene \${scene.id} has non-canonical end timing.\`);
		        }

		        if (scene.type === "board") {
		          const boardProject = scene.content.project;
		          const activeBlockId = scene.content.activeBlockId;
		          const infographic = scene.content.infographic;
		          if (infographic) {
		            if (!infographic.template || !infographicTemplates.has(infographic.template)) {
		              errors.push(\`\${label} scene \${scene.id} requires an unregistered AntV Infographic template.\`);
		            }
		            if (!infographic.data || typeof infographic.data !== "object") {
		              errors.push(\`\${label} scene \${scene.id} is missing provider-native AntV Infographic data.\`);
		            }
		            if (infographic.syntax?.trim()) {
		              errors.push(\`\${label} scene \${scene.id} uses a StudioBlock.syntax override.\`);
		            }
		            return;
		          }
		          if (
		            activeBlockId !== null &&
		            !boardProject?.blocks.some((block) => block.id === activeBlockId)
		          ) {
		            errors.push(\`\${label} scene \${scene.id} references missing Board block \${activeBlockId}.\`);
		          }
		          if (boardProject?.blocks.some((block) => block.syntax?.trim())) {
		            errors.push(\`\${label} scene \${scene.id} uses a StudioBlock.syntax override.\`);
		          }
		          return;
		        }

		        const design = antVStudioDesigns.find(
		          (item) =>
		            item.id === scene.content.designId &&
		            item.engine === scene.type,
		        );
		        if (!design) {
		          errors.push(\`\${label} scene \${scene.id} requires unregistered \${scene.type} design \${scene.content.designId}.\`);
		          return;
		        }
		        const compatibility = validateStudioDesignCompatibility({
		          design,
		          content: scene.content.content ?? cloneContent(design.defaultContent),
		          expectedEngine: scene.type,
		        });
		        if (!compatibility.ok) {
		          errors.push(\`\${label} scene \${scene.id} is incompatible with \${design.id}: \${compatibility.reasons.join(" ")}\`);
		        }
		      });

		      if (timedScenes.at(-1)?.endFrame !== expectedDuration) {
		        errors.push(\`\${label} final scene does not end at frame \${expectedDuration}.\`);
		      }
		    };

		    validateAuthoredProject({
		      label: "Template 2 authored project",
		      project: advancedStudioTemplate2Project,
		      expectedDuration: 1170,
		    });

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
