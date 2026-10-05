import { describe, expect, it } from 'vitest';
import { parseRiotId, riotProfileLinks } from './riotId';

describe('riot id helpers', () => {
  it('parses Riot IDs in the Name#TAG format', () => {
    expect(parseRiotId('Billy#NA1')).toEqual({ gameName: 'Billy', tagLine: 'NA1' });
  });

  it('returns profile links for third-party self review', () => {
    const links = riotProfileLinks('Billy#NA1', 'na1');

    expect(links.map((link) => link.name)).toContain('U.GG Profile');
    expect(links[0].url).toContain('Billy-NA1');
  });
});
