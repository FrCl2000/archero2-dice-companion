import {
  PointsBreakpoints,
  PointsMilestoneReward,
  randint,
  RollDiceTaskBreakpoints,
  RollDiceTaskReward,
  weightedChoice,
} from './utils';

/**
 * Stats tracked throughout a simulation run.
 */
enum Stat {
  POINTS = 'Points',
  ROLLS_DONE = 'Rolls Done',
  INITIAL_DICE = 'Initial Dice',
  EXTRA_DICE = 'Extra Dice',
  GEMS = 'Gems',
  CHROMA = 'Chromatic Keys',
  WISHES = 'Wish Coins',
  PROMISE = 'Promise Shovels',
  OTTA = 'Otta Shards',
  GOLD = 'Gold Coins',
  DICE_FROM_TILES = 'Dice From Tiles',
  TILE = 'Tile',
}

const NUM_RUNS = 10_000;

/**
 * Tracks results of a single simulation run, including points, dice gained/spent.
 */
class SimResult {
  pointsBpMet: number = -1;
  rollDiceBpMet: number = -1;
  stats: Record<Stat, number>;

  constructor() {
    this.stats = {} as Record<Stat, number>;
    Object.values(Stat).forEach((s) => (this.stats[s] = 0));
  }

  /**
   * Add points to the simulation result and check for milestone rewards.
   * @param numPoints - Number of points gained
   */
  addPoints(numPoints: number): void {
    if (numPoints <= 0) return;
    this.stats[Stat.POINTS] += numPoints;
    let numDice = 0;

    for (let i = this.pointsBpMet + 1; i < PointsBreakpoints.length; i++) {
      const bp = PointsBreakpoints[i];
      if (this.stats[Stat.POINTS] < bp) break;
      this.pointsBpMet = i;
      numDice += PointsMilestoneReward[i];
    }
    this.stats[Stat.EXTRA_DICE] += numDice;
  }

  /**
   * Add dice rolls and check for roll-task milestone rewards.
   * @param numRolls - Number of dice rolled
   */
  addRolls(numRolls: number): void {
    if (numRolls <= 0) return;
    this.stats[Stat.ROLLS_DONE] += numRolls;

    if (this.stats[Stat.EXTRA_DICE] <= numRolls) {
      this.stats[Stat.INITIAL_DICE] += numRolls - this.stats[Stat.EXTRA_DICE];
    }
    this.stats[Stat.EXTRA_DICE] = Math.max(
      0,
      this.stats[Stat.EXTRA_DICE] - numRolls
    );

    let numDice = 0;
    for (
      let i = this.rollDiceBpMet + 1;
      i < RollDiceTaskBreakpoints.length;
      i++
    ) {
      const bp = RollDiceTaskBreakpoints[i];
      if (this.stats[Stat.ROLLS_DONE] < bp) break;
      this.rollDiceBpMet = i;
      numDice += RollDiceTaskReward[i];
    }
    this.stats[Stat.EXTRA_DICE] += numDice;
  }
}

/**
 * Abstract class representing a board tile.
 */
abstract class Tile {
  /**
   * Roll two dice and increment roll counters.
   * @param multiplier - Multiplier for rolls
   * @param result - Current simulation result
   * @returns Sum of two dice rolls
   */
  roll(multiplier: number, result: SimResult): number {
    result.addRolls(multiplier);
    return randint(1, 6) + randint(1, 6);
  }

  /**
   * Apply rewards from this tile.
   * @param multiplier - Tile multiplier
   * @param result - Current simulation result
   */
  abstract getReward(multiplier: number, result: SimResult): void;
}

/**
 * Flat reward tile (points, gems, dice).
 */
class FlatTile extends Tile {
  constructor(public points = 0, public gems = 0, public dice = 0) {
    super();
  }

  getReward(multiplier: number, result: SimResult) {
    result.addPoints(this.points * multiplier);
    result.stats[Stat.GEMS] += this.gems * multiplier;
    result.stats[Stat.EXTRA_DICE] += this.dice * multiplier;
    result.stats[Stat.DICE_FROM_TILES] += this.dice * multiplier;
  }
}

/**
 * Grand prize tile with weighted random rewards.
 */
class GrandPrizeTile extends Tile {
  getReward(multiplier: number, result: SimResult) {
    const prizes = [
      { prize: Stat.CHROMA, amount: 2 },
      { prize: Stat.WISHES, amount: 1 },
      { prize: Stat.GEMS, amount: 100 },
      { prize: Stat.PROMISE, amount: 1 },
      { prize: Stat.EXTRA_DICE, amount: 2 },
      { prize: Stat.EXTRA_DICE, amount: 1 },
    ];
    const weights = [666, 2666, 2666, 666, 666, 2666];
    const spin = weightedChoice(prizes, weights);
    if (spin.prize === Stat.EXTRA_DICE) {
      result.stats[Stat.EXTRA_DICE] += spin.amount * multiplier;
      result.stats[Stat.DICE_FROM_TILES] += spin.amount * multiplier;
    } else if (spin.prize) {
      result.stats[spin.prize] += spin.amount * multiplier;
    }
  }
}

/**
 * Point wheel tile with weighted point & multiplier outcomes.
 */
class PointWheelTile extends Tile {
  getReward(multiplier: number, result: SimResult) {
    const points = [100, 200, 500, 1000];
    const pointsWeights = [3478, 3478, 2608, 434];
    const spin = weightedChoice(points, pointsWeights);

    const multipliers = [1, 3, 5];
    const multipliersWeights = [6153, 3076, 769];
    const spin2 = weightedChoice(multipliers, multipliersWeights);

    result.addPoints(spin * spin2 * multiplier);
  }
}

/**
 * Fate wheel tile with multiple possible outcomes.
 */
class FateWheelTile extends Tile {
  getReward(multiplier: number, result: SimResult) {
    const prizes = [
      { prize: Stat.POINTS, amount: 500 },
      { prize: Stat.OTTA, amount: 2 },
      { prize: Stat.WISHES, amount: 1 },
      { prize: Stat.EXTRA_DICE, amount: 1 },
      { prize: Stat.GOLD, amount: 2000 },
    ];
    const weights = [2500, 300, 700, 1500, 5000];
    const spin = weightedChoice(prizes, weights);

    if (spin.prize === Stat.POINTS) {
      result.addPoints(spin.amount * multiplier);
    } else if (spin.prize === Stat.EXTRA_DICE) {
      result.stats[Stat.EXTRA_DICE] += spin.amount * multiplier;
      result.stats[Stat.DICE_FROM_TILES] += spin.amount * multiplier;
    } else if (spin.prize) {
      result.stats[spin.prize] += spin.amount * multiplier;
    }
  }
}

const board: Tile[] = [
  new FlatTile(400),
  new FlatTile(0, 50),
  new FlatTile(50),
  new FlatTile(400),
  new FlatTile(800),
  new FlatTile(50),
  new FlatTile(0, 0, 2),
  new FlatTile(0, 50),
  new GrandPrizeTile(),
  new FlatTile(),
  new PointWheelTile(),
  new FlatTile(50),
  new FlatTile(200),
  new FlatTile(),
  new FlatTile(0, 0, 2),
  new FlatTile(200),
  new FlatTile(800),
  new FlatTile(),
  new FlatTile(50),
  new FlatTile(200),
  new PointWheelTile(),
  new FlatTile(),
  new FateWheelTile(),
  new FlatTile(200),
];

const multiplierMap: number[] = [
  1, 1, 1, 1, 1, 1, 1, 1, 10, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 10, 10, 10, 1,
];

function remainingTurns(result: SimResult, numDiceRolls: number): number {
  return (
    numDiceRolls -
    result.stats[Stat.INITIAL_DICE] +
    result.stats[Stat.EXTRA_DICE]
  );
}

function cappedMultiplier(
  tileIndex: number,
  numTurns: number,
  rollsToBreakpoint?: number
): number {
  const baseMultiplier = multiplierMap[tileIndex];

  if (numTurns < 20 || (rollsToBreakpoint !== undefined && rollsToBreakpoint < 2)) {
    return Math.min(1, baseMultiplier);
  }
  if (numTurns < 30 || (rollsToBreakpoint !== undefined && rollsToBreakpoint < 3)) {
    return Math.min(2, baseMultiplier);
  }
  if (numTurns < 50 || (rollsToBreakpoint !== undefined && rollsToBreakpoint < 4)) {
    return Math.min(3, baseMultiplier);
  }
  if (numTurns < 100 || (rollsToBreakpoint !== undefined && rollsToBreakpoint < 6)) {
    return Math.min(5, baseMultiplier);
  }

  return baseMultiplier;
}

function playTurn(
  result: SimResult,
  numDiceRolls: number,
  rollsToBreakpoint?: number
): void {
  const numTurns = remainingTurns(result, numDiceRolls);
  const multiplier = cappedMultiplier(
    result.stats[Stat.TILE],
    numTurns,
    rollsToBreakpoint
  );

  const oldTile = board[result.stats[Stat.TILE]];
  const roll = oldTile.roll(multiplier, result);
  result.stats[Stat.TILE] = (result.stats[Stat.TILE] + roll) % board.length;

  const newTile = board[result.stats[Stat.TILE]];
  newTile.getReward(multiplier, result);
}

function createInitialResult(
  currentPoints: number,
  rollsDone: number,
  currentTile: number
): SimResult {
  const initialResult = new SimResult();

  initialResult.addRolls(rollsDone);
  initialResult.stats[Stat.EXTRA_DICE] = 0;

  initialResult.addPoints(currentPoints);
  initialResult.stats[Stat.EXTRA_DICE] = 0;

  initialResult.stats[Stat.TILE] = currentTile;
  return initialResult;
}

/**
 * Simulate going around the board starting with a specified number of dice rolls.
 *
 * @param numDiceRolls - Number of dice to start with.
 * @param pointsToMeet - Number of points to aim for. Stops early if threshold is reached.
 * @param prevRun - Previous simulation result to continue from (optional).
 * @param skipNextBp - Whether to skip checking the next breakpoint logic (optional).
 * @returns Simulation result after playing with the given parameters.
 */
function simulateSingleRun(
  numDiceRolls: number,
  pointsToMeet: number,
  prevRun: SimResult | null = null
): SimResult {
  const result = prevRun ?? new SimResult();
  while (result.stats[Stat.POINTS] < pointsToMeet && remainingTurns(result, numDiceRolls) > 0) {
    playTurn(result, numDiceRolls);
  }

  // handle "just shy of breakpoint" edge case
  if (result.rollDiceBpMet < RollDiceTaskBreakpoints.length - 1) {
    const nextDiceBp = RollDiceTaskBreakpoints[result.rollDiceBpMet + 1];
    const nextDiceBpReward = RollDiceTaskReward[result.rollDiceBpMet + 1];
    if (nextDiceBp - result.stats[Stat.ROLLS_DONE] < nextDiceBpReward) {
      let difference = nextDiceBp - result.stats[Stat.ROLLS_DONE];
      while (
        difference > 0 &&
        (result.stats[Stat.INITIAL_DICE] < numDiceRolls ||
          result.stats[Stat.EXTRA_DICE] > 0)
      ) {
        playTurn(result, numDiceRolls, difference);

        difference = nextDiceBp - result.stats[Stat.ROLLS_DONE];
      }
    }
  }

  return result;
}

/**
 * Run 10,000 simulations and calculate success rate of reaching a goal.
 *
 * @param goalPoints - The number of points to aim for.
 * @param numDice - The number of dice available.
 * @param currentPoints - Current number of points already held (default 0).
 * @param rollsDone - Number of rolls already done (default 0).
 * @param currentTile - The current tile index (default 0).
 * @returns Success rate (%) of hitting the goal points.
 */
export function calculateSuccessRate(
  goalPoints: number,
  numDice: number,
  currentPoints = 0,
  rollsDone = 0,
  currentTile = 0
): number {
  let numSuccess = 0;

  for (let i = 0; i < NUM_RUNS; i++) {
    const initialResult = createInitialResult(currentPoints, rollsDone, currentTile);

    const run = simulateSingleRun(numDice + rollsDone, Infinity, initialResult);

    if (run.stats[Stat.POINTS] >= goalPoints) {
      numSuccess++;
    }
  }

  const successRate =
    ((numSuccess === NUM_RUNS ? NUM_RUNS - 1 : numSuccess) / NUM_RUNS) * 100;

  return successRate;
}

/**
 * Find the number of dice needed to reach a goal with a given success rate.
 * Kept for use in run_simulate.ts and other callers that only need the dice count.
 *
 * @param goalPoints - Points target to reach.
 * @param successRate - Desired success rate (e.g., 99.99).
 * @returns Number of initial dice corresponding to that success rate.
 */
export function findDiceForSuccessRate(
  goalPoints: number,
  successRate: number
): number {
  return findDiceAndRewards(goalPoints, successRate).dice;
}

/**
 * Average rolling rewards earned from board tiles across simulations.
 * These are rewards received by landing on tiles (not from point milestones).
 */
export type RollingRewards = {
  gems: number;
  chromaKeys: number;
  wishCoins: number;
  promiseShovels: number;
  ottaShards: number;
  goldCoins: number;
  diceFromTiles: number;
};

/**
 * Run NUM_RUNS simulations and return both the dice needed (at the given success
 * rate percentile) and the average rolling rewards — all from a single simulation
 * loop. Each run uses unlimited dice and stops as soon as goalPoints is reached,
 * so rolling rewards represent what a player earns on the way to their goal.
 *
 * @param goalPoints - Points target; each run stops when this is reached.
 * @param successRate - Desired success rate (e.g., 98.69).
 * @returns Dice count at the requested percentile and average rolling rewards.
 */
export function findDiceAndRewards(
  goalPoints: number,
  successRate: number
): { dice: number; rollingRewards: RollingRewards } {
  const diceResults: number[] = [];
  const totals = {
    gems: 0, chromaKeys: 0, wishCoins: 0,
    promiseShovels: 0, ottaShards: 0, goldCoins: 0, diceFromTiles: 0,
  };

  for (let i = 0; i < NUM_RUNS; i++) {
    const run = simulateSingleRun(Infinity, goalPoints);
    diceResults.push(run.stats[Stat.INITIAL_DICE]);
    totals.gems += run.stats[Stat.GEMS];
    totals.chromaKeys += run.stats[Stat.CHROMA];
    totals.wishCoins += run.stats[Stat.WISHES];
    totals.promiseShovels += run.stats[Stat.PROMISE];
    totals.ottaShards += run.stats[Stat.OTTA];
    totals.goldCoins += run.stats[Stat.GOLD];
    totals.diceFromTiles += run.stats[Stat.DICE_FROM_TILES];
  }

  // sort by dice used ascending to find the percentile
  diceResults.sort((a, b) => a - b);
  const rate = Math.max(0, Math.min(100, successRate));
  const index = Math.floor((rate / 100) * NUM_RUNS) - 1;
  const dice = index < 0 ? 0 : diceResults[index];

  const round1dp = (n: number) => Math.round((n / NUM_RUNS) * 10) / 10;

  return {
    dice,
    rollingRewards: {
      gems: round1dp(totals.gems),
      chromaKeys: round1dp(totals.chromaKeys),
      wishCoins: round1dp(totals.wishCoins),
      promiseShovels: round1dp(totals.promiseShovels),
      ottaShards: round1dp(totals.ottaShards),
      goldCoins: round1dp(totals.goldCoins),
      diceFromTiles: round1dp(totals.diceFromTiles),
    },
  };
}
