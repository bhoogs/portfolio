import { NextRequest, NextResponse } from "next/server";

export type Job = {
  id: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string;
  is_remote: boolean;
  employment_type: string | null;
  salary: string | null;
  posted_at: string | null;
  publisher: string;
  apply_link: string;
  description: string;
};

function formatSalary(job: Record<string, unknown>): string | null {
  const min = job.job_min_salary as number | null;
  const max = job.job_max_salary as number | null;
  const period = job.job_salary_period as string | null;
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${Math.round(n)}`;
  const range = min && max ? `${fmt(min)}–${fmt(max)}` : fmt((min ?? max)!);
  const label = period === "YEAR" ? "/yr" : period === "HOUR" ? "/hr" : "";
  return `${range}${label}`;
}

function formatLocation(job: Record<string, unknown>): string {
  if (job.job_is_remote) return "Remote";
  const parts = [job.job_city, job.job_state].filter(Boolean);
  return parts.length ? (parts.join(", ") as string) : (job.job_country as string) ?? "Unknown";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("query") ?? "Salesforce Consultant";
  const location = searchParams.get("location") ?? "United States";
  const remote = searchParams.get("remote");
  const employment_type = searchParams.get("employment_type");
  const date_posted = searchParams.get("date_posted") ?? "all";

  const page = searchParams.get("page") ?? "1";

  const url = new URL("https://jsearch.p.rapidapi.com/search");
  url.searchParams.set("query", query);
  url.searchParams.set("location", location);
  url.searchParams.set("date_posted", date_posted);
  url.searchParams.set("num_pages", "1");
  url.searchParams.set("page", page);
  if (remote === "true") url.searchParams.set("remote_jobs_only", "true");
  if (employment_type) url.searchParams.set("employment_types", employment_type);

  const res = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
      "x-rapidapi-key": process.env.JSEARCH_API_KEY ?? "",
    },
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "JSearch request failed" }, { status: res.status });
  }

  const data = await res.json();
  const jobs: Job[] = (data.data ?? []).map((j: Record<string, unknown>) => ({
    id: j.job_id as string,
    title: j.job_title as string,
    company: j.employer_name as string,
    company_logo: j.employer_logo as string | null,
    location: formatLocation(j),
    is_remote: Boolean(j.job_is_remote),
    employment_type: j.job_employment_type as string | null,
    salary: formatSalary(j),
    posted_at: j.job_posted_at_datetime_utc as string | null,
    publisher: j.job_publisher as string,
    apply_link: j.job_apply_link as string,
    description: (j.job_description as string)?.slice(0, 300) ?? "",
  }));

  return NextResponse.json({ jobs, hasMore: jobs.length === 10 });
}
