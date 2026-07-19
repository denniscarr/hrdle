export function godotColorToCss(color: string): string {
  const [r, g, b, a] = color.replace(/[()]/g, "").split(",").map(Number);
  const rnd = (x: number) => Math.round(x * 255);
  return `rgba(${rnd(r)}, ${rnd(g)}, ${rnd(b)}, ${a})`;
}
