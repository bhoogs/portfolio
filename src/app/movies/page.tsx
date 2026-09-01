"use client";

import { useState } from "react";
import Link from "next/link";
import type { MovieRecommendation } from "@/app/api/recommend/route";

const GENRES = ["", "Action", "Comedy", "Drama", "Horror", "Thriller", "Sci-Fi", "Romance", "Animation", "Documentary", "Fantasy"];
const ERAS = ["", "Classic (pre-1980)", "1980s", "1990s", "2000s", "2010s", "Recent (2020+)"];
const RUNTIMES = ["", "Under 90 min", "Under 2 hours"];
const CONTENT_RATINGS = ["", "G", "PG", "PG-13", "R"];
const MPAA_ORDER = ["G", "PG", "PG-13", "R", "NC-17"];

const LOADING_MESSAGES = [
  "Consulting the archives…",
  "Asking the cinephiles…",
  "Scanning 500,000 films…",
  "Curating your picks…",
];

function MovieCard({ movie }: { movie: MovieRecommendation }) {
  const content = (
    <div className="bg-white rounded-xl border border-[#e5e5ec] overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
      <div className="relative overflow-hidden bg-[#f5f5f7]" style={{ aspectRatio: "2/3" }}>
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🎬</div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-bold text-[#202022] text-sm leading-tight">{movie.title}</h3>
          <p className="text-xs text-[#9ca3af] mt-0.5">{movie.year}</p>
        </div>
        <p className="text-xs text-[#484850] leading-relaxed italic flex-1">"{movie.reason}"</p>
        {movie.providers.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {movie.providers.map(p => (
              <img key={p.name} src={p.logo} alt={p.name} title={p.name} className="h-5 w-5 rounded-sm object-cover" />
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2">
            {movie.imdb_rating && <span className="text-xs text-[#6b7280]">⭐ {movie.imdb_rating}/10</span>}
            {movie.rated && <span className="text-[10px] font-semibold border border-[#d1d5db] text-[#6b7280] px-1.5 py-0.5 rounded">{movie.rated}</span>}
          </div>
          <span className="text-xs font-semibold text-[#0176d3]">Watch →</span>
        </div>
      </div>
    </div>
  );

  return movie.watch_link ? (
    <a href={movie.watch_link} target="_blank" rel="noopener noreferrer" className="block">{content}</a>
  ) : <div>{content}</div>;
}

export default function MoviesPage() {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("");
  const [era, setEra] = useState("");
  const [runtime, setRuntime] = useState("");
  const [streamingOnly, setStreamingOnly] = useState(false);
  const [contentRating, setContentRating] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [allMovies, setAllMovies] = useState<MovieRecommendation[]>([]);
  const [displayCount, setDisplayCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);
    setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);

    const params = new URLSearchParams({ prompt });
    if (genre) params.set("genre", genre);
    if (era) params.set("era", era);
    if (runtime) params.set("runtime", runtime);
    if (contentRating) params.set("rated", contentRating);
    if (streamingOnly) params.set("streaming", "true");

    try {
      const res = await fetch(`/api/recommend?${params}`);
      if (res.status === 429) { setError("rate_limit"); return; }
      if (!res.ok) throw new Error();
      setAllMovies(await res.json());
      setDisplayCount(6);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function buildParams(excludeTitles: string[]) {
    const params = new URLSearchParams({ prompt });
    if (genre) params.set("genre", genre);
    if (era) params.set("era", era);
    if (runtime) params.set("runtime", runtime);
    if (contentRating) params.set("rated", contentRating);
    if (streamingOnly) params.set("streaming", "true");
    if (excludeTitles.length) params.set("exclude", excludeTitles.join(", "));
    return params;
  }

  async function handleLoadMore() {
    // Reveal next 6 from cache if available
    if (displayCount < allMovies.length) {
      setDisplayCount(d => d + 6);
      return;
    }
    // Otherwise fetch a new batch from Gemini
    setLoadingMore(true);
    setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    try {
      const params = buildParams(allMovies.map(m => m.title));
      const res = await fetch(`/api/recommend?${params}`);
      if (res.status === 429) { setError("rate_limit"); return; }
      if (!res.ok) throw new Error();
      const more: MovieRecommendation[] = await res.json();
      setAllMovies(prev => [...prev, ...more]);
      setDisplayCount(d => d + 6);
    } catch {
      setError("Failed to load more. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  const displayed = allMovies.slice(0, displayCount);
  const visibleMovies = contentRating
    ? displayed.filter(m => {
        if (!m.rated) return false;
        const idx = MPAA_ORDER.indexOf(m.rated);
        const maxIdx = MPAA_ORDER.indexOf(contentRating);
        return idx !== -1 && idx <= maxIdx;
      })
    : displayed;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="bg-white border-b border-[#e5e5ec] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="text-xs text-[#0176d3] hover:underline mb-0.5 block">← Back to Portfolio</Link>
            <h1 className="text-xl font-bold text-[#202022]">Movie Recommender</h1>
          </div>
          <span className="text-xs text-[#9ca3af]">Powered by Gemini</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e5e5ec] shadow-sm p-5 mb-8">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={'What are you in the mood for?\n\ne.g. "Something like Inception but more emotional" or "A feel-good movie for date night"'}
            rows={3}
            className="w-full border border-[#e5e5ec] rounded-lg px-4 py-3 text-sm text-[#202022] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0176d3] focus:border-transparent resize-none mb-3"
          />

          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setShowFilters(f => !f)}
              className="text-xs text-[#6b7280] hover:text-[#0176d3] transition-colors cursor-pointer">
              {showFilters ? "▲ Hide filters" : "▼ Add filters"}
            </button>
            <button type="submit" disabled={loading}
              className="bg-[#0176d3] text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0165b8] transition-colors disabled:opacity-50 cursor-pointer">
              {loading ? loadingMsg : "Recommend"}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#e5e5ec]">
              {[
                { label: "Genre", value: genre, onChange: setGenre, options: GENRES },
                { label: "Era", value: era, onChange: setEra, options: ERAS },
                { label: "Runtime", value: runtime, onChange: setRuntime, options: RUNTIMES },
              ].map(s => (
                <select key={s.label} value={s.value} onChange={e => s.onChange(e.target.value)}
                  className="border border-[#e5e5ec] rounded-lg px-3 py-2 text-sm text-[#484850] focus:outline-none focus:ring-2 focus:ring-[#0176d3] bg-white">
                  <option value="">{s.label}</option>
                  {s.options.filter(o => o).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
              <select value={contentRating} onChange={e => setContentRating(e.target.value)}
                className="border border-[#e5e5ec] rounded-lg px-3 py-2 text-sm text-[#484850] focus:outline-none focus:ring-2 focus:ring-[#0176d3] bg-white">
                <option value="">Any rating</option>
                {CONTENT_RATINGS.filter(r => r).map(r => <option key={r} value={r}>{r} or under</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-[#484850] cursor-pointer">
                <input type="checkbox" checked={streamingOnly} onChange={e => setStreamingOnly(e.target.checked)}
                  className="rounded border-[#e5e5ec]" />
                Streaming only
              </label>
            </div>
          )}
        </form>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-[#0176d3] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#484850]">{loadingMsg}</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 text-sm font-medium">
              {error === "rate_limit"
                ? "You've hit the Gemini rate limit. Please wait a minute and try again."
                : error}
            </p>
          </div>
        )}

        {!loading && searched && !error && (
          <div>
            {visibleMovies.length > 0 ? (
              <>
                {contentRating && displayed.length !== visibleMovies.length && (
                  <p className="text-sm text-[#6b7280] mb-4">{visibleMovies.length} of {displayed.length} results match your rating filter</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {visibleMovies.map((m, i) => <MovieCard key={i} movie={m} />)}
                </div>
                <div className="mt-8 text-center">
                  {loadingMore ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-[#0176d3] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-[#9ca3af]">{loadingMsg}</p>
                    </div>
                  ) : (
                    <button onClick={handleLoadMore}
                      className="border border-[#0176d3] text-[#0176d3] px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0176d3] hover:text-white transition-colors cursor-pointer">
                      Load more
                    </button>
                  )}
                </div>
              </>
            ) : displayed.length > 0 ? (
              <div className="text-center py-16 text-[#9ca3af]">
                <p className="text-sm">No results match your rating filter — try lowering the minimum.</p>
              </div>
            ) : null}
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-24 text-[#9ca3af]">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-sm">Describe what you want to watch and Gemini will find your perfect match.</p>
          </div>
        )}
      </main>
    </div>
  );
}
