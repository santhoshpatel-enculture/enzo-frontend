import { Position, type Edge, type Node } from '@xyflow/react';
import type { OrgTreeNode, OrgTreeResponse } from '../services/api';

export type OrgRelation = 'leader' | 'self' | 'report';

export interface FlatOrgNode {
  id: string;
  label: string;
  email: string;
  designation: string;
  department: string;
  depth: number;
  isSelf: boolean;
  relation: OrgRelation;
}

export interface OrgChartStats {
  total: number;
  leadersAbove: number;
  directAndIndirectBelow: number;
  selfDepth: number | null;
}

const H_SPACING = 168;
const V_SPACING = 132;
const NODE_WIDTH = 128;

export function initials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function subtreeWidth(node: OrgTreeNode): number {
  if (!node.children?.length) return 1;
  return node.children.reduce((sum, child) => sum + subtreeWidth(child), 0);
}

function relationAtDepth(depth: number, selfDepth: number | null, isSelf: boolean): OrgRelation {
  if (isSelf) return 'self';
  if (selfDepth === null) return 'report';
  if (depth < selfDepth) return 'leader';
  return 'report';
}

export function flattenTree(
  nodes: OrgTreeNode[],
  focalUserId: string | undefined,
  depth = 0,
  out: FlatOrgNode[] = [],
): FlatOrgNode[] {
  for (const n of nodes) {
    const isSelf = focalUserId === n.id;
    out.push({
      id: n.id,
      label: n.label,
      email: n.email ?? '',
      designation: n.designation,
      department: n.department,
      depth,
      isSelf,
      relation: 'report',
    });
    if (n.children?.length) {
      flattenTree(n.children, focalUserId, depth + 1, out);
    }
  }
  return out;
}

export function enrichFlatNodes(flat: FlatOrgNode[]): FlatOrgNode[] {
  const self = flat.find((n) => n.isSelf);
  const selfDepth = self?.depth ?? null;
  return flat.map((n) => ({
    ...n,
    relation: relationAtDepth(n.depth, selfDepth, n.isSelf),
  }));
}

export function getOrgChartStats(flat: FlatOrgNode[], nodeCount: number): OrgChartStats {
  const self = flat.find((n) => n.isSelf);
  const selfDepth = self?.depth ?? null;
  const leadersAbove =
    selfDepth === null ? 0 : flat.filter((n) => n.depth < selfDepth).length;
  const directAndIndirectBelow =
    selfDepth === null ? Math.max(0, nodeCount - 1) : flat.filter((n) => n.depth > selfDepth).length;

  return {
    total: nodeCount,
    leadersAbove,
    directAndIndirectBelow,
    selfDepth,
  };
}

function layoutTree(
  items: OrgTreeNode[],
  depth: number,
  xStart: number,
  focalUserId: string | undefined,
  selfDepth: number | null,
  nodes: Node[],
  edges: Edge[],
  parentId?: string,
): number {
  let cursor = xStart;

  for (const item of items) {
    const width = subtreeWidth(item);
    const x = cursor + ((width - 1) * H_SPACING) / 2;
    const y = depth * V_SPACING;
    const isSelf = focalUserId === item.id;
    const relation = relationAtDepth(depth, selfDepth, isSelf);

    nodes.push({
      id: item.id,
      type: 'orgChartNode',
      position: { x, y },
      data: {
        label: item.label,
        email: item.email ?? '',
        designation: item.designation,
        department: item.department,
        isSelf,
        relation,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      style: {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
        width: NODE_WIDTH,
      },
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${item.id}`,
        source: parentId,
        target: item.id,
        type: 'step',
        style: { stroke: 'var(--ezo-outline-variant)', strokeWidth: 1.5 },
      });
    }

    if (item.children?.length) {
      layoutTree(
        item.children,
        depth + 1,
        cursor,
        focalUserId,
        selfDepth,
        nodes,
        edges,
        item.id,
      );
    }

    cursor += width * H_SPACING;
  }

  return cursor;
}

export function treeToFlow(data: OrgTreeResponse): { nodes: Node[]; edges: Edge[] } {
  const focal = data.focalUserId ?? undefined;
  const flat = enrichFlatNodes(flattenTree(data.roots, focal));
  const selfDepth = flat.find((n) => n.isSelf)?.depth ?? null;

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  layoutTree(data.roots, 0, 0, focal, selfDepth, nodes, edges);
  return { nodes, edges };
}

export const ORG_SECTION_LABELS: Record<OrgRelation, string> = {
  leader: 'Leadership chain',
  self: 'You',
  report: 'Your team',
};
