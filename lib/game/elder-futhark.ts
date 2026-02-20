/**
 * Elder Futhark Rune System
 * Complete set of 24 ancient Norse runes with meanings, powers, and scoring
 */

export type ElderFutharkRune =
  | "fehu" | "uruz" | "thurisaz" | "ansuz" | "raidho" | "kenaz" | "gebo" | "wunjo"
  | "hagalaz" | "nauthiz" | "isa" | "jera" | "eihwaz" | "perthro" | "algiz" | "sowilo"
  | "tiwaz" | "berkano" | "ehwaz" | "mannaz" | "laguz" | "ingwaz" | "dagaz" | "othala";

export interface RuneProperties {
  name: string;
  symbol: string;
  unicode: string;
  meaning: string;
  power: string;
  element: "fire" | "ice" | "earth" | "air" | "void" | "light";
  tier: "lesser" | "greater" | "supreme" | "divine";
  scoreMultiplier: number;
  energyBonus: number;
  utilityBonus: number;
  color: string;
  glowColor: string;
  particleCount: number;
}

export const ELDER_FUTHARK_RUNES: Record<ElderFutharkRune, RuneProperties> = {
  // Aett of Freyr (Wealth & Growth)
  fehu: {
    name: "Fehu",
    symbol: "ᚠ",
    unicode: "\u16A0",
    meaning: "Wealth, Cattle",
    power: "Material abundance and prosperity flow",
    element: "fire",
    tier: "lesser",
    scoreMultiplier: 1.2,
    energyBonus: 5,
    utilityBonus: 25,
    color: "#FFD700",
    glowColor: "#FFA500",
    particleCount: 15,
  },
  uruz: {
    name: "Uruz",
    symbol: "ᚢ",
    unicode: "\u16A2",
    meaning: "Aurochs, Strength",
    power: "Primal vitality and physical might",
    element: "earth",
    tier: "lesser",
    scoreMultiplier: 1.3,
    energyBonus: 8,
    utilityBonus: 30,
    color: "#8B4513",
    glowColor: "#CD853F",
    particleCount: 18,
  },
  thurisaz: {
    name: "Thurisaz",
    symbol: "ᚦ",
    unicode: "\u16A6",
    meaning: "Giant, Thorn",
    power: "Destructive force and breakthrough power",
    element: "fire",
    tier: "greater",
    scoreMultiplier: 1.5,
    energyBonus: 12,
    utilityBonus: 45,
    color: "#DC143C",
    glowColor: "#FF4500",
    particleCount: 25,
  },
  ansuz: {
    name: "Ansuz",
    symbol: "ᚨ",
    unicode: "\u16A8",
    meaning: "God, Wisdom",
    power: "Divine inspiration and sacred knowledge",
    element: "air",
    tier: "supreme",
    scoreMultiplier: 2.0,
    energyBonus: 15,
    utilityBonus: 60,
    color: "#4169E1",
    glowColor: "#00BFFF",
    particleCount: 35,
  },
  raidho: {
    name: "Raidho",
    symbol: "ᚱ",
    unicode: "\u16B1",
    meaning: "Journey, Riding",
    power: "Swift movement and guided travel",
    element: "air",
    tier: "lesser",
    scoreMultiplier: 1.25,
    energyBonus: 6,
    utilityBonus: 28,
    color: "#32CD32",
    glowColor: "#00FF00",
    particleCount: 20,
  },
  kenaz: {
    name: "Kenaz",
    symbol: "ᚲ",
    unicode: "\u16B2",
    meaning: "Torch, Knowledge",
    power: "Illumination and crafting mastery",
    element: "fire",
    tier: "greater",
    scoreMultiplier: 1.6,
    energyBonus: 10,
    utilityBonus: 50,
    color: "#FF8C00",
    glowColor: "#FFD700",
    particleCount: 30,
  },
  gebo: {
    name: "Gebo",
    symbol: "ᚷ",
    unicode: "\u16B7",
    meaning: "Gift, Partnership",
    power: "Sacred exchange and balance",
    element: "void",
    tier: "greater",
    scoreMultiplier: 1.7,
    energyBonus: 13,
    utilityBonus: 55,
    color: "#9370DB",
    glowColor: "#BA55D3",
    particleCount: 28,
  },
  wunjo: {
    name: "Wunjo",
    symbol: "ᚹ",
    unicode: "\u16B9",
    meaning: "Joy, Perfection",
    power: "Bliss and harmonious completion",
    element: "light",
    tier: "supreme",
    scoreMultiplier: 1.9,
    energyBonus: 16,
    utilityBonus: 65,
    color: "#FFD700",
    glowColor: "#FFFF00",
    particleCount: 40,
  },

  // Aett of Heimdall (Chaos & Transformation)
  hagalaz: {
    name: "Hagalaz",
    symbol: "ᚺ",
    unicode: "\u16BA",
    meaning: "Hail, Disruption",
    power: "Destructive transformation and change",
    element: "ice",
    tier: "greater",
    scoreMultiplier: 1.55,
    energyBonus: 11,
    utilityBonus: 48,
    color: "#00CED1",
    glowColor: "#48D1CC",
    particleCount: 32,
  },
  nauthiz: {
    name: "Nauthiz",
    symbol: "ᚾ",
    unicode: "\u16BE",
    meaning: "Need, Constraint",
    power: "Necessity forges strength",
    element: "ice",
    tier: "lesser",
    scoreMultiplier: 1.35,
    energyBonus: 7,
    utilityBonus: 32,
    color: "#4682B4",
    glowColor: "#5F9EA0",
    particleCount: 22,
  },
  isa: {
    name: "Isa",
    symbol: "ᛁ",
    unicode: "\u16C1",
    meaning: "Ice, Stillness",
    power: "Frozen focus and preservation",
    element: "ice",
    tier: "lesser",
    scoreMultiplier: 1.3,
    energyBonus: 9,
    utilityBonus: 35,
    color: "#B0E0E6",
    glowColor: "#ADD8E6",
    particleCount: 24,
  },
  jera: {
    name: "Jera",
    symbol: "ᛃ",
    unicode: "\u16C3",
    meaning: "Year, Harvest",
    power: "Cyclical reward and abundance",
    element: "earth",
    tier: "greater",
    scoreMultiplier: 1.65,
    energyBonus: 14,
    utilityBonus: 58,
    color: "#DAA520",
    glowColor: "#F0E68C",
    particleCount: 36,
  },
  eihwaz: {
    name: "Eihwaz",
    symbol: "ᛇ",
    unicode: "\u16C7",
    meaning: "Yew Tree, Defense",
    power: "Endurance through adversity",
    element: "earth",
    tier: "greater",
    scoreMultiplier: 1.5,
    energyBonus: 12,
    utilityBonus: 52,
    color: "#228B22",
    glowColor: "#2E8B57",
    particleCount: 29,
  },
  perthro: {
    name: "Perthro",
    symbol: "ᛈ",
    unicode: "\u16C8",
    meaning: "Fate, Mystery",
    power: "Hidden knowledge and wyrd manipulation",
    element: "void",
    tier: "supreme",
    scoreMultiplier: 2.2,
    energyBonus: 18,
    utilityBonus: 75,
    color: "#8B008B",
    glowColor: "#9932CC",
    particleCount: 45,
  },
  algiz: {
    name: "Algiz",
    symbol: "ᛉ",
    unicode: "\u16C9",
    meaning: "Elk, Protection",
    power: "Divine shield and sanctuary",
    element: "light",
    tier: "supreme",
    scoreMultiplier: 2.1,
    energyBonus: 17,
    utilityBonus: 70,
    color: "#FFFFFF",
    glowColor: "#F0F8FF",
    particleCount: 42,
  },
  sowilo: {
    name: "Sowilo",
    symbol: "ᛊ",
    unicode: "\u16CA",
    meaning: "Sun, Victory",
    power: "Radiant success and triumph",
    element: "light",
    tier: "divine",
    scoreMultiplier: 2.5,
    energyBonus: 20,
    utilityBonus: 90,
    color: "#FFD700",
    glowColor: "#FFA500",
    particleCount: 50,
  },

  // Aett of Tyr (Honor & Cosmic Order)
  tiwaz: {
    name: "Tiwaz",
    symbol: "ᛏ",
    unicode: "\u16CF",
    meaning: "Tyr, Justice",
    power: "Warrior's honor and righteous victory",
    element: "fire",
    tier: "supreme",
    scoreMultiplier: 2.0,
    energyBonus: 15,
    utilityBonus: 68,
    color: "#B22222",
    glowColor: "#FF6347",
    particleCount: 38,
  },
  berkano: {
    name: "Berkano",
    symbol: "ᛒ",
    unicode: "\u16D2",
    meaning: "Birch, Growth",
    power: "Renewal and fertile beginnings",
    element: "earth",
    tier: "greater",
    scoreMultiplier: 1.6,
    energyBonus: 11,
    utilityBonus: 50,
    color: "#90EE90",
    glowColor: "#98FB98",
    particleCount: 31,
  },
  ehwaz: {
    name: "Ehwaz",
    symbol: "ᛖ",
    unicode: "\u16D6",
    meaning: "Horse, Partnership",
    power: "Swift progress and loyal bonds",
    element: "air",
    tier: "greater",
    scoreMultiplier: 1.55,
    energyBonus: 10,
    utilityBonus: 47,
    color: "#CD853F",
    glowColor: "#DEB887",
    particleCount: 27,
  },
  mannaz: {
    name: "Mannaz",
    symbol: "ᛗ",
    unicode: "\u16D7",
    meaning: "Man, Humanity",
    power: "Collective consciousness and intelligence",
    element: "void",
    tier: "greater",
    scoreMultiplier: 1.7,
    energyBonus: 13,
    utilityBonus: 56,
    color: "#4B0082",
    glowColor: "#6A5ACD",
    particleCount: 33,
  },
  laguz: {
    name: "Laguz",
    symbol: "ᛚ",
    unicode: "\u16DA",
    meaning: "Water, Flow",
    power: "Intuitive currents and adaptability",
    element: "ice",
    tier: "greater",
    scoreMultiplier: 1.65,
    energyBonus: 12,
    utilityBonus: 54,
    color: "#1E90FF",
    glowColor: "#00BFFF",
    particleCount: 34,
  },
  ingwaz: {
    name: "Ingwaz",
    symbol: "ᛝ",
    unicode: "\u16DD",
    meaning: "Ing, Fertility",
    power: "Potential energy and gestation",
    element: "earth",
    tier: "supreme",
    scoreMultiplier: 2.0,
    energyBonus: 16,
    utilityBonus: 72,
    color: "#228B22",
    glowColor: "#32CD32",
    particleCount: 40,
  },
  dagaz: {
    name: "Dagaz",
    symbol: "ᛞ",
    unicode: "\u16DE",
    meaning: "Day, Breakthrough",
    power: "Awakening and transformative dawn",
    element: "light",
    tier: "divine",
    scoreMultiplier: 2.3,
    energyBonus: 19,
    utilityBonus: 85,
    color: "#FFE4B5",
    glowColor: "#FAFAD2",
    particleCount: 48,
  },
  othala: {
    name: "Othala",
    symbol: "ᛟ",
    unicode: "\u16DF",
    meaning: "Ancestral Property",
    power: "Legacy inheritance and sacred homeland",
    element: "earth",
    tier: "divine",
    scoreMultiplier: 2.4,
    energyBonus: 20,
    utilityBonus: 88,
    color: "#8B4513",
    glowColor: "#A0522D",
    particleCount: 46,
  },
};

/**
 * Get a rune based on artifact properties
 */
export function getRuneForArtifact(
  pantheon: "norse" | "celtic",
  rarity: "common" | "rare" | "epic" | "mythic",
  index: number
): ElderFutharkRune {
  // Map artifacts to thematically appropriate runes
  const runesByPantheonAndRarity: Record<string, ElderFutharkRune[]> = {
    "norse-common": ["fehu", "uruz", "raidho", "nauthiz", "isa"],
    "norse-rare": ["thurisaz", "kenaz", "eihwaz", "berkano"],
    "norse-epic": ["ansuz", "wunjo", "hagalaz", "tiwaz", "ehwaz"],
    "norse-mythic": ["perthro", "sowilo", "dagaz", "othala"],
    "celtic-common": ["gebo", "jera", "mannaz", "laguz"],
    "celtic-rare": ["algiz", "ingwaz", "ehwaz", "berkano"],
    "celtic-epic": ["kenaz", "wunjo", "tiwaz", "mannaz"],
    "celtic-mythic": ["ansuz", "perthro", "sowilo", "othala"],
  };

  const key = `${pantheon}-${rarity}`;
  const runePool = runesByPantheonAndRarity[key] || ["fehu"];
  return runePool[index % runePool.length] || "fehu";
}

/**
 * Calculate score bonus based on rune properties
 */
export function calculateRuneScore(
  rune: ElderFutharkRune,
  baseScore: number,
  combo: number
): {
  totalScore: number;
  runeBonus: number;
  comboBonus: number;
  tierBonus: string;
} {
  const runeProps = ELDER_FUTHARK_RUNES[rune];
  const runeMultiplier = runeProps.scoreMultiplier;
  const comboMultiplier = 1 + (combo * 0.1);

  const runeBonus = Math.floor(baseScore * (runeMultiplier - 1));
  const comboBonus = Math.floor(baseScore * (comboMultiplier - 1));
  const totalScore = Math.floor(baseScore * runeMultiplier * comboMultiplier);

  return {
    totalScore,
    runeBonus,
    comboBonus,
    tierBonus: runeProps.tier,
  };
}

/**
 * Get particle effect configuration for rune
 */
export function getRuneParticleConfig(rune: ElderFutharkRune) {
  const props = ELDER_FUTHARK_RUNES[rune];
  return {
    count: props.particleCount,
    color: props.color,
    glowColor: props.glowColor,
    element: props.element,
    intensity: props.tier === "divine" ? 3.0 : props.tier === "supreme" ? 2.5 : props.tier === "greater" ? 2.0 : 1.5,
  };
}
