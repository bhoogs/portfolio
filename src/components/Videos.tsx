"use client";

import { useRef, useState, useEffect } from "react";
import { videos } from "@/data/content";
import SectionHeader from "./SectionHeader";

function getVideoId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

export default function Videos() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => { checkScroll(); }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -380 : 380, behavior: "smooth" });
  };

  return (
    <section id="videos" className="py-24 px-6 bg-white border-t border-[#e5e5ec]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-10">
          <SectionHeader
            title="Favorite YouTube Videos"
            subtitle="Talks and content I keep coming back to."
          />
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="w-12 h-12 rounded-full bg-white border-[3px] border-[#c0c0c9] text-[#202022] flex items-center justify-center text-lg hover:scale-110 hover:border-[#484850] hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              ←
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="w-12 h-12 rounded-full bg-white border-[3px] border-[#c0c0c9] text-[#202022] flex items-center justify-center text-lg hover:scale-110 hover:border-[#484850] hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              →
            </button>
          </div>
        </div>

        <div className="relative">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((v) => {
            const videoId = getVideoId(v.url);
            const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

            return (
              <a
                key={v.title}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-xl overflow-hidden bg-[#202022] shrink-0 w-[260px] md:w-[300px]"
                style={{ scrollSnapAlign: "start", aspectRatio: "16/9" }}
              >
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt={v.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg ml-0.5">▶</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm leading-snug mb-1">{v.title}</p>
                  <p className="text-white/60 text-xs">{v.creator}</p>
                </div>
              </a>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
