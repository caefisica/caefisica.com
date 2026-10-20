/// <reference types="youtube" />

interface YouTubeWindow {
  onYouTubeIframeAPIReady?: () => void;
}

let player: YT.Player | null = null;
let apiReady: Promise<void> | null = null;

// YouTube solo se necesita al reproducir. La API se carga en el primer clic.
function loadApi(): Promise<void> {
  apiReady ??= new Promise((resolve) => {
    (window as YouTubeWindow).onYouTubeIframeAPIReady = resolve;
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.append(script);
  });
  return apiReady;
}

function init(): void {
  const playButton = document.querySelector<HTMLButtonElement>("#play-video");
  const closeButton =
    document.querySelector<HTMLButtonElement>("#close-button");
  if (!playButton || !closeButton) return;

  playButton.addEventListener("click", playVideo);
  closeButton.addEventListener("click", closeVideo);

  async function playVideo(): Promise<void> {
    const videoId = playButton!.getAttribute("data-video-id") ?? "";
    document.querySelector(".cover_play")?.classList.remove("d-none");
    document.querySelector(".player_container")?.classList.remove("d-none");
    document.querySelector("#close-button")?.classList.remove("d-none");

    await loadApi();
    player?.destroy();

    player = new YT.Player("player", {
      videoId,
      origin: window.location.origin,
      width: 900,
      height: 506,
      events: {},
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        fs: 0,
        iv_load_policy: 3,
      },
    } as YT.PlayerOptions);

    const iframe = document.querySelector<HTMLIFrameElement>("#player iframe");
    if (iframe) {
      iframe.setAttribute(
        "sandbox",
        "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation",
      );
    }

    const playerEl = document.querySelector<HTMLElement>("#player");
    if (playerEl) playerEl.style.display = "block";
  }

  function closeVideo(): void {
    player?.stopVideo();
    document.querySelector(".player_container")?.classList.add("d-none");
    document.querySelector(".cover_play")?.classList.add("d-none");
  }
}

document.addEventListener("DOMContentLoaded", init);
