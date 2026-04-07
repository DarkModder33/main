
interface HeroProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  cta?: {
    label: string;
    href: string;
  };
  variant?: 'default' | 'dark' | 'light';
}

const variants = {
  default: 'bg-gradient-to-b from-gray-950 via-gray-900 to-black',
  dark: 'bg-black',
  light: 'bg-white',
};

export function Hero({ kicker, title, subtitle, cta, variant = 'default' }: HeroProps) {
  return (
    <section className={`${variants[variant]} py-16 sm:py-20 md:py-28 px-4`}>
      <div className="max-w-4xl mx-auto text-center">
        {kicker && (
          <p className="text-sm sm:text-base font-semibold text-cyan-400 mb-4 uppercase tracking-wider">
            {kicker}
          </p>
        )}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {cta && (
          <a
            href={cta.href}
            className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
          >
            {cta.label}
          </a>
        )}
      </div>
    </section>
  );
}
