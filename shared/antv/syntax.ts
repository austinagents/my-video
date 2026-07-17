import type {StudioBlock} from "../project";

const sanitize = (value: unknown): string =>
  String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/[<>]/g, "")
    .trim();

export const buildAntVSyntax = (
  block: StudioBlock,
  template: string,
): string => {
  if (block.syntax?.trim()) {
    return block.syntax.trim();
  }

  const title = sanitize(
    block.title || block.type.toUpperCase(),
  );

  if (block.type === "metric") {
    /*
     * Do not use CircularProgress here.
     * It interprets formatted currency as a percentage and produces NaN.
     */
    return `
infographic ${template}

data
  title ${title}
  lists
    - label Annual Budget
      value 2.4M
      desc +18% vs last year
`;
  }

  if (block.type === "objective") {
    return `
infographic ${template}

data
  title ${title}
  lists
    - label Qualified Leads
      value 35%
      desc Target by end of Q4
`;
  }

  if (block.type === "donut") {
    return `
infographic ${template}

data
  title ${title}
  lists
    - label Content Marketing
      value 40
      desc 40%
    - label Paid Advertising
      value 25
      desc 25%
    - label SEO & Organic
      value 20
      desc 20%
    - label Email Marketing
      value 10
      desc 10%
    - label Other
      value 5
      desc 5%
`;
  }

  if (block.type === "timeline" || block.type === "process") {
    return `
infographic ${template}

data
  title ${title}
  lists
    - label Research
      desc Jan - Feb
    - label Create
      desc Mar - Apr
    - label Launch
      desc May - Jun
    - label Optimize
      desc Jul - Dec
`;
  }

  if (block.type === "funnel") {
    return `
infographic ${template}

data
  title ${title}
  lists
    - label Awareness
      value 100
      desc 100%
    - label Interest
      value 60
      desc 60%
    - label Consideration
      value 30
      desc 30%
    - label Conversion
      value 15
      desc 15%
`;
  }

  if (block.type === "bars") {
    return `
infographic ${template}

data
  title ${title}
  lists
    - label Organic Search
      value 4200
      desc 4.2K
    - label Paid Social
      value 3100
      desc 3.1K
    - label Email
      value 2800
      desc 2.8K
    - label Direct
      value 1900
      desc 1.9K
    - label Referrals
      value 1200
      desc 1.2K
`;
  }

  if (block.type === "metrics") {
    return `
infographic ${template}

data
  title ${title}
  lists
    - label Website Traffic
      value 42.5K
      desc +24%
    - label Leads Generated
      value 3.2K
      desc +35%
    - label Conversion Rate
      value 4.8%
      desc +12%
    - label Acquisition Cost
      value $58
      desc -8%
`;
  }

  if (block.type === "comparison") {
    return `
infographic ${template}

data
  title ${title}
  lists
    - label Organic
      value Long-Term
      desc Compounds over time
    - label Paid
      value Immediate
      desc Produces immediate reach
`;
  }

  if (block.type === "hierarchy") {
    return `
infographic ${template}

data
  title ${title}
  lists
    - label Strategy
      desc Central direction
    - label Audience
      desc Needs and behavior
    - label Offer
      desc Value and positioning
    - label Distribution
      desc Organic and paid channels
`;
  }

  return `
infographic list-grid-simple

data
  title ${title}
  lists
    - label ${title}
      desc Infographic content
`;
};
