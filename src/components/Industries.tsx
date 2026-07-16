import { industries } from "@/data/content";
import SectionHeader from "./SectionHeader";

export default function Industries() {
  return (
    <section id="industries" className="py-24 px-6 bg-[#fafafa]">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          title="Industries I've Served"
          subtitle="Cross-industry experience that informs every engagement."
        />
        <div className="flex flex-wrap gap-3">
          {industries.map((ind) => (
            <div
              key={ind.name}
              className="flex items-center gap-2.5 bg-white border border-[#e5e5ec] rounded-lg px-5 py-3 text-sm font-medium text-[#202022]"
            >
              <span>{ind.icon}</span>
              {ind.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
