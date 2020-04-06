let
  sources = import ./nix/sources.nix;
  easyPS = import sources.easy-purescript-nix {};
  pkgs = import sources.nixpkgs {};
in
pkgs.mkShell {
  buildInputs = [
    pkgs.hello
    easyPS.purs
    easyPS.spago
    easyPS.psc-package
    easyPS.purp
    easyPS.purty
  ];
}
