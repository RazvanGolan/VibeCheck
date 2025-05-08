// TODO: Confirm with backend (@BogdanNuExista) how game modes should be represented (enum, string, number?)
// Defining as an enum for now for frontend type safety.
export enum GameMode {
  Classic = 'Classic',
  Party = 'Party',
  Challenge = 'Challenge',
}

export enum PrivacyType {
  Public = 'Public',
  Private = 'Private',
}

// Define a type for the game settings
export interface GameSettings {
  gameMode: GameMode;
  rounds: number;
  timePerRound: number;
  playersLimit: number; 
  privacy: PrivacyType;
  selectedThemeCategories: string[];
  customThemes: string[];
}

// Define the default settings using the type
export const defaultGameSettings: GameSettings = {
  gameMode: GameMode.Classic,
  rounds: 3,
  timePerRound: 60,
  playersLimit: 4, 
  privacy: PrivacyType.Public,
  selectedThemeCategories: [],
  customThemes: [],
}; 