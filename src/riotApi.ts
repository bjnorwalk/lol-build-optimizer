export type RiotMatchSummary = {
  matchId: string;
  gameMode: string;
  queueId: number;
  championName: string;
  championId: number;
  teamPosition: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  champLevel: number;
  goldEarned: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  summonerSpells: number[];
  perks: {
    primaryStyle?: number;
    subStyle?: number;
    selected: number[];
  };
  challenges: {
    kda?: number;
    killParticipation?: number;
    damagePerMinute?: number;
    goldPerMinute?: number;
    visionScorePerMinute?: number;
  };
  gameDuration: number;
  gameCreation: number;
  items: number[];
  timeline?: {
    available: boolean;
    purchases: Array<{
      itemId: number;
      timestamp: number;
      minute: number;
    }>;
    deaths: Array<{
      timestamp: number;
      minute: number;
      killerId?: number;
      position?: {
        x: number;
        y: number;
      } | null;
    }>;
    goldByMinute: Array<{
      minute: number;
      totalGold: number;
      currentGold: number;
      level: number;
      minionsKilled: number;
      jungleMinionsKilled: number;
      position?: {
        x: number;
        y: number;
      } | null;
    }>;
    firstPurchaseMinute?: number;
    firstMajorPurchaseMinute?: number;
    earlyDeaths: number;
    totalDeathsTracked: number;
  };
};

export type RiotProfile = {
  account: {
    gameName: string;
    tagLine: string;
    puuid: string;
  };
  regionalRouting: string;
  platformRouting: string;
  summoner: {
    id?: string;
    profileIconId?: number;
    summonerLevel?: number;
    error?: string;
  };
  ranked: Array<{
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
  }> | { error: string };
  mastery: Array<{
    championId: number;
    championLevel: number;
    championPoints: number;
    lastPlayTime: number;
  }>;
  matches: RiotMatchSummary[];
  championSummary: Array<{
    championName: string;
    games: number;
    wins: number;
    winRate: number;
    roles: Record<string, number>;
  }>;
  modeSummary: Array<{
    gameMode: string;
    games: number;
    wins: number;
    losses: number;
    winRate: number;
  }>;
};

export type RiotLeaderboard = {
  queue: string;
  tier: string;
  name: string;
  entries: Array<{
    summonerId: string;
    puuid?: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    winRate: number;
    veteran: boolean;
    freshBlood: boolean;
    hotStreak: boolean;
  }>;
};

export type RiotHighEloBuilds = {
  queue: string;
  tier: string;
  platformRouting: string;
  regionalRouting: string;
  sampledPlayers: Array<{
    summonerId: string;
    puuid: string;
    leaguePoints: number;
    winRate: number;
  }>;
  sampledMatches: number;
  generatedAt: number;
  builds: Array<{
    championName: string;
    role: string;
    itemIds: number[];
    games: number;
    wins: number;
    losses: number;
    winRate: number;
    averageKda: number;
    averageDamage: number;
    averageGold: number;
    confidence: 'low' | 'medium' | 'high';
  }>;
};

export type RiotAggregateBuildData = {
  queue: string;
  tier: string;
  platformRouting: string;
  regionalRouting: string;
  sampledPlayers: Array<{
    summonerId: string;
    puuid: string;
    leaguePoints: number;
    winRate: number;
  }>;
  sampledMatches: number;
  generatedAt: number;
  source: 'riot-api-aggregate';
  totalParticipants: number;
  cacheHit?: boolean;
  rows: Array<{
    championName: string;
    championId: number;
    role: string;
    games: number;
    wins: number;
    losses: number;
    winRate: number;
    pickRate: number;
    banRate: number;
    confidence: number;
    averageDamage: number;
    averageGold: number;
    averageGameDuration: number;
    topItemSequences: Array<{ value: number[]; games: number }>;
    topRunePages: Array<{ value: number[]; games: number }>;
    topSpellPairs: Array<{ value: number[]; games: number }>;
  }>;
};

export async function fetchRiotProfile(gameName: string, tagLine: string): Promise<RiotProfile> {
  const params = new URLSearchParams({
    gameName,
    tagLine,
    count: '10'
  });
  const response = await fetch(`/api/riot/profile?${params.toString()}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || `Riot lookup failed with status ${response.status}.`);
  }

  return response.json();
}

export async function fetchLeaderboard(queue = 'RANKED_SOLO_5x5'): Promise<RiotLeaderboard> {
  const params = new URLSearchParams({ queue, limit: '10' });
  const response = await fetch(`/api/riot/leaderboard?${params.toString()}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || `Leaderboard lookup failed with status ${response.status}.`);
  }

  return response.json();
}

export async function fetchHighEloBuilds(queue = 'RANKED_SOLO_5x5'): Promise<RiotHighEloBuilds> {
  const params = new URLSearchParams({ queue, limit: '3', matchCount: '2' });
  const response = await fetch(`/api/riot/high-elo-builds?${params.toString()}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || `High-elo build lookup failed with status ${response.status}.`);
  }

  return response.json();
}

export async function fetchRiotAggregateBuildData(queue = 'RANKED_SOLO_5x5', refresh = false): Promise<RiotAggregateBuildData> {
  const params = new URLSearchParams({ queue, limit: '5', matchCount: '2' });
  if (refresh) params.set('refresh', 'true');
  const response = await fetch(`/api/riot/aggregate-builds?${params.toString()}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || `Aggregate build lookup failed with status ${response.status}.`);
  }

  return response.json();
}
