import { certifications } from "@/data/content";

export default function Certifications() {
  return (
    <section className="py-16 px-6 border-b border-[#e5e5ec]">
      <div className="max-w-5xl mx-auto">
        <p className="text-base font-medium text-[#202022] uppercase tracking-widest mb-8">
          Salesforce Certifications
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-6">
          {certifications.map((cert) => (
            <div key={cert.name} className="flex flex-col items-center gap-2 group">
              <img
                src={cert.logo}
                alt={cert.name}
                className="w-24 h-24 object-contain"
              />
              <span className="text-[10px] text-center text-[#c0c0c9] leading-tight hidden md:block">
                {cert.name.replace("Salesforce Certified ", "")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
