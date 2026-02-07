import React, { useEffect, useState } from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  source: string;
  imageUrl?: string;
  link?: string;
}

interface NewsCardProps {
  maxItems?: number;
}

function stripTags(input: string | undefined): string {
  if (!input) return '';
  // First decode HTML entities
  const decoded = input
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  // Then strip HTML tags and clean whitespace
  const tmp = document.createElement('div');
  tmp.innerHTML = decoded;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

function toSafeHttpUrl(value: string): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // ignore invalid URLs
  }
  return null;
}

function extractImageUrl(xmlChunk: string | undefined): string | undefined {
  if (!xmlChunk) return undefined;
  const patterns = [
    /<media:(?:thumbnail|content)[^>]*?url="([^"]+)"/i,
    /<enclosure[^>]*?url="([^"]+)"/i,
    /<img[^>]*?src="([^"]+)"/i,
  ];
  for (const re of patterns) {
    const m = re.exec(xmlChunk);
    if (m && m[1]) return m[1];
  }
  return undefined;
}

function extractLink(xmlChunk: string | undefined): string | undefined {
  if (!xmlChunk) return undefined;
  const m = /<link>([\s\S]*?)<\/link>/i.exec(xmlChunk);
  if (m && m[1]) return m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
  return undefined;
}

export function NewsCard({ maxItems = 5 }: NewsCardProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // UK Crime-specific RSS feeds
  const CRIME_FEEDS = [
    { url: 'https://v4-api.neighbourhoodalert.co.uk/RSS', source: 'Police Alerts', color: 'police' },
    { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', source: 'BBC UK', color: 'bbc', filterCrime: true },
  ];

  // CORS proxy for fetching RSS feeds from browser
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  // Keywords to identify crime-related content
  const CRIME_KEYWORDS = /crime|police|arrest|burglary|theft|assault|murder|stabbing|robbery|fraud|gang|shooting|homicide|sentencing|prosecution|verdict|prison|jail|court|criminal|violence|attack|suspect|investigation/i;

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Fetch all crime RSS feeds in parallel (via CORS proxy)
        const responses = await Promise.all(
          CRIME_FEEDS.map(feed =>
            fetch(`${CORS_PROXY}${encodeURIComponent(feed.url)}`).catch(() => null)
          )
        );

        const allItems: NewsItem[] = [];

        // Parse each feed
        for (let i = 0; i < responses.length; i++) {
          const res = responses[i];
          const feedInfo = CRIME_FEEDS[i] as { url: string; source: string; color: string; filterCrime?: boolean };

          if (res?.ok) {
            const xml = await res.text();
            const items = Array.from(xml.matchAll(/<item[\s\S]*?<\/item>/g)).slice(0, 20);
            const mapped = items.map((match, idx) => {
              const block = match[0];
              const title = (/<title>([\s\S]*?)<\/title>/i.exec(block)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
              const descriptionRaw = (/<description>([\s\S]*?)<\/description>/i.exec(block)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '');
              const pubDate = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(block)?.[1] ?? '';
              const cleanDescription = stripTags(descriptionRaw);
              const date = pubDate ? new Date(pubDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
              const imageUrl = extractImageUrl(block) ?? extractImageUrl(descriptionRaw);
              const link = toSafeHttpUrl(extractLink(block) ?? '') ?? undefined;
              return {
                id: `${feedInfo.color}-${idx}`,
                title: title || feedInfo.source,
                description: cleanDescription,
                date,
                source: feedInfo.source,
                imageUrl,
                link,
                shouldFilterCrime: feedInfo.filterCrime,
              };
            });

            // Filter crime content if required for this feed
            const filtered = mapped.filter(item => {
              if (!item.shouldFilterCrime) return true;
              return CRIME_KEYWORDS.test(item.title) || CRIME_KEYWORDS.test(item.description);
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            allItems.push(...filtered.map(({ shouldFilterCrime: _unused, ...rest }) => rest));
          }
        }

        if (allItems.length === 0) {
          setError('Unable to load crime news feeds');
        } else {
          // Sort by date (newest first) then limit items
          const sorted = allItems
            .sort((a, b) => {
              const dateA = a.date ? new Date(a.date).getTime() : 0;
              const dateB = b.date ? new Date(b.date).getTime() : 0;
              return dateB - dateA;
            })
            .slice(0, maxItems);
          setNewsItems(sorted);
        }
      } catch (e: unknown) {
        setError((e as Error).message || 'Unable to load crime news');
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxItems]);

  const getSourceColor = (source: string) => {
    if (source === 'Police Alerts') return 'bg-blue-600/20 text-blue-400'; // Police blue
    if (source === 'BBC UK') return 'bg-red-500/20 text-red-400'; // BBC red
    return 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="bg-brand-inputBackground rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-brand-text text-lg font-semibold">UK Crime News</h3>
        <Newspaper className="h-6 w-6 text-brand-primary" />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : error && newsItems.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-brand-textGrey text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {newsItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                {item.imageUrl && (
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getSourceColor(item.source)}`}>
                      {item.source}
                    </span>
                    <span className="text-xs text-brand-textGrey">{item.date}</span>
                  </div>

                  <h4 className="text-brand-text font-medium text-sm mb-1 line-clamp-2">
                    {item.title}
                  </h4>

                  <p className="text-brand-textGrey text-xs line-clamp-2">
                    {item.description}
                  </p>

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-brand-primary text-xs mt-2 hover:text-brand-secondary transition-colors"
                    >
                      Read more
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsCard;

