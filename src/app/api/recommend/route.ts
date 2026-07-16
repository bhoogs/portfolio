import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export type MovieRecommendation = {
  title: string;
  year: string;
  reason: string;
  poster: string | null;
  imdb_rating: string | null;
  rated: string | null;
  providers: { name: string; logo: string }[];
  watch_link: string | null;
};

type GeminiRec = { title: string; year: string; reason: string };

async function getRecommendations(prompt: string, filters: Record<string, string>): Promise<GeminiRec[]> {
  const filterLines = Object.entries(filters)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const exclusionLine = filters["exclude"]
    ? `\nDo NOT include any of these already-recommended films: ${filters["exclude"]}.`
    : "";
  delete filters["exclude"];

  const fullPrompt = `You are an expert movie curator.${prompt ? ` The user wants: "${prompt}".` : ""}
${filterLines ? `Preferences:\n${filterLines}` : ""}${exclusionLine}

Return a JSON array of exactly 12 movie recommendations. Each object must have:
- "title": exact movie title (string)
- "year": 4-digit release year (string)
- "reason": 1-2 sentences explaining why this fits the request (string)

Return ONLY the raw JSON array, no markdown fences, no extra text.`;

  const res = await fetch(
    `${GEMINI_BASE}/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (res.status === 429) throw Object.assign(new Error("rate_limit"), { status: 429 });
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  return JSON.parse(text);
}

async function enrichMovie(rec: GeminiRec): Promise<MovieRecommendation> {
  const searchUrl = new URL(`${TMDB_BASE}/search/movie`);
  searchUrl.searchParams.set("api_key", process.env.TMDB_API_KEY ?? "");
  searchUrl.searchParams.set("query", rec.title);
  searchUrl.searchParams.set("year", rec.year);

  const tmdbRes = await fetch(searchUrl.toString(), { next: { revalidate: 86400 } });
  const tmdbData = await tmdbRes.json();
  const movie = tmdbData.results?.[0];

  if (!movie) {
    return { title: rec.title, year: rec.year, reason: rec.reason, poster: null, imdb_rating: null, rated: null, providers: [], watch_link: null };
  }

  const omdbUrl = new URL("https://www.omdbapi.com/");
  omdbUrl.searchParams.set("t", rec.title);
  omdbUrl.searchParams.set("y", rec.year);
  omdbUrl.searchParams.set("apikey", process.env.OMDB_API_KEY ?? "");

  const provUrl = new URL(`${TMDB_BASE}/movie/${movie.id}/watch/providers`);
  provUrl.searchParams.set("api_key", process.env.TMDB_API_KEY ?? "");

  const [omdbRes, provRes] = await Promise.all([
    fetch(omdbUrl.toString(), { next: { revalidate: 86400 } }),
    fetch(provUrl.toString(), { next: { revalidate: 86400 } }),
  ]);
  const [omdbData, provData] = await Promise.all([omdbRes.json(), provRes.json()]);

  const r = omdbData.imdbRating;
  const imdb_rating = r && r !== "N/A" && parseFloat(r) > 0 ? r : null;
  const ratedRaw = omdbData.Rated as string | undefined;
  const rated = ratedRaw && ratedRaw !== "N/A" ? ratedRaw : null;

  const us = provData.results?.US;
  const providers = (us?.flatrate ?? []).slice(0, 4).map(
    (p: { provider_name: string; logo_path: string }) => ({
      name: p.provider_name,
      logo: `https://image.tmdb.org/t/p/w45${p.logo_path}`,
    })
  );

  return {
    title: movie.title,
    year: rec.year,
    reason: rec.reason,
    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    imdb_rating,
    rated,
    providers,
    watch_link: us?.link ?? `https://www.themoviedb.org/movie/${movie.id}`,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const prompt = searchParams.get("prompt") ?? "";

  const filters: Record<string, string> = {};
  const genre = searchParams.get("genre");
  const era = searchParams.get("era");
  const runtime = searchParams.get("runtime");
  const rated = searchParams.get("rated");
  const streaming = searchParams.get("streaming");
  if (genre) filters["genre"] = genre;
  if (era) filters["era"] = era;
  if (runtime) filters["max runtime"] = runtime;
  if (rated) filters["max content rating"] = `${rated} or under (MPAA)`;
  if (streaming === "true") filters["availability"] = "streaming only (not theatrical)";
  const exclude = searchParams.get("exclude");
  if (exclude) filters["exclude"] = exclude;

  try {
    const recs = await getRecommendations(prompt, filters);
    const movies = await Promise.all(recs.map(enrichMovie));
    return NextResponse.json(movies);
  } catch (e) {
    console.error(e);
    const status = (e as { status?: number }).status === 429 ? 429 : 500;
    return NextResponse.json({ error: status === 429 ? "rate_limit" : "failed" }, { status });
  }
}
