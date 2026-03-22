import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Zap,
  Video,
  User,
  Trophy
} from 'lucide-react';

const COLORS = {
  bg: '#090B10',
  surface: '#0E1117',
  panel: '#12161E',
  border: '#1C2333',
  accent: '#00D9FF',
  gold: '#F5A623',
  text: '#C8D8E8',
  textDim: '#8EA2B8',
  emerald: '#10b981',
  indigo: '#6366f1',
  orange: '#f59e0b'
};

export default function MusicHub() {
  const navigate = useNavigate();

  const plans = [
    {
      id: 'single',
      name: 'Single Session',
      price: 50,
      description: 'One-on-One personalized remote session',
      features: [
        'Live 1:1 Video Instruction',
        'Personalized Practice Plan',
        'All Skill Levels (Beginner to Pro)',
        'Session Recording Included',
        'PDF Lesson Materials'
      ],
      popular: false
    },
    {
      id: 'bundle',
      name: 'Advantage Bundle',
      price: 150,
      originalPrice: 200,
      description: 'Buy 3, Get 1 FREE Special Offer',
      features: [
        '4 Sessions for the price of 3',
        'Priority Scheduling',
        'Direct Messaging Support',
        'Personal Progress Tracking',
        'Curated Resource Access'
      ],
      tag: 'BEST VALUE',
      popular: true
    }
  ];

  const testimonials = [
    {
      name: "James L.",
      text: "The transition from beginner to intermediate was so much smoother with these lessons. The live feedback is invaluable.",
      role: "Student for 6 months"
    },
    {
      name: "Sarah M.",
      text: "I tried apps, but nothing beats 1-on-1 instruction. My technique improved more in 3 weeks than in a year of self-study.",
      role: "Advanced Student"
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.text, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden' }}>
      <header style={{ borderBottom: `1px solid ${COLORS.border}`, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(9, 11, 16, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>TRADEHAX MUSIC</h2>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'transparent', color: COLORS.accent, border: `1px solid ${COLORS.accent}`, borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
        >
          Back to Platform
        </button>
      </header>

      {/* Dynamic Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.1 }}>
        <div style={{ position: 'absolute', top: 0, left: '-25%', width: '50%', height: '50%', background: COLORS.accent, filter: 'blur(120px)', borderRadius: '50%', opacity: 0.2 }} />
        <div style={{ position: 'absolute', bottom: 0, right: '-25%', width: '50%', height: '50%', background: '#a855f7', filter: 'blur(120px)', borderRadius: '50%', opacity: 0.2 }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: 'rgba(0, 217, 255, 0.1)', border: `1px solid rgba(0, 217, 255, 0.2)`, color: COLORS.accent, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
            <Zap size={14} /> Professional Instruction
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 24, background: 'linear-gradient(to right, #fff, #8EA2B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MASTER THE <span style={{ color: COLORS.accent, WebkitTextFillColor: COLORS.accent }}>GUITAR</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: COLORS.textDim, lineHeight: 1.6 }}>
            Live, personalized one-on-one remote sessions tailored to your goals.
            From fundamental chords to advanced theory, learn from anywhere.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, maxWidth: 1000, margin: '0 auto 80px' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                position: 'relative',
                background: COLORS.surface,
                borderRadius: 24,
                padding: 40,
                border: `1px solid ${plan.popular ? COLORS.accent : COLORS.border}`,
                boxShadow: plan.popular ? `0 0 40px rgba(0, 217, 255, 0.1)` : 'none',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {plan.tag && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', background: COLORS.accent, color: '#000', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', borderRadius: 999 }}>
                  {plan.tag}
                </div>
              )}

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, color: '#fff' }}>{plan.name}</h3>
                <p style={{ color: COLORS.textDim, fontSize: '0.875rem', marginBottom: 24 }}>{plan.description}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: '#fff' }}>${plan.price}</span>
                  {plan.originalPrice && (
                    <span style={{ color: COLORS.textDim, textDecoration: 'line-through', fontSize: '1.25rem' }}>${plan.originalPrice}</span>
                  )}
                  <span style={{ color: COLORS.textDim, fontSize: '0.875rem' }}>/ {plan.id === 'bundle' ? '4 Lessons' : 'Session'}</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', flexGrow: 1 }}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, fontSize: '0.875rem', color: COLORS.text }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0, 217, 255, 0.1)', border: `1px solid rgba(0, 217, 255, 0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={12} color={COLORS.accent} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button style={{
                width: '100%',
                padding: '16px',
                borderRadius: 12,
                border: 'none',
                fontWeight: 900,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: plan.popular ? COLORS.accent : '#fff',
                color: '#000',
              }}>
                BOOK NOW
              </button>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, marginBottom: 100 }}>
          <div style={{ padding: '24px', borderRadius: '24px', background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Video size={24} color={COLORS.indigo} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>100% Remote</h4>
            <p style={{ color: COLORS.textDim, fontSize: '0.875rem', lineHeight: 1.6 }}>High-definition video sessions from the comfort of your home. No commute, just learning.</p>
          </div>
          <div style={{ padding: '24px', borderRadius: '24px', background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <User size={24} color={COLORS.emerald} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>Personalized</h4>
            <p style={{ color: COLORS.textDim, fontSize: '0.875rem', lineHeight: 1.6 }}>No generic curriculum. We focus on the songs and techniques YOU want to learn.</p>
          </div>
          <div style={{ padding: '24px', borderRadius: '24px', background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Trophy size={24} color={COLORS.orange} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>All Skill Levels</h4>
            <p style={{ color: COLORS.textDim, fontSize: '0.875rem', lineHeight: 1.6 }}>Whether you just bought your first guitar or you're looking to master jazz fusion.</p>
          </div>
        </div>

        {/* Testimonials */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 48, color: '#fff' }}>SUCCESS STORIES</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ padding: 32, borderRadius: 24, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'left', fontStyle: 'italic' }}>
                <p style={{ color: COLORS.text, marginBottom: 24, lineHeight: 1.6 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: COLORS.panel }} />
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, fontStyle: 'normal', color: '#fff' }}>{t.name}</p>
                    <p style={{ fontSize: '0.75rem', color: COLORS.textDim, fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
