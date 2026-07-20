import type {
  AntVEngine,
  AntVStudioDesign,
  ProviderDesignCapability,
  G6HierarchyData,
  G6HierarchyNode,
  StudioContent,
  StudioEdge,
  StudioEdgeField,
  StudioNode,
  StudioNodeField,
  StudioRow,
  StudioRowField,
} from "./types";

export type ProviderCompatibilityResult =
  | {
      ok: true;
      designId: string;
      contract: ProviderDesignCapability["dataContract"];
    }
  | {
      ok: false;
      designId: string;
      contract: ProviderDesignCapability["dataContract"];
      reasons: string[];
    };

const hasValue = (value: unknown) => value !== undefined && value !== null && value !== "";

const rowFieldValue = (row: StudioRow, field: StudioRowField) => row[field];
const nodeFieldValue = (node: StudioNode, field: StudioNodeField) => node[field];
const edgeFieldValue = (edge: StudioEdge, field: StudioEdgeField) => edge[field];

const hierarchyNodeCount = (node: G6HierarchyNode): number =>
  1 + (node.children ?? []).reduce((total, child) => total + hierarchyNodeCount(child), 0);

const invalidRowFields = (
  rows: StudioRow[],
  fields: StudioRowField[],
): string[] =>
  rows.flatMap((row, index) =>
    fields
      .filter((field) => !hasValue(rowFieldValue(row, field)))
      .map((field) => `row ${index + 1} is missing ${field}`),
  );

const invalidNodeFields = (
  nodes: StudioNode[],
  fields: StudioNodeField[],
): string[] =>
  nodes.flatMap((node, index) =>
    fields
      .filter((field) => !hasValue(nodeFieldValue(node, field)))
      .map((field) => `node ${index + 1} is missing ${field}`),
  );

const invalidEdgeFields = (
  edges: StudioEdge[],
  fields: StudioEdgeField[],
): string[] =>
  edges.flatMap((edge, index) =>
    fields
      .filter((field) => !hasValue(edgeFieldValue(edge, field)))
      .map((field) => `edge ${index + 1} is missing ${field}`),
  );

const invalidHierarchy = (hierarchy: G6HierarchyData | undefined): string[] => {
  if (!hierarchy?.root || typeof hierarchy.root !== "object") {
    return ["This design requires hierarchical tree data."];
  }

  const reasons: string[] = [];
  const seenIds = new Set<string>();
  const objectStack = new WeakSet<object>();

  const visit = (
    node: G6HierarchyNode,
    pathIds: Set<string>,
    pathLabel: string,
  ) => {
    if (!node || typeof node !== "object") {
      reasons.push(`Hierarchy node at ${pathLabel} is invalid.`);
      return;
    }

    if (objectStack.has(node)) {
      reasons.push(`Hierarchy contains a cycle at ${node.id || pathLabel}.`);
      return;
    }
    objectStack.add(node);

    if (!hasValue(node.id)) {
      reasons.push(`Hierarchy node at ${pathLabel} is missing id.`);
    }
    if (!hasValue(node.label)) {
      reasons.push(`Hierarchy node ${node.id || pathLabel} is missing label.`);
    }

    if (hasValue(node.id)) {
      if (pathIds.has(node.id)) {
        reasons.push(`Hierarchy contains a cycle at ${node.id}.`);
      } else if (seenIds.has(node.id)) {
        reasons.push(`Duplicate hierarchy node ID: ${node.id}.`);
      }
      seenIds.add(node.id);
    }

    if (node.children !== undefined && !Array.isArray(node.children)) {
      reasons.push(`Hierarchy node ${node.id || pathLabel} has invalid children.`);
    }

    const nextPathIds = new Set(pathIds);
    if (hasValue(node.id)) nextPathIds.add(node.id);
    if (Array.isArray(node.children)) {
      node.children.forEach((child, index) =>
        visit(child, nextPathIds, `${pathLabel}.children[${index}]`),
      );
    }

    objectStack.delete(node);
  };

  visit(hierarchy.root, new Set(), "root");
  return reasons;
};

export const validateStudioDesignCompatibility = ({
  design,
  content,
  expectedEngine,
}: {
  design: AntVStudioDesign;
  content: StudioContent;
  expectedEngine?: AntVEngine;
}): ProviderCompatibilityResult => {
  const capability = design.capabilities;
  const reasons: string[] = [];
  const rows = content.rows ?? [];
  const nodes = content.nodes ?? [];
  const edges = content.edges ?? [];
  const hierarchy =
    content.providerData?.kind === "g6-hierarchy"
      ? content.providerData
      : undefined;
  const requiresHierarchy =
    design.engine === "g6" && capability.dataContract === "g6-hierarchy-tree";
  const usesGenericGraph =
    design.engine === "g6" &&
    (capability.dataContract === "g6-generic-graph" ||
      capability.dataContract === "g6-dag");

  if (expectedEngine && design.engine !== expectedEngine) {
    reasons.push(
      `${design.name} is registered for ${design.engine.toUpperCase()}, not ${expectedEngine.toUpperCase()}.`,
    );
  }

  if (capability.adapter === "requires-native-contract") {
    reasons.push(
      `${design.name} requires ${capability.dataContract} content, but the current Advanced Studio adapter only provides generic content for this design.`,
    );
  }

  const hierarchyReasons = requiresHierarchy ? invalidHierarchy(hierarchy) : [];
  if (hierarchyReasons.length > 0) {
    reasons.push(...hierarchyReasons);
  }

  if (usesGenericGraph && content.providerData?.kind === "g6-hierarchy") {
    reasons.push(
      "This scene contains hierarchical tree data and cannot use a generic graph-only design.",
    );
  }

  const limits = capability.contentLimits;
  if (limits?.minRows !== undefined && rows.length < limits.minRows) {
    reasons.push(`${design.name} requires at least ${limits.minRows} row(s).`);
  }
  if (limits?.maxRows !== undefined && rows.length > limits.maxRows) {
    reasons.push(`${design.name} supports at most ${limits.maxRows} row(s).`);
  }
  if (limits?.minNodes !== undefined && nodes.length < limits.minNodes) {
    reasons.push(`${design.name} requires at least ${limits.minNodes} node(s).`);
  }
  if (limits?.maxNodes !== undefined && nodes.length > limits.maxNodes) {
    reasons.push(`${design.name} supports at most ${limits.maxNodes} node(s).`);
  }
  if (limits?.minEdges !== undefined && edges.length < limits.minEdges) {
    reasons.push(`${design.name} requires at least ${limits.minEdges} edge(s).`);
  }
  if (limits?.maxEdges !== undefined && edges.length > limits.maxEdges) {
    reasons.push(`${design.name} supports at most ${limits.maxEdges} edge(s).`);
  }
  if (requiresHierarchy && hierarchy?.root && hierarchyReasons.length === 0) {
    const count = hierarchyNodeCount(hierarchy.root);
    if (limits?.minHierarchyNodes !== undefined && count < limits.minHierarchyNodes) {
      reasons.push(
        `${design.name} requires at least ${limits.minHierarchyNodes} hierarchy node(s).`,
      );
    }
    if (limits?.maxHierarchyNodes !== undefined && count > limits.maxHierarchyNodes) {
      reasons.push(
        `${design.name} supports at most ${limits.maxHierarchyNodes} hierarchy node(s).`,
      );
    }
  }

  if (capability.requiredFields.rows?.length) {
    reasons.push(...invalidRowFields(rows, capability.requiredFields.rows));
  }
  if (!requiresHierarchy && capability.requiredFields.nodes?.length) {
    reasons.push(...invalidNodeFields(nodes, capability.requiredFields.nodes));
  }
  if (!requiresHierarchy && capability.requiredFields.edges?.length) {
    reasons.push(...invalidEdgeFields(edges, capability.requiredFields.edges));
  }

  if (design.engine === "g6" && !requiresHierarchy && edges.length > 0) {
    const nodeIds = new Set(nodes.map((node) => node.id));
    edges.forEach((edge, index) => {
      if (!nodeIds.has(edge.source)) {
        reasons.push(`edge ${index + 1} references missing source node ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        reasons.push(`edge ${index + 1} references missing target node ${edge.target}`);
      }
    });
  }

  return reasons.length === 0
    ? {ok: true, designId: design.id, contract: capability.dataContract}
    : {ok: false, designId: design.id, contract: capability.dataContract, reasons};
};

export const formatCompatibilityError = (
  result: ProviderCompatibilityResult,
): string =>
  result.ok
    ? ""
    : `Cannot use ${result.designId}: ${result.reasons.join(" ")}`;
