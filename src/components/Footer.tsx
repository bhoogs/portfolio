import { profile } from "@/data/content";

export default function Footer() {
  return (
    <footer className="bg-[#021a3a] py-6 px-6 text-center">
      <p className="text-blue-200/50 text-sm">
        © {new Date().getFullYear()} {profile.name}. Built with Next.js & Tailwind CSS.
      </p>
    </footer>
  );
}
