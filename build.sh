#!/usr/bin/env bash
set -euo pipefail

main() {
  # La imagen de compilación puede proporcionar una versión distinta de mise y
  # variables MISE_*. Usa la versión instalada aquí y la configuración del repo.
  # shellcheck disable=SC2046
  unset $(compgen -v MISE_ || true)
  local mise_bin="${HOME}/.local/bin/mise"

  echo "==> Installing mise"
  curl -fsSL https://mise.run | MISE_INSTALL_PATH="${mise_bin}" sh
  "${mise_bin}" --version

  # El despliegue solo necesita Hugo. Omite las herramientas de desarrollo.
  export MISE_DISABLE_TOOLS="wrangler,go,go:github.com/gohugoio/gotmplfmt"

  echo "==> Installing tools"
  "${mise_bin}" trust
  "${mise_bin}" install

  # Hugo ejecuta postcss con el primer node del PATH, y la imagen de compilación
  # pone el suyo antes. mise respeta las entradas que ya encabezan el PATH, así
  # que se antepone una carpeta con el node de mise.
  local node_dir
  node_dir="$(mktemp -d)"
  ln -s "$("${mise_bin}" which node)" "${node_dir}/node"
  export PATH="${node_dir}:${PATH}"

  git config core.quotepath false
  if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
    echo "==> Fetching the full git history"
    git fetch --unshallow
  fi

  echo "==> Installing dependencies"
  "${mise_bin}" run install

  echo "==> Building"
  "${mise_bin}" run build
}

main
