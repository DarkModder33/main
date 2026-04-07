import { Container } from '@/components/base/Container';
import { Hero } from '@/components/base/Hero';
import { Section } from '@/components/base/Section';
import { PageLayout } from '@/components/layouts/PageLayout';
import React from 'react';

interface LandingTemplateProps {
  title: string;
  kicker: string;
  subtitle: string;
  sections: Array<{
    title: string;
    subtitle?: string;
    content: React.ReactNode;
  }>;
  cta?: {
    label: string;
    href: string;
  };
}

export function LandingTemplate({
  title,
  kicker,
  subtitle,
  sections,
  cta,
}: LandingTemplateProps) {
  return (
    <PageLayout>
      <Hero kicker={kicker} title={title} subtitle={subtitle} cta={cta} />

      {sections.map((section, idx) => (
        <Section
          key={idx}
          title={section.title}
          subtitle={section.subtitle}
          className={idx % 2 === 0 ? 'bg-black' : 'bg-gray-900/30'}
        >
          <Container>{section.content}</Container>
        </Section>
      ))}
    </PageLayout>
  );
}
