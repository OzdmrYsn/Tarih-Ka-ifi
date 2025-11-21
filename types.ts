export interface HistoricalEvent {
  id: string;
  title: string;
  year: string | number;
  summary: string; // Short intro
  detail: string; // Longer description
  thumbnail?: string;
  link: string;
  source: 'search' | 'onthisday';
}

// Wikipedia API Response Types (Internal use for service)
export interface WikiSearchResponse {
  query: {
    pages: Record<string, WikiPage>;
  };
}

export interface WikiPage {
  pageid: number;
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  fullurl: string;
}

export interface WikiOnThisDayResponse {
  events: Array<{
    text: string;
    year: number;
    pages: Array<{
      title: string;
      extract: string;
      thumbnail?: {
        source: string;
      };
      content_urls: {
        desktop: {
          page: string;
        };
      };
    }>;
  }>;
}
