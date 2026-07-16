import { profile } from "@/data/content";

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 bg-white border-t border-[#e5e5ec]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold text-[#202022] tracking-tight mb-2">Let's Connect</h2>
        <p className="text-[#484850] text-base mb-8 max-w-lg">
          Whether you're evaluating Salesforce, navigating a complex implementation, or just want to talk shop — I'd love to hear from you.
        </p>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-[#202022] text-white px-7 py-3 rounded-lg text-sm font-medium hover:bg-[#484850] transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Connect on LinkedIn
        </a>
      </div>
    </section>
  );
}
