// Replaces the browser's controls on a talk's mp4 with the site's own: play,
// volume, a timeline with what is buffered and a time preview, speed, picture
// in picture and full screen. The controls hide after two idle seconds while
// the video plays. The video remembers where it stopped, so a two-hour talk
// resumes on the next visit. Without this script the browser's controls stay.

const IDLE_MS = 2000;
// A position this close to either end is not worth resuming.
const RESUME_MARGIN = 30;
const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];

const ICONS = {
  play: '<path d="M4 2.5v11l9-5.5z"/>',
  pause: '<path d="M4 2h3v12H4zm5 0h3v12H9z"/>',
  sound:
    '<path d="M2 6h3l4-3.5v11L5 10H2z"/><path d="M11 5a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  muted:
    '<path d="M2 6h3l4-3.5v11L5 10H2z"/><path d="m11 6 4 4m0-4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  pip: '<path d="M1.5 3h13v10h-13z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 8h5v4H8z"/>',
  full: '<path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" fill="none" stroke="currentColor" stroke-width="1.5"/>',
};

function icon(name: keyof typeof ICONS): string {
  return `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}

function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}

// Storage can be blocked or full; the player works without it.
function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function save(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

function button(cls: string, label: string, html: string): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `video-button ${cls}`;
  b.setAttribute("aria-label", label);
  b.innerHTML = html;
  return b;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = cls;
  return e;
}

// A pointer drag along a track: reports the fraction under the pointer while
// the button is down, and on hover when `hover` is given.
function track(
  area: HTMLElement,
  vertical: boolean,
  set: (fraction: number) => void,
  hover?: (fraction: number | null) => void,
): void {
  const at = (e: PointerEvent) => {
    const r = area.getBoundingClientRect();
    const f = vertical
      ? (r.bottom - e.clientY) / r.height
      : (e.clientX - r.left) / r.width;
    return Math.min(1, Math.max(0, f));
  };
  area.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    area.setPointerCapture(e.pointerId);
    area.dataset.state = "interacting";
    set(at(e));
  });
  area.addEventListener("pointermove", (e) => {
    if (area.hasPointerCapture(e.pointerId)) set(at(e));
    hover?.(at(e));
  });
  area.addEventListener("pointerleave", () => hover?.(null));
  const end = () => delete area.dataset.state;
  area.addEventListener("pointerup", end);
  area.addEventListener("pointercancel", end);
}

function enhance(root: HTMLElement, video: HTMLVideoElement): void {
  const key = `video:${root.dataset.key}`;
  video.controls = false;
  root.tabIndex = 0;
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", video.getAttribute("aria-label") ?? "Video");
  root.dataset.status = "ready";

  const start = el("button", "video-start");
  start.type = "button";
  const overlay = el("div", "video-overlay");
  const controls = el("div", "video-controls");

  const play = button("video-play", "Reproducir", icon("play"));
  const sound = el("div", "video-sound");
  const mute = button("video-mute", "Silenciar", icon("sound"));
  const volumeBox = el("div", "video-volume");
  const volume = el("div", "video-volume-track");
  const volumeFill = el("div", "video-volume-fill");
  volume.tabIndex = 0;
  volume.setAttribute("role", "slider");
  volume.setAttribute("aria-label", "Volumen");
  volume.setAttribute("aria-orientation", "vertical");
  volume.setAttribute("aria-valuemin", "0");
  volume.setAttribute("aria-valuemax", "100");
  volume.append(volumeFill);
  volumeBox.append(volume);
  sound.append(mute, volumeBox);

  const timeline = el("div", "video-timeline");
  const elapsed = el("span", "video-time");
  const remaining = el("span", "video-time");
  const progress = el("div", "video-progress");
  const mask = el("div", "video-progress-mask");
  const buffered = el("div", "video-buffered");
  const played = el("div", "video-played");
  const previewLine = el("div", "video-preview-line");
  const previewTime = el("div", "video-preview-time");
  progress.tabIndex = 0;
  progress.setAttribute("role", "slider");
  progress.setAttribute("aria-label", "Posición");
  mask.append(buffered, played);
  progress.append(mask, previewLine, previewTime);
  timeline.append(elapsed, progress, remaining);

  const rate = el("select", "video-rate");
  rate.setAttribute("aria-label", "Velocidad");
  for (const r of RATES) rate.add(new Option(`${r}×`, String(r)));
  const savedRate = Number(load("video:rate"));
  video.playbackRate = RATES.includes(savedRate) ? savedRate : 1;
  rate.value = String(video.playbackRate);

  const pip = button("video-pip", "Imagen en imagen", icon("pip"));
  const full = button("video-full", "Pantalla completa", icon("full"));

  controls.append(play, sound, timeline, rate);
  if (document.pictureInPictureEnabled) controls.append(pip);
  if (document.fullscreenEnabled) controls.append(full);
  root.append(overlay, start, controls);

  const resume = Number(load(key)) || 0;
  const startLabel = () => {
    const d = video.duration;
    start.innerHTML = `${icon("play")}<span>${
      resume ? `Continuar desde ${clock(resume)}` : "Reproducir"
    }${d ? ` · ${clock(d)}` : ""}</span>`;
  };
  startLabel();

  const toggle = () => (video.paused ? video.play() : video.pause());

  let idleTimer = 0;
  const wake = () => {
    delete root.dataset.idle;
    clearTimeout(idleTimer);
    if (!video.paused)
      idleTimer = window.setTimeout(() => (root.dataset.idle = ""), IDLE_MS);
  };

  const seek = (t: number) => {
    if (!video.duration) return;
    video.currentTime = Math.min(video.duration, Math.max(0, t));
    wake();
  };

  const drawTime = () => {
    const d = video.duration || 0;
    const t = video.currentTime;
    elapsed.textContent = clock(t);
    remaining.textContent = `−${clock(d - t)}`;
    played.style.width = d ? `${(t / d) * 100}%` : "0";
    progress.setAttribute("aria-valuemax", String(Math.floor(d)));
    progress.setAttribute("aria-valuenow", String(Math.floor(t)));
    progress.setAttribute("aria-valuetext", `${clock(t)} de ${clock(d)}`);
  };

  const drawBuffer = () => {
    const d = video.duration;
    const b = video.buffered;
    if (!d || !b.length) return;
    // The range that holds the playhead is the one the viewer cares about.
    let i = b.length - 1;
    for (let j = 0; j < b.length; j++)
      if (b.start(j) <= video.currentTime && video.currentTime <= b.end(j))
        i = j;
    buffered.style.left = `${(b.start(i) / d) * 100}%`;
    buffered.style.width = `${((b.end(i) - b.start(i)) / d) * 100}%`;
  };

  const drawVolume = () => {
    const v = video.muted ? 0 : video.volume;
    volumeFill.style.height = `${v * 100}%`;
    volume.setAttribute("aria-valuenow", String(Math.round(v * 100)));
    mute.innerHTML = icon(v ? "sound" : "muted");
    mute.setAttribute("aria-label", v ? "Silenciar" : "Activar sonido");
  };

  const setVolume = (v: number) => {
    video.volume = Math.min(1, Math.max(0, v));
    video.muted = video.volume === 0;
  };

  const remember = () => {
    const t = video.currentTime;
    const d = video.duration;
    const keep = t > RESUME_MARGIN && d && t < d - RESUME_MARGIN;
    save(key, keep ? String(Math.floor(t)) : null);
  };

  video.addEventListener("loadedmetadata", () => {
    if (resume && resume < video.duration - RESUME_MARGIN)
      video.currentTime = resume;
    startLabel();
    drawTime();
  });
  video.addEventListener("play", () => {
    root.dataset.status = "playing";
    play.innerHTML = icon("pause");
    play.setAttribute("aria-label", "Pausar");
    wake();
  });
  video.addEventListener("pause", () => {
    root.dataset.status = "paused";
    play.innerHTML = icon("play");
    play.setAttribute("aria-label", "Reproducir");
    remember();
    wake();
  });
  video.addEventListener("ended", () => save(key, null));
  video.addEventListener("timeupdate", drawTime);
  video.addEventListener("progress", drawBuffer);
  video.addEventListener("volumechange", drawVolume);
  video.addEventListener("click", toggle);
  video.addEventListener("dblclick", () => full.click());

  let lastSave = 0;
  video.addEventListener("timeupdate", () => {
    if (Math.abs(video.currentTime - lastSave) < 5) return;
    lastSave = video.currentTime;
    remember();
  });

  start.addEventListener("click", () => {
    video.play();
    root.focus({ preventScroll: true });
  });
  play.addEventListener("click", toggle);
  mute.addEventListener("click", () => {
    if (video.muted || video.volume === 0) {
      video.muted = false;
      if (video.volume === 0) video.volume = 1;
    } else video.muted = true;
  });
  rate.addEventListener("change", () => {
    video.playbackRate = Number(rate.value);
    save("video:rate", rate.value);
  });
  pip.addEventListener("click", () =>
    document.pictureInPictureElement
      ? document.exitPictureInPicture()
      : video.requestPictureInPicture(),
  );
  full.addEventListener("click", () =>
    document.fullscreenElement
      ? document.exitFullscreen()
      : root.requestFullscreen(),
  );

  track(volume, true, setVolume);
  track(
    progress,
    false,
    (f) => seek(f * video.duration),
    (f) => {
      if (f === null || !video.duration) return;
      previewLine.style.left = previewTime.style.left = `${f * 100}%`;
      previewTime.innerHTML = `<b>${clock(f * video.duration)}</b> / ${clock(video.duration)}`;
    },
  );

  volume.addEventListener("keydown", (e) => {
    const step = {
      ArrowUp: 0.1,
      ArrowRight: 0.1,
      ArrowDown: -0.1,
      ArrowLeft: -0.1,
    }[e.key];
    if (step !== undefined) setVolume(video.volume + step);
    else if (e.key === "Home") setVolume(0);
    else if (e.key === "End") setVolume(1);
    else return;
    e.preventDefault();
    e.stopPropagation();
  });
  progress.addEventListener("keydown", (e) => {
    if (e.key === "Home") seek(0);
    else if (e.key === "End") seek(video.duration);
    else return;
    e.preventDefault();
  });

  // Keys act while focus is anywhere in the player, except in the speed menu.
  root.addEventListener("keydown", (e) => {
    if (e.target === rate || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") {
      if (e.target instanceof HTMLButtonElement && k === " ") return;
      toggle();
    } else if (k === "m") mute.click();
    else if (k === "f") full.click();
    else if (k === "p" && document.pictureInPictureEnabled) pip.click();
    else if (k === "arrowleft") seek(video.currentTime - 5);
    else if (k === "arrowright") seek(video.currentTime + 5);
    else if (k === "j") seek(video.currentTime - 10);
    else if (k === "l") seek(video.currentTime + 10);
    else if (/^[0-9]$/.test(k)) seek((Number(k) / 10) * video.duration);
    else return;
    e.preventDefault();
    wake();
  });
  root.addEventListener("pointermove", wake);
  root.addEventListener("focusin", wake);
  window.addEventListener("pagehide", remember);

  drawTime();
  drawVolume();
}

for (const root of document.querySelectorAll<HTMLElement>(".video[data-key]")) {
  const video = root.querySelector("video");
  if (video) enhance(root, video);
}
