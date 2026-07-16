import { books } from "@/data/content";
import SectionHeader from "./SectionHeader";

export default function Books() {
  return (
    <section id="books" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          title="Influential Books"
          subtitle="Books that have shaped how I think, lead, and build."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <div
              key={book.title}
              className="border border-[#e5e5ec] rounded-xl p-6 hover:border-[#c0c0c9] transition-colors"
            >
              <h3 className="font-semibold text-[#202022] text-sm mb-0.5">{book.title}</h3>
              <p className="text-xs text-[#0176d3] font-medium mb-3">{book.author}</p>
              <p className="text-sm text-[#484850] leading-relaxed">{book.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
