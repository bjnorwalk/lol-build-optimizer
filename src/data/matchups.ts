import type { Champion } from '../types';

const explicitWeakAgainst: Record<string, string[]> = {
  Aatrox: ['Fiora', 'Irelia', 'Kled', 'Poppy', 'Vayne'],
  Ahri: ['Naafiri', 'Malzahar', 'Vex', 'Annie', 'LeBlanc'],
  Akali: ['Galio', 'Pantheon', 'Vex', 'Malzahar', 'Annie'],
  Azir: ['Xerath', 'Hwei', 'LeBlanc', 'Yone', 'Syndra'],
  Caitlyn: ['Nilah', 'Jhin', 'Ashe', 'Twitch', 'Seraphine'],
  Darius: ['Vayne', 'Quinn', 'Kennen', 'Jayce', 'Teemo'],
  DrMundo: ['Gwen', 'Fiora', 'Vayne', 'Kled', 'Olaf'],
  Lux: ['Fizz', 'Zed', 'Naafiri', 'Yasuo', 'Katarina'],
  Malphite: ['Sylas', 'Gwen', 'Mordekaiser', 'ChoGath', 'DrMundo'],
  Soraka: ['Blitzcrank', 'Pyke', 'Nautilus', 'Leona', 'Thresh'],
  Yasuo: ['Renekton', 'Pantheon', 'Annie', 'Vex', 'Taliyah'],
  Zed: ['Malphite', 'Lissandra', 'Kayle', 'Vladimir', 'Garen']
};

export function getWeakAgainst(champion: Champion) {
  const explicit = explicitWeakAgainst[champion.id];
  if (explicit) return explicit;

  const tags = new Set(champion.tags);
  if (tags.has('Marksman')) return ['Nilah', 'Ashe', 'Seraphine', 'Ziggs', 'Twitch'];
  if (tags.has('Mage')) return ['Fizz', 'Zed', 'Naafiri', 'Yasuo', 'LeBlanc'];
  if (tags.has('Assassin')) return ['Malphite', 'Lissandra', 'Galio', 'Pantheon', 'Vex'];
  if (tags.has('Tank')) return ['Gwen', 'Fiora', 'Vayne', 'Mordekaiser', 'Camille'];
  if (tags.has('Support')) return ['Blitzcrank', 'Pyke', 'Nautilus', 'Leona', 'Thresh'];
  if (tags.has('Fighter')) return ['Vayne', 'Quinn', 'Kennen', 'Poppy', 'Jax'];

  return ['Malphite', 'Annie', 'Ashe', 'Jax', 'Morgana'];
}
