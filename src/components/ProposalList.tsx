import React from 'react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const ProposalList: React.FC = () => {
  const { data, activeProposalIndex, setActiveProposalIndex } = useStore();

  if (!data) return null;

  return (
    <aside className="col-span-3 space-y-2">
      {data.proposals.map((p, i) => (
        <button
          key={p.proposal_id}
          onClick={() => setActiveProposalIndex(i)}
          className={twMerge(
            clsx(
              "w-full text-left p-4 rounded-xl transition",
              i === activeProposalIndex
                ? "bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm"
                : "hover:bg-slate-100 text-slate-600 border border-transparent"
            )
          )}
        >
          <span className="text-xs opacity-50 block mb-1">方案 0{p.proposal_id}</span>
          {p.direction_name}
        </button>
      ))}
    </aside>
  );
};
