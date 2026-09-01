import Clock from "./Clock";

export const dynamic = "force-dynamic";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WeatherNow {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  high: number;
  low: number;
}

interface ForecastDay {
  date: Date;
  high: number;
  low: number;
  icon: string;
}

interface CalendarEvent {
  summary: string;
  startDate: Date;
  endDate: Date | null;
  location: string;
  isAllDay: boolean;
}

interface NewsItem {
  title: string;
  source: string;
  url: string;
  summary: string;
}

interface NewsSection {
  title: string;
  items: NewsItem[];
}

interface DigestData {
  date: string;
  generated_at: string;
  news: string;
  bible: {
    ot: string;
    nt: string;
    psalm: string;
    reflection: string;
    passages?: { ot?: string; nt?: string; psalm?: string; copyright?: string };
  };
}

// ─── Weather ─────────────────────────────────────────────────────────────────

async function getWeather(): Promise<WeatherNow | null> {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Wayzata,MN,US&appid=${key}&units=imperial`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return {
      temp: Math.round(d.main.temp),
      feelsLike: Math.round(d.main.feels_like),
      description: d.weather[0].description,
      icon: d.weather[0].icon,
      humidity: d.main.humidity,
      windSpeed: Math.round(d.wind.speed),
      high: Math.round(d.main.temp_max),
      low: Math.round(d.main.temp_min),
    };
  } catch {
    return null;
  }
}

async function getForecast(): Promise<ForecastDay[]> {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=Wayzata,MN,US&appid=${key}&units=imperial`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];
    const d = await res.json();

    const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
    const byDate = new Map<string, { temps: number[]; icons: string[] }>();

    for (const item of d.list) {
      const dateStr = new Date(item.dt * 1000).toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
      if (dateStr === todayStr) continue;
      if (!byDate.has(dateStr)) byDate.set(dateStr, { temps: [], icons: [] });
      byDate.get(dateStr)!.temps.push(item.main.temp);
      byDate.get(dateStr)!.icons.push(item.weather[0].icon);
    }

    const days: ForecastDay[] = [];
    for (const [dateStr, { temps, icons }] of byDate) {
      if (days.length >= 5) break;
      days.push({
        date: new Date(dateStr + "T12:00:00"),
        high: Math.round(Math.max(...temps)),
        low: Math.round(Math.min(...temps)),
        icon: icons[Math.floor(icons.length / 2)],
      });
    }
    return days;
  } catch {
    return [];
  }
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function wallClockToUTC(isoLocal: string, tzid: string): Date {
  // Convert a local wall-clock time string (no Z) in tzid to a UTC Date.
  const approx = new Date(isoLocal + "Z");
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tzid,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(approx).map((p) => [p.type, p.value]));
  const h = parts.hour === "24" ? "00" : parts.hour;
  const tzEquiv = new Date(`${parts.year}-${parts.month}-${parts.day}T${h}:${parts.minute}:${parts.second}Z`);
  return new Date(approx.getTime() + (approx.getTime() - tzEquiv.getTime()));
}

function parseICS(icsText: string): CalendarEvent[] {
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
  const unfolded = icsText.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const blocks = unfolded.split(/BEGIN:VEVENT/);
  const events: CalendarEvent[] = [];

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split(/END:VEVENT/)[0];

    const field = (name: string) => {
      const m = block.match(new RegExp(`(?:^|\\n)${name}(?:;[^:\\n]*)?:([^\\n]*)`, "i"));
      return m ? m[1].replace(/\r$/, "").trim() : "";
    };

    const dtstartMatch = block.match(/(?:^|\n)DTSTART([^:\n]*):([^\n]*)/i);
    if (!dtstartMatch) continue;
    const dtstartParams = dtstartMatch[1];
    const dtstartVal = dtstartMatch[2].replace(/\r$/, "").trim();
    const isAllDay = dtstartParams.includes("VALUE=DATE") || /^\d{8}$/.test(dtstartVal);
    const tzidMatch = dtstartParams.match(/TZID=([^;:]+)/i);
    const tzid = tzidMatch?.[1] ?? "America/Chicago";

    const parseICSDate = (val: string, allDay: boolean, tz?: string): Date | null => {
      if (!val) return null;
      if (allDay || /^\d{8}$/.test(val))
        return new Date(`${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}T00:00:00`);
      const isoLocal = `${val.slice(0,4)}-${val.slice(4,6)}-${val.slice(6,8)}T${val.slice(9,11)}:${val.slice(11,13)}:${val.slice(13,15)}`;
      if (val.endsWith("Z")) return new Date(isoLocal + "Z");
      return wallClockToUTC(isoLocal, tz ?? "America/Chicago");
    };

    const startDate = parseICSDate(dtstartVal, isAllDay, tzid);
    if (!startDate || isNaN(startDate.getTime())) continue;

    const eventDay = startDate.toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
    if (eventDay !== todayStr) continue;

    const summary = field("SUMMARY").replace(/\\,/g, ",").replace(/\\n/g, " ");
    const location = field("LOCATION").replace(/\\,/g, ",");
    const endDate = parseICSDate(field("DTEND"), isAllDay, tzid);
    if (!summary) continue;

    events.push({ summary, startDate, endDate, location, isAllDay });
  }

  return events;
}

async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const urls = [
    process.env.CALENDAR_ICS_1,
    process.env.CALENDAR_ICS_2,
    process.env.CALENDAR_ICS_3,
  ].filter(Boolean) as string[];

  if (urls.length === 0) return [];

  const results = await Promise.allSettled(
    urls.map((url) => fetch(url, { cache: "no-store" }).then((r) => r.text()))
  );

  const allEvents: CalendarEvent[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allEvents.push(...parseICS(result.value));
    }
  }

  return allEvents.sort((a, b) => {
    if (a.isAllDay !== b.isAllDay) return a.isAllDay ? -1 : 1;
    return a.startDate.getTime() - b.startDate.getTime();
  });
}

// ─── Digest ───────────────────────────────────────────────────────────────────

async function getDigest(): Promise<DigestData | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      "https://api.github.com/repos/bhoogs/Morning-News-Digest/contents/latest_digest.json",
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const content = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function parseNewsDigest(text: string): NewsSection[] {
  const sections: NewsSection[] = [];
  const parts = text.split(/(?=TOP 5 )/);

  for (const part of parts.filter(Boolean)) {
    const headerMatch = part.match(/^TOP 5 (.+?):\s*\n/);
    if (!headerMatch) continue;
    const title = headerMatch[1];
    const body = part.slice(headerMatch[0].length);

    const chunks = body.split(/\n(?=\d+\. )/).filter((s) => s.trim());
    const items: NewsItem[] = [];

    for (const chunk of chunks) {
      const numMatch = chunk.match(/^\d+\.\s+(.+?)(?:\n|$)/);
      if (!numMatch) continue;
      const itemTitle = numMatch[1].trim();
      const rest = chunk.slice(numMatch[0].length);
      const sourceMatch = rest.match(/Source:\s*(.+?)(?:\n|$)/);
      const linkMatch = rest.match(/Link:\s*(https?:\/\/\S+)/);
      const summaryMatch = rest.match(/Summary:\s*([\s\S]+?)(?:\n\d+\.|$)/);
      items.push({
        title: itemTitle,
        source: sourceMatch?.[1]?.trim() ?? "",
        url: linkMatch?.[1]?.trim() ?? "",
        summary: summaryMatch?.[1]?.trim().replace(/\n/g, " ") ?? "",
      });
    }

    if (items.length > 0) sections.push({ title, items });
  }

  return sections;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
    timeZone: "America/Chicago",
  });

const dayName = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/Chicago" });

const wxIcon = (icon: string) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

function sectionLabel(title: string): string {
  return title
    .replace("TOP 5 ", "")
    .replace(" NEWS", " News")
    .replace("SALESFORCE & AI", "Salesforce & AI")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MorningPage() {
  const [weather, forecast, events, digest] = await Promise.all([
    getWeather(),
    getForecast(),
    getCalendarEvents(),
    getDigest(),
  ]);

  const hourNum = parseInt(
    new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Chicago" })
  );
  const greeting = hourNum < 12 ? "Good morning" : hourNum < 17 ? "Good afternoon" : "Good evening";

  const newsSections = digest ? parseNewsDigest(digest.news) : [];

  const card: React.CSSProperties = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  };

  const label: React.CSSProperties = {
    color: "#6b7280",
    fontSize: "0.68rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    marginBottom: "1.25rem",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      padding: "2.5rem",
      fontFamily: "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>

      {/* Header */}
      <div style={{ marginBottom: "2.5rem", maxWidth: "1200px", margin: "0 auto 2.5rem" }}>
        <p style={{ color: "#6b7280", fontSize: "1rem", marginBottom: "0.5rem" }}>{greeting}, Brian</p>
        <Clock dark={false} />
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", maxWidth: "1200px", alignItems: "start", margin: "0 auto" }}>

        {/* Weather — 2 columns */}
        <div style={{ ...card, gridColumn: "span 2" }}>
          <div style={label}>Weather · Wayzata, MN</div>

          {weather ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <img src={wxIcon(weather.icon)} alt={weather.description} style={{ width: "80px", height: "80px" }} />
                <div>
                  <div style={{ fontSize: "4rem", fontWeight: 200, color: "#111827", lineHeight: 1 }}>{weather.temp}°</div>
                  <div style={{ color: "#374151", marginTop: "0.2rem", textTransform: "capitalize" }}>{weather.description}</div>
                  <div style={{ color: "#9ca3af", fontSize: "0.85rem", marginTop: "0.3rem" }}>
                    Feels like {weather.feelsLike}° &nbsp;·&nbsp; H:{weather.high}° L:{weather.low}° &nbsp;·&nbsp; Wind {weather.windSpeed} mph &nbsp;·&nbsp; Humidity {weather.humidity}%
                  </div>
                </div>
              </div>

              {forecast.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid #f3f4f6", paddingTop: "1.25rem" }}>
                  {forecast.map((day, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ color: "#9ca3af", fontSize: "0.75rem", marginBottom: "0.25rem" }}>{dayName(day.date)}</div>
                      <img src={wxIcon(day.icon)} alt="" style={{ width: "40px", height: "40px", margin: "0 auto", display: "block" }} />
                      <div style={{ color: "#111827", fontSize: "0.875rem", fontWeight: 500 }}>{day.high}°</div>
                      <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{day.low}°</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Weather unavailable.</p>
          )}
        </div>

        {/* Calendar */}
        <div style={card}>
          <div style={label}>Today&rsquo;s Schedule</div>
          {events.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Nothing on the calendar today.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {events.map((ev, i) => (
                <div key={i} style={{ borderLeft: "3px solid #3b82f6", paddingLeft: "0.875rem" }}>
                  <div style={{ color: "#111827", fontWeight: 500, fontSize: "0.95rem" }}>{ev.summary}</div>
                  <div style={{ color: "#9ca3af", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                    {ev.isAllDay ? "All day" : `${fmt(ev.startDate)}${ev.endDate ? ` – ${fmt(ev.endDate)}` : ""}`}
                  </div>
                  {ev.location && (
                    <div style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.1rem" }}>{ev.location}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bible — full width */}
        <div style={{ ...card, gridColumn: "span 3", overflow: "visible" }}>
          <div style={label}>Bible Reading</div>
          {digest?.bible ? (
            <>
              {/* Reading refs */}
              <div style={{ display: "flex", gap: "2.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                {[
                  { key: "Old Testament", val: digest.bible.ot },
                  { key: "New Testament", val: digest.bible.nt },
                  { key: "Psalm", val: digest.bible.psalm },
                ].map(({ key, val }) => (
                  <div key={key} style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
                    <span style={{ color: "#d1d5db", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{key}</span>
                    <span style={{ color: "#374151", fontSize: "0.9rem", fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Passage texts */}
              {digest.bible.passages && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "1.25rem", borderTop: "1px solid #f3f4f6", paddingTop: "1.25rem" }}>
                  {[
                    { key: "Old Testament", text: digest.bible.passages.ot, ref: digest.bible.ot },
                    { key: "New Testament", text: digest.bible.passages.nt, ref: digest.bible.nt },
                    { key: "Psalm", text: digest.bible.passages.psalm, ref: digest.bible.psalm },
                  ].map(({ key, text, ref }, i) => (
                    <div key={key} style={{ borderLeft: i > 0 ? "1px solid #e5e7eb" : "none", paddingLeft: i > 0 ? "1.25rem" : 0 }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginBottom: "0.5rem" }}>{ref}</div>
                      <div style={{ maxHeight: "420px", overflowY: "auto", fontSize: "0.8rem", lineHeight: 1.8, color: "#4b5563", whiteSpace: "pre-wrap" }}>
                        {text || <span style={{ color: "#d1d5db" }}>Unavailable</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reflection */}
              {digest.bible.reflection && (() => {
                const paras = digest.bible.reflection.split(/\n\n+/).filter(Boolean).map(p => p.trim());
                const labels = ["Context", "Theme", "Today"];
                return (
                  <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "1.25rem", display: "grid", gridTemplateColumns: `repeat(${Math.min(paras.length, 3)}, 1fr)`, gap: "1.5rem" }}>
                    {paras.slice(0, 3).map((para, i) => (
                      <div key={i} style={{ borderLeft: i > 0 ? "1px solid #e5e7eb" : "none", paddingLeft: i > 0 ? "1.5rem" : 0 }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#d1d5db", marginBottom: "0.5rem" }}>
                          {labels[i] ?? `Part ${i + 1}`}
                        </div>
                        <p style={{ margin: 0, color: "#4b5563", fontSize: "0.875rem", lineHeight: 1.8 }}>{para}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {digest.bible.passages?.copyright && (
                <p style={{ margin: "1rem 0 0", color: "#d1d5db", fontSize: "0.7rem" }}>{digest.bible.passages.copyright}</p>
              )}
            </>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No reading data yet.</p>
          )}
        </div>

        {/* News — full width, 3 columns inside */}
        <div style={{ ...card, gridColumn: "span 3" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.25rem" }}>
            <div style={label}>Morning News</div>
            {digest && (
              <span style={{ color: "#d1d5db", fontSize: "0.7rem" }}>
                {new Date(digest.generated_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/Chicago" })}
              </span>
            )}
          </div>

          {newsSections.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No digest available yet. Check back after 7:30 AM.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${newsSections.length}, 1fr)`, gap: "2rem" }}>
              {newsSections.map((section, si) => (
                <div key={si} style={{ borderLeft: si > 0 ? "1px solid #e5e7eb" : "none", paddingLeft: si > 0 ? "2rem" : 0 }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", marginBottom: "1rem" }}>
                    {sectionLabel(section.title)}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {section.items.slice(0, 4).map((item, ii) => (
                      <div key={ii} style={{ paddingBottom: "1rem", borderBottom: ii < Math.min(section.items.length, 4) - 1 ? "1px solid #f3f4f6" : "none" }}>
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer"
                            style={{ color: "#111827", fontWeight: 500, fontSize: "0.875rem", textDecoration: "none", lineHeight: 1.5, display: "block" }}>
                            {item.title}
                          </a>
                        ) : (
                          <div style={{ color: "#111827", fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.5 }}>{item.title}</div>
                        )}
                        {item.source && (
                          <div style={{ color: "#d1d5db", fontSize: "0.7rem", marginTop: "0.3rem" }}>{item.source}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
