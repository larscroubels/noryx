/**
 * Assigns side-by-side lanes to overlapping events in a calendar column.
 * Events that overlap (directly or through a chain) form a cluster; every event
 * in a cluster gets the same lane count so their widths line up.
 */
export type LaneInput = { id: string; start: number; end: number };
export type LanePosition = { lane: number; lanes: number };

export function assignLanes(events: LaneInput[]): Map<string, LanePosition> {
  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end);
  const result = new Map<string, LanePosition>();
  let cluster: { id: string; lane: number }[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    for (const item of cluster) result.set(item.id, { lane: item.lane, lanes: laneEnds.length });
    cluster = [];
    laneEnds = [];
  };

  for (const event of sorted) {
    if (event.start >= clusterEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= event.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(event.end);
    } else {
      laneEnds[lane] = event.end;
    }
    cluster.push({ id: event.id, lane });
    clusterEnd = Math.max(clusterEnd, event.end);
  }
  flush();
  return result;
}
