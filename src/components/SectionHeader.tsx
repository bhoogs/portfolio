interface Props {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ title, subtitle }: Props) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#202022] tracking-tight mb-2">{title}</h2>
      {subtitle && <p className="text-[#484850] text-base">{subtitle}</p>}
    </div>
  );
}
