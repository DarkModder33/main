'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useEffect, useMemo, useRef, useState } from 'react';

type SpadesTournamentResponse = {
  ok: boolean;
  roomId?: string;
  players?: Array<{ did: string; alias: string }>;
  error?: string;
};

const suits = ['♠', '♥', '♦', '♣'] as const;
const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

function buildDeck() {
  return suits.flatMap((suit) => ranks.map((rank) => `${rank}${suit}`));
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeDid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `did:dht:tradehax:${crypto.randomUUID()}`;
  }
  return `did:dht:tradehax:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SpadesGame() {
  const gameHostRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<{ disconnect: () => void; emit: (event: string, data: unknown) => void } | null>(null);
  const phaserRef = useRef<{ destroy: (removeCanvas?: boolean) => void } | null>(null);

  const { publicKey, connected, signTransaction } = useWallet();

  const [did, setDid] = useState<string>('');
  const [alias, setAlias] = useState('NeuralSpadesPlayer');
  const [roomId, setRoomId] = useState('tradehax-spades-alpha');
  const [status, setStatus] = useState('Initializing Spades arena...');
  const [tournamentStatus, setTournamentStatus] = useState('Tournament idle');
  const [wagerStatus, setWagerStatus] = useState('No wager simulation yet');

  const tournamentVault = useMemo(
    () => process.env.NEXT_PUBLIC_SPADES_TOURNAMENT_VAULT?.trim() || publicKey?.toBase58() || '',
    [publicKey],
  );

  useEffect(() => {
    let isMounted = true;

    const boot = async () => {
      if (!gameHostRef.current) {
        return;
      }

      const [{ default: Phaser }, { io }] = await Promise.all([
        import('phaser'),
        import('socket.io-client'),
      ]);

      const socketUrl = process.env.NEXT_PUBLIC_SPADES_SOCKET_URL?.trim();
      if (socketUrl) {
        const socket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
        });
        socketRef.current = socket;
        socket.on('connect', () => {
          if (isMounted) {
            setStatus('Multiplayer relay connected.');
          }
        });
      }

      const deck = shuffle(buildDeck());
      let hand = deck.slice(0, 13);
      const tableCards: string[] = [];

      const config = {
        type: Phaser.AUTO,
        width: 980,
        height: 620,
        backgroundColor: '#030712',
        parent: gameHostRef.current,
        scene: {
          create(this: Phaser.Scene) {
            const g = this.add.graphics();
            g.fillGradientStyle(0x020617, 0x020617, 0x111827, 0x020617, 1);
            g.fillRect(0, 0, 980, 620);

            this.add.text(28, 18, 'TRADEHAX SPADES // CYBER TABLE', {
              fontFamily: 'monospace',
              fontSize: '18px',
              color: '#67e8f9',
            });

            const particle = this.add.particles(0, 0, '__WHITE', {
              x: { min: 0, max: 980 },
              y: 0,
              lifespan: 4500,
              speedY: { min: 30, max: 80 },
              speedX: { min: -20, max: 20 },
              quantity: 1,
              scale: { start: 0.04, end: 0 },
              tint: 0x22d3ee,
              blendMode: 'ADD',
            });
            particle.setDepth(0);

            const center = this.add.rectangle(490, 285, 290, 185, 0x0f172a, 0.8).setStrokeStyle(2, 0x06b6d4, 0.7);
            center.setDepth(1);
            this.add.text(430, 270, 'TRICK PILE', {
              fontFamily: 'monospace',
              fontSize: '15px',
              color: '#93c5fd',
            });

            const handLayer = this.add.container(0, 0);
            const pileLayer = this.add.container(0, 0);

            const renderPile = () => {
              pileLayer.removeAll(true);
              const visible = tableCards.slice(-4);
              visible.forEach((card, index) => {
                const cardRect = this.add.rectangle(455 + index * 22, 312 - index * 5, 82, 118, 0xffffff, 0.95)
                  .setStrokeStyle(2, 0x0f172a, 0.8);
                const label = this.add.text(cardRect.x - 24, cardRect.y - 8, card, {
                  fontFamily: 'Arial Black',
                  fontSize: '22px',
                  color: card.includes('♥') || card.includes('♦') ? '#dc2626' : '#111827',
                });
                pileLayer.add([cardRect, label]);
              });
            };

            const renderHand = () => {
              handLayer.removeAll(true);
              hand.forEach((card, index) => {
                const x = 70 + index * 68;
                const y = 520;
                const cardBox = this.add.rectangle(x, y, 82, 118, 0xffffff, 0.98)
                  .setStrokeStyle(2, 0x334155, 0.9)
                  .setInteractive({ useHandCursor: true });
                const text = this.add.text(x - 24, y - 8, card, {
                  fontFamily: 'Arial Black',
                  fontSize: '22px',
                  color: card.includes('♥') || card.includes('♦') ? '#dc2626' : '#111827',
                });

                cardBox.on('pointerover', () => {
                  this.tweens.add({ targets: [cardBox, text], y: y - 10, duration: 120 });
                });

                cardBox.on('pointerout', () => {
                  this.tweens.add({ targets: [cardBox, text], y, duration: 120 });
                });

                cardBox.on('pointerdown', () => {
                  const played = hand.splice(index, 1)[0];
                  tableCards.push(played);
                  socketRef.current?.emit('play-card', { roomId, card: played });
                  renderHand();
                  renderPile();

                  if (isMounted) {
                    setStatus(`Played ${played}. ${hand.length} cards left in hand.`);
                  }
                });

                handLayer.add([cardBox, text]);
              });
            };

            renderHand();
            renderPile();
          },
        },
      };

      phaserRef.current = new Phaser.Game(config);

      if (isMounted) {
        setStatus((prev) =>
          prev.includes('connected') ? prev : 'Spades arena loaded. Click cards to play tricks.',
        );
      }
    };

    boot().catch((error) => {
      console.error('Spades Phaser boot failed:', error);
      if (isMounted) {
        setStatus('Failed to initialize Spades renderer.');
      }
    });

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
      phaserRef.current?.destroy(true);
      phaserRef.current = null;
    };
  }, [roomId]);

  async function handleCreateDid() {
    const nextDid = makeDid();
    setDid(nextDid);
    setTournamentStatus(`Identity created: ${nextDid}`);
  }

  async function handleJoinTournament() {
    const identity = did || makeDid();
    if (!did) {
      setDid(identity);
    }

    try {
      const response = await fetch('/api/spades/tournament', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          did: identity,
          alias: alias.trim() || 'NeuralSpadesPlayer',
          roomId,
          wagerLamports: 10_000_000,
          mode: 'simulation',
        }),
      });

      const payload = (await response.json()) as SpadesTournamentResponse;
      if (!response.ok || !payload.ok) {
        setTournamentStatus(payload.error || 'Failed to join tournament.');
        return;
      }

      setTournamentStatus(
        `Joined room ${payload.roomId}. Registered players: ${payload.players?.length ?? 1}`,
      );
    } catch (error) {
      console.error(error);
      setTournamentStatus('Unable to reach tournament API.');
    }
  }

  async function handleSimulateWager() {
    if (!connected || !publicKey) {
      setWagerStatus('Connect your wallet first to simulate a signed wager transaction.');
      return;
    }

    if (!tournamentVault) {
      setWagerStatus('Set NEXT_PUBLIC_SPADES_TOURNAMENT_VAULT to simulate escrow destination.');
      return;
    }

    const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC?.trim() || 'https://api.mainnet-beta.solana.com';

    try {
      const connection = new Connection(rpcEndpoint, 'confirmed');
      const latest = await connection.getLatestBlockhash();

      const tx = new Transaction({
        feePayer: publicKey,
        recentBlockhash: latest.blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(tournamentVault),
          lamports: 10_000_000,
        }),
      );

      if (signTransaction) {
        await signTransaction(tx);
        setWagerStatus('Wager simulation transaction signed successfully (not submitted).');
      } else {
        setWagerStatus('Wallet connected, but signTransaction is not available. Simulation built only.');
      }
    } catch (error) {
      console.error(error);
      setWagerStatus('Wager simulation failed. Check wallet, vault address, and RPC endpoint.');
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="theme-panel overflow-hidden p-2 sm:p-3">
        <div
          ref={gameHostRef}
          className="mx-auto min-h-[620px] w-full max-w-[980px] overflow-hidden rounded-2xl border border-cyan-500/25 bg-slate-950"
        />
      </div>

      <aside className="theme-panel p-5 space-y-4">
        <h2 className="theme-title text-2xl">Spades Control Node</h2>

        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
          Alias
          <input
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            placeholder="NeuralSpadesPlayer"
          />
        </label>

        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
          Tournament Room
          <input
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            placeholder="tradehax-spades-alpha"
          />
        </label>

        <div className="grid gap-2">
          <button onClick={handleCreateDid} className="theme-cta theme-cta--secondary w-full">
            Create DID Profile
          </button>
          <button onClick={handleJoinTournament} className="theme-cta theme-cta--loud w-full">
            Join Tournament (Sim)
          </button>
          <button onClick={handleSimulateWager} className="theme-cta w-full">
            Simulate 0.01 SOL Wager
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <p className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3 py-2 text-cyan-100">
            {status}
          </p>
          <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-emerald-100">
            {tournamentStatus}
          </p>
          <p className="rounded-xl border border-violet-500/25 bg-violet-500/10 px-3 py-2 text-violet-100">
            {wagerStatus}
          </p>
        </div>

        <div className="text-[11px] text-[#94adc0] leading-relaxed">
          <p>
            Multiplayer is <strong>socket-ready</strong> when <code>NEXT_PUBLIC_SPADES_SOCKET_URL</code> is set.
          </p>
          <p className="mt-1">
            Wager flow is simulation-only by default (no automatic transfer submission).
          </p>
          {did ? <p className="mt-2 break-all">DID: {did}</p> : null}
        </div>
      </aside>
    </section>
  );
}
