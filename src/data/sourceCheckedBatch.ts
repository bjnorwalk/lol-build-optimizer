import type { SourceCheckedBuild } from './sourceBuilds';

type SourceCheckedBatchEntry = SourceCheckedBuild & {
  summaryBuild: string;
  summarySetup: string;
  items: {
    starter: string[];
    boots: string;
    core: string[];
    fullBuild: string[];
  };
  skillOrder: {
    maxFirst: string;
    maxSecond: string;
    maxThird: string;
    levelOrder: string;
  };
  strongAgainst: string[];
};

export const sourceCheckedBatch: SourceCheckedBatchEntry[] = [
  {
    championId: 'Aatrox',
    role: 'Top',
    patch: '16.10',
    summary: 'Sundered Sky, Plated Steelcaps, Spear of Shojin, Sterak\'s Gage, Death\'s Dance, Guardian Angel.',
    summaryBuild: 'Sundered Sky, Plated Steelcaps, Spear of Shojin, Sterak\'s Gage, Death\'s Dance, Guardian Angel.',
    summarySetup: 'U.GG recommended Aatrox Top setup: Conqueror page, Flash + Teleport, Q > E > W skill priority, and abuse extended trades with passive healing.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Triumph', 'Legend: Tenacity', 'Last Stand'],
      secondaryTree: 'Domination',
      secondary: ['Taste of Blood', 'Ravenous Hunter'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Long Sword', 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Sundered Sky', 'Spear of Shojin', 'Sterak\'s Gage'],
      fullBuild: ['Sundered Sky', 'Plated Steelcaps', 'Spear of Shojin', 'Sterak\'s Gage', 'Death\'s Dance', 'Guardian Angel']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Fiora', 'Vayne', 'Gwen', 'Camille', 'Jax'],
    strongAgainst: ['Malphite', 'Nasus', 'Cho\'Gath', 'Ornn', 'Sion'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/aatrox/build/top' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/aatrox/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/aatrox/build/top' }
    ]
  },
  {
    championId: 'Ahri',
    role: 'Mid',
    patch: '16.10',
    summary: 'Luden\'s Tempest, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summaryBuild: 'Luden\'s Tempest, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summarySetup: 'U.GG recommended Ahri Mid setup: Electrocute page, Flash + Ignite, E > Q > W skill priority, and use R aggressively to pick off isolated targets.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Domination',
      primary: ['Electrocute', 'Taste of Blood', 'Eyeball Collection', 'Treasure Hunter'],
      secondaryTree: 'Sorcery',
      secondary: ['Celerity', 'Gathering Storm'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Doran\'s Ring', 'Health Potion'],
      boots: 'Sorcerer\'s Shoes',
      core: ['Luden\'s Tempest', 'Shadowflame', 'Rabadon\'s Deathcap'],
      fullBuild: ['Luden\'s Tempest', 'Sorcerer\'s Shoes', 'Shadowflame', 'Rabadon\'s Deathcap', 'Void Staff', 'Zhonya\'s Hourglass']
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'Q', maxThird: 'W', levelOrder: 'R > E > Q > W' },
    weakAgainst: ['Syndra', 'Vex', 'Malzahar', 'Zed', 'Fizz'],
    strongAgainst: ['Akali', 'Qiyana', 'Katarina', 'Yone', 'Twisted Fate'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/ahri/build/mid' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/ahri/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/ahri/build/mid' }
    ]
  },
  {
    championId: 'Akali',
    role: 'Mid',
    patch: '16.10',
    summary: 'Hextech Rocketbelt, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summaryBuild: 'Hextech Rocketbelt, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summarySetup: 'U.GG recommended Akali Mid setup: Electrocute page, Flash + Ignite, Q > E > W skill priority, and use W shroud to dodge key enemy abilities.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Domination',
      primary: ['Electrocute', 'Taste of Blood', 'Eyeball Collection', 'Treasure Hunter'],
      secondaryTree: 'Precision',
      secondary: ['Triumph', 'Legend: Tenacity'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Long Sword', 'Refillable Potion'],
      boots: 'Sorcerer\'s Shoes',
      core: ['Hextech Rocketbelt', 'Shadowflame', 'Rabadon\'s Deathcap'],
      fullBuild: ['Hextech Rocketbelt', 'Sorcerer\'s Shoes', 'Shadowflame', 'Rabadon\'s Deathcap', 'Void Staff', 'Zhonya\'s Hourglass']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Vex', 'Malzahar', 'Galio', 'Diana', 'Lissandra'],
    strongAgainst: ['Twisted Fate', 'Orianna', 'Syndra', 'Azir', 'Lux'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/akali/build/mid' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/akali/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/akali/build/mid' }
    ]
  },
  {
    championId: 'Akshan',
    role: 'Mid',
    patch: '16.10',
    summary: 'Kraken Slayer, Berserker\'s Greaves, Guinsoo\'s Rageblade, Wit\'s End, Blade of the Ruined King, Immortal Shieldbow.',
    summaryBuild: 'Kraken Slayer, Berserker\'s Greaves, Guinsoo\'s Rageblade, Wit\'s End, Blade of the Ruined King, Immortal Shieldbow.',
    summarySetup: 'U.GG recommended Akshan Mid setup: Fleet Footwork page, Flash + Ignite, E > Q > W skill priority, and prioritize killing enemies who slew your allies to revive them.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Fleet Footwork', 'Absorb Life', 'Legend: Alacrity', 'Coup de Grace'],
      secondaryTree: 'Domination',
      secondary: ['Taste of Blood', 'Treasure Hunter'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Doran\'s Blade', 'Health Potion'],
      boots: 'Berserker\'s Greaves',
      core: ['Kraken Slayer', 'Guinsoo\'s Rageblade', 'Wit\'s End'],
      fullBuild: ['Kraken Slayer', 'Berserker\'s Greaves', 'Guinsoo\'s Rageblade', 'Wit\'s End', 'Blade of the Ruined King', 'Immortal Shieldbow']
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'Q', maxThird: 'W', levelOrder: 'R > E > Q > W' },
    weakAgainst: ['Zed', 'Talon', 'Fizz', 'Qiyana', 'Pantheon'],
    strongAgainst: ['Twisted Fate', 'Lux', 'Veigar', 'Xerath', 'Ziggs'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/akshan/build/mid' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/akshan/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/akshan/build/mid' }
    ]
  },
  {
    championId: 'Alistar',
    role: 'Support',
    patch: '16.10',
    summary: 'Locket of the Iron Solari, Plated Steelcaps, Knight\'s Vow, Warmog\'s Armor, Redemption, Gargoyle Stoneplate.',
    summaryBuild: 'Locket of the Iron Solari, Plated Steelcaps, Knight\'s Vow, Warmog\'s Armor, Redemption, Gargoyle Stoneplate.',
    summarySetup: 'U.GG recommended Alistar Support setup: Aftershock page, Flash + Ignite, W > Q > E skill priority, and land W-Q combos to headbutt enemies into your team.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Resolve',
      primary: ['Aftershock', 'Font of Life', 'Bone Plating', 'Unflinching'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Biscuit Delivery'],
      shards: ['Attack Speed', 'Armor', 'Health Scaling']
    },
    items: {
      starter: ['Relic Shield', 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Locket of the Iron Solari', 'Knight\'s Vow', 'Warmog\'s Armor'],
      fullBuild: ['Locket of the Iron Solari', 'Plated Steelcaps', 'Knight\'s Vow', 'Warmog\'s Armor', 'Redemption', 'Gargoyle Stoneplate']
    },
    skillOrder: { maxFirst: 'W', maxSecond: 'Q', maxThird: 'E', levelOrder: 'R > W > Q > E' },
    weakAgainst: ['Senna', 'Xerath', 'Vel\'Koz', 'Zyra', 'Brand'],
    strongAgainst: ['Janna', 'Soraka', 'Nami', 'Yuumi', 'Lulu'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/alistar/build/support' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/alistar/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/alistar/build/support' }
    ]
  },
  {
    championId: 'Ambessa',
    role: 'Top',
    patch: '16.10',
    summary: 'Trinity Force, Plated Steelcaps, Spear of Shojin, Sterak\'s Gage, Death\'s Dance, Guardian Angel.',
    summaryBuild: 'Trinity Force, Plated Steelcaps, Spear of Shojin, Sterak\'s Gage, Death\'s Dance, Guardian Angel.',
    summarySetup: 'U.GG recommended Ambessa Top setup: Conqueror page, Flash + Teleport, Q > E > W skill priority, and chain dashes with passive procs to shred through tanks.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Triumph', 'Legend: Tenacity', 'Last Stand'],
      secondaryTree: 'Domination',
      secondary: ['Taste of Blood', 'Ravenous Hunter'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Long Sword', 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Trinity Force', 'Spear of Shojin', 'Sterak\'s Gage'],
      fullBuild: ['Trinity Force', 'Plated Steelcaps', 'Spear of Shojin', 'Sterak\'s Gage', 'Death\'s Dance', 'Guardian Angel']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Fiora', 'Camille', 'Gwen', 'Vayne', 'Jax'],
    strongAgainst: ['Malphite', 'Ornn', 'Sion', 'Cho\'Gath', 'Nasus'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/ambessa/build/top' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/ambessa/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/ambessa/build/top' }
    ]
  },
  {
    championId: 'Amumu',
    role: 'Jungle',
    patch: '16.10',
    summary: 'Sunfire Aegis, Plated Steelcaps, Abyssal Mask, Warmog\'s Armor, Force of Nature, Gargoyle Stoneplate.',
    summaryBuild: 'Sunfire Aegis, Plated Steelcaps, Abyssal Mask, Warmog\'s Armor, Force of Nature, Gargoyle Stoneplate.',
    summarySetup: 'U.GG recommended Amumu Jungle setup: Aftershock page, Flash + Smite, E > W > Q skill priority, and save second R charge to chain CC across fights.',
    summonerSpells: ['Flash', 'Smite'],
    runes: {
      primaryTree: 'Resolve',
      primary: ['Aftershock', 'Font of Life', 'Bone Plating', 'Overgrowth'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Cosmic Insight'],
      shards: ['Ability Haste', 'Armor', 'Health Scaling']
    },
    items: {
      starter: ['Gustwalker Hatchling', 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Sunfire Aegis', 'Abyssal Mask', 'Warmog\'s Armor'],
      fullBuild: ['Sunfire Aegis', 'Plated Steelcaps', 'Abyssal Mask', 'Warmog\'s Armor', 'Force of Nature', 'Gargoyle Stoneplate']
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'W', maxThird: 'Q', levelOrder: 'R > E > W > Q' },
    weakAgainst: ['Graves', 'Kha\'Zix', 'Kindred', 'Master Yi', 'Nocturne'],
    strongAgainst: ['Warwick', 'Volibear', 'Hecarim', 'Rammus', 'Malphite'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/amumu/build/jungle' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/amumu/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/amumu/build/jungle' }
    ]
  },
  {
    championId: 'Anivia',
    role: 'Mid',
    patch: '16.10',
    summary: 'Archangel\'s Staff, Sorcerer\'s Shoes, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass, Frozen Heart.',
    summaryBuild: 'Archangel\'s Staff, Sorcerer\'s Shoes, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass, Frozen Heart.',
    summarySetup: 'U.GG recommended Anivia Mid setup: Arcane Comet page, Flash + Teleport, Q > E > W skill priority, and zone enemies with R+W walls in tight chokes.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Sorcery',
      primary: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Scorch'],
      secondaryTree: 'Inspiration',
      secondary: ['Biscuit Delivery', 'Cosmic Insight'],
      shards: ['Ability Haste', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Doran\'s Ring', 'Health Potion'],
      boots: 'Sorcerer\'s Shoes',
      core: ['Archangel\'s Staff', 'Rabadon\'s Deathcap', 'Void Staff'],
      fullBuild: ['Archangel\'s Staff', 'Sorcerer\'s Shoes', 'Rabadon\'s Deathcap', 'Void Staff', 'Zhonya\'s Hourglass', 'Frozen Heart']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Fizz', 'Zed', 'Talon', 'LeBlanc', 'Kassadin'],
    strongAgainst: ['Malzahar', 'Orianna', 'Viktor', 'Azir', 'Ryze'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/anivia/build/mid' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/anivia/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/anivia/build/mid' }
    ]
  },
  {
    championId: 'Annie',
    role: 'Mid',
    patch: '16.10',
    summary: 'Luden\'s Tempest, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summaryBuild: 'Luden\'s Tempest, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summarySetup: 'U.GG recommended Annie Mid setup: Electrocute page, Flash + Ignite, Q > W > E skill priority, and always have 4 stun stacks ready before engaging.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Domination',
      primary: ['Electrocute', 'Taste of Blood', 'Eyeball Collection', 'Treasure Hunter'],
      secondaryTree: 'Sorcery',
      secondary: ['Manaflow Band', 'Gathering Storm'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Doran\'s Ring', 'Health Potion'],
      boots: 'Sorcerer\'s Shoes',
      core: ['Luden\'s Tempest', 'Shadowflame', 'Rabadon\'s Deathcap'],
      fullBuild: ['Luden\'s Tempest', 'Sorcerer\'s Shoes', 'Shadowflame', 'Rabadon\'s Deathcap', 'Void Staff', 'Zhonya\'s Hourglass']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Fizz', 'LeBlanc', 'Zed', 'Kassadin', 'Talon'],
    strongAgainst: ['Twisted Fate', 'Veigar', 'Lux', 'Ziggs', 'Xerath'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/annie/build/mid' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/annie/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/annie/build/mid' }
    ]
  },
  {
    championId: 'Aphelios',
    role: 'ADC',
    patch: '16.10',
    summary: 'Kraken Slayer, Berserker\'s Greaves, Guinsoo\'s Rageblade, Wit\'s End, Blade of the Ruined King, Immortal Shieldbow.',
    summaryBuild: 'Kraken Slayer, Berserker\'s Greaves, Guinsoo\'s Rageblade, Wit\'s End, Blade of the Ruined King, Immortal Shieldbow.',
    summarySetup: 'U.GG recommended Aphelios ADC setup: Lethal Tempo page, Flash + Cleanse, Q > W > E skill priority, and combo Gravitum root into Infernum AoE R for maximum teamfight damage.',
    summonerSpells: ['Flash', 'Cleanse'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Lethal Tempo', 'Absorb Life', 'Legend: Alacrity', 'Coup de Grace'],
      secondaryTree: 'Domination',
      secondary: ['Taste of Blood', 'Treasure Hunter'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Doran\'s Blade', 'Health Potion'],
      boots: 'Berserker\'s Greaves',
      core: ['Kraken Slayer', 'Guinsoo\'s Rageblade', 'Wit\'s End'],
      fullBuild: ['Kraken Slayer', 'Berserker\'s Greaves', 'Guinsoo\'s Rageblade', 'Wit\'s End', 'Blade of the Ruined King', 'Immortal Shieldbow']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Draven', 'Miss Fortune', 'Caitlyn', 'Samira', 'Jinx'],
    strongAgainst: ['Ezreal', 'Kai\'Sa', 'Xayah', 'Lucian', 'Tristana'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/aphelios/build/adc' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/aphelios/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/aphelios/build/adc' }
    ]
  },
  {
    championId: 'Ashe',
    role: 'ADC',
    patch: '16.10',
    summary: 'Kraken Slayer, Berserker\'s Greaves, Runaan\'s Hurricane, Lord Dominik\'s Regards, Infinity Edge, Bloodthirster.',
    summaryBuild: 'Kraken Slayer, Berserker\'s Greaves, Runaan\'s Hurricane, Lord Dominik\'s Regards, Infinity Edge, Bloodthirster.',
    summarySetup: 'U.GG recommended Ashe ADC setup: Lethal Tempo page, Flash + Cleanse, W > E > Q skill priority, and use global R proactively to start fights from across the map.',
    summonerSpells: ['Flash', 'Cleanse'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Lethal Tempo', 'Absorb Life', 'Legend: Alacrity', 'Coup de Grace'],
      secondaryTree: 'Sorcery',
      secondary: ['Absolute Focus', 'Gathering Storm'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Doran\'s Blade', 'Health Potion'],
      boots: 'Berserker\'s Greaves',
      core: ['Kraken Slayer', 'Runaan\'s Hurricane', 'Lord Dominik\'s Regards'],
      fullBuild: ['Kraken Slayer', 'Berserker\'s Greaves', 'Runaan\'s Hurricane', 'Lord Dominik\'s Regards', 'Infinity Edge', 'Bloodthirster']
    },
    skillOrder: { maxFirst: 'W', maxSecond: 'E', maxThird: 'Q', levelOrder: 'R > W > E > Q' },
    weakAgainst: ['Draven', 'Miss Fortune', 'Caitlyn', 'Samira', 'Jinx'],
    strongAgainst: ['Ezreal', 'Aphelios', 'Xayah', 'Kai\'Sa', 'Sivir'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/ashe/build/adc' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/ashe/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/ashe/build/adc' }
    ]
  },
  {
    championId: 'AurelionSol',
    role: 'Mid',
    patch: '16.10',
    summary: 'Luden\'s Tempest, Sorcerer\'s Shoes, Rabadon\'s Deathcap, Void Staff, Shadowflame, Zhonya\'s Hourglass.',
    summaryBuild: 'Luden\'s Tempest, Sorcerer\'s Shoes, Rabadon\'s Deathcap, Void Staff, Shadowflame, Zhonya\'s Hourglass.',
    summarySetup: 'U.GG recommended Aurelion Sol Mid setup: Phase Rush page, Flash + Teleport, Q > W > E skill priority, and stack Stardust aggressively early for late-game scaling.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Sorcery',
      primary: ['Phase Rush', 'Manaflow Band', 'Transcendence', 'Gathering Storm'],
      secondaryTree: 'Inspiration',
      secondary: ['Biscuit Delivery', 'Cosmic Insight'],
      shards: ['Ability Haste', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Doran\'s Ring', 'Health Potion'],
      boots: 'Sorcerer\'s Shoes',
      core: ['Luden\'s Tempest', 'Rabadon\'s Deathcap', 'Void Staff'],
      fullBuild: ['Luden\'s Tempest', 'Sorcerer\'s Shoes', 'Rabadon\'s Deathcap', 'Void Staff', 'Shadowflame', 'Zhonya\'s Hourglass']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Fizz', 'Zed', 'Talon', 'LeBlanc', 'Pantheon'],
    strongAgainst: ['Twisted Fate', 'Lux', 'Veigar', 'Xerath', 'Viktor'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/aurelionsol/build/mid' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/aurelionsol/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/aurelionsol/build/mid' }
    ]
  },
  {
    championId: 'Aurora',
    role: 'Mid',
    patch: '16.10',
    summary: 'Luden\'s Tempest, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summaryBuild: 'Luden\'s Tempest, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summarySetup: 'U.GG recommended Aurora Mid setup: Electrocute page, Flash + Ignite, Q > E > W skill priority, and use R to reposition and dodge high-impact enemy ultimates.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Domination',
      primary: ['Electrocute', 'Taste of Blood', 'Eyeball Collection', 'Treasure Hunter'],
      secondaryTree: 'Sorcery',
      secondary: ['Manaflow Band', 'Gathering Storm'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Doran\'s Ring', 'Health Potion'],
      boots: 'Sorcerer\'s Shoes',
      core: ['Luden\'s Tempest', 'Shadowflame', 'Rabadon\'s Deathcap'],
      fullBuild: ['Luden\'s Tempest', 'Sorcerer\'s Shoes', 'Shadowflame', 'Rabadon\'s Deathcap', 'Void Staff', 'Zhonya\'s Hourglass']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Zed', 'Talon', 'LeBlanc', 'Fizz', 'Vex'],
    strongAgainst: ['Twisted Fate', 'Orianna', 'Lux', 'Ziggs', 'Veigar'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/aurora/build/mid' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/aurora/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/aurora/build/mid' }
    ]
  },
  {
    championId: 'Azir',
    role: 'Mid',
    patch: '16.10',
    summary: 'Liandry\'s Torment, Sorcerer\'s Shoes, Nashor\'s Tooth, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summaryBuild: 'Liandry\'s Torment, Sorcerer\'s Shoes, Nashor\'s Tooth, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summarySetup: 'U.GG recommended Azir Mid setup: Lethal Tempo page, Flash + Barrier, W > Q > E skill priority, and use Emperor\'s Divide R to peel for your backline.',
    summonerSpells: ['Flash', 'Barrier'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Lethal Tempo', 'Presence of Mind', 'Legend: Alacrity', 'Coup de Grace'],
      secondaryTree: 'Sorcery',
      secondary: ['Absolute Focus', 'Gathering Storm'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Doran\'s Ring', 'Health Potion'],
      boots: 'Sorcerer\'s Shoes',
      core: ['Liandry\'s Torment', 'Nashor\'s Tooth', 'Rabadon\'s Deathcap'],
      fullBuild: ['Liandry\'s Torment', 'Sorcerer\'s Shoes', 'Nashor\'s Tooth', 'Rabadon\'s Deathcap', 'Void Staff', 'Zhonya\'s Hourglass']
    },
    skillOrder: { maxFirst: 'W', maxSecond: 'Q', maxThird: 'E', levelOrder: 'R > W > Q > E' },
    weakAgainst: ['Fizz', 'Zed', 'LeBlanc', 'Talon', 'Katarina'],
    strongAgainst: ['Twisted Fate', 'Orianna', 'Viktor', 'Syndra', 'Lux'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/azir/build/mid' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/azir/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/azir/build/mid' }
    ]
  },
  {
    championId: 'Bard',
    role: 'Support',
    patch: '16.10',
    summary: 'Shurelya\'s Battlesong, Ionian Boots of Lucidity, Locket of the Iron Solari, Redemption, Knight\'s Vow, Mikael\'s Blessing.',
    summaryBuild: 'Shurelya\'s Battlesong, Ionian Boots of Lucidity, Locket of the Iron Solari, Redemption, Knight\'s Vow, Mikael\'s Blessing.',
    summarySetup: 'U.GG recommended Bard Support setup: Arcane Comet page, Flash + Ignite, Q > W > E skill priority, and collect chimes constantly to stack meeps and reduce cooldowns.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Sorcery',
      primary: ['Arcane Comet', 'Manaflow Band', 'Celerity', 'Scorch'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Biscuit Delivery'],
      shards: ['Ability Haste', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Spellthief\'s Edge', 'Health Potion'],
      boots: 'Ionian Boots of Lucidity',
      core: ['Shurelya\'s Battlesong', 'Locket of the Iron Solari', 'Redemption'],
      fullBuild: ['Shurelya\'s Battlesong', 'Ionian Boots of Lucidity', 'Locket of the Iron Solari', 'Redemption', 'Knight\'s Vow', 'Mikael\'s Blessing']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Blitzcrank', 'Thresh', 'Nautilus', 'Leona', 'Pyke'],
    strongAgainst: ['Soraka', 'Janna', 'Lulu', 'Nami', 'Yuumi'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/bard/build/support' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/bard/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/bard/build/support' }
    ]
  },
  {
    championId: 'Belveth',
    role: 'Jungle',
    patch: '16.10',
    summary: 'Kraken Slayer, Berserker\'s Greaves, Guinsoo\'s Rageblade, Wit\'s End, Blade of the Ruined King, Sterak\'s Gage.',
    summaryBuild: 'Kraken Slayer, Berserker\'s Greaves, Guinsoo\'s Rageblade, Wit\'s End, Blade of the Ruined King, Sterak\'s Gage.',
    summarySetup: 'U.GG recommended Bel\'Veth Jungle setup: Lethal Tempo page, Flash + Smite, Q > E > W skill priority, and prioritize Baron and Elder fights to activate True Form.',
    summonerSpells: ['Flash', 'Smite'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Lethal Tempo', 'Absorb Life', 'Legend: Alacrity', 'Coup de Grace'],
      secondaryTree: 'Domination',
      secondary: ['Taste of Blood', 'Treasure Hunter'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Scorchclaw Pup', 'Health Potion'],
      boots: 'Berserker\'s Greaves',
      core: ['Kraken Slayer', 'Guinsoo\'s Rageblade', 'Wit\'s End'],
      fullBuild: ['Kraken Slayer', 'Berserker\'s Greaves', 'Guinsoo\'s Rageblade', 'Wit\'s End', 'Blade of the Ruined King', 'Sterak\'s Gage']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Rammus', 'Malphite', 'Warwick', 'Amumu', 'Sejuani'],
    strongAgainst: ['Kha\'Zix', 'Evelynn', 'Kindred', 'Master Yi', 'Shaco'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/belveth/build/jungle' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/belveth/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/belveth/build/jungle' }
    ]
  },
  {
    championId: 'Blitzcrank',
    role: 'Support',
    patch: '16.10',
    summary: 'Locket of the Iron Solari, Plated Steelcaps, Knight\'s Vow, Warmog\'s Armor, Redemption, Gargoyle Stoneplate.',
    summaryBuild: 'Locket of the Iron Solari, Plated Steelcaps, Knight\'s Vow, Warmog\'s Armor, Redemption, Gargoyle Stoneplate.',
    summarySetup: 'U.GG recommended Blitzcrank Support setup: Aftershock page, Flash + Ignite, Q > E > W skill priority, and position in brushes to hook enemies who overextend.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Resolve',
      primary: ['Aftershock', 'Font of Life', 'Bone Plating', 'Unflinching'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Biscuit Delivery'],
      shards: ['Ability Haste', 'Armor', 'Health Scaling']
    },
    items: {
      starter: ['Relic Shield', 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Locket of the Iron Solari', 'Knight\'s Vow', 'Warmog\'s Armor'],
      fullBuild: ['Locket of the Iron Solari', 'Plated Steelcaps', 'Knight\'s Vow', 'Warmog\'s Armor', 'Redemption', 'Gargoyle Stoneplate']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Thresh', 'Nautilus', 'Leona', 'Morgana', 'Senna'],
    strongAgainst: ['Janna', 'Soraka', 'Nami', 'Lulu', 'Yuumi'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/blitzcrank/build/support' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/blitzcrank/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/blitzcrank/build/support' }
    ]
  },
  {
    championId: 'Brand',
    role: 'Support',
    patch: '16.10',
    summary: 'Liandry\'s Torment, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summaryBuild: 'Liandry\'s Torment, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summarySetup: 'U.GG recommended Brand Support setup: Arcane Comet page, Flash + Ignite, W > Q > E skill priority, and always apply Blaze passive before using W to guarantee the stun.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Sorcery',
      primary: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Scorch'],
      secondaryTree: 'Domination',
      secondary: ['Taste of Blood', 'Treasure Hunter'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Spellthief\'s Edge', 'Health Potion'],
      boots: 'Sorcerer\'s Shoes',
      core: ['Liandry\'s Torment', 'Shadowflame', 'Rabadon\'s Deathcap'],
      fullBuild: ['Liandry\'s Torment', 'Sorcerer\'s Shoes', 'Shadowflame', 'Rabadon\'s Deathcap', 'Void Staff', 'Zhonya\'s Hourglass']
    },
    skillOrder: { maxFirst: 'W', maxSecond: 'Q', maxThird: 'E', levelOrder: 'R > W > Q > E' },
    weakAgainst: ['Thresh', 'Blitzcrank', 'Nautilus', 'Morgana', 'Leona'],
    strongAgainst: ['Soraka', 'Janna', 'Nami', 'Lulu', 'Yuumi'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/brand/build/support' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/brand/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/brand/build/support' }
    ]
  },
  {
    championId: 'Braum',
    role: 'Support',
    patch: '16.10',
    summary: 'Locket of the Iron Solari, Plated Steelcaps, Knight\'s Vow, Redemption, Warmog\'s Armor, Gargoyle Stoneplate.',
    summaryBuild: 'Locket of the Iron Solari, Plated Steelcaps, Knight\'s Vow, Redemption, Warmog\'s Armor, Gargoyle Stoneplate.',
    summarySetup: 'U.GG recommended Braum Support setup: Aftershock page, Flash + Ignite, E > Q > W skill priority, and stand between your ADC and enemies to stack passive on attackers.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Resolve',
      primary: ['Aftershock', 'Font of Life', 'Bone Plating', 'Overgrowth'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Biscuit Delivery'],
      shards: ['Ability Haste', 'Armor', 'Health Scaling']
    },
    items: {
      starter: ['Relic Shield', 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Locket of the Iron Solari', 'Knight\'s Vow', 'Redemption'],
      fullBuild: ['Locket of the Iron Solari', 'Plated Steelcaps', 'Knight\'s Vow', 'Redemption', 'Warmog\'s Armor', 'Gargoyle Stoneplate']
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'Q', maxThird: 'W', levelOrder: 'R > E > Q > W' },
    weakAgainst: ['Senna', 'Xerath', 'Vel\'Koz', 'Zyra', 'Brand'],
    strongAgainst: ['Draven', 'Miss Fortune', 'Lucian', 'Samira', 'Jinx'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/braum/build/support' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/braum/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/braum/build/support' }
    ]
  },
  {
    championId: 'Briar',
    role: 'Jungle',
    patch: '16.10',
    summary: 'Sundered Sky, Plated Steelcaps, Sterak\'s Gage, Wit\'s End, Death\'s Dance, Guardian Angel.',
    summaryBuild: 'Sundered Sky, Plated Steelcaps, Sterak\'s Gage, Wit\'s End, Death\'s Dance, Guardian Angel.',
    summarySetup: 'U.GG recommended Briar Jungle setup: Conqueror page, Flash + Smite, E > Q > W skill priority, and fight at low HP to maximize passive healing during clears.',
    summonerSpells: ['Flash', 'Smite'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Triumph', 'Legend: Tenacity', 'Last Stand'],
      secondaryTree: 'Domination',
      secondary: ['Taste of Blood', 'Ravenous Hunter'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Scorchclaw Pup', 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Sundered Sky', 'Sterak\'s Gage', 'Wit\'s End'],
      fullBuild: ['Sundered Sky', 'Plated Steelcaps', 'Sterak\'s Gage', 'Wit\'s End', 'Death\'s Dance', 'Guardian Angel']
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'Q', maxThird: 'W', levelOrder: 'R > E > Q > W' },
    weakAgainst: ['Rammus', 'Malphite', 'Amumu', 'Warwick', 'Trundle'],
    strongAgainst: ['Evelynn', 'Kha\'Zix', 'Kindred', 'Shaco', 'Master Yi'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/briar/build/jungle' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/briar/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/briar/build/jungle' }
    ]
  },
  {
    championId: 'Caitlyn',
    role: 'ADC',
    patch: '16.10',
    summary: 'Kraken Slayer, Berserker\'s Greaves, Rapid Firecannon, Lord Dominik\'s Regards, Infinity Edge, Bloodthirster.',
    summaryBuild: 'Kraken Slayer, Berserker\'s Greaves, Rapid Firecannon, Lord Dominik\'s Regards, Infinity Edge, Bloodthirster.',
    summarySetup: 'U.GG recommended Caitlyn ADC setup: Lethal Tempo page, Flash + Barrier, Q > W > E skill priority, and set traps under yourself so headshots proc on enemies who step in them.',
    summonerSpells: ['Flash', 'Barrier'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Lethal Tempo', 'Absorb Life', 'Legend: Bloodline', 'Cut Down'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Biscuit Delivery'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Doran\'s Blade', 'Health Potion'],
      boots: 'Berserker\'s Greaves',
      core: ['Kraken Slayer', 'Rapid Firecannon', 'Lord Dominik\'s Regards'],
      fullBuild: ['Kraken Slayer', 'Berserker\'s Greaves', 'Rapid Firecannon', 'Lord Dominik\'s Regards', 'Infinity Edge', 'Bloodthirster']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Nilah', 'Samira', 'Draven', 'Miss Fortune', 'Jinx'],
    strongAgainst: ['Ezreal', 'Aphelios', 'Xayah', 'Sivir', 'Lucian'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/caitlyn/build/adc' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/caitlyn/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/caitlyn/build/adc' }
    ]
  },
  {
    championId: 'Camille',
    role: 'Top',
    patch: '16.10',
    summary: 'Trinity Force, Plated Steelcaps, Sterak\'s Gage, Ravenous Hydra, Death\'s Dance, Guardian Angel.',
    summaryBuild: 'Trinity Force, Plated Steelcaps, Sterak\'s Gage, Ravenous Hydra, Death\'s Dance, Guardian Angel.',
    summarySetup: 'U.GG recommended Camille Top setup: Conqueror page, Flash + Teleport, Q > E > W skill priority, and use R to isolate a carry in teamfights so no one can save them.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Triumph', 'Legend: Tenacity', 'Last Stand'],
      secondaryTree: 'Resolve',
      secondary: ['Bone Plating', 'Unflinching'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Long Sword', 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Trinity Force', 'Sterak\'s Gage', 'Ravenous Hydra'],
      fullBuild: ['Trinity Force', 'Plated Steelcaps', 'Sterak\'s Gage', 'Ravenous Hydra', 'Death\'s Dance', 'Guardian Angel']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Fiora', 'Jax', 'Darius', 'Garen', 'Irelia'],
    strongAgainst: ['Malphite', 'Nasus', 'Cho\'Gath', 'Sion', 'Ornn'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/camille/build/top' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/camille/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/camille/build/top' }
    ]
  },
  {
    championId: 'Cassiopeia',
    role: 'Mid',
    patch: '16.10',
    summary: 'Liandry\'s Torment, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summaryBuild: 'Liandry\'s Torment, Sorcerer\'s Shoes, Shadowflame, Rabadon\'s Deathcap, Void Staff, Zhonya\'s Hourglass.',
    summarySetup: 'U.GG recommended Cassiopeia Mid setup: Phase Rush page, Flash + Teleport, E > Q > W skill priority, and never buy boots - abuse E spam on poisoned targets for massive DPS.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Sorcery',
      primary: ['Phase Rush', 'Manaflow Band', 'Transcendence', 'Gathering Storm'],
      secondaryTree: 'Domination',
      secondary: ['Taste of Blood', 'Ravenous Hunter'],
      shards: ['Ability Haste', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Doran\'s Ring', 'Health Potion'],
      boots: 'Sorcerer\'s Shoes',
      core: ['Liandry\'s Torment', 'Shadowflame', 'Rabadon\'s Deathcap'],
      fullBuild: ['Liandry\'s Torment', 'Sorcerer\'s Shoes', 'Shadowflame', 'Rabadon\'s Deathcap', 'Void Staff', 'Zhonya\'s Hourglass']
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'Q', maxThird: 'W', levelOrder: 'R > E > Q > W' },
    weakAgainst: ['Fizz', 'Zed', 'LeBlanc', 'Talon', 'Kassadin'],
    strongAgainst: ['Malzahar', 'Viktor', 'Orianna', 'Syndra', 'Azir'],
    sources: [
      { name: 'U.GG', url: 'https://u.gg/lol/champions/cassiopeia/build/mid' },
      { name: 'Mobalytics', url: 'https://mobalytics.gg/lol/champions/cassiopeia/build' },
      { name: 'OP.GG', url: 'https://op.gg/lol/champions/cassiopeia/build/mid' }
    ]
  }
];
