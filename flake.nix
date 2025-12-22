{
  description = "Next.js + Supabase dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    flake-utils.url = "github:numtide/flake-utils";

    # Makes direnv + flakes smooth
    nix-direnv.url = "github:nix-community/nix-direnv";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      nix-direnv,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
          overlays = [
            nix-direnv.overlays.default
          ];
        };

        node = pkgs.nodejs_22;
      in
      {
        devShells.default = pkgs.mkShell {
          name = "nextjs-supabase-dev";

          packages = with pkgs; [
            # --- Core ---
            node
            bun
            yarn
            pnpm
            antigravity-fhs
            chromium

            # --- Supabase ---
            supabase-cli

            # --- TypeScript / JS tooling ---
            typescript-go
            # typescript-language-server
            vscode-langservers-extracted
            tailwindcss-language-server

            # --- Lint / Format helpers ---
            eslint
            biome
            prettier

            # --- Utilities ---
            jq
            ripgrep
            fd
            git
            gh
          ];

          # Environment variables
          shellHook = ''
            export PATH=$PWD/node_modules/.bin:$PATH

            echo "🚀 Next.js + Supabase dev shell ready"
            echo "Node: $(node --version)"
            echo "Supabase: $(supabase --version)"
          '';
        };
      }
    );
}
