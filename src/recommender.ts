import { championProfiles, championThreats, itemProfiles } from './data/profiles';
import { inferChampionProfile } from './data/archetypes';
import type {
  BuildRecommendation,
  Champion,
  ChampionProfile,
  GameState,
  ItemProfile,
  Recommendation,
  RiotItem,
  Role,
  ThreatTag
} from './types';

const tagReason: Partial<Record<ThreatTag, string>> = {
  'heavy-ad': 'enemy team has strong physical damage, so armor gains value',
  'heavy-ap': 'enemy team has strong magic damage, so magic resist gains value',
  healing: 'enemy team has healing threats, so anti-heal is valuable',
  shields: 'enemy team has shielding, so anti-shield options are valuable',
  tanks: 'enemy team has frontline tanks, so penetration and anti-tank items gain value',
  assassins: 'enemy team has burst/assassin pressure, so defensive tools gain value',
  'crowd-control': 'enemy team has crowd control, so tenacity or safer options gain value',
  poke: 'enemy team can poke from range, so sustain or safer itemization helps'
};

export function getChampionProfile(championId: string, role: Role, champion?: Champion): ChampionProfile | undefined {
  const manualProfile =
    championProfiles.find((profile) => profile.championId === championId && profile.roles.includes(role)) ??
    championProfiles.find((profile) => profile.championId === championId);

  if (manualProfile) return manualProfile;

  /*
   * Production behavior: every champion should have a full build even if we
   * have not manually tuned that champion. Data Dragon tags give us enough
   * signal to produce a sensible archetype-based fallback.
   */
  return champion ? inferChampionProfile(champion, role) : undefined;
}

export function detectThreats(enemies: Champion[]): ThreatTag[] {
  const counts = new Map<ThreatTag, number>();

  enemies.forEach((enemy) => {
    const tags = championThreats[enemy.id] ?? inferThreatsFromChampionTags(enemy.tags);
    tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });

  const detected: ThreatTag[] = [];
  counts.forEach((count, tag) => {
    if (count >= thresholdFor(tag)) detected.push(tag);
  });
  return detected;
}

export function recommendBuild(options: {
  champion: Champion;
  role: Role;
  gameState: GameState;
  enemies: Champion[];
  items: RiotItem[];
}): BuildRecommendation {
  const profile = getChampionProfile(options.champion.id, options.role, options.champion);
  const detectedThreats = detectThreats(options.enemies);
  const itemMap = new Map(options.items.map((item) => [item.id, item]));

  if (!profile) {
    throw new Error(`Unable to create a build profile for ${options.champion.name}.`);
  }

  const scored = itemProfiles
    .map((itemProfile) => scoreItem(itemProfile, options.gameState, detectedThreats, profile, options.role, itemMap))
    .filter((recommendation): recommendation is Recommendation => Boolean(recommendation))
    .sort((a, b) => b.score - a.score);

  const orderedProfileItems = orderCoreItems(profile.coreItems, scored);

  return {
    starters: pickByIds(profile.starterItems, itemMap, itemProfiles),
    boots: scored.filter((entry) => tagsFor(entry.item.id).includes('boots')).slice(0, 2),
    // Keep the first three champion-profile items as the visible core, then
    // expose the remaining profile items as the late build path.
    core: orderedProfileItems.slice(0, 3),
    late: orderedProfileItems.slice(3, 6),
    situational: scored
      .filter((entry) => !profile.coreItems.includes(entry.item.id) && !tagsFor(entry.item.id).includes('starter') && !tagsFor(entry.item.id).includes('boots'))
      .slice(0, 6),
    detectedThreats,
    profile
  };
}

function scoreItem(
  itemProfile: ItemProfile,
  gameState: GameState,
  threats: ThreatTag[],
  championProfile: ChampionProfile | undefined,
  role: Role,
  itemMap: Map<string, RiotItem>
): Recommendation | null {
  const item = itemMap.get(itemProfile.id);
  if (!item) return null;

  let score = 0;
  const reasons: string[] = [];

  if (championProfile?.coreItems.includes(itemProfile.id)) {
    score += 60;
    reasons.push('core item for this champion profile');
  }

  if (championProfile?.boots.includes(itemProfile.id)) {
    score += 35;
    reasons.push('preferred boot option for this champion');
  }

  championProfile?.wants.forEach((wantedTag) => {
    if (itemProfile.tags.includes(wantedTag)) {
      score += 12;
      reasons.push(`matches desired ${wantedTag} stat/profile`);
    }
  });

  if (itemProfile.roles?.includes(role)) {
    score += 10;
    reasons.push(`fits ${role} itemization`);
  }

  threats.forEach((threat) => {
    const counterScore = scoreThreatCounter(itemProfile, threat);
    if (counterScore > 0) {
      score += counterScore;
      reasons.push(tagReason[threat] ?? `answers ${threat}`);
    }
  });

  if (gameState === 'Ahead' && itemProfile.tags.includes('snowball')) {
    score += 14;
    reasons.push('ahead state rewards higher-damage snowball items');
  }

  if (gameState === 'Behind' && (itemProfile.tags.includes('safe') || itemProfile.tags.includes('anti-burst') || itemProfile.tags.includes('health'))) {
    score += 14;
    reasons.push('behind state rewards safer survivability options');
  }

  if (championProfile?.damageType === 'AP' && itemProfile.tags.includes('AD')) score -= 45;
  if (championProfile?.damageType === 'AD' && itemProfile.tags.includes('AP')) score -= 45;
  if (championProfile?.damageType === 'Enchanter' && itemProfile.tags.includes('AD')) score -= 35;
  if (championProfile?.damageType === 'Tank' && (itemProfile.tags.includes('crit') || itemProfile.tags.includes('lethality'))) score -= 35;

  if (score <= 0) return null;

  return {
    item,
    score,
    reasons: [...new Set(reasons)].slice(0, 3)
  };
}

function scoreThreatCounter(item: ItemProfile, threat: ThreatTag) {
  if (threat === 'heavy-ad' && item.tags.includes('armor')) return 22;
  if (threat === 'heavy-ap' && item.tags.includes('MR')) return 22;
  if (threat === 'healing' && item.tags.includes('anti-heal')) return 28;
  if (threat === 'shields' && item.tags.includes('anti-shield')) return 28;
  if (threat === 'tanks' && (item.tags.includes('anti-tank') || item.tags.includes('armor-pen') || item.tags.includes('magic-pen'))) return 24;
  if (threat === 'assassins' && (item.tags.includes('anti-burst') || item.tags.includes('stasis') || item.tags.includes('health'))) return 22;
  if (threat === 'crowd-control' && (item.tags.includes('safe') || item.tags.includes('MR'))) return 12;
  if (threat === 'poke' && (item.tags.includes('safe') || item.tags.includes('health') || item.tags.includes('enchanter'))) return 10;
  return 0;
}

function pickByIds(ids: string[], itemMap: Map<string, RiotItem>, profiles: ItemProfile[]): Recommendation[] {
  return ids
    .map((id) => {
      const item = itemMap.get(id);
      if (!item) return null;
      const profile = profiles.find((entry) => entry.id === id);
      return {
        item,
        score: 100,
        reasons: [profile?.tags.includes('starter') ? 'standard starting option' : 'recommended early option']
      };
    })
    .filter((entry): entry is Recommendation => Boolean(entry));
}

function tagsFor(itemId: string) {
  return itemProfiles.find((item) => item.id === itemId)?.tags ?? [];
}

function orderCoreItems(coreItemIds: string[], scored: Recommendation[]) {
  const scoredMap = new Map(scored.map((entry) => [entry.item.id, entry]));
  return coreItemIds.map((id) => scoredMap.get(id)).filter((entry): entry is Recommendation => Boolean(entry));
}

function thresholdFor(tag: ThreatTag) {
  if (tag === 'healing' || tag === 'shields' || tag === 'tanks' || tag === 'assassins') return 1;
  return 2;
}

function inferThreatsFromChampionTags(tags: string[]): ThreatTag[] {
  const inferred: ThreatTag[] = [];
  if (tags.includes('Mage')) inferred.push('heavy-ap', 'poke');
  if (tags.includes('Marksman') || tags.includes('Fighter')) inferred.push('heavy-ad');
  if (tags.includes('Tank')) inferred.push('tanks', 'crowd-control');
  if (tags.includes('Assassin')) inferred.push('assassins');
  if (tags.includes('Support')) inferred.push('shields');
  return inferred;
}
