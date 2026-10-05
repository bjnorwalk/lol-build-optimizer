import type { Champion } from '../types';

export type ChampionPatchNote = {
  patch: string;
  status: 'Buffed' | 'Nerfed' | 'Adjusted' | 'Unchanged';
  summary: string;
  sourceName: string;
  sourceUrl: string;
};

const latestPatch = {
  patch: '26.10',
  sourceName: 'Riot Patch 26.10 Notes',
  sourceUrl: 'https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-10-notes/'
};

const championPatchNotes: Record<string, ChampionPatchNote> = {
  Katarina: {
    ...latestPatch,
    status: 'Nerfed',
    summary: 'Passive refund on takedown was reduced in ARAM Mayhem balance notes.'
  },
  Shyvana: {
    ...latestPatch,
    status: 'Nerfed',
    summary: 'Emberstrike AD ratio was reduced, lowering some damage on AD-leaning setups.'
  },
  XinZhao: {
    ...latestPatch,
    status: 'Nerfed',
    summary: 'Three Talon Strike damage/cooldown and Audacious Charge AP-scaling attack speed/cooldown were reduced.'
  },
  XinZhaoDisplay: {
    ...latestPatch,
    status: 'Nerfed',
    summary: 'Three Talon Strike damage/cooldown and Audacious Charge AP-scaling attack speed/cooldown were reduced.'
  }
};

export function getChampionPatchNote(champion: Champion): ChampionPatchNote {
  const note = championPatchNotes[champion.id] ?? championPatchNotes[champion.name.replace(/[^A-Za-z]/g, '')];

  if (note) return note;

  return {
    ...latestPatch,
    status: 'Unchanged',
    summary: 'No direct champion-specific change is recorded in the local latest-patch note set. Check the source for system, item, or mode changes that may still affect this build.'
  };
}

