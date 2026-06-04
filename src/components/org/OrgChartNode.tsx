import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { OrgRelation } from '../../lib/orgTreeLayout';
import { initials } from '../../lib/orgTreeLayout';

export type OrgChartNodeData = {
  label: string;
  email: string;
  designation: string;
  department: string;
  isSelf: boolean;
  relation: OrgRelation;
};

const avatarRing: Record<OrgRelation, string> = {
  leader: 'border-outline-variant',
  self: 'border-primary',
  report: 'border-outline-variant',
};

const footerBar: Record<OrgRelation, string> = {
  leader: 'bg-surface-container-high text-on-surface-variant',
  self: 'bg-primary text-on-primary',
  report: 'bg-surface-container-high text-on-surface-variant',
};

export default function OrgChartNode({ data, selected }: NodeProps) {
  const d = data as OrgChartNodeData;
  const role = d.designation || d.department || '—';

  return (
    <div
      className={`org-chart-node flex flex-col items-center w-[128px] select-none ${
        selected ? 'opacity-100' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!top-0 !left-1/2 !-translate-x-1/2 !w-0 !h-0 !min-w-0 !min-h-0 !border-0 !bg-transparent !opacity-0"
      />

      <div
        className={`relative z-10 w-14 h-14 rounded-full border-[3px] bg-surface-container flex items-center justify-center text-sm font-bold text-primary shadow-sm ${avatarRing[d.relation]} ${
          d.isSelf ? 'ring-2 ring-primary/25' : ''
        }`}
      >
        {initials(d.label)}
      </div>

      <div
        className={`relative -mt-5 w-full rounded-md border border-outline-variant/30 bg-[var(--ezo-surface-bright)] overflow-hidden shadow-sm ${
          selected ? 'ring-2 ring-primary/50' : ''
        }`}
      >
        <div className="pt-7 pb-0 px-2 text-center min-h-[2.25rem] flex items-center justify-center">
          <p className="font-semibold text-xs text-[var(--ezo-fg)] leading-tight line-clamp-2">
            {d.label}
          </p>
        </div>
        <div
          className={`px-2 py-1.5 text-center text-[10px] font-medium truncate ${footerBar[d.relation]}`}
        >
          {role}
          {d.isSelf && ' · you'}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bottom-0 !left-1/2 !-translate-x-1/2 !w-0 !h-0 !min-w-0 !min-h-0 !border-0 !bg-transparent !opacity-0"
      />
    </div>
  );
}
