import React, { useState, useCallback } from 'react';
import {
  Crosshair,
  Copy,
  Check,
  Search,
  MapPin,
  Grid3X3,
  Info,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { getCoordinatesFromPostcode } from '../lib/crime';
import { convertToThreeWords, type W3WConvertResponse } from '../lib/what3words';

export function PreciseLocation() {
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<W3WConvertResponse | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleLookup = useCallback(async () => {
    const pc = postcode.trim();
    if (!pc) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCoords(null);

    try {
      const geo = await getCoordinatesFromPostcode(pc);
      setCoords(geo);

      const w3w = await convertToThreeWords(geo.lat, geo.lng);
      setResult(w3w);
    } catch (e: unknown) {
      const message = (e as Error)?.message || 'Unable to look up location';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [postcode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  const handleCopy = useCallback(async () => {
    if (!result) return;
    const text = `///${result.words}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some contexts
    }
  }, [result]);

  return (
    <div id="precise-location" className="card hover:border-brand-primary/30 transition-all">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-primary/30 bg-brand-primary/10">
          <Crosshair className="h-4 w-4 text-brand-primary" />
        </span>
        <h3 className="text-brand-text text-xl font-semibold">
          Check Your Precise Location
        </h3>
      </div>

      <p className="text-brand-textGrey text-sm mb-4">
        Enter a UK postcode to find its{' '}
        <span className="text-brand-primary font-medium">what3words</span>{' '}
        address — a precise 3m&nbsp;×&nbsp;3m location reference.
      </p>

      {/* Search input */}
      <div className="flex items-center gap-2 rounded-full border border-gray-700 bg-brand-inputBackground px-3 py-2">
        <MapPin className="h-4 w-4 shrink-0 text-brand-primary" />
        <input
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter postcode (e.g., EC2R 8AH)"
          className="w-full bg-transparent text-sm text-brand-text outline-none placeholder:text-brand-textGrey"
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-brand-background text-brand-textGrey transition-colors hover:border-brand-primary hover:text-brand-primary disabled:opacity-60"
          aria-label="Find precise location"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Status message */}
      <div className="mt-3 min-h-10 text-sm text-brand-textGrey">
        {loading && (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary/30 border-t-brand-primary" />
            Resolving precise location…
          </span>
        )}
        {!loading && error && (
          <span className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </span>
        )}
        {!loading && !error && !result && (
          'Enter a postcode to discover its three-word address.'
        )}
      </div>

      {/* Results */}
      {!loading && !error && result && coords && (
        <>
          {/* what3words address */}
          <div className="mt-4 rounded-xl border border-brand-primary/30 bg-brand-primary/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Grid3X3 className="h-5 w-5 shrink-0 text-brand-primary" />
                <span className="text-xl font-bold text-brand-primary truncate">
                  ///{result.words}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-brand-background text-brand-textGrey transition-colors hover:border-brand-primary hover:text-brand-primary"
                aria-label="Copy what3words address"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            {result.nearestPlace && (
              <p className="mt-1 text-xs text-brand-textGrey">
                Near {result.nearestPlace}, {result.country}
              </p>
            )}
          </div>

          {/* Coordinates + grid visualisation */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-700 bg-brand-inputBackground p-3">
              <p className="text-lg font-bold text-brand-text">
                {coords.lat.toFixed(6)}°
              </p>
              <p className="text-xs text-brand-textGrey">Latitude</p>
            </div>
            <div className="rounded-xl border border-gray-700 bg-brand-inputBackground p-3">
              <p className="text-lg font-bold text-brand-text">
                {coords.lng.toFixed(6)}°
              </p>
              <p className="text-xs text-brand-textGrey">Longitude</p>
            </div>
          </div>

          {/* Grid visualisation */}
          <div className="mt-3 rounded-xl border border-gray-700 bg-brand-inputBackground p-4">
            <div className="flex items-center gap-2 mb-3">
              <Grid3X3 className="h-4 w-4 text-brand-secondary" />
              <span className="text-sm font-semibold text-brand-text">
                3m × 3m Grid Square
              </span>
            </div>
            <div className="grid grid-cols-5 grid-rows-5 gap-px mx-auto max-w-[160px]">
              {Array.from({ length: 25 }).map((_, i) => {
                const isCenter = i === 12;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm border transition-colors ${
                      isCenter
                        ? 'border-brand-primary bg-brand-primary/30'
                        : 'border-gray-700 bg-brand-background/60'
                    }`}
                  >
                    {isCenter && (
                      <div className="flex h-full w-full items-center justify-center">
                        <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-center text-[11px] text-brand-textGrey">
              Each square represents a 3m × 3m area
            </p>
          </div>

          {/* View on map */}
          <a
            href={result.map || `https://what3words.com/${result.words}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors"
          >
            View on what3words map
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </>
      )}

      {/* Info section */}
      <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
          <div>
            <p className="text-sm font-medium text-blue-200">
              Why 3m × 3m precision matters
            </p>
            <p className="mt-1 text-xs leading-relaxed text-blue-100/80">
              what3words divides the entire world into 3-metre squares, each
              with a unique three-word address. Unlike postcodes, which cover
              large areas, a what3words address pinpoints an exact spot — vital
              for directing emergency services, security patrols, and first
              responders to the right location within seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Source footer */}
      <div className="mt-4 border-t border-gray-800 pt-2.5 text-xs text-brand-textGrey">
        Powered by what3words • Postcodes.io
      </div>
    </div>
  );
}
