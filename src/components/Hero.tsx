import { profile } from "@/data/content";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#f0f8ff] to-[#e8f4fd] px-6 pt-20">
      <div className="max-w-4xl w-full text-center">
        <div className="inline-flex items-center gap-2 bg-[#e8f4fd] text-[#0176d3] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-[#0176d3] animate-pulse" />
          Salesforce Ecosystem
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-[#032d60] mb-6 leading-tight tracking-tight">
          {profile.name}
        </h1>

        <p className="text-xl md:text-2xl text-[#0176d3] font-medium mb-6">
          {profile.tagline}
        </p>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          {profile.bio}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#projects"
            className="inline-flex items-center justify-center gap-2 bg-[#0176d3] text-white px-8 py-3.5 rounded-lg font-medium hover:bg-[#032d60] transition-colors"
          >
            View My Work
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#0176d3] text-[#0176d3] px-8 py-3.5 rounded-lg font-medium hover:bg-[#e8f4fd] transition-colors"
          >
            LinkedIn
          </a>
        </div>

        <div className="mt-16 animate-bounce">
          <svg className="w-6 h-6 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
