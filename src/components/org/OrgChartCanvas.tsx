import { useEffect, useMemo, type MouseEvent } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useReactFlow,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import OrgChartNode from './OrgChartNode';
import type { OrgTreeResponse } from '../../services/api';
import { treeToFlow } from '../../lib/orgTreeLayout';

const nodeTypes = { orgChartNode: OrgChartNode } as const;

function FocusOnYou({ focalUserId, nodeCount }: { focalUserId?: string; nodeCount: number }) {
  const { fitView, setCenter, getNode } = useReactFlow();

  useEffect(() => {
    if (nodeCount === 0) return;

    const timer = window.setTimeout(() => {
      if (focalUserId) {
        const selfNode = getNode(focalUserId);
        if (selfNode) {
          const x = selfNode.position.x + 64;
          const y = selfNode.position.y + 52;
          setCenter(x, y, { zoom: 0.95, duration: 500 });
          return;
        }
      }
      fitView({ padding: 0.25, duration: 400, maxZoom: 1.1 });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [focalUserId, nodeCount, fitView, setCenter, getNode]);

  return null;
}

interface OrgChartCanvasProps {
  data: OrgTreeResponse;
  onNodeSelect: (event: MouseEvent, node: Node) => void;
}

function OrgChartCanvasInner({ data, onNodeSelect }: OrgChartCanvasProps) {
  const flow = useMemo(() => treeToFlow(data), [data]);
  const focal = data.focalUserId ?? undefined;

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'step' as const,
      style: { stroke: 'var(--ezo-outline-variant)', strokeWidth: 1.5 },
    }),
    [],
  );

  return (
    <div className="org-chart-flow h-full w-full min-h-[280px]">
      <ReactFlow
        nodes={flow.nodes}
        edges={flow.edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnScroll
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.15 }}
        onNodeClick={onNodeSelect}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} color="var(--ezo-outline-variant)" />
        <Controls showInteractive={false} className="org-chart-controls !scale-90 sm:!scale-100" />
        <FocusOnYou focalUserId={focal} nodeCount={data.nodeCount} />
      </ReactFlow>
    </div>
  );
}

export default function OrgChartCanvas(props: OrgChartCanvasProps) {
  return (
    <ReactFlowProvider>
      <OrgChartCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
