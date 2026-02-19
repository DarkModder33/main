'use client';

import { ExternalLink, MonitorSmartphone, Users, Video } from 'lucide-react';
import { useMemo, useState } from 'react';

type StudioMode = 'teacher' | 'duet' | 'group-stage' | 'group-grid';

const MODE_LABELS: Record<StudioMode, { label: string; description: string }> = {
  teacher: {
    label: 'Teacher Window',
    description: 'Solo teaching stream or prep room. Great for office hours and walkthroughs.',
  },
  duet: {
    label: 'Teacher + Student',
    description: 'Focused one-on-one lesson mode with camera + audio enabled by default.',
  },
  'group-stage': {
    label: 'Group Stage',
    description: 'Teacher-led group room where spotlight and speaking flow stay organized.',
  },
  'group-grid': {
    label: 'Group Grid',
    description: 'Equal camera tiles for cohort classes, camps, and ensemble sessions.',
  },
};

function sanitizeRoomSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 42);
}

export function LessonStudioEmbed() {
  const [mode, setMode] = useState<StudioMode>('duet');
  const [roomInput, setRoomInput] = useState('tradehax-guitar-lessons');

  const roomSlug = useMemo(() => {
    const cleaned = sanitizeRoomSegment(roomInput) || 'tradehax-guitar-lessons';
    return `${cleaned}-${mode}`;
  }, [mode, roomInput]);

  const iframeSrc = useMemo(() => {
    const base = `https://meet.jit.si/${roomSlug}`;

    if (mode === 'teacher') {
      return `${base}#config.startAudioOnly=true&config.disableFilmstrip=true&config.prejoinPageEnabled=false`;
    }

    if (mode === 'group-grid') {
      return `${base}#config.prejoinPageEnabled=false&config.startWithVideoMuted=false&config.tileViewEnabled=true`;
    }

    if (mode === 'group-stage') {
      return `${base}#config.prejoinPageEnabled=false&config.followMe=true&config.tileViewEnabled=false`;
    }

    return `${base}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;
  }, [mode, roomSlug]);

  return (
    <section className="rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-emerald-950/40 via-black to-cyan-950/30 p-5 sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/70">Fortress Lesson Studio</p>
          <h3 className="mt-2 text-2xl font-black uppercase tracking-wide text-white">Zero-Cost Embedded Live Room</h3>
          <p className="mt-2 max-w-3xl text-sm text-cyan-100/80">
            Built on Jitsi Meet (free/open). No Zoom or Google Meet required for students who prefer in-platform sessions.
          </p>
        </div>
        <a
          href={iframeSrc.replace(/#.*/, '')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-100 hover:bg-cyan-500/30"
        >
          Open in New Tab
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        {(Object.keys(MODE_LABELS) as StudioMode[]).map((item) => {
          const active = item === mode;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                active
                  ? 'border-emerald-300/60 bg-emerald-500/20 text-emerald-100'
                  : 'border-cyan-400/20 bg-black/30 text-cyan-100/80 hover:border-cyan-300/40'
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                {item === 'teacher' ? (
                  <MonitorSmartphone className="h-3.5 w-3.5" />
                ) : item === 'duet' ? (
                  <Video className="h-3.5 w-3.5" />
                ) : (
                  <Users className="h-3.5 w-3.5" />
                )}
                {MODE_LABELS[item].label}
              </div>
              <p className="text-[11px] leading-relaxed opacity-85">{MODE_LABELS[item].description}</p>
            </button>
          );
        })}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <label className="text-xs text-cyan-100/80">
          <span className="mb-1 block uppercase tracking-[0.2em] text-cyan-200/70">Lesson Room Name</span>
          <input
            value={roomInput}
            onChange={(event) => setRoomInput(event.target.value)}
            className="w-full rounded-lg border border-cyan-400/30 bg-black/50 px-3 py-2 text-sm text-cyan-100 outline-none"
            placeholder="tradehax-guitar-lessons"
          />
        </label>
        <div className="rounded-lg border border-cyan-400/20 bg-black/40 px-3 py-2 text-xs text-cyan-100/75">
          Active Room: <span className="font-mono text-cyan-200">{roomSlug}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-cyan-400/25 bg-black/60">
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          className="h-[460px] w-full"
          allow="camera; microphone; fullscreen; display-capture"
          title="TradeHax Guitar Lesson Studio"
        />
      </div>

      <p className="mt-3 text-[11px] text-cyan-200/70">
        Pro tip: for private lessons, use a unique room name per student and rotate weekly (example: studentname-week04).
      </p>
    </section>
  );
}
