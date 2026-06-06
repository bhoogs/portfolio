import { books } from "@/data/content";
import SectionHeader from "./SectionHeader";

export default function Books() {
  return (
    <section id="books" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="Influential Books"
          subtitle="Books that have shaped how I think, lead, and build."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.title}
              className="border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-[#0176d3]/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#e8f4fd] flex items-center justify-center mb-4 text-lg">
                📖
              </div>
              <h3 className="font-semibold text-[#032d60] mb-1 group-hover:text-[#0176d3] transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-[#0176d3] font-medium mb-3">{book.author}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{book.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
