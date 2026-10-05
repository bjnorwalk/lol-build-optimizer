export type EsportsRosterSlot = {
  role: 'Top' | 'Jungle' | 'Mid' | 'Bot' | 'Support';
  player: string;
};

export type EsportsMatch = {
  date: string;
  league: string;
  opponent: string;
  result: string;
  note: string;
};

export type EsportsTeam = {
  slug: string;
  name: string;
  region: string;
  league: string;
  rank: number;
  form: string;
  winRate: string;
  objectiveControl: string;
  roster: EsportsRosterSlot[];
  matches: EsportsMatch[];
};

export const esportsSources = [
  {
    name: 'Cito LoL Esports API',
    url: 'https://lolesportsapi.com/docs/api/league-of-legends/',
    note: 'Teams, rosters, schedules, match results, player stats, rankings, and objective-control endpoints.'
  },
  {
    name: 'PandaScore League of Legends API',
    url: 'https://www.pandascore.co/league-of-legends',
    note: 'Commercial esports fixture, roster, standings, and results data.'
  },
  {
    name: 'LoL Esports',
    url: 'https://lolesports.com',
    note: 'Official viewer-facing schedule and VOD source; API access is not as developer-friendly.'
  }
];

export const esportsEndpointPlan = [
  { label: 'Teams', endpoint: 'GET /api/v1/lol/teams' },
  { label: 'Roster', endpoint: 'GET /api/v1/lol/teams/{slug}/roster' },
  { label: 'Schedule', endpoint: 'GET /api/v1/lol/schedule/upcoming' },
  { label: 'Results', endpoint: 'GET /api/v1/lol/schedule/results' },
  { label: 'Team Stats', endpoint: 'GET /api/v1/lol/teams/{slug}/stats' },
  { label: 'Objectives', endpoint: 'GET /api/v1/lol/teams/{slug}/objectives' }
];

export const seededEsportsTeams: EsportsTeam[] = [
  {
    slug: 't1',
    name: 'T1',
    region: 'Korea',
    league: 'LCK',
    rank: 1,
    form: 'World-class macro',
    winRate: 'Live API pending',
    objectiveControl: 'Track dragons, Baron, and first tower via team objective endpoint.',
    roster: [
      { role: 'Top', player: 'Connect live roster' },
      { role: 'Jungle', player: 'Connect live roster' },
      { role: 'Mid', player: 'Connect live roster' },
      { role: 'Bot', player: 'Connect live roster' },
      { role: 'Support', player: 'Connect live roster' }
    ],
    matches: [
      { date: 'Upcoming', league: 'LCK', opponent: 'Use schedule API', result: 'TBD', note: 'Pull from /schedule/upcoming.' },
      { date: 'Recent', league: 'LCK', opponent: 'Use results API', result: 'TBD', note: 'Pull from /schedule/results.' }
    ]
  },
  {
    slug: 'geng',
    name: 'Gen.G',
    region: 'Korea',
    league: 'LCK',
    rank: 2,
    form: 'Elite laning and objective setup',
    winRate: 'Live API pending',
    objectiveControl: 'Compare dragon, Baron, herald/grub, and tower rates.',
    roster: [
      { role: 'Top', player: 'Connect live roster' },
      { role: 'Jungle', player: 'Connect live roster' },
      { role: 'Mid', player: 'Connect live roster' },
      { role: 'Bot', player: 'Connect live roster' },
      { role: 'Support', player: 'Connect live roster' }
    ],
    matches: [
      { date: 'Upcoming', league: 'LCK', opponent: 'Use schedule API', result: 'TBD', note: 'Pull from /schedule/upcoming.' },
      { date: 'Recent', league: 'LCK', opponent: 'Use results API', result: 'TBD', note: 'Pull from /schedule/results.' }
    ]
  },
  {
    slug: 'g2-esports',
    name: 'G2 Esports',
    region: 'EMEA',
    league: 'LEC',
    rank: 3,
    form: 'Creative drafts and fast side-lane pressure',
    winRate: 'Live API pending',
    objectiveControl: 'Track Baron setups, first dragon conversion, and gold leads.',
    roster: [
      { role: 'Top', player: 'Connect live roster' },
      { role: 'Jungle', player: 'Connect live roster' },
      { role: 'Mid', player: 'Connect live roster' },
      { role: 'Bot', player: 'Connect live roster' },
      { role: 'Support', player: 'Connect live roster' }
    ],
    matches: [
      { date: 'Upcoming', league: 'LEC', opponent: 'Use schedule API', result: 'TBD', note: 'Pull from /schedule/upcoming.' },
      { date: 'Recent', league: 'LEC', opponent: 'Use results API', result: 'TBD', note: 'Pull from /schedule/results.' }
    ]
  },
  {
    slug: 'team-liquid',
    name: 'Team Liquid',
    region: 'Americas',
    league: 'LCS',
    rank: 4,
    form: 'Stable macro and veteran teamfighting',
    winRate: 'Live API pending',
    objectiveControl: 'Track objective-control endpoint once esports key is connected.',
    roster: [
      { role: 'Top', player: 'Connect live roster' },
      { role: 'Jungle', player: 'Connect live roster' },
      { role: 'Mid', player: 'Connect live roster' },
      { role: 'Bot', player: 'Connect live roster' },
      { role: 'Support', player: 'Connect live roster' }
    ],
    matches: [
      { date: 'Upcoming', league: 'LCS', opponent: 'Use schedule API', result: 'TBD', note: 'Pull from /schedule/upcoming.' },
      { date: 'Recent', league: 'LCS', opponent: 'Use results API', result: 'TBD', note: 'Pull from /schedule/results.' }
    ]
  },
  {
    slug: 'bilibili-gaming',
    name: 'Bilibili Gaming',
    region: 'China',
    league: 'LPL',
    rank: 5,
    form: 'Explosive skirmishing and carry threats',
    winRate: 'Live API pending',
    objectiveControl: 'Use stats/objectives endpoints for current split performance.',
    roster: [
      { role: 'Top', player: 'Connect live roster' },
      { role: 'Jungle', player: 'Connect live roster' },
      { role: 'Mid', player: 'Connect live roster' },
      { role: 'Bot', player: 'Connect live roster' },
      { role: 'Support', player: 'Connect live roster' }
    ],
    matches: [
      { date: 'Upcoming', league: 'LPL', opponent: 'Use schedule API', result: 'TBD', note: 'Pull from /schedule/upcoming.' },
      { date: 'Recent', league: 'LPL', opponent: 'Use results API', result: 'TBD', note: 'Pull from /schedule/results.' }
    ]
  }
];
