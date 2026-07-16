import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

const ENDPOINT_MAP: Record<string, { path: string; params?: Record<string, string> }> = {
  "box-office": { path: "/movie/now_playing", params: { region: "US" } },
  "upcoming":   { path: "/movie/upcoming",    params: { region: "US" } },
  "trending":   { path: "/discover/movie", params: { sort_by: "popularity.desc", with_watch_monetization_types: "flatrate", watch_region: "US" } },
};

type Provider = { name: string; logo: string };

async function getImdbRating(title: string, year: string): Promise<string | null> {
  const url = new URL("https://www.omdbapi.com/");
  url.searchParams.set("t", title);
  if (year) url.searchParams.set("y", year);
  url.searchParams.set("apikey", process.env.OMDB_API_KEY ?? "");
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    const data = await res.json();
    const r = data.imdbRating;
    return r && r !== "N/A" && parseFloat(r) > 0 ? r : null;
  } catch {
    return null;
  }
}

async function getWatchProviders(id: number): Promise<{ providers: Provider[]; link: string | null }> {
  const url = new URL(`${TMDB_BASE}/movie/${id}/watch/providers`);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY ?? "");
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    const data = await res.json();
    const us = data.results?.US;
    const flatrate: Provider[] = (us?.flatrate ?? []).slice(0, 4).map(
      (p: { provider_name: string; logo_path: string }) => ({
        name: p.provider_name,
        logo: `https://image.tmdb.org/t/p/w45${p.logo_path}`,
      })
    );
    return { providers: flatrate, link: us?.link ?? null };
  } catch {
    return { providers: [], link: null };
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ endpoint: string }> }
) {
  const { endpoint } = await params;
  const config = ENDPOINT_MAP[endpoint];

  if (!config) {
    return NextResponse.json({ error: "Unknown endpoint" }, { status: 404 });
  }

  const url = new URL(`${TMDB_BASE}${config.path}`);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY ?? "");
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(config.params ?? {})) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) {
    return NextResponse.json({ error: "TMDB request failed" }, { status: res.status });
  }

  const data = await res.json();
  const filtered = (data.results ?? [])
    .filter((m: Record<string, unknown>) => m.original_language === "en")
    .slice(0, 10);

  const movies = await Promise.all(
    filtered.map(async (m: Record<string, unknown>) => {
      const year = typeof m.release_date === "string" ? m.release_date.slice(0, 4) : "";
      const [imdb_rating, { providers, link }] = await Promise.all([
        getImdbRating(m.title as string, year),
        getWatchProviders(m.id as number),
      ]);
      return {
        id: m.id,
        title: m.title,
        overview: m.overview,
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        imdb_rating,
        release_date: year,
        providers,
        watch_link: link ?? `https://www.themoviedb.org/movie/${m.id}`,
      };
    })
  );

  return NextResponse.json(movies);
}
