export type RiceInputs = {
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
};

export type RiceBreakdown = {
  reach: number;
  impact: number;
  confidencePercent: number;
  confidenceDecimal: number;
  effort: number;
  score: number;
};

export type RiceResult =
  | { valid: true; breakdown: RiceBreakdown }
  | { valid: false; breakdown: null; reason: string };

export type RankedRice<T> = {
  item: T;
  result: RiceResult;
  rank: number | null;
  insertionIndex: number;
};

/** Formats only the presented score; calculation and ranking keep their full precision. */
export function formatRiceScore(score: number, locale?: string): string {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(score);
}

/** Computes RICE without rounding any intermediate values. Confidence is entered as a percentage. */
export function calculateRice(inputs: RiceInputs): RiceResult {
  const values = [inputs.reach, inputs.impact, inputs.confidence, inputs.effort];
  if (!values.every(Number.isFinite)) {
    return { valid: false, breakdown: null, reason: "All RICE values must be finite numbers." };
  }
  if (inputs.reach < 0 || inputs.impact < 0) {
    return { valid: false, breakdown: null, reason: "Reach and impact cannot be negative." };
  }
  if (inputs.confidence < 0 || inputs.confidence > 100) {
    return { valid: false, breakdown: null, reason: "Confidence must be between 0 and 100 percent." };
  }
  if (inputs.effort <= 0) {
    return { valid: false, breakdown: null, reason: "Effort must be greater than zero." };
  }

  const confidenceDecimal = inputs.confidence / 100;
  const score = (inputs.reach * inputs.impact * confidenceDecimal) / inputs.effort;
  if (!Number.isFinite(score)) {
    return { valid: false, breakdown: null, reason: "These values exceed the supported scoring range." };
  }
  return {
    valid: true,
    breakdown: {
      reach: inputs.reach,
      impact: inputs.impact,
      confidencePercent: inputs.confidence,
      confidenceDecimal,
      effort: inputs.effort,
      score,
    },
  };
}

/** Sorts valid scores high to low. Ties use lower effort, higher confidence, then input order. */
export function rankByRice<T extends RiceInputs>(items: readonly T[]): RankedRice<T>[] {
  const ranked = items.map((item, insertionIndex) => ({
    item,
    result: calculateRice(item),
    rank: null as number | null,
    insertionIndex,
  }));

  ranked.sort((left, right) => {
    if (left.result.valid !== right.result.valid) return left.result.valid ? -1 : 1;
    if (!left.result.valid || !right.result.valid) return left.insertionIndex - right.insertionIndex;

    const scoreDifference = right.result.breakdown.score - left.result.breakdown.score;
    if (scoreDifference !== 0) return scoreDifference;
    if (left.item.effort !== right.item.effort) return left.item.effort - right.item.effort;
    if (left.item.confidence !== right.item.confidence) return right.item.confidence - left.item.confidence;
    return left.insertionIndex - right.insertionIndex;
  });

  let nextRank = 1;
  for (const row of ranked) {
    if (row.result.valid) row.rank = nextRank++;
  }
  return ranked;
}
