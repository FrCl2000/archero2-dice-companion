export const basePath = '/archero2-dice-companion';

export enum QuestName {
  KillBosses = 'Kill Bosses',
  KillMinions = 'Kill Minions',
  GoldCave = 'Gold Cave',
  DailyLogin = 'Daily Login',
  ClaimAfkRewards = 'Claim AFK Rewards',
  SealBattle = 'Seal Battles',
  Arena = 'Arena',
  IslandPack2 = 'Island Pack 2',
  IslandPack3 = 'Island Pack 3',
  UseGems = 'Use Gems',
  Keys = 'Keys',
  Wishes = 'Wishes',
  Shovels = 'Shovels',
}

export type Quest = {
  name: QuestName;
  breakpoints: [number[], number[]];
  placeholderText: string;
};

export const Quests: Quest[] = [
  {
    name: QuestName.IslandPack2,
    breakpoints: [
      Array(28)
        .fill(0)
        .map((_v, index) => index + 1),
      Array(28).fill(1),
    ],
    placeholderText: '# Bought',
  },
  {
    name: QuestName.IslandPack3,
    breakpoints: [
      Array(7)
        .fill(0)
        .map((_v, index) => index + 1),
      Array(7).fill(5),
    ],
    placeholderText: '# Bought',
  },
  {
    name: QuestName.DailyLogin,
    breakpoints: [
      [1, 2, 3, 4, 5, 6, 7, 9, 12, 15],
      Array(10).fill(2),
    ],
    placeholderText: '# Days',
  },
  {
    name: QuestName.GoldCave,
    breakpoints: [
      [2, 4, 6, 8, 10, 14, 20],
      Array(7).fill(2),
    ],
    placeholderText: '# Done',
  },
  {
    name: QuestName.KillMinions,
    breakpoints: [
      [500, 1000, 1500, 2000, 3500, 4500, 6000, 7500],
      Array(8).fill(1),
    ],
    placeholderText: '# Killed',
  },
  {
    name: QuestName.SealBattle,
    breakpoints: [
      [2, 4, 6, 8, 10, 14, 22, 30],
      Array(8).fill(2),
    ],
    placeholderText: '# Done',
  },
  {
    name: QuestName.KillBosses,
    breakpoints: [[5, 10, 20, 30, 45, 60, 75, 90], Array(8).fill(1)],
    placeholderText: '# Killed',
  },
  {
    name: QuestName.ClaimAfkRewards,
    breakpoints: [[3, 5, 10, 15, 20, 25, 30, 40], Array(8).fill(1)],
    placeholderText: '# Collected',
  },
  {
    name: QuestName.Arena,
    breakpoints: [[3, 6, 10, 15, 20, 25, 30], Array(7).fill(1)],
    placeholderText: '# Done',
  },
  {
    name: QuestName.Keys,
    breakpoints: [
      [1, 2, 3, 5, 10, 15, 20, 25, 30, 40],
      [1, 1, 1, 1, 2, 2, 2, 2, 2, 2],
    ],
    placeholderText: '# Used',
  },
  {
    name: QuestName.UseGems,
    breakpoints: [
      [200, 500, 1000, 2000, 3000, 4000, 6000, 8000, 10000, 12000, 15000, 20000],
      [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    ],
    placeholderText: '# Used',
  },
  {
    name: QuestName.Shovels,
    breakpoints: [
      [2, 4, 6, 10, 20, 30, 40, 50, 60, 70],
      [1, 1, 1, 1, 2, 2, 2, 2, 2, 2],
    ],
    placeholderText: '# Used',
  },
  {
    name: QuestName.Wishes,
    breakpoints: [
      [1, 2, 3, 5, 10, 15, 20, 25, 30, 40],
      [1, 1, 1, 1, 2, 2, 2, 2, 2, 2],
    ],
    placeholderText: '# Used',
  },
];

export const PointsBreakpoints: number[] = [0, 20000, 40000, 60000, 80000]
  .map((s) => [2000, 5000, 8000, 12000, 16000, 20000].map((bp) => bp + s))
  .flat();

export const PointsMilestoneReward: number[] = Array(
  PointsBreakpoints.length
).fill(2);

export const RollDiceTaskBreakpoints: number[] = [
  10, 20, 30, 40,
  60, 80,
  ...Array.from({ length: 11 }, (_, i) => 100 + i * 50),
  ...Array.from({ length: 14 }, (_, i) => 700 + i * 100),
];

export const RollDiceTaskReward: number[] = [
  2, 2, 2, 2,
  3, 3,
  ...Array(25).fill(5),
];

/**
 * Return a random integer between min and max (inclusive).
 * @param min - Minimum integer value
 * @param max - Maximum integer value
 * @returns Random integer in [min, max]
 */
export function randint(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Selects one item from an array based on weights.
 * @template T
 * @param items - Array of items to choose from
 * @param weights - Array of weights (same length as items)
 * @returns Randomly selected item based on weight distribution
 */
export function weightedChoice<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    if (r < weights[i]) return items[i];
    r -= weights[i];
  }
  return items[items.length - 1];
}

/**
 * Calculate the net dice used based on total rolls, points achieved, and dice gained from the board.
 *
 * @param totalRolls - Total dice rolls done.
 * @param pointsAchieved - Total points achieved.
 * @param diceFromBoard - Dice gained directly from board tiles.
 * @returns Net dice used.
 */
export function calculateNetDiceUsed(
  totalRolls: number,
  pointsAchieved: number,
  diceFromBoard: number
): number {
  let rollDiceBonus = 0;
  for (let i = 0; i < RollDiceTaskBreakpoints.length; i++) {
    if (totalRolls < RollDiceTaskBreakpoints[i]) {
      break;
    }
    rollDiceBonus += RollDiceTaskReward[i];
  }
  let pointsBonus = 0;
  for (let i = 0; i < PointsBreakpoints.length; i++) {
    if (pointsAchieved < PointsBreakpoints[i]) {
      break;
    }
    pointsBonus += PointsMilestoneReward[i];
  }
  const netDiceUsed = totalRolls - diceFromBoard - rollDiceBonus - pointsBonus;
  return netDiceUsed;
}

/**
 * Calculate the number of treasure tokens available to purchase and their total gem cost
 * from the gem exchange, based on points reached.
 *
 * Exchange thresholds:
 *  - ≥ 60,000 pts  → 1 token,  2,400 gems
 *  - ≥ 100,000 pts → +2 tokens, +4,800 gems (cumulative: 3 tokens, 7,200 gems)
 *  - Every 50k after 100k (150k, 200k, …) → +5 tokens, +12,000 gems each
 *
 * @param points - Total points achieved.
 * @returns Object with `tokens` (number purchasable) and `gems` (total cost to buy all).
 */
export function calculateTokensAndGems(points: number): { tokens: number; gems: number } {
  if (points < 60_000) return { tokens: 0, gems: 0 };
  if (points < 100_000) return { tokens: 1, gems: 2_400 };
  const extra = Math.floor((points - 100_000) / 50_000);
  return { tokens: 3 + extra * 5, gems: 7_200 + extra * 12_000 };
}

/**
 * Cumulative rewards earned from Point Reward milestones.
 * Does NOT include dice (those are handled separately by the simulation via PointsBreakpoints).
 */
export type MilestoneRewards = {
  drawChests: number;      // Draw Item Choice Chests (choose: 3 Chroma Keys / 3 Wish Coins / 4 Promised Shovels / 6 Relic Shovels)
  gold: number;            // Gold coins
  scrolls: number;         // Scroll fragments
  treasureCoins: number;   // Treasure Coins (the red anchor icon — earnable from milestones)
  maskShards: number;      // Mask artifact shards
  chromaKeys: number;      // Chromatic Keys (110k+ milestones only)
  wishTokens: number;      // Wish Tokens (110k+ milestones only)
  runeShovels: number;     // Rune Shovels (110k+ milestones only)
  promisedShovels: number; // Promised Shovels (110k+ milestones only)
};

// 0–100k: 5 bands of 20k each. Sub-milestone offsets within each band:
const MILESTONE_SUB_OFFSETS = [2_000, 5_000, 8_000, 12_000, 16_000, 20_000];

// Rewards at each sub-milestone (indexed to match MILESTONE_SUB_OFFSETS).
// Treasure coins at the +20k sub-milestone (index 5) vary by band — see BAND_TREASURE_COINS.
const MILESTONE_SUB_REWARDS: Array<Partial<MilestoneRewards>> = [
  { drawChests: 1, gold: 2_000, scrolls: 10 },
  { drawChests: 1, gold: 3_000, scrolls: 15 },
  { drawChests: 1, gold: 4_000, scrolls: 20 },
  { drawChests: 1, gold: 5_000, scrolls: 25 },
  { drawChests: 1, gold: 6_000, scrolls: 30, maskShards: 1 },
  { drawChests: 2, gold: 8_000, scrolls: 40, maskShards: 1 },
];

// Treasure coins awarded at the +20k sub-milestone per band (bands 0–4 = 20k, 40k, 60k, 80k, 100k)
const BAND_TREASURE_COINS = [1, 1, 2, 2, 2];

/**
 * Calculate cumulative Point Reward milestone loot up to a given points total.
 *
 * Pattern:
 *  - 0–100k: 5 repeating 20k bands, each with 6 sub-milestones (+2k/+5k/+8k/+12k/+16k/+20k)
 *  - 110k+:  every 10k gives 1 treasure coin, 2 chroma keys, 3 wish tokens,
 *            4 rune shovels, 4 promised shovels, 4000 gold
 *
 * @param points - Total points achieved (goal).
 * @returns Cumulative milestone rewards for all thresholds crossed.
 */
export function calculateMilestoneRewards(points: number): MilestoneRewards {
  const r: MilestoneRewards = {
    drawChests: 0, gold: 0, scrolls: 0,
    treasureCoins: 0, maskShards: 0,
    chromaKeys: 0, wishTokens: 0, runeShovels: 0, promisedShovels: 0,
  };

  // 0–100k: 5 bands × 6 sub-milestones
  for (let band = 0; band < 5; band++) {
    const base = band * 20_000;
    for (let i = 0; i < MILESTONE_SUB_OFFSETS.length; i++) {
      if (points >= base + MILESTONE_SUB_OFFSETS[i]) {
        const sub = MILESTONE_SUB_REWARDS[i];
        r.drawChests += sub.drawChests ?? 0;
        r.gold += sub.gold ?? 0;
        r.scrolls += sub.scrolls ?? 0;
        r.maskShards += sub.maskShards ?? 0;
        // Treasure coins only at the +20k sub-milestone (index 5), amount varies by band
        if (i === 5) r.treasureCoins += BAND_TREASURE_COINS[band];
      }
    }
  }

  // 110k+: every 10k gives 1 treasure coin, 2 chroma keys, 3 wish tokens,
  // 4 rune shovels, 4 promised shovels, 4000 gold
  if (points >= 110_000) {
    const extra = Math.floor((points - 110_000) / 10_000) + 1;
    r.treasureCoins += extra;
    r.chromaKeys += extra * 2;
    r.wishTokens += extra * 3;
    r.runeShovels += extra * 4;
    r.promisedShovels += extra * 4;
    r.gold += extra * 4_000;
  }

  return r;
}
