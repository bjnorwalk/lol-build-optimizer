import { describe, expect, it } from 'vitest';
import {
  championBuildSlug,
  findMissingRequiredChampions,
  requiredChampionCount,
  requiredChampionNames
} from './data/championCatalog';
import { itemProfiles } from './data/profiles';
import { getSourceCheckedBuild, sourceCheckedBuilds } from './data/sourceBuilds';
import { getChampionAggregateStats } from './data/sampleStats';
import { getSourceTierStat, sourceCheckedTierRows } from './data/sourceTierStats';
import { getWeakAgainst } from './data/matchups';
import { recommendBuild } from './recommender';
import type { Champion, RiotItem } from './types';

const items: RiotItem[] = itemProfiles.map((item) => ({
  id: item.id,
  name: item.name,
  description: item.name,
  plaintext: item.name,
  image: '',
  gold: 3000,
  purchasable: true,
  maps: { '11': true }
}));

const champion = (name: string, tags: string[] = ['Mage']): Champion => ({
  id: name.replace(/[^A-Za-z0-9]/g, ''),
  key: name,
  name,
  image: '',
  tags
});

describe('required champion catalog', () => {
  it('tracks the complete 172 champion roster supplied for the project', () => {
    expect(requiredChampionCount).toBe(172);
    expect(new Set(requiredChampionNames).size).toBe(172);
    expect(requiredChampionNames).toContain('Yunara');
    expect(requiredChampionNames).toContain('Zaahen');
  });

  it('reports no missing champions when all required names are available', () => {
    const champions = requiredChampionNames.map((name) => champion(name));

    expect(findMissingRequiredChampions(champions)).toEqual([]);
  });

  it('creates readable external build slugs for punctuation-heavy champion names', () => {
    expect(championBuildSlug(champion("Kai'Sa"))).toBe('kaisa');
    expect(championBuildSlug(champion("Kha'Zix"))).toBe('khazix');
    expect(championBuildSlug(champion('Nunu & Willump'))).toBe('nunu-and-willump');
  });

  it('can generate full six-item build paths for every required champion name', () => {
    requiredChampionNames.forEach((name) => {
      const result = recommendBuild({
        champion: champion(name),
        role: 'Mid',
        gameState: 'Even',
        enemies: [],
        items
      });

      expect(result.starters.length).toBeGreaterThan(0);
      expect(result.boots.length).toBeGreaterThan(0);
      expect(result.core.length).toBe(3);
      expect(result.late.length).toBe(3);
    });
  });

  it('returns matchup weaknesses for every required champion name', () => {
    requiredChampionNames.forEach((name) => {
      expect(getWeakAgainst(champion(name)).length).toBeGreaterThanOrEqual(5);
    });
  });

  it('keeps source-checked builds tied to required champion names', () => {
    const required = new Set(requiredChampionNames.map((name) => name.toLowerCase().replace(/[^a-z0-9]/g, '')));

    sourceCheckedBuilds.forEach((build) => {
      expect(required.has(build.championId.toLowerCase()), build.championId).toBe(true);
      expect(build.sources.length).toBeGreaterThanOrEqual(1);
      expect(build.summonerSpells.length).toBe(2);
      expect(build.runes.primary.length).toBe(4);
      expect(build.runes.secondary.length).toBe(2);
      expect(build.runes.shards.length).toBe(3);
    });
  });

  it('can create a source-review candidate for every required champion', () => {
    requiredChampionNames.forEach((name) => {
      const currentChampion = champion(name);
      const result = recommendBuild({
        champion: currentChampion,
        role: 'Mid',
        gameState: 'Even',
        enemies: [],
        items
      });
      const buildItems = [...result.boots.slice(0, 1), ...result.core, ...result.late.slice(0, 2)];

      expect(buildItems.length).toBeGreaterThanOrEqual(6);
      expect(getWeakAgainst(currentChampion).length).toBeGreaterThanOrEqual(5);
      expect(championBuildSlug(currentChampion).length).toBeGreaterThan(0);
    });
  });

  it('parses the pasted source-checked tier table into authoritative ranked rows', () => {
    expect(sourceCheckedTierRows.length).toBe(270);
    expect(getSourceTierStat('Seraphine', 'ADC')).toMatchObject({
      rank: 1,
      tier: 'A',
      winRate: 54.15,
      pickRate: 1.1,
      banRate: 6.1,
      matches: 23590
    });
    expect(getSourceTierStat('Caitlyn', 'ADC')).toMatchObject({
      rank: 216,
      tier: 'D',
      winRate: 48.94,
      pickRate: 16.2,
      banRate: 21.4,
      matches: 361302
    });
  });

  it('uses source-checked tier rows before generated aggregate estimates', () => {
    const caitlynStats = getChampionAggregateStats(champion('Caitlyn'), 'ADC');

    expect(caitlynStats.source).toBe('source-checked');
    expect(caitlynStats.rank).toBe(216);
    expect(caitlynStats.tier).toBe('D');
    expect(caitlynStats.winRate).toBe(48.94);
    expect(caitlynStats.pickRate).toBe(16.2);
    expect(caitlynStats.banRate).toBe(21.4);
    expect(caitlynStats.games).toBe(361302);
  });

  it('does not reuse a source-checked build across the wrong role', () => {
    expect(getSourceCheckedBuild('Seraphine')).toBeDefined();
    expect(getSourceCheckedBuild('Seraphine', 'Support')).toBeDefined();
    expect(getSourceCheckedBuild('Seraphine', 'ADC')).toBeUndefined();
  });
});
