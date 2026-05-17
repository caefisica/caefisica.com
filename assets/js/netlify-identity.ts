const href = window.location.href;
if (href.includes("#invite_token") || href.includes("#access_token")) {
  const hash = href.split("#")[1];
  if (hash) {
    window.location.href = `/admin/#${hash}`;
  }
}
