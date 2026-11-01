import params from "@params";

// An orthographic globe of land dots with one marker per institution, drawn on
// a canvas. Land comes from assets/maps/land.bin, written by
// scripts/landmask.ts; that script documents the format.

interface Place {
  id: string;
  short: string;
  lat: number;
  lon: number;
  n: number;
}

// A person, the mapped places of their path (degrees first, then work) for
// the globe, and every stop of the path with what they did there for the panel.
interface Person {
  slug: string;
  name: string;
  initials: string;
  image: string;
  role: string;
  area: string | null;
  degree: string;
  works: number | null;
  cited: number | null;
  path: string[];
  stops: { name: string; note: string }[];
  url: string;
}

interface Mask {
  south: number;
  west: number;
  north: number;
  east: number;
  res: number;
  width: number;
  // Row r's run boundaries are bounds[starts[r]] up to bounds[starts[r + 1]].
  starts: Uint32Array;
  bounds: Uint16Array;
}

interface Cluster {
  x: number;
  y: number;
  r: number;
  places: Place[];
  n: number;
}

const RAD = Math.PI / 180;
// Dot rows at level 0 sit 180/190 ≈ 0.95° apart, and each zoom doubling
// halves the spacing. Level 7 is about 0.0074°, under the 0.01° detail mask.
const ROWS = 190;
const MAX_LEVEL = 7;
const MAX_ZOOM = 512;
const MIN_ZOOM = 0.8;
const CLUSTER_PX = 26;
// An arc rises to this share of the radius for every radian it spans.
const LIFT = 0.12;
const DRAW_MS = 900;
// Peru runs about 18.5° north to south; the span leaves a margin.
const PERU = { lon: -75, lat: -9.3, span: 21 };

interface Masks {
  land: Mask[];
  peru: Mask[];
}

function readMasks(buf: ArrayBuffer): Masks {
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);
  const masks: Masks = { land: [], peru: [] };
  let at = 1;
  for (let m = view.getUint8(0); m > 0; m--) {
    const kind = view.getUint8(at);
    const south = view.getInt32(at + 1, true) / 100;
    const west = view.getInt32(at + 5, true) / 100;
    const res = view.getUint16(at + 9, true);
    const width = view.getUint16(at + 11, true);
    const height = view.getUint16(at + 13, true);
    const length = view.getUint32(at + 15, true);
    at += 19;
    const end = at + length;
    const starts = new Uint32Array(height + 1);
    const bounds: number[] = [];
    for (let r = 0; r < height; r++) {
      starts[r] = bounds.length;
      let x = 0;
      while (x < width) {
        let n = 0;
        let shift = 0;
        let b: number;
        do {
          b = bytes[at++];
          n |= (b & 0x7f) << shift;
          shift += 7;
        } while (b & 0x80);
        x += n;
        if (x < width) bounds.push(x);
      }
    }
    starts[height] = bounds.length;
    if (at !== end) throw new Error("land.bin: row length mismatch");
    (kind === 1 ? masks.peru : masks.land).push({
      south,
      west,
      north: south + height / res,
      east: west + width / res,
      res,
      width,
      starts,
      bounds: Uint16Array.from(bounds),
    });
  }
  // The finest mask that covers a point decides it.
  masks.land.sort((a, b) => b.res - a.res);
  return masks;
}

function inside(masks: Mask[], lat: number, lon: number): boolean {
  for (const m of masks) {
    if (lat < m.south || lat >= m.north || lon < m.west || lon >= m.east)
      continue;
    const r = Math.floor((lat - m.south) * m.res);
    const c = Math.floor((lon - m.west) * m.res);
    let lo = m.starts[r];
    let hi = m.starts[r + 1];
    const first = lo;
    // Count the boundaries at or before the cell: an odd count is inside.
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (m.bounds[mid] <= c) lo = mid + 1;
      else hi = mid;
    }
    return ((lo - first) & 1) === 1;
  }
  return false;
}

function wrap(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

type Vec = [number, number, number];

function vec(lat: number, lon: number): Vec {
  const p = lat * RAD;
  const l = lon * RAD;
  return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
}

// The great circle from a to b, as unit vectors at t = 0 … 1.
function slerp(a: Vec, b: Vec, t: number, omega: number): Vec {
  if (omega < 1e-9) return a;
  const s = Math.sin(omega);
  const ka = Math.sin((1 - t) * omega) / s;
  const kb = Math.sin(t * omega) / s;
  return [ka * a[0] + kb * b[0], ka * a[1] + kb * b[1], ka * a[2] + kb * b[2]];
}

function between(a: Vec, b: Vec): number {
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return Math.acos(clamp(dot, -1, 1));
}

class Globe {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly reduced = matchMedia("(prefers-reduced-motion: reduce)");
  private width = 0;
  private height = 0;
  private dpr = 1;
  private lon = PERU.lon;
  private lat = PERU.lat;
  private zoom = 1;
  private frame = 0;
  private flight = 0;
  private clusters: Cluster[] = [];
  private hover?: Cluster;
  private selected = new Set<string>();
  private readonly byId: Map<string, Place>;
  // The paths drawn, and the one drawn on top when a person is focused.
  private routes: Person[] = [];
  private focus?: string;
  private drawStart = 0;
  private pending?: Person;
  private colors = {
    fg: "",
    bg: "",
    surface: "",
    line: "",
    muted: "",
    accent: "",
  };
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private moved = 0;
  private pinch = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly masks: Masks,
    private readonly places: Place[],
    private readonly people: Person[],
    private readonly onPick: (places: Place[]) => void,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.byId = new Map(places.map((p) => [p.id, p]));
    this.readColors();
    new ResizeObserver(() => this.resize()).observe(canvas);
    new MutationObserver(() => {
      this.readColors();
      this.draw();
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-dark-mode"],
    });
    canvas.addEventListener("pointerdown", (e) => this.down(e));
    canvas.addEventListener("pointermove", (e) => this.move(e));
    canvas.addEventListener("pointerup", (e) => this.up(e));
    canvas.addEventListener("pointercancel", (e) =>
      this.pointers.delete(e.pointerId),
    );
    canvas.addEventListener("pointerleave", () => this.setHover(undefined));
    canvas.addEventListener("wheel", (e) => this.wheel(e), { passive: false });
    canvas.addEventListener("keydown", (e) => this.key(e));
    canvas.addEventListener("dblclick", (e) => {
      const [x, y] = this.local(e);
      this.zoomAt(x, y, this.zoom * 2, true);
    });
    void document.fonts.ready.then(() => this.draw());
  }

  // The globe fills the shorter side at zoom 1.
  private get radius(): number {
    return Math.min(this.width, this.height) * 0.45 * this.zoom;
  }

  peru(): void {
    this.flyTo(PERU.lon, PERU.lat, this.fitZoom(PERU.span));
  }

  world(): void {
    this.flyTo(this.lon, clamp(this.lat, -30, 30), 1);
  }

  zoomBy(factor: number): void {
    this.zoomAt(this.width / 2, this.height / 2, this.zoom * factor, true);
  }

  // Mark places and draw the path of everyone who studied or works at one.
  select(ids: string[]): void {
    this.selected = new Set(ids);
    this.routes = this.people.filter(
      (p) => p.path.length > 1 && p.path.some((id) => this.selected.has(id)),
    );
    this.focus = undefined;
    this.drawStart = performance.now();
    this.draw();
  }

  // Draw one person's path and fly to show all of it.
  follow(person: Person): void {
    this.selected = new Set(person.path);
    this.routes = [person];
    this.focus = person.slug;
    this.drawStart = performance.now();
    // Before the first layout there is no size to fit the path to.
    if (!this.width) {
      this.pending = person;
      return;
    }
    const stops = person.path
      .map((id) => this.byId.get(id))
      .filter((p): p is Place => p !== undefined);
    if (!stops.length) return this.draw();
    const { lat, lon, arc } = this.centre(stops);
    // Loose enough that the stops clear the panel on the right.
    this.flyTo(lon, lat, this.fitZoom(Math.max(arc * 2.6, 10)));
  }

  // Bring one drawn path to the front, or none.
  highlight(slug: string | undefined): void {
    if (slug === this.focus) return;
    this.focus = slug;
    this.draw();
  }

  // The zoom at which an arc of `degrees` spans most of the shorter side.
  private fitZoom(degrees: number): number {
    const r0 = Math.min(this.width, this.height) * 0.45;
    const half = Math.sin((Math.min(degrees, 170) / 2) * RAD);
    return clamp(
      (Math.min(this.width, this.height) * 0.42) / (r0 * half),
      MIN_ZOOM,
      MAX_ZOOM,
    );
  }

  private readColors(): void {
    const style = getComputedStyle(this.canvas);
    for (const k of Object.keys(this.colors) as (keyof Globe["colors"])[]) {
      this.colors[k] = style.getPropertyValue(`--${k}`).trim();
    }
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const first = this.width === 0;
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
    if (first) this.zoom = this.fitZoom(PERU.span);
    this.paint();
    if (this.pending) this.follow(this.pending);
    this.pending = undefined;
  }

  // Screen offset from the centre, and whether the point faces the viewer.
  private project(lat: number, lon: number): [number, number, number] {
    const R = this.radius;
    const p = lat * RAD;
    const dl = (lon - this.lon) * RAD;
    const p0 = this.lat * RAD;
    const cp = Math.cos(p);
    const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * cp * Math.cos(dl);
    const x = R * cp * Math.sin(dl);
    const y =
      R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * cp * Math.cos(dl));
    return [this.width / 2 + x, this.height / 2 - y, cosc];
  }

  private invert(sx: number, sy: number): [number, number] | undefined {
    const x = sx - this.width / 2;
    const y = this.height / 2 - sy;
    const rho = Math.hypot(x, y);
    const R = this.radius;
    if (rho > R) return undefined;
    if (rho === 0) return [this.lat, this.lon];
    const c = Math.asin(rho / R);
    const p0 = this.lat * RAD;
    const lat = Math.asin(
      Math.cos(c) * Math.sin(p0) + (y * Math.sin(c) * Math.cos(p0)) / rho,
    );
    const lon =
      this.lon * RAD +
      Math.atan2(
        x * Math.sin(c),
        rho * Math.cos(c) * Math.cos(p0) - y * Math.sin(c) * Math.sin(p0),
      );
    return [lat / RAD, wrap(lon / RAD)];
  }

  private draw(): void {
    if (!this.frame) this.frame = requestAnimationFrame(() => this.paint());
  }

  private paint(): void {
    this.frame = 0;
    const { ctx, width, height, dpr, colors } = this;
    if (!width || !height) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const R = this.radius;
    const cx = width / 2;
    const cy = height / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.fillStyle = colors.surface;
    ctx.fill();
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    this.paintDots();
    this.paintRoutes();
    this.clusters = this.cluster();
    this.paintMarkers();
  }

  // Each leg of a path is a great circle lifted off the ground in proportion
  // to its length, so a long one reads as a flight. The legs draw in order
  // when the selection changes.
  private paintRoutes(): void {
    if (!this.routes.length) return;
    const { ctx, colors } = this;
    const R = this.radius;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const cl = Math.cos(this.lon * RAD);
    const sl = Math.sin(this.lon * RAD);
    const cp = Math.cos(this.lat * RAD);
    const sp = Math.sin(this.lat * RAD);
    // A lifted point behind the globe still shows where it clears the disc.
    const screen = (v: Vec, lift: number): [number, number, boolean] => {
      const front = v[0] * cl + v[1] * sl;
      const x = v[1] * cl - v[0] * sl;
      const y = cp * v[2] - sp * front;
      const z = sp * v[2] + cp * front;
      const k = 1 + lift;
      return [
        cx + R * x * k,
        cy - R * y * k,
        z > 0 || Math.hypot(x, y) * k > 1,
      ];
    };
    const t = this.reduced.matches
      ? 1
      : clamp((performance.now() - this.drawStart) / DRAW_MS, 0, 1);
    if (t < 1) this.draw();
    const eased = 1 - (1 - t) ** 3;
    const single = this.routes.length === 1;
    const order = [...this.routes].sort(
      (a, b) => Number(a.slug === this.focus) - Number(b.slug === this.focus),
    );
    ctx.strokeStyle = colors.accent;
    ctx.fillStyle = colors.accent;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const person of order) {
      const on = single || person.slug === this.focus;
      ctx.globalAlpha = on ? 1 : this.focus ? 0.12 : 0.4;
      ctx.lineWidth = on ? 2 : 1.25;
      const stops = person.path
        .map((id) => this.byId.get(id))
        .filter((p): p is Place => p !== undefined);
      const reach = eased * (stops.length - 1);
      for (let i = 0; i < stops.length - 1 && i < reach; i++) {
        const a = vec(stops[i].lat, stops[i].lon);
        const b = vec(stops[i + 1].lat, stops[i + 1].lon);
        const omega = between(a, b);
        const share = Math.min(1, reach - i);
        const n = clamp(Math.ceil(omega / RAD), 12, 120);
        let pen = false;
        let tip: [number, number] | undefined;
        let back: [number, number] | undefined;
        ctx.beginPath();
        for (let s = 0; s <= n; s++) {
          const u = (share * s) / n;
          const [x, y, seen] = screen(
            slerp(a, b, u, omega),
            LIFT * omega * Math.sin(Math.PI * u),
          );
          if (!seen) {
            pen = false;
            continue;
          }
          if (pen) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
          pen = true;
          back = tip;
          tip = [x, y];
        }
        ctx.stroke();
        if (on && tip && back) this.arrow(back, tip);
      }
    }
    ctx.globalAlpha = 1;
  }

  // A small head on a leg's end shows which way the person went.
  private arrow([x0, y0]: [number, number], [x1, y1]: [number, number]): void {
    const angle = Math.atan2(y1 - y0, x1 - x0);
    const size = 7;
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(
      x1 - size * Math.cos(angle - 0.45),
      y1 - size * Math.sin(angle - 0.45),
    );
    ctx.lineTo(
      x1 - size * Math.cos(angle + 0.45),
      y1 - size * Math.sin(angle + 0.45),
    );
    ctx.closePath();
    ctx.fill();
  }

  // The dots of level L sit on rows i·s and, in each row, columns k·360/n.
  // Level L+1 keeps every one of them and adds the odd rows and columns, so
  // a dot never moves as the zoom grows; the added ones fade in.
  private paintDots(): void {
    const { ctx, width, height, colors } = this;
    const R = this.radius;
    const z = Math.log2(Math.max(this.zoom, 1));
    const level = Math.min(MAX_LEVEL, Math.floor(z));
    const fade = level === MAX_LEVEL ? 1 : z - level;
    const rows = ROWS << level;
    const step = 180 / rows;
    // Angular radius of the visible cap.
    const reach =
      Math.asin(Math.min(1, Math.hypot(width, height) / 2 / R)) / RAD;
    const latLo = Math.max(-90 + step, this.lat - reach);
    const latHi = Math.min(90 - step, this.lat + reach);
    const polar = this.lat + reach >= 90 || this.lat - reach <= -90;
    const lonReach = polar
      ? 180
      : Math.min(
          180,
          Math.asin(
            Math.min(1, Math.sin(reach * RAD) / Math.cos(this.lat * RAD)),
          ) /
            RAD +
            step,
        );
    const spacing = R * step * RAD;
    const size = clamp(spacing * 0.32, 0.9, 2.6);
    // Peru's dots draw brighter than its neighbours'. Each tone has a path for
    // the dots kept from the level below and one for those fading in.
    const old = new Path2D();
    const fresh = new Path2D();
    const peruOld = new Path2D();
    const peruFresh = new Path2D();
    const i0 = Math.ceil((latLo + 90) / step);
    const i1 = Math.floor((latHi + 90) / step);
    for (let i = i0; i <= i1; i++) {
      const lat = -90 + i * step;
      const n =
        (1 << level) * Math.max(1, Math.round(2 * ROWS * Math.cos(lat * RAD)));
      const colStep = 360 / n;
      const k0 = Math.floor((this.lon - lonReach + 180) / colStep);
      const k1 = Math.ceil((this.lon + lonReach + 180) / colStep);
      for (let k = k0; k <= k1 && k - k0 < n; k++) {
        const kk = ((k % n) + n) % n;
        const lon = -180 + kk * colStep;
        const [x, y, cosc] = this.project(lat, lon);
        if (cosc <= 0 || x < -4 || y < -4 || x > width + 4 || y > height + 4)
          continue;
        if (!inside(this.masks.land, lat, lon)) continue;
        const added = level > 0 && ((i & 1) === 1 || (kk & 1) === 1);
        // Dots shrink toward the limb, as a sphere's surface does.
        const r = size * (0.45 + 0.55 * Math.sqrt(cosc));
        const peru = inside(this.masks.peru, lat, lon);
        const path = peru ? (added ? peruFresh : peruOld) : added ? fresh : old;
        path.moveTo(x + r, y);
        path.arc(x, y, r, 0, 2 * Math.PI);
      }
    }
    ctx.fillStyle = colors.fg;
    for (const [kept, adding, alpha] of [
      [old, fresh, 0.3],
      [peruOld, peruFresh, 0.62],
    ] as const) {
      ctx.globalAlpha = alpha;
      ctx.fill(kept);
      ctx.globalAlpha = alpha * fade;
      ctx.fill(adding);
    }
    ctx.globalAlpha = 1;
  }

  // Places merge greedily, largest first, into the marker within reach.
  private cluster(): Cluster[] {
    const out: Cluster[] = [];
    for (const p of this.places) {
      const [x, y, cosc] = this.project(p.lat, p.lon);
      if (cosc <= 0.05) continue;
      const near = out.find((c) => Math.hypot(c.x - x, c.y - y) < CLUSTER_PX);
      if (near) {
        near.places.push(p);
        near.n += p.n;
      } else out.push({ x, y, r: 0, places: [p], n: p.n });
    }
    // A group needs room for its count.
    for (const c of out) {
      c.r = Math.min(18, 4 + 1.3 * Math.sqrt(c.n));
      if (c.places.length > 1) c.r = Math.max(c.r, 8);
    }
    return out;
  }

  private paintMarkers(): void {
    const { ctx, colors } = this;
    const taken: [number, number, number, number][] = [];
    ctx.textBaseline = "middle";
    for (const c of this.clusters) {
      const on =
        c === this.hover || c.places.some((p) => this.selected.has(p.id));
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r + (on ? 2 : 0), 0, 2 * Math.PI);
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = on ? 1 : 0.88;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.strokeStyle = colors.bg;
      ctx.stroke();
      if (c.places.length > 1) {
        ctx.font = "600 11px Jost, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.fillText(String(c.places.length), c.x, c.y + 0.5);
      }
      taken.push([c.x - c.r, c.y - c.r, c.x + c.r, c.y + c.r]);
    }
    // Single places get a label, biggest first, on the first side (right,
    // left, above, below) where it overlaps neither a marker nor a label.
    ctx.font = "500 12px Jost, sans-serif";
    ctx.textAlign = "left";
    ctx.lineJoin = "round";
    for (const c of this.clusters) {
      if (c.places.length > 1) continue;
      const text = c.places[0].short;
      const w = ctx.measureText(text).width;
      const gap = c.r + 5;
      const spots: [number, number][] = [
        [c.x + gap, c.y],
        [c.x - gap - w, c.y],
        [c.x - w / 2, c.y - gap - 4],
        [c.x - w / 2, c.y + gap + 4],
      ];
      for (const [x, y] of spots) {
        const box: [number, number, number, number] = [
          x - 2,
          y - 8,
          x + w + 2,
          y + 8,
        ];
        if (box[0] < 0 || box[2] > this.width) continue;
        if (box[1] < 0 || box[3] > this.height) continue;
        if (
          taken.some(
            (t) =>
              t[0] < box[2] && box[0] < t[2] && t[1] < box[3] && box[1] < t[3],
          )
        )
          continue;
        taken.push(box);
        ctx.lineWidth = 3;
        ctx.strokeStyle = colors.bg;
        ctx.strokeText(text, x, y);
        ctx.fillStyle = c === this.hover ? colors.accent : colors.fg;
        ctx.fillText(text, x, y);
        break;
      }
    }
  }

  private hit(x: number, y: number): Cluster | undefined {
    let best: Cluster | undefined;
    let dist = Infinity;
    for (const c of this.clusters) {
      const d = Math.hypot(c.x - x, c.y - y);
      if (d <= c.r + 6 && d < dist) {
        best = c;
        dist = d;
      }
    }
    return best;
  }

  private setHover(c: Cluster | undefined): void {
    if (c === this.hover) return;
    this.hover = c;
    this.canvas.style.cursor = c ? "pointer" : "";
    this.draw();
  }

  private local(e: MouseEvent): [number, number] {
    const rect = this.canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  private down(e: PointerEvent): void {
    this.canvas.setPointerCapture(e.pointerId);
    const [x, y] = this.local(e);
    this.pointers.set(e.pointerId, { x, y });
    if (this.pointers.size === 1) this.moved = 0;
    if (this.pointers.size === 2) this.pinch = this.spread();
    cancelAnimationFrame(this.flight);
  }

  private spread(): number {
    const [a, b] = [...this.pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private move(e: PointerEvent): void {
    const [x, y] = this.local(e);
    const last = this.pointers.get(e.pointerId);
    if (!last) {
      this.setHover(this.hit(x, y));
      return;
    }
    if (this.pointers.size === 2) {
      last.x = x;
      last.y = y;
      const d = this.spread();
      const [a, b] = [...this.pointers.values()];
      if (this.pinch > 0)
        this.zoomAt(
          (a.x + b.x) / 2,
          (a.y + b.y) / 2,
          (this.zoom * d) / this.pinch,
          false,
        );
      this.pinch = d;
      this.moved = Infinity;
      return;
    }
    const dx = x - last.x;
    const dy = y - last.y;
    last.x = x;
    last.y = y;
    this.moved += Math.hypot(dx, dy);
    this.rotate(dx, dy);
  }

  private rotate(dx: number, dy: number): void {
    const deg = 1 / (this.radius * RAD);
    this.lon = wrap(
      this.lon - (dx * deg) / Math.max(0.2, Math.cos(this.lat * RAD)),
    );
    this.lat = clamp(this.lat + dy * deg, -85, 85);
    this.draw();
  }

  private up(e: PointerEvent): void {
    const [x, y] = this.local(e);
    this.pointers.delete(e.pointerId);
    if (this.pointers.size > 0 || this.moved > 4) return;
    const c = this.hit(x, y);
    if (c) this.open(c);
  }

  // A count zooms to fit its places. A place, or places that share one
  // campus and cannot separate, opens the panel.
  private open(c: Cluster): void {
    if (c.places.length === 1) {
      this.onPick(c.places);
      return;
    }
    const { lat, lon, arc } = this.centre(c.places);
    const zoom = this.fitZoom(arc * 2.2);
    if (arc < 1e-4 || this.zoom >= MAX_ZOOM * 0.99) this.onPick(c.places);
    else this.flyTo(lon, lat, Math.max(zoom, this.zoom * 1.5));
  }

  // The mean point of some places, and the widest span, in degrees, they
  // cover around it.
  private centre(places: Place[]): { lat: number; lon: number; arc: number } {
    let x = 0;
    let y = 0;
    let z = 0;
    for (const p of places) {
      x += Math.cos(p.lat * RAD) * Math.cos(p.lon * RAD);
      y += Math.cos(p.lat * RAD) * Math.sin(p.lon * RAD);
      z += Math.sin(p.lat * RAD);
    }
    const lat = Math.atan2(z, Math.hypot(x, y)) / RAD;
    const lon = Math.atan2(y, x) / RAD;
    let arc = 0;
    for (const p of places)
      arc = Math.max(arc, 2 * this.angle(lat, lon, p.lat, p.lon));
    return { lat, lon, arc };
  }

  private angle(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const a =
      Math.sin(((lat2 - lat1) * RAD) / 2) ** 2 +
      Math.cos(lat1 * RAD) *
        Math.cos(lat2 * RAD) *
        Math.sin(((lon2 - lon1) * RAD) / 2) ** 2;
    return (2 * Math.asin(Math.sqrt(a))) / RAD;
  }

  private wheel(e: WheelEvent): void {
    e.preventDefault();
    const [x, y] = this.local(e);
    const lines = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    this.zoomAt(x, y, this.zoom * Math.exp((-e.deltaY * lines) / 400), false);
  }

  // Zoom so the ground under (x, y) stays under it. Two passes correct the
  // curvature the first leaves.
  private zoomAt(x: number, y: number, zoom: number, animate: boolean): void {
    zoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
    const target = this.invert(x, y);
    if (animate || !target) {
      if (!target) return this.flyTo(this.lon, this.lat, zoom);
      const keep = { lon: this.lon, lat: this.lat, zoom: this.zoom };
      this.settleAt(target, x, y, zoom);
      const end = { lon: this.lon, lat: this.lat };
      Object.assign(this, keep);
      return this.flyTo(end.lon, end.lat, zoom);
    }
    this.settleAt(target, x, y, zoom);
    this.draw();
  }

  private settleAt(
    [lat, lon]: [number, number],
    x: number,
    y: number,
    zoom: number,
  ): void {
    this.zoom = zoom;
    for (let pass = 0; pass < 2; pass++) {
      const now = this.invert(x, y);
      if (!now) break;
      this.lon = wrap(this.lon + wrap(lon - now[1]));
      this.lat = clamp(this.lat + lat - now[0], -85, 85);
    }
  }

  private flyTo(lon: number, lat: number, zoom: number): void {
    cancelAnimationFrame(this.flight);
    const from = { lon: this.lon, lat: this.lat, z: Math.log(this.zoom) };
    const dl = wrap(lon - from.lon);
    const dz = Math.log(zoom) - from.z;
    const ms = this.reduced.matches
      ? 0
      : clamp(450 + 90 * Math.abs(dz), 450, 1100);
    const start = performance.now();
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - start) / ms) : 1;
      const e = 1 - (1 - t) ** 3;
      this.lon = wrap(from.lon + dl * e);
      this.lat = from.lat + (lat - from.lat) * e;
      this.zoom = Math.exp(from.z + dz * e);
      this.paint();
      if (t < 1) this.flight = requestAnimationFrame(step);
    };
    this.flight = requestAnimationFrame(step);
  }

  private key(e: KeyboardEvent): void {
    const pan = 60;
    const moves: Record<string, () => void> = {
      ArrowLeft: () => this.rotate(pan, 0),
      ArrowRight: () => this.rotate(-pan, 0),
      ArrowUp: () => this.rotate(0, pan),
      ArrowDown: () => this.rotate(0, -pan),
      "+": () => this.zoomBy(2),
      "=": () => this.zoomBy(2),
      "-": () => this.zoomBy(0.5),
    };
    const act = moves[e.key];
    if (!act) return;
    e.preventDefault();
    act();
  }
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function panel(
  root: HTMLElement,
  list: HTMLElement,
  byId: Map<string, Place>,
  people: Map<string, Person>,
  globe: () => Globe | undefined,
) {
  const box = root.querySelector<HTMLElement>(".map-panel")!;
  const body = box.querySelector<HTMLElement>(".map-panel-body")!;
  const footer = box.querySelector<HTMLElement>(".map-panel-foot")!;
  const icons = box.querySelector<HTMLTemplateElement>(".map-icons")!.content;
  const icon = (name: string) =>
    icons.querySelector(`[data-icon="${name}"] svg`)!.cloneNode(true);
  // Matches Hugo's lang.FormatNumber on the profile, which groups every
  // thousand with a point: 1.234 and 26.040.
  const count = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const close = () => {
    box.hidden = true;
    body.replaceChildren();
    footer.replaceChildren();
    footer.hidden = true;
    globe()?.select([]);
    if (location.hash.startsWith("#ruta-"))
      history.replaceState(null, "", location.pathname + location.search);
  };
  box.querySelector(".map-panel-close")!.addEventListener("click", close);
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !box.hidden) close();
  });
  // A row brings its person's path to the front while it has the pointer
  // or focus.
  const lit = (e: Event) => {
    const row = (e.target as Element).closest<HTMLElement>("[data-person]");
    globe()?.highlight(row?.dataset.person);
  };
  body.addEventListener("pointerover", lit);
  body.addEventListener("focusin", lit);
  body.addEventListener("pointerleave", () => globe()?.highlight(undefined));
  // A name in a place's list opens that person here, with a way back to the
  // place; a modified click still follows the link to the profile.
  let picked: Place[] = [];
  body.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element).closest<HTMLAnchorElement>(
      "[data-person] .card-link",
    );
    const row = link?.closest<HTMLElement>("[data-person]");
    const person = row && people.get(row.dataset.person!);
    if (!person) return;
    e.preventDefault();
    const places = picked;
    const label =
      places.length === 1
        ? (byId.get(places[0].id)?.short ?? "")
        : "Instituciones";
    show(person, { label, go: () => pick(places) });
  });

  const open = (nodes: Node[], foot?: Node) => {
    body.replaceChildren(...nodes);
    footer.replaceChildren(...(foot ? [foot] : []));
    footer.hidden = !foot;
    box.hidden = false;
    body.scrollTop = 0;
  };

  const show = (person: Person, back?: { label: string; go: () => void }) => {
    const nodes: Node[] = [];
    if (back) {
      const button = el("button", "map-back", icon("chevron-left"), back.label);
      button.type = "button";
      button.addEventListener("click", back.go);
      nodes.push(button);
    }
    let avatar: HTMLElement;
    if (person.image) {
      const img = el("img", "avatar");
      img.src = person.image;
      img.width = img.height = 40;
      img.alt = "";
      avatar = img;
    } else {
      avatar = el("span", "avatar avatar-initial", person.initials);
      avatar.style.setProperty("--avatar-size", "40px");
      avatar.setAttribute("aria-hidden", "true");
    }
    const heading = el("div", "", el("h2", "", person.name));
    if (person.role) heading.append(el("p", "map-where", person.role));
    const facts = el("dl", "map-facts");
    const fact = (label: string, value: string) =>
      facts.append(el("div", "", el("dt", "", label), el("dd", "", value)));
    fact("Grado", `${person.degree} en física`);
    if (person.area) fact("Área", person.area);
    if (person.works)
      fact(
        "Obra",
        `${count(person.works)} trabajos · ${count(person.cited ?? 0)} citas`,
      );
    const stops = el("ol", "map-stops");
    for (const stop of person.stops) {
      const item = el("li", "", el("span", "map-stop-name", stop.name));
      if (stop.note) item.append(el("span", "map-stop-note", stop.note));
      stops.append(item);
    }
    nodes.push(
      el(
        "section",
        "map-person",
        el("header", "map-person-head", avatar, heading),
        facts,
        el("h3", "map-label", "Ruta"),
        stops,
      ),
    );
    const link = el(
      "a",
      "map-profile-link",
      "Ver perfil",
      icon("chevron-right"),
    );
    link.href = person.url;
    open(nodes, link);
    globe()?.follow(person);
  };

  const pick = (places: Place[]) => {
    picked = places;
    const sections = places
      .map((p) => list.querySelector<HTMLElement>(`#lugar-${CSS.escape(p.id)}`))
      .filter((s): s is HTMLElement => s !== null)
      .map((s) => {
        const copy = s.cloneNode(true) as HTMLElement;
        copy.removeAttribute("id");
        copy.className = "map-place";
        return copy;
      });
    open(sections);
    globe()?.select(places.map((p) => p.id));
  };

  return { pick, show };
}

async function start(root: HTMLElement): Promise<void> {
  const list = document.querySelector<HTMLElement>(".map-list")!;
  const canvas = root.querySelector("canvas")!;
  const places = (JSON.parse(params.places) as Place[]).sort(
    (a, b) => b.n - a.n,
  );
  const response = await fetch(params.land);
  if (!response.ok) throw new Error(`land.bin: ${response.status}`);
  const masks = readMasks(await response.arrayBuffer());
  const people = JSON.parse(params.people) as Person[];
  const bySlug = new Map(people.map((p) => [p.slug, p]));
  const byId = new Map(places.map((p) => [p.id, p]));
  let globe: Globe | undefined;
  const { pick, show } = panel(root, list, byId, bySlug, () => globe);
  root.hidden = false;
  globe = new Globe(canvas, masks, places, people, pick);
  // A profile's "Ver la ruta en el mapa" lands here with #ruta-<slug>.
  const route = () => {
    const slug = location.hash.match(/^#ruta-(.+)$/)?.[1];
    const person = slug && bySlug.get(decodeURIComponent(slug));
    if (!person) return;
    show(person);
    root.scrollIntoView({ block: "start" });
  };
  addEventListener("hashchange", route);
  route();
  const actions: Record<string, () => void> = {
    in: () => globe.zoomBy(2),
    out: () => globe.zoomBy(0.5),
    peru: () => globe.peru(),
    world: () => globe.world(),
  };
  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-map]")) {
    button.addEventListener("click", () => actions[button.dataset.map!]?.());
  }
}

const root = document.querySelector<HTMLElement>(".map");
// Without the land file the page keeps its list, which holds the same data.
if (root) start(root).catch((error: unknown) => console.error(error));
