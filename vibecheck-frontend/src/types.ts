export interface Song {
    id: number;
    title: string;
    preview: string;
    artist: {
      id: number;
      name: string;
    };
    album: {
      id: number;
      title: string;
      cover_small: string;
      cover_medium: string;
    };
  }