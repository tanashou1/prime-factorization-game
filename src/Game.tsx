import { useState, useEffect, useCallback, useRef } from 'react';
import './Game.css';
import type { Tile, GameState, GameParams } from './types';
import { generateRandomTileValue, getEmptyPositions, checkPerfectPowerElimination, checkEqualValueElimination, isDivisor } from './gameLogic';
import { processChainReactions } from './chainReactionLogic';
import { createCleanTile } from './utils/tileHelpers';
import packageJson from '../package.json';

type Direction = 'up' | 'down' | 'left' | 'right';

const VERSION = packageJson.version;

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
  const isAnimatingRef = useRef(false); // Use ref to track animation state without causing re-renders

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
    // Clear any ongoing animations
    isAnimatingRef.current = false;
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
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

  // Move tiles in a direction
  const moveTiles = useCallback(async (direction: Direction, tileId?: number) => {
    // Prevent moves during animations (Issue #17)
    if (isAnimatingRef.current) return;
    
    isAnimatingRef.current = true; // Set animation flag at start
    
    try {
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
    let scoreGainedFromMoves = 0; // Track score from initial merges
    
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
          // First check for equal value elimination (includes perfect powers)
          if (checkEqualValueElimination(tile.value, occupant.value)) {
            // Both tiles disappear with special animation
            // Award score for both tiles (equal values)
            const mergedScore = tile.value + occupant.value;
            scoreGainedFromMoves += mergedScore;
            
            occupiedPositions.delete(posKey);
            path.push({row: nextRow, col: nextCol});
            
            // Track that these tiles merged (use original IDs)
            mergedTileIds.add(tile.id);
            mergedTileIds.add(occupant.id);
            
            // Check if they form a perfect power for animation purposes
            const powerType = checkPerfectPowerElimination(tile.value, occupant.value);
            
            // Add both disappearing tiles with appropriate animation
            movedTiles.push(createCleanTile(tile, {
              id: currentNextTileId++,
              value: 0,
              scoreValue: tile.value,
              row: nextRow,
              col: nextCol,
              isDisappearing: true,
              isPowerEliminating: powerType !== null,
              powerType: powerType || undefined,
              mergeHighlight: true, // Highlight merge (Issue #22)
            }));
            movedTiles.push(createCleanTile(occupant, {
              id: currentNextTileId++,
              value: 0,
              scoreValue: occupant.value,
              row: nextRow,
              col: nextCol,
              isDisappearing: true,
              isPowerEliminating: powerType !== null,
              powerType: powerType || undefined,
              mergeHighlight: true, // Highlight merge (Issue #22)
            }));
            
            moved = true;
            break;
          }
          
          // Check if they can merge normally
          // Skip if values are equal (handled by perfect power elimination above)
          if (tile.value !== occupant.value && isDivisor(tile.value, occupant.value)) {
            // Merge: tile divides into occupant
            const newValue = occupant.value / tile.value;
            // Score calculation: Use the larger number instead of the product
            // This prevents score inflation and makes gameplay more balanced
            const mergedScore = Math.max(tile.value, occupant.value);
            
            // Award score for this merge
            scoreGainedFromMoves += mergedScore;
            
            occupiedPositions.delete(posKey);
            path.push({row: nextRow, col: nextCol});
            
            // Track that these tiles merged (use original IDs)
            mergedTileIds.add(tile.id);
            mergedTileIds.add(occupant.id);
            
            const mergedTileId = currentNextTileId++;
            
            if (newValue === 1) {
              // Tile disappears, add score - mark with isDisappearing
              movedTiles.push(createCleanTile(tile, {
                id: mergedTileId, // Assign unique ID to merged tile
                value: 0, // Mark for removal
                scoreValue: mergedScore,
                row: nextRow,
                col: nextCol,
                isDividing: true, // Mark for division effect
                isDisappearing: true, // Mark for disappear animation
                mergeHighlight: true, // Highlight merge (Issue #22)
              }));
            } else {
              const mergedTile = createCleanTile(occupant, {
                id: mergedTileId, // Assign unique ID to merged tile
                value: newValue,
                scoreValue: mergedScore,
                row: nextRow,
                col: nextCol,
                isDividing: true, // Mark for division effect
                mergeHighlight: true, // Highlight merge (Issue #22)
              });
              movedTiles.push(mergedTile);
              occupiedPositions.set(posKey, mergedTile);
            }
            
            // Store path for the new merged tile ID
            if (path.length > 1) {
              tileMovementPaths.set(mergedTileId, path);
            }
            
            moved = true;
            break;
          } else if (tile.value !== occupant.value && isDivisor(occupant.value, tile.value)) {
            // Merge: occupant divides into tile
            const newValue = tile.value / occupant.value;
            // Score calculation: Use the larger number instead of the product
            // This prevents score inflation and makes gameplay more balanced
            const mergedScore = Math.max(tile.value, occupant.value);
            
            // Award score for this merge
            scoreGainedFromMoves += mergedScore;
            
            occupiedPositions.delete(posKey);
            path.push({row: nextRow, col: nextCol});
            
            // Track that these tiles merged (use original IDs)
            mergedTileIds.add(tile.id);
            mergedTileIds.add(occupant.id);
            
            const mergedTileId = currentNextTileId++;
            
            if (newValue === 1) {
              // Mark for removal and disappear animation
              movedTiles.push(createCleanTile(tile, {
                id: mergedTileId, // Assign unique ID to merged tile
                value: 0,
                scoreValue: mergedScore,
                row: nextRow,
                col: nextCol,
                isDividing: true, // Mark for division effect
                isDisappearing: true, // Mark for disappear animation
                mergeHighlight: true, // Highlight merge (Issue #22)
              }));
            } else {
              const mergedTile = createCleanTile(tile, {
                id: mergedTileId, // Assign unique ID to merged tile
                value: newValue,
                scoreValue: mergedScore,
                row: nextRow,
                col: nextCol,
                isDividing: true, // Mark for division effect
                mergeHighlight: true, // Highlight merge (Issue #22)
              });
              movedTiles.push(mergedTile);
              occupiedPositions.set(posKey, mergedTile);
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
      
      // Only add tile to movedTiles if it hasn't been merged
      if (!mergedTileIds.has(tile.id)) {
        const posKey = `${newRow},${newCol}`;
        if (!occupiedPositions.has(posKey)) {
          const finalTile = createCleanTile(tile, {
            row: newRow,
            col: newCol,
            isMoving: true,
          });
          movedTiles.push(finalTile);
          occupiedPositions.set(posKey, finalTile);
        }
      }
      
      // Store the path for this tile
      if (path.length > 1) {
        tileMovementPaths.set(tile.id, path);
      }
    }
    
    // Include non-moving tiles (both for single tile and all tiles movement)
    const movedTileIds = new Set(movedTiles.map(t => t.id));
    if (tileId !== undefined) {
      // Single tile movement: exclude only the moved tile
      movedTiles.push(...newTiles.filter(t => t.id !== tileId && !movedTileIds.has(t.id) && !mergedTileIds.has(t.id)));
    } else {
      // All tiles movement: include all tiles that didn't move or merge
      movedTiles.push(...newTiles.filter(t => !movedTileIds.has(t.id) && !mergedTileIds.has(t.id)));
    }
    
    if (!moved) {
      isAnimatingRef.current = false; // Clear animation flag if no move
      return;
    }
    
    // Animate tiles through intermediate positions
    const pathLengths = Array.from(tileMovementPaths.values()).map(p => p.length);
    const maxPathLength = pathLengths.length > 0 ? Math.max(...pathLengths) : 0;
    
    for (let step = 1; step < maxPathLength; step++) {
      const intermediateState = movedTiles.map(tile => {
        const path = tileMovementPaths.get(tile.id);
        if (path && step < path.length) {
          return createCleanTile(tile, {
            row: path[step].row,
            col: path[step].col,
            isMoving: true,
          });
        }
        return tile;
      });
      
      // Include non-moving tiles (both for single tile and all tiles movement)
      const movedTileIds = new Set(movedTiles.map(t => t.id));
      if (tileId !== undefined) {
        // Single tile movement: exclude only the moved tile
        intermediateState.push(...newTiles.filter(t => t.id !== tileId && !movedTileIds.has(t.id) && !mergedTileIds.has(t.id)));
      } else {
        // All tiles movement: include all non-moved tiles
        intermediateState.push(...newTiles.filter(t => !movedTileIds.has(t.id) && !mergedTileIds.has(t.id)));
      }
      
      setGameState(prev => ({
        ...prev,
        tiles: intermediateState,
      }));
      
      // Wait for step animation (100ms per step for smoother, more visible movement)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Use the score accumulated from initial moves
    // Score is now awarded for every merge, not just when tiles disappear
    let scoreGained = scoreGainedFromMoves;
    
    // Still track disappearing tiles for animation purposes
    const disappearingTiles = movedTiles.filter(t => t.value === 0);
    
    const newMoveCount = moveCount + 1;
    
    // Issue #35: First show highlighting phase for tiles that will interact
    // Identify tiles that have interaction flags (mergeHighlight, isPowerEliminating, etc.)
    const tilesWithInteraction = movedTiles.filter(t => 
      t.mergeHighlight || t.isPowerEliminating || t.isDividing || t.isDisappearing
    );
    
    if (tilesWithInteraction.length > 0) {
      // Show highlighting phase (without other effects yet)
      const highlightedTiles = movedTiles.map(t => {
        if (t.mergeHighlight || t.isPowerEliminating || t.isDividing || t.isDisappearing) {
          return {
            ...t,
            isHighlighting: true,
            // Temporarily remove effect flags during highlighting
            isDividing: false,
            isDisappearing: false,
            isPowerEliminating: false,
            mergeHighlight: false,
          };
        }
        return t;
      });
      
      setGameState({
        tiles: highlightedTiles,
        score: score, // Don't add score yet
        moveCount: newMoveCount,
      });
      
      // Wait for highlighting animation to complete (400ms)
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    // Show the final move result with actual effects
    setGameState({
      tiles: movedTiles,
      score: score + scoreGained,
      moveCount: newMoveCount,
    });
    
    // Wait for final position CSS transition to complete (150ms)
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Process chain reactions after initial merges
    const activeTiles = movedTiles.filter(t => t.value !== 0);
    // Initial chain multiplier is 1 (will increase with each chain iteration)
    const chainResult = processChainReactions(activeTiles, 1, currentNextTileId);
    
    // Update currentNextTileId from chain reactions
    currentNextTileId = chainResult.nextTileId;
    
    scoreGained += chainResult.scoreGained;
    
    // Animate chain reaction steps if any chains occurred
    if (chainResult.chainCount > 0) {
      for (let i = 0; i < chainResult.chainSteps.length; i++) {
        const stepTiles = chainResult.chainSteps[i];
        
        // Issue #35: First show highlighting phase for tiles that will interact
        const tilesWithInteraction = stepTiles.filter(t => 
          t.mergeHighlight || t.isDisappearing || t.isPowerEliminating || t.isDividing
        );
        
        if (tilesWithInteraction.length > 0) {
          // Show highlighting phase
          const highlightedTiles = stepTiles.map(t => {
            if (t.mergeHighlight || t.isDisappearing || t.isPowerEliminating || t.isDividing) {
              return {
                ...t,
                isHighlighting: true,
                // Temporarily remove effect flags during highlighting
                isDisappearing: false,
                isPowerEliminating: false,
                isDividing: false,
                mergeHighlight: false,
              };
            }
            return t;
          });
          
          setGameState(prevState => ({
            ...prevState,
            tiles: highlightedTiles,
            // Don't update score during animation, only at the end
            moveCount: newMoveCount,
          }));
          
          // Wait for highlighting animation to complete (400ms)
          await new Promise(resolve => setTimeout(resolve, 400));
        }
        
        // Show the chain step with effects
        setGameState(prevState => ({
          ...prevState,
          tiles: stepTiles,
          // Don't update score during animation, only at the end
          moveCount: newMoveCount,
        }));
        
        // Wait for chain animation to complete (800ms)
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    // After chain reactions complete, filter out disappearing tiles
    let finalTiles = chainResult.tiles;
    
    // Add new tile if needed
    const hasDisappearing = disappearingTiles.length > 0 || chainResult.scoreGained > 0;
    if (newMoveCount % params.k === 0 || hasDisappearing) {
      const newTileResult = addNewTile(finalTiles, currentNextTileId);
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
    });
    
    // Clear animation flags after a short delay
    animationTimeoutRef.current = setTimeout(() => {
      setGameState(prevState => {
        // Clear animation flags and ensure no zero-value tiles remain
        const clearedTiles = prevState.tiles
          .filter(t => t.value !== 0)
          .map(t => ({
            id: t.id,
            value: t.value,
            row: t.row,
            col: t.col,
            // Remove all animation-related properties
          }));
        
        return {
          ...prevState,
          tiles: clearedTiles,
        };
      });
      
      // Clear animation flag after all animations complete
      isAnimatingRef.current = false;
    }, 1300); // Wait for all animations to complete (longest is 1.2s)
    } catch (error) {
      // On error, immediately clear the animation flag to prevent the game from becoming unresponsive
      console.error('Error in moveTiles:', error);
      isAnimatingRef.current = false;
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    }
  }, [gameState, params, addNewTile, nextTileId]);

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
      const touch = touchEvent.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      
      // Check if touch started within board bounds (Issue #17)
      const board = boardRef.current;
      if (board) {
        const rect = board.getBoundingClientRect();
        const relX = touch.clientX - rect.left;
        const relY = touch.clientY - rect.top;
        
        // Only process if touch starts within board
        if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
          // Determine which tile was touched
          const touchedTile = getTileAtPosition(touchStartX, touchStartY);
          touchedTileId = touchedTile?.id;
        } else {
          // Touch started outside board, ignore
          touchedTileId = undefined;
        }
      }
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

  // Manual tile generation (Issue #17)
  const handleGenerateTile = () => {
    // Don't generate during animations
    if (isAnimatingRef.current) return;
    
    const result = addNewTile(gameState.tiles, nextTileId);
    if (result.tiles.length > gameState.tiles.length) {
      // Set animation flag to prevent multiple clicks during animation
      isAnimatingRef.current = true;
      
      // Clear any pending animation timeouts
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      
      setGameState(prev => ({
        ...prev,
        tiles: result.tiles,
      }));
      setNextTileId(result.nextId);
      
      // Clear animation flags after the appear animation completes
      animationTimeoutRef.current = setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          tiles: prevState.tiles.map(t => ({
            ...t,
            isNew: false,
          })),
        }));
        
        // Clear animation flag
        isAnimatingRef.current = false;
      }, 250); // Appear animation is 0.2s, add small buffer
    }
  };

  return (
    <div className="game">
      <h1>素因数分解ゲーム <span className="version">v{VERSION}</span></h1>
      
      <div className="game-info">
        <div className="score">Score: {gameState.score}</div>
        <div className="moves">Moves: {gameState.moveCount}</div>
      </div>
      
      <div className="board" ref={boardRef} style={{
        gridTemplateColumns: `repeat(${params.n}, 1fr)`,
        gridTemplateRows: `repeat(${params.n}, 1fr)`,
      }}>
        {gameState.tiles.map(tile => {
          const tileClasses = ['tile'];
          if (tile.isNew) tileClasses.push('tile-new');
          if (tile.isMoving) tileClasses.push('tile-moving');
          if (tile.isDividing) tileClasses.push('tile-dividing');
          if (tile.isChaining) tileClasses.push('tile-chaining');
          if (tile.isDisappearing) tileClasses.push('tile-disappearing');
          if (tile.isPowerEliminating) tileClasses.push('tile-power-eliminating');
          if (tile.powerType === 'square') tileClasses.push('tile-power-square');
          if (tile.powerType === 'cube') tileClasses.push('tile-power-cube');
          if (tile.mergeHighlight) tileClasses.push('tile-merge-highlight');
          if (tile.isHighlighting) tileClasses.push('tile-highlighting');

          return (
            <div
              key={tile.id}
              className={tileClasses.join(' ')}
              style={{
                gridColumn: tile.col + 1,
                gridRow: tile.row + 1,
              }}
            >
              {/* Show empty string for disappearing tiles (value 0) during animation */}
              {tile.value || ''}
            </div>
          );
        })}
        {gameState.chainCount !== undefined && gameState.chainCount > 0 && gameState.chainPosition && (
          <div 
            className="chain-counter"
            style={{
              gridColumn: Math.floor(gameState.chainPosition.col) + 1,
              gridRow: Math.floor(gameState.chainPosition.row) + 1,
            }}
          >
            {gameState.chainCount}連鎖!
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <button onClick={handleGenerateTile} className="generate-tile-button">タイル生成</button>
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
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
          <button onClick={handleReset}>リセット</button>
        </div>
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
