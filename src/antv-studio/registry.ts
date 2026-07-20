import {g2Designs} from "./definitions/g2-designs";
import {g6Designs} from "./definitions/g6-designs";
import {s2Designs} from "./definitions/s2-designs";
import {validateStudioDesignCompatibility} from "./compatibility";
import type {AntVEngine, AntVStudioDesign} from "./types";

export const antVStudioDesigns: AntVStudioDesign[] = [
  ...g2Designs,
  ...s2Designs,
  ...g6Designs,
];

export const categories = Array.from(
  new Set(antVStudioDesigns.map((design) => design.category)),
).sort();

export const getDesignCounts = () =>
  antVStudioDesigns.reduce<Record<AntVEngine, number>>(
    (counts, design) => {
      counts[design.engine] += 1;
      return counts;
    },
    {g2: 0, s2: 0, g6: 0},
  );

export const validateRegistry = (): string[] => {
  const errors: string[] = [];
  const counts = getDesignCounts();
  const ids = new Set<string>();
  const names = new Set<string>();

  if (antVStudioDesigns.length !== 50) {
    errors.push(`Expected 50 designs, found ${antVStudioDesigns.length}.`);
  }
  if (counts.g2 !== 26) errors.push(`Expected 26 G2 designs, found ${counts.g2}.`);
  if (counts.s2 !== 8) errors.push(`Expected 8 S2 designs, found ${counts.s2}.`);
  if (counts.g6 !== 16) errors.push(`Expected 16 G6 designs, found ${counts.g6}.`);

  for (const design of antVStudioDesigns) {
    if (ids.has(design.id)) errors.push(`Duplicate design id: ${design.id}`);
    if (names.has(design.name)) errors.push(`Duplicate design name: ${design.name}`);
    ids.add(design.id);
    names.add(design.name);
    if (!design.name || !design.category || !design.description || !design.industryExample) {
      errors.push(`Missing metadata for ${design.id}.`);
    }
    if (!design.defaultContent?.title || !Array.isArray(design.defaultContent.rows)) {
      errors.push(`Missing default content for ${design.id}.`);
    }
    if (!design.capabilities) {
      errors.push(`Missing capability metadata for ${design.id}.`);
    } else {
      if (design.capabilities.animationModes.length === 0) {
        errors.push(`Missing animation capability metadata for ${design.id}.`);
      }
      if (design.capabilities.layouts.length === 0) {
        errors.push(`Missing layout capability metadata for ${design.id}.`);
      }
      if (design.capabilities.aspectRatios.length === 0) {
        errors.push(`Missing aspect-ratio capability metadata for ${design.id}.`);
      }

      const compatibility = validateStudioDesignCompatibility({
        design,
        content: design.defaultContent,
        expectedEngine: design.engine,
      });
      if (
        !compatibility.ok &&
        design.capabilities.adapter !== "requires-native-contract"
      ) {
        errors.push(`${design.id} default content is incompatible: ${compatibility.reasons.join(" ")}`);
      }
    }
    if (design.engine === "g2" && typeof design.createOptions !== "function") {
      errors.push(`Missing G2 factory for ${design.id}.`);
    }
    if (design.engine === "s2" && typeof design.createSheetConfig !== "function") {
      errors.push(`Missing S2 factory for ${design.id}.`);
    }
    if (design.engine === "g6" && typeof design.createGraphConfig !== "function") {
      errors.push(`Missing G6 factory for ${design.id}.`);
    }
  }

  return errors;
};
