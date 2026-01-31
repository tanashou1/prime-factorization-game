export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  scoreValue?: number; // Track original product for scoring when tile becomes 1
}

export interface GameState {
  tiles: Tile[];
  score: number;
  moveCount: number;
}

export interface GameParams {
  n: number; // board size (n x n)
  m: number; // initial number of tiles
  k: number; // moves before new tile appears
  p: number; // max prime for tile generation
}
