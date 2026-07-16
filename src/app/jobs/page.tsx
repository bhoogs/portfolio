"use client";

import { useState } from "react";
import Link from "next/link";
import type { Job } from "@/app/api/jobs/route";

const DATE_OPTIONS = [
  { value: "all", label: "Any time" },
  { value: "month", label: "Past month" },
  { value: "week", label: "Past week" },
  { value: "3days", label: "Past 3 days" },
  { value: "today", label: "Today" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "", label: "Any type" },
  { value: "FULLTIME", label: "Full-time" },
  { value: "CONTRACTOR", label: "Contract" },
  { value: "PARTTIME", label: "Part-time" },
];

const REMOTE_OPTIONS = [
  { value: "", label: "Any location" },
  { value: "true", label: "Remote only" },
];

const SALARY_OPTIONS = [
  { value: 0, label: "Any salary" },
  { value: 50000, label: "$50k+" },
  { value: 75000, label: "$75k+" },
  { value: 100000, label: "$100k+" },
  { value: 125000, label: "$125k+" },
  { value: 150000, label: "$150k+" },
];

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const PUBLISHER_COLORS: Record<string, string> = {
  LinkedIn: "bg-[#0a66c2] text-white",
  Indeed: "bg-[#003a9b] text-white",
  Glassdoor: "bg-[#0caa41] text-white",
  ZipRecruiter: "bg-[#4a3fdb] text-white",
};

function JobCard({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);
  const badgeClass = PUBLISHER_COLORS[job.publisher] ?? "bg-[#484850] text-white";

  return (
    <div className="bg-white rounded-xl border border-[#e5e5ec] shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start gap-4">
        {job.company_logo ? (
          <img src={job.company_logo} alt={job.company} className="w-12 h-12 rounded-lg object-contain border border-[#e5e5ec] p-1 flex-shrink-0 bg-white" />
        ) : (
          <div className="w-12 h-12 rounded-lg border border-[#e5e5ec] bg-[#f5f5f7] flex items-center justify-center text-xl flex-shrink-0">🏢</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-[#202022] text-base leading-tight">{job.title}</h3>
              <p className="text-sm text-[#484850] mt-0.5">{job.company}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeClass}`}>
              {job.publisher}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2.5">
            <span className="text-xs text-[#6b7280] flex items-center gap-1">📍 {job.location}</span>
            {job.is_remote && (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">Remote</span>
            )}
            {job.employment_type && (
              <span className="text-xs bg-[#f5f5f7] border border-[#e5e5ec] text-[#484850] px-2 py-0.5 rounded-full">
                {job.employment_type.charAt(0) + job.employment_type.slice(1).toLowerCase()}
              </span>
            )}
            {job.salary && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">💰 {job.salary}</span>
            )}
            {job.posted_at && (
              <span className="text-xs text-[#9ca3af]">{timeAgo(job.posted_at)}</span>
            )}
          </div>

          {job.description && (
            <div className="mt-3">
              <p className="text-xs text-[#6b7280] leading-relaxed">
                {expanded ? job.description : `${job.description.slice(0, 160)}...`}
              </p>
              <button onClick={() => setExpanded(e => !e)} className="text-xs text-[#0176d3] hover:underline mt-1 cursor-pointer">
                {expanded ? "Show less" : "Show more"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <a href={job.apply_link} target="_blank" rel="noopener noreferrer"
          className="text-sm font-semibold bg-[#0176d3] text-white px-4 py-2 rounded-lg hover:bg-[#0165b8] transition-colors">
          Apply →
        </a>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [datePosted, setDatePosted] = useState("all");
  const [minSalary, setMinSalary] = useState(0);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  function buildParams(pageNum: number) {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (location) params.set("location", location);
    if (remote) params.set("remote", remote);
    if (employmentType) params.set("employment_type", employmentType);
    if (datePosted) params.set("date_posted", datePosted);
    params.set("page", String(pageNum));
    return params;
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);
    setPage(1);

    try {
      const res = await fetch(`/api/jobs?${buildParams(1)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobs(data.jobs);
      setHasMore(data.hasMore);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/jobs?${buildParams(nextPage)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobs(prev => [...prev, ...data.jobs]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch {
      setError("Failed to load more. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  const visibleJobs = minSalary > 0
    ? jobs.filter(j => {
        if (!j.salary) return false;
        const matches = [...j.salary.matchAll(/\$(\d+)k/g)];
        if (!matches.length) return false;
        const maxK = Math.max(...matches.map(m => parseInt(m[1])));
        return maxK * 1000 >= minSalary;
      })
    : jobs;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="bg-white border-b border-[#e5e5ec] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="text-xs text-[#0176d3] hover:underline mb-0.5 block">← Back to Portfolio</Link>
            <h1 className="text-xl font-bold text-[#202022]">Job Market Tracker</h1>
          </div>
          <span className="text-xs text-[#9ca3af]">Powered by JSearch</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSearch} className="bg-white rounded-xl border border-[#e5e5ec] shadow-sm p-5 mb-8">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 border border-[#e5e5ec] rounded-lg px-4 py-2.5 text-sm text-[#202022] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0176d3] focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-48 border border-[#e5e5ec] rounded-lg px-4 py-2.5 text-sm text-[#202022] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0176d3] focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {[
              { value: remote, onChange: setRemote, options: REMOTE_OPTIONS },
              { value: employmentType, onChange: setEmploymentType, options: EMPLOYMENT_OPTIONS },
              { value: datePosted, onChange: setDatePosted, options: DATE_OPTIONS },
            ].map((s, i) => (
              <select key={i} value={s.value} onChange={e => s.onChange(e.target.value)}
                className="border border-[#e5e5ec] rounded-lg px-3 py-2 text-sm text-[#484850] focus:outline-none focus:ring-2 focus:ring-[#0176d3] bg-white">
                {s.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ))}
            <select value={minSalary} onChange={e => setMinSalary(Number(e.target.value))}
              className="border border-[#e5e5ec] rounded-lg px-3 py-2 text-sm text-[#484850] focus:outline-none focus:ring-2 focus:ring-[#0176d3] bg-white">
              {SALARY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button type="submit" disabled={loading}
              className="ml-auto bg-[#0176d3] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#0165b8] transition-colors disabled:opacity-60 cursor-pointer">
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-[#0176d3] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#484850]">Searching jobs…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && searched && !error && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#6b7280]">
                {visibleJobs.length > 0
                  ? <>{visibleJobs.length} result{visibleJobs.length !== 1 ? "s" : ""}{minSalary > 0 && jobs.length !== visibleJobs.length ? ` (filtered from ${jobs.length})` : ""}</>
                  : "No jobs found — try broadening your search."}
              </p>
              {minSalary > 0 && (
                <p className="text-xs text-[#9ca3af]">Jobs without posted salaries are excluded</p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {visibleJobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>

            {hasMore && !loadingMore && (
              <div className="mt-8 text-center">
                <button onClick={handleLoadMore}
                  className="border border-[#0176d3] text-[#0176d3] px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0176d3] hover:text-white transition-colors cursor-pointer">
                  Load more jobs
                </button>
              </div>
            )}

            {loadingMore && (
              <div className="flex justify-center mt-8">
                <div className="w-8 h-8 border-4 border-[#0176d3] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-20 text-[#9ca3af]">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-sm">Enter a job title or keywords to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}
