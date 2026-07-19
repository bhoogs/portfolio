import Clock from "./Clock";

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

    const parseICSDate = (val: string, allDay: boolean): Date | null => {
      if (!val) return null;
      if (allDay || /^\d{8}$/.test(val))
        return new Date(`${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}T00:00:00`);
      if (val.endsWith("Z"))
        return new Date(`${val.slice(0,4)}-${val.slice(4,6)}-${val.slice(6,8)}T${val.slice(9,11)}:${val.slice(11,13)}:${val.slice(13,15)}Z`);
      return new Date(`${val.slice(0,4)}-${val.slice(4,6)}-${val.slice(6,8)}T${val.slice(9,11)}:${val.slice(11,13)}:${val.slice(13,15)}`);
    };

    const startDate = parseICSDate(dtstartVal, isAllDay);
    if (!startDate || isNaN(startDate.getTime())) continue;

    const eventDay = startDate.toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
    if (eventDay !== todayStr) continue;

    const summary = field("SUMMARY").replace(/\\,/g, ",").replace(/\\n/g, " ");
    const location = field("LOCATION").replace(/\\,/g, ",");
    const endDate = parseICSDate(field("DTEND"), isAllDay);
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MorningPage() {
  const [weather, forecast, events] = await Promise.all([
    getWeather(),
    getForecast(),
    getCalendarEvents(),
  ]);

  const hourNum = parseInt(
    new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Chicago" })
  );
  const greeting = hourNum < 12 ? "Good morning" : hourNum < 17 ? "Good afternoon" : "Good evening";

  const card: React.CSSProperties = {
    background: "#0f1e35",
    border: "1px solid #1a2f4d",
    borderRadius: "16px",
    padding: "1.5rem",
  };

  const sectionLabel: React.CSSProperties = {
    color: "#4f9cf9",
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    marginBottom: "1.25rem",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(150deg, #050e20 0%, #0c1c38 60%, #071520 100%)",
      padding: "2.5rem",
      fontFamily: "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>

      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ color: "#8ba5c5", fontSize: "1rem", marginBottom: "0.75rem" }}>{greeting}, Brian</p>
        <Clock />
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", maxWidth: "1100px" }}>

        {/* Weather — 2 columns */}
        <div style={{ ...card, gridColumn: "span 2" }}>
          <div style={sectionLabel}>Weather · Wayzata, MN</div>

          {weather ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <img src={wxIcon(weather.icon)} alt={weather.description} style={{ width: "80px", height: "80px" }} />
                <div>
                  <div style={{ fontSize: "4rem", fontWeight: 200, color: "white", lineHeight: 1 }}>{weather.temp}°</div>
                  <div style={{ color: "#c8d8ee", marginTop: "0.2rem", textTransform: "capitalize" }}>{weather.description}</div>
                  <div style={{ color: "#8ba5c5", fontSize: "0.85rem", marginTop: "0.3rem" }}>
                    Feels like {weather.feelsLike}° &nbsp;·&nbsp; H:{weather.high}° L:{weather.low}° &nbsp;·&nbsp; Wind {weather.windSpeed} mph &nbsp;·&nbsp; Humidity {weather.humidity}%
                  </div>
                </div>
              </div>

              {forecast.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid #1a2f4d", paddingTop: "1.25rem" }}>
                  {forecast.map((day, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ color: "#8ba5c5", fontSize: "0.75rem", marginBottom: "0.25rem" }}>{dayName(day.date)}</div>
                      <img src={wxIcon(day.icon)} alt="" style={{ width: "40px", height: "40px", margin: "0 auto", display: "block" }} />
                      <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 500 }}>{day.high}°</div>
                      <div style={{ color: "#8ba5c5", fontSize: "0.75rem" }}>{day.low}°</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p style={{ color: "#8ba5c5", fontSize: "0.875rem" }}>Weather unavailable.</p>
          )}
        </div>

        {/* Calendar */}
        <div style={card}>
          <div style={sectionLabel}>Today&rsquo;s Schedule</div>
          {events.length === 0 ? (
            <p style={{ color: "#8ba5c5", fontSize: "0.875rem" }}>Nothing on the calendar today.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {events.map((ev, i) => (
                <div key={i} style={{ borderLeft: "3px solid #4f9cf9", paddingLeft: "0.875rem" }}>
                  <div style={{ color: "white", fontWeight: 500, fontSize: "0.95rem" }}>{ev.summary}</div>
                  <div style={{ color: "#8ba5c5", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                    {ev.isAllDay ? "All day" : `${fmt(ev.startDate)}${ev.endDate ? ` – ${fmt(ev.endDate)}` : ""}`}
                  </div>
                  {ev.location && (
                    <div style={{ color: "#8ba5c5", fontSize: "0.75rem", marginTop: "0.1rem" }}>{ev.location}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
