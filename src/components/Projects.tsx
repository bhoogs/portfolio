"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { projects } from "@/data/content";
import SectionHeader from "./SectionHeader";

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-5 text-white text-3xl leading-none opacity-70 hover:opacity-100 transition-opacity"
        onClick={onClose}
      >
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function ProjectImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className="relative group cursor-zoom-in overflow-hidden rounded-xl border border-[#e5e5ec] shadow-sm"
        onClick={() => setOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full group-hover:scale-[1.02] transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg text-2xl">
              🔍
            </div>
            <span className="text-white text-sm font-semibold drop-shadow">Click to expand</span>
          </div>
        </div>
      </div>
      {open && <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

function ProjectCard({ p, index }: { p: typeof projects[number]; index: number }) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-lg font-bold text-[#202022] mb-2">
          <span className="text-[#0176d3] mr-2">{num} /</span>
          {"link" in p && p.link ? (
            <Link href={p.link} className="hover:underline">{p.title}</Link>
          ) : p.title}
        </h3>
        {p.description && (
          <p className="text-sm text-[#484850] leading-relaxed mb-3">{p.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {p.tags.map((tag) => (
            <span key={tag} className="text-xs bg-[#fafafa] border border-[#e5e5ec] text-[#484850] px-2.5 py-1 rounded-md font-medium">
              {tag}
            </span>
          ))}
          {"link" in p && p.link && (
            <Link href={p.link} className="ml-auto text-xs font-semibold text-[#0176d3] hover:underline">
              Launch App →
            </Link>
          )}
        </div>
      </div>
      <ProjectImage src={p.image} alt={p.title} />
    </div>
  );
}

export default function Projects() {
  const clientProjects = projects.filter(p => p.category === "client");
  const personalProjects = projects.filter(p => p.category === "personal");

  return (
    <section id="projects" className="py-24 px-6 bg-white border-t border-[#e5e5ec]">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          title="Featured Projects"
          subtitle="A selection of work I've delivered — both for clients and on my own."
        />

        {/* Client Projects */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af]">Client Projects</h3>
        </div>
        <div className="flex flex-col gap-8 mb-16">
          {clientProjects.map((p, i) => <ProjectCard key={p.title} p={p} index={i} />)}
        </div>

        {/* Separator */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 border-t border-[#e5e5ec]" />
          <span className="text-xs text-[#c5c5cc] font-medium">✦</span>
          <div className="flex-1 border-t border-[#e5e5ec]" />
        </div>

        {/* Personal Projects */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af]">Personal Projects</h3>
        </div>
        <div className="flex flex-col gap-8">
          {personalProjects.map((p, i) => <ProjectCard key={p.title} p={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
