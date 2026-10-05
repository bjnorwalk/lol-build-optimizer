import type { BuildRecommendation, Champion, ChampionDetails, GameState, Recommendation, Role } from '../types';
import type { ChampionAggregateStats } from './sampleStats';
import type { SourceCheckedBuild } from './sourceBuilds';

export type RankBracket = 'All Ranks' | 'Iron-Gold' | 'Platinum-Emerald' | 'Diamond+' | 'Master+';
export type DataRegion = 'Global' | 'NA' | 'EUW' | 'KR' | 'BR' | 'LAS' | 'LAN' | 'OCE' | 'TR' | 'JP';
export type GameLengthFilter = 'All Lengths' | 'Short < 25' | 'Medium 25-35' | 'Long 35+';

export type GuideFilters = {
  rank: RankBracket;
  region: DataRegion;
  gameLength: GameLengthFilter;
};

export type GeneratedGuide = {
  skillOrder: string[];
  maxOrder: string[];
  levelOne: string;
  levelTwo: string;
  skillNotes: string[];
  buildStats: {
    sampleSize: string;
    confidence: number;
    tier?: string;
    rank?: number;
    winRate: string;
    pickRate: string;
    banRate: string;
    filterSummary: string;
  };
  variants: Array<{
    title: string;
    items: Recommendation[];
    note: string;
  }>;
  decisionTree: string[];
  timeline: Array<{
    phase: string;
    timing: string;
    note: string;
  }>;
  runeExplanations: string[];
  matchupTips: string[];
};

export const rankBrackets: RankBracket[] = ['All Ranks', 'Iron-Gold', 'Platinum-Emerald', 'Diamond+', 'Master+'];
export const dataRegions: DataRegion[] = ['Global', 'NA', 'EUW', 'KR', 'BR', 'LAS', 'LAN', 'OCE', 'TR', 'JP'];
export const gameLengthFilters: GameLengthFilter[] = ['All Lengths', 'Short < 25', 'Medium 25-35', 'Long 35+'];

// This generator is the bridge between the current rule-based app and the future Riot
// analytics pipeline. Every field is shaped like real aggregate data, so the UI can
// stay stable while placeholder confidence/win-rate values are replaced by stored
// high-elo match statistics later.
export function createChampionGuide(options: {
  champion: Champion;
  details: ChampionDetails | null;
  role: Role;
  gameState: GameState;
  enemies: Champion[];
  recommendations: BuildRecommendation;
  sourceCheckedBuild?: SourceCheckedBuild;
  aggregateStats?: ChampionAggregateStats;
  filters: GuideFilters;
}): GeneratedGuide {
  const maxOrder = options.sourceCheckedBuild?.skillOrder
    ? [
        options.sourceCheckedBuild.skillOrder.maxFirst,
        options.sourceCheckedBuild.skillOrder.maxSecond,
        options.sourceCheckedBuild.skillOrder.maxThird
      ]
    : inferMaxOrder(options.champion, options.role);
  const skillOrder = createLevelOrder(maxOrder);
  const sourceChecked = Boolean(options.sourceCheckedBuild);
  const aggregate = options.aggregateStats;
  const coreItems = [...options.recommendations.core, ...options.recommendations.late];
  const enemyNames = options.enemies.map((enemy) => enemy.name);

  return {
    skillOrder,
    maxOrder,
    levelOne: skillOrder[0],
    levelTwo: skillOrder[1],
    skillNotes: createSkillNotes(options.details, maxOrder, options.role),
    buildStats: {
      sampleSize: aggregate ? `${aggregate.games.toLocaleString()} games / ${aggregate.source}` : sourceChecked ? 'Source-checked guide' : 'Generated from archetype coverage',
      confidence: aggregate ? aggregate.confidence : sourceChecked ? 82 : 48,
      tier: aggregate?.tier,
      rank: aggregate?.rank,
      winRate: aggregate ? `${aggregate.winRate}%` : sourceChecked ? 'Pending high-elo aggregation' : 'Needs sample data',
      pickRate: aggregate ? `${aggregate.pickRate}%` : 'Pending Riot ingestion',
      banRate: aggregate ? (aggregate.banRate ? `${aggregate.banRate}%` : 'Needs ban sample') : 'Pending Riot ingestion',
      filterSummary: `${options.filters.rank} / ${options.filters.region} / ${options.filters.gameLength}`
    },
    variants: [
      {
        title: 'Meta Build',
        items: coreItems.slice(0, 3),
        note: sourceChecked ? 'Primary source-checked path for this patch.' : 'Best generated baseline until source review is complete.'
      },
      // Build variants intentionally reuse scored recommendation buckets instead of
      // hard-coded item names. That keeps every champion covered, even before a
      // champion has a manually source-checked profile.
      {
        title: 'Ahead',
        items: [...options.recommendations.core, ...options.recommendations.situational].filter((entry) => entry.reasons.some((reason) => reason.includes('snowball'))).slice(0, 3),
        note: 'Favor damage, tempo, and item spikes that convert your lead into objectives.'
      },
      {
        title: 'Behind',
        items: [...options.recommendations.late, ...options.recommendations.situational].filter((entry) => entry.reasons.some((reason) => reason.includes('safe') || reason.includes('defensive') || reason.includes('burst'))).slice(0, 3),
        note: 'Prioritize survival, cheaper components, and items that let you keep farming.'
      },
      {
        title: 'Versus Draft',
        items: options.recommendations.situational.slice(0, 3),
        note: enemyNames.length ? `Adapted for ${enemyNames.join(', ')}.` : 'Select enemy champions to generate draft-specific swaps.'
      }
    ],
    decisionTree: createDecisionTree(options.recommendations.detectedThreats, options.gameState),
    timeline: createTimeline(options.role, options.gameState),
    runeExplanations: createRuneExplanations(options.sourceCheckedBuild),
    matchupTips: createMatchupTips(options.champion, options.enemies, maxOrder)
  };
}

// Skill order is currently inferred from champion tags plus a few important overrides.
// The function stays small and deterministic so replacing it with Riot timeline-derived
// skill-order frequency later will be straightforward.
function inferMaxOrder(champion: Champion, role: Role) {
  if (champion.id === 'Azir') return ['W', 'Q', 'E'];
  if (champion.id === 'Caitlyn') return ['Q', 'W', 'E'];
  if (champion.id === 'Lux') return ['E', 'Q', 'W'];
  if (champion.id === 'Soraka') return ['W', 'Q', 'E'];
  if (role === 'Support' && champion.tags.includes('Support')) return ['W', 'E', 'Q'];
  if (champion.tags.includes('Tank') && role === 'Support') return ['Q', 'E', 'W'];
  if (champion.tags.includes('Marksman')) return ['Q', 'W', 'E'];
  if (champion.tags.includes('Mage')) return ['Q', 'E', 'W'];
  if (champion.tags.includes('Assassin')) return ['Q', 'E', 'W'];
  if (champion.tags.includes('Fighter')) return ['Q', 'E', 'W'];
  return ['Q', 'W', 'E'];
}

// League skill orders are easiest to read when shown level-by-level. This creates a
// standard max pattern with ultimate ranks at 6/11/16.
function createLevelOrder(maxOrder: string[]) {
  const [first, second, third] = maxOrder;
  return [first, second, third, first, first, 'R', first, second, first, second, 'R', second, second, third, third, 'R', third, third];
}

// These notes explain the generated order in plain English and include live Data Dragon
// spell names when champion detail data has already loaded.
function createSkillNotes(details: ChampionDetails | null, maxOrder: string[], role: Role) {
  const firstMax = abilityName(details, maxOrder[0]);
  const secondMax = abilityName(details, maxOrder[1]);
  const thirdMax = abilityName(details, maxOrder[2]);

  return [
    `Max ${maxOrder[0]} first for the most reliable ${role} trading and wave-control pattern${firstMax ? ` through ${firstMax}` : ''}.`,
    `Max ${maxOrder[1]} second when fights start lasting longer${secondMax ? ` and ${secondMax} gains more uptime` : ''}.`,
    `Leave ${maxOrder[2]} for last unless the matchup demands early safety${thirdMax ? ` from ${thirdMax}` : ''}.`,
    'Take R at levels 6, 11, and 16 whenever available.'
  ];
}

function abilityName(details: ChampionDetails | null, key: string) {
  return details?.spells.find((spell) => spell.key === key)?.name;
}

// The decision tree is deliberately rule-based: it tells the player what condition
// changes the build, instead of just showing another static item row.
function createDecisionTree(threats: string[], gameState: GameState) {
  const rows = [
    'If enemy healing is meaningful, slot anti-heal before your fourth completed item.',
    'If enemy frontline is stacking resistances, prioritize penetration before luxury damage.',
    'If assassins can reach you, delay greed items for a defensive option or stasis effect.'
  ];

  if (threats.includes('healing')) rows.unshift('Healing detected: Grievous Wounds becomes a real purchase, not a last-item afterthought.');
  if (threats.includes('tanks')) rows.unshift('Tank threat detected: move armor/magic penetration earlier in the build.');
  if (threats.includes('assassins')) rows.unshift('Assassin threat detected: value range, peel, shields, stasis, or health sooner.');
  if (gameState === 'Ahead') rows.push('Ahead state: buy tempo and damage if you can force dragons, towers, or Baron setup.');
  if (gameState === 'Behind') rows.push('Behind state: buy cheaper components and defensive breakpoints before expensive finishers.');

  return [...new Set(rows)].slice(0, 6);
}

// Timeline guidance gives the app a differentiator versus ordinary build sites:
// it frames items as game phases, recall windows, and objective pressure.
function createTimeline(role: Role, gameState: GameState) {
  return [
    {
      phase: 'Early',
      timing: '0-8 min',
      note: role === 'Jungle' ? 'Clear efficiently, track lane priority, and recall on your first component.' : 'Play for level 2/3 priority and recall on a clean component breakpoint.'
    },
    {
      phase: 'First Spike',
      timing: '8-14 min',
      note: 'Your first completed item should convert into plates, dragon setup, Herald, or a forced reset.'
    },
    {
      phase: 'Mid Game',
      timing: '14-25 min',
      note: 'Group around completed second item, avoid low-value side fights, and spend gold before objective timers.'
    },
    {
      phase: 'Late',
      timing: '25+ min',
      note: gameState === 'Behind' ? 'Protect shutdowns, buy safety, and play around vision traps.' : 'Use your item lead to force Baron, Elder setup, or decisive tower pressure.'
    }
  ];
}

// Source-checked builds can explain exact rune pages now. Generated profiles make the
// missing-data state explicit so the app never pretends a guessed rune page is verified.
function createRuneExplanations(build?: SourceCheckedBuild) {
  if (!build) {
    return ['Rune page needs source review. Use the source links to confirm keystone, secondary tree, and shards for this role.'];
  }

  return [
    `${build.runes.primary[0]} is the keystone because it best supports the main trading pattern for this build.`,
    `${build.runes.primaryTree} primary gives the highest value combat stats for the recommended role.`,
    `${build.runes.secondaryTree} secondary covers lane consistency and scaling needs.`,
    `${build.runes.shards.join(' / ')} are the default shards; adjust the defensive shard into heavy AD/AP lanes.`
  ];
}

// Matchup tips combine the selected enemy draft with generic champion tags. This is a
// lightweight stand-in for a future matchup table keyed by champion, lane, patch, and rank.
function createMatchupTips(champion: Champion, enemies: Champion[], maxOrder: string[]) {
  const tips = [
    `Your first-max ability is ${maxOrder[0]}; build lane plans around its cooldown and range.`,
    'If your lane opponent outranges you, trade only when their key spell is down.',
    'If your lane opponent has all-in pressure, preserve mobility/CC until they commit.'
  ];

  enemies.slice(0, 3).forEach((enemy) => {
    if (enemy.tags.includes('Assassin')) tips.push(`${enemy.name}: respect burst windows and avoid spending defensive cooldowns for poke.`);
    if (enemy.tags.includes('Tank')) tips.push(`${enemy.name}: expect armor/MR purchases and plan penetration earlier.`);
    if (enemy.tags.includes('Mage')) tips.push(`${enemy.name}: dodge first, trade second; poke lanes punish forced recalls.`);
  });

  if (champion.tags.includes('Marksman')) tips.push('As a marksman, preserve spacing first; damage only matters if you can keep auto-attacking.');
  if (champion.tags.includes('Tank')) tips.push('As a tank, your build value spikes when you force fights around your team, not isolated trades.');

  return [...new Set(tips)].slice(0, 7);
}
