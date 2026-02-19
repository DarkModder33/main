"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type UploadRecord = {
  id: string;
  filename: string;
  core: string;
  sizeKb: number;
  uploadedAt: string;
};

const coreOptions = [
  { id: "nes", label: "NES" },
  { id: "snes", label: "SNES" },
  { id: "genesis", label: "Genesis" },
  { id: "gba", label: "GBA" },
  { id: "psx", label: "PSX" },
];

export function GamesHubClient() {
  const [filename, setFilename] = useState("");
  const [core, setCore] = useState("snes");
  const [sizeKb, setSizeKb] = useState(4096);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [uploads, setUploads] = useState<UploadRecord[]>([]);

  async function refreshUploads() {
    try {
      const response = await fetch("/api/game/rom/upload", { cache: "no-store" });
      const payload = await response.json();
      if (response.ok && payload.ok) {
        setUploads(payload.uploads ?? []);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    refreshUploads();
  }, []);

  async function queueUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/game/rom/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          filename,
          core,
          sizeKb,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setMessage(payload.error ?? "Failed to queue ROM metadata.");
        return;
      }
      setMessage(`Queued ${payload.record.filename} for ${payload.record.core.toUpperCase()} core.`);
      setFilename("");
      await refreshUploads();
    } catch (error) {
      setMessage("Failed to queue upload request.");
      console.error(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2 theme-panel p-6 sm:p-8">
        <span className="theme-kicker mb-3">Decentralized Arcade</span>
        <h2 className="theme-title text-3xl mb-4">Games Hub</h2>
        <p className="text-[#a8bfd1] mb-6">
          Access Hax Runner, prepare ROM metadata queues, and track future LibRetro-powered launches.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="theme-grid-card">
            <h3 className="text-xl font-bold text-white">Hax Runner</h3>
            <p className="text-[#afc4d4]">
              Live browser game with leaderboard tracking and reward architecture.
            </p>
            <Link href="/game" className="theme-cta theme-cta--loud mt-2 self-start">
              Open Hax Runner
            </Link>
          </article>
          <article className="theme-grid-card">
            <h3 className="text-xl font-bold text-white">LibRetro Core Queue</h3>
            <p className="text-[#afc4d4]">
              Queue ROM metadata for approved cores while upload processing is staged for production.
            </p>
            <span className="theme-cta theme-cta--secondary mt-2 self-start">Beta Intake Active</span>
          </article>
        </div>
      </section>

      <section className="theme-panel p-6">
        <h3 className="theme-title text-xl mb-4">ROM Metadata Queue</h3>
        <form className="space-y-3" onSubmit={queueUpload}>
          <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Filename
            <input
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              placeholder="example.rom"
            />
          </label>
          <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Core
            <select
              value={core}
              onChange={(event) => setCore(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              {coreOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Size (KB)
            <input
              type="number"
              min={1}
              max={250000}
              value={sizeKb}
              onChange={(event) => setSizeKb(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <button type="submit" disabled={busy} className="theme-cta theme-cta--loud w-full">
            {busy ? "Queueing..." : "Queue ROM Metadata"}
          </button>
        </form>
        {message ? (
          <p className="mt-3 rounded-xl border border-cyan-400/35 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
            {message}
          </p>
        ) : null}

        <div className="mt-4">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be] mb-2">
            Latest Queue
          </p>
          <div className="space-y-2 max-h-52 overflow-auto pr-1">
            {uploads.length === 0 ? (
              <p className="text-xs text-[#9fb3c3]">No queued uploads yet.</p>
            ) : (
              uploads.map((upload) => (
                <div key={upload.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs">
                  <p className="text-white">{upload.filename}</p>
                  <p className="text-[#96aec0]">
                    {upload.core.toUpperCase()} • {upload.sizeKb} KB
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
