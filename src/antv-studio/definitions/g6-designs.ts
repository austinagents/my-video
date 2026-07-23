import type {GraphData, GraphOptions} from "@antv/g6";
import {studioTheme} from "../theme";
import type {
  FactoryContext,
  G6HierarchyData,
  G6HierarchyNode,
  G6StudioDesign,
  ProviderDesignCapability,
  StudioContent,
  StudioEdge,
  StudioNode,
} from "../types";
import {content, edge, node, row} from "../sample-content";

const dataFrom = (nodes: StudioNode[], edges: StudioEdge[]): GraphData => ({
  nodes: nodes.map((item, index) => ({
    id: item.id,
    data: {label: item.label, group: item.group},
    style: {
      fill: index === 0 ? studioTheme.gold : "#242017",
      stroke: index === 0 ? studioTheme.goldSoft : "rgba(216,173,85,0.45)",
      lineWidth: 1.5,
      radius: 12,
      size: index === 0 ? [132, 54] : [118, 46],
      labelText: item.label,
      labelFill: index === 0 ? "#17130a" : studioTheme.text,
      labelPlacement: "center",
      labelFontSize: 12,
      labelFontWeight: index === 0 ? 700 : 600,
      labelWordWrap: true,
      labelMaxWidth: 102,
    },
  })),
  edges: edges.map((item) => ({
    source: item.source,
    target: item.target,
    data: {label: item.label},
    style: {
      stroke: "rgba(216,173,85,0.42)",
      lineWidth: 1.4,
      endArrow: true,
      labelText: item.label,
      labelFill: studioTheme.muted,
      labelFontSize: 10,
    },
  })),
});

const hierarchyNodeCount = (node: G6HierarchyNode): number =>
  1 + (node.children ?? []).reduce((total, child) => total + hierarchyNodeCount(child), 0);

const hierarchyDataFrom = (hierarchy: G6HierarchyData): GraphData => {
  const nodes: NonNullable<GraphData["nodes"]> = [];
  const edges: NonNullable<GraphData["edges"]> = [];

  const visit = (item: G6HierarchyNode, depth: number) => {
    const children = item.children ?? [];
    const childIds = children.map((child) => child.id);

    nodes.push({
      id: item.id,
      depth,
      children: childIds.length > 0 ? childIds : undefined,
      data: {
        label: item.label,
        value: item.value,
        category: item.category,
        metadata: item.metadata,
      },
      style: {
        fill: depth === 0 ? studioTheme.gold : depth === 1 ? "#2c271a" : "#201d16",
        stroke: depth === 0 ? studioTheme.goldSoft : "rgba(216,173,85,0.5)",
        lineWidth: depth === 0 ? 2 : 1.4,
        radius: 12,
        size: depth === 0 ? [150, 58] : depth === 1 ? [132, 50] : [112, 42],
        labelText: item.label,
        labelFill: depth === 0 ? "#17130a" : studioTheme.text,
        labelPlacement: "center",
        labelFontSize: depth === 0 ? 13 : 11,
        labelFontWeight: depth <= 1 ? 700 : 600,
        labelWordWrap: true,
        labelMaxWidth: depth === 0 ? 124 : 96,
      },
    });

    children.forEach((child) => {
      edges.push({
        source: item.id,
        target: child.id,
        data: {label: child.category},
        style: {
          stroke: "rgba(216,173,85,0.42)",
          lineWidth: depth === 0 ? 1.8 : 1.3,
          endArrow: false,
          labelText: child.category,
          labelFill: studioTheme.muted,
          labelFontSize: 10,
        },
      });
      visit(child, depth + 1);
    });
  };

  visit(hierarchy.root, 0);
  return {nodes, edges};
};

const graph = (
  ctx: FactoryContext,
  layout: GraphOptions["layout"],
): GraphOptions => {
  const data =
    ctx.content.providerData?.kind === "g6-hierarchy"
      ? hierarchyDataFrom(ctx.content.providerData)
      : dataFrom(ctx.content.nodes ?? [], ctx.content.edges ?? []);

  return {
    container: undefined,
    width: ctx.width,
    height: ctx.height,
    background: "transparent",
    autoResize: false,
    autoFit: {
      type: "view",
      options: {when: "always", direction: "both"},
      animation: false,
    },
    padding: Math.round(Math.min(ctx.width, ctx.height) * 0.08),
    animation: false,
    data,
    layout:
      layout && typeof layout === "object"
        ? {...layout, nodeSize: [132, 54]}
        : layout,
    node: {
      type: "rect",
    },
    edge: {
      type: "line",
    },
    behaviors: [],
    plugins: [],
  };
};

const radialEdges = (center: string, ids: string[]) => ids.map((id) => edge(center, id));

const hierarchyNode = (
  id: string,
  label: string,
  children?: G6HierarchyNode[],
  category?: string,
  value?: number,
): G6HierarchyNode => ({id, label, children, category, value});

const hierarchyContent = (
  title: string,
  subtitle: string,
  root: G6HierarchyNode,
): StudioContent => ({
  title,
  subtitle,
  rows: [row("nodes", "Nodes", hierarchyNodeCount(root))],
  providerData: {
    kind: "g6-hierarchy",
    root,
  },
});

const g6Capability = (
  layout: GraphOptions["layout"],
  animation: G6StudioDesign["animation"] = "fade-scale",
): ProviderDesignCapability => {
  const layoutType =
    layout && typeof layout === "object" && "type" in layout
      ? String(layout.type)
      : "unknown";
  const isHierarchyTree = ["fishbone", "compact-box", "mindmap", "dendrogram", "indented"].includes(layoutType);
  const isDag = layoutType === "dagre";

  return {
    dataContract: isHierarchyTree
      ? "g6-hierarchy-tree"
      : isDag
        ? "g6-dag"
        : "g6-generic-graph",
    requiredFields: isHierarchyTree
      ? {hierarchyNodes: ["id", "label"]}
      : {nodes: ["id", "label"], edges: ["source", "target"]},
    optionalFields: {nodes: ["group", "value", "parentId"], edges: ["label", "value"]},
    structures: isHierarchyTree
      ? ["hierarchy", "tree"]
      : isDag
        ? ["generic-graph", "dag"]
        : ["generic-graph"],
    layouts: [layoutType],
    animationModes: [animation],
    aspectRatios: ["portrait", "square", "vertical"],
    contentLimits: isHierarchyTree
      ? {minHierarchyNodes: 1, maxHierarchyNodes: 24}
      : {minNodes: 1, maxNodes: 24, minEdges: 0, maxEdges: 32},
    adapter: isHierarchyTree ? "provider-native-content" : "generic-content",
    notes: isHierarchyTree
      ? [
          "This design requires provider-native G6 hierarchy data. Advanced Studio adapts explicit hierarchy content into G6 tree graph data before rendering.",
        ]
      : undefined,
  };
};

const design = (
  id: string,
  name: string,
  category: string,
  description: string,
  industryExample: G6StudioDesign["industryExample"],
  title: string,
  subtitle: string,
  nodes: StudioNode[],
  edges: StudioEdge[],
  layout: GraphOptions["layout"],
  animation: G6StudioDesign["animation"] = "fade-scale",
): G6StudioDesign => ({
  engine: "g6",
  id,
  name,
  category,
  description,
  industryExample,
  animation,
  supportsSubtitle: true,
  capabilities: g6Capability(layout, animation),
  defaultContent: content(title, subtitle, [row("nodes", "Nodes", nodes.length)], nodes, edges),
  createGraphConfig: (ctx) => graph(ctx, layout),
});

const hierarchyDesign = (
  id: string,
  name: string,
  category: string,
  description: string,
  industryExample: G6StudioDesign["industryExample"],
  title: string,
  subtitle: string,
  root: G6HierarchyNode,
  layout: GraphOptions["layout"],
  animation: G6StudioDesign["animation"] = "top-down-tree",
): G6StudioDesign => ({
  engine: "g6",
  id,
  name,
  category,
  description,
  industryExample,
  animation,
  supportsSubtitle: true,
  capabilities: g6Capability(layout, animation),
  defaultContent: hierarchyContent(title, subtitle, root),
  createGraphConfig: (ctx) => graph(ctx, layout),
});

export const g6Designs: G6StudioDesign[] = [
  design(
    "g6-central-topic-explainer",
    "Central Topic Explainer",
    "Explainer",
    "A hub-and-spoke explainer for one central idea.",
    "Dentist",
    "Central Topic Explainer",
    "Why same-day hygiene rebooking lifts retention",
    [node("root", "Same-Day Rebook"), node("trust", "Clear next step"), node("timing", "No delay"), node("habit", "Routine created"), node("forecast", "Schedule stability")],
    radialEdges("root", ["trust", "timing", "habit", "forecast"]),
    {type: "radial", unitRadius: 150, linkDistance: 150, preventOverlap: true},
    "radial-reveal",
  ),
  design(
    "g6-why-it-happens",
    "Why-It-Happens Explainer",
    "Explainer",
    "A cause explainer for social education content.",
    "Chiropractor",
    "Why It Happens",
    "Why recurring back pain keeps returning",
    [node("root", "Recurring Pain"), node("posture", "Desk posture"), node("mobility", "Low mobility"), node("stress", "Stress load"), node("sleep", "Poor sleep"), node("plan", "No care rhythm")],
    radialEdges("root", ["posture", "mobility", "stress", "sleep", "plan"]),
    {type: "radial", unitRadius: 132, preventOverlap: true},
    "radial-reveal",
  ),
  design(
    "g6-benefit-map",
    "Benefit Map",
    "Explainer",
    "A benefit network for offer positioning.",
    "Med Spa",
    "Benefit Map",
    "What a skin membership changes over time",
    [node("root", "Skin Membership"), node("glow", "Consistent glow"), node("budget", "Predictable budget"), node("plan", "Provider plan"), node("events", "Ready for events"), node("confidence", "Daily confidence")],
    radialEdges("root", ["glow", "budget", "plan", "events", "confidence"]),
    {type: "circular", radius: 250},
    "radial-reveal",
  ),
  design(
    "g6-symptom-cause-map",
    "Symptom and Cause Map",
    "Diagnostic",
    "A diagnostic map connecting symptoms to likely causes.",
    "Attorney",
    "Symptom and Cause Map",
    "Why a contract dispute escalates",
    [node("root", "Dispute Escalates"), node("scope", "Unclear scope"), node("payment", "Payment delay"), node("records", "Missing records"), node("timeline", "Missed deadline"), node("notice", "Weak notice")],
    radialEdges("root", ["scope", "payment", "records", "timeline", "notice"]),
    {type: "force", preventOverlap: true, linkDistance: 150},
    "fade-scale",
  ),
  design(
    "g6-mind-map",
    "Mind Map",
    "Tree",
    "A simple mind map for content planning.",
    "Realtor",
    "Mind Map",
    "Seller launch plan for a new listing",
    [node("root", "Listing Launch"), node("prep", "Prep"), node("price", "Price"), node("media", "Media"), node("showing", "Showings"), node("follow", "Follow-up")],
    radialEdges("root", ["prep", "price", "media", "showing", "follow"]),
    {type: "dagre", rankdir: "LR", ranksep: 74, nodesep: 32},
    "top-down-tree",
  ),
  hierarchyDesign(
    "g6-fishbone",
    "Cause-and-Effect Fishbone",
    "Diagnostic",
    "A fishbone cause map for educational explanation.",
    "Personal Trainer",
    "Cause-and-Effect Fishbone",
    "Why fat-loss progress stalls",
    hierarchyNode("root", "Progress Stalls", [
      hierarchyNode("nutrition", "Nutrition", [
        hierarchyNode("protein", "Inconsistent protein"),
        hierarchyNode("weekend", "Weekend drift"),
      ]),
      hierarchyNode("activity", "Activity", [
        hierarchyNode("steps", "Low daily steps"),
        hierarchyNode("training", "No progression"),
      ]),
      hierarchyNode("recovery", "Recovery", [
        hierarchyNode("sleep", "Short sleep"),
        hierarchyNode("stress", "High stress load"),
      ]),
    ]),
    {type: "fishbone", direction: "RL", width: 560, height: 390},
    "path-style-reveal",
  ),
  hierarchyDesign(
    "g6-compact-box-tree",
    "Compact Box Tree",
    "Tree",
    "A compact hierarchy tree for nested educational structure.",
    "Dentist",
    "Compact Box Tree",
    "How a care plan becomes a treatment sequence",
    hierarchyNode("root", "Care Plan", [
      hierarchyNode("diagnosis", "Diagnosis", [
        hierarchyNode("exam", "Exam"),
        hierarchyNode("imaging", "Imaging"),
      ]),
      hierarchyNode("options", "Options", [
        hierarchyNode("phased", "Phased plan"),
        hierarchyNode("same-day", "Same-day work"),
      ]),
      hierarchyNode("followup", "Follow-up", [
        hierarchyNode("recheck", "Recheck"),
        hierarchyNode("maintenance", "Maintenance"),
      ]),
    ]),
    {type: "compact-box", direction: "TB", getWidth: () => 132, getHeight: () => 50, getHGap: () => 28, getVGap: () => 62},
    "top-down-tree",
  ),
  design(
    "g6-decision-tree",
    "Decision Tree",
    "Tree",
    "A compact decision tree for service triage.",
    "Attorney",
    "Decision Tree",
    "Which intake path fits the matter",
    [node("root", "New Inquiry"), node("urgent", "Urgent deadline"), node("docs", "Has documents"), node("consult", "Book consult"), node("prep", "Prep review"), node("refer", "Refer out")],
    [edge("root", "urgent", "Yes"), edge("root", "docs", "No"), edge("urgent", "consult"), edge("docs", "prep"), edge("docs", "refer")],
    {type: "dagre", rankdir: "TB", nodesep: 34, ranksep: 80},
    "top-down-tree",
  ),
  design(
    "g6-customer-journey",
    "Customer Journey",
    "Process",
    "A left-to-right journey map for client experience.",
    "Med Spa",
    "Customer Journey",
    "From first DM to membership",
    [node("aware", "Sees result"), node("ask", "Asks question"), node("consult", "Consult"), node("treat", "Treatment"), node("member", "Membership")],
    [edge("aware", "ask"), edge("ask", "consult"), edge("consult", "treat"), edge("treat", "member")],
    {type: "dagre", rankdir: "LR", nodesep: 28, ranksep: 62},
    "grow-right",
  ),
  design(
    "g6-four-step-process",
    "Connected Four-Step Process",
    "Process",
    "A connected process for simple service explainers.",
    "Dentist",
    "Connected Four-Step Process",
    "How implant consults become treatment plans",
    [node("scan", "Scan"), node("review", "Review"), node("options", "Options"), node("plan", "Plan")],
    [edge("scan", "review"), edge("review", "options"), edge("options", "plan")],
    {type: "dagre", rankdir: "LR", ranksep: 76},
    "grow-right",
  ),
  design(
    "g6-service-ecosystem",
    "Service Ecosystem",
    "Network",
    "A service ecosystem map for brand positioning.",
    "Realtor",
    "Service Ecosystem",
    "Who supports a smooth home sale",
    [node("root", "Seller"), node("agent", "Agent"), node("stager", "Stager"), node("photo", "Media"), node("lender", "Lender"), node("title", "Title")],
    [edge("root", "agent"), edge("agent", "stager"), edge("agent", "photo"), edge("agent", "lender"), edge("agent", "title")],
    {type: "force", preventOverlap: true, linkDistance: 140},
    "fade-scale",
  ),
  design(
    "g6-organization-tree",
    "Organization Tree",
    "Tree",
    "A small org tree for team or care-model content.",
    "Chiropractor",
    "Organization Tree",
    "Care team around a new patient",
    [node("root", "Patient"), node("doc", "Doctor"), node("ca", "Care advocate"), node("rehab", "Rehab coach"), node("billing", "Billing guide")],
    radialEdges("root", ["doc", "ca", "rehab", "billing"]),
    {type: "dagre", rankdir: "TB", ranksep: 88},
    "top-down-tree",
  ),
  design(
    "g6-radial-topic-map",
    "Radial Topic Map",
    "Explainer",
    "A radial map for educational posts.",
    "Personal Trainer",
    "Radial Topic Map",
    "The pillars of sustainable strength",
    [node("root", "Strength"), node("form", "Form"), node("load", "Load"), node("recovery", "Recovery"), node("nutrition", "Nutrition"), node("consistency", "Consistency")],
    radialEdges("root", ["form", "load", "recovery", "nutrition", "consistency"]),
    {type: "radial", unitRadius: 130, preventOverlap: true},
    "radial-reveal",
  ),
  design(
    "g6-snake-process",
    "Snake Process",
    "Process",
    "A snake layout for multi-step timelines.",
    "Attorney",
    "Snake Process",
    "Matter workflow from intake to resolution",
    [node("intake", "Intake"), node("review", "Review"), node("strategy", "Strategy"), node("file", "File"), node("negotiate", "Negotiate"), node("resolve", "Resolve")],
    [edge("intake", "review"), edge("review", "strategy"), edge("strategy", "file"), edge("file", "negotiate"), edge("negotiate", "resolve")],
    {type: "snake", cols: 3, rowGap: 96, colGap: 110},
    "grow-right",
  ),
  design(
    "g6-diagnostic-flow",
    "Diagnostic Flow",
    "Diagnostic",
    "A yes/no flow for audience triage.",
    "Dentist",
    "Diagnostic Flow",
    "When tooth pain needs urgent care",
    [node("pain", "Pain?"), node("swelling", "Swelling"), node("cold", "Cold sensitive"), node("urgent", "Same-day call"), node("exam", "Exam soon"), node("watch", "Monitor")],
    [edge("pain", "swelling", "Severe"), edge("pain", "cold", "Mild"), edge("swelling", "urgent"), edge("cold", "exam"), edge("cold", "watch")],
    {type: "dagre", rankdir: "TB", ranksep: 82},
    "top-down-tree",
  ),
  design(
    "g6-resource-flow",
    "Resource Flow",
    "Network",
    "A resource map showing how inputs move to outcomes.",
    "Realtor",
    "Resource Flow",
    "How listing assets create buyer urgency",
    [node("photos", "Photos"), node("copy", "Copy"), node("social", "Social"), node("email", "Email"), node("showings", "Showings"), node("offers", "Offers")],
    [edge("photos", "social"), edge("copy", "email"), edge("social", "showings"), edge("email", "showings"), edge("showings", "offers")],
    {type: "dagre", rankdir: "LR", ranksep: 72},
    "path-style-reveal",
  ),
  design(
    "g6-clustered-concept-map",
    "Clustered Concept Map",
    "Network",
    "A clustered concept map for multi-factor explanations.",
    "Med Spa",
    "Clustered Concept Map",
    "What drives long-term skin results",
    [node("root", "Results"), node("home", "Home care", "Routine"), node("spf", "SPF", "Routine"), node("treat", "Treatments", "Clinic"), node("plan", "Plan", "Clinic"), node("food", "Hydration", "Lifestyle"), node("sleep", "Sleep", "Lifestyle")],
    [edge("root", "home"), edge("home", "spf"), edge("root", "treat"), edge("treat", "plan"), edge("root", "food"), edge("food", "sleep")],
    {type: "force", preventOverlap: true, linkDistance: 118},
    "fade-scale",
  ),
];
