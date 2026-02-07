import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Newspaper, Clock, ArrowLeft } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SEO } from './SEO';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  source: string;
  imageUrl?: string;
  link?: string;
  category: 'Security' | 'Crime' | 'Weather' | 'Other';
}

// CORS proxy for fetching RSS feeds from browser
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// UK Crime RSS feeds
const CRIME_FEEDS = [
  { url: 'https://v4-api.neighbourhoodalert.co.uk/RSS', source: 'Police Alerts', filterCrime: false },
  { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', source: 'BBC UK', filterCrime: true },
];

// Keywords to identify crime-related content
const CRIME_KEYWORDS = /crime|police|arrest|burglary|theft|assault|murder|stabbing|robbery|fraud|gang|shooting|homicide|sentencing|prosecution|verdict|prison|jail|court|criminal|violence|attack|suspect|investigation/i;

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
    /<image>([\s\S]*?)<\/image>/i,
  ];
  for (const re of patterns) {
    const m = re.exec(xmlChunk);
    if (m && m[1]) {
      const url = m[1].trim();
      if (url.startsWith('http')) return url;
    }
  }
  return undefined;
}

function extractLink(xmlChunk: string | undefined): string | undefined {
  if (!xmlChunk) return undefined;
  const m = /<link>([\s\S]*?)<\/link>/i.exec(xmlChunk);
  if (m && m[1]) return m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
  return undefined;
}

function inferCategory(text: string): NewsItem['category'] {
  const t = text.toLowerCase();
  if (/(terror|counter-?terror|security)/.test(t)) return 'Security';
  if (/(crime|police|arrest|burglary|theft|assault|murder|stabbing|robbery|fraud|gang|shooting)/.test(t)) return 'Crime';
  if (/(weather|storm|flood|rain|wind|warning)/.test(t)) return 'Weather';
  return 'Other';
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffH = Math.floor(diffMins / 60);
  if (diffH < 24) return `${diffH} hour${diffH > 1 ? 's' : ''} ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} day${diffD > 1 ? 's' : ''} ago`;
}

export function NewsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      setError('');
      try {
        const responses = await Promise.all(
          CRIME_FEEDS.map(feed =>
            fetch(`${CORS_PROXY}${encodeURIComponent(feed.url)}`).catch(() => null)
          )
        );

        const allItems: NewsItem[] = [];

        for (let i = 0; i < responses.length; i++) {
          const res = responses[i];
          const feedInfo = CRIME_FEEDS[i];

          if (res?.ok) {
            const xml = await res.text();
            const items = Array.from(xml.matchAll(/<item[\s\S]*?<\/item>/g)).slice(0, 30);
            const mapped = items.map((match, idx) => {
              const block = match[0];
              const title = (/<title>([\s\S]*?)<\/title>/i.exec(block)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
              const descriptionRaw = (/<description>([\s\S]*?)<\/description>/i.exec(block)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '');
              const pubDate = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(block)?.[1] ?? '';
              const cleanDescription = stripTags(descriptionRaw);
              const imageUrl = extractImageUrl(block) ?? extractImageUrl(descriptionRaw);
              const link = toSafeHttpUrl(extractLink(block) ?? '') ?? undefined;
              const category = inferCategory(title + ' ' + cleanDescription);

              return {
                id: `${feedInfo.source.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
                title: title || feedInfo.source,
                description: cleanDescription,
                date: pubDate,
                source: feedInfo.source,
                imageUrl,
                link,
                category,
                shouldFilterCrime: feedInfo.filterCrime,
              };
            });

            // Filter crime content if required
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
          // Sort by date (newest first)
          const sorted = allItems.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          });
          setNewsItems(sorted);
        }
      } catch (e: unknown) {
        setError((e as Error).message || 'Unable to load crime news');
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Security': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Crime': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Weather': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSourceColor = (source: string) => {
    if (source === 'Police Alerts') return 'bg-blue-600/20 text-blue-400';
    if (source === 'BBC UK') return 'bg-red-500/20 text-red-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <SEO
        title="UK Security News"
        description="Latest security news, crime reports, and threat intelligence from across the United Kingdom."
        noindex
      />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-[#1785d1]" />
            <h1 className="text-3xl font-bold text-white">UK Crime News</h1>
          </div>
          <p className="text-gray-400 mt-2">Latest crime news and police alerts from across the UK</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1785d1]"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((item) => (
              <article
                key={item.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-[#1785d1]/50 transition-all group"
              >
                {/* Image */}
                {item.imageUrl ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Newspaper className="h-12 w-12 text-gray-700" />
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  {/* Category & Time */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {timeAgo(item.date)}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#1785d1] transition-colors">
                    {item.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                    <span className={`text-xs px-2 py-1 rounded ${getSourceColor(item.source)}`}>
                      {item.source}
                    </span>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-[#1785d1] text-sm hover:text-[#126aa7] transition-colors font-medium"
                      >
                        Read more
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && newsItems.length === 0 && (
          <div className="text-center py-20">
            <Newspaper className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No news articles available at the moment.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default NewsPage;

