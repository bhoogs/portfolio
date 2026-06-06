import { hobbies } from "@/data/content";
import SectionHeader from "./SectionHeader";

export default function Hobbies() {
  return (
    <section id="hobbies" className="py-24 px-6 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="Outside of Work"
          subtitle="The things that keep me curious and energized."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {hobbies.map((h) => (
            <div
              key={h.name}
              className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-md hover:border-[#0176d3]/20 transition-all"
            >
              <div className="text-4xl mb-3">{h.icon}</div>
              <h3 className="font-semibold text-[#032d60] mb-1">{h.name}</h3>
              <p className="text-sm text-gray-500">{h.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
