import { createContext } from 'react';
import type { CSSProperties } from 'react';

export const colorPalettes = [
  {
    id: 'noite',
    name: 'Noite de jogo',
    description: 'Escuro, com detalhes dourados',
    background: '#101820',
    surface: '#1C2935',
    text: '#F1F5F9',
    muted: '#A7B4C3',
    accent: '#E9C46A',
    accentInk: '#101820',
    border: '#344454',
    soft: '#253544',
    scene: '#17232D',
    red: '#F87171',
    green: '#4ADE80',
    redSurface: '#35262E',
    greenSurface: '#20392F'
  },
  {
    id: 'papel',
    name: 'Papel e tinta',
    description: 'Claro, com detalhes em violeta',
    background: '#F5F5F7',
    surface: '#FFFFFF',
    text: '#27272A',
    muted: '#63636D',
    accent: '#7C3AED',
    accentInk: '#FFFFFF',
    border: '#DDDDE5',
    soft: '#EDE8F7',
    scene: '#EEEEF2',
    red: '#C81E1E',
    green: '#15803D',
    redSurface: '#FFF1F2',
    greenSurface: '#F0FDF4'
  },
  {
    id: 'ceu',
    name: 'Céu de domingo',
    description: 'Azul suave, leve e arejado',
    background: '#EDF3F8',
    surface: '#FFFFFF',
    text: '#243447',
    muted: '#576D83',
    accent: '#3563E9',
    accentInk: '#FFFFFF',
    border: '#CFDCE8',
    soft: '#DFE9F7',
    scene: '#E5EDF5',
    red: '#C81E1E',
    green: '#15803D',
    redSurface: '#FFF1F2',
    greenSurface: '#F0FDF4'
  },
] as const;

export type ColorPalette = {
  [K in keyof typeof colorPalettes[number]]: string;
};

// Neutral surfaces from Papel e tinta, with wine/rose/charcoal from the supplied logo.
export const officialPalette: ColorPalette = {
  id: 'marca',
  name: 'Arquibancada das Eleições',
  description: 'Papel e tinta com as cores da logo',
  background: '#F5F5F7',
  surface: '#FFFFFF',
  text: '#353139',
  muted: '#6B6470',
  accent: '#793947',
  accentInk: '#FFFFFF',
  border: '#E3DDE1',
  soft: '#F2E8EC',
  scene: '#F0EFF2',
  red: '#C81E1E',
  green: '#15803D',
  redSurface: '#FFF1F2',
  greenSurface: '#F0FDF4',
};

export function paletteVariables(palette: ColorPalette): CSSProperties {
  return Object.fromEntries(Object.entries(palette).map(([key, value]) => [`--preview-${key}`, value])) as CSSProperties;
}

export const PaletteContext = createContext<ColorPalette | undefined>(undefined);
