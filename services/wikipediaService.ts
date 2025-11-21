import { HistoricalEvent, WikiSearchResponse, WikiOnThisDayResponse } from '../types';

const WIKI_API_URL = 'https://tr.wikipedia.org/w/api.php';
const ON_THIS_DAY_API_URL = 'https://api.wikimedia.org/feed/v1/wikipedia/tr/onthisday/events';

/**
 * Search for events by keyword using MediaWiki Action API
 */
export const searchEventsByKeyword = async (keyword: string): Promise<HistoricalEvent[]> => {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: keyword,
    gsrlimit: '10',
    prop: 'extracts|pageimages|info',
    exintro: 'true', // Get intro only initially, we will use it for summary
    explaintext: 'true',
    piprop: 'thumbnail',
    pithumbsize: '300',
    inprop: 'url',
    format: 'json',
    origin: '*', // Required for CORS
  });

  try {
    const response = await fetch(`${WIKI_API_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('Wikipedia API Error');
    
    const data: WikiSearchResponse = await response.json();
    
    if (!data.query || !data.query.pages) {
      return [];
    }

    const pages = Object.values(data.query.pages);

    // Transform to our internal model
    return pages.map((page) => ({
      id: page.pageid.toString(),
      title: page.title,
      year: 'Belirsiz', // Keyword search doesn't always guarantee a year in metadata
      summary: page.extract ? page.extract.substring(0, 150) + '...' : 'Özet bulunamadı.',
      detail: page.extract || 'Detay bulunamadı.',
      thumbnail: page.thumbnail?.source,
      link: page.fullurl,
      source: 'search',
    }));

  } catch (error) {
    console.error('Search API Error:', error);
    throw error;
  }
};

/**
 * Search for events by date using Wikimedia Feed API
 */
export const searchEventsByDate = async (month: number, day: number): Promise<HistoricalEvent[]> => {
  // Pad month/day for API url format (MM/DD)
  const m = month.toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');

  try {
    const response = await fetch(`${ON_THIS_DAY_API_URL}/${m}/${d}`);
    if (!response.ok) throw new Error('On This Day API Error');

    const data: WikiOnThisDayResponse = await response.json();

    // Transform
    return data.events.map((event, index) => {
        // Usually the first related page has the best detail
        const primaryPage = event.pages && event.pages.length > 0 ? event.pages[0] : null;
        
        return {
            id: `otd-${index}-${event.year}`,
            title: primaryPage ? primaryPage.title : `Olay: ${event.year}`,
            year: event.year,
            summary: event.text, // The "text" field in this API is usually a concise summary
            detail: primaryPage ? primaryPage.extract : event.text,
            thumbnail: primaryPage?.thumbnail?.source,
            link: primaryPage?.content_urls.desktop.page || '#',
            source: 'onthisday'
        };
    });

  } catch (error) {
    console.error('Date API Error:', error);
    throw error;
  }
};
