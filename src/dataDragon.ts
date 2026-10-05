import type { Champion, ChampionAbility, ChampionDetails, RiotItem, Rune, SummonerSpell } from './types';

type VersionsResponse = string[];

type DataDragonChampion = {
  id: string;
  key: string;
  name: string;
  title?: string;
  lore?: string;
  image: { full: string };
  tags: string[];
  stats?: Record<string, number>;
  passive?: {
    name: string;
    description: string;
    image: { full: string };
  };
  spells?: Array<{
    id: string;
    name: string;
    description: string;
    image: { full: string };
  }>;
};

type DataDragonItem = {
  name: string;
  description: string;
  plaintext?: string;
  image?: { full: string };
  gold?: { total: number; purchasable: boolean };
  maps?: Record<string, boolean>;
  stats?: Record<string, number>;
};

type DataDragonSummonerSpell = {
  id: string;
  key: string;
  name: string;
  description: string;
  image: { full: string };
};

type DataDragonRuneTree = {
  id: number;
  key: string;
  name: string;
  icon: string;
  slots: Array<{
    runes: Array<{
      id: number;
      key: string;
      name: string;
      icon: string;
    }>;
  }>;
};

const DDRAGON = 'https://ddragon.leagueoflegends.com';
const CACHE_PREFIX = 'lol-build-optimizer-ddragon';

/*
 * Data Dragon is public static data, so this app does not need a Riot API key
 * for champions, items, or icons. We still cache every successful response so
 * demos keep working if the network drops after the first successful load.
 */

export async function fetchLatestPatch() {
  const versions = await fetchCachedJson<VersionsResponse>('versions', `${DDRAGON}/api/versions.json`);
  return versions[0];
}

export async function fetchChampions(version: string): Promise<Champion[]> {
  const payload = await fetchCachedJson<{ data: Record<string, DataDragonChampion> }>(
    `champions-${version}`,
    `${DDRAGON}/cdn/${version}/data/en_US/champion.json`
  );

  return Object.values(payload.data)
    .map((champion) => ({
      id: champion.id,
      key: champion.key,
      name: champion.name,
      image: `${DDRAGON}/cdn/${version}/img/champion/${champion.image.full}`,
      tags: champion.tags
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchChampionDetails(version: string, championId: string): Promise<ChampionDetails> {
  const payload = await fetchCachedJson<{ data: Record<string, DataDragonChampion> }>(
    `champion-${version}-${championId}`,
    `${DDRAGON}/cdn/${version}/data/en_US/champion/${championId}.json`
  );
  const champion = payload.data[championId];

  if (!champion) {
    throw new Error(`Unable to load champion details for ${championId}.`);
  }

  return {
    id: champion.id,
    title: champion.title ?? '',
    lore: champion.lore ?? '',
    stats: champion.stats ?? {},
    passive: {
      id: `${champion.id}-passive`,
      key: 'P',
      name: champion.passive?.name ?? 'Passive',
      description: champion.passive?.description ?? '',
      image: champion.passive?.image.full ? `${DDRAGON}/cdn/${version}/img/passive/${champion.passive.image.full}` : ''
    },
    spells: (champion.spells ?? []).map((spell, index) => abilityFromSpell(spell, index, version))
  };
}

export async function fetchItems(version: string): Promise<RiotItem[]> {
  const payload = await fetchCachedJson<{ data: Record<string, DataDragonItem> }>(
    `items-${version}`,
    `${DDRAGON}/cdn/${version}/data/en_US/item.json`
  );

  return Object.entries(payload.data).map(([id, item]) => ({
    id,
    name: item.name,
    description: item.description,
    plaintext: item.plaintext ?? '',
    image: item.image?.full ? `${DDRAGON}/cdn/${version}/img/item/${item.image.full}` : '',
    gold: item.gold?.total ?? 0,
    purchasable: item.gold?.purchasable ?? false,
    maps: item.maps ?? {},
    stats: item.stats ?? {}
  }));
}

export async function fetchSummonerSpells(version: string): Promise<SummonerSpell[]> {
  const payload = await fetchCachedJson<{ data: Record<string, DataDragonSummonerSpell> }>(
    `summoner-spells-${version}`,
    `${DDRAGON}/cdn/${version}/data/en_US/summoner.json`
  );

  return Object.values(payload.data)
    .map((spell) => ({
      id: spell.id,
      key: spell.key,
      name: spell.name,
      description: spell.description,
      image: `${DDRAGON}/cdn/${version}/img/spell/${spell.image.full}`
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchRunes(version: string): Promise<Rune[]> {
  const trees = await fetchCachedJson<DataDragonRuneTree[]>(
    `runes-${version}`,
    `${DDRAGON}/cdn/${version}/data/en_US/runesReforged.json`
  );

  return trees.flatMap((tree) =>
    tree.slots.flatMap((slot, slotIndex) =>
      slot.runes.map((rune) => ({
        id: rune.id,
        key: rune.key,
        name: rune.name,
        icon: `${DDRAGON}/cdn/img/${rune.icon}`,
        treeName: tree.name,
        treeId: tree.id,
        treeKey: tree.key,
        slotIndex
      }))
    )
  );
}

function abilityFromSpell(
  spell: NonNullable<DataDragonChampion['spells']>[number],
  index: number,
  version: string
): ChampionAbility {
  return {
    id: spell.id,
    key: ['Q', 'W', 'E', 'R'][index] ?? `${index + 1}`,
    name: spell.name,
    description: spell.description,
    image: spell.image.full ? `${DDRAGON}/cdn/${version}/img/spell/${spell.image.full}` : ''
  };
}

async function fetchCachedJson<T>(cacheKey: string, url: string): Promise<T> {
  const storageKey = `${CACHE_PREFIX}-${cacheKey}`;

  try {
    // Prefer fresh data so patch updates are reflected automatically.
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const json = (await response.json()) as T;
    localStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), json }));
    return json;
  } catch (error) {
    // If the live request fails, fall back to the last known good payload.
    const cached = localStorage.getItem(storageKey);
    if (!cached) {
      throw new Error(`Unable to load Riot Data Dragon data and no cached copy exists for ${cacheKey}.`);
    }

    try {
      return (JSON.parse(cached) as { json: T }).json;
    } catch {
      throw error;
    }
  }
}
