# TradeHax Component & Layout Framework

This framework provides reusable components, layouts, and templates to quickly build pages across the TradeHax site.

## Structure

```
app/components/
├── base/              # Atomic building blocks
│   ├── Container.tsx  # Max-width wrapper
│   ├── Hero.tsx       # Hero section component
│   ├── Card.tsx       # Card wrapper
│   ├── Button.tsx     # Button component
│   └── Section.tsx    # Section with spacing
│
├── layouts/           # Page-level wrappers
│   ├── PageLayout.tsx # Standard page wrapper with footer
│   └── AuthLayout.tsx # Auth page wrapper
│
├── templates/         # Composed templates
│   ├── ServiceTemplate.tsx  # For service pages (Guitar, Consulting, etc.)
│   └── LandingTemplate.tsx   # For landing/overview pages
│
└── framework/
    └── index.ts       # Export all framework components
```

## Base Components

### Container
Responsive max-width wrapper with padding.

```tsx
import { Container } from '@/components/framework';

<Container size="lg">
  <p>Content with max-width and responsive padding</p>
</Container>
```

Sizes: `sm` (2xl), `md` (4xl), `lg` (6xl), `full`

### Hero
Large hero section with kicker, title, subtitle, and CTA.

```tsx
import { Hero } from '@/components/framework';

<Hero
  kicker="Category"
  title="Main Headline"
  subtitle="Supporting text"
  cta={{ label: 'Get Started', href: '/path' }}
  variant="default"
/>
```

Variants: `default`, `dark`, `light`

### Card
Flexible card wrapper with different styles.

```tsx
import { Card } from '@/components/framework';

<Card variant="bordered">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

Variants: `default`, `bordered`, `ghost`

### Button
Standard button with variants and sizes.

```tsx
import { Button } from '@/components/framework';

<Button variant="primary" size="md">
  Click Me
</Button>
```

Variants: `primary`, `secondary`, `ghost`
Sizes: `sm`, `md`, `lg`

### Section
Page section with title, subtitle, and spacing.

```tsx
import { Section, Container } from '@/components/framework';

<Section title="Section Title" subtitle="Optional subtitle">
  <Container>
    {/* content */}
  </Container>
</Section>
```

## Layouts

### PageLayout
Standard page wrapper with header, main content, and footer.

```tsx
import { PageLayout } from '@/components/framework';

export default function Page() {
  return (
    <PageLayout footer={true}>
      {/* page content */}
    </PageLayout>
  );
}
```

Props:
- `footer`: boolean (default: true) - Show/hide footer

### AuthLayout
Auth page wrapper (smaller, centered, no footer).

```tsx
import { AuthLayout } from '@/components/framework';

export default function LoginPage() {
  return (
    <AuthLayout title="Log In" subtitle="Enter your credentials">
      {/* login form */}
    </AuthLayout>
  );
}
```

## Templates

### ServiceTemplate
Complete service page with features and pricing.

```tsx
import { ServiceTemplate } from '@/components/framework';

export default function GuitarLessonsPage() {
  return (
    <ServiceTemplate
      kicker="Music Services"
      title="Guitar Lessons"
      subtitle="Professional instruction with AI-powered practice plans"
      features={[
        { icon: <GuitarIcon />, title: 'Expert Teaching', description: '...' },
        // ... more features
      ]}
      pricing={[
        { name: 'Beginner', price: '$75/session', features: ['...'] },
        // ... more tiers
      ]}
      cta={{ label: 'Book a Lesson', href: '/music/lessons' }}
    />
  );
}
```

### LandingTemplate
Flexible landing page with multiple sections.

```tsx
import { LandingTemplate } from '@/components/framework';

export default function HomePage() {
  return (
    <LandingTemplate
      kicker="Home"
      title="Welcome to TradeHax"
      subtitle="Professional services for trading, music, and tech"
      sections={[
        {
          title: 'Section One',
          subtitle: 'Optional subtitle',
          content: <div>Your content</div>
        },
        // ... more sections
      ]}
      cta={{ label: 'Explore', href: '/services' }}
    />
  );
}
```

## Quick Start for New Page

1. **Create new page file** in `app/[route]/page.tsx`
2. **Choose a template** (ServiceTemplate or LandingTemplate)
3. **Fill in your content** (title, sections, pricing, etc.)
4. **Export and deploy**

See example files in `app/_examples/` for full working examples.

## Styling

All components use Tailwind CSS with a consistent dark theme:
- Primary color: cyan-500 (CTAs, highlights)
- Backgrounds: black, gray-900/50, gray-950
- Text: white, gray-300, gray-400

## Adding New Components

1. Create file in `app/components/base/` (or appropriate folder)
2. Export from `app/components/framework/index.ts`
3. Use in templates and pages

## Notes

- All components are client-safe and work with Next.js 16
- Use TypeScript for type safety
- Layouts automatically handle footer and spacing
- Keep responsive design in mind (sm, md, lg breakpoints)
