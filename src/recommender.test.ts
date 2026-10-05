import { describe, expect, it } from 'vitest';
import { inferRoles } from './data/archetypes';
import { itemProfiles } from './data/profiles';
import { detectThreats, recommendBuild } from './recommender';
import type { Champion, RiotItem } from './types';

const champion = (id: string, tags: string[] = []): Champion => ({
  id,
  key: id,
  name: id,
  image: '',
  tags
});

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

describe('detectThreats', () => {
  it('detects explicit healing and assassin threats from enemy champions', () => {
    const threats = detectThreats([champion('Zed'), champion('Soraka')]);

    expect(threats).toContain('assassins');
    expect(threats).toContain('healing');
  });

  it('infers threat tags from champion class tags when no manual profile exists', () => {
    const threats = detectThreats([
      champion('UnknownMageOne', ['Mage']),
      champion('UnknownMageTwo', ['Mage']),
      champion('UnknownTank', ['Tank'])
    ]);

    expect(threats).toContain('heavy-ap');
    expect(threats).toContain('tanks');
  });
});

describe('recommendBuild', () => {
  it('does not infer ADC for Azir even though Data Dragon includes a Marksman tag', () => {
    expect(inferRoles(champion('Azir', ['Mage', 'Marksman']))).toEqual(['Mid']);
  });

  it('uses the current source-checked Azir Mid build order', () => {
    const result = recommendBuild({
      champion: champion('Azir', ['Mage', 'Marksman']),
      role: 'Mid',
      gameState: 'Even',
      enemies: [champion('Zed'), champion('Soraka'), champion('Malphite')],
      items
    });

    expect(result.core.map((entry) => entry.item.name)).toEqual([
      "Nashor's Tooth",
      'Shadowflame',
      "Rabadon's Deathcap"
    ]);
    expect(result.late.map((entry) => entry.item.name)).toEqual([
      "Zhonya's Hourglass",
      'Void Staff',
      "Rylai's Crystal Scepter"
    ]);
  });

  it('prioritizes anti-heal into healing-heavy drafts', () => {
    const result = recommendBuild({
      champion: champion('Ahri'),
      role: 'Mid',
      gameState: 'Even',
      enemies: [champion('Soraka')],
      items
    });

    expect(result.situational.some((entry) => entry.item.name === 'Morellonomicon')).toBe(true);
  });

  it('recommends safer defensive AP options when behind against assassins', () => {
    const result = recommendBuild({
      champion: champion('Ahri'),
      role: 'Mid',
      gameState: 'Behind',
      enemies: [champion('Zed')],
      items
    });

    const recommendedItems = [...result.core, ...result.late, ...result.situational].map((entry) => entry.item.name);
    expect(recommendedItems).toContain("Zhonya's Hourglass");
  });

  it('returns expected core items for champion profiles', () => {
    const result = recommendBuild({
      champion: champion('Jinx'),
      role: 'ADC',
      gameState: 'Ahead',
      enemies: [champion('Malphite')],
      items
    });

    expect(result.core.map((entry) => entry.item.name)).toContain('Infinity Edge');
  });

  it('keeps champion core items in profile order even when situational counters score higher', () => {
    const result = recommendBuild({
      champion: champion('Jinx'),
      role: 'ADC',
      gameState: 'Ahead',
      enemies: [champion('Malphite'), champion('Rammus')],
      items
    });

    expect(result.core.map((entry) => entry.item.name)).toEqual([
      'Infinity Edge',
      "Runaan's Hurricane",
      "Lord Dominik's Regards"
    ]);
  });

  it('uses the current source-checked Caitlyn ADC build order', () => {
    const result = recommendBuild({
      champion: champion('Caitlyn', ['Marksman']),
      role: 'ADC',
      gameState: 'Even',
      enemies: [champion('Zed'), champion('Soraka'), champion('Malphite'), champion('Akali'), champion('Ahri')],
      items
    });

    expect(result.core.map((entry) => entry.item.name)).toEqual([
      'Hexoptics C44',
      'Infinity Edge',
      'Rapid Firecannon'
    ]);
    expect(result.late.map((entry) => entry.item.name)).toEqual([
      "Lord Dominik's Regards",
      'Bloodthirster',
      'The Collector'
    ]);
  });

  it('generates a complete fallback core build for champions without manual profiles', () => {
    const result = recommendBuild({
      champion: champion('Ambessa', ['Fighter', 'Assassin']),
      role: 'Mid',
      gameState: 'Even',
      enemies: [champion('Zed'), champion('Soraka')],
      items
    });

    expect(result.starters.length).toBeGreaterThan(0);
    expect(result.boots.length).toBeGreaterThan(0);
    expect(result.core.length).toBe(3);
    expect(result.core.map((entry) => entry.item.name)).toEqual([
      'Eclipse',
      'Spear of Shojin',
      "Death's Dance"
    ]);
    expect(result.late.map((entry) => entry.item.name)).toEqual([
      'Endless Hunger',
      'Black Cleaver',
      'Voltaic Cyclosword'
    ]);
  });

  it('generates complete builds for each broad Data Dragon champion archetype', () => {
    const archetypeChampions = [
      champion('UnknownMarksman', ['Marksman']),
      champion('UnknownMage', ['Mage']),
      champion('UnknownTank', ['Tank']),
      champion('UnknownAssassin', ['Assassin']),
      champion('UnknownFighter', ['Fighter']),
      champion('UnknownSupport', ['Support'])
    ];

    archetypeChampions.forEach((unknownChampion) => {
      const result = recommendBuild({
        champion: unknownChampion,
        role: unknownChampion.tags.includes('Marksman') ? 'ADC' : 'Mid',
        gameState: 'Even',
        enemies: [champion('Zed')],
        items
      });

      expect(result.starters.length).toBeGreaterThan(0);
      expect(result.boots.length).toBeGreaterThan(0);
      expect(result.core.length).toBe(3);
      expect(result.late.length).toBe(3);
      expect(result.profile.source).toBe('generated');
    });
  });
});
