// Writes assets/maps/land.bin. The format is in docs/en/fisicos.md.
import { readFile, mkdir, writeFile } from "node:fs/promises";

const LAND = "node_modules/world-atlas/land-10m.json";
const COUNTRIES = "node_modules/world-atlas/countries-10m.json";
const PERU_ID = "604";
const PLACES = "data/physicists.json";
const OUT = "assets/maps/land.bin";

const WORLD_RES = 5;
const DETAIL_RES = 100;
const PERU = { south: -18.6, west: -81.6, north: 0.4, east: -68.4 };
const PAD = 1;

interface Geometry {
  type: string;
  id?: string;
  arcs: number[][] | number[][][];
}

interface Topology {
  transform: { scale: [number, number]; translate: [number, number] };
  arcs: [number, number][][];
  objects: Record<string, { geometries: Geometry[] }>;
}

interface Box {
  south: number;
  west: number;
  north: number;
  east: number;
}

type Edge = [number, number, number, number];

function edges(topo: Topology, geometries: Geometry[]): Edge[] {
  const [sx, sy] = topo.transform.scale;
  const [tx, ty] = topo.transform.translate;
  const decoded = topo.arcs.map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]): [number, number] => [
      (x += dx) * sx + tx,
      (y += dy) * sy + ty,
    ]);
  });
  const out: Edge[] = [];
  // Even-odd filling needs only the segments, in any direction. Each ring's
  // arcs are added once per use, so an arc two rings share cancels out, as a
  // shared border should.
  for (const g of geometries) {
    const rings = (
      g.type === "Polygon" ? g.arcs : (g.arcs as number[][][]).flat()
    ) as number[][];
    for (const ring of rings) {
      const pts = ring.flatMap((ref) =>
        ref < 0 ? [...decoded[~ref]].reverse() : decoded[ref],
      );
      seamSides(pts);
      for (let i = 1; i < pts.length; i++) split(out, pts[i - 1], pts[i]);
    }
  }
  return out;
}

// The data cuts land at the antimeridian, but a point on the cut may carry
// either sign: Siberia's east coast closes along -180 and so wraps the whole
// map. A seam point takes the side of the last point off the seam before it.
function seamSides(pts: [number, number][]): void {
  const off = [...pts].reverse().find(([x]) => Math.abs(x) < 180);
  if (!off) return;
  let side = Math.sign(off[0]);
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (Math.abs(x) < 180) side = Math.sign(x);
    else pts[i] = [side * 180, y];
  }
}

// A step longer than half the globe crosses the antimeridian. It becomes two
// edges that end on the map's sides, and each side gets an edge from there to
// the south pole. Pole edges cancel in pairs and leave the seam that closes
// each half. Antarctica circles the pole and crosses once, at -90, where its
// unpaired edge has no length.
function split(
  out: Edge[],
  [x1, y1]: [number, number],
  [x2, y2]: [number, number],
): void {
  if (Math.abs(x2 - x1) <= 180) {
    out.push([x1, y1, x2, y2]);
    return;
  }
  const side = Math.sign(x1) * 180;
  const y = y1 + ((side - x1) / (x2 + 2 * side - x1)) * (y2 - y1);
  out.push(
    [x1, y1, side, y],
    [-side, y, x2, y2],
    [side, y, side, -90],
    [-side, y, -side, -90],
  );
}

function varint(out: number[], n: number): void {
  while (n >= 0x80) {
    out.push((n & 0x7f) | 0x80);
    n >>>= 7;
  }
  out.push(n);
}

function rasterize(all: Edge[], box: Box, res: number): Uint8Array {
  const width = Math.round((box.east - box.west) * res);
  const height = Math.round((box.north - box.south) * res);
  const rows: Edge[][] = Array.from({ length: height }, () => []);
  for (const e of all) {
    const lo = Math.min(e[1], e[3]);
    const hi = Math.max(e[1], e[3]);
    // One spare row each side: an end exactly on a row's latitude can round
    // out of the bucket here, and the crossing test below decides anyway.
    const r0 = Math.max(0, Math.floor((lo - box.south) * res - 0.5));
    const r1 = Math.min(height - 1, Math.ceil((hi - box.south) * res - 0.5));
    for (let r = r0; r <= r1; r++) rows[r].push(e);
  }
  const bytes: number[] = [];
  for (let r = 0; r < height; r++) {
    const lat = box.south + (r + 0.5) / res;
    const xs: number[] = [];
    for (const [x1, y1, x2, y2] of rows[r]) {
      if (y1 <= lat !== y2 <= lat)
        xs.push(x1 + ((lat - y1) * (x2 - x1)) / (y2 - y1));
    }
    xs.sort((a, b) => a - b);
    // Cells whose centre lies between a pair of crossings are land. Crossings
    // outside the box clamp to its edge. Two crossings on one cell cancel, so
    // they write no empty runs. The row ends at the box's east edge.
    const cells: number[] = [];
    for (const x of xs) {
      const cell = Math.min(
        width,
        Math.max(0, Math.ceil((x - box.west) * res - 0.5)),
      );
      if (cells[cells.length - 1] === cell) cells.pop();
      else cells.push(cell);
    }
    let at = 0;
    for (const cell of cells) {
      if (at === width) break;
      varint(bytes, cell - at);
      at = cell;
    }
    if (at < width) varint(bytes, width - at);
  }
  return Uint8Array.from(bytes);
}

function detailBoxes(
  places: { lat: number | null; lon: number | null; country: string }[],
): Box[] {
  const boxes: Box[] = [{ ...PERU }];
  for (const p of places) {
    if (p.lat === null || p.lon === null || p.country === "PE") continue;
    boxes.push({
      south: p.lat - PAD,
      west: p.lon - PAD,
      north: p.lat + PAD,
      east: p.lon + PAD,
    });
  }
  // Merge overlapping boxes until none overlap, so every point has one detail mask.
  for (let merged = true; merged;) {
    merged = false;
    for (let i = 0; i < boxes.length && !merged; i++) {
      for (let j = i + 1; j < boxes.length && !merged; j++) {
        const a = boxes[i];
        const b = boxes[j];
        if (
          a.south < b.north &&
          b.south < a.north &&
          a.west < b.east &&
          b.west < a.east
        ) {
          boxes[i] = {
            south: Math.min(a.south, b.south),
            west: Math.min(a.west, b.west),
            north: Math.max(a.north, b.north),
            east: Math.max(a.east, b.east),
          };
          boxes.splice(j, 1);
          merged = true;
        }
      }
    }
  }
  // Snap to the detail grid so the header can store the edges exactly.
  return boxes.map((b) => ({
    south: Math.floor(b.south * 10) / 10,
    west: Math.floor(b.west * 10) / 10,
    north: Math.ceil(b.north * 10) / 10,
    east: Math.ceil(b.east * 10) / 10,
  }));
}

function header(
  kind: number,
  box: Box,
  res: number,
  length: number,
): Uint8Array {
  const view = new DataView(new ArrayBuffer(19));
  view.setUint8(0, kind);
  view.setInt32(1, Math.round(box.south * 100), true);
  view.setInt32(5, Math.round(box.west * 100), true);
  view.setUint16(9, res, true);
  view.setUint16(11, Math.round((box.east - box.west) * res), true);
  view.setUint16(13, Math.round((box.north - box.south) * res), true);
  view.setUint32(15, length, true);
  return new Uint8Array(view.buffer);
}

const land = JSON.parse(await readFile(LAND, "utf8")) as Topology;
const countries = JSON.parse(await readFile(COUNTRIES, "utf8")) as Topology;
const { places } = JSON.parse(await readFile(PLACES, "utf8"));
const landEdges = edges(land, land.objects.land.geometries);
const peruEdges = edges(
  countries,
  countries.objects.countries.geometries.filter((g) => g.id === PERU_ID),
);
const masks: [number, Edge[], Box, number][] = [
  [0, landEdges, { south: -90, west: -180, north: 90, east: 180 }, WORLD_RES],
  ...detailBoxes(places).map((b): [number, Edge[], Box, number] => [
    0,
    landEdges,
    b,
    DETAIL_RES,
  ]),
  [1, peruEdges, PERU, DETAIL_RES],
];
const parts: Uint8Array[] = [Uint8Array.of(masks.length)];
for (const [kind, all, box, res] of masks) {
  const rows = rasterize(all, box, res);
  parts.push(header(kind, box, res, rows.length), rows);
}
const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
let at = 0;
for (const p of parts) out.set(p, (at += p.length) - p.length);
await mkdir("assets/maps", { recursive: true });
await writeFile(OUT, out);
console.log(`${OUT}: ${masks.length} masks, ${out.length} bytes`);
