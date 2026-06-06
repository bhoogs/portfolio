import { videos } from "@/data/content";
import SectionHeader from "./SectionHeader";

export default function Videos() {
  return (
    <section id="videos" className="py-24 px-6 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="Favorite YouTube Videos"
          subtitle="Talks and content I keep coming back to."
        />
        <div className="grid sm:grid-cols-2 gap-6">
          {videos.map((v) => (
            <a
              key={v.title}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-[#0176d3]/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 text-xl">
                ▶️
              </div>
              <div>
                <h3 className="font-semibold text-[#032d60] mb-1 group-hover:text-[#0176d3] transition-colors">
                  {v.title}
                </h3>
                <p className="text-xs text-[#0176d3] font-medium mb-2">{v.creator}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
