import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const env = loadEnv();
const apiKey = env.RIOT_API_KEY;
const regionalRouting = env.RIOT_REGIONAL_ROUTING || 'americas';
const platformRouting = env.RIOT_PLATFORM_ROUTING || 'na1';
const port = Number(env.RIOT_PROXY_PORT || 8787);
const aggregateCachePath = resolve(process.cwd(), 'server/data/aggregateBuilds.json');
const allowedOrigins = (env.RIOT_ALLOWED_ORIGINS || 'http://127.0.0.1:5174,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const clientRequestLog = new Map();
const proxyWindowMs = Number(env.RIOT_PROXY_RATE_WINDOW_MS || 120000);
const proxyMaxRequests = Number(env.RIOT_PROXY_RATE_MAX || 90);

if (!apiKey) {
  console.error('RIOT_API_KEY is missing. Add it to .env before starting the API server.');
  process.exit(1);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
    const origin = request.headers.origin || '';
    const clientId = request.socket.remoteAddress || 'local';

    if (request.method === 'OPTIONS') {
      sendJson(request, response, 204, {});
      return;
    }

    if (origin && !allowedOrigins.includes(origin)) {
      sendJson(request, response, 403, { error: 'Origin is not allowed for this Riot API proxy.' });
      return;
    }

    if (!consumeProxyBudget(clientId)) {
      sendJson(request, response, 429, {
        error: 'Local Riot proxy rate limit hit. Wait briefly before making more Riot API requests.'
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/riot/profile') {
      const gameName = url.searchParams.get('gameName');
      const tagLine = url.searchParams.get('tagLine');
      const count = clamp(Number(url.searchParams.get('count') || 10), 1, 10);

      if (!gameName || !tagLine) {
        sendJson(request, response, 400, { error: 'gameName and tagLine are required.' });
        return;
      }

      if (!isSafeRiotIdPart(gameName) || !isSafeRiotIdPart(tagLine)) {
        sendJson(request, response, 400, { error: 'Riot ID contains unsupported characters.' });
        return;
      }

      const profile = await getProfile(gameName, tagLine, count);
      sendJson(request, response, 200, profile, { privateData: true });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/riot/leaderboard') {
      const queue = url.searchParams.get('queue') || 'RANKED_SOLO_5x5';
      const limit = clamp(Number(url.searchParams.get('limit') || 10), 1, 25);
      const leaderboard = await getLeaderboard(queue, limit);
      sendJson(request, response, 200, leaderboard);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/riot/high-elo-builds') {
      const queue = url.searchParams.get('queue') || 'RANKED_SOLO_5x5';
      const limit = clamp(Number(url.searchParams.get('limit') || 3), 1, 5);
      const matchCount = clamp(Number(url.searchParams.get('matchCount') || 2), 1, 3);
      const builds = await getHighEloBuilds(queue, limit, matchCount);
      sendJson(request, response, 200, builds);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/riot/aggregate-builds') {
      const queue = url.searchParams.get('queue') || 'RANKED_SOLO_5x5';
      const limit = clamp(Number(url.searchParams.get('limit') || 5), 1, 10);
      const matchCount = clamp(Number(url.searchParams.get('matchCount') || 2), 1, 5);
      const refresh = url.searchParams.get('refresh') === 'true';
      const aggregate = await getAggregateBuildData(queue, limit, matchCount, refresh);
      sendJson(request, response, 200, aggregate);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/health') {
      sendJson(request, response, 200, {
        ok: true,
        regionalRouting,
        platformRouting,
        allowedOrigins,
        apiKeyInBrowser: false,
        policy: {
          keyStorage: 'server-env-only',
          cacheControl: 'private profile responses are no-store',
          localRateLimit: `${proxyMaxRequests} requests per ${Math.round(proxyWindowMs / 1000)} seconds per client`
        }
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/riot/compliance') {
      sendJson(request, response, 200, {
        product: 'RiftGuide',
        apiKeyHandling: 'RIOT_API_KEY is read only by the local Node proxy and is never sent to the Vite client.',
        allowedOrigins,
        personalData: [
          'Riot ID entered by user',
          'PUUID returned by Riot',
          'recent match summaries and timelines requested by the user'
        ],
        retention: 'Profile data is held in browser memory for the current session unless the user explicitly saves local build notes.',
        visibleDisclosure: 'Footer disclaimer states Riot non-endorsement and server-side key handling.',
        gameIntegrity: 'The web app presents static build, rune, item, and post-game review data; it does not automate gameplay or track hidden players.'
      });
      return;
    }

    sendJson(request, response, 404, { error: 'Not found.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected Riot API error.';
    sendJson(request, response, 500, { error: message });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Riot API proxy listening on http://127.0.0.1:${port}`);
});

async function getProfile(gameName, tagLine, count) {
  const account = await riotFetch(
    `https://${regionalRouting}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );
  const matchIds = await riotFetch(
    `https://${regionalRouting}.api.riotgames.com/lol/match/v5/matches/by-puuid/${account.puuid}/ids?start=0&count=${count}`
  );
  const [matches, summoner, mastery] = await Promise.all([
    Promise.all(matchIds.map((matchId) => getMatchSummary(matchId, account.puuid))),
    getSummoner(account.puuid).catch((error) => ({ error: error.message })),
    getChampionMastery(account.puuid).catch(() => [])
  ]);
  const ranked = summoner.id ? await getRankedEntries(summoner.id).catch((error) => ({ error: error.message })) : [];

  return {
    account: {
      gameName: account.gameName,
      tagLine: account.tagLine,
      puuid: account.puuid
    },
    regionalRouting,
    platformRouting,
    summoner,
    ranked,
    mastery,
    matches,
    championSummary: summarizeChampions(matches),
    modeSummary: summarizeModes(matches)
  };
}

async function getSummoner(puuid) {
  return riotFetch(`https://${platformRouting}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`);
}

async function getSummonerById(encryptedSummonerId) {
  return riotFetch(`https://${platformRouting}.api.riotgames.com/lol/summoner/v4/summoners/${encodeURIComponent(encryptedSummonerId)}`);
}

async function getRankedEntries(encryptedSummonerId) {
  return riotFetch(`https://${platformRouting}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encodeURIComponent(encryptedSummonerId)}`);
}

async function getChampionMastery(puuid) {
  const rows = await riotFetch(`https://${platformRouting}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(puuid)}/top?count=8`);
  return rows.map((entry) => ({
    championId: entry.championId,
    championLevel: entry.championLevel,
    championPoints: entry.championPoints,
    lastPlayTime: entry.lastPlayTime
  }));
}

async function getLeaderboard(queue, limit) {
  const payload = await riotFetch(`https://${platformRouting}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${encodeURIComponent(queue)}`);
  return {
    queue: payload.queue,
    tier: payload.tier,
    name: payload.name,
    entries: payload.entries
      .sort((a, b) => b.leaguePoints - a.leaguePoints)
      .slice(0, limit)
      .map((entry) => ({
        summonerId: entry.summonerId || entry.puuid,
        puuid: entry.puuid,
        leaguePoints: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses,
        winRate: winRate(entry.wins, entry.losses),
        veteran: entry.veteran,
        freshBlood: entry.freshBlood,
        hotStreak: entry.hotStreak
      }))
  };
}

async function getHighEloBuilds(queue, limit, matchCount) {
  const leaderboard = await getLeaderboard(queue, limit);
  const sampledPlayers = [];
  const matchIds = new Set();

  for (const entry of leaderboard.entries.slice(0, limit)) {
    try {
      const puuid = entry.puuid || (await getSummonerById(entry.summonerId)).puuid;
      sampledPlayers.push({
        summonerId: entry.summonerId,
        puuid,
        leaguePoints: entry.leaguePoints,
        winRate: entry.winRate
      });
      const ids = await riotFetch(
        `https://${regionalRouting}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?queue=420&start=0&count=${matchCount}`
      );
      ids.forEach((id) => matchIds.add(id));
    } catch {
      // Keep the aggregate preview resilient when one ladder entry fails or has hidden data.
    }
  }

  const matches = await Promise.all(
    [...matchIds].slice(0, limit * matchCount).map((matchId) =>
      riotFetch(`https://${regionalRouting}.api.riotgames.com/lol/match/v5/matches/${matchId}`).catch(() => null)
    )
  );
  const aggregate = aggregateHighEloMatches(matches.filter(Boolean));

  return {
    queue,
    tier: leaderboard.tier,
    platformRouting,
    regionalRouting,
    sampledPlayers,
    sampledMatches: matches.filter(Boolean).length,
    generatedAt: Date.now(),
    builds: aggregate.slice(0, 12)
  };
}

async function getAggregateBuildData(queue, limit, matchCount, refresh) {
  if (!refresh && existsSync(aggregateCachePath)) {
    const cached = JSON.parse(readFileSync(aggregateCachePath, 'utf8'));
    return { ...cached, cacheHit: true };
  }

  const leaderboard = await getLeaderboard(queue, limit);
  const sampledPlayers = [];
  const matchIds = new Set();

  for (const entry of leaderboard.entries.slice(0, limit)) {
    try {
      const puuid = entry.puuid || (await getSummonerById(entry.summonerId)).puuid;
      sampledPlayers.push({
        summonerId: entry.summonerId,
        puuid,
        leaguePoints: entry.leaguePoints,
        winRate: entry.winRate
      });
      const ids = await riotFetch(
        `https://${regionalRouting}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?queue=420&start=0&count=${matchCount}`
      );
      ids.forEach((id) => matchIds.add(id));
    } catch {
      // Keep the ingestion job moving when a player has hidden or unavailable data.
    }
  }

  const rawMatches = await Promise.all(
    [...matchIds].slice(0, limit * matchCount).map((matchId) =>
      riotFetch(`https://${regionalRouting}.api.riotgames.com/lol/match/v5/matches/${matchId}`).catch(() => null)
    )
  );
  const matches = rawMatches.filter(Boolean);
  const aggregate = aggregateAuthoritativeMatches(matches, {
    queue,
    tier: leaderboard.tier,
    platformRouting,
    regionalRouting,
    sampledPlayers,
    sampledMatches: matches.length,
    generatedAt: Date.now()
  });

  mkdirSync(dirname(aggregateCachePath), { recursive: true });
  writeFileSync(aggregateCachePath, JSON.stringify(aggregate, null, 2));

  return { ...aggregate, cacheHit: false };
}

function aggregateAuthoritativeMatches(matches, meta) {
  const championRoleRows = new Map();
  const totalParticipants = matches.reduce((sum, match) => sum + (match.info?.participants?.length ?? 0), 0);

  matches.forEach((match) => {
    const bansByChampion = new Map();
    (match.info?.teams ?? []).forEach((team) => {
      (team.bans ?? []).forEach((ban) => {
        if (ban.championId && ban.championId > 0) bansByChampion.set(ban.championId, (bansByChampion.get(ban.championId) ?? 0) + 1);
      });
    });

    (match.info?.participants ?? []).forEach((participant) => {
      const role = normalizeTeamPosition(participant.teamPosition || participant.individualPosition);
      if (!role || !participant.championName) return;

      const key = `${participant.championName}|${role}`;
      const current = championRoleRows.get(key) ?? {
        championName: participant.championName,
        championId: participant.championId,
        role,
        games: 0,
        wins: 0,
        bans: 0,
        itemSequences: new Map(),
        runePages: new Map(),
        spellPairs: new Map(),
        skillOrders: new Map(),
        totalDamage: 0,
        totalGold: 0,
        totalDuration: 0
      };
      const itemIds = [
        participant.item0,
        participant.item1,
        participant.item2,
        participant.item3,
        participant.item4,
        participant.item5
      ].filter((itemId) => itemId && itemId > 0).slice(0, 6);
      const runeIds = participant.perks?.styles?.flatMap((style) => style.selections.map((selection) => selection.perk)) ?? [];
      const spellIds = [participant.summoner1Id, participant.summoner2Id].filter(Boolean).sort((a, b) => a - b);

      current.games += 1;
      if (participant.win) current.wins += 1;
      current.bans += bansByChampion.get(participant.championId) ?? 0;
      current.totalDamage += participant.totalDamageDealtToChampions ?? 0;
      current.totalGold += participant.goldEarned ?? 0;
      current.totalDuration += match.info?.gameDuration ?? 0;
      incrementCounter(current.itemSequences, itemIds.join('-'));
      incrementCounter(current.runePages, runeIds.join('-'));
      incrementCounter(current.spellPairs, spellIds.join('-'));
      championRoleRows.set(key, current);
    });
  });

  const rows = [...championRoleRows.values()].map((row) => ({
    championName: row.championName,
    championId: row.championId,
    role: row.role,
    games: row.games,
    wins: row.wins,
    losses: row.games - row.wins,
    winRate: winRate(row.wins, row.games - row.wins),
    pickRate: totalParticipants ? Number(((row.games / totalParticipants) * 100).toFixed(1)) : 0,
    banRate: matches.length ? Number(((row.bans / matches.length) * 100).toFixed(1)) : 0,
    confidence: confidenceFromGames(row.games),
    averageDamage: Math.round(row.totalDamage / Math.max(1, row.games)),
    averageGold: Math.round(row.totalGold / Math.max(1, row.games)),
    averageGameDuration: Math.round(row.totalDuration / Math.max(1, row.games)),
    topItemSequences: topCounterRows(row.itemSequences, 3, (value) => value.split('-').filter(Boolean).map(Number)),
    topRunePages: topCounterRows(row.runePages, 3, (value) => value.split('-').filter(Boolean).map(Number)),
    topSpellPairs: topCounterRows(row.spellPairs, 3, (value) => value.split('-').filter(Boolean).map(Number))
  })).sort((a, b) => b.games - a.games || b.winRate - a.winRate);

  return {
    ...meta,
    source: 'riot-api-aggregate',
    totalParticipants,
    rows
  };
}

function incrementCounter(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + 1);
}

function topCounterRows(map, limit, parseValue) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, games]) => ({ value: parseValue(value), games }));
}

function normalizeTeamPosition(position) {
  if (position === 'TOP') return 'Top';
  if (position === 'JUNGLE') return 'Jungle';
  if (position === 'MIDDLE') return 'Mid';
  if (position === 'BOTTOM') return 'ADC';
  if (position === 'UTILITY') return 'Support';
  return undefined;
}

function confidenceFromGames(games) {
  if (games >= 50) return 95;
  if (games >= 25) return 82;
  if (games >= 10) return 68;
  if (games >= 5) return 56;
  return 44;
}

function aggregateHighEloMatches(matches) {
  const rows = new Map();

  matches.forEach((match) => {
    (match.info?.participants ?? []).forEach((participant) => {
      const role = participant.teamPosition || participant.individualPosition || 'UNKNOWN';
      const items = [
        participant.item0,
        participant.item1,
        participant.item2,
        participant.item3,
        participant.item4,
        participant.item5
      ].filter((itemId) => itemId && itemId > 0);
      if (!participant.championName || role === 'UNKNOWN' || items.length < 2) return;

      const coreItems = items.slice(0, 3);
      const key = `${participant.championName}|${role}|${coreItems.join('-')}`;
      const current = rows.get(key) ?? {
        championName: participant.championName,
        role,
        itemIds: coreItems,
        games: 0,
        wins: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalAssists: 0,
        totalDamage: 0,
        totalGold: 0
      };

      current.games += 1;
      if (participant.win) current.wins += 1;
      current.totalKills += participant.kills ?? 0;
      current.totalDeaths += participant.deaths ?? 0;
      current.totalAssists += participant.assists ?? 0;
      current.totalDamage += participant.totalDamageDealtToChampions ?? 0;
      current.totalGold += participant.goldEarned ?? 0;
      rows.set(key, current);
    });
  });

  return [...rows.values()]
    .map((row) => ({
      championName: row.championName,
      role: row.role,
      itemIds: row.itemIds,
      games: row.games,
      wins: row.wins,
      losses: row.games - row.wins,
      winRate: winRate(row.wins, row.games - row.wins),
      averageKda: Number(((row.totalKills + row.totalAssists) / Math.max(1, row.totalDeaths)).toFixed(2)),
      averageDamage: Math.round(row.totalDamage / Math.max(1, row.games)),
      averageGold: Math.round(row.totalGold / Math.max(1, row.games)),
      confidence: row.games >= 5 ? 'medium' : 'low'
    }))
    .sort((a, b) => b.games - a.games || b.winRate - a.winRate);
}

async function getMatchSummary(matchId, puuid) {
  const [match, timeline] = await Promise.all([
    riotFetch(`https://${regionalRouting}.api.riotgames.com/lol/match/v5/matches/${matchId}`),
    riotFetch(`https://${regionalRouting}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`).catch(() => null)
  ]);
  const participant = match.info.participants.find((entry) => entry.puuid === puuid);

  if (!participant) {
    return { matchId, error: 'Player not found in match.' };
  }

  const timelineAudit = timeline ? summarizeTimeline(timeline, participant.participantId) : emptyTimelineAudit();

  return {
    matchId,
    gameMode: match.info.gameMode,
    queueId: match.info.queueId,
    championName: participant.championName,
    championId: participant.championId,
    teamPosition: participant.teamPosition || participant.individualPosition || 'UNKNOWN',
    win: participant.win,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    champLevel: participant.champLevel,
    goldEarned: participant.goldEarned,
    totalMinionsKilled: participant.totalMinionsKilled,
    neutralMinionsKilled: participant.neutralMinionsKilled,
    totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
    totalDamageTaken: participant.totalDamageTaken,
    visionScore: participant.visionScore,
    wardsPlaced: participant.wardsPlaced,
    wardsKilled: participant.wardsKilled,
    summonerSpells: [participant.summoner1Id, participant.summoner2Id].filter(Boolean),
    perks: {
      primaryStyle: participant.perks?.styles?.[0]?.style,
      subStyle: participant.perks?.styles?.[1]?.style,
      selected: participant.perks?.styles?.flatMap((style) => style.selections.map((selection) => selection.perk)) ?? []
    },
    challenges: {
      kda: participant.challenges?.kda,
      killParticipation: participant.challenges?.killParticipation,
      damagePerMinute: participant.challenges?.damagePerMinute,
      goldPerMinute: participant.challenges?.goldPerMinute,
      visionScorePerMinute: participant.challenges?.visionScorePerMinute
    },
    gameDuration: match.info.gameDuration,
    gameCreation: match.info.gameCreation,
    items: [
      participant.item0,
      participant.item1,
      participant.item2,
      participant.item3,
      participant.item4,
      participant.item5,
      participant.item6
    ].filter((itemId) => itemId && itemId > 0),
    timeline: timelineAudit
  };
}

function summarizeTimeline(timeline, participantId) {
  const purchases = [];
  const deaths = [];
  const goldByMinute = [];
  const frames = timeline.info?.frames ?? [];

  frames.forEach((frame) => {
    const participantFrame = frame.participantFrames?.[participantId];
    if (participantFrame) {
      goldByMinute.push({
        minute: Math.round((frame.timestamp ?? 0) / 60000),
        totalGold: participantFrame.totalGold ?? 0,
        currentGold: participantFrame.currentGold ?? 0,
        level: participantFrame.level ?? 0,
        minionsKilled: participantFrame.minionsKilled ?? 0,
        jungleMinionsKilled: participantFrame.jungleMinionsKilled ?? 0,
        position: participantFrame.position ?? null
      });
    }

    (frame.events ?? []).forEach((event) => {
      if (event.participantId === participantId && event.type === 'ITEM_PURCHASED') {
        purchases.push({
          itemId: event.itemId,
          timestamp: event.timestamp,
          minute: Math.round((event.timestamp ?? 0) / 60000)
        });
      }

      if (event.victimId === participantId && event.type === 'CHAMPION_KILL') {
        deaths.push({
          timestamp: event.timestamp,
          minute: Math.round((event.timestamp ?? 0) / 60000),
          killerId: event.killerId,
          position: event.position ?? null
        });
      }
    });
  });

  return {
    available: true,
    purchases,
    deaths,
    goldByMinute,
    firstPurchaseMinute: purchases[0]?.minute,
    firstMajorPurchaseMinute: purchases.find((purchase) => purchase.minute >= 5)?.minute,
    earlyDeaths: deaths.filter((death) => death.minute <= 14).length,
    totalDeathsTracked: deaths.length
  };
}

function emptyTimelineAudit() {
  return {
    available: false,
    purchases: [],
    deaths: [],
    goldByMinute: [],
    earlyDeaths: 0,
    totalDeathsTracked: 0
  };
}

async function riotFetch(url) {
  const response = await fetch(url, {
    headers: {
      'X-Riot-Token': apiKey
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(readableRiotError(response.status, text || response.statusText));
  }

  return response.json();
}

function readableRiotError(status, text) {
  if (status === 401 || status === 403) {
    return `Riot API ${status}: the API key is invalid, expired, or not allowed for this endpoint. Regenerate a development key and restart npm run api.`;
  }
  if (status === 404) {
    return `Riot API 404: Riot ID not found for the selected routing values. Check Name#TAG and RIOT_REGIONAL_ROUTING.`;
  }
  if (status === 429) {
    return 'Riot API 429: rate limit hit. Wait a minute and try again.';
  }
  return `Riot API ${status}: ${text}`;
}

function summarizeChampions(matches) {
  const summary = new Map();

  matches.forEach((match) => {
    if (!match.championName) return;
    const current = summary.get(match.championName) ?? {
      championName: match.championName,
      games: 0,
      wins: 0,
      roles: {}
    };
    current.games += 1;
    if (match.win) current.wins += 1;
    current.winRate = winRate(current.wins, current.games - current.wins);
    current.roles[match.teamPosition] = (current.roles[match.teamPosition] ?? 0) + 1;
    summary.set(match.championName, current);
  });

  return [...summary.values()].sort((a, b) => b.games - a.games);
}

function summarizeModes(matches) {
  const summary = new Map();

  matches.forEach((match) => {
    if (!match.gameMode) return;
    const current = summary.get(match.gameMode) ?? {
      gameMode: match.gameMode,
      games: 0,
      wins: 0,
      losses: 0,
      winRate: 0
    };
    current.games += 1;
    if (match.win) current.wins += 1;
    else current.losses += 1;
    current.winRate = winRate(current.wins, current.losses);
    summary.set(match.gameMode, current);
  });

  return [...summary.values()].sort((a, b) => b.games - a.games);
}

function winRate(wins, losses) {
  const total = wins + losses;
  return total ? Math.round((wins / total) * 1000) / 10 : 0;
}

function sendJson(request, response, status, payload, options = {}) {
  const origin = request.headers.origin || '';
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  response.writeHead(status, {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Origin': allowOrigin,
    'Cache-Control': options.privateData ? 'no-store' : 'private, max-age=60',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Content-Type': 'application/json',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(status === 204 ? undefined : JSON.stringify(payload));
}

function consumeProxyBudget(clientId) {
  const now = Date.now();
  const activeRequests = (clientRequestLog.get(clientId) || []).filter((timestamp) => now - timestamp < proxyWindowMs);

  if (activeRequests.length >= proxyMaxRequests) {
    clientRequestLog.set(clientId, activeRequests);
    return false;
  }

  activeRequests.push(now);
  clientRequestLog.set(clientId, activeRequests);
  return true;
}

function isSafeRiotIdPart(value) {
  return typeof value === 'string' && value.length <= 32 && /^[\p{L}\p{N} _.-]+$/u.test(value);
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function loadEnv() {
  const values = { ...process.env };
  const envPath = resolve(process.cwd(), '.env');

  try {
    const file = readFileSync(envPath, 'utf8');
    file.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const separator = trimmed.indexOf('=');
      if (separator === -1) return;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      values[key] = value;
    });
  } catch {
    // .env is optional for non-Riot workflows; startup validation handles the key.
  }

  return values;
}
