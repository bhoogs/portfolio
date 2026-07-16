"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Provider = { name: string; logo: string };

type Movie = {
  id: number;
  title: string;
  overview: string;
  poster: string | null;
  imdb_rating: string | null;
  release_date: string;
  providers: Provider[];
  watch_link: string | null;
};

const API_BASE = "";

const TABS = [
  { key: "box-office", label: "Now Playing In Theaters", emoji: "🎬" },
  { key: "upcoming", label: "Upcoming", emoji: "📅" },
  { key: "trending", label: "Top Streaming", emoji: "📺" },
];

function MovieCard({ movie }: { movie: Movie }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
  const inner = (
    <div className="bg-white rounded-xl border border-[#e5e5ec] overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
      <div className="relative overflow-hidden" style={{ aspectRatio: "2/3" }}>
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-[#f5f5f7] flex items-center justify-center text-5xl">🎬</div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="font-semibold text-[#202022] text-sm leading-tight" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {movie.title}
        </h3>
        {movie.providers.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {movie.providers.map((p) => (
              <img key={p.name} src={p.logo} alt={p.name} title={p.name} className="h-5 w-5 rounded-sm object-cover" />
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-[#6b7280] mt-auto pt-0.5">
          {movie.imdb_rating && <span>⭐ {movie.imdb_rating}/10</span>}
          {year && <span>{year}</span>}
        </div>
      </div>
    </div>
  );

  return movie.watch_link ? (
    <a href={movie.watch_link} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  ) : (
    <div>{inner}</div>
  );
}

export default function WhatToWatch() {
  const [activeTab, setActiveTab] = useState("box-office");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/movies/${activeTab}`)
      .then((r) => {
        if (!r.ok) throw new Error("Bad response");
        return r.json();
      })
      .then((data: Movie[]) => {
        setMovies(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load movies. The server may be warming up — try again in a moment.");
        setLoading(false);
      });
  }, [activeTab, retryKey]);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="bg-white border-b border-[#e5e5ec] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-xs text-[#0176d3] hover:underline mb-0.5 block"
            >
              ← Back to Portfolio
            </Link>
            <h1 className="text-xl font-bold text-[#202022]">What to Watch</h1>
          </div>
          <span className="text-xs text-[#9ca3af]">Powered by TMDB</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 border border-[#e5e5ec] w-fit shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#0176d3] text-white shadow-sm"
                  : "text-[#484850] hover:bg-[#f5f5f7]"
              }`}
            >
              <span className="mr-1.5">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-[#0176d3] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#484850]">Loading movies…</p>
            <p className="text-xs text-[#9ca3af]">Free tier server may be warming up (up to 50s)</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <button
              onClick={() => setRetryKey((k) => k + 1)}
              className="text-[#0176d3] text-sm hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-[#9ca3af]">
        Movie data provided by{" "}
        <a href="https://www.themoviedb.org" className="hover:underline" target="_blank" rel="noopener noreferrer">
          The Movie Database (TMDB)
        </a>
      </footer>
    </div>
  );
}
