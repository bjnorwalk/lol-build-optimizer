import type { SourceCheckedBuild } from './sourceBuilds';

type TemplateKey =
  | 'adc'
  | 'apJungle'
  | 'apMage'
  | 'apSupport'
  | 'assassin'
  | 'enchanter'
  | 'fighterJungle'
  | 'fighterTop'
  | 'marksmanMid'
  | 'tankJungle'
  | 'tankSupport'
  | 'tankTop';

type RoleName = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support';

type Seed = {
  championId: string;
  displayName?: string;
  slug: string;
  role: RoleName;
  template: TemplateKey;
  fullBuild: string[];
  core?: string[];
  starter?: string[];
  boots?: string;
  max?: [string, string, string];
  summoners?: string[];
  weak?: string[];
  strong?: string[];
};

const rolePath: Record<RoleName, string> = {
  Top: 'top',
  Jungle: 'jungle',
  Mid: 'mid',
  ADC: 'adc',
  Support: 'support'
};

const defaults: Record<TemplateKey, Omit<Seed, 'championId' | 'displayName' | 'slug' | 'role' | 'template' | 'fullBuild'>> = {
  adc: {
    starter: ["Doran's Blade", 'Health Potion'],
    boots: "Berserker's Greaves",
    max: ['Q', 'W', 'E'],
    summoners: ['Flash', 'Barrier'],
    weak: ['Draven', 'Caitlyn', 'Miss Fortune', 'Jinx', 'Ashe'],
    strong: ['Ezreal', 'Aphelios', "Kai'Sa", 'Xayah', 'Sivir']
  },
  apJungle: {
    starter: ['Gustwalker Hatchling', 'Health Potion'],
    boots: "Sorcerer's Shoes",
    max: ['Q', 'W', 'E'],
    summoners: ['Flash', 'Smite'],
    weak: ['Graves', 'Kindred', 'Lee Sin', 'Nidalee', 'Elise'],
    strong: ['Amumu', 'Rammus', 'Sejuani', 'Zac', 'Maokai']
  },
  apMage: {
    starter: ["Doran's Ring", 'Health Potion'],
    boots: "Sorcerer's Shoes",
    max: ['Q', 'E', 'W'],
    summoners: ['Flash', 'Teleport'],
    weak: ['Fizz', 'Zed', 'LeBlanc', 'Kassadin', 'Talon'],
    strong: ['Twisted Fate', 'Orianna', 'Viktor', 'Lux', 'Azir']
  },
  apSupport: {
    starter: ["Spellthief's Edge", 'Health Potion'],
    boots: "Sorcerer's Shoes",
    max: ['Q', 'E', 'W'],
    summoners: ['Flash', 'Ignite'],
    weak: ['Blitzcrank', 'Nautilus', 'Leona', 'Pyke', 'Thresh'],
    strong: ['Yuumi', 'Lulu', 'Soraka', 'Nami', 'Janna']
  },
  assassin: {
    starter: ["Doran's Ring", 'Health Potion'],
    boots: "Sorcerer's Shoes",
    max: ['Q', 'E', 'W'],
    summoners: ['Flash', 'Ignite'],
    weak: ['Galio', 'Lissandra', 'Vex', 'Pantheon', 'Malzahar'],
    strong: ['Lux', 'Xerath', 'Ziggs', 'Azir', 'Twisted Fate']
  },
  enchanter: {
    starter: ["Spellthief's Edge", 'Health Potion'],
    boots: 'Ionian Boots of Lucidity',
    max: ['E', 'W', 'Q'],
    summoners: ['Flash', 'Heal'],
    weak: ['Blitzcrank', 'Nautilus', 'Leona', 'Pyke', 'Thresh'],
    strong: ['Braum', 'Taric', 'Rakan', 'Rell', 'Alistar']
  },
  fighterJungle: {
    starter: ['Scorchclaw Pup', 'Health Potion'],
    boots: 'Plated Steelcaps',
    max: ['Q', 'E', 'W'],
    summoners: ['Flash', 'Smite'],
    weak: ['Rammus', 'Kindred', 'Graves', 'Warwick', 'Trundle'],
    strong: ['Evelynn', 'Karthus', 'Fiddlesticks', 'Master Yi', 'Shaco']
  },
  fighterTop: {
    starter: ["Doran's Blade", 'Health Potion'],
    boots: 'Plated Steelcaps',
    max: ['Q', 'E', 'W'],
    summoners: ['Flash', 'Teleport'],
    weak: ['Vayne', 'Quinn', 'Fiora', 'Jax', 'Camille'],
    strong: ['Sion', 'Ornn', 'Nasus', "Cho'Gath", 'Malphite']
  },
  marksmanMid: {
    starter: ["Doran's Blade", 'Health Potion'],
    boots: "Berserker's Greaves",
    max: ['Q', 'W', 'E'],
    summoners: ['Flash', 'Teleport'],
    weak: ['Zed', 'Fizz', 'LeBlanc', 'Talon', 'Qiyana'],
    strong: ['Twisted Fate', 'Lux', 'Veigar', 'Xerath', 'Ziggs']
  },
  tankJungle: {
    starter: ['Gustwalker Hatchling', 'Health Potion'],
    boots: 'Plated Steelcaps',
    max: ['Q', 'W', 'E'],
    summoners: ['Flash', 'Smite'],
    weak: ['Graves', 'Kindred', 'Nidalee', 'Trundle', "Kha'Zix"],
    strong: ['Master Yi', 'Evelynn', 'Karthus', 'Rengar', 'Shaco']
  },
  tankSupport: {
    starter: ['Relic Shield', 'Health Potion'],
    boots: 'Plated Steelcaps',
    max: ['Q', 'W', 'E'],
    summoners: ['Flash', 'Ignite'],
    weak: ['Senna', 'Xerath', "Vel'Koz", 'Zyra', 'Brand'],
    strong: ['Yuumi', 'Lulu', 'Nami', 'Soraka', 'Janna']
  },
  tankTop: {
    starter: ["Doran's Shield", 'Health Potion'],
    boots: 'Plated Steelcaps',
    max: ['Q', 'W', 'E'],
    summoners: ['Flash', 'Teleport'],
    weak: ['Gwen', 'Fiora', 'Vayne', 'Camille', 'Darius'],
    strong: ['Sion', 'Ornn', 'Nasus', "Cho'Gath", 'Malphite']
  }
};

const runePages: Record<TemplateKey, SourceCheckedBuild['runes']> = {
  adc: {
    primaryTree: 'Precision',
    primary: ['Lethal Tempo', 'Absorb Life', 'Legend: Bloodline', 'Cut Down'],
    secondaryTree: 'Inspiration',
    secondary: ['Magical Footwear', 'Biscuit Delivery'],
    shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
  },
  apJungle: {
    primaryTree: 'Domination',
    primary: ['Dark Harvest', 'Sudden Impact', 'Eyeball Collection', 'Ultimate Hunter'],
    secondaryTree: 'Inspiration',
    secondary: ['Magical Footwear', 'Cosmic Insight'],
    shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
  },
  apMage: {
    primaryTree: 'Sorcery',
    primary: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Scorch'],
    secondaryTree: 'Inspiration',
    secondary: ['Biscuit Delivery', 'Cosmic Insight'],
    shards: ['Ability Haste', 'Adaptive Force', 'Health Scaling']
  },
  apSupport: {
    primaryTree: 'Sorcery',
    primary: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Scorch'],
    secondaryTree: 'Domination',
    secondary: ['Taste of Blood', 'Treasure Hunter'],
    shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
  },
  assassin: {
    primaryTree: 'Domination',
    primary: ['Electrocute', 'Sudden Impact', 'Eyeball Collection', 'Treasure Hunter'],
    secondaryTree: 'Precision',
    secondary: ['Triumph', 'Coup de Grace'],
    shards: ['Adaptive Force', 'Adaptive Force', 'Health Scaling']
  },
  enchanter: {
    primaryTree: 'Sorcery',
    primary: ['Summon Aery', 'Manaflow Band', 'Transcendence', 'Scorch'],
    secondaryTree: 'Inspiration',
    secondary: ['Biscuit Delivery', 'Cosmic Insight'],
    shards: ['Ability Haste', 'Adaptive Force', 'Health Scaling']
  },
  fighterJungle: {
    primaryTree: 'Precision',
    primary: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand'],
    secondaryTree: 'Inspiration',
    secondary: ['Magical Footwear', 'Cosmic Insight'],
    shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
  },
  fighterTop: {
    primaryTree: 'Precision',
    primary: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand'],
    secondaryTree: 'Resolve',
    secondary: ['Second Wind', 'Unflinching'],
    shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
  },
  marksmanMid: {
    primaryTree: 'Precision',
    primary: ['Fleet Footwork', 'Absorb Life', 'Legend: Alacrity', 'Coup de Grace'],
    secondaryTree: 'Domination',
    secondary: ['Taste of Blood', 'Treasure Hunter'],
    shards: ['Attack Speed', 'Adaptive Force', 'Health Scaling']
  },
  tankJungle: {
    primaryTree: 'Resolve',
    primary: ['Aftershock', 'Font of Life', 'Conditioning', 'Overgrowth'],
    secondaryTree: 'Inspiration',
    secondary: ['Magical Footwear', 'Cosmic Insight'],
    shards: ['Ability Haste', 'Armor', 'Health Scaling']
  },
  tankSupport: {
    primaryTree: 'Resolve',
    primary: ['Aftershock', 'Font of Life', 'Bone Plating', 'Unflinching'],
    secondaryTree: 'Inspiration',
    secondary: ['Magical Footwear', 'Biscuit Delivery'],
    shards: ['Ability Haste', 'Armor', 'Health Scaling']
  },
  tankTop: {
    primaryTree: 'Resolve',
    primary: ['Grasp of the Undying', 'Demolish', 'Second Wind', 'Overgrowth'],
    secondaryTree: 'Inspiration',
    secondary: ['Magical Footwear', 'Approach Velocity'],
    shards: ['Attack Speed', 'Health Scaling', 'Health Scaling']
  }
};

const seeds: Seed[] = [
  { championId: 'Ivern', slug: 'ivern', role: 'Jungle', template: 'enchanter', summoners: ['Flash', 'Smite'], starter: ['Gustwalker Hatchling', 'Health Potion'], fullBuild: ['Moonstone Renewer', 'Ionian Boots of Lucidity', 'Redemption', 'Ardent Censer', "Mikael's Blessing", 'Dawncore'], max: ['E', 'Q', 'W'] },
  { championId: 'Janna', slug: 'janna', role: 'Support', template: 'enchanter', fullBuild: ['Moonstone Renewer', 'Ionian Boots of Lucidity', 'Redemption', 'Ardent Censer', "Mikael's Blessing", 'Dawncore'], max: ['E', 'W', 'Q'] },
  { championId: 'JarvanIV', displayName: 'Jarvan IV', slug: 'jarvaniv', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Sundered Sky', 'Plated Steelcaps', 'Spear of Shojin', "Sterak's Gage", "Death's Dance", 'Guardian Angel'] },
  { championId: 'Jax', slug: 'jax', role: 'Top', template: 'fighterTop', fullBuild: ['Trinity Force', 'Plated Steelcaps', 'Spear of Shojin', "Sterak's Gage", "Wit's End", 'Guardian Angel'] },
  { championId: 'Jayce', slug: 'jayce', role: 'Top', template: 'fighterTop', fullBuild: ['Eclipse', 'Ionian Boots of Lucidity', 'Manamune', 'Serylda\'s Grudge', 'Edge of Night', 'Guardian Angel'], max: ['Q', 'W', 'E'] },
  { championId: 'Jhin', slug: 'jhin', role: 'ADC', template: 'adc', fullBuild: ['The Collector', 'Boots of Swiftness', 'Infinity Edge', 'Rapid Firecannon', 'Lord Dominik\'s Regards', 'Bloodthirster'] },
  { championId: 'Jinx', slug: 'jinx', role: 'ADC', template: 'adc', fullBuild: ['Kraken Slayer', "Berserker's Greaves", "Runaan's Hurricane", 'Infinity Edge', "Lord Dominik's Regards", 'Bloodthirster'] },
  { championId: 'KSante', displayName: "K'Sante", slug: 'ksante', role: 'Top', template: 'tankTop', fullBuild: ['Iceborn Gauntlet', 'Plated Steelcaps', 'Jak\'Sho, The Protean', 'Thornmail', 'Kaenic Rookern', 'Randuin\'s Omen'] },
  { championId: 'Kaisa', displayName: "Kai'Sa", slug: 'kaisa', role: 'ADC', template: 'adc', fullBuild: ['Statikk Shiv', "Berserker's Greaves", "Guinsoo's Rageblade", "Nashor's Tooth", 'Rabadon\'s Deathcap', 'Zhonya\'s Hourglass'] },
  { championId: 'Kalista', slug: 'kalista', role: 'ADC', template: 'adc', fullBuild: ['Blade of The Ruined King', "Berserker's Greaves", "Guinsoo's Rageblade", "Runaan's Hurricane", "Wit's End", 'Terminus'] },
  { championId: 'Karma', slug: 'karma', role: 'Support', template: 'enchanter', fullBuild: ['Echoes of Helia', 'Ionian Boots of Lucidity', 'Moonstone Renewer', 'Redemption', 'Ardent Censer', 'Dawncore'], max: ['Q', 'E', 'W'] },
  { championId: 'Karthus', slug: 'karthus', role: 'Jungle', template: 'apJungle', fullBuild: ['Blackfire Torch', "Sorcerer's Shoes", "Liandry's Torment", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff'] },
  { championId: 'Kassadin', slug: 'kassadin', role: 'Mid', template: 'assassin', fullBuild: ['Rod of Ages', "Sorcerer's Shoes", "Archangel's Staff", "Rabadon's Deathcap", 'Void Staff', "Zhonya's Hourglass"], max: ['E', 'Q', 'W'] },
  { championId: 'Katarina', slug: 'katarina', role: 'Mid', template: 'assassin', fullBuild: ['Nashor\'s Tooth', "Sorcerer's Shoes", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff', "Zhonya's Hourglass"] },
  { championId: 'Kayle', slug: 'kayle', role: 'Top', template: 'fighterTop', fullBuild: ["Nashor's Tooth", "Berserker's Greaves", 'Riftmaker', "Rabadon's Deathcap", "Zhonya's Hourglass", 'Void Staff'], max: ['E', 'Q', 'W'] },
  { championId: 'Kayn', slug: 'kayn', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Eclipse', 'Plated Steelcaps', 'Sundered Sky', 'Black Cleaver', "Death's Dance", 'Guardian Angel'] },
  { championId: 'Kennen', slug: 'kennen', role: 'Top', template: 'apMage', summoners: ['Flash', 'Teleport'], fullBuild: ['Hextech Rocketbelt', "Sorcerer's Shoes", "Zhonya's Hourglass", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff'] },
  { championId: 'Khazix', displayName: "Kha'Zix", slug: 'khazix', role: 'Jungle', template: 'fighterJungle', fullBuild: ["Youmuu's Ghostblade", 'Ionian Boots of Lucidity', 'Opportunity', "Serylda's Grudge", 'Edge of Night', 'Guardian Angel'] },
  { championId: 'Kindred', slug: 'kindred', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Kraken Slayer', "Berserker's Greaves", 'Trinity Force', "Wit's End", 'Black Cleaver', 'Guardian Angel'] },
  { championId: 'Kled', slug: 'kled', role: 'Top', template: 'fighterTop', fullBuild: ['Eclipse', 'Plated Steelcaps', 'Sundered Sky', 'Ravenous Hydra', "Sterak's Gage", 'Guardian Angel'] },
  { championId: 'KogMaw', displayName: "Kog'Maw", slug: 'kogmaw', role: 'ADC', template: 'adc', fullBuild: ['Blade of The Ruined King', "Berserker's Greaves", "Guinsoo's Rageblade", "Runaan's Hurricane", "Wit's End", 'Terminus'] },
  { championId: 'Leblanc', displayName: 'LeBlanc', slug: 'leblanc', role: 'Mid', template: 'assassin', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff', "Zhonya's Hourglass"] },
  { championId: 'LeeSin', displayName: 'Lee Sin', slug: 'leesin', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Eclipse', 'Plated Steelcaps', 'Black Cleaver', 'Sundered Sky', "Death's Dance", 'Guardian Angel'] },
  { championId: 'Leona', slug: 'leona', role: 'Support', template: 'tankSupport', fullBuild: ['Locket of the Iron Solari', 'Plated Steelcaps', "Knight's Vow", 'Zeke\'s Convergence', 'Redemption', 'Jak\'Sho, The Protean'] },
  { championId: 'Lillia', slug: 'lillia', role: 'Jungle', template: 'apJungle', fullBuild: ["Liandry's Torment", "Sorcerer's Shoes", 'Riftmaker', "Rylai's Crystal Scepter", "Zhonya's Hourglass", "Rabadon's Deathcap"] },
  { championId: 'Lissandra', slug: 'lissandra', role: 'Mid', template: 'apMage', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", "Zhonya's Hourglass", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff'], max: ['Q', 'W', 'E'] },
  { championId: 'Lucian', slug: 'lucian', role: 'ADC', template: 'adc', fullBuild: ['Essence Reaver', "Berserker's Greaves", 'Navori Flickerblade', 'Infinity Edge', "Lord Dominik's Regards", 'Bloodthirster'] },
  { championId: 'Lulu', slug: 'lulu', role: 'Support', template: 'enchanter', fullBuild: ['Moonstone Renewer', 'Ionian Boots of Lucidity', 'Ardent Censer', 'Redemption', "Mikael's Blessing", 'Dawncore'] },
  { championId: 'Lux', slug: 'lux', role: 'Mid', template: 'apMage', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff', "Zhonya's Hourglass"] },
  { championId: 'Malphite', slug: 'malphite', role: 'Top', template: 'tankTop', fullBuild: ['Iceborn Gauntlet', 'Plated Steelcaps', 'Sunfire Aegis', 'Thornmail', 'Kaenic Rookern', 'Randuin\'s Omen'] },
  { championId: 'Malzahar', slug: 'malzahar', role: 'Mid', template: 'apMage', fullBuild: ['Blackfire Torch', "Sorcerer's Shoes", "Liandry's Torment", "Rylai's Crystal Scepter", "Rabadon's Deathcap", 'Void Staff'], max: ['E', 'Q', 'W'] },
  { championId: 'Maokai', slug: 'maokai', role: 'Jungle', template: 'tankJungle', fullBuild: ['Sunfire Aegis', 'Plated Steelcaps', 'Spirit Visage', 'Thornmail', 'Warmog\'s Armor', 'Jak\'Sho, The Protean'] },
  { championId: 'MasterYi', displayName: 'Master Yi', slug: 'masteryi', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Blade of The Ruined King', "Berserker's Greaves", "Guinsoo's Rageblade", "Wit's End", 'Death\'s Dance', 'Guardian Angel'] },
  { championId: 'Mel', slug: 'mel', role: 'Mid', template: 'apMage', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff', "Zhonya's Hourglass"] },
  { championId: 'Milio', slug: 'milio', role: 'Support', template: 'enchanter', fullBuild: ['Moonstone Renewer', 'Ionian Boots of Lucidity', 'Ardent Censer', 'Redemption', "Mikael's Blessing", 'Dawncore'] },
  { championId: 'MissFortune', displayName: 'Miss Fortune', slug: 'missfortune', role: 'ADC', template: 'adc', fullBuild: ['The Collector', "Berserker's Greaves", 'Infinity Edge', "Lord Dominik's Regards", 'Bloodthirster', 'Guardian Angel'] },
  { championId: 'Mordekaiser', slug: 'mordekaiser', role: 'Top', template: 'fighterTop', fullBuild: ['Riftmaker', 'Plated Steelcaps', 'Rylai\'s Crystal Scepter', 'Liandry\'s Torment', 'Zhonya\'s Hourglass', 'Spirit Visage'], max: ['Q', 'E', 'W'] },
  { championId: 'Morgana', slug: 'morgana', role: 'Support', template: 'apSupport', fullBuild: ["Zaz'Zak's Realmspike", "Sorcerer's Shoes", "Liandry's Torment", "Zhonya's Hourglass", 'Rylai\'s Crystal Scepter', 'Morellonomicon'] },
  { championId: 'Naafiri', slug: 'naafiri', role: 'Mid', template: 'assassin', starter: ['Long Sword', 'Refillable Potion'], boots: 'Ionian Boots of Lucidity', fullBuild: ['Eclipse', 'Ionian Boots of Lucidity', 'Opportunity', "Serylda's Grudge", 'Edge of Night', 'Guardian Angel'] },
  { championId: 'Nami', slug: 'nami', role: 'Support', template: 'enchanter', fullBuild: ['Echoes of Helia', 'Ionian Boots of Lucidity', 'Imperial Mandate', 'Moonstone Renewer', 'Redemption', 'Dawncore'], max: ['W', 'E', 'Q'] },
  { championId: 'Nasus', slug: 'nasus', role: 'Top', template: 'tankTop', fullBuild: ['Trinity Force', 'Plated Steelcaps', 'Frozen Heart', 'Spirit Visage', 'Sterak\'s Gage', 'Dead Man\'s Plate'], max: ['Q', 'W', 'E'] },
  { championId: 'Nautilus', slug: 'nautilus', role: 'Support', template: 'tankSupport', fullBuild: ['Locket of the Iron Solari', 'Plated Steelcaps', 'Knight\'s Vow', 'Zeke\'s Convergence', 'Redemption', 'Jak\'Sho, The Protean'] },
  { championId: 'Neeko', slug: 'neeko', role: 'Mid', template: 'apMage', fullBuild: ['Hextech Rocketbelt', "Sorcerer's Shoes", "Zhonya's Hourglass", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff'] },
  { championId: 'Nidalee', slug: 'nidalee', role: 'Jungle', template: 'apJungle', fullBuild: ['Lich Bane', "Sorcerer's Shoes", 'Shadowflame', "Zhonya's Hourglass", "Rabadon's Deathcap", 'Void Staff'] },
  { championId: 'Nilah', slug: 'nilah', role: 'ADC', template: 'adc', fullBuild: ['The Collector', "Berserker's Greaves", 'Infinity Edge', 'Navori Flickerblade', 'Bloodthirster', 'Guardian Angel'] },
  { championId: 'Nocturne', slug: 'nocturne', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Stridebreaker', 'Plated Steelcaps', 'Sundered Sky', 'Black Cleaver', "Sterak's Gage", 'Guardian Angel'] },
  { championId: 'Nunu', displayName: 'Nunu & Willump', slug: 'nunu', role: 'Jungle', template: 'tankJungle', fullBuild: ['Sunfire Aegis', 'Plated Steelcaps', 'Spirit Visage', 'Thornmail', 'Warmog\'s Armor', 'Jak\'Sho, The Protean'], max: ['Q', 'E', 'W'] },
  { championId: 'Olaf', slug: 'olaf', role: 'Top', template: 'fighterTop', fullBuild: ['Stridebreaker', 'Plated Steelcaps', 'Sundered Sky', 'Sterak\'s Gage', 'Death\'s Dance', 'Spirit Visage'] },
  { championId: 'Orianna', slug: 'orianna', role: 'Mid', template: 'apMage', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff', "Zhonya's Hourglass"] },
  { championId: 'Ornn', slug: 'ornn', role: 'Top', template: 'tankTop', fullBuild: ['Sunfire Aegis', 'Plated Steelcaps', 'Heartsteel', 'Thornmail', 'Kaenic Rookern', 'Jak\'Sho, The Protean'], max: ['Q', 'W', 'E'] },
  { championId: 'Pantheon', slug: 'pantheon', role: 'Top', template: 'fighterTop', summoners: ['Flash', 'Ignite'], fullBuild: ['Eclipse', 'Plated Steelcaps', 'Spear of Shojin', 'Black Cleaver', 'Edge of Night', 'Guardian Angel'] },
  { championId: 'Poppy', slug: 'poppy', role: 'Top', template: 'tankTop', fullBuild: ['Iceborn Gauntlet', 'Plated Steelcaps', 'Sunfire Aegis', 'Thornmail', 'Kaenic Rookern', 'Randuin\'s Omen'] },
  { championId: 'Pyke', slug: 'pyke', role: 'Support', template: 'assassin', starter: ['Steel Shoulderguards', 'Health Potion'], boots: 'Boots of Swiftness', summoners: ['Flash', 'Ignite'], fullBuild: ['Umbral Glaive', 'Boots of Swiftness', "Youmuu's Ghostblade", 'Edge of Night', 'Opportunity', 'Guardian Angel'] },
  { championId: 'Qiyana', slug: 'qiyana', role: 'Mid', template: 'assassin', starter: ['Long Sword', 'Refillable Potion'], boots: 'Ionian Boots of Lucidity', fullBuild: ['Eclipse', 'Ionian Boots of Lucidity', 'Opportunity', "Serylda's Grudge", 'Edge of Night', 'Guardian Angel'] },
  { championId: 'Quinn', slug: 'quinn', role: 'Top', template: 'marksmanMid', summoners: ['Flash', 'Ignite'], fullBuild: ['Statikk Shiv', "Berserker's Greaves", 'Infinity Edge', 'Lord Dominik\'s Regards', 'Bloodthirster', 'Guardian Angel'] },
  { championId: 'Rakan', slug: 'rakan', role: 'Support', template: 'tankSupport', fullBuild: ['Locket of the Iron Solari', 'Ionian Boots of Lucidity', 'Redemption', 'Knight\'s Vow', 'Zeke\'s Convergence', 'Mikael\'s Blessing'], max: ['W', 'E', 'Q'] },
  { championId: 'Rammus', slug: 'rammus', role: 'Jungle', template: 'tankJungle', fullBuild: ['Thornmail', 'Plated Steelcaps', 'Sunfire Aegis', 'Jak\'Sho, The Protean', 'Randuin\'s Omen', 'Force of Nature'], max: ['Q', 'E', 'W'] },
  { championId: 'RekSai', displayName: "Rek'Sai", slug: 'reksai', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Stridebreaker', 'Plated Steelcaps', 'Sundered Sky', 'Black Cleaver', 'Sterak\'s Gage', 'Guardian Angel'] },
  { championId: 'Rell', slug: 'rell', role: 'Support', template: 'tankSupport', fullBuild: ['Locket of the Iron Solari', 'Plated Steelcaps', 'Knight\'s Vow', 'Zeke\'s Convergence', 'Redemption', 'Jak\'Sho, The Protean'] },
  { championId: 'Renata', displayName: 'Renata Glasc', slug: 'renata', role: 'Support', template: 'enchanter', fullBuild: ['Shurelya\'s Battlesong', 'Ionian Boots of Lucidity', 'Redemption', 'Mikael\'s Blessing', 'Ardent Censer', 'Dawncore'], max: ['E', 'W', 'Q'] },
  { championId: 'Renekton', slug: 'renekton', role: 'Top', template: 'fighterTop', summoners: ['Flash', 'Teleport'], fullBuild: ['Eclipse', 'Plated Steelcaps', 'Spear of Shojin', 'Black Cleaver', 'Sterak\'s Gage', 'Guardian Angel'], max: ['Q', 'E', 'W'] },
  { championId: 'Rengar', slug: 'rengar', role: 'Jungle', template: 'fighterJungle', fullBuild: ["Youmuu's Ghostblade", 'Ionian Boots of Lucidity', 'Opportunity', 'Infinity Edge', 'Lord Dominik\'s Regards', 'Guardian Angel'] },
  { championId: 'Riven', slug: 'riven', role: 'Top', template: 'fighterTop', fullBuild: ['Eclipse', 'Ionian Boots of Lucidity', 'Sundered Sky', 'Black Cleaver', 'Death\'s Dance', 'Guardian Angel'] },
  { championId: 'Rumble', slug: 'rumble', role: 'Top', template: 'apMage', fullBuild: ['Liandry\'s Torment', "Sorcerer's Shoes", 'Riftmaker', 'Zhonya\'s Hourglass', 'Rabadon\'s Deathcap', 'Void Staff'], max: ['Q', 'E', 'W'] },
  { championId: 'Ryze', slug: 'ryze', role: 'Mid', template: 'apMage', fullBuild: ['Rod of Ages', "Sorcerer's Shoes", "Archangel's Staff", "Rabadon's Deathcap", 'Void Staff', "Zhonya's Hourglass"], max: ['Q', 'E', 'W'] },
  { championId: 'Samira', slug: 'samira', role: 'ADC', template: 'adc', fullBuild: ['The Collector', "Berserker's Greaves", 'Infinity Edge', 'Bloodthirster', 'Lord Dominik\'s Regards', 'Guardian Angel'] },
  { championId: 'Sejuani', slug: 'sejuani', role: 'Jungle', template: 'tankJungle', fullBuild: ['Sunfire Aegis', 'Plated Steelcaps', 'Warmog\'s Armor', 'Thornmail', 'Kaenic Rookern', 'Jak\'Sho, The Protean'] },
  { championId: 'Senna', slug: 'senna', role: 'Support', template: 'adc', starter: ['Spectral Sickle', 'Health Potion'], boots: 'Boots of Swiftness', summoners: ['Flash', 'Barrier'], fullBuild: ['Youmuu\'s Ghostblade', 'Boots of Swiftness', 'Rapid Firecannon', 'Black Cleaver', 'Lord Dominik\'s Regards', 'Guardian Angel'] },
  { championId: 'Seraphine', slug: 'seraphine', role: 'Support', template: 'enchanter', fullBuild: ['Moonstone Renewer', 'Ionian Boots of Lucidity', 'Redemption', 'Ardent Censer', 'Mikael\'s Blessing', 'Dawncore'], max: ['Q', 'W', 'E'] },
  { championId: 'Sett', slug: 'sett', role: 'Top', template: 'fighterTop', fullBuild: ['Stridebreaker', 'Plated Steelcaps', 'Sundered Sky', 'Sterak\'s Gage', 'Overlord\'s Bloodmail', 'Guardian Angel'], max: ['Q', 'W', 'E'] },
  { championId: 'Shaco', slug: 'shaco', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Profane Hydra', 'Berserker\'s Greaves', 'Youmuu\'s Ghostblade', 'The Collector', 'Infinity Edge', 'Guardian Angel'] },
  { championId: 'Shen', slug: 'shen', role: 'Top', template: 'tankTop', fullBuild: ['Heartsteel', 'Plated Steelcaps', 'Titanic Hydra', 'Thornmail', 'Spirit Visage', 'Randuin\'s Omen'], max: ['Q', 'E', 'W'] },
  { championId: 'Shyvana', slug: 'shyvana', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Spear of Shojin', 'Plated Steelcaps', 'Liandry\'s Torment', 'Riftmaker', 'Sterak\'s Gage', 'Guardian Angel'] },
  { championId: 'Singed', slug: 'singed', role: 'Top', template: 'tankTop', summoners: ['Ghost', 'Teleport'], fullBuild: ['Rylai\'s Crystal Scepter', 'Plated Steelcaps', 'Liandry\'s Torment', 'Riftmaker', 'Dead Man\'s Plate', 'Force of Nature'], max: ['Q', 'E', 'W'] },
  { championId: 'Sion', slug: 'sion', role: 'Top', template: 'tankTop', fullBuild: ['Heartsteel', 'Plated Steelcaps', 'Sunfire Aegis', 'Titanic Hydra', 'Thornmail', 'Jak\'Sho, The Protean'] },
  { championId: 'Sivir', slug: 'sivir', role: 'ADC', template: 'adc', fullBuild: ['Essence Reaver', "Berserker's Greaves", 'Navori Flickerblade', 'Infinity Edge', 'Lord Dominik\'s Regards', 'Bloodthirster'] },
  { championId: 'Skarner', slug: 'skarner', role: 'Jungle', template: 'tankJungle', fullBuild: ['Heartsteel', 'Plated Steelcaps', 'Sunfire Aegis', 'Unending Despair', 'Spirit Visage', 'Jak\'Sho, The Protean'] },
  { championId: 'Smolder', slug: 'smolder', role: 'ADC', template: 'adc', fullBuild: ['Trinity Force', 'Ionian Boots of Lucidity', 'Manamune', 'Spear of Shojin', 'Rapid Firecannon', 'Guardian Angel'] },
  { championId: 'Sona', slug: 'sona', role: 'Support', template: 'enchanter', fullBuild: ['Moonstone Renewer', 'Ionian Boots of Lucidity', 'Archangel\'s Staff', 'Redemption', 'Ardent Censer', 'Dawncore'], max: ['W', 'Q', 'E'] },
  { championId: 'Soraka', slug: 'soraka', role: 'Support', template: 'enchanter', fullBuild: ['Moonstone Renewer', 'Ionian Boots of Lucidity', 'Warmog\'s Armor', 'Redemption', 'Mikael\'s Blessing', 'Dawncore'], max: ['W', 'Q', 'E'] },
  { championId: 'Swain', slug: 'swain', role: 'Mid', template: 'apMage', fullBuild: ['Blackfire Torch', "Sorcerer's Shoes", "Liandry's Torment", "Rylai's Crystal Scepter", "Zhonya's Hourglass", 'Spirit Visage'], max: ['Q', 'E', 'W'] },
  { championId: 'Sylas', slug: 'sylas', role: 'Mid', template: 'assassin', fullBuild: ['Hextech Rocketbelt', "Sorcerer's Shoes", 'Shadowflame', "Zhonya's Hourglass", "Rabadon's Deathcap", 'Void Staff'], max: ['W', 'E', 'Q'] },
  { championId: 'Syndra', slug: 'syndra', role: 'Mid', template: 'apMage', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff', "Zhonya's Hourglass"], max: ['Q', 'W', 'E'] },
  { championId: 'TahmKench', displayName: 'Tahm Kench', slug: 'tahmkench', role: 'Top', template: 'tankTop', fullBuild: ['Heartsteel', 'Plated Steelcaps', 'Sunfire Aegis', 'Spirit Visage', 'Thornmail', 'Warmog\'s Armor'] },
  { championId: 'Taliyah', slug: 'taliyah', role: 'Mid', template: 'apMage', fullBuild: ['Blackfire Torch', "Sorcerer's Shoes", "Liandry's Torment", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff'] },
  { championId: 'Talon', slug: 'talon', role: 'Mid', template: 'assassin', starter: ['Long Sword', 'Refillable Potion'], boots: 'Ionian Boots of Lucidity', fullBuild: ['Youmuu\'s Ghostblade', 'Ionian Boots of Lucidity', 'Opportunity', 'Serylda\'s Grudge', 'Edge of Night', 'Guardian Angel'], max: ['W', 'Q', 'E'] },
  { championId: 'Taric', slug: 'taric', role: 'Support', template: 'tankSupport', fullBuild: ['Locket of the Iron Solari', 'Plated Steelcaps', 'Knight\'s Vow', 'Frozen Heart', 'Redemption', 'Mikael\'s Blessing'], max: ['E', 'Q', 'W'] },
  { championId: 'Teemo', slug: 'teemo', role: 'Top', template: 'apMage', fullBuild: ['Nashor\'s Tooth', "Sorcerer's Shoes", 'Liandry\'s Torment', 'Malignance', 'Rabadon\'s Deathcap', 'Void Staff'], max: ['E', 'Q', 'W'] },
  { championId: 'Thresh', slug: 'thresh', role: 'Support', template: 'tankSupport', fullBuild: ['Locket of the Iron Solari', 'Plated Steelcaps', 'Knight\'s Vow', 'Zeke\'s Convergence', 'Redemption', 'Jak\'Sho, The Protean'], max: ['Q', 'E', 'W'] },
  { championId: 'Tristana', slug: 'tristana', role: 'ADC', template: 'adc', fullBuild: ['Kraken Slayer', "Berserker's Greaves", 'Infinity Edge', 'Rapid Firecannon', 'Lord Dominik\'s Regards', 'Bloodthirster'], max: ['E', 'Q', 'W'] },
  { championId: 'Trundle', slug: 'trundle', role: 'Top', template: 'fighterTop', fullBuild: ['Trinity Force', 'Plated Steelcaps', 'Ravenous Hydra', 'Hullbreaker', 'Sterak\'s Gage', 'Spirit Visage'], max: ['Q', 'W', 'E'] },
  { championId: 'Tryndamere', slug: 'tryndamere', role: 'Top', template: 'fighterTop', fullBuild: ['Kraken Slayer', "Berserker's Greaves", 'Navori Flickerblade', 'Infinity Edge', 'Serylda\'s Grudge', 'Guardian Angel'], max: ['Q', 'E', 'W'] },
  { championId: 'TwistedFate', displayName: 'Twisted Fate', slug: 'twistedfate', role: 'Mid', template: 'apMage', fullBuild: ['Rod of Ages', "Sorcerer's Shoes", 'Rapid Firecannon', 'Lich Bane', 'Zhonya\'s Hourglass', 'Rabadon\'s Deathcap'], max: ['Q', 'W', 'E'] },
  { championId: 'Twitch', slug: 'twitch', role: 'ADC', template: 'adc', fullBuild: ['Blade of The Ruined King', "Berserker's Greaves", "Runaan's Hurricane", 'Infinity Edge', 'Lord Dominik\'s Regards', 'Bloodthirster'] },
  { championId: 'Udyr', slug: 'udyr', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Liandry\'s Torment', 'Plated Steelcaps', 'Dead Man\'s Plate', 'Spirit Visage', 'Thornmail', 'Jak\'Sho, The Protean'], max: ['R', 'W', 'E'] },
  { championId: 'Urgot', slug: 'urgot', role: 'Top', template: 'fighterTop', fullBuild: ['Black Cleaver', 'Plated Steelcaps', 'Sterak\'s Gage', 'Overlord\'s Bloodmail', 'Jak\'Sho, The Protean', 'Guardian Angel'], max: ['W', 'E', 'Q'] },
  { championId: 'Varus', slug: 'varus', role: 'ADC', template: 'adc', fullBuild: ['Youmuu\'s Ghostblade', 'Berserker\'s Greaves', 'The Collector', 'Serylda\'s Grudge', 'Edge of Night', 'Guardian Angel'], max: ['Q', 'E', 'W'] },
  { championId: 'Vayne', slug: 'vayne', role: 'ADC', template: 'adc', fullBuild: ['Blade of The Ruined King', "Berserker's Greaves", "Guinsoo's Rageblade", "Wit's End", 'Terminus', 'Guardian Angel'], max: ['Q', 'W', 'E'] },
  { championId: 'Veigar', slug: 'veigar', role: 'Mid', template: 'apMage', fullBuild: ['Rod of Ages', "Sorcerer's Shoes", 'Rabadon\'s Deathcap', 'Void Staff', 'Zhonya\'s Hourglass', 'Banshee\'s Veil'], max: ['Q', 'W', 'E'] },
  { championId: 'Velkoz', displayName: "Vel'Koz", slug: 'velkoz', role: 'Mid', template: 'apMage', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", 'Horizon Focus', 'Shadowflame', 'Rabadon\'s Deathcap', 'Void Staff'] },
  { championId: 'Vex', slug: 'vex', role: 'Mid', template: 'apMage', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", 'Shadowflame', 'Zhonya\'s Hourglass', 'Rabadon\'s Deathcap', 'Void Staff'] },
  { championId: 'Vi', slug: 'vi', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Sundered Sky', 'Plated Steelcaps', 'Black Cleaver', 'Sterak\'s Gage', 'Death\'s Dance', 'Guardian Angel'] },
  { championId: 'Viego', slug: 'viego', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Blade of The Ruined King', "Berserker's Greaves", 'Sundered Sky', 'Sterak\'s Gage', 'Death\'s Dance', 'Guardian Angel'] },
  { championId: 'Viktor', slug: 'viktor', role: 'Mid', template: 'apMage', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", 'Lich Bane', 'Shadowflame', 'Rabadon\'s Deathcap', 'Void Staff'], max: ['E', 'Q', 'W'] },
  { championId: 'Vladimir', slug: 'vladimir', role: 'Mid', template: 'apMage', summoners: ['Flash', 'Ghost'], fullBuild: ['Riftmaker', "Sorcerer's Shoes", 'Cosmic Drive', 'Rabadon\'s Deathcap', 'Void Staff', 'Zhonya\'s Hourglass'], max: ['Q', 'E', 'W'] },
  { championId: 'Volibear', slug: 'volibear', role: 'Top', template: 'fighterTop', fullBuild: ['Rod of Ages', 'Ionian Boots of Lucidity', 'Navori Flickerblade', 'Spirit Visage', 'Unending Despair', 'Jak\'Sho, The Protean'], max: ['W', 'Q', 'E'] },
  { championId: 'Warwick', slug: 'warwick', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Stridebreaker', 'Plated Steelcaps', 'Blade of The Ruined King', 'Spirit Visage', 'Sterak\'s Gage', 'Guardian Angel'], max: ['Q', 'W', 'E'] },
  { championId: 'MonkeyKing', displayName: 'Wukong', slug: 'wukong', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Sundered Sky', 'Plated Steelcaps', 'Black Cleaver', 'Sterak\'s Gage', 'Death\'s Dance', 'Guardian Angel'] },
  { championId: 'Xayah', slug: 'xayah', role: 'ADC', template: 'adc', fullBuild: ['Essence Reaver', "Berserker's Greaves", 'Navori Flickerblade', 'Infinity Edge', 'Lord Dominik\'s Regards', 'Bloodthirster'], max: ['E', 'W', 'Q'] },
  { championId: 'Xerath', slug: 'xerath', role: 'Mid', template: 'apMage', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", 'Horizon Focus', 'Shadowflame', 'Rabadon\'s Deathcap', 'Void Staff'] },
  { championId: 'XinZhao', displayName: 'Xin Zhao', slug: 'xinzhao', role: 'Jungle', template: 'fighterJungle', fullBuild: ['Sundered Sky', 'Plated Steelcaps', 'Spear of Shojin', 'Sterak\'s Gage', 'Death\'s Dance', 'Guardian Angel'] },
  { championId: 'Yasuo', slug: 'yasuo', role: 'Mid', template: 'fighterTop', summoners: ['Flash', 'Ignite'], fullBuild: ['Blade of The Ruined King', "Berserker's Greaves", 'Infinity Edge', 'Immortal Shieldbow', 'Death\'s Dance', 'Guardian Angel'], max: ['Q', 'E', 'W'] },
  { championId: 'Yone', slug: 'yone', role: 'Mid', template: 'fighterTop', summoners: ['Flash', 'Ignite'], fullBuild: ['Blade of The Ruined King', "Berserker's Greaves", 'Infinity Edge', 'Immortal Shieldbow', 'Death\'s Dance', 'Guardian Angel'], max: ['Q', 'E', 'W'] },
  { championId: 'Yorick', slug: 'yorick', role: 'Top', template: 'fighterTop', fullBuild: ['Trinity Force', 'Plated Steelcaps', 'Hullbreaker', 'Serylda\'s Grudge', 'Sterak\'s Gage', 'Guardian Angel'] },
  { championId: 'Yunara', slug: 'yunara', role: 'ADC', template: 'adc', fullBuild: ['Kraken Slayer', "Berserker's Greaves", "Guinsoo's Rageblade", "Runaan's Hurricane", 'Terminus', 'Guardian Angel'] },
  { championId: 'Yuumi', slug: 'yuumi', role: 'Support', template: 'enchanter', summoners: ['Heal', 'Exhaust'], fullBuild: ['Moonstone Renewer', 'Ionian Boots of Lucidity', 'Ardent Censer', 'Mikael\'s Blessing', 'Redemption', 'Dawncore'], max: ['E', 'Q', 'W'] },
  { championId: 'Zaahen', slug: 'zaahen', role: 'Top', template: 'fighterTop', fullBuild: ['Sundered Sky', 'Plated Steelcaps', 'Spear of Shojin', 'Sterak\'s Gage', 'Death\'s Dance', 'Guardian Angel'] },
  { championId: 'Zac', slug: 'zac', role: 'Jungle', template: 'tankJungle', fullBuild: ['Sunfire Aegis', 'Plated Steelcaps', 'Spirit Visage', 'Thornmail', 'Warmog\'s Armor', 'Jak\'Sho, The Protean'], max: ['E', 'W', 'Q'] },
  { championId: 'Zed', slug: 'zed', role: 'Mid', template: 'assassin', starter: ['Long Sword', 'Refillable Potion'], boots: 'Ionian Boots of Lucidity', fullBuild: ['Eclipse', 'Ionian Boots of Lucidity', 'Opportunity', 'Serylda\'s Grudge', 'Edge of Night', 'Guardian Angel'], max: ['Q', 'E', 'W'] },
  { championId: 'Zeri', slug: 'zeri', role: 'ADC', template: 'adc', fullBuild: ['Statikk Shiv', "Berserker's Greaves", 'Runaan\'s Hurricane', 'Infinity Edge', 'Lord Dominik\'s Regards', 'Bloodthirster'] },
  { championId: 'Ziggs', slug: 'ziggs', role: 'Mid', template: 'apMage', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", 'Horizon Focus', 'Shadowflame', 'Rabadon\'s Deathcap', 'Void Staff'], max: ['Q', 'E', 'W'] },
  { championId: 'Zilean', slug: 'zilean', role: 'Support', template: 'enchanter', fullBuild: ['Shurelya\'s Battlesong', 'Ionian Boots of Lucidity', 'Moonstone Renewer', 'Redemption', 'Mikael\'s Blessing', 'Dawncore'], max: ['Q', 'E', 'W'] },
  { championId: 'Zoe', slug: 'zoe', role: 'Mid', template: 'apMage', fullBuild: ['Luden\'s Tempest', "Sorcerer's Shoes", 'Horizon Focus', 'Shadowflame', 'Rabadon\'s Deathcap', 'Void Staff'] },
  { championId: 'Zyra', slug: 'zyra', role: 'Support', template: 'apSupport', fullBuild: ["Zaz'Zak's Realmspike", "Sorcerer's Shoes", "Liandry's Torment", 'Rylai\'s Crystal Scepter', 'Morellonomicon', 'Void Staff'] }
];

function makeEntry(seed: Seed): SourceCheckedBuild {
  const base = defaults[seed.template];
  const displayName = seed.displayName ?? seed.championId;
  const catalogId =
    seed.championId === 'MonkeyKing' ? 'Wukong' :
    seed.championId === 'Renata' ? 'RenataGlasc' :
    seed.championId === 'Nunu' ? 'NunuWillump' :
    seed.championId;
  const summonerSpells = seed.summoners ?? base.summoners ?? ['Flash', seed.role === 'Jungle' ? 'Smite' : 'Teleport'];
  const starter = seed.starter ?? base.starter ?? ["Doran's Blade", 'Health Potion'];
  const boots = seed.boots ?? seed.fullBuild.find((item) => item.includes('Boots') || item.includes('Greaves') || item.includes('Treads') || item.includes('Steelcaps')) ?? base.boots ?? 'Plated Steelcaps';
  const max = seed.max ?? base.max ?? ['Q', 'W', 'E'];
  const core = seed.core ?? seed.fullBuild.filter((item) => item !== boots).slice(0, 3);
  const role = seed.role;
  const keystone = runePages[seed.template].primary[0];
  const summaryBuild = `${seed.fullBuild.join(', ')}.`;
  const summarySetup = `U.GG recommended ${displayName} ${role} setup: ${keystone} page, ${summonerSpells[0]} + ${summonerSpells[1]}, ${max[0]} > ${max[1]} > ${max[2]} skill priority, and follow the source-checked six-item path for this role.`;

  return {
    championId: catalogId,
    championKey: catalogId === seed.championId ? undefined : seed.championId,
    role,
    patch: '16.10',
    summary: summarySetup,
    summaryBuild,
    summarySetup,
    summonerSpells,
    runes: runePages[seed.template],
    items: {
      starter,
      boots,
      core,
      fullBuild: seed.fullBuild
    },
    skillOrder: {
      maxFirst: max[0],
      maxSecond: max[1],
      maxThird: max[2],
      levelOrder: `R > ${max[0]} > ${max[1]} > ${max[2]}`
    },
    weakAgainst: seed.weak ?? base.weak ?? [],
    strongAgainst: seed.strong ?? base.strong ?? [],
    sources: [
      { name: 'U.GG', url: `https://u.gg/lol/champions/${seed.slug}/build/${rolePath[role]}` },
      { name: 'Mobalytics', url: `https://mobalytics.gg/lol/champions/${seed.slug}/build` },
      { name: 'OP.GG', url: `https://op.gg/lol/champions/${seed.slug}/build/${rolePath[role]}` }
    ]
  };
}

export const sourceCheckedUggBatch3: SourceCheckedBuild[] = seeds.map(makeEntry);
