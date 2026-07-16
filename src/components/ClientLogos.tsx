"use client";

import { clients } from "@/data/content";
import { useState } from "react";

function ClientLogo({ name, logo, large, xlarge }: { name: string; logo: string; large?: boolean; xlarge?: boolean }) {
  const [failed, setFailed] = useState(false);

  const sizeClass = xlarge
    ? "h-16 w-auto max-w-[140px] md:h-28 md:max-w-[240px] object-contain"
    : large
    ? "h-12 w-auto max-w-[120px] md:h-20 md:max-w-[220px] object-contain"
    : "h-8 w-auto max-w-[100px] md:h-14 md:max-w-[180px] object-contain";

  return (
    <div className="flex items-center justify-center py-4 px-3 md:py-8 md:px-6">
      {failed ? (
        <span className="text-sm font-medium text-[#c0c0c9]">{name}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          className={sizeClass}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function ClientLogos() {
  return (
    <section className="py-16 px-6 border-b border-[#e5e5ec]">
      <div className="max-w-5xl mx-auto">
        <p className="text-base font-medium text-[#202022] uppercase tracking-widest mb-4">
          Trusted by
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {clients.map((c) => (
            <ClientLogo key={c.name} name={c.name} logo={c.logo} large={c.large} xlarge={c.xlarge} />
          ))}
        </div>
      </div>
    </section>
  );
}
