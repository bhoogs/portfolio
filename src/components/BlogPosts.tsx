import { blogPosts } from "@/data/content";
import SectionHeader from "./SectionHeader";

export default function BlogPosts() {
  return (
    <section id="blog" className="py-24 px-6 border-t border-[#e5e5ec]">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          title="Blog Posts"
          subtitle="Articles and insights on Salesforce strategy and enterprise implementation."
        />
        <div className="grid sm:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <a
              key={post.url}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-0 bg-white border border-[#e5e5ec] rounded-xl overflow-hidden hover:border-[#c0c0c9] hover:shadow-sm transition-all"
            >
              <div className="w-1 bg-[#0176d3] shrink-0" />
              <div className="p-6">
                <p className="text-xs font-medium text-[#c0c0c9] uppercase tracking-widest mb-2">{post.publication}</p>
                <h3 className="text-base font-semibold text-[#202022] group-hover:text-[#0176d3] transition-colors mb-3 leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-[#484850] leading-relaxed">{post.summary}</p>
                <span className="inline-block mt-4 text-xs font-medium text-[#0176d3]">Read more →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
