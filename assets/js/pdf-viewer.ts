import params from "@params";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

type PdfLib = typeof import("pdfjs-dist");

// pdf.js is about 400 kB, so it loads only when the first document opens.
let library: Promise<PdfLib> | undefined;

function loadLibrary(): Promise<PdfLib> {
  library ??= import(params.lib).then((lib: PdfLib) => {
    lib.GlobalWorkerOptions.workerSrc = params.worker;
    return lib;
  });
  return library;
}

class Viewer {
  private readonly stage: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly status: HTMLElement;
  private readonly count: HTMLElement;
  private readonly prev: HTMLButtonElement;
  private readonly next: HTMLButtonElement;
  private loading?: Promise<void>;
  private document?: PDFDocumentProxy;
  private task?: RenderTask;
  private drawing: Promise<void> = Promise.resolve();
  private generation = 0;
  private pageNumber = 1;
  private width = 0;

  constructor(private readonly root: HTMLElement) {
    this.stage = root.querySelector(".doc-stage")!;
    this.canvas = this.stage.querySelector("canvas")!;
    this.status = root.querySelector(".doc-status")!;
    this.count = root.querySelector("[data-pdf-count]")!;
    this.prev = root.querySelector("[data-pdf-prev]")!;
    this.next = root.querySelector("[data-pdf-next]")!;
    this.prev.addEventListener("click", () => this.go(this.pageNumber - 1));
    this.next.addEventListener("click", () => this.go(this.pageNumber + 1));
    new ResizeObserver(() => {
      if (this.document && Math.abs(this.stage.clientWidth - this.width) > 1) {
        void this.render();
      }
    }).observe(this.stage);
  }

  load(): Promise<void> {
    this.loading ??= this.open();
    return this.loading;
  }

  private async open(): Promise<void> {
    try {
      const lib = await loadLibrary();
      this.document = await lib.getDocument({ url: this.root.dataset.pdf! })
        .promise;
      await this.render();
      this.root.dataset.state = "ready";
    } catch {
      this.root.dataset.state = "error";
      this.status.textContent =
        "No se pudo mostrar el documento. Descárgalo o ábrelo en otra pestaña.";
    }
  }

  private go(pageNumber: number): void {
    if (!this.document) return;
    if (pageNumber < 1 || pageNumber > this.document.numPages) return;
    this.pageNumber = pageNumber;
    void this.render();
  }

  // pdf.js refuses a second render into a busy canvas, so draws run one at a time and a newer
  // request cancels the running one and skips the ones queued before it.
  private render(): Promise<void> {
    const generation = ++this.generation;
    this.task?.cancel();
    const drawn = this.drawing.then(() => {
      if (generation === this.generation) return this.draw();
    });
    this.drawing = drawn.catch(() => undefined);
    return drawn;
  }

  // The canvas holds the page at the stage's width times the pixel ratio, so text stays sharp.
  private async draw(): Promise<void> {
    const document = this.document!;
    const page = await document.getPage(this.pageNumber);
    this.width = this.stage.clientWidth;
    const scale =
      (this.width / page.getViewport({ scale: 1 }).width) * devicePixelRatio;
    const viewport = page.getViewport({ scale });

    this.canvas.width = Math.floor(viewport.width);
    this.canvas.height = Math.floor(viewport.height);
    this.task = page.render({ canvas: this.canvas, viewport });

    const total = document.numPages;
    this.count.textContent = `Página ${this.pageNumber} de ${total}`;
    this.prev.disabled = this.pageNumber <= 1;
    this.next.disabled = this.pageNumber >= total;

    try {
      await this.task.promise;
    } catch (error) {
      if ((error as Error).name !== "RenderingCancelledException") throw error;
    }
  }
}

// An open viewer loads when it nears the screen. A closed one loads on its first "Ver".
const nearScreen = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      nearScreen.unobserve(entry.target);
      viewers.get(entry.target)?.load();
    }
  },
  { rootMargin: "50% 0px" },
);

const viewers = new WeakMap<Element, Viewer>();

for (const root of document.querySelectorAll<HTMLElement>("[data-pdf]")) {
  const viewer = new Viewer(root);
  viewers.set(root, viewer);
  const toggle = root.querySelector("[data-toggle]");
  if (toggle)
    toggle.addEventListener("click", () => void viewer.load(), { once: true });
  else nearScreen.observe(root);
}
