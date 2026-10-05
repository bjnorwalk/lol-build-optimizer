import type { BuildRecommendation, Champion, GameMode, Recommendation, RiotItem } from '../types';

export type AugmentRarity = 'Silver' | 'Gold' | 'Prismatic';
export type ModeConfidence = 'source-checked' | 'generated' | 'rules';

export type ModeAugment = {
  name: string;
  rarity: AugmentRarity;
  tier: 'S+' | 'S' | 'A' | 'B';
  reason: string;
};

export type ModeGuide = {
  mode: GameMode;
  title: string;
  subtitle: string;
  confidence: ModeConfidence;
  patch?: string;
  stats?: Array<{ label: string; value: string }>;
  sourceName?: string;
  sourceUrl?: string;
  priorities: string[];
  itemNames: string[];
  summonerSpells: string[];
  augments: ModeAugment[];
};

const jinxMayhemAugments: ModeAugment[] = [
  { name: 'Deft', rarity: 'Silver', tier: 'S+', reason: 'Best silver option for raw marksman uptime and attack-speed scaling.' },
  { name: 'Typhoon', rarity: 'Silver', tier: 'S+', reason: 'Adds multi-target pressure, which is ideal in constant ARAM Mayhem fights.' },
  { name: "Light 'Em Up!", rarity: 'Silver', tier: 'S+', reason: 'Amplifies repeated autos and fits Jinx reset fights.' },
  { name: 'Lightning Strikes', rarity: 'Gold', tier: 'S+', reason: 'Top gold augment for sustained auto-attack DPS.' },
  { name: 'Twice Thrice', rarity: 'Gold', tier: 'S+', reason: 'Rewards long fights and rapid-hit itemization.' },
  { name: 'Scopier Weapons', rarity: 'Gold', tier: 'S+', reason: 'Extra range lets Jinx hit safely before resets.' },
  { name: 'Tap Dancer', rarity: 'Prismatic', tier: 'S+', reason: 'High-end move speed and attack rhythm for cleanup fights.' },
  { name: 'Dual Wield', rarity: 'Prismatic', tier: 'S+', reason: 'Extreme DPS scaling when protected by the team.' },
  { name: 'Fan The Hammer', rarity: 'Prismatic', tier: 'S+', reason: 'Burst-oriented prismatic that still benefits sustained marksman builds.' }
];

const augmentPools: Record<string, ModeAugment[]> = {
  marksman: [
    { name: 'Deft', rarity: 'Silver', tier: 'S+', reason: 'Default best-in-slot style pick for attack-speed carries.' },
    { name: 'Typhoon', rarity: 'Silver', tier: 'S+', reason: 'Strong when fights are grouped and targets stack.' },
    { name: "Light 'Em Up!", rarity: 'Silver', tier: 'S', reason: 'Good sustained DPS when you can keep autoing.' },
    { name: 'Lightning Strikes', rarity: 'Gold', tier: 'S+', reason: 'High-value attack-speed and on-hit pressure.' },
    { name: 'Twice Thrice', rarity: 'Gold', tier: 'S', reason: 'Best on champions who stack repeated hits quickly.' },
    { name: 'Scopier Weapons', rarity: 'Gold', tier: 'S', reason: 'Safer range for fragile carries.' },
    { name: 'Tap Dancer', rarity: 'Prismatic', tier: 'S+', reason: 'Excellent kiting and cleanup power.' },
    { name: 'Dual Wield', rarity: 'Prismatic', tier: 'S', reason: 'High ceiling if you have peel.' },
    { name: 'Fan The Hammer', rarity: 'Prismatic', tier: 'S', reason: 'Burst window option for crit/on-hit carries.' }
  ],
  mage: [
    { name: 'Witchful Thinking', rarity: 'Silver', tier: 'S+', reason: 'Efficient AP boost for poke and burst mages.' },
    { name: 'ADAPt', rarity: 'Silver', tier: 'S', reason: 'Reliable stat conversion when stacking offensive items.' },
    { name: 'Scoped Weapons', rarity: 'Silver', tier: 'A', reason: 'Safer poke windows for immobile casters.' },
    { name: 'Phenomenal Evil', rarity: 'Gold', tier: 'S+', reason: 'Best scaling fantasy for repeated spell hits.' },
    { name: 'Eureka', rarity: 'Gold', tier: 'S', reason: 'Haste-heavy setup for spam casters.' },
    { name: 'Big Brain', rarity: 'Gold', tier: 'S', reason: 'Broad AP scaling for burst rotations.' },
    { name: 'Jeweled Gauntlet', rarity: 'Prismatic', tier: 'S+', reason: 'Huge spell burst ceiling.' },
    { name: 'Infernal Conduit', rarity: 'Prismatic', tier: 'S', reason: 'Strong on burn and repeat-cast mages.' },
    { name: 'Magic Missile', rarity: 'Prismatic', tier: 'S', reason: 'Adds consistent damage to spell chains.' }
  ],
  tank: [
    { name: 'Tank It Or Leave It', rarity: 'Silver', tier: 'S+', reason: 'Best generic frontline durability.' },
    { name: 'Goredrink', rarity: 'Silver', tier: 'S', reason: 'Sustain pickup for brawling through grouped fights.' },
    { name: 'Ocean Soul', rarity: 'Silver', tier: 'A', reason: 'Stable sustain when fights reset often.' },
    { name: 'Perseverance', rarity: 'Gold', tier: 'S+', reason: 'Excellent anti-burst and anti-CC value.' },
    { name: 'Celestial Body', rarity: 'Gold', tier: 'S', reason: 'Frontline stat check for engage champions.' },
    { name: 'Tormentor', rarity: 'Gold', tier: 'S', reason: 'Damage amp for tanks who can keep enemies locked down.' },
    { name: 'Goliath', rarity: 'Prismatic', tier: 'S+', reason: 'Massive scaling for frontline champions.' },
    { name: 'Raid Boss', rarity: 'Prismatic', tier: 'S', reason: 'Best when your team can fight around your engage.' },
    { name: 'Spirit Link', rarity: 'Prismatic', tier: 'S', reason: 'Team durability option for peel tanks.' }
  ],
  support: [
    { name: 'Sonic Boom', rarity: 'Silver', tier: 'S+', reason: 'Strong shielding/healing payoff in clustered fights.' },
    { name: 'All For You', rarity: 'Silver', tier: 'S', reason: 'Amplifies defensive support patterns.' },
    { name: 'Buff Buddies', rarity: 'Silver', tier: 'S', reason: 'High value when staying near carries.' },
    { name: 'First-Aid Kit', rarity: 'Gold', tier: 'S+', reason: 'Best pure enchanter throughput pick.' },
    { name: 'Holy Fire', rarity: 'Gold', tier: 'S', reason: 'Adds damage to heal/shield rotations.' },
    { name: 'Windspeaker', rarity: 'Gold', tier: 'S', reason: 'Reliable teamfight shield/heal multiplier.' },
    { name: 'Circle of Death', rarity: 'Prismatic', tier: 'S+', reason: 'High-impact fight swing for sustain supports.' },
    { name: 'Spirit Link', rarity: 'Prismatic', tier: 'S', reason: 'Protects the carry you are attached to.' },
    { name: 'Ultimate Revolution', rarity: 'Prismatic', tier: 'S', reason: 'Excellent on supports with fight-winning ultimates.' }
  ],
  fighter: [
    { name: 'The Brutalizer', rarity: 'Silver', tier: 'S+', reason: 'Strong all-purpose bruiser damage.' },
    { name: 'Goredrink', rarity: 'Silver', tier: 'S', reason: 'Helps survive repeated melee trades.' },
    { name: 'Blunt Force', rarity: 'Silver', tier: 'S', reason: 'Good for AD champions who need immediate combat stats.' },
    { name: 'Thread the Needle', rarity: 'Gold', tier: 'S+', reason: 'Excellent mixed damage amp in brawls.' },
    { name: 'Symphony of War', rarity: 'Gold', tier: 'S', reason: 'Rewards extended fights and takedowns.' },
    { name: 'Outlaw Grit', rarity: 'Gold', tier: 'S', reason: 'Great for mobile bruisers diving through fights.' },
    { name: 'Demon King Crown', rarity: 'Prismatic', tier: 'S+', reason: 'High-risk snowball option when ahead.' },
    { name: 'Goliath', rarity: 'Prismatic', tier: 'S', reason: 'Frontline scaling when you need durability.' },
    { name: 'Blade Waltz', rarity: 'Prismatic', tier: 'S', reason: 'Excellent for melee carries who need target access.' }
  ]
};

export function createModeGuide(
  mode: GameMode,
  champion: Champion,
  recommendations: BuildRecommendation,
  items: RiotItem[]
): ModeGuide {
  if (mode === 'ARAM Mayhem') return createMayhemGuide(champion, recommendations, items);
  if (mode === 'ARAM') return createAramGuide(champion, recommendations);
  if (mode === 'Quickplay') return createQuickplayGuide(champion, recommendations);
  if (mode === 'Arena') return createArenaGuide(champion, recommendations);
  return createDefaultModeGuide(mode, champion, recommendations);
}

function createMayhemGuide(champion: Champion, recommendations: BuildRecommendation, items: RiotItem[]): ModeGuide {
  if (champion.id === 'Jinx') {
    return {
      mode: 'ARAM Mayhem',
      title: 'ARAM Mayhem build and augments',
      subtitle: 'Source-checked MetaSRC sample for Jinx, Patch 26.10.',
      confidence: 'source-checked',
      patch: '26.10',
      sourceName: 'MetaSRC Jinx Mayhem',
      sourceUrl: 'https://www.metasrc.com/lol/mayhem/build/jinx',
      stats: [
        { label: 'Tier', value: 'S+' },
        { label: 'Win Rate', value: '52.42%' },
        { label: 'Pick Rate', value: '12.91%' },
        { label: 'Games', value: '87,105' }
      ],
      priorities: [
        'Prioritize Q > W > E for ARAM Mayhem Jinx.',
        'Default spells are Flash + Ghost; consider Cleanse into heavy CC.',
        'Use attack-speed and range augments to survive long reset fights.'
      ],
      itemNames: [
        'Berserker\'s Greaves',
        'Yun Tal Wildarrows',
        'Runaan\'s Hurricane',
        'Infinity Edge',
        'Lord Dominik\'s Regards',
        'Bloodthirster'
      ],
      summonerSpells: ['Flash', 'Ghost', 'Cleanse'],
      augments: jinxMayhemAugments
    };
  }

  const pool = chooseAugmentPool(champion);
  return {
    mode: 'ARAM Mayhem',
    title: 'ARAM Mayhem augment plan',
    subtitle: 'Generated by champion archetype until this champion gets a source-checked MetaSRC page.',
    confidence: 'generated',
    sourceName: 'MetaSRC Mayhem',
    sourceUrl: `https://www.metasrc.com/lol/mayhem/build/${champion.id.toLowerCase()}`,
    priorities: [
      'Pick augments that multiply your champion identity first: range/DPS for carries, haste/AP for mages, durability for tanks.',
      'Use the first two item slots for immediate teamfight impact instead of slow scaling.',
      'Prefer summoners that win repeated 5v5 fights: Flash plus Ghost, Mark, Heal, Barrier, or Exhaust depending on class.'
    ],
    itemNames: modeItemNames(recommendations, items),
    summonerSpells: defaultMayhemSummoners(champion),
    augments: pool
  };
}

function createAramGuide(champion: Champion, recommendations: BuildRecommendation): ModeGuide {
  return {
    mode: 'ARAM',
    title: 'ARAM build adjustments',
    subtitle: 'Mode-specific priorities for single-lane fights, poke, sustain, and snowball summoners.',
    confidence: 'rules',
    sourceName: 'U.GG ARAM',
    sourceUrl: 'https://u.gg/lol/aram-tier-list',
    priorities: [
      'Value early teamfight completion over greedy late-game component holding.',
      'Take Mark on engage/melee champions; take Barrier, Heal, Ghost, or Clarity-style sustain only when it solves a lane problem.',
      'Anti-heal and penetration become high priority once enemy sustain or frontline appears.'
    ],
    itemNames: [
      ...recommendations.boots.slice(0, 1).map((entry) => entry.item.name),
      ...recommendations.core.slice(0, 3).map((entry) => entry.item.name),
      ...recommendations.situational.slice(0, 2).map((entry) => entry.item.name)
    ],
    summonerSpells: defaultAramSummoners(champion),
    augments: []
  };
}

function createQuickplayGuide(champion: Champion, recommendations: BuildRecommendation): ModeGuide {
  return {
    mode: 'Quickplay',
    title: 'Quickplay / Swiftplay setup',
    subtitle: 'Faster Summoner\'s Rift progression: start level 3, more early gold, and faster objectives.',
    confidence: 'rules',
    sourceName: 'Riot Swiftplay Guide',
    sourceUrl: 'https://support-leagueoflegends.riotgames.com/hc/en-us/articles/22007849903507-Swiftplay-Quickplay-Guide',
    priorities: [
      'Start from a stronger level-3 lane plan and spend the 1400g opening budget on immediate combat power.',
      'First recall should convert into your first completed component quickly; games accelerate toward early objectives.',
      'Baron and Elder timers arrive much earlier, so second-item spikes matter more than slow six-item plans.'
    ],
    itemNames: [
      ...recommendations.starters.slice(0, 2).map((entry) => swiftStartName(entry)),
      ...recommendations.boots.slice(0, 1).map((entry) => entry.item.name),
      ...recommendations.core.slice(0, 3).map((entry) => entry.item.name)
    ],
    summonerSpells: defaultSummonersForMode(champion),
    augments: []
  };
}

function createArenaGuide(champion: Champion, recommendations: BuildRecommendation): ModeGuide {
  return {
    mode: 'Arena',
    title: 'Arena setup direction',
    subtitle: 'Two-player skirmish mode: prioritize dueling, target access, and augment/item synergy.',
    confidence: 'generated',
    sourceName: 'MetaSRC Arena',
    sourceUrl: 'https://www.metasrc.com/lol/arena',
    priorities: [
      'Take combat augments that stack with your highest-damage pattern.',
      'Defensive situational items are worth more because every round starts as an all-in.',
      'Pair your build with your duo: frontline + carry, engage + burst, or double poke.'
    ],
    itemNames: [
      ...recommendations.boots.slice(0, 1).map((entry) => entry.item.name),
      ...recommendations.core.slice(0, 3).map((entry) => entry.item.name),
      ...recommendations.situational.slice(0, 2).map((entry) => entry.item.name)
    ],
    summonerSpells: ['Flash', 'Ghost', 'Exhaust'],
    augments: chooseAugmentPool(champion).slice(0, 6)
  };
}

function createDefaultModeGuide(mode: GameMode, champion: Champion, recommendations: BuildRecommendation): ModeGuide {
  return {
    mode,
    title: `${mode} setup`,
    subtitle: 'Uses the ranked recommender with mode filters and external references.',
    confidence: 'rules',
    priorities: [
      'Keep the core build unless the mode changes gold flow or fight cadence.',
      'Use the enemy draft selector to activate counter-items.',
      'Check external mode sources before promoting generated coverage to source-checked.'
    ],
    itemNames: [
      ...recommendations.boots.slice(0, 1).map((entry) => entry.item.name),
      ...recommendations.core.slice(0, 3).map((entry) => entry.item.name)
    ],
    summonerSpells: defaultSummonersForMode(champion),
    augments: []
  };
}

function chooseAugmentPool(champion: Champion) {
  if (champion.tags.includes('Marksman')) return augmentPools.marksman;
  if (champion.tags.includes('Mage')) return augmentPools.mage;
  if (champion.tags.includes('Tank')) return augmentPools.tank;
  if (champion.tags.includes('Support')) return augmentPools.support;
  return augmentPools.fighter;
}

function modeItemNames(recommendations: BuildRecommendation, items: RiotItem[]) {
  const names = [
    ...recommendations.boots.slice(0, 1).map((entry) => entry.item.name),
    ...recommendations.core.slice(0, 3).map((entry) => entry.item.name),
    ...recommendations.late.slice(0, 2).map((entry) => entry.item.name)
  ];
  return names.length ? names : items.slice(0, 6).map((item) => item.name);
}

function defaultMayhemSummoners(champion: Champion) {
  if (champion.tags.includes('Marksman')) return ['Flash', 'Ghost', 'Cleanse'];
  if (champion.tags.includes('Tank') || champion.tags.includes('Fighter')) return ['Flash', 'Mark', 'Ghost'];
  if (champion.tags.includes('Support')) return ['Flash', 'Heal', 'Exhaust'];
  return ['Flash', 'Barrier', 'Ghost'];
}

function defaultAramSummoners(champion: Champion) {
  if (champion.tags.includes('Tank') || champion.tags.includes('Fighter') || champion.tags.includes('Assassin')) return ['Flash', 'Mark'];
  if (champion.tags.includes('Marksman')) return ['Flash', 'Ghost'];
  if (champion.tags.includes('Support')) return ['Flash', 'Heal'];
  return ['Flash', 'Barrier'];
}

function defaultSummonersForMode(champion: Champion) {
  if (champion.tags.includes('Marksman')) return ['Flash', 'Heal'];
  if (champion.tags.includes('Tank')) return ['Flash', 'Teleport'];
  if (champion.tags.includes('Assassin')) return ['Flash', 'Ignite'];
  return ['Flash', 'Teleport'];
}

function swiftStartName(entry: Recommendation) {
  if (entry.item.name.includes("Doran's Blade")) return 'Guardian Hammer';
  if (entry.item.name.includes("Doran's Ring")) return 'Guardian Orb';
  if (entry.item.name.includes("Doran's Shield")) return 'Guardian Horn';
  return entry.item.name;
}
