import React, { useEffect, useMemo, useState } from 'react';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NewsItem = {
  id: string | number;
  title: string;
  source: string;
  time: string;
  category: 'Security' | 'Crime' | 'Weather' | 'Other';
  excerpt: string;
  url: string;
};

export function NewsFeedCard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NewsItem[] | null>(null);

  // UK Crime RSS feeds - defaults to crime-specific sources
  const DEFAULT_CRIME_FEEDS = [
    'https://v4-api.neighbourhoodalert.co.uk/RSS',
    'https://feeds.bbci.co.uk/news/uk/rss.xml',
  ];

  // CORS proxy for fetching RSS feeds from browser
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  const feedUrls = useMemo(() => {
    const env = import.meta.env.VITE_NEWS_RSS_URLS as string | undefined;
    return env ? env.split(',').map((u) => u.trim()).filter(Boolean) : DEFAULT_CRIME_FEEDS;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const rssProxy = (import.meta.env.VITE_RSS_PROXY as string | undefined) || CORS_PROXY;

  useEffect(() => {
    const load = async () => {
      if (!feedUrls.length) {
        // Fallback demo items when no feeds configured
        setItems(sampleItems);
        return;
      }
      try {
        const parsed: NewsItem[] = [];
        for (const url of feedUrls) {
          const proxied = rssProxy ? `${rssProxy}${encodeURIComponent(url)}` : url;
          const res = await fetch(proxied);
          if (!res.ok) continue;
          const text = await res.text();
          // Try basic XML parsing
          const doc = new window.DOMParser().parseFromString(text, 'application/xml');
          const channelTitle = doc.querySelector('channel > title')?.textContent || new URL(url).hostname;
          const entries = Array.from(doc.querySelectorAll('item')).slice(0, 5);
          for (const it of entries) {
            const title = it.querySelector('title')?.textContent || 'Update';
            const link = toSafeHttpUrl(it.querySelector('link')?.textContent || '');
            const pubDate = it.querySelector('pubDate')?.textContent || '';
            const desc = it.querySelector('description')?.textContent || '';
            parsed.push({
              id: link || title,
              title,
              source: channelTitle,
              time: pubDate ? timeAgo(new Date(pubDate)) : '',
              category: inferCategory(title + ' ' + desc),
              excerpt: truncate(stripTags(desc), 120),
              url: link ?? '#',
            });
          }
        }
        setItems(parsed.slice(0, 10));
      } catch {
        setItems(sampleItems);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Security': return 'bg-red-500/20 text-red-500';
      case 'Crime': return 'bg-[#1785d1]/20 text-[#1785d1]';
      case 'Weather': return 'bg-blue-500/20 text-blue-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-[#1785d1]/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">UK Crime News</h3>
        <Newspaper className="h-6 w-6 text-[#1785d1]" />
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {(items || sampleItems).map((item) => (
          <div key={item.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                {item.category}
              </span>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {item.time}
              </div>
            </div>
            
            <h4 className="text-white font-medium text-sm mb-2 line-clamp-2">
              {item.title}
            </h4>
            
            <p className="text-gray-400 text-xs mb-3 line-clamp-2">
              {item.excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">{item.source}</span>
              <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center text-[#1785d1] text-xs hover:text-[#126aa7] transition-colors">
                Read more
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-800">
        <button
          onClick={() => navigate('/news')}
          className="w-full bg-[#1785d1] hover:bg-[#126aa7] text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          View All News
        </button>
      </div>
    </div>
  );
}

// Helpers and fallback
const sampleItems: NewsItem[] = [
  {
    id: 1,
    title: 'National Crime Agency disrupts organised crime network',
    source: 'NCA',
    time: '—',
    category: 'Crime',
    excerpt: 'Law enforcement agencies work together to combat serious and organised crime across the UK.',
    url: '#',
  },
];

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffH = Math.floor(diffMins / 60);
  if (diffH < 24) return `${diffH} hour${diffH > 1 ? 's' : ''} ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} day${diffD > 1 ? 's' : ''} ago`;
}

function stripTags(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
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

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function inferCategory(text: string): NewsItem['category'] {
  const t = text.toLowerCase();
  if (/(terror|counter-?terror|security)/.test(t)) return 'Security';
  if (/(crime|police|arrest|burglary|theft|assault)/.test(t)) return 'Crime';
  if (/(weather|storm|flood|rain|wind|warning)/.test(t)) return 'Weather';
  return 'Other';
}


