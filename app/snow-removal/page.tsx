/* -----------------------------------------------------------------------
 * <copyright company="Microsoft Corporation">
 *   Copyright (c) Microsoft Corporation.  All rights reserved.
 * </copyright>
 * ----------------------------------------------------------------------- */

import SnowRemovalForm from '@/components/SnowRemovalForm';

const flakeVariants = [
  'snowflake-v1',
  'snowflake-v2',
  'snowflake-v3',
  'snowflake-v4',
  'snowflake-v5',
  'snowflake-v6',
  'snowflake-v7',
  'snowflake-v8',
  'snowflake-v9',
  'snowflake-v10',
  'snowflake-v11',
  'snowflake-v12',
  'snowflake-v13',
  'snowflake-v14',
];

export default function SnowRemovalPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.16),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(96,165,250,0.12),transparent_35%),radial-gradient(circle_at_50%_120%,rgba(15,23,42,0.95),rgba(2,6,23,1)_70%)]" />

      <div className="snowstorm-bg" aria-hidden="true">
        <div className="snowstorm-wind" />
        {Array.from({ length: 56 }, (_, index) => (
          <span
            key={`flake-${index}`}
            className={`snowflake ${flakeVariants[index % flakeVariants.length]}`}
          />
        ))}
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
        <header className="rounded-3xl border border-white/15 bg-slate-900/60 p-6 backdrop-blur-xl md:p-10">
          <p className="mb-3 inline-flex rounded-full border border-sky-300/25 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            Local Winter Services
          </p>
          <h1 className="text-3xl font-black uppercase italic tracking-tight text-white md:text-5xl">
            Snow Removal Services
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-200 md:text-base">
            Fast, reliable snow removal for driveways and walkways. I&apos;ll handle jobs personally whenever possible, and if I&apos;m overbooked I can coordinate with trusted local landscaping contacts so your property still gets cleared quickly.
          </p>
          <p className="mt-4 text-sm font-semibold text-sky-100 md:text-base">
            Contact: <a className="underline decoration-sky-300/60 underline-offset-4" href="tel:+18563208570">(856) 320-8570</a> · <a className="underline decoration-sky-300/60 underline-offset-4" href="mailto:njsnowremoval26@gmail.com">njsnowremoval26@gmail.com</a>
          </p>
        </header>

        <SnowRemovalForm />
      </section>
    </main>
  );
}
