import { lists } from "@/data/content";
import SectionHeader from "./SectionHeader";

export default function Lists() {
  return (
    <section id="lists" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="My Lists"
          subtitle="Curated picks from tools to podcasts — things I genuinely use and recommend."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {lists.map((list) => (
            <div
              key={list.title}
              className="border border-gray-100 rounded-2xl p-7 hover:shadow-md hover:border-[#0176d3]/20 transition-all"
            >
              <h3 className="font-semibold text-[#032d60] text-lg mb-4">{list.title}</h3>
              <ul className="space-y-2.5">
                {list.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#0176d3] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
