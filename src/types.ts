export type Role = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support';

export type GameState = 'Ahead' | 'Even' | 'Behind';

export type GameMode = 'Ranked' | 'Ranked Flex' | 'Quickplay' | 'Normal Draft' | 'ARAM' | 'ARAM Mayhem' | 'Arena';

export type DamageType = 'AD' | 'AP' | 'Hybrid' | 'Tank' | 'Enchanter';

export type ThreatTag =
  | 'heavy-ad'
  | 'heavy-ap'
  | 'healing'
  | 'shields'
  | 'tanks'
  | 'assassins'
  | 'crowd-control'
  | 'poke';

export type ItemTag =
  | 'starter'
  | 'boots'
  | 'AD'
  | 'AP'
  | 'tank'
  | 'support'
  | 'attack-speed'
  | 'crit'
  | 'lethality'
  | 'magic-pen'
  | 'armor-pen'
  | 'health'
  | 'armor'
  | 'MR'
  | 'haste'
  | 'mana'
  | 'anti-heal'
  | 'anti-shield'
  | 'anti-tank'
  | 'anti-burst'
  | 'anti-magic'
  | 'stasis'
  | 'lifesteal'
  | 'omnivamp'
  | 'waveclear'
  | 'poke'
  | 'enchanter'
  | 'engage'
  | 'crowd-control'
  | 'snowball'
  | 'safe';

export type Champion = {
  id: string;
  name: string;
  key: string;
  image: string;
  tags: string[];
};

export type ChampionAbility = {
  id: string;
  key: string;
  name: string;
  description: string;
  image: string;
};

export type ChampionDetails = {
  id: string;
  title: string;
  lore: string;
  stats: Record<string, number>;
  passive: ChampionAbility;
  spells: ChampionAbility[];
};

export type RiotItem = {
  id: string;
  name: string;
  description: string;
  plaintext: string;
  image: string;
  gold: number;
  purchasable: boolean;
  maps: Record<string, boolean>;
  stats?: Record<string, number>;
};

export type SummonerSpell = {
  id: string;
  key: string;
  name: string;
  description: string;
  image: string;
};

export type Rune = {
  id: number;
  key: string;
  name: string;
  icon: string;
  treeName: string;
  treeId: number;
  treeKey: string;
  slotIndex: number;
};

export type ItemProfile = {
  id: string;
  name: string;
  tags: ItemTag[];
  roles?: Role[];
  damageTypes?: DamageType[];
};

export type ChampionProfile = {
  championId: string;
  roles: Role[];
  damageType: DamageType;
  coreItems: string[];
  starterItems: string[];
  boots: string[];
  wants: ItemTag[];
  source: 'curated' | 'generated';
};

export type Recommendation = {
  item: RiotItem;
  score: number;
  reasons: string[];
};

export type BuildRecommendation = {
  starters: Recommendation[];
  boots: Recommendation[];
  core: Recommendation[];
  late: Recommendation[];
  situational: Recommendation[];
  detectedThreats: ThreatTag[];
  profile: ChampionProfile;
};

export type SavedBuild = {
  id: string;
  name: string;
  championId: string;
  championName: string;
  role: Role;
  gameState: GameState;
  enemyIds: string[];
  enemyNames: string[];
  itemIds: string[];
  itemNames: string[];
  patch: string;
  createdAt: number;
};

export type CustomBuildDraft = {
  id: string;
  name: string;
  championId: string;
  championName: string;
  role: Role;
  patch: string;
  itemIds: string[];
  itemNames: string[];
  totalGold: number;
  createdAt: number;
  updatedAt: number;
};

export type CommunityBuildSubmission = {
  id: string;
  championId: string;
  championName: string;
  role: Role;
  title: string;
  author: string;
  items: string[];
  notes: string;
  upvotes: number;
  downvotes: number;
  comments: Array<{
    id: string;
    author: string;
    body: string;
    createdAt: number;
  }>;
  createdAt: number;
};
