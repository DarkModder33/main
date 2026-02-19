type IntelligenceMetricCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function IntelligenceMetricCard(props: IntelligenceMetricCardProps) {
  const { label, value, hint } = props;

  return (
    <article className="theme-grid-card">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-[#8ea8be]">{hint}</p>
    </article>
  );
}
