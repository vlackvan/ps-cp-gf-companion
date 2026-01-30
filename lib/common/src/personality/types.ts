/**
 * Personality System Types
 * Types for character selection, user profiles, and personality scoring
 */

// Character options
export type Character = "chihiro" | "aru";

export interface CharacterInfo {
  id: Character;
  name: string;
  subtitle: string;
  description: string;
  tone: string;
  image: string;
}

// User profile from demographics
export interface UserProfile {
  age: number;
  gender: "male" | "female" | "other";
  residence: string;
}

// BFI-2-S (Big Five Inventory-2 Short Form) Scores
export interface BFIScores {
  extraversion: number; // 1-5 scale
  agreeableness: number; // 1-5 scale
  conscientiousness: number; // 1-5 scale
  neuroticism: number; // 1-5 scale (Negative Emotionality)
  openness: number; // 1-5 scale (Open-Mindedness)
}

// PVQ (Portrait Values Questionnaire) Scores
export interface PVQScores {
  universalism: number; // Centered score
  benevolence: number; // Centered score
  tradition: number; // Centered score
  conformity: number; // Centered score
  security: number; // Centered score
  power: number; // Centered score
  achievement: number; // Centered score
  hedonism: number; // Centered score
  stimulation: number; // Centered score
  selfDirection: number; // Centered score
}

// Combined personality profile
export interface PersonalityProfile {
  bfi: BFIScores;
  pvq: PVQScores;
}

// Full user state
export interface OnboardingState {
  character?: Character;
  userProfile?: UserProfile;
  personalityProfile?: PersonalityProfile;
  onboardingComplete: boolean;
}

// Survey step tracking
export type SurveyStep =
  | "character"
  | "demographics"
  | "bfi"
  | "pvq"
  | "complete";

// Survey response
export interface SurveyResponse {
  questionIndex: number;
  value: number;
}

// Character definitions
export const CHARACTERS: Record<Character, CharacterInfo> = {
  chihiro: {
    id: "chihiro",
    name: "Chihiro",
    subtitle: "Veritas Academy Leader",
    description:
      "Rational hacker with a cool demeanor. Uses tech analogies and is secretly caring beneath her efficient exterior.",
    tone: "Cool-headed, logical, uses engineer slang, dry but affectionate",
    image: "chihiro.jpg",
  },
  aru: {
    id: "aru",
    name: "Aru",
    subtitle: "Problem Solver 68 President",
    description:
      "Self-proclaimed hard-boiled outlaw who is actually kind-hearted. Confident but endearingly clumsy.",
    tone: "Overconfident, dramatic, boss vibes, supportive underneath the bravado",
    image: "aru.jpg",
  },
};
