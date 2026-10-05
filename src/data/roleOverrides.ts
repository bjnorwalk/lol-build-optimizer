import type { Role } from '../types';

/*
 * Data Dragon class tags are combat fantasy tags, not lane-position data.
 * Azir is tagged as a Marksman because his soldiers basic-attack, but his
 * source-backed position is Mid. These overrides keep role selection honest.
 */
export const roleOverrides: Record<string, Role[]> = {
  Azir: ['Mid'],
  AurelionSol: ['Mid'],
  Cassiopeia: ['Mid'],
  Heimerdinger: ['Mid', 'Top', 'Support'],
  Hwei: ['Mid', 'Support'],
  Karthus: ['Jungle', 'Mid'],
  Kayle: ['Top', 'Mid'],
  Kennen: ['Top', 'Mid'],
  KogMaw: ['ADC'],
  Mel: ['Mid', 'Support'],
  Quinn: ['Top', 'ADC'],
  Ryze: ['Mid', 'Top'],
  Teemo: ['Top', 'Support'],
  TwistedFate: ['Mid'],
  Varus: ['ADC'],
  Zeri: ['ADC'],
  Ziggs: ['Mid', 'ADC'],
  Zilean: ['Support', 'Mid']
};

export function getRoleOverride(championId: string) {
  return roleOverrides[championId];
}
