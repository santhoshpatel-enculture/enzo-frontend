import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Node } from '@xyflow/react';
import { AlertTriangle, Network } from 'lucide-react';
import { getOrgTree } from '../services/api';
import type { OrgTreeResponse } from '../services/api';
import OrgChartCanvas from '../components/org/OrgChartCanvas';
import OrgChartMobile from '../components/org/OrgChartMobile';
import { enrichFlatNodes, flattenTree, getOrgChartStats } from '../lib/orgTreeLayout';

export default function OrgChart() {
  const [data, setData] = useState<OrgTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrgTree()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const flat = useMemo(() => {
    if (!data) return [];
    return enrichFlatNodes(flattenTree(data.roots, data.focalUserId ?? undefined));
  }, [data]);

  const stats = useMemo(
    () => (data ? getOrgChartStats(flat, data.nodeCount) : null),
    [data, flat],
  );

  const selfNode = useMemo(() => flat.find((n) => n.isSelf), [flat]);
  const [selectedLine, setSelectedLine] = useState('');

  useEffect(() => {
    if (selfNode) {
      setSelectedLine(
        `${selfNode.label} (you) · ${selfNode.designation || '—'}`,
      );
    }
  }, [selfNode]);

  const handleNodeClick = (_: MouseEvent, node: Node) => {
    const match = flat.find((f) => f.id === node.id);
    if (match) {
      setSelectedLine(
        `${match.label}${match.isSelf ? ' (you)' : ''} · ${match.designation || '—'}`,
      );
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-1">
        <div className="h-8 w-40 skeleton mb-4" />
        <div className="h-[min(60vh,480px)] skeleton rounded-ezo-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card p-6 text-center max-w-md mx-auto">
        <AlertTriangle className="w-8 h-8 text-error mx-auto mb-2" />
        <p className="text-sm text-on-surface-variant">{error || 'Failed to load'}</p>
        <Link to="/team" className="text-sm text-primary mt-3 inline-block">
          Team
        </Link>
      </div>
    );
  }

  const solo = data.nodeCount <= 1;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-6 px-0 sm:px-1">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-headline-md sm:text-headline-lg text-[var(--ezo-fg)] flex items-center gap-2">
          <Network className="w-5 h-5 text-primary shrink-0" />
          Org chart
        </h1>
        {stats && (
          <p className="text-xs text-on-surface-variant">
            {stats.leadersAbove} above · {stats.directAndIndirectBelow} below
          </p>
        )}
      </div>

      {solo && (
        <p className="text-xs text-on-surface-variant">
          No manager links yet. Contact admin to connect your reporting line.
        </p>
      )}

      <div className="md:hidden overflow-y-auto">
        <OrgChartMobile nodes={flat} />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden md:block glass-card border border-outline-variant/20 overflow-hidden rounded-ezo-lg h-[min(58vh,560px)] sm:h-[min(65vh,640px)]"
      >
        <OrgChartCanvas data={data} onNodeSelect={handleNodeClick} />
      </motion.div>

      {selectedLine && (
        <p className="hidden md:block text-xs text-on-surface-variant truncate">
          {selectedLine}
        </p>
      )}
    </div>
  );
}
