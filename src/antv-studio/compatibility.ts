import type {
  AntVEngine,
  AntVStudioDesign,
  ProviderDesignCapability,
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

  if (capability.requiredFields.rows?.length) {
    reasons.push(...invalidRowFields(rows, capability.requiredFields.rows));
  }
  if (capability.requiredFields.nodes?.length) {
    reasons.push(...invalidNodeFields(nodes, capability.requiredFields.nodes));
  }
  if (capability.requiredFields.edges?.length) {
    reasons.push(...invalidEdgeFields(edges, capability.requiredFields.edges));
  }

  if (design.engine === "g6" && edges.length > 0) {
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
