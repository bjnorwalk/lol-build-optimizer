import type { GameMode } from '../types';

export const gameModes: GameMode[] = ['Ranked', 'Ranked Flex', 'Quickplay', 'Normal Draft', 'ARAM', 'ARAM Mayhem', 'Arena'];

export const tierListLinks: Record<GameMode, Array<{ name: string; url: string }>> = {
  Ranked: [
    { name: 'U.GG Tier List', url: 'https://u.gg/lol/tier-list' },
    { name: 'OP.GG Champions', url: 'https://op.gg/lol/champions' },
    { name: 'MetaSRC Ranked', url: 'https://www.metasrc.com/lol' }
  ],
  'Ranked Flex': [
    { name: 'OP.GG Flex', url: 'https://op.gg/lol/champions?region=global&tier=platinum_plus&queue=ranked_flex_sr' },
    { name: 'MetaSRC Ranked', url: 'https://www.metasrc.com/lol' },
    { name: 'U.GG Tier List', url: 'https://u.gg/lol/tier-list' }
  ],
  Quickplay: [
    { name: 'Riot Swiftplay Guide', url: 'https://support-leagueoflegends.riotgames.com/hc/en-us/articles/22007849903507-Swiftplay-Quickplay-Guide' },
    { name: 'MetaSRC Swiftplay', url: 'https://www.metasrc.com/lol/swift/tier-list' },
    { name: 'MetaSRC Swift Builds', url: 'https://cloud.metasrc.com/lol/swift' }
  ],
  'Normal Draft': [
    { name: 'OP.GG Champions', url: 'https://op.gg/lol/champions' },
    { name: 'MetaSRC Ranked', url: 'https://www.metasrc.com/lol' },
    { name: 'U.GG Tier List', url: 'https://u.gg/lol/tier-list' }
  ],
  ARAM: [
    { name: 'U.GG ARAM', url: 'https://u.gg/lol/aram-tier-list' },
    { name: 'ARAM Zone', url: 'https://aram.zone' },
    { name: 'ARAM Build', url: 'https://www.aram.build' }
  ],
  'ARAM Mayhem': [
    { name: 'MetaSRC Mayhem', url: 'https://www.metasrc.com/en/lol/mayhem/tier-list' },
    { name: 'Mayhem Builds', url: 'https://www.metasrc.com/lol/mayhem' },
    { name: 'ARAM Mayhem Stats', url: 'https://arammayhem.com/' }
  ],
  Arena: [
    { name: 'MetaSRC Arena', url: 'https://www.metasrc.com/lol/arena' },
    { name: 'Arena Tier List', url: 'https://www.metasrc.com/lol/arena/tier-list' },
    { name: 'LeagueOfGraphs Arena', url: 'https://www.leagueofgraphs.com/champions/tier-list/arena' }
  ]
};
