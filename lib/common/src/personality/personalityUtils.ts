/**
 * Personality Scoring Utilities
 * Implements BFI-2-S and PVQ scoring algorithms
 */

import { BFIScores, PVQScores, PersonalityProfile } from "./types";

// ============================================
// BFI-2-S (Big Five Inventory-2 Short Form)
// ============================================

// Items for each domain (1-indexed)
// (R) indicates reverse-keyed items
const BFI_DOMAINS = {
  extraversion: [
    { item: 1, reverse: true }, // Tends to be quiet (R)
    { item: 6, reverse: false }, // Is dominant, acts as a leader
    { item: 11, reverse: false }, // Is full of energy
    { item: 16, reverse: false }, // Is outgoing, sociable
    { item: 21, reverse: true }, // Prefers to have others take charge (R)
    { item: 26, reverse: true }, // Is less active than other people (R)
  ],
  agreeableness: [
    { item: 2, reverse: false }, // Is compassionate, has a soft heart
    { item: 7, reverse: true }, // Is sometimes rude to others (R)
    { item: 12, reverse: false }, // Assumes the best about people
    { item: 17, reverse: true }, // Can be cold and uncaring (R)
    { item: 22, reverse: false }, // Is respectful, treats others with respect
    { item: 27, reverse: true }, // Tends to find fault with others (R)
  ],
  conscientiousness: [
    { item: 3, reverse: true }, // Tends to be disorganized (R)
    { item: 8, reverse: true }, // Has difficulty getting started on tasks (R)
    { item: 13, reverse: false }, // Is reliable, can always be counted on
    { item: 18, reverse: false }, // Keeps things neat and tidy
    { item: 23, reverse: false }, // Is persistent, works until the task is finished
    { item: 28, reverse: true }, // Can be somewhat careless (R)
  ],
  neuroticism: [
    { item: 4, reverse: false }, // Worries a lot
    { item: 9, reverse: false }, // Tends to feel depressed, blue
    { item: 14, reverse: true }, // Is emotionally stable, not easily upset (R)
    { item: 19, reverse: true }, // Is relaxed, handles stress well (R)
    { item: 24, reverse: true }, // Feels secure, comfortable with self (R)
    { item: 29, reverse: false }, // Is temperamental, gets emotional easily
  ],
  openness: [
    { item: 5, reverse: false }, // Is fascinated by art, music, or literature
    { item: 10, reverse: true }, // Has little interest in abstract ideas (R)
    { item: 15, reverse: false }, // Is original, comes up with new ideas
    { item: 20, reverse: true }, // Has few artistic interests (R)
    { item: 25, reverse: false }, // Is complex, a deep thinker
    { item: 30, reverse: true }, // Has little creativity (R)
  ],
};

// BFI-2-S Questions (30 items)
export const BFI_QUESTIONS: string[] = [
  "Tends to be quiet.",
  "Is compassionate, has a soft heart.",
  "Tends to be disorganized.",
  "Worries a lot.",
  "Is fascinated by art, music, or literature.",
  "Is dominant, acts as a leader.",
  "Is sometimes rude to others.",
  "Has difficulty getting started on tasks.",
  "Tends to feel depressed, blue.",
  "Has little interest in abstract ideas.",
  "Is full of energy.",
  "Assumes the best about people.",
  "Is reliable, can always be counted on.",
  "Is emotionally stable, not easily upset.",
  "Is original, comes up with new ideas.",
  "Is outgoing, sociable.",
  "Can be cold and uncaring.",
  "Keeps things neat and tidy.",
  "Is relaxed, handles stress well.",
  "Has few artistic interests.",
  "Prefers to have others take charge.",
  "Is respectful, treats others with respect.",
  "Is persistent, works until the task is finished.",
  "Feels secure, comfortable with self.",
  "Is complex, a deep thinker.",
  "Is less active than other people.",
  "Tends to find fault with others.",
  "Can be somewhat careless.",
  "Is temperamental, gets emotional easily.",
  "Has little creativity.",
];

/**
 * Score BFI-2-S responses
 * @param responses Array of 30 responses (1-5 scale, 0-indexed)
 * @returns BFIScores object with domain means
 */
export function scoreBFI(responses: number[]): BFIScores {
  if (responses.length !== 30) {
    throw new Error(`Expected 30 BFI responses, got ${responses.length}`);
  }

  const calcDomainScore = (
    items: { item: number; reverse: boolean }[]
  ): number => {
    let sum = 0;
    for (const { item, reverse } of items) {
      const score = responses[item - 1]; // Convert to 0-indexed
      sum += reverse ? 6 - score : score;
    }
    return sum / items.length;
  };

  return {
    extraversion: calcDomainScore(BFI_DOMAINS.extraversion),
    agreeableness: calcDomainScore(BFI_DOMAINS.agreeableness),
    conscientiousness: calcDomainScore(BFI_DOMAINS.conscientiousness),
    neuroticism: calcDomainScore(BFI_DOMAINS.neuroticism),
    openness: calcDomainScore(BFI_DOMAINS.openness),
  };
}

// ============================================
// PVQ (Portrait Values Questionnaire)
// ============================================

// Items for each value (1-indexed)
const PVQ_VALUES = {
  universalism: [3, 8, 19, 23, 29, 40],
  benevolence: [12, 18, 27, 33],
  tradition: [9, 20, 25, 38],
  conformity: [7, 16, 28, 36],
  security: [5, 14, 21, 31, 35],
  power: [2, 17, 39],
  achievement: [4, 13, 24, 32],
  hedonism: [10, 26, 37],
  stimulation: [6, 15, 30],
  selfDirection: [1, 11, 22, 34],
};

// PVQ Questions (40 items)
export const PVQ_QUESTIONS: string[] = [
  "Thinking up new ideas and being creative is important to him.",
  "It is important to him to be rich.",
  "He thinks it is important that every person in the world be treated equally.",
  "It's very important to him to show his abilities.",
  "It is important to him to live in secure surroundings.",
  "He thinks it is important to do lots of different things in life.",
  "He believes that people should do what they're told.",
  "It is important to him to listen to people who are different from him.",
  "He thinks it's important not to ask for more than what you have.",
  "He seeks every chance he can to have fun.",
  "It is important to him to make his own decisions about what he does.",
  "It's very important to him to help the people around him.",
  "Being very successful is important to him.",
  "It is very important to him that his country be safe.",
  "He likes to take risks.",
  "It is important to him to always behave properly.",
  "It is important to him to be in charge and tell others what to do.",
  "It is important to him to be loyal to his friends.",
  "He strongly believes that people should care for nature.",
  "Religious belief is important to him.",
  "It is important to him that things be organized and clean.",
  "He thinks it's important to be interested in things.",
  "He believes all the world's people should live in harmony.",
  "He thinks it is important to be ambitious.",
  "He thinks it is best to do things in traditional ways.",
  "Enjoying life's pleasures is important to him.",
  "It is important to him to respond to the needs of others.",
  "He believes he should always show respect to his parents and to older people.",
  "He wants everyone to be treated justly, even people he doesn't know.",
  "He likes surprises.",
  "He tries hard to avoid getting sick.",
  "Getting ahead in life is important to him.",
  "Forgiving people who have hurt him is important to him.",
  "It is important to him to be independent.",
  "Having a stable government is important to him.",
  "It is important to him to be polite to other people all the time.",
  "He really wants to enjoy life.",
  "It is important to him to be humble and modest.",
  "He always wants to be the one who makes the decisions.",
  "It is important to him to adapt to nature and to fit into it.",
];

/**
 * Score PVQ responses with MRAT centering
 * @param responses Array of 40 responses (1-6 scale, 0-indexed)
 * @returns PVQScores object with centered value scores
 */
export function scorePVQ(responses: number[]): PVQScores {
  if (responses.length !== 40) {
    throw new Error(`Expected 40 PVQ responses, got ${responses.length}`);
  }

  // Calculate MRAT (Mean Respondent Affinity Total)
  const mrat = responses.reduce((a, b) => a + b, 0) / responses.length;

  const calcValueScore = (items: number[]): number => {
    const sum = items.reduce((acc, item) => acc + responses[item - 1], 0);
    const rawMean = sum / items.length;
    return rawMean - mrat; // Centered score
  };

  return {
    universalism: calcValueScore(PVQ_VALUES.universalism),
    benevolence: calcValueScore(PVQ_VALUES.benevolence),
    tradition: calcValueScore(PVQ_VALUES.tradition),
    conformity: calcValueScore(PVQ_VALUES.conformity),
    security: calcValueScore(PVQ_VALUES.security),
    power: calcValueScore(PVQ_VALUES.power),
    achievement: calcValueScore(PVQ_VALUES.achievement),
    hedonism: calcValueScore(PVQ_VALUES.hedonism),
    stimulation: calcValueScore(PVQ_VALUES.stimulation),
    selfDirection: calcValueScore(PVQ_VALUES.selfDirection),
  };
}

/**
 * Calculate full personality profile from survey responses
 */
export function calculatePersonalityProfile(
  bfiResponses: number[],
  pvqResponses: number[]
): PersonalityProfile {
  return {
    bfi: scoreBFI(bfiResponses),
    pvq: scorePVQ(pvqResponses),
  };
}

/**
 * Get top personality traits for prompt generation
 */
export function getTopTraits(profile: PersonalityProfile): {
  topBFI: { trait: string; score: number }[];
  topPVQ: { value: string; score: number }[];
} {
  const bfiEntries = Object.entries(profile.bfi) as [keyof BFIScores, number][];
  const pvqEntries = Object.entries(profile.pvq) as [keyof PVQScores, number][];

  const topBFI = bfiEntries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([trait, score]) => ({ trait, score }));

  const topPVQ = pvqEntries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([value, score]) => ({ value, score }));

  return { topBFI, topPVQ };
}

/**
 * Human-readable trait descriptions
 */
export const TRAIT_DESCRIPTIONS: Record<string, { high: string; low: string }> =
  {
    // BFI
    extraversion: {
      high: "outgoing and energetic",
      low: "reserved and introspective",
    },
    agreeableness: {
      high: "warm and cooperative",
      low: "direct and competitive",
    },
    conscientiousness: {
      high: "organized and disciplined",
      low: "flexible and spontaneous",
    },
    neuroticism: {
      high: "sensitive and emotionally aware",
      low: "calm and emotionally stable",
    },
    openness: {
      high: "creative and curious",
      low: "practical and conventional",
    },
    // PVQ
    universalism: { high: "values equality and justice", low: "" },
    benevolence: { high: "caring and helpful", low: "" },
    tradition: { high: "respects customs and traditions", low: "" },
    conformity: { high: "values rules and social expectations", low: "" },
    security: { high: "values safety and stability", low: "" },
    power: { high: "ambitious for influence", low: "" },
    achievement: { high: "driven to succeed", low: "" },
    hedonism: { high: "seeks pleasure and enjoyment", low: "" },
    stimulation: { high: "seeks excitement and novelty", low: "" },
    selfDirection: { high: "values independence and autonomy", low: "" },
  };
