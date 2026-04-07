/**
 * EXAMPLE LANDING PAGE
 *
 * This is a template showing how to use the LandingTemplate component
 * Use this pattern for homepage, marketing pages, and overview pages
 */

import { Card, LandingTemplate } from '@/components/framework';

export const metadata = {
  title: 'Page Title | TradeHax',
  description: 'Page description for SEO',
};

const SECTIONS = [
  {
    title: 'First Section Title',
    subtitle: 'Optional subtitle explaining this section',
    content: (
      <div className="space-y-6">
        <p className="text-lg text-gray-300 leading-relaxed">
          Your content here. You can use any React components or HTML elements.
        </p>
      </div>
    ),
  },
  {
    title: 'Second Section Title',
    subtitle: 'Another section with different content',
    content: (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} variant="bordered">
            <h3 className="text-lg font-semibold mb-2">Item {i}</h3>
            <p className="text-gray-400 text-sm">Description of item {i}</p>
          </Card>
        ))}
      </div>
    ),
  },
  {
    title: 'Third Section Title',
    content: (
      <div className="prose prose-invert max-w-none">
        <p>More content here with full flexibility.</p>
      </div>
    ),
  },
];

export default function ExamplePage() {
  return (
    <LandingTemplate
      kicker="Page Category"
      title="Main Page Headline"
      subtitle="A compelling subtitle that explains what this page is about and what visitors will learn or accomplish."
      sections={SECTIONS}
      cta={{
        label: 'Call to Action',
        href: '/target-page',
      }}
    />
  );
}
