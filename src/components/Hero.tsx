import { profile } from "@/data/content";

export default function Hero() {
  return (
    <section className="px-6 py-16 md:py-24 bg-[#e5e5ec]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#202022] tracking-tight leading-tight">
            {profile.name}
          </h1>
          <h2 className="text-lg font-medium text-[#484850] mt-2 mb-6">
            Salesforce Leader & Architect
          </h2>

          <p className="text-base text-[#484850] leading-relaxed mb-4 max-w-md">
            Hey There! My name is Brian and I&apos;m a technology leader working with enterprise level companies to deliver digital transformation.
          </p>

          <p className="text-base text-[#484850] leading-relaxed max-w-md">
            My current passion is accelerating the development process with Claude Code and integrating AI into various integration workflows.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#202022] text-white px-7 py-3 rounded-lg text-sm font-medium hover:bg-[#484850] transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="/Brian_Hoogerwerf_Resume.pdf"
              download
              className="inline-flex items-center justify-center gap-2 bg-[#202022] text-white px-9 py-3 rounded-lg text-sm font-medium hover:bg-[#484850] transition-colors"
            >
              Resume
            </a>
          </div>
        </div>

        {/* Photo */}
        <div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80">
          <img
            src="/brian.jpg"
            alt={profile.name}
            className="w-full h-full object-cover object-top rounded-2xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
