import { Card } from '@/components/base/Card';
import { Container } from '@/components/base/Container';
import { Hero } from '@/components/base/Hero';
import { Section } from '@/components/base/Section';
import { PageLayout } from '@/components/layouts/PageLayout';
import React from 'react';

interface ServiceTemplateProps {
  title: string;
  kicker: string;
  subtitle: string;
  features: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
  pricing: Array<{
    name: string;
    price: string;
    features: string[];
  }>;
  cta?: {
    label: string;
    href: string;
  };
}

export function ServiceTemplate({
  title,
  kicker,
  subtitle,
  features,
  pricing,
  cta,
}: ServiceTemplateProps) {
  return (
    <PageLayout>
      <Hero kicker={kicker} title={title} subtitle={subtitle} cta={cta} />

      <Section title="What You Get" className="bg-gray-900/30">
        <Container>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} variant="bordered">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section title="Pricing" className="bg-black">
        <Container>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricing.map((plan, idx) => (
              <Card key={idx} variant="bordered">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-3xl font-black text-cyan-400 mb-6">{plan.price}</p>
                <ul className="space-y-3">
                  {plan.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-sm">
                      <span className="text-cyan-400 mt-1">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
}
