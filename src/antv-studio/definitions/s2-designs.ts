import type {S2DataConfig, S2Options} from "@antv/s2";
import {studioTheme} from "../theme";
import type {FactoryContext, S2StudioDesign, StudioRow} from "../types";
import {content, row} from "../sample-content";

type TableColumn = {key: string; title: string};

const tableConfig = (
  ctx: FactoryContext,
  columns: TableColumn[],
): {dataCfg: S2DataConfig; options: S2Options} => {
  const data = ctx.content.rows.map((item, index) => {
    const base: Record<string, string | number> = {
      item: item.label,
      value: item.value,
      rank: index + 1,
      group: item.group ?? "Standard",
      secondaryValue: item.secondaryValue ?? Math.max(1, Math.round(item.value * 0.72)),
      target: item.target ?? Math.max(item.value + 8, Math.round(item.value * 1.18)),
    };
    return base;
  });

  return {
    dataCfg: {
      data,
      fields: {columns: columns.map((column) => column.key)},
      meta: columns.map((column) => ({field: column.key, name: column.title})),
    },
    options: {
      width: ctx.width,
      height: ctx.height,
      hd: false,
      showDefaultHeaderActionIcon: false,
      tooltip: null,
      interaction: {
        selectedCellsSpotlight: false,
        hoverHighlight: false,
        brushSelection: false,
      },
      seriesNumber: {enable: false},
      style: {
        layoutWidthType: "compact",
        compactMinWidth: ctx.controls.compact ? 82 : 104,
        dataCell: {height: ctx.controls.compact ? 38 : 48},
        colCell: {height: ctx.controls.compact ? 34 : 42},
      },
    },
  };
};

const make = (
  id: string,
  name: string,
  category: string,
  description: string,
  industryExample: S2StudioDesign["industryExample"],
  title: string,
  subtitle: string,
  rows: StudioRow[],
  columns: TableColumn[],
): S2StudioDesign => ({
  engine: "s2",
  id,
  name,
  category,
  description,
  industryExample,
  animation: "row-reveal",
  supportsAddRemove: true,
  supportsSubtitle: true,
  defaultContent: content(title, subtitle, rows),
  createSheetConfig: (ctx) => tableConfig(ctx, columns),
});

export const s2Designs: S2StudioDesign[] = [
  make(
    "s2-pricing-plan-comparison",
    "Pricing Plan Comparison",
    "Comparison Table",
    "A concise pricing matrix with highlighted plan values.",
    "Personal Trainer",
    "Pricing Plan Comparison",
    "Program tiers positioned for easy decision-making",
    [row("starter", "Starter", 149, "2 sessions", 99, 199), row("core", "Core", 249, "4 sessions", 189, 299), row("elite", "Elite", 399, "8 sessions", 319, 449)],
    [
      {key: "item", title: "Plan"},
      {key: "group", title: "Includes"},
      {key: "value", title: "Monthly"},
      {key: "target", title: "Best for"},
    ],
  ),
  make(
    "s2-service-feature-matrix",
    "Service Feature Matrix",
    "Comparison Table",
    "A feature matrix for service packaging.",
    "Med Spa",
    "Service Feature Matrix",
    "Membership offers compared by customer value",
    [row("glow", "Glow", 89, "Facial", 1, 2), row("smooth", "Smooth", 139, "Laser", 2, 3), row("restore", "Restore", 199, "Injectables", 3, 4), row("vip", "VIP", 279, "All access", 4, 5)],
    [
      {key: "item", title: "Package"},
      {key: "group", title: "Anchor"},
      {key: "secondaryValue", title: "Perks"},
      {key: "value", title: "Price"},
    ],
  ),
  make(
    "s2-monthly-scorecard",
    "Monthly Performance Scorecard",
    "Scorecard",
    "A small operating scorecard for month-end social proof.",
    "Dentist",
    "Monthly Performance Scorecard",
    "Core practice metrics in one readable table",
    [row("new", "New patients", 38, "Demand", 30, 42), row("rebook", "Rebooks", 71, "Retention", 63, 76), row("reviews", "Reviews", 24, "Reputation", 18, 28), row("accept", "Case acceptance", 62, "Revenue", 55, 68)],
    [
      {key: "item", title: "Metric"},
      {key: "group", title: "Area"},
      {key: "value", title: "Current"},
      {key: "target", title: "Goal"},
    ],
  ),
  make(
    "s2-campaign-results",
    "Campaign Results Table",
    "Campaign Table",
    "A compact table for campaign performance reporting.",
    "Attorney",
    "Campaign Results",
    "Qualified inquiries by channel and outcome",
    [row("search", "Search", 44, "High intent", 16, 50), row("referral", "Referral", 29, "Trusted", 14, 34), row("social", "Social", 18, "Awareness", 6, 24), row("email", "Email", 12, "Nurture", 5, 18)],
    [
      {key: "item", title: "Channel"},
      {key: "group", title: "Role"},
      {key: "value", title: "Inquiries"},
      {key: "secondaryValue", title: "Consults"},
    ],
  ),
  make(
    "s2-before-after-metrics",
    "Before-and-After Metrics",
    "Scorecard",
    "A before-and-after table for transformation narratives.",
    "Chiropractor",
    "Before-and-After Metrics",
    "Operational lift after patient recall campaign",
    [row("exams", "New exams", 34, "Before vs after", 22, 40), row("plans", "Care plans", 25, "Before vs after", 16, 30), row("visits", "Wellness visits", 48, "Before vs after", 31, 54)],
    [
      {key: "item", title: "Metric"},
      {key: "secondaryValue", title: "Before"},
      {key: "value", title: "After"},
      {key: "target", title: "Goal"},
    ],
  ),
  make(
    "s2-ranked-leaderboard",
    "Ranked Leaderboard",
    "Leaderboard",
    "A leaderboard for top performers without spreadsheet clutter.",
    "Realtor",
    "Ranked Leaderboard",
    "Top neighborhood activities this week",
    [row("downtown", "Downtown", 51, "Hot", 42, 58), row("north", "North Loop", 43, "Rising", 35, 48), row("lake", "Lakeside", 36, "Stable", 28, 40), row("west", "West End", 31, "Emerging", 21, 35)],
    [
      {key: "rank", title: "#"},
      {key: "item", title: "Area"},
      {key: "group", title: "Signal"},
      {key: "value", title: "Score"},
    ],
  ),
  make(
    "s2-neighborhood-comparison",
    "Neighborhood Comparison",
    "Comparison Table",
    "A local-market table for realtor content.",
    "Realtor",
    "Neighborhood Comparison",
    "Buyer activity and seller opportunity by area",
    [row("midtown", "Midtown", 82, "Seller edge", 54, 88), row("park", "Park View", 74, "Balanced", 49, 80), row("ridge", "Ridge", 68, "Buyer edge", 37, 72), row("harbor", "Harbor", 79, "Fast-moving", 58, 84)],
    [
      {key: "item", title: "Neighborhood"},
      {key: "group", title: "Market"},
      {key: "value", title: "Demand"},
      {key: "secondaryValue", title: "Supply"},
    ],
  ),
  make(
    "s2-weekly-content-performance",
    "Weekly Content Performance",
    "Campaign Table",
    "A weekly content scorecard for service-business marketing.",
    "Personal Trainer",
    "Weekly Content Performance",
    "Which posts turned attention into trials",
    [row("reel", "Form reel", 18, "Instagram", 9, 22), row("story", "Client story", 14, "Instagram", 6, 18), row("email", "Email tip", 11, "Email", 5, 15), row("short", "Workout short", 21, "YouTube", 8, 24)],
    [
      {key: "item", title: "Content"},
      {key: "group", title: "Channel"},
      {key: "value", title: "Trials"},
      {key: "secondaryValue", title: "Replies"},
    ],
  ),
];

export const s2ThemeNote = studioTheme.gold;
