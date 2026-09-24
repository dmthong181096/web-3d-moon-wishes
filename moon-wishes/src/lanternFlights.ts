export type LanternFlight = { id: number; releasedAt: number | null; wish: string };

export function releaseLantern(lanterns: LanternFlight[], id: number, wish: string, now: number): LanternFlight[] {
  return lanterns.map(lantern => lantern.id === id && lantern.releasedAt === null
    ? { ...lantern, wish, releasedAt: now }
    : lantern);
}

// Absolute timestamps let every lantern keep flying through new wishes and camera resets.
export function flightPose(lantern: LanternFlight, now: number, reduced: boolean) {
  if (lantern.releasedAt === null) return { rise: 0, drift: 0, depth: 0, scale: 1, finished: false };
  const age = Math.max(0, now - lantern.releasedAt);
  const rise = reduced ? 22 : age * .72 + age * age * .025;
  return {
    rise,
    drift: reduced ? (lantern.id % 5 - 2) * .5 : Math.sin(age * .3 + lantern.id) * Math.min(age * .09, 1.3),
    depth: Math.min(rise * .3, 1.8),
    scale: Math.max(.18, 1 - Math.max(0, rise - 12) * .018),
    // Only retire after leaving the visible sky; starting another wish never removes a flight.
    finished: reduced ? age > 60 : rise > 80,
  };
}
