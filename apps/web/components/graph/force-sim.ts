export type SimNode = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  weight: number;
};

export type SimEdge = {
  source: string;
  target: string;
};

export function seedNodes(
  ids: { id: string; weight?: number }[],
  width: number,
  height: number,
): SimNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.32;
  return ids.map((item, i) => {
    const angle = (i / Math.max(ids.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const jitter = ((i * 17) % 9) / 9 - 0.5;
    return {
      id: item.id,
      x: cx + Math.cos(angle) * radius * (1 + jitter * 0.15),
      y: cy + Math.sin(angle) * radius * 0.88 * (1 + jitter * 0.12),
      vx: 0,
      vy: 0,
      weight: item.weight ?? 1,
    };
  });
}

export function stepSim(
  nodes: SimNode[],
  edges: SimEdge[],
  width: number,
  height: number,
  dt: number,
  opts: { charge?: number; spring?: number; rest?: number; gravity?: number; creature?: number },
): void {
  const charge = opts.charge ?? 2200;
  const spring = opts.spring ?? 0.022;
  const rest = opts.rest ?? 96;
  const gravity = opts.gravity ?? 0.018;
  const creature = opts.creature ?? 0;
  const cx = width / 2;
  const cy = height / 2;
  const index = new Map(nodes.map((node) => [node.id, node]));

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      let dist = Math.hypot(dx, dy) || 0.01;
      const min = 28 + a.weight * 6 + b.weight * 6;
      if (dist < min) dist = min;
      const force = (charge * a.weight * b.weight) / (dist * dist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx * dt;
      a.vy += fy * dt;
      b.vx -= fx * dt;
      b.vy -= fy * dt;
    }
  }

  for (const edge of edges) {
    const a = index.get(edge.source);
    const b = index.get(edge.target);
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 0.01;
    const delta = dist - rest;
    const fx = (dx / dist) * delta * spring;
    const fy = (dy / dist) * delta * spring;
    a.vx += fx;
    a.vy += fy;
    b.vx -= fx;
    b.vy -= fy;
  }

  for (const node of nodes) {
    node.vx += (cx - node.x) * gravity;
    node.vy += (cy - node.y) * gravity;
    if (creature) {
      node.vx += Math.sin(node.y * 0.02 + creature) * 2.4 * dt;
      node.vy += Math.cos(node.x * 0.02 + creature * 0.8) * 2.4 * dt;
    }
    node.vx *= 0.86;
    node.vy *= 0.86;
    node.x += node.vx;
    node.y += node.vy;
    const pad = 28;
    node.x = Math.min(width - pad, Math.max(pad, node.x));
    node.y = Math.min(height - pad, Math.max(pad, node.y));
  }
}

export function settle(
  nodes: SimNode[],
  edges: SimEdge[],
  width: number,
  height: number,
  ticks = 80,
): void {
  for (let i = 0; i < ticks; i++) {
    stepSim(nodes, edges, width, height, 0.032, { creature: 0 });
  }
}
