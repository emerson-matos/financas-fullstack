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
      nixpkgs,
      flake-utils,
      nix-direnv,
      ...
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
      in
      {
        devShells.default = pkgs.mkShell {
          name = "nextjs-supabase-dev";

          packages = with pkgs; [
            # --- Core ---
            nodejs
            bun
            yarn
            pnpm

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

            ## IA
            claude-code
            opencode
            antigravity-fhs
            google-chrome

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
