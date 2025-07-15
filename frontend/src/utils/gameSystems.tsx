import React from 'react';
import { SvgIcon } from '@mui/material';
import type { SvgIconProps } from '@mui/material';

// Custom game system icons
export const Warhammer40kIcon: React.FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M12 2L3 7v10l9 5 9-5V7l-9-5zM6.5 8.5l5.5-3 5.5 3v7l-5.5 3-5.5-3v-7z'
      fill='currentColor'
    />
    <circle cx='12' cy='12' r='3' fill='currentColor' />
  </SvgIcon>
);

export const AgeOfSigmarIcon: React.FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M12 2l2.5 7.5H22l-6 4.5 2.5 7.5L12 17l-6.5 4.5L8 14l-6-4.5h7.5L12 2z'
      fill='currentColor'
    />
  </SvgIcon>
);

// Game system definitions
export interface GameSystem {
  id: string;
  name: string;
  icon: React.ComponentType<SvgIconProps>;
  color: string;
  description: string;
}

export const GAME_SYSTEMS: GameSystem[] = [
  {
    id: 'warhammer-40k',
    name: 'Warhammer 40,000',
    icon: Warhammer40kIcon,
    color: '#c41e3a',
    description: 'The grim darkness of the far future',
  },
  {
    id: 'age-of-sigmar',
    name: 'Age of Sigmar',
    icon: AgeOfSigmarIcon,
    color: '#ffd700',
    description: 'Fantasy battles in the Mortal Realms',
  },
];

// Map database game system shortNames to our frontend IDs
export const DB_TO_FRONTEND_GAME_SYSTEM_MAP: Record<string, string> = {
  W40K: 'warhammer-40k',
  AOS: 'age-of-sigmar',
};

// Map frontend IDs to database shortNames
export const FRONTEND_TO_DB_GAME_SYSTEM_MAP: Record<string, string> = {
  'warhammer-40k': 'W40K',
  'age-of-sigmar': 'AOS',
};

export const getGameSystemById = (id: string): GameSystem | undefined => {
  return GAME_SYSTEMS.find(system => system.id === id);
};

export const getGameSystemIcon = (
  gameSystemId: string,
  props?: SvgIconProps
) => {
  const gameSystem = getGameSystemById(gameSystemId);
  if (!gameSystem) return null;

  const IconComponent = gameSystem.icon;
  return (
    <IconComponent {...props} sx={{ color: gameSystem.color, ...props?.sx }} />
  );
};

// Get game system from a collection object
export const getGameSystemFromCollection = (collection: {
  gameSystem?: { shortName: string };
}): GameSystem | undefined => {
  if (!collection.gameSystem?.shortName) return undefined;
  const frontendId =
    DB_TO_FRONTEND_GAME_SYSTEM_MAP[collection.gameSystem.shortName];
  return getGameSystemById(frontendId);
};

// Get game system icon from a collection object
export const getGameSystemIconFromCollection = (
  collection: { gameSystem?: { shortName: string } },
  props?: SvgIconProps
) => {
  const gameSystem = getGameSystemFromCollection(collection);
  if (!gameSystem) return null;

  const IconComponent = gameSystem.icon;
  return (
    <IconComponent {...props} sx={{ color: gameSystem.color, ...props?.sx }} />
  );
};

// Convert frontend game system ID to database ID
export const getGameSystemDbId = async (
  frontendId: string
): Promise<string> => {
  // For now, we'll use a simple API call to get the game systems
  // and find the matching one by shortName
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
  const response = await fetch(`${baseUrl}/game-systems`);
  if (!response.ok) {
    throw new Error('Failed to fetch game systems');
  }

  const gameSystems: Array<{
    id: string;
    name: string;
    shortName: string;
    description?: string;
    publisher?: string;
  }> = await response.json();
  const shortName = FRONTEND_TO_DB_GAME_SYSTEM_MAP[frontendId];
  const gameSystem = gameSystems.find(gs => gs.shortName === shortName);

  if (!gameSystem) {
    throw new Error(`Game system not found for frontend ID: ${frontendId}`);
  }

  return gameSystem.id;
};
