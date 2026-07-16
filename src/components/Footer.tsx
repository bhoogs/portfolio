import { profile } from "@/data/content";

export default function Footer() {
  return (
    <footer className="border-t border-[#e5e5ec] py-6 px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-1 items-center md:flex-row md:justify-between md:gap-0">
        <p className="text-sm text-[#c0c0c9]">
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="text-sm text-[#c0c0c9]">Built with Next.js</p>
      </div>
    </footer>
  );
}
