interface Props {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ title, subtitle }: Props) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-[#032d60] mb-3">{title}</h2>
      {subtitle && <p className="text-gray-500 text-lg max-w-xl mx-auto">{subtitle}</p>}
      <div className="mt-4 w-12 h-1 bg-[#0176d3] rounded-full mx-auto" />
    </div>
  );
}
