{
  description = "A convenient bookmarklet";

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in
      {
        devShell.${system} = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodePackages.purescript-language-server
            nodePackages.purty
            purescript
            spago
          ];
        };
      };
}
