/// <reference types="youtube" />

interface YouTubeWindow {
  onYouTubeIframeAPIReady?: () => void;
}

// The player methods exist only after `onReady`; until then the iframe is loading.
let player: YT.Player | null = null;
let ready = false;
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
  const dialog = document.querySelector<HTMLDialogElement>("#video-dialog");
  if (!playButton || !dialog) return;

  playButton.addEventListener("click", playVideo);
  dialog.addEventListener("close", () => {
    if (ready) player?.pauseVideo();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  async function playVideo(): Promise<void> {
    const videoId = playButton!.getAttribute("data-video-id") ?? "";
    dialog!.showModal();

    await loadApi();
    // The dialog may have closed while the API loaded: nothing must play behind it.
    if (!dialog!.open) return;
    if (player) {
      if (ready) player.playVideo();
      return;
    }

    player = new YT.Player("player", {
      videoId,
      origin: window.location.origin,
      width: 900,
      height: 506,
      events: {
        onReady: (event) => {
          ready = true;
          // `autoplay` starts the video; undo it when the dialog closed before the player was ready.
          if (!dialog!.open) event.target.pauseVideo();
        },
      },
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
  }
}

document.addEventListener("DOMContentLoaded", init);
