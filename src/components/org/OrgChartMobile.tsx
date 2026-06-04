import type { FlatOrgNode } from '../../lib/orgTreeLayout';
import { initials } from '../../lib/orgTreeLayout';

function PersonCard({ node, compact }: { node: FlatOrgNode; compact?: boolean }) {
  const isSelf = node.relation === 'self';
  const role = node.designation || node.department || '—';

  return (
    <div className={`flex flex-col items-center ${compact ? 'w-full' : 'w-full max-w-[130px]'}`}>
      <div
        className={`${compact ? 'w-10 h-10 text-[10px]' : 'w-12 h-12 text-xs'} rounded-full border-[3px] bg-surface-container flex items-center justify-center font-bold text-primary z-10 shrink-0 ${
          isSelf ? 'border-primary' : 'border-outline-variant'
        }`}
      >
        {initials(node.label)}
      </div>
      <div
        className={`relative ${compact ? '-mt-3' : '-mt-4'} w-full rounded-md border overflow-hidden bg-[var(--ezo-surface-bright)] ${
          isSelf ? 'border-primary/40' : 'border-outline-variant/30'
        }`}
      >
        <div className={`${compact ? 'pt-4 px-1.5' : 'pt-5 px-2'} pb-0 text-center`}>
          <p className={`font-semibold text-[var(--ezo-fg)] leading-tight truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {node.label}
          </p>
        </div>
        <div
          className={`px-1.5 py-1 text-center text-[9px] truncate mt-0.5 ${
            isSelf ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          {role}
          {isSelf && ' · you'}
        </div>
      </div>
    </div>
  );
}

function VerticalLine() {
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <div className="w-px h-5 bg-[var(--ezo-outline-variant)] opacity-50" />
    </div>
  );
}

function BranchLine({ count }: { count: number }) {
  if (count <= 1) return <VerticalLine />;
  return (
    <div className="flex flex-col items-center w-full" aria-hidden>
      <div className="w-px h-3 bg-[var(--ezo-outline-variant)] opacity-50" />
      <div className="h-px w-2/3 max-w-[240px] bg-[var(--ezo-outline-variant)] opacity-40" />
    </div>
  );
}

export default function OrgChartMobile({ nodes }: { nodes: FlatOrgNode[] }) {
  const selfNode = nodes.find((n) => n.isSelf);
  const selfDepth = selfNode?.depth ?? null;

  const managers = nodes
    .filter((n) => selfDepth !== null && n.depth < selfDepth)
    .sort((a, b) => a.depth - b.depth);

  const reports = nodes
    .filter((n) => selfDepth !== null && n.depth > selfDepth)
    .sort((a, b) => a.depth - b.depth || a.label.localeCompare(b.label));

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden py-3 space-y-0">
      {/* Managers above */}
      {managers.map((node) => (
        <div key={node.id} className="flex flex-col items-center">
          <PersonCard node={node} />
          <VerticalLine />
        </div>
      ))}

      {/* You */}
      {selfNode && (
        <div className="flex flex-col items-center">
          <PersonCard node={selfNode} />
          {reports.length > 0 && <BranchLine count={reports.length} />}
        </div>
      )}

      {/* Reports — horizontal grid */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 px-1">
          {reports.map((node) => (
            <PersonCard key={node.id} node={node} compact />
          ))}
        </div>
      )}

      {/* Fallback if no self found — just render all in order */}
      {!selfNode && nodes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-1">
          {nodes
            .sort((a, b) => a.depth - b.depth || a.label.localeCompare(b.label))
            .map((node) => (
              <PersonCard key={node.id} node={node} compact />
            ))}
        </div>
      )}
    </div>
  );
}
