// Returns either the daily seed, or the "seed" urlParam (for debugging)
export default function useSeed() {
  const params = new URLSearchParams(window.location.search);
  const seed = params.get("seed");
  if (seed) return seed;

  // Get current time as a string and trim off everything after the day
  const date = new Date().toISOString().split("T")[0];
  return date;
}
