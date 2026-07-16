import { lists, rankedLists } from "@/data/content";
import SectionHeader from "./SectionHeader";

export default function Lists() {
  return (
    <section id="lists" className="py-24 px-6 bg-[#fafafa] border-t border-[#e5e5ec]">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          title="My Lists"
          subtitle="Curated picks from tools to podcasts — things I genuinely use and recommend."
        />

        {/* Short curated lists */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {lists.map((list) => (
            <div
              key={list.title}
              className="bg-white border border-[#e5e5ec] rounded-xl p-6 hover:border-[#c0c0c9] transition-colors"
            >
              <h3 className="font-semibold text-[#202022] text-sm mb-4">{list.title}</h3>
              {list.books ? (
                <ul className="space-y-2">
                  {list.books.map((book) => (
                    <li key={book.title} className="flex items-baseline justify-between gap-3 text-sm text-[#484850]">
                      <span>{book.title}</span>
                      <span className="text-[#c0c0c9] text-xs shrink-0">{book.author}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2">
                  {list.items?.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#484850]">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#c0c0c9] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Ranked lists */}
        <div className="grid md:grid-cols-2 gap-4">
          {rankedLists.map((list) => (
            <div
              key={list.title}
              className="bg-white border border-[#e5e5ec] rounded-xl p-6 hover:border-[#c0c0c9] transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-lg">{list.icon}</span>
                <h3 className="font-semibold text-[#202022] text-sm">{list.title}</h3>
              </div>
              <ol className="max-h-80 overflow-y-auto pr-4" style={{ scrollbarGutter: "stable" }}>
                {list.items.map((item, i) => {
                  const parts = item.split(" — ");
                  const hasColumns = list.twoColumn && parts.length === 2;
                  return (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#484850] py-1 border-b border-[#f0f0f5] last:border-0">
                      <span className="shrink-0 w-5 text-right text-[#c0c0c9] font-medium text-xs mt-0.5">
                        {i + 1}
                      </span>
                      {hasColumns ? (
                        <>
                          <span className="flex-1 min-w-0">{parts[0]}</span>
                          <span className="shrink-0 text-[#c0c0c9] text-xs mt-0.5 text-right max-w-[40%]">{parts[1]}</span>
                        </>
                      ) : (
                        <span>{item}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
