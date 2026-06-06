import { projects } from "@/data/content";
import SectionHeader from "./SectionHeader";

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="Featured Projects"
          subtitle="A selection of engagements where I've made an impact."
        />
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div
              key={p.title}
              className="border border-gray-100 rounded-2xl p-7 hover:shadow-md hover:border-[#0176d3]/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#032d60] group-hover:text-[#0176d3] transition-colors">
                  {p.title}
                </h3>
                <span className="text-xs text-gray-400 font-medium ml-4 mt-1 shrink-0">{p.year}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{p.description}</p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-[#e8f4fd] text-[#0176d3] px-3 py-1 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
