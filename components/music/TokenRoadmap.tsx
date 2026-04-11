'use client';

import { CheckCircle2, Circle, Award, Users, Star, Rocket } from 'lucide-react';
import { EmailCapture } from '@/components/EmailCapture';

/**
 * Music platform roadmap visualization
 * Shows development phases and allows early access signup
 */
export function TokenRoadmap() {
  const roadmapPhases = [
    {
      phase: 'Phase 1',
      title: 'Platform Launch',
      status: 'in-progress',
      items: [
        'Online lesson booking system',
        'Student progress tracking',
        'Early adopter rewards program',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'Scholarship Platform',
      status: 'upcoming',
      items: [
        'Community governance implementation',
        'Scholarship proposal system',
        'Community voting mechanism',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'Premium Features',
      status: 'upcoming',
      items: [
        'Exclusive content access',
        'Premium music releases',
        'Advanced artist tools',
      ],
    },
  ];

  const utilities = [
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Music Scholarships',
      description: 'Fund education through community proposals',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community',
      description: 'Connect with students and artists',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Premium Access',
      description: 'Unlock exclusive content and features',
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Artist Rewards',
      description: 'Earn recognition through engagement',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Platform Utilities */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">Platform Features</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {utilities.map((utility) => (
            <div key={utility.title} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FF6B35]/20 rounded-lg flex items-center justify-center text-[#FF6B35] flex-shrink-0">
                {utility.icon}
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">{utility.title}</h4>
                <p className="text-gray-400 text-sm">{utility.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">Development Roadmap</h3>
        <div className="space-y-6">
          {roadmapPhases.map((phase) => (
            <div key={phase.phase} className="relative">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  phase.status === 'in-progress'
                    ? 'bg-gradient-to-r from-[#FF6B35] to-orange-600'
                    : 'bg-gray-800'
                }`}>
                  {phase.status === 'in-progress' ? (
                    <Circle className="w-5 h-5 text-white fill-current animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-[#FF6B35]">{phase.phase}</span>
                    <h4 className="text-lg font-bold text-white">{phase.title}</h4>
                  </div>
                  
                  <ul className="space-y-2">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          phase.status === 'in-progress' ? 'text-[#FF6B35]' : 'text-gray-600'
                        }`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {phase.phase !== 'Phase 3' && (
                <div className="ml-5 h-8 w-0.5 bg-gray-800 my-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Early Access Signup */}
      <div className="bg-gradient-to-br from-[#FF6B35]/20 to-orange-900/20 border border-[#FF6B35]/30 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-4 text-center">
          Get Early Access
        </h3>
        <p className="text-gray-300 text-center mb-6">
          Join the waitlist and be among the first to access new platform features when we launch.
          Early members receive exclusive perks!
        </p>
        <EmailCapture />
      </div>
    </div>
  );
}
