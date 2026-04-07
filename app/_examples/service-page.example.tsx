/**
 * EXAMPLE SERVICE PAGE
 *
 * This is a template showing how to use the ServiceTemplate component
 * Copy this pattern to create new service pages (Guitar Lessons, Consulting, etc.)
 */

import { ServiceTemplate } from '@/components/framework';
import { Guitar, Sparkles, Trophy } from 'lucide-react';

export const metadata = {
  title: 'Service Name | TradeHax',
  description: 'Your service description here',
};

const FEATURES = [
  {
    icon: <Guitar className="w-8 h-8 text-cyan-400" />,
    title: 'Feature One',
    description: 'Description of your first feature and what it provides to customers.',
  },
  {
    icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
    title: 'Feature Two',
    description: 'Description of your second feature and key benefits.',
  },
  {
    icon: <Trophy className="w-8 h-8 text-cyan-400" />,
    title: 'Feature Three',
    description: 'Description of your third feature and outcomes.',
  },
];

const PRICING = [
  {
    name: 'Starter',
    price: '$X/month',
    features: ['Feature 1', 'Feature 2', 'Email support'],
  },
  {
    name: 'Professional',
    price: '$XX/month',
    features: ['All Starter features', 'Feature 3', 'Priority support', 'Custom options'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['All Professional features', 'Dedicated support', 'Custom integration', 'SLA guarantee'],
  },
];

export default function ServicePage() {
  return (
    <ServiceTemplate
      kicker="Service Category"
      title="Your Service Title"
      subtitle="One-paragraph description of what this service provides and who it's for."
      features={FEATURES}
      pricing={PRICING}
      cta={{
        label: 'Get Started',
        href: '/booking',
      }}
    />
  );
}
