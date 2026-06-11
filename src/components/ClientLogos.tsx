"use client";

import { clients } from "@/data/content";
import { useState } from "react";

function ClientLogo({ name, logo }: { name: string; logo: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="h-14 flex items-center justify-center px-6 py-2">
      {failed ? (
        <span className="text-sm font-semibold text-gray-400 tracking-wide">{name}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          className="max-h-10 max-w-[130px] object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function ClientLogos() {
  return (
    <section className="py-16 px-6 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10">
          Trusted by
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          {clients.map((c) => (
            <ClientLogo key={c.name} name={c.name} logo={c.logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
