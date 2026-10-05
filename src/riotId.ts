export type RiotRegion = 'na1' | 'euw1' | 'eun1' | 'kr' | 'br1' | 'la1' | 'la2' | 'oc1' | 'tr1' | 'ru' | 'jp1';

export const riotRegions: RiotRegion[] = ['na1', 'euw1', 'eun1', 'kr', 'br1', 'la1', 'la2', 'oc1', 'tr1', 'ru', 'jp1'];

export function parseRiotId(value: string) {
  const trimmed = value.trim();
  const [gameName, tagLine] = trimmed.split('#');

  if (!gameName || !tagLine) return null;

  return {
    gameName: gameName.trim(),
    tagLine: tagLine.trim().replace(/^#/, '')
  };
}

export function riotProfileLinks(riotId: string, region: RiotRegion) {
  const parsed = parseRiotId(riotId);
  if (!parsed) return [];

  const riotSlug = `${encodeURIComponent(parsed.gameName)}-${encodeURIComponent(parsed.tagLine)}`;
  const opggRegion = region.toLowerCase().replace('1', '');

  return [
    {
      name: 'U.GG Profile',
      url: `https://u.gg/lol/profile/${region}/${riotSlug}/overview`
    },
    {
      name: 'OP.GG Profile',
      url: `https://op.gg/lol/summoners/${opggRegion}/${riotSlug}`
    },
    {
      name: 'LeagueOfGraphs',
      url: `https://www.leagueofgraphs.com/summoner/${opggRegion}/${riotSlug}`
    }
  ];
}
