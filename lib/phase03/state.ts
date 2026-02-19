export type DaoProposal = {
  id: string;
  title: string;
  summary: string;
  status: "active" | "closed";
  createdAt: string;
  votesFor: number;
  votesAgainst: number;
};

type ProposalStore = {
  proposals: DaoProposal[];
  votesByUser: Map<string, Set<string>>;
};

function getDaoStore(): ProposalStore {
  const globalRef = globalThis as typeof globalThis & {
    __TRADEHAX_DAO_STORE__?: ProposalStore;
  };

  if (!globalRef.__TRADEHAX_DAO_STORE__) {
    globalRef.__TRADEHAX_DAO_STORE__ = {
      proposals: [
        {
          id: "dao_proposal_001",
          title: "Allocate 8% of Treasury to Signal Infrastructure",
          summary:
            "Fund predictive signal compute and reliability monitoring for high-volatility sessions.",
          status: "active",
          createdAt: new Date().toISOString(),
          votesFor: 12,
          votesAgainst: 2,
        },
        {
          id: "dao_proposal_002",
          title: "Launch Hax Runner Tournament Reward Multiplier",
          summary:
            "Increase weekend reward multiplier for ranked community tournaments.",
          status: "active",
          createdAt: new Date().toISOString(),
          votesFor: 9,
          votesAgainst: 4,
        },
      ],
      votesByUser: new Map(),
    };
  }
  return globalRef.__TRADEHAX_DAO_STORE__;
}

export function getDaoProposals() {
  return getDaoStore().proposals;
}

export function submitDaoVote(
  userId: string,
  proposalId: string,
  choice: "for" | "against",
) {
  const store = getDaoStore();
  const proposal = store.proposals.find((item) => item.id === proposalId);
  if (!proposal || proposal.status !== "active") {
    return { ok: false, error: "Proposal not found or not active." as const };
  }

  const normalizedUserId = userId.trim().toLowerCase().slice(0, 64);
  const existingVotes = store.votesByUser.get(normalizedUserId) ?? new Set<string>();
  if (existingVotes.has(proposalId)) {
    return { ok: false, error: "Vote already recorded for this proposal." as const };
  }

  existingVotes.add(proposalId);
  store.votesByUser.set(normalizedUserId, existingVotes);

  if (choice === "for") {
    proposal.votesFor += 1;
  } else {
    proposal.votesAgainst += 1;
  }

  return { ok: true, proposal };
}

export function getPhase03Status() {
  return {
    bloombergApi: {
      enabled: Boolean(process.env.BLOOMBERG_API_KEY || process.env.BPIPE_TOKEN),
      mode: process.env.BLOOMBERG_API_KEY || process.env.BPIPE_TOKEN ? "live" : "simulated",
      detail:
        "Institutional feed adapter staged. Add BLOOMBERG_API_KEY or BPIPE_TOKEN for live mode.",
    },
    predictiveSignals: {
      enabled: true,
      mode: "beta",
      detail: "Predictive signals endpoint active with confidence-scored scenarios.",
    },
    stakingPoolV2: {
      enabled: true,
      mode: "beta",
      detail: "Pool V2 telemetry live. Dynamic reward routing staged for production keys.",
    },
    daoGovernance: {
      enabled: true,
      mode: "beta",
      detail: "Proposal + vote endpoints active for community utility decisions.",
    },
    generatedAt: new Date().toISOString(),
  };
}
