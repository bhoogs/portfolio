import { hobbies } from "@/data/content";
import SectionHeader from "./SectionHeader";

export default function Hobbies() {
  return (
    <section id="hobbies" className="py-24 px-6 bg-[#fafafa]">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          title="Outside of Work"
          subtitle="The things that keep me curious and energized."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {hobbies.map((h) => (
            <div
              key={h.name}
              className="bg-white border border-[#e5e5ec] rounded-xl p-5 hover:border-[#c0c0c9] transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl leading-none">{h.icon}</span>
                <h3 className="font-semibold text-[#202022] text-base leading-tight">{h.name}</h3>
              </div>
              {h.description && <p className="text-sm text-[#484850]">{h.description}</p>}
              {h.places && (
                <div className="mt-2">
                  {h.placesLabel && (
                    <p className="text-sm font-medium text-[#484850] mb-1.5">{h.placesLabel}</p>
                  )}
                  <ul className="space-y-1.5">
                    {h.places.map((place) => (
                      <li key={place.name} className="flex items-center gap-2 text-sm text-[#484850]">
                        <span className="w-1 h-1 rounded-full bg-[#c0c0c9] shrink-0" />
                        {place.url ? (
                          <a href={place.url} target="_blank" rel="noopener noreferrer" className="text-[#0176d3] hover:text-[#032d60] transition-colors">
                            {place.name}
                          </a>
                        ) : (
                          place.name
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {h.link && (
                <a
                  href={h.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-[#484850] border border-[#e5e5ec] rounded-lg px-4 py-2 hover:border-[#c0c0c9] hover:bg-[#fafafa] transition-colors"
                >
                  <svg className="w-4 h-4 text-[#d32323]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.111 18.226c-.141.969-2.119 3.483-3.029 3.847-.311.124-.611.094-.85-.09-.154-.12-.314-.365-2.447-3.827l-.052-.085c-.184-.303-.134-.696.124-.992a1.07 1.07 0 0 1 1.033-.316l.095.025c3.797 1.036 3.909 1.073 4.08 1.201.272.203.368.524.046 1.237zm-3.81-4.908l-.059.013c-.374.083-.717-.08-.932-.424-.003-.005-1.973-3.741-1.999-3.79-.171-.311-.136-.68.094-.969l.063-.074c.192-.22.468-.316.747-.262.271.052 2.688 1.028 3.604 1.396l.004.001c.873.352 1.271.538 1.397.82.173.394-.063.87-.919 3.289zm-7.41 8.985c-.067.966-1.898 2.917-2.885 3.097-.337.061-.635-.049-.82-.298-.12-.16-.18-.355-1.042-4.281l-.021-.097c-.073-.352.133-.711.513-.905.377-.192.82-.152 1.102.104l.074.065c2.865 2.559 2.96 2.662 3.052 2.838.131.254.092.575.027 1.477zM6.199 9.298c-.065.393-.328.683-.677.753l-.104.017L1.15 9.8c-.433-.059-.748-.372-.763-.804 0-.001-.005-4.304 0-4.368.049-.717.461-1.021.748-1.098.347-.093.702.022.935.301.012.014 4.032 4.582 4.049 4.599.233.266.166.587.08.868zm5.783-.67c-.059.396-.335.677-.685.714-.021.002-.102.01-4.418-.729l-.001-.001-.09-.016c-.358-.073-.597-.362-.6-.74-.004-.378.228-.688.586-.77L6.789 7l.009-.002c.97-.21 3.571-.768 3.572-.769.484-.103.853.168 1.054.501.05.084.107.217.087.426-.016.167-.529 2.472-.529 2.472z"/>
                  </svg>
                  {h.link.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
