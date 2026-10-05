import type { SourceCheckedBuild } from './sourceBuilds';

type BatchInput = Omit<SourceCheckedBuild, 'sources' | 'summary'> & {
  slug: string;
  rolePath?: string;
};

const rolePathByRole: Record<string, string> = {
  Top: 'top',
  Jungle: 'jungle',
  Mid: 'mid',
  ADC: 'adc',
  Support: 'support'
};

function mobalyticsSlug(slug: string) {
  return slug === 'drmundo' ? 'dr-mundo' : slug;
}

function makeEntry(input: BatchInput): SourceCheckedBuild {
  const rolePath = input.rolePath ?? rolePathByRole[input.role] ?? input.role.toLowerCase();
  const summary = input.summarySetup ?? input.summaryBuild ?? `${input.championId} ${input.role} source review.`;

  return {
    ...input,
    summary,
    sources: [
      { name: 'U.GG', url: `https://u.gg/lol/champions/${input.slug}/build/${rolePath}` },
      { name: 'Mobalytics', url: `https://mobalytics.gg/lol/champions/${mobalyticsSlug(input.slug)}/build` },
      { name: 'OP.GG', url: `https://op.gg/lol/champions/${input.slug}/build/${rolePath}` }
    ]
  };
}

export const sourceCheckedUggBatch2: SourceCheckedBuild[] = [
  makeEntry({
    championId: 'Corki',
    slug: 'corki',
    role: 'Mid',
    patch: '16.10',
    summaryBuild: "Trinity Force, Sorcerer's Shoes, Manamune, Spear of Shojin, Rapid Firecannon, Guardian Angel.",
    summarySetup: 'U.GG-style Corki Mid setup: First Strike page, Flash + Teleport, Q > E > W skill priority, and play around package-style roam windows and poke before objectives.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Inspiration',
      primary: ['First Strike', 'Magical Footwear', 'Biscuit Delivery', 'Cosmic Insight'],
      secondaryTree: 'Sorcery',
      secondary: ['Manaflow Band', 'Gathering Storm'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Blade", 'Health Potion'],
      boots: "Sorcerer's Shoes",
      core: ['Trinity Force', 'Manamune', 'Spear of Shojin'],
      fullBuild: ['Trinity Force', "Sorcerer's Shoes", 'Manamune', 'Spear of Shojin', 'Rapid Firecannon', 'Guardian Angel']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Zed', 'Fizz', 'LeBlanc', 'Syndra', 'Hwei'],
    strongAgainst: ['Twisted Fate', 'Veigar', 'Lux', 'Azir', 'Viktor']
  }),
  makeEntry({
    championId: 'Darius',
    slug: 'darius',
    role: 'Top',
    patch: '16.10',
    summaryBuild: "Stridebreaker, Plated Steelcaps, Sterak's Gage, Dead Man's Plate, Force of Nature, Death's Dance.",
    summarySetup: 'U.GG-style Darius Top setup: Conqueror page, Flash + Ghost, Q > E > W skill priority, and force extended trades when Hemorrhage stacks are available.',
    summonerSpells: ['Flash', 'Ghost'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand'],
      secondaryTree: 'Resolve',
      secondary: ['Second Wind', 'Unflinching'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Shield", 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Stridebreaker', "Sterak's Gage", "Dead Man's Plate"],
      fullBuild: ['Stridebreaker', 'Plated Steelcaps', "Sterak's Gage", "Dead Man's Plate", 'Force of Nature', "Death's Dance"]
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Vayne', 'Quinn', 'Kayle', 'Teemo', 'Wukong'],
    strongAgainst: ['Sion', 'Ornn', 'Nasus', 'Mordekaiser', 'Sett']
  }),
  makeEntry({
    championId: 'Diana',
    slug: 'diana',
    role: 'Jungle',
    patch: '16.10',
    summaryBuild: "Nashor's Tooth, Sorcerer's Shoes, Zhonya's Hourglass, Rabadon's Deathcap, Shadowflame, Void Staff.",
    summarySetup: 'U.GG-style Diana Jungle setup: Conqueror page, Flash + Smite, Q > W > E skill priority, and chain Moonlight resets into multi-target R engages.',
    summonerSpells: ['Flash', 'Smite'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Coup de Grace'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Cosmic Insight'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Gustwalker Hatchling', 'Health Potion'],
      boots: "Sorcerer's Shoes",
      core: ["Nashor's Tooth", "Zhonya's Hourglass", "Rabadon's Deathcap"],
      fullBuild: ["Nashor's Tooth", "Sorcerer's Shoes", "Zhonya's Hourglass", "Rabadon's Deathcap", 'Shadowflame', 'Void Staff']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Graves', 'Kindred', 'Nidalee', 'Elise', 'Lee Sin'],
    strongAgainst: ['Amumu', 'Rammus', 'Evelynn', 'Karthus', 'Nocturne']
  }),
  makeEntry({
    championId: 'DrMundo',
    slug: 'drmundo',
    role: 'Top',
    patch: '16.10',
    summaryBuild: "Heartsteel, Plated Steelcaps, Warmog's Armor, Spirit Visage, Thornmail, Overlord's Bloodmail.",
    summarySetup: 'U.GG-style Dr. Mundo Top setup: Grasp page, Ghost + Teleport, Q > E > W skill priority, and farm safely until health scaling makes you impossible to ignore.',
    summonerSpells: ['Ghost', 'Teleport'],
    runes: {
      primaryTree: 'Resolve',
      primary: ['Grasp of the Undying', 'Demolish', 'Second Wind', 'Overgrowth'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Approach Velocity'],
      shards: ['Attack Speed', 'Health Scaling', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Shield", 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Heartsteel', "Warmog's Armor", 'Spirit Visage'],
      fullBuild: ['Heartsteel', 'Plated Steelcaps', "Warmog's Armor", 'Spirit Visage', 'Thornmail', "Overlord's Bloodmail"]
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Gwen', 'Fiora', 'Vayne', 'Kled', 'Olaf'],
    strongAgainst: ['Malphite', 'Sion', "Cho'Gath", 'Ornn', 'Singed']
  }),
  makeEntry({
    championId: 'Draven',
    slug: 'draven',
    role: 'ADC',
    patch: '16.10',
    summaryBuild: "The Collector, Berserker's Greaves, Infinity Edge, Bloodthirster, Lord Dominik's Regards, Guardian Angel.",
    summarySetup: 'U.GG-style Draven ADC setup: Lethal Tempo page, Flash + Barrier, Q > W > E skill priority, and cash in Adoration stacks before fights stall out.',
    summonerSpells: ['Flash', 'Barrier'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Lethal Tempo', 'Triumph', 'Legend: Bloodline', 'Coup de Grace'],
      secondaryTree: 'Sorcery',
      secondary: ['Absolute Focus', 'Gathering Storm'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Blade", 'Health Potion'],
      boots: "Berserker's Greaves",
      core: ['The Collector', 'Infinity Edge', 'Bloodthirster'],
      fullBuild: ['The Collector', "Berserker's Greaves", 'Infinity Edge', 'Bloodthirster', "Lord Dominik's Regards", 'Guardian Angel']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Caitlyn', 'Jinx', 'Miss Fortune', 'Ashe', 'Varus'],
    strongAgainst: ['Aphelios', 'Ezreal', "Kai'Sa", 'Xayah', 'Sivir']
  }),
  makeEntry({
    championId: 'Ekko',
    slug: 'ekko',
    role: 'Jungle',
    patch: '16.10',
    summaryBuild: "Nashor's Tooth, Sorcerer's Shoes, Lich Bane, Zhonya's Hourglass, Rabadon's Deathcap, Void Staff.",
    summarySetup: 'U.GG-style Ekko Jungle setup: Dark Harvest page, Flash + Smite, Q > E > W skill priority, and use R to overcommit only when Chronobreak is guaranteed.',
    summonerSpells: ['Flash', 'Smite'],
    runes: {
      primaryTree: 'Domination',
      primary: ['Dark Harvest', 'Sudden Impact', 'Eyeball Collection', 'Treasure Hunter'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Cosmic Insight'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Gustwalker Hatchling', 'Health Potion'],
      boots: "Sorcerer's Shoes",
      core: ["Nashor's Tooth", 'Lich Bane', "Zhonya's Hourglass"],
      fullBuild: ["Nashor's Tooth", "Sorcerer's Shoes", 'Lich Bane', "Zhonya's Hourglass", "Rabadon's Deathcap", 'Void Staff']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Graves', 'Kindred', 'Lee Sin', 'Elise', 'Nidalee'],
    strongAgainst: ['Karthus', 'Evelynn', 'Fiddlesticks', 'Master Yi', 'Amumu']
  }),
  makeEntry({
    championId: 'Elise',
    slug: 'elise',
    role: 'Jungle',
    patch: '16.10',
    summaryBuild: "Stormsurge, Sorcerer's Shoes, Shadowflame, Zhonya's Hourglass, Rabadon's Deathcap, Void Staff.",
    summarySetup: 'U.GG-style Elise Jungle setup: Electrocute page, Flash + Smite, Q > W > E skill priority, and snowball lanes with Cocoon before opponents have vision control.',
    summonerSpells: ['Flash', 'Smite'],
    runes: {
      primaryTree: 'Domination',
      primary: ['Electrocute', 'Sudden Impact', 'Eyeball Collection', 'Relentless Hunter'],
      secondaryTree: 'Sorcery',
      secondary: ['Absolute Focus', 'Waterwalking'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Scorchclaw Pup', 'Health Potion'],
      boots: "Sorcerer's Shoes",
      core: ['Stormsurge', 'Shadowflame', "Zhonya's Hourglass"],
      fullBuild: ['Stormsurge', "Sorcerer's Shoes", 'Shadowflame', "Zhonya's Hourglass", "Rabadon's Deathcap", 'Void Staff']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Graves', 'Kindred', 'Nidalee', 'Fiddlesticks', "Bel'Veth"],
    strongAgainst: ['Evelynn', 'Karthus', 'Master Yi', 'Amumu', 'Rammus']
  }),
  makeEntry({
    championId: 'Evelynn',
    slug: 'evelynn',
    role: 'Jungle',
    patch: '16.10',
    summaryBuild: "Stormsurge, Sorcerer's Shoes, Lich Bane, Rabadon's Deathcap, Void Staff, Banshee's Veil.",
    summarySetup: 'U.GG-style Evelynn Jungle setup: Electrocute page, Flash + Smite, Q > E > W skill priority, and punish side lanes once Demon Shade makes your pathing hidden.',
    summonerSpells: ['Flash', 'Smite'],
    runes: {
      primaryTree: 'Domination',
      primary: ['Electrocute', 'Sudden Impact', 'Eyeball Collection', 'Ultimate Hunter'],
      secondaryTree: 'Sorcery',
      secondary: ['Absolute Focus', 'Gathering Storm'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Gustwalker Hatchling', 'Health Potion'],
      boots: "Sorcerer's Shoes",
      core: ['Stormsurge', 'Lich Bane', "Rabadon's Deathcap"],
      fullBuild: ['Stormsurge', "Sorcerer's Shoes", 'Lich Bane', "Rabadon's Deathcap", 'Void Staff', "Banshee's Veil"]
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ["Rek'Sai", 'Rengar', 'Lee Sin', 'Nidalee', 'Graves'],
    strongAgainst: ['Karthus', 'Fiddlesticks', 'Amumu', 'Rammus', 'Sejuani']
  }),
  makeEntry({
    championId: 'Ezreal',
    slug: 'ezreal',
    role: 'ADC',
    patch: '16.10',
    summaryBuild: 'Trinity Force, Ionian Boots of Lucidity, Manamune, Spear of Shojin, Serylda\'s Grudge, Guardian Angel.',
    summarySetup: 'U.GG-style Ezreal ADC setup: Press the Attack page, Flash + Barrier, Q > E > W skill priority, and kite with Mystic Shot poke before committing Arcane Shift.',
    summonerSpells: ['Flash', 'Barrier'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Press the Attack', 'Presence of Mind', 'Legend: Bloodline', 'Cut Down'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Biscuit Delivery'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Blade", 'Health Potion'],
      boots: 'Ionian Boots of Lucidity',
      core: ['Trinity Force', 'Manamune', 'Spear of Shojin'],
      fullBuild: ['Trinity Force', 'Ionian Boots of Lucidity', 'Manamune', 'Spear of Shojin', "Serylda's Grudge", 'Guardian Angel']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Draven', 'Miss Fortune', 'Caitlyn', 'Jinx', 'Twitch'],
    strongAgainst: ['Aphelios', 'Xayah', 'Sivir', "Kai'Sa", 'Varus']
  }),
  makeEntry({
    championId: 'Fiddlesticks',
    slug: 'fiddlesticks',
    role: 'Jungle',
    patch: '16.10',
    summaryBuild: "Zhonya's Hourglass, Sorcerer's Shoes, Liandry's Torment, Shadowflame, Rabadon's Deathcap, Void Staff.",
    summarySetup: 'U.GG-style Fiddlesticks Jungle setup: First Strike page, Flash + Smite, W > Q > E skill priority, and look for unseen Crowstorm angles around objectives.',
    summonerSpells: ['Flash', 'Smite'],
    runes: {
      primaryTree: 'Inspiration',
      primary: ['First Strike', 'Cash Back', 'Triple Tonic', 'Cosmic Insight'],
      secondaryTree: 'Domination',
      secondary: ['Sudden Impact', 'Ultimate Hunter'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Gustwalker Hatchling', 'Health Potion'],
      boots: "Sorcerer's Shoes",
      core: ["Zhonya's Hourglass", "Liandry's Torment", 'Shadowflame'],
      fullBuild: ["Zhonya's Hourglass", "Sorcerer's Shoes", "Liandry's Torment", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff']
    },
    skillOrder: { maxFirst: 'W', maxSecond: 'Q', maxThird: 'E', levelOrder: 'R > W > Q > E' },
    weakAgainst: ['Graves', 'Kindred', 'Lee Sin', 'Nidalee', 'Elise'],
    strongAgainst: ['Amumu', 'Rammus', 'Sejuani', 'Zac', 'Hecarim']
  }),
  makeEntry({
    championId: 'Fiora',
    slug: 'fiora',
    role: 'Top',
    patch: '16.10',
    summaryBuild: 'Ravenous Hydra, Plated Steelcaps, Trinity Force, Hullbreaker, Death\'s Dance, Sterak\'s Gage.',
    summarySetup: 'U.GG-style Fiora Top setup: Conqueror page, Flash + Teleport, Q > E > W skill priority, and save Riposte for the enemy spell that wins the trade.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand'],
      secondaryTree: 'Resolve',
      secondary: ['Demolish', 'Second Wind'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Blade", 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Ravenous Hydra', 'Trinity Force', 'Hullbreaker'],
      fullBuild: ['Ravenous Hydra', 'Plated Steelcaps', 'Trinity Force', 'Hullbreaker', "Death's Dance", "Sterak's Gage"]
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Malphite', 'Poppy', 'Quinn', 'Vayne', 'Kennen'],
    strongAgainst: ['Sion', 'Ornn', "Cho'Gath", 'Mordekaiser', 'Yorick']
  }),
  makeEntry({
    championId: 'Fizz',
    slug: 'fizz',
    role: 'Mid',
    patch: '16.10',
    summaryBuild: "Lich Bane, Sorcerer's Shoes, Zhonya's Hourglass, Rabadon's Deathcap, Void Staff, Shadowflame.",
    summarySetup: 'U.GG-style Fizz Mid setup: Electrocute page, Flash + Ignite, E > W > Q skill priority, and hold Playful/Trickster for the key return trade.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Domination',
      primary: ['Electrocute', 'Sudden Impact', 'Eyeball Collection', 'Treasure Hunter'],
      secondaryTree: 'Precision',
      secondary: ['Triumph', 'Coup de Grace'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Ring", 'Health Potion'],
      boots: "Sorcerer's Shoes",
      core: ['Lich Bane', "Zhonya's Hourglass", "Rabadon's Deathcap"],
      fullBuild: ['Lich Bane', "Sorcerer's Shoes", "Zhonya's Hourglass", "Rabadon's Deathcap", 'Void Staff', 'Shadowflame']
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'W', maxThird: 'Q', levelOrder: 'R > E > W > Q' },
    weakAgainst: ['Galio', 'Lissandra', 'Vex', 'Diana', 'Pantheon'],
    strongAgainst: ['Lux', 'Xerath', 'Ziggs', 'Azir', 'Twisted Fate']
  }),
  makeEntry({
    championId: 'Galio',
    slug: 'galio',
    role: 'Mid',
    patch: '16.10',
    summaryBuild: 'Hollow Radiance, Mercury\'s Treads, Riftmaker, Zhonya\'s Hourglass, Abyssal Mask, Jak\'Sho, The Protean.',
    summarySetup: 'U.GG-style Galio Mid setup: Aftershock page, Flash + Teleport, Q > W > E skill priority, and use Hero\'s Entrance to punish side-lane fights.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Resolve',
      primary: ['Aftershock', 'Shield Bash', 'Bone Plating', 'Overgrowth'],
      secondaryTree: 'Sorcery',
      secondary: ['Nimbus Cloak', 'Transcendence'],
      shards: ['Ability Haste', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Ring", 'Health Potion'],
      boots: "Mercury's Treads",
      core: ['Hollow Radiance', 'Riftmaker', "Zhonya's Hourglass"],
      fullBuild: ['Hollow Radiance', "Mercury's Treads", 'Riftmaker', "Zhonya's Hourglass", 'Abyssal Mask', "Jak'Sho, The Protean"]
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Tristana', 'Cassiopeia', 'Anivia', 'Taliyah', 'Swain'],
    strongAgainst: ['Fizz', 'Katarina', 'Akali', 'LeBlanc', 'Diana']
  }),
  makeEntry({
    championId: 'Gangplank',
    slug: 'gangplank',
    role: 'Top',
    patch: '16.10',
    summaryBuild: "Essence Reaver, Ionian Boots of Lucidity, Infinity Edge, Navori Flickerblade, Lord Dominik's Regards, Bloodthirster.",
    summarySetup: 'U.GG-style Gangplank Top setup: First Strike page, Flash + Teleport, Q > E > W skill priority, and stack barrel chains before objectives.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Inspiration',
      primary: ['First Strike', 'Magical Footwear', 'Biscuit Delivery', 'Cosmic Insight'],
      secondaryTree: 'Sorcery',
      secondary: ['Transcendence', 'Gathering Storm'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Sapphire Crystal', 'Refillable Potion'],
      boots: 'Ionian Boots of Lucidity',
      core: ['Essence Reaver', 'Infinity Edge', 'Navori Flickerblade'],
      fullBuild: ['Essence Reaver', 'Ionian Boots of Lucidity', 'Infinity Edge', 'Navori Flickerblade', "Lord Dominik's Regards", 'Bloodthirster']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Rumble', 'Quinn', 'Akshan', 'Irelia', 'Tryndamere'],
    strongAgainst: ['Sion', 'Ornn', 'Nasus', 'Malphite', 'Mordekaiser']
  }),
  makeEntry({
    championId: 'Garen',
    slug: 'garen',
    role: 'Top',
    patch: '16.10',
    summaryBuild: "Stridebreaker, Berserker's Greaves, Phantom Dancer, Dead Man's Plate, Force of Nature, Sterak's Gage.",
    summarySetup: 'U.GG-style Garen Top setup: Conqueror page, Flash + Ignite, E > Q > W skill priority, and trade around Decisive Strike silence into Judgment.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand'],
      secondaryTree: 'Resolve',
      secondary: ['Second Wind', 'Overgrowth'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Shield", 'Health Potion'],
      boots: "Berserker's Greaves",
      core: ['Stridebreaker', 'Phantom Dancer', "Dead Man's Plate"],
      fullBuild: ['Stridebreaker', "Berserker's Greaves", 'Phantom Dancer', "Dead Man's Plate", 'Force of Nature', "Sterak's Gage"]
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'Q', maxThird: 'W', levelOrder: 'R > E > Q > W' },
    weakAgainst: ['Quinn', 'Vayne', 'Kayle', 'Camille', 'Darius'],
    strongAgainst: ['Yasuo', 'Yone', 'Renekton', 'Irelia', 'Jax']
  }),
  makeEntry({
    championId: 'Gnar',
    slug: 'gnar',
    role: 'Top',
    patch: '16.10',
    summaryBuild: "Trinity Force, Plated Steelcaps, Black Cleaver, Sterak's Gage, Randuin's Omen, Force of Nature.",
    summarySetup: 'U.GG-style Gnar Top setup: Fleet Footwork page, Flash + Teleport, Q > W > E skill priority, and manage Rage before river and objective fights.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Fleet Footwork', 'Absorb Life', 'Legend: Alacrity', 'Cut Down'],
      secondaryTree: 'Resolve',
      secondary: ['Bone Plating', 'Overgrowth'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Blade", 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Trinity Force', 'Black Cleaver', "Sterak's Gage"],
      fullBuild: ['Trinity Force', 'Plated Steelcaps', 'Black Cleaver', "Sterak's Gage", "Randuin's Omen", 'Force of Nature']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Irelia', 'Yasuo', 'Camille', 'Malphite', 'Teemo'],
    strongAgainst: ['Sion', 'Ornn', 'Nasus', 'Mordekaiser', 'Garen']
  }),
  makeEntry({
    championId: 'Gragas',
    slug: 'gragas',
    role: 'Jungle',
    patch: '16.10',
    summaryBuild: "Lich Bane, Sorcerer's Shoes, Zhonya's Hourglass, Rabadon's Deathcap, Void Staff, Banshee's Veil.",
    summarySetup: 'U.GG-style Gragas Jungle setup: Dark Harvest page, Flash + Smite, Q > E > W skill priority, and use Body Slam flash angles to start fights.',
    summonerSpells: ['Flash', 'Smite'],
    runes: {
      primaryTree: 'Domination',
      primary: ['Dark Harvest', 'Sudden Impact', 'Eyeball Collection', 'Ultimate Hunter'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Cosmic Insight'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Gustwalker Hatchling', 'Health Potion'],
      boots: "Sorcerer's Shoes",
      core: ['Lich Bane', "Zhonya's Hourglass", "Rabadon's Deathcap"],
      fullBuild: ['Lich Bane', "Sorcerer's Shoes", "Zhonya's Hourglass", "Rabadon's Deathcap", 'Void Staff', "Banshee's Veil"]
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Graves', 'Kindred', 'Nidalee', 'Lee Sin', 'Elise'],
    strongAgainst: ['Amumu', 'Rammus', 'Sejuani', 'Zac', 'Nunu & Willump']
  }),
  makeEntry({
    championId: 'Graves',
    slug: 'graves',
    role: 'Jungle',
    patch: '16.10',
    summaryBuild: "Youmuu's Ghostblade, Plated Steelcaps, The Collector, Lord Dominik's Regards, Infinity Edge, Guardian Angel.",
    summarySetup: 'U.GG-style Graves Jungle setup: Fleet Footwork page, Flash + Smite, Q > E > W skill priority, and path aggressively to stack grit before skirmishes.',
    summonerSpells: ['Flash', 'Smite'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Fleet Footwork', 'Triumph', 'Legend: Alacrity', 'Coup de Grace'],
      secondaryTree: 'Inspiration',
      secondary: ['Magical Footwear', 'Cosmic Insight'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Scorchclaw Pup', 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ["Youmuu's Ghostblade", 'The Collector', "Lord Dominik's Regards"],
      fullBuild: ["Youmuu's Ghostblade", 'Plated Steelcaps', 'The Collector', "Lord Dominik's Regards", 'Infinity Edge', 'Guardian Angel']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Rammus', 'Amumu', 'Zac', 'Warwick', 'Ivern'],
    strongAgainst: ['Evelynn', 'Karthus', 'Fiddlesticks', 'Kindred', 'Nidalee']
  }),
  makeEntry({
    championId: 'Gwen',
    slug: 'gwen',
    role: 'Top',
    patch: '16.10',
    summaryBuild: "Riftmaker, Plated Steelcaps, Nashor's Tooth, Rabadon's Deathcap, Zhonya's Hourglass, Void Staff.",
    summarySetup: 'U.GG-style Gwen Top setup: Conqueror page, Ghost + Teleport, Q > E > W skill priority, and stack Snip Snip before committing to all-ins.',
    summonerSpells: ['Ghost', 'Teleport'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Presence of Mind', 'Legend: Alacrity', 'Last Stand'],
      secondaryTree: 'Resolve',
      secondary: ['Second Wind', 'Overgrowth'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Ring", 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Riftmaker', "Nashor's Tooth", "Rabadon's Deathcap"],
      fullBuild: ['Riftmaker', 'Plated Steelcaps', "Nashor's Tooth", "Rabadon's Deathcap", "Zhonya's Hourglass", 'Void Staff']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Jax', 'Tryndamere', 'Fiora', 'Riven', 'Akshan'],
    strongAgainst: ['Dr. Mundo', 'Sion', "Cho'Gath", 'Ornn', 'Malphite']
  }),
  makeEntry({
    championId: 'Hecarim',
    slug: 'hecarim',
    role: 'Jungle',
    patch: '16.10',
    summaryBuild: "Spear of Shojin, Ionian Boots of Lucidity, Black Cleaver, Sterak's Gage, Death's Dance, Spirit Visage.",
    summarySetup: 'U.GG-style Hecarim Jungle setup: Phase Rush page, Ghost + Smite, Q > W > E skill priority, and chain movement-speed windows into flank ultimates.',
    summonerSpells: ['Ghost', 'Smite'],
    runes: {
      primaryTree: 'Sorcery',
      primary: ['Phase Rush', 'Nimbus Cloak', 'Celerity', 'Waterwalking'],
      secondaryTree: 'Precision',
      secondary: ['Triumph', 'Legend: Tenacity'],
      shards: ['Ability Haste', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ['Gustwalker Hatchling', 'Health Potion'],
      boots: 'Ionian Boots of Lucidity',
      core: ['Spear of Shojin', 'Black Cleaver', "Sterak's Gage"],
      fullBuild: ['Spear of Shojin', 'Ionian Boots of Lucidity', 'Black Cleaver', "Sterak's Gage", "Death's Dance", 'Spirit Visage']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Kindred', 'Graves', 'Lillia', 'Udyr', 'Trundle'],
    strongAgainst: ['Amumu', 'Rammus', 'Evelynn', 'Karthus', 'Fiddlesticks']
  }),
  makeEntry({
    championId: 'Heimerdinger',
    slug: 'heimerdinger',
    role: 'Mid',
    patch: '16.10',
    summaryBuild: "Blackfire Torch, Sorcerer's Shoes, Liandry's Torment, Rylai's Crystal Scepter, Zhonya's Hourglass, Rabadon's Deathcap.",
    summarySetup: 'U.GG-style Heimerdinger Mid setup: Arcane Comet page, Flash + Teleport, Q > W > E skill priority, and set turrets before wave crashes or objective setups.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Sorcery',
      primary: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Scorch'],
      secondaryTree: 'Inspiration',
      secondary: ['Biscuit Delivery', 'Cosmic Insight'],
      shards: ['Ability Haste', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Ring", 'Health Potion'],
      boots: "Sorcerer's Shoes",
      core: ['Blackfire Torch', "Liandry's Torment", "Rylai's Crystal Scepter"],
      fullBuild: ['Blackfire Torch', "Sorcerer's Shoes", "Liandry's Torment", "Rylai's Crystal Scepter", "Zhonya's Hourglass", "Rabadon's Deathcap"]
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Xerath', 'Ziggs', 'Syndra', "Vel'Koz", 'Hwei'],
    strongAgainst: ['Fizz', 'Akali', 'Katarina', 'Yasuo', 'Yone']
  }),
  makeEntry({
    championId: 'Hwei',
    slug: 'hwei',
    role: 'Mid',
    patch: '16.10',
    summaryBuild: "Luden's Tempest, Sorcerer's Shoes, Blackfire Torch, Shadowflame, Rabadon's Deathcap, Void Staff.",
    summarySetup: 'U.GG-style Hwei Mid setup: Arcane Comet page, Flash + Teleport, Q > E > W skill priority, and use spellbook-style utility to control zones before fights.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Sorcery',
      primary: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Scorch'],
      secondaryTree: 'Inspiration',
      secondary: ['Biscuit Delivery', 'Cosmic Insight'],
      shards: ['Ability Haste', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Ring", 'Health Potion'],
      boots: "Sorcerer's Shoes",
      core: ["Luden's Tempest", 'Blackfire Torch', 'Shadowflame'],
      fullBuild: ["Luden's Tempest", "Sorcerer's Shoes", 'Blackfire Torch', 'Shadowflame', "Rabadon's Deathcap", 'Void Staff']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxThird: 'W', levelOrder: 'R > Q > E > W' },
    weakAgainst: ['Fizz', 'Zed', 'Yasuo', 'Katarina', 'LeBlanc'],
    strongAgainst: ['Orianna', 'Viktor', 'Lux', 'Ziggs', 'Azir']
  }),
  makeEntry({
    championId: 'Illaoi',
    slug: 'illaoi',
    role: 'Top',
    patch: '16.10',
    summaryBuild: "Iceborn Gauntlet, Plated Steelcaps, Sterak's Gage, Black Cleaver, Spirit Visage, Death's Dance.",
    summarySetup: 'U.GG-style Illaoi Top setup: Conqueror page, Flash + Teleport, E > Q > W skill priority, and never fight without nearby tentacles or Test of Spirit pressure.',
    summonerSpells: ['Flash', 'Teleport'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Presence of Mind', 'Legend: Tenacity', 'Last Stand'],
      secondaryTree: 'Resolve',
      secondary: ['Demolish', 'Second Wind'],
      shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Shield", 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Iceborn Gauntlet', "Sterak's Gage", 'Black Cleaver'],
      fullBuild: ['Iceborn Gauntlet', 'Plated Steelcaps', "Sterak's Gage", 'Black Cleaver', 'Spirit Visage', "Death's Dance"]
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'Q', maxThird: 'W', levelOrder: 'R > E > Q > W' },
    weakAgainst: ['Mordekaiser', 'Gwen', 'Vayne', 'Tryndamere', 'Yorick'],
    strongAgainst: ['Sion', 'Ornn', 'Malphite', 'Nasus', 'Sett']
  }),
  makeEntry({
    championId: 'Irelia',
    slug: 'irelia',
    role: 'Mid',
    patch: '16.10',
    summaryBuild: "Blade of The Ruined King, Plated Steelcaps, Wit's End, Sundered Sky, Sterak's Gage, Guardian Angel.",
    summarySetup: 'U.GG-style Irelia Mid setup: Conqueror page, Flash + Ignite, Q > W > E skill priority, and use low-health minions to chain Blade Surge resets.',
    summonerSpells: ['Flash', 'Ignite'],
    runes: {
      primaryTree: 'Precision',
      primary: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand'],
      secondaryTree: 'Resolve',
      secondary: ['Bone Plating', 'Unflinching'],
      shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
    },
    items: {
      starter: ["Doran's Blade", 'Health Potion'],
      boots: 'Plated Steelcaps',
      core: ['Blade of The Ruined King', "Wit's End", 'Sundered Sky'],
      fullBuild: ['Blade of The Ruined King', 'Plated Steelcaps', "Wit's End", 'Sundered Sky', "Sterak's Gage", 'Guardian Angel']
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxThird: 'E', levelOrder: 'R > Q > W > E' },
    weakAgainst: ['Warwick', 'Volibear', 'Sett', 'Jax', 'Malphite'],
    strongAgainst: ['Azir', 'Lux', 'Syndra', 'Orianna', 'Twisted Fate']
  })
];
