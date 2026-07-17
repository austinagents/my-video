import type {StudioContent, StudioEdge, StudioNode, StudioRow} from "./types";

export const cloneContent = (content: StudioContent): StudioContent =>
  JSON.parse(JSON.stringify(content)) as StudioContent;

export const row = (
  id: string,
  label: string,
  value: number,
  group?: string,
  secondaryValue?: number,
  target?: number,
): StudioRow => ({id, label, value, group, secondaryValue, target});

export const node = (
  id: string,
  label: string,
  group?: string,
  value?: number,
  parentId?: string,
): StudioNode => ({id, label, group, value, parentId});

export const edge = (
  source: string,
  target: string,
  label?: string,
  value?: number,
): StudioEdge => ({source, target, label, value});

export const content = (
  title: string,
  subtitle: string,
  rows: StudioRow[],
  nodes?: StudioNode[],
  edges?: StudioEdge[],
): StudioContent => ({title, subtitle, rows, nodes, edges});

export const industryRows = {
  realtor: [
    row("r1", "Listing consults", 42),
    row("r2", "Buyer tours", 36),
    row("r3", "Open house leads", 31),
    row("r4", "Seller follow-ups", 24),
    row("r5", "Referral calls", 18),
  ],
  attorney: [
    row("a1", "Intake calls", 64),
    row("a2", "Case reviews", 41),
    row("a3", "Consult bookings", 29),
    row("a4", "Retainer starts", 16),
  ],
  dentist: [
    row("d1", "New patients", 38),
    row("d2", "Whitening", 27),
    row("d3", "Implant consults", 19),
    row("d4", "Hygiene rebooks", 44),
  ],
  medspa: [
    row("m1", "Botox", 56),
    row("m2", "Hydrafacial", 44),
    row("m3", "Laser consults", 32),
    row("m4", "Memberships", 22),
  ],
  chiro: [
    row("c1", "New exams", 34),
    row("c2", "Care plans", 25),
    row("c3", "Wellness visits", 48),
    row("c4", "Reactivation", 19),
  ],
  trainer: [
    row("t1", "Assessments", 28),
    row("t2", "Trial sessions", 34),
    row("t3", "Program starts", 21),
    row("t4", "Renewals", 37),
  ],
};
