export type P2Flags = {
  igForYou: boolean;
  voiceNotes: boolean;
  watchParty: boolean;
  liveGifting: boolean;
  clans: boolean;
  fantasy: boolean;
  oneVone: boolean;
  customizationStore: boolean;
  ocrResults: boolean;
  creatorLeaderboard: boolean;
};

export const DEFAULT_P2_FLAGS: P2Flags = {
  igForYou: true,
  voiceNotes: true,
  watchParty: true,
  liveGifting: true,
  clans: true,
  fantasy: true,
  oneVone: true,
  customizationStore: true,
  ocrResults: true,
  creatorLeaderboard: true,
};

export function normalizeP2Flags(raw?: Partial<P2Flags> | null): P2Flags {
  return {
    igForYou: Boolean(raw?.igForYou),
    voiceNotes: Boolean(raw?.voiceNotes),
    watchParty: Boolean(raw?.watchParty),
    liveGifting: Boolean(raw?.liveGifting),
    clans: Boolean(raw?.clans),
    fantasy: Boolean(raw?.fantasy),
    oneVone: Boolean(raw?.oneVone),
    customizationStore: Boolean(raw?.customizationStore),
    ocrResults: Boolean(raw?.ocrResults),
    creatorLeaderboard: Boolean(raw?.creatorLeaderboard),
  };
}
