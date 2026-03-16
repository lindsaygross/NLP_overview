import { useState, useCallback, useMemo } from 'react';
import { nodes, edges, groupColors } from '../data/connections.js';

const groupLabels = {
  traditional: 'Traditional NLP',
  embeddings: 'Embeddings',
  sequence: 'Sequence Models',
  attention: 'Attention & Transformers',
  applications: 'Applications',
};

// Manual node positions for a left-to-right flow in an 800x500 viewBox
const nodePositions = {
  // Traditional — left column (~80-160)
  preprocessing: { x: 80, y: 80 },
  bow:           { x: 80, y: 180 },
  tfidf:         { x: 80, y: 280 },
  ngrams:        { x: 160, y: 230 },
  hmm:           { x: 80, y: 400 },

  // Embeddings — center-left (~270)
  word2vec:      { x: 270, y: 230 },

  // Sequence models — center (~270-340, lower area)
  rnn:           { x: 270, y: 400 },
  lstm:          { x: 370, y: 400 },
  gru:           { x: 470, y: 420 },

  // Attention & Transformers — right (~430-600)
  'self-attention':  { x: 430, y: 140 },
  'scaled-attention':{ x: 430, y: 230 },
  'multi-head':      { x: 530, y: 190 },
  'cross-attention': { x: 530, y: 300 },
  transformer:       { x: 620, y: 240 },
  bert:              { x: 620, y: 140 },
  gpt:               { x: 620, y: 340 },

  // Applications — far right (~740)
  rag:  { x: 740, y: 160 },
  clip: { x: 740, y: 270 },
  moe:  { x: 740, y: 370 },
};

const NODE_RADIUS = 22;

function getEdgeLabelPos(x1, y1, x2, y2) {
  return {
    x: (x1 + x2) / 2,
    y: (x1 + x2) / 2 === x1 ? (y1 + y2) / 2 - 8 : (y1 + y2) / 2 - 6,
  };
}

function shortenLine(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { x1, y1, x2, y2 };
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: x1 + ux * r,
    y1: y1 + uy * r,
    x2: x2 - ux * r,
    y2: y2 - uy * r,
  };
}

export default function ConnectionsMap({ dark, onNavigate }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Build adjacency set for hover highlighting
  const connectedEdges = useMemo(() => {
    const map = {};
    nodes.forEach((n) => { map[n.id] = new Set(); });
    edges.forEach((e, i) => {
      if (map[e.from]) map[e.from].add(i);
      if (map[e.to]) map[e.to].add(i);
    });
    return map;
  }, []);

  const connectedNodes = useMemo(() => {
    const map = {};
    nodes.forEach((n) => { map[n.id] = new Set([n.id]); });
    edges.forEach((e) => {
      if (map[e.from]) map[e.from].add(e.to);
      if (map[e.to]) map[e.to].add(e.from);
    });
    return map;
  }, []);

  const isNodeHighlighted = useCallback(
    (id) => !hoveredNode || connectedNodes[hoveredNode]?.has(id),
    [hoveredNode, connectedNodes],
  );

  const isEdgeHighlighted = useCallback(
    (idx) => !hoveredNode || connectedEdges[hoveredNode]?.has(idx),
    [hoveredNode, connectedEdges],
  );

  const bgColor = dark ? '#1e293b' : '#ffffff';
  const textColor = dark ? '#e2e8f0' : '#1e293b';
  const edgeColor = dark ? '#475569' : '#cbd5e1';
  const edgeHighlightColor = dark ? '#94a3b8' : '#64748b';
  const labelBg = dark ? '#1e293b' : '#ffffff';

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 justify-center">
        {Object.entries(groupLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: groupColors[key] }}
            />
            <span
              className={`text-xs font-medium ${
                dark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* SVG Graph */}
      <div
        className={`w-full rounded-xl border overflow-hidden ${
          dark ? 'border-slate-700' : 'border-slate-200'
        }`}
      >
        <svg
          viewBox="0 0 820 470"
          className="w-full h-auto"
          style={{ backgroundColor: bgColor }}
        >
          <defs>
            <marker
              id={`arrowhead-${dark ? 'dark' : 'light'}`}
              markerWidth="7"
              markerHeight="5"
              refX="6"
              refY="2.5"
              orient="auto"
            >
              <polygon
                points="0 0, 7 2.5, 0 5"
                fill={edgeHighlightColor}
              />
            </marker>
            <marker
              id={`arrowhead-dim-${dark ? 'dark' : 'light'}`}
              markerWidth="7"
              markerHeight="5"
              refX="6"
              refY="2.5"
              orient="auto"
            >
              <polygon
                points="0 0, 7 2.5, 0 5"
                fill={edgeColor}
                opacity="0.3"
              />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, idx) => {
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            if (!fromPos || !toPos) return null;

            const highlighted = isEdgeHighlighted(idx);
            const line = shortenLine(
              fromPos.x, fromPos.y,
              toPos.x, toPos.y,
              NODE_RADIUS + 4,
            );
            const labelPos = getEdgeLabelPos(
              fromPos.x, fromPos.y,
              toPos.x, toPos.y,
            );

            return (
              <g key={`edge-${idx}`} style={{ transition: 'opacity 0.2s' }}>
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={highlighted ? edgeHighlightColor : edgeColor}
                  strokeWidth={highlighted && hoveredNode ? 1.8 : 1}
                  opacity={highlighted ? 1 : 0.2}
                  markerEnd={`url(#arrowhead-${
                    highlighted ? '' : 'dim-'
                  }${dark ? 'dark' : 'light'})`}
                />
                {highlighted && (
                  <g>
                    <rect
                      x={labelPos.x - edge.label.length * 2.8}
                      y={labelPos.y - 7}
                      width={edge.label.length * 5.6}
                      height={13}
                      rx="3"
                      fill={labelBg}
                      opacity="0.85"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 3}
                      textAnchor="middle"
                      fontSize="7"
                      fill={dark ? '#94a3b8' : '#64748b'}
                      fontFamily="system-ui, sans-serif"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const color = groupColors[node.group];
            const highlighted = isNodeHighlighted(node.id);
            const isHovered = hoveredNode === node.id;

            return (
              <g
                key={node.id}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                opacity={highlighted ? 1 : 0.25}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onNavigate?.(node.id)}
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_RADIUS + 4}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity="0.4"
                  />
                )}
                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS}
                  fill={dark ? `${color}33` : `${color}22`}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />
                {/* Node label */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="7.5"
                  fontWeight="600"
                  fill={textColor}
                  fontFamily="system-ui, sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.label.length > 14
                    ? node.label.split(/[\s-]/).reduce(
                        (lines, word) => {
                          const last = lines[lines.length - 1];
                          if (last.length + word.length + 1 <= 14) {
                            lines[lines.length - 1] =
                              last + (last ? ' ' : '') + word;
                          } else {
                            lines.push(word);
                          }
                          return lines;
                        },
                        [''],
                      ).map((line, i, arr) => (
                        <tspan
                          key={i}
                          x={pos.x}
                          dy={i === 0 ? `${-(arr.length - 1) * 0.45}em` : '0.95em'}
                        >
                          {line}
                        </tspan>
                      ))
                    : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p
        className={`text-xs text-center mt-2 ${
          dark ? 'text-slate-500' : 'text-slate-400'
        }`}
      >
        Click a concept to explore it. Hover to see connections.
      </p>
    </div>
  );
}
