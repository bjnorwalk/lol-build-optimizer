import type { Champion, ChampionProfile, DamageType, ItemTag, Role } from '../types';
import { getRoleOverride } from './roleOverrides';

/*
 * These archetypes are the production safety net for the recommender.
 * Hand-authored champion profiles are still preferred, but Riot has 160+
 * champions and the app should never show an empty Core Build just because a
 * champion has not been manually tuned yet. Each fallback uses broad champion
 * class tags from Data Dragon plus the selected role to create a complete,
 * reasonable build path.
 */

type ArchetypeProfile = {
  damageType: DamageType;
  starterItems: string[];
  boots: string[];
  coreItems: string[];
  wants: ItemTag[];
};

const roleStarters: Record<Role, string[]> = {
  Top: ['1055', '1054'],
  Jungle: ['1101'],
  Mid: ['1056', '1055'],
  ADC: ['1055'],
  Support: ['3865']
};

const archetypes: Record<string, ArchetypeProfile> = {
  marksman: {
    damageType: 'AD',
    starterItems: ['1055'],
    boots: ['3006'],
    coreItems: ['3031', '6672', '3036', '3085', '3072', '3026'],
    wants: ['AD', 'crit', 'attack-speed', 'armor-pen']
  },
  mage: {
    damageType: 'AP',
    starterItems: ['1056'],
    boots: ['3020', '3158'],
    coreItems: ['6655', '4645', '3089', '3135', '3157', '3102'],
    wants: ['AP', 'mana', 'haste', 'magic-pen']
  },
  assassinAD: {
    damageType: 'AD',
    starterItems: ['1055'],
    boots: ['3047', '3111'],
    coreItems: ['6692', '3142', '6694', '6698', '6701', '6699'],
    wants: ['AD', 'lethality', 'haste', 'snowball']
  },
  fighterAD: {
    damageType: 'AD',
    starterItems: ['1055', '1054'],
    boots: ['3047', '3111'],
    coreItems: ['3078', '3071', '3053', '3161', '6333', '6610'],
    wants: ['AD', 'health', 'haste', 'armor-pen']
  },
  tank: {
    damageType: 'Tank',
    starterItems: ['1054'],
    boots: ['3047', '3111', '3009'],
    coreItems: ['3084', '3083', '3068', '3143', '3065', '3075'],
    wants: ['tank', 'health', 'armor', 'MR']
  },
  enchanter: {
    damageType: 'Enchanter',
    starterItems: ['3865'],
    boots: ['3158'],
    coreItems: ['6617', '3504', '3107', '6620', '3222', '4005'],
    wants: ['support', 'enchanter', 'haste', 'safe']
  },
  engageSupport: {
    damageType: 'Tank',
    starterItems: ['3865'],
    boots: ['3111', '3047'],
    coreItems: ['3190', '3742', '3222', '3068', '3143', '8020'],
    wants: ['support', 'tank', 'health', 'engage']
  }
};

export function inferChampionProfile(champion: Champion, role: Role): ChampionProfile {
  const archetype = chooseArchetype(champion, role);

  return {
    championId: champion.id,
    roles: inferRoles(champion),
    damageType: archetype.damageType,
    starterItems: role === 'Jungle' || role === 'Support' ? roleStarters[role] : archetype.starterItems,
    boots: archetype.boots,
    coreItems: archetype.coreItems,
    wants: archetype.wants,
    source: 'generated'
  };
}

export function inferRoles(champion: Champion): Role[] {
  const override = getRoleOverride(champion.id);
  if (override) return override;

  const tags = new Set(champion.tags);

  if (tags.has('Mage')) return tags.has('Marksman') ? ['Mid'] : ['Mid', 'Support'];
  if (tags.has('Marksman')) return ['ADC'];
  if (tags.has('Support')) return ['Support'];
  if (tags.has('Tank')) return ['Top', 'Support', 'Jungle'];
  if (tags.has('Assassin')) return ['Mid', 'Jungle', 'Top'];
  if (tags.has('Fighter')) return ['Top', 'Jungle', 'Mid'];

  return ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
}

function chooseArchetype(champion: Champion, role: Role) {
  const tags = new Set(champion.tags);

  if (role === 'Support' && tags.has('Tank')) return archetypes.engageSupport;
  if (role === 'Support') return archetypes.enchanter;
  if (role === 'ADC' || (tags.has('Marksman') && !tags.has('Mage'))) return archetypes.marksman;
  if (tags.has('Tank')) return archetypes.tank;
  if (tags.has('Mage')) return archetypes.mage;
  if (tags.has('Assassin')) return archetypes.assassinAD;
  if (tags.has('Fighter')) return archetypes.fighterAD;

  return role === 'Mid' ? archetypes.mage : archetypes.fighterAD;
}
