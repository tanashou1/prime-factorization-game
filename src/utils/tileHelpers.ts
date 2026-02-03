/**
 * Tile Helper Utilities
 * 
 * This module provides utility functions for working with tiles,
 * ensuring clean state management across the application.
 */

import type { Tile } from '../types';

/**
 * Helper function to create a clean tile with only essential properties
 * This prevents hidden state from persisting across moves and chain reactions
 * 
 * @param source - The source tile to copy essential properties from
 * @param overrides - Properties to override or add to the new tile
 * @returns A new tile with only essential properties and specified overrides
 */
export function createCleanTile(source: Tile, overrides: Partial<Tile>): Tile {
  return {
    id: overrides.id ?? source.id,
    value: overrides.value ?? source.value,
    row: overrides.row ?? source.row,
    col: overrides.col ?? source.col,
    // Only include optional properties if explicitly provided in overrides
    ...(overrides.scoreValue !== undefined && { scoreValue: overrides.scoreValue }),
    ...(overrides.isMoving && { isMoving: overrides.isMoving }),
    ...(overrides.isDividing && { isDividing: overrides.isDividing }),
    ...(overrides.isChaining && { isChaining: overrides.isChaining }),
    ...(overrides.isNew && { isNew: overrides.isNew }),
    ...(overrides.isDisappearing && { isDisappearing: overrides.isDisappearing }),
    ...(overrides.isPowerEliminating && { isPowerEliminating: overrides.isPowerEliminating }),
    ...(overrides.powerType && { powerType: overrides.powerType }),
    ...(overrides.mergeHighlight && { mergeHighlight: overrides.mergeHighlight }),
    ...(overrides.isHighlighting && { isHighlighting: overrides.isHighlighting }),
  };
}
