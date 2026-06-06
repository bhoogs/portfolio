import { industries } from "@/data/content";
import SectionHeader from "./SectionHeader";

export default function Industries() {
  return (
    <section id="industries" className="py-24 px-6 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="Industries I've Served"
          subtitle="Cross-industry experience that informs every engagement."
        />
        <div className="flex flex-wrap justify-center gap-4">
          {industries.map((ind) => (
            <div
              key={ind.name}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-6 py-4 hover:shadow-sm hover:border-[#0176d3]/30 transition-all"
            >
              <span className="text-2xl">{ind.icon}</span>
              <span className="font-medium text-[#032d60]">{ind.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
