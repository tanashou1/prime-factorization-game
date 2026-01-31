import { useState, useEffect, useCallback, useRef } from 'react';
import './Game.css';
import type { Tile, GameState, GameParams } from './types';
import { generateRandomTileValue, isDivisor, getEmptyPositions, checkPerfectPowerElimination } from './gameLogic';

type Direction = 'up' | 'down' | 'left' | 'right';

const DEFAULT_PARAMS: GameParams = {
  n: 4,  // 4x4 board
  m: 2,  // start with 2 tiles
  k: 3,  // new tile every 3 moves
  p: 7,  // primes up to 7 (2, 3, 5, 7)
};

export default function Game() {
  const [params, setParams] = useState<GameParams>(DEFAULT_PARAMS);
  const [tempParams, setTempParams] = useState<GameParams>(DEFAULT_PARAMS);
  const [nextTileId, setNextTileId] = useState(DEFAULT_PARAMS.m); // Start with m tiles already created
  const boardRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<number | null>(null);
  const tilesRef = useRef<Tile[]>([]);

  // Initialize game state based on params
  const [gameState, setGameState] = useState<GameState>(() => {
    const tiles: Tile[] = [];
    const emptyPositions = getEmptyPositions([], DEFAULT_PARAMS.n);
    
    for (let i = 0; i < DEFAULT_PARAMS.m && emptyPositions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * emptyPositions.length);
      const pos = emptyPositions.splice(randomIndex, 1)[0];
      
      tiles.push({
        id: i,
        value: generateRandomTileValue(DEFAULT_PARAMS.p),
        row: pos.row,
        col: pos.col,
      });
    }
    
    return { tiles, score: 0, moveCount: 0 };
  });

  // Update tilesRef whenever gameState changes
  useEffect(() => {
    tilesRef.current = gameState.tiles;
  }, [gameState.tiles]);

  // Initialize game
  const initGame = useCallback(() => {
    const tiles: Tile[] = [];
    const emptyPositions = getEmptyPositions([], params.n);
    
    for (let i = 0; i < params.m && emptyPositions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * emptyPositions.length);
      const pos = emptyPositions.splice(randomIndex, 1)[0];
      
      tiles.push({
        id: i,
        value: generateRandomTileValue(params.p),
        row: pos.row,
        col: pos.col,
      });
    }
    
    setGameState({ tiles, score: 0, moveCount: 0 });
    setNextTileId(params.m);
  }, [params.n, params.m, params.p]);

  // Add a new tile
  const addNewTile = useCallback((tiles: Tile[], currentTileId: number) => {
    const emptyPositions = getEmptyPositions(tiles, params.n);
    
    if (emptyPositions.length === 0) return { tiles, nextId: currentTileId };
    
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    const pos = emptyPositions[randomIndex];
    
    const newTile: Tile = {
      id: currentTileId,
      value: generateRandomTileValue(params.p),
      row: pos.row,
      col: pos.col,
      isNew: true, // Mark as new for appear animation
    };
    
    return { tiles: [...tiles, newTile], nextId: currentTileId + 1 };
  }, [params.n, params.p]);

  // Process chain reactions - returns array of steps to animate
  const processChainReactions = useCallback((tiles: Tile[], chainMultiplier: number = 1, startTileId: number): { tiles: Tile[], scoreGained: number, chainCount: number, chainSteps: Tile[][], nextTileId: number } => {
    let currentTiles = [...tiles];
    let totalScoreGained = 0;
    let hasChanges = true;
    let chainCount = 0;
    const chainSteps: Tile[][] = []; // Store each step for animation
    let currentTileId = startTileId;
    
    while (hasChanges) {
      hasChanges = false;
      const newTiles: Tile[] = [];
      const processed = new Set<number>();
      
      for (let i = 0; i < currentTiles.length; i++) {
        if (processed.has(i)) continue;
        
        const tile = currentTiles[i];
        let merged = false;
        
        // Check adjacent tiles
        const adjacentDirections = [
          { dr: -1, dc: 0 },
          { dr: 1, dc: 0 },
          { dr: 0, dc: -1 },
          { dr: 0, dc: 1 },
        ];
        
        for (const { dr, dc } of adjacentDirections) {
          const adjRow = tile.row + dr;
          const adjCol = tile.col + dc;
          
          for (let j = 0; j < currentTiles.length; j++) {
            if (i === j || processed.has(j)) continue;
            
            const otherTile = currentTiles[j];
            if (otherTile.row === adjRow && otherTile.col === adjCol) {
              // First check for perfect power elimination (Issue #16)
              const powerType = checkPerfectPowerElimination(tile.value, otherTile.value);
              if (powerType !== null) {
                // Both tiles disappear with special animation
                const mergedScore = tile.value * 2; // Score both tiles
                const currentMultiplier = chainMultiplier * Math.pow(2, chainCount);
                totalScoreGained += mergedScore * currentMultiplier;
                
                chainCount++;
                
                // Mark both tiles as disappearing with power elimination animation
                newTiles.push({
                  ...tile,
                  id: currentTileId++,
                  value: 0,
                  scoreValue: tile.value,
                  isDisappearing: true,
                  isChaining: true,
                  isPowerEliminating: true,
                  powerType: powerType,
                });
                newTiles.push({
                  ...otherTile,
                  id: currentTileId++,
                  value: 0,
                  scoreValue: otherTile.value,
                  isDisappearing: true,
                  isChaining: true,
                  isPowerEliminating: true,
                  powerType: powerType,
                });
                
                processed.add(i);
                processed.add(j);
                merged = true;
                hasChanges = true;
                break;
              }
              
              // Check if they can merge normally
              let larger, smaller;
              if (tile.value > otherTile.value) {
                larger = tile;
                smaller = otherTile;
              } else {
                larger = otherTile;
                smaller = tile;
              }
              
              if (isDivisor(smaller.value, larger.value)) {
                const newValue = larger.value / smaller.value;
                // Score calculation: Use the larger number instead of the product
                // This prevents score inflation and makes gameplay more balanced
                // (e.g., 2 merging with 2 gives score of 2, not 4)
                const mergedScore = Math.max(larger.value, smaller.value);
                const currentMultiplier = chainMultiplier * Math.pow(2, chainCount);
                
                chainCount++;
                
                if (newValue === 1) {
                  totalScoreGained += mergedScore * currentMultiplier;
                  // Mark as disappearing instead of removing immediately
                  // Assign NEW unique ID to prevent duplicate key errors
                  newTiles.push({
                    ...larger,
                    id: currentTileId++, // Unique ID for merged tile
                    value: 0,
                    scoreValue: mergedScore,
                    isDisappearing: true,
                    isChaining: true,
                    isDividing: true, // Add division animation flag
                  });
                } else {
                  // Assign NEW unique ID to prevent duplicate key errors
                  newTiles.push({
                    ...larger,
                    id: currentTileId++, // Unique ID for merged tile
                    value: newValue,
                    scoreValue: mergedScore,
                    isChaining: true, // Mark as part of chain for animation
                    isDividing: true, // Add division animation flag
                  });
                }
                
                processed.add(i);
                processed.add(j);
                merged = true;
                hasChanges = true;
                break;
              }
            }
          }
          
          if (merged) break;
        }
        
        if (!merged && !processed.has(i)) {
          newTiles.push(tile);
        }
      }
      
      currentTiles = newTiles;
      
      // Store this step if changes occurred
      if (hasChanges) {
        // Filter out disappearing tiles (value 0) from chain steps for animation
        chainSteps.push(currentTiles.filter(t => t.value !== 0));
      }
    }
    
    // Filter out disappearing tiles (value 0) before returning
    const finalTiles = currentTiles.filter(t => t.value !== 0);
    
    // Return the next available tile ID
    return { tiles: finalTiles, scoreGained: totalScoreGained, chainCount, chainSteps, nextTileId: currentTileId };
  }, []);

  // Move tiles in a direction
  const moveTiles = useCallback(async (direction: Direction, tileId?: number) => {
    const { tiles: currentTiles, score, moveCount } = gameState;
    // Filter out any stale tiles (disappearing tiles with value 0, or tiles with animation flags that should be gone)
    const newTiles = [...currentTiles.filter(t => t.value !== 0 && !t.isDisappearing)];
    let moved = false;
    let currentNextTileId = nextTileId; // Local counter for new tile IDs
    
    // Clear any pending animation timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    // If tileId is specified, only move that tile
    const tilesToMove = tileId !== undefined 
      ? newTiles.filter(t => t.id === tileId)
      : newTiles;
    
    // Sort tiles based on direction
    const sorted = [...tilesToMove].sort((a, b) => {
      switch (direction) {
        case 'up': return a.row - b.row;
        case 'down': return b.row - a.row;
        case 'left': return a.col - b.col;
        case 'right': return b.col - a.col;
      }
    });
    
    const movedTiles: Tile[] = [];
    const occupiedPositions = new Map<string, Tile>();
    const mergedTileIds = new Set<number>(); // Track original IDs of tiles that merged
    
    // Mark non-moving tiles as occupied
    if (tileId !== undefined) {
      newTiles.filter(t => t.id !== tileId).forEach(t => {
        occupiedPositions.set(`${t.row},${t.col}`, t);
      });
    }
    
    // Calculate movement direction
    const dr = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
    const dc = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
    
    // Store intermediate positions for each tile
    const tileMovementPaths = new Map<number, Array<{row: number, col: number}>>();
    
    for (const tile of sorted) {
      // Skip tiles that have already been merged
      if (mergedTileIds.has(tile.id)) {
        continue;
      }
      
      let newRow = tile.row;
      let newCol = tile.col;
      const path: Array<{row: number, col: number}> = [{row: newRow, col: newCol}];
      
      // Move as far as possible
      while (true) {
        const nextRow = newRow + dr;
        const nextCol = newCol + dc;
        
        // Check boundaries
        if (nextRow < 0 || nextRow >= params.n || nextCol < 0 || nextCol >= params.n) {
          break;
        }
        
        const posKey = `${nextRow},${nextCol}`;
        const occupant = occupiedPositions.get(posKey);
        
        if (occupant) {
          // First check for perfect power elimination (Issue #16)
          const powerType = checkPerfectPowerElimination(tile.value, occupant.value);
          if (powerType !== null) {
            // Both tiles disappear with special animation
            
            occupiedPositions.delete(posKey);
            path.push({row: nextRow, col: nextCol});
            
            // Track that these tiles merged (use original IDs)
            mergedTileIds.add(tile.id);
            mergedTileIds.add(occupant.id);
            
            // Add both disappearing tiles with power elimination animation
            movedTiles.push({
              ...tile,
              id: currentNextTileId++,
              value: 0,
              scoreValue: tile.value,
              row: nextRow,
              col: nextCol,
              isDisappearing: true,
              isPowerEliminating: true,
              powerType: powerType,
            });
            movedTiles.push({
              ...occupant,
              id: currentNextTileId++,
              value: 0,
              scoreValue: occupant.value,
              row: nextRow,
              col: nextCol,
              isDisappearing: true,
              isPowerEliminating: true,
              powerType: powerType,
            });
            
            moved = true;
            break;
          }
          
          // Check if they can merge normally
          if (isDivisor(tile.value, occupant.value)) {
            // Merge: tile divides into occupant
            const newValue = occupant.value / tile.value;
            // Score calculation: Use the larger number instead of the product
            // This prevents score inflation and makes gameplay more balanced
            const mergedScore = Math.max(tile.value, occupant.value);
            
            occupiedPositions.delete(posKey);
            path.push({row: nextRow, col: nextCol});
            
            // Track that these tiles merged (use original IDs)
            mergedTileIds.add(tile.id);
            mergedTileIds.add(occupant.id);
            
            const mergedTileId = currentNextTileId++;
            
            if (newValue === 1) {
              // Tile disappears, add score - mark with isDisappearing
              movedTiles.push({
                ...tile,
                id: mergedTileId, // Assign unique ID to merged tile
                value: 0, // Mark for removal
                scoreValue: mergedScore,
                row: nextRow,
                col: nextCol,
                isDividing: true, // Mark for division effect
                isDisappearing: true, // Mark for disappear animation
              });
            } else {
              const mergedTile = {
                ...occupant,
                id: mergedTileId, // Assign unique ID to merged tile
                value: newValue,
                scoreValue: mergedScore,
                row: nextRow,
                col: nextCol,
                isDividing: true, // Mark for division effect
              };
              movedTiles.push(mergedTile);
              occupiedPositions.set(posKey, mergedTile);
            }
            
            // Store path for the new merged tile ID
            if (path.length > 1) {
              tileMovementPaths.set(mergedTileId, path);
            }
            
            moved = true;
            break;
          } else if (isDivisor(occupant.value, tile.value)) {
            // Merge: occupant divides into tile
            const newValue = tile.value / occupant.value;
            // Score calculation: Use the larger number instead of the product
            // This prevents score inflation and makes gameplay more balanced
            const mergedScore = Math.max(tile.value, occupant.value);
            
            occupiedPositions.delete(posKey);
            
            // Track that these tiles merged (use original IDs)
            mergedTileIds.add(tile.id);
            mergedTileIds.add(occupant.id);
            
            const mergedTileId = currentNextTileId++;
            
            if (newValue === 1) {
              // Mark for removal and disappear animation
              movedTiles.push({
                ...tile,
                id: mergedTileId, // Assign unique ID to merged tile
                value: 0,
                scoreValue: mergedScore,
                row: newRow,
                col: newCol,
                isDividing: true, // Mark for division effect
                isDisappearing: true, // Mark for disappear animation
              });
            } else {
              const mergedTile = {
                ...tile,
                id: mergedTileId, // Assign unique ID to merged tile
                value: newValue,
                scoreValue: mergedScore,
                row: newRow,
                col: newCol,
                isDividing: true, // Mark for division effect
              };
              movedTiles.push(mergedTile);
              occupiedPositions.set(`${newRow},${newCol}`, mergedTile);
            }
            
            // Store path for the new merged tile ID  
            if (path.length > 1) {
              tileMovementPaths.set(mergedTileId, path);
            }
            
            moved = true;
            break;
          } else {
            // Can't merge, stop here
            break;
          }
        }
        
        // Move to next position
        newRow = nextRow;
        newCol = nextCol;
        path.push({row: newRow, col: newCol});
      }
      
      // Place tile at final position if it hasn't merged
      if (newRow !== tile.row || newCol !== tile.col) {
        moved = true;
      }
      
      const posKey = `${newRow},${newCol}`;
      if (!occupiedPositions.has(posKey)) {
        const finalTile = { ...tile, row: newRow, col: newCol, isMoving: true };
        movedTiles.push(finalTile);
        occupiedPositions.set(posKey, finalTile);
      }
      
      // Store the path for this tile
      if (path.length > 1) {
        tileMovementPaths.set(tile.id, path);
      }
    }
    
    // Include non-moving tiles if we were only moving one tile
    if (tileId !== undefined) {
      const movedTileIds = new Set(movedTiles.map(t => t.id));
      // Exclude the moved tile, tiles with new IDs, and tiles that were merged
      movedTiles.push(...newTiles.filter(t => t.id !== tileId && !movedTileIds.has(t.id) && !mergedTileIds.has(t.id)));
    }
    
    if (!moved) return;
    
    // Animate tiles through intermediate positions
    const pathLengths = Array.from(tileMovementPaths.values()).map(p => p.length);
    const maxPathLength = pathLengths.length > 0 ? Math.max(...pathLengths) : 0;
    
    for (let step = 1; step < maxPathLength; step++) {
      const intermediateState = movedTiles.map(tile => {
        const path = tileMovementPaths.get(tile.id);
        if (path && step < path.length) {
          return { ...tile, row: path[step].row, col: path[step].col, isMoving: true };
        }
        return tile;
      });
      
      // Include non-moving tiles
      if (tileId !== undefined) {
        const movedTileIds = new Set(movedTiles.map(t => t.id));
        // Exclude tiles that were merged
        intermediateState.push(...newTiles.filter(t => t.id !== tileId && !movedTileIds.has(t.id) && !mergedTileIds.has(t.id)));
      }
      
      setGameState(prev => ({
        ...prev,
        tiles: intermediateState,
      }));
      
      // Wait for step animation (100ms per step for smoother, more visible movement)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Calculate score from disappearing tiles but KEEP them for animation
    const disappearingTiles = movedTiles.filter(t => t.value === 0);
    let scoreGained = disappearingTiles.reduce((sum, t) => sum + (t.scoreValue || 0), 0);
    
    const newMoveCount = moveCount + 1;
    
    // Show the final move result
    setGameState({
      tiles: movedTiles,
      score: score + scoreGained,
      moveCount: newMoveCount,
    });
    
    // Wait for final position CSS transition to complete (150ms)
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Now process chain reactions step by step
    const activeTiles = movedTiles.filter(t => t.value !== 0);
    const chainResult = processChainReactions(activeTiles, 1, currentNextTileId);
    
    // Update currentNextTileId from chain reactions
    currentNextTileId = chainResult.nextTileId;
    
    scoreGained += chainResult.scoreGained;
    
    // Animate each chain step
    for (let i = 0; i < chainResult.chainSteps.length; i++) {
      const stepTiles = chainResult.chainSteps[i];
      
      // Update state with this chain step, including disappearing tiles for visual feedback
      // Also display chain counter if this is a chain (more than 1 chain count)
      setGameState(prevState => ({
        ...prevState,
        tiles: [...disappearingTiles, ...stepTiles],
        score: score + scoreGained,
        chainCount: chainResult.chainCount > 0 ? chainResult.chainCount : undefined,
      }));
      
      // Wait for chain animation to complete (increased from 500ms to 800ms for better visibility)
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // After chains complete, remove disappearing tiles and add new tile if needed
    let finalTiles = chainResult.tiles;
    
    // Add new tile if needed
    const hasDisappearing = disappearingTiles.length > 0;
    if (newMoveCount % params.k === 0 || hasDisappearing) {
      const newTileResult = addNewTile(chainResult.tiles, currentNextTileId);
      finalTiles = newTileResult.tiles;
      currentNextTileId = newTileResult.nextId;
    }
    
    // Update nextTileId state after all operations
    setNextTileId(currentNextTileId);
    
    // Set final state with only active tiles (no disappearing tiles)
    setGameState({
      tiles: finalTiles,
      score: score + scoreGained,
      moveCount: newMoveCount,
      chainCount: undefined, // Clear chain counter
    });
    
    // Clear animation flags after a short delay
    animationTimeoutRef.current = window.setTimeout(() => {
      setGameState(prevState => {
        // Clear animation flags and ensure no zero-value tiles remain
        const clearedTiles = prevState.tiles
          .filter(t => t.value !== 0)
          .map(t => ({
            ...t,
            isMoving: false,
            isDividing: false,
            isChaining: false,
            isNew: false,
            isPowerEliminating: false,
            powerType: undefined,
          }));
        
        return {
          ...prevState,
          tiles: clearedTiles,
        };
      });
    }, 100); // Short delay to clear flags
  }, [gameState, params, addNewTile, processChainReactions, nextTileId]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveTiles('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveTiles('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveTiles('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveTiles('right');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveTiles]);

  // Handle touch input for swipe gestures
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let touchedTileId: number | undefined = undefined;
    
    const minSwipeDistance = 50; // Minimum distance for a swipe to be detected
    
    const getTileAtPosition = (x: number, y: number): Tile | undefined => {
      const board = boardRef.current;
      if (!board) return undefined;
      
      const rect = board.getBoundingClientRect();
      const relX = x - rect.left;
      const relY = y - rect.top;
      
      // Calculate which grid cell was touched
      const cellWidth = rect.width / params.n;
      const cellHeight = rect.height / params.n;
      const col = Math.floor(relX / cellWidth);
      const row = Math.floor(relY / cellHeight);
      
      // Find tile at this position using the ref to avoid dependency
      return tilesRef.current.find(t => t.row === row && t.col === col);
    };
    
    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      touchStartX = touchEvent.touches[0].clientX;
      touchStartY = touchEvent.touches[0].clientY;
      
      // Determine which tile was touched
      const touchedTile = getTileAtPosition(touchStartX, touchStartY);
      touchedTileId = touchedTile?.id;
    };
    
    const handleTouchMove = (e: Event) => {
      // Prevent default behavior to avoid page scrolling/refreshing
      e.preventDefault();
    };
    
    const handleTouchEnd = (e: Event) => {
      const touchEvent = e as TouchEvent;
      touchEndX = touchEvent.changedTouches[0].clientX;
      touchEndY = touchEvent.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Determine if this is a horizontal or vertical swipe
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      // Check if the swipe distance is sufficient
      if (Math.max(absX, absY) < minSwipeDistance) {
        return;
      }
      
      // Determine swipe direction based on the larger movement
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0) {
          moveTiles('right', touchedTileId);
        } else {
          moveTiles('left', touchedTileId);
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          moveTiles('down', touchedTileId);
        } else {
          moveTiles('up', touchedTileId);
        }
      }
    };
    
    const board = boardRef.current;
    if (board) {
      // Use passive: false for touchstart and touchmove to allow preventDefault()
      // This is necessary to prevent page scrolling/refreshing during swipe gestures
      board.addEventListener('touchstart', handleTouchStart, { passive: false });
      board.addEventListener('touchmove', handleTouchMove, { passive: false });
      board.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        board.removeEventListener('touchstart', handleTouchStart);
        board.removeEventListener('touchmove', handleTouchMove);
        board.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [moveTiles, params.n]);

  const handleReset = () => {
    setParams(tempParams);
    setTimeout(() => initGame(), 0);
  };

  return (
    <div className="game">
      <h1>素因数分解ゲーム</h1>
      
      <div className="game-info">
        <div className="score">Score: {gameState.score}</div>
        <div className="moves">Moves: {gameState.moveCount}</div>
      </div>
      
      <div className="board" ref={boardRef} style={{
        gridTemplateColumns: `repeat(${params.n}, 1fr)`,
        gridTemplateRows: `repeat(${params.n}, 1fr)`,
      }}>
        {gameState.tiles.map(tile => (
          <div
            key={tile.id}
            className={`tile ${tile.isNew ? 'tile-new' : ''} ${tile.isMoving ? 'tile-moving' : ''} ${tile.isDividing ? 'tile-dividing' : ''} ${tile.isChaining ? 'tile-chaining' : ''} ${tile.isDisappearing ? 'tile-disappearing' : ''} ${tile.isPowerEliminating ? 'tile-power-eliminating' : ''} ${tile.powerType === 'square' ? 'tile-power-square' : ''} ${tile.powerType === 'cube' ? 'tile-power-cube' : ''}`}
            style={{
              gridColumn: tile.col + 1,
              gridRow: tile.row + 1,
            }}
          >
            {/* Show empty string for disappearing tiles (value 0) during animation */}
            {tile.value || ''}
          </div>
        ))}
        {gameState.chainCount !== undefined && gameState.chainCount > 0 && (
          <div className="chain-counter">
            {gameState.chainCount}連鎖!
          </div>
        )}
      </div>
      
      <div className="controls">
        <h2>パラメータ設定</h2>
        <div className="param">
          <label>
            ボードサイズ (n): 
            <input
              type="number"
              min="3"
              max="8"
              value={tempParams.n}
              onChange={(e) => setTempParams({...tempParams, n: parseInt(e.target.value) || 3})}
            />
          </label>
        </div>
        <div className="param">
          <label>
            初期タイル数 (m): 
            <input
              type="number"
              min="1"
              max="10"
              value={tempParams.m}
              onChange={(e) => setTempParams({...tempParams, m: parseInt(e.target.value) || 1})}
            />
          </label>
        </div>
        <div className="param">
          <label>
            新タイル出現間隔 (k回): 
            <input
              type="number"
              min="1"
              max="10"
              value={tempParams.k}
              onChange={(e) => setTempParams({...tempParams, k: parseInt(e.target.value) || 1})}
            />
          </label>
        </div>
        <div className="param">
          <label>
            最大素数 (p): 
            <input
              type="number"
              min="2"
              max="19"
              value={tempParams.p}
              onChange={(e) => setTempParams({...tempParams, p: parseInt(e.target.value) || 2})}
            />
          </label>
        </div>
        <button onClick={handleReset}>リセット</button>
      </div>
      
      <div className="instructions">
        <h3>遊び方</h3>
        <p>矢印キーまたはスワイプでタイルを動かします。</p>
        <p>片方が片方の約数であれば合体して、割った数になります。</p>
        <p>タイルが1になると消えてスコアになります。</p>
      </div>
    </div>
  );
}
