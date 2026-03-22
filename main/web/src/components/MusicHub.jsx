import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Zap,
  Video,
  User,
  Trophy,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

// Import pricing from the centralized source of truth
import { LESSON_PRICING } from '../../../lib/pricing/guitar-lessons';

const COLORS = {
  bg: '#05070A',
  surface: 'rgba(14, 17, 23, 0.7)',
  panel: 'rgba(18, 22, 30, 0.8)',
  border: 'rgba(28, 35, 51, 0.5)',
  accent: '#00D9FF',
  gold: '#F5A623',
  text: '#C8D8E8',
  textDim: '#8EA2B8',
  emerald: '#10b981',
  indigo: '#6366f1',
  orange: '#f59e0b'
};

const glassEffect = {
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  backgroundColor: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
};

export default function MusicHub() {
  const navigate = useNavigate();
  const [activeTier, setActiveTier] = useState('beginner');
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pricing = LESSON_PRICING[activeTier];

  const plans = [
    {
      id: 'single',
      name: 'Single Session',
      price: pricing.pricePerSession,
      description: 'One-on-One personalized remote session',
      features: [
        'Live 1:1 Video Instruction',
        'Personalized Practice Plan',
        'Session Recording Included',
        'PDF Lesson Materials'
      ],
      popular: false
    },
    {
      id: 'bundle',
      name: 'Advantage Bundle',
      price: pricing.packageOf4,
      originalPrice: pricing.pricePerSession * 4,
      description: 'Buy 3, Get 1 FREE Special Offer',
      features: [
        '4 Sessions for the price of 3',
        'Priority Scheduling',
        'Direct Messaging Support',
        'Personal Progress Tracking'
      ],
      tag: 'BEST VALUE',
      popular: true
    }
  ];

  const curriculum = [
    { module: 'Module 1', title: 'Fundamentals & Technique', topics: ['Posture & Hand Position', 'Basic Chord Governance', 'Rhythmic Foundations'] },
    { module: 'Module 2', title: 'Theory & Application', topics: ['Major & Minor Scales', 'Interval Relationships', 'Song Construction'] },
    { module: 'Module 3', title: 'Performance Mastery', topics: ['Improvisation Basics', 'Tone Crafting', 'Dynamic Expression'] }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      overflowX: 'hidden'
    }}>
      {/* Premium Header */}
      <header style={{
        ...glassEffect,
        padding: isMobile ? '16px 20px' : '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
          TRADEHAX <span style={{ color: COLORS.accent }}>MUSIC</span>
        </h2>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            color: COLORS.accent,
            border: `1px solid ${COLORS.accent}`,
            borderRadius: 12,
            padding: isMobile ? '6px 12px' : '8px 20px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            transition: 'all 0.2s'
          }}
        >
          {isMobile ? 'Back' : 'Back to Platform'}
        </button>
      </header>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: isMobile ? '60px 20px 40px' : '100px 20px 80px',
        textAlign: 'center',
        background: `radial-gradient(circle at 50% 0%, rgba(0, 217, 255, 0.08) 0%, transparent 70%)`
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          borderRadius: 999,
          background: 'rgba(0, 217, 255, 0.1)',
          border: `1px solid rgba(0, 217, 255, 0.2)`,
          color: COLORS.accent,
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 24
        }}>
          <Sparkles size={14} /> Elite Mentorship Program
        </div>
        <h1 style={{
          fontSize: `clamp(2.5rem, ${isMobile ? '10vw' : '6vw'}, 5rem)`,
          fontWeight: 950,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          marginBottom: 24,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #8EA2B8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          MASTER YOUR <br />
          <span style={{ color: COLORS.accent, WebkitTextFillColor: COLORS.accent }}>CRAFT</span>
        </h1>
        <p style={{
          fontSize: isMobile ? '1.1rem' : '1.3rem',
          color: COLORS.textDim,
          maxWidth: 600,
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          Precision-engineered guitar instruction for the modern artist.
          Remote, elite, and tailored to your trajectory.
        </p>

        {/* Tier Selector */}
        <div style={{
          display: 'inline-flex',
          background: COLORS.panel,
          padding: 4,
          borderRadius: 16,
          border: `1px solid ${COLORS.border}`,
          marginBottom: 40
        }}>
          {['beginner', 'intermediate', 'advanced'].map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: 'none',
                background: activeTier === tier ? COLORS.accent : 'transparent',
                color: activeTier === tier ? '#000' : COLORS.textDim,
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {tier}
            </button>
          ))}
        </div>
      </section>

      {/* Pricing Interface */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 24,
          justifyContent: 'center'
        }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                ...glassEffect,
                borderRadius: 32,
                padding: isMobile ? '32px' : '48px',
                position: 'relative',
                transition: 'transform 0.3s ease',
                ...(plan.popular && {
                  border: `2px solid ${COLORS.accent}`,
                  backgroundColor: 'rgba(0, 217, 255, 0.03)'
                })
              }}
            >
              {plan.tag && (
                <div style={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: COLORS.accent,
                  color: '#000',
                  padding: '6px 16px',
                  borderRadius: 999,
                  fontSize: '11px',
                  fontWeight: 900,
                  boxShadow: '0 8px 20px rgba(0, 217, 255, 0.3)'
                }}>
                  {plan.tag}
                </div>
              )}

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: 8, color: '#fff' }}>{plan.name}</h3>
                <p style={{ color: COLORS.textDim, fontSize: '0.9rem', lineHeight: 1.5 }}>{plan.description}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 40 }}>
                <span style={{ fontSize: '4rem', fontWeight: 950, color: '#fff', letterSpacing: '-0.04em' }}>${plan.price}</span>
                {plan.originalPrice && (
                  <span style={{ fontSize: '1.5rem', textDecoration: 'line-through', color: COLORS.textDim }}>${plan.originalPrice}</span>
                )}
                <span style={{ color: COLORS.textDim, fontSize: '0.9rem', fontWeight: 600 }}>
                  / {plan.id === 'bundle' ? '4 Lessons' : 'Session'}
                </span>
              </div>

              <div style={{ display: 'grid', gap: 20, marginBottom: 48 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(0, 217, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Check size={14} color={COLORS.accent} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button style={{
                width: '100%',
                padding: '20px',
                borderRadius: 16,
                border: 'none',
                background: plan.popular ? COLORS.accent : '#fff',
                color: '#000',
                fontSize: '1rem',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: plan.popular ? '0 10px 30px rgba(0, 217, 255, 0.2)' : '0 10px 30px rgba(255, 255, 255, 0.1)'
              }}>
                SECURE ACCESS
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum Preview (Forward-Looking Feature) */}
      <section style={{ maxWidth: 900, margin: '0 auto 100px', padding: '0 20px' }}>
        <button
          onClick={() => setShowCurriculum(!showCurriculum)}
          style={{
            width: '100%',
            ...glassEffect,
            padding: '24px',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ padding: 10, background: 'rgba(99, 102, 241, 0.1)', borderRadius: 12 }}>
              <Trophy size={24} color={COLORS.indigo} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ margin: 0, fontWeight: 800, color: '#fff' }}>EXPLORE THE SYLLABUS</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: COLORS.textDim }}>See exactly what you'll master at the {activeTier} level</p>
            </div>
          </div>
          {showCurriculum ? <ChevronUp color={COLORS.textDim} /> : <ChevronDown color={COLORS.textDim} />}
        </button>

        {showCurriculum && (
          <div style={{
            ...glassEffect,
            background: 'transparent',
            borderTop: 'none',
            borderRadius: '0 0 24px 24px',
            padding: '32px',
            display: 'grid',
            gap: 32
          }}>
            {curriculum.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 24, flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: COLORS.accent, textTransform: 'uppercase', minWidth: 80 }}>{item.module}</div>
                <div>
                  <h5 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{item.title}</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {item.topics.map((t, i) => (
                      <span key={i} style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 999 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust & Reliability (Industry Standard) */}
      <section style={{
        borderTop: `1px solid ${COLORS.border}`,
        padding: '60px 20px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.01)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 40,
          maxWidth: 1000,
          margin: '0 auto'
        }}>
          {[
            { icon: <ShieldCheck size={32} color={COLORS.emerald} />, title: "Satisfaction Guarantee", desc: "Performance-focused methodology ensures measurable growth." },
            { icon: <Clock size={32} color={COLORS.indigo} />, title: "Flexible Scheduling", desc: "Coordinate sessions across all global timezones with ease." },
            { icon: <CreditCard size={32} color={COLORS.accent} />, title: "Secure Checkout", desc: "Industry-leading encryption and instant booking confirmation." }
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16, display: 'inline-block' }}>{item.icon}</div>
              <h4 style={{ margin: '0 0 8px', color: '#fff', fontWeight: 800 }}>{item.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: COLORS.textDim, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Minimalistic Footer */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', color: COLORS.textDim, fontSize: '0.75rem' }}>
        <p>© 2026 TRADEHAX DIGITAL. ALL RIGHTS RESERVED.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ cursor: 'pointer' }}>Terms of Mastery</span>
          <span style={{ cursor: 'pointer' }}>Contact Elite Support</span>
        </div>
      </footer>
    </div>
  );
}
