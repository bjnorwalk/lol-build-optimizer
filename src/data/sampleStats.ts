import type { Champion, Role } from '../types';
import type { RiotAggregateBuildData, RiotHighEloBuilds } from '../riotApi';
import { getSourceTierStat } from './sourceTierStats';

export type ChampionAggregateStats = {
  championName: string;
  role: Role;
  games: number;
  wins: number;
  winRate: number;
  pickRate: number;
  banRate: number;
  confidence: number;
  tier?: string;
  rank?: number;
  source: 'sample' | 'riot-high-elo' | 'estimated' | 'source-checked';
};

export const sampleChampionStats: ChampionAggregateStats[] = [
  {
    championName: 'Aurora',
    role: 'Mid',
    games: 1284,
    wins: 673,
    winRate: 52.4,
    pickRate: 6.8,
    banRate: 18.2,
    confidence: 74,
    source: 'sample'
  },
  {
    championName: 'Aphelios',
    role: 'ADC',
    games: 1612,
    wins: 806,
    winRate: 50,
    pickRate: 7.9,
    banRate: 4.1,
    confidence: 71,
    source: 'sample'
  },
  {
    championName: 'Caitlyn',
    role: 'ADC',
    games: 361302,
    wins: 176850,
    winRate: 48.94,
    pickRate: 16.2,
    banRate: 21.4,
    confidence: 96,
    source: 'sample'
  },
  {
    championName: 'Azir',
    role: 'Mid',
    games: 931,
    wins: 474,
    winRate: 50.9,
    pickRate: 3.4,
    banRate: 2.7,
    confidence: 68,
    source: 'sample'
  }
];

export function getAggregateStats(
  championName: string,
  role: Role,
  highEloBuilds?: RiotHighEloBuilds | null
): ChampionAggregateStats | undefined {
  const sourceChecked = getSourceTierStat(championName, role);
  if (sourceChecked) {
    return {
      championName,
      role,
      games: sourceChecked.matches,
      wins: Math.round((sourceChecked.winRate / 100) * sourceChecked.matches),
      winRate: sourceChecked.winRate,
      pickRate: sourceChecked.pickRate,
      banRate: sourceChecked.banRate,
      confidence: 98,
      tier: sourceChecked.tier,
      rank: sourceChecked.rank,
      source: 'source-checked'
    };
  }

  const highEloRows = highEloBuilds?.builds.filter((build) => build.championName === championName && normalizeRole(build.role) === role) ?? [];

  if (highEloRows.length) {
    const games = highEloRows.reduce((sum, build) => sum + build.games, 0);
    const wins = highEloRows.reduce((sum, build) => sum + build.wins, 0);
    return {
      championName,
      role,
      games,
      wins,
      winRate: roundPercent(wins, games),
      pickRate: Math.min(25, Math.round((games / Math.max(1, highEloBuilds?.sampledMatches ?? games)) * 1000) / 10),
      banRate: 0,
      confidence: Math.min(95, 45 + games * 8),
      source: 'riot-high-elo'
    };
  }

  return sampleChampionStats.find((entry) => entry.championName === championName && entry.role === role);
}

export function getChampionAggregateStats(
  champion: Champion,
  role: Role,
  highEloBuilds?: RiotHighEloBuilds | null,
  aggregateData?: RiotAggregateBuildData | null
): ChampionAggregateStats {
  const sourceChecked = getAggregateStats(champion.name, role, highEloBuilds);
  if (sourceChecked) return sourceChecked;

  const aggregate = aggregateData?.rows.find((row) => row.championName === champion.name && normalizeRole(row.role) === role);
  if (aggregate) {
    return {
      championName: champion.name,
      role,
      games: aggregate.games,
      wins: aggregate.wins,
      winRate: aggregate.winRate,
      pickRate: aggregate.pickRate,
      banRate: aggregate.banRate,
      confidence: aggregate.confidence,
      source: 'riot-high-elo'
    };
  }

  return createEstimatedStats(champion, role);
}

export function createEstimatedStats(champion: Champion, role: Role): ChampionAggregateStats {
  const seed = stableHash(`${champion.id}-${role}`);
  const tagBonus = champion.tags.includes('Marksman') && role === 'ADC'
    ? 0.9
    : champion.tags.includes('Support') && role === 'Support'
      ? 0.7
      : champion.tags.includes('Fighter') && role === 'Top'
        ? 0.5
        : champion.tags.includes('Mage') && role === 'Mid'
          ? 0.5
          : 0;
  const winRate = roundOne(47.4 + bucket(seed, 1, 72) / 10 + tagBonus);
  const pickBase = champion.tags.includes('Assassin') ? 5.5 : champion.tags.includes('Marksman') ? 6.8 : champion.tags.includes('Mage') ? 4.4 : 3.1;
  const pickRate = roundOne(Math.min(22, pickBase + bucket(seed, 8, 76) / 10));
  const banBase = champion.tags.includes('Assassin') ? 7.5 : champion.tags.includes('Fighter') ? 5.8 : champion.tags.includes('Tank') ? 2.4 : 3.2;
  const banRate = roundOne(Math.min(55, banBase + bucket(seed, 32, 120) / 10));
  const games = Math.round(8500 + pickRate * 8200 + (seed % 13000));
  const wins = Math.round((winRate / 100) * games);

  return {
    championName: champion.name,
    role,
    games,
    wins,
    winRate,
    pickRate,
    banRate,
    confidence: Math.min(88, Math.round(46 + games / 6000 + pickRate * 1.2)),
    source: 'estimated'
  };
}

function normalizeRole(value: string): Role | undefined {
  const normalized = value.toUpperCase();
  if (normalized === 'TOP') return 'Top';
  if (normalized === 'JUNGLE') return 'Jungle';
  if (normalized === 'MIDDLE' || normalized === 'MID') return 'Mid';
  if (normalized === 'BOTTOM' || normalized === 'ADC') return 'ADC';
  if (normalized === 'UTILITY' || normalized === 'SUPPORT') return 'Support';
  return undefined;
}

function roundPercent(wins: number, games: number) {
  return games ? Math.round((wins / games) * 1000) / 10 : 0;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function bucket(seed: number, divisor: number, size: number) {
  return Math.floor(seed / divisor) % size;
}
