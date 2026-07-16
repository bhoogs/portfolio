"use client";

import { useState } from "react";
import { references } from "@/data/content";
import SectionHeader from "./SectionHeader";

const avatarColors = ["#0176d3", "#2e7d32", "#7b5ea7", "#c67a00", "#0176d3", "#2e7d32", "#7b5ea7"];

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase();
}

function ReferenceCard({
  name, title, linkedin, photo, paragraphs, color,
}: {
  name: string; title: string; linkedin: string; photo?: string; paragraphs: string[]; color: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#e5e5ec] rounded-xl p-6 flex flex-col gap-4 hover:border-[#c0c0c9] transition-colors">
      <div className="flex-1">
        <div className={expanded ? "" : "line-clamp-4"}>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[#484850] text-sm leading-relaxed mb-2 last:mb-0 italic">
              {i === 0 && <>&ldquo;</>}{p}{i === paragraphs.length - 1 && <>&rdquo;</>}
            </p>
          ))}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-medium text-[#0176d3] hover:text-[#032d60] transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      </div>
      <div className="border-t border-[#e5e5ec] pt-4 flex items-center gap-3">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: color }}
          >
            {getInitials(name)}
          </div>
        )}
        <div>
          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#0176d3] hover:text-[#032d60] transition-colors"
            >
              {name}
            </a>
          ) : (
            <p className="text-sm font-semibold text-[#0176d3]">{name}</p>
          )}
          <p className="text-xs text-[#c0c0c9] mt-0.5">{title}</p>
        </div>
      </div>
    </div>
  );
}

export default function References() {
  return (
    <section id="references" className="py-24 px-6 bg-[#fafafa] border-t border-[#e5e5ec]">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          title="References"
          subtitle="What colleagues, clients, and managers have said about working with me."
        />
        <div className="grid md:grid-cols-2 gap-6">
          {references.map((ref, i) => (
            <ReferenceCard
              key={ref.name}
              {...ref}
              photo={ref.photo}
              color={avatarColors[i % avatarColors.length]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
