import { sourceCheckedBatch } from './sourceCheckedBatch';
import { sourceCheckedUggBatch2 } from './sourceCheckedUggBatch2';
import { sourceCheckedUggBatch3 } from './sourceCheckedUggBatch3';

export type SourceCheckedBuild = {
  championId: string;
  championKey?: string;
  role: string;
  patch: string;
  summary: string;
  summaryBuild?: string;
  summarySetup?: string;
  summonerSpells: string[];
  runes: {
    primaryTree: string;
    primary: string[];
    secondaryTree: string;
    secondary: string[];
    shards: string[];
  };
  items?: {
    starter: string[];
    boots: string;
    core: string[];
    fullBuild: string[];
  };
  skillOrder?: {
    maxFirst: string;
    maxSecond: string;
    maxThird: string;
    levelOrder: string;
  };
  weakAgainst: string[];
  strongAgainst?: string[];
  sources: Array<{
    name: string;
    url: string;
  }>;
};

/*
 * These are the builds that have been manually checked against public build
 * sources for the current patch cycle. Generated builds still cover the full
 * roster, but source-checked entries are the ones we should trust first.
 */
export const sourceCheckedBuilds: SourceCheckedBuild[] = [
  ...sourceCheckedBatch,
  ...sourceCheckedUggBatch2,
  ...sourceCheckedUggBatch3,
  {
    championId: 'Azir',
    role: 'Mid',
    patch: '16.10',
    summary: "Nashor's Tooth, Sorcerer's Shoes, Shadowflame, Rabadon's Deathcap, Zhonya's Hourglass, Void Staff/Rylai's.",
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Lethal Tempo', 'Presence of Mind', 'Legend: Alacrity', 'Cut Down'],
      secondaryTree: 'Resolve',
      secondary: ['Bone Plating', 'Overgrowth'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    weakAgainst: ['Xerath', 'Hwei', 'LeBlanc', 'Yone', 'Syndra'],
    sources: [
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/azir/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/azir/build/mid' },
      { name: 'MetaSRC', url: 'https://www.metasrc.com/lol/build/azir' }
    ]
  },
  {
    championId: 'Ambessa',
    role: 'Top/Mid/Jungle',
    patch: '16.10',
    summary: "Eclipse, Spear of Shojin, Death's Dance, Endless Hunger, Black Cleaver, Voltaic Cyclosword.",
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Triumph', 'Legend: Haste', 'Last Stand'],
      secondaryTree: 'Resolve',
      secondary: ['Shield Bash', 'Bone Plating'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    },
    weakAgainst: ['Renekton', 'Jax', 'Poppy', 'Kennen', 'Fiora'],
    sources: [
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/ambessa/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/ambessa/build' }
    ]
  },
  {
    championId: 'Caitlyn',
    role: 'ADC',
    patch: '16.10',
    summary: "U.GG recommended Caitlyn ADC setup: Lethal Tempo page, Flash + Barrier, Q > W > E skill priority, Hexoptics C44 recommended path, and crit/marksman core.",
    summonerSpells: ['Flash', 'Barrier'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Lethal Tempo', 'Absorb Life', 'Legend: Bloodline', 'Cut Down'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Biscuit Delivery'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    weakAgainst: ['Seraphine', 'Ziggs', 'Swain', 'Brand', 'Smolder', 'Samira', 'Mel', 'Jinx', 'Nilah', 'Ashe'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/caitlyn/build/adc' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/caitlyn/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/caitlyn/build/adc' }
    ]
  },
  {
    championId: 'DrMundo',
    role: 'Top/Jungle',
    patch: '16.10',
    summary: "Warmog's Armor, Heartsteel, Titanic Hydra, Spirit Visage, Thornmail, Overlord's Bloodmail.",
    summonerSpells: ['Ghost', 'Teleport'],
    runes: {
      primaryTree: 'Resolve',
      primary: ['Grasp of the Undying', 'Demolish', 'Second Wind', 'Overgrowth'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Approach Velocity'],
      shards: ['Attack Speed', 'Health Scaling', 'Health Scaling']
    },
    weakAgainst: ['Gwen', 'Fiora', 'Vayne', 'Kled', 'Olaf'],
    sources: [
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/drmundo/build' },
      { name: 'MetaSRC', url: 'https://www.metasrc.com/lol/champion/drmundo' }
    ]
  }
];

export function getSourceCheckedBuild(championId: string, role?: string) {
  const championMatches = sourceCheckedBuilds.filter((build) => build.championKey === championId || build.championId === championId);
  if (role) return championMatches.find((build) => build.role === role);
  return championMatches[0];
}

export function getSourceCoverage(championIds: string[]) {
  const checkedIds = new Set(sourceCheckedBuilds.flatMap((build) => [build.championId, build.championKey].filter(Boolean) as string[]));
  const uncheckedIds = championIds.filter((id) => !checkedIds.has(id));

  return {
    checked: championIds.length - uncheckedIds.length,
    uncheckedIds,
    total: championIds.length
  };
}
