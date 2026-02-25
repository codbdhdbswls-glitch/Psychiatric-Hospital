import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { PATIENTS, CharacterId } from '../data/gameData';

// Map configuration
const TILE_SIZE = 48;
const MAP_WIDTH = 12;
const MAP_HEIGHT = 10;

interface Position {
  x: number;
  y: number;
}

interface MapProps {
  floor: number;
  playerPosition: Position;
  setPlayerPosition: (pos: Position) => void;
  onInteract: (targetId: CharacterId | 'elevator' | 'stairs_up' | 'stairs_down' | null) => void;
  isDialogActive: boolean;
}

// Helper to check collision
const isWalkable = (x: number, y: number, floor: number) => {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
  
  // Outer Walls
  if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
    // Elevator Entrance
    if (y === 0 && x === 5) return true; 
    return false;
  }

  // Floor 6: Isolation (Single Corridor + Central Monitoring)
  if (floor === 6) {
      // Central Monitoring Room in the middle (x=5,6 y=4,5) - Blocked
      if ((x === 5 || x === 6) && (y === 4 || y === 5)) return false;
      
      // Isolation Cells (Left and Right extremes)
      // Walls for cells
      if (x === 3 || x === 8) {
          // Doors at y=5
          if (y === 5) return true;
          return false;
      }
      return true;
  }

  // Floor 5: High Risk (Individual Rooms)
  if (floor === 5) {
      // Central corridor with rooms on sides
      // Walls at x=3 and x=8
      if (x === 3 || x === 8) {
          // Doors at y=3, y=6, y=8
          if (y === 3 || y === 6 || y === 8) return true;
          return false;
      }
      return true;
  }

  // Default Layout (Floors 1-4)
  // Internal Walls (Simple Layout)
  // Room dividers at x=3 and x=8 for y > 2
  if ((x === 3 || x === 8) && y > 2) {
      // Doorways
      if (y === 5 || y === 8) return true;
      return false;
  }

  return true;
};

export const Map: React.FC<MapProps> = ({ floor, playerPosition, setPlayerPosition, onInteract, isDialogActive, chaseMode, chaserPosition, chaserId }) => {
  // Define NPCs for current floor and sort by ID for deterministic positions
  const npcs = Object.values(PATIENTS)
    .filter(p => p.floor === floor)
    .sort((a, b) => a.id.localeCompare(b.id));

  // Elevator position
  const elevatorPos = { x: 5, y: 0 };
  
  // Calculate NPC positions deterministically based on floor layout
  const getNpcPosition = (index: number, floor: number) => {
      if (floor === 6) {
          // Sebastian in deep isolation (Right cell)
          return { x: 10, y: 5 };
      }
      if (floor === 5) {
          // Adrian (Left Room Top), Victor (Right Room Top)
          if (index === 0) return { x: 1, y: 3 }; 
          if (index === 1) return { x: 10, y: 3 };
          return { x: 1, y: 8 };
      }
      
      // Default distribution
      if (index === 0) return { x: 2, y: 4 }; // Left Room
      if (index === 1) return { x: 9, y: 4 }; // Right Room
      if (index === 2) return { x: 2, y: 8 }; // Left Room Bottom
      return { x: 9, y: 8 }; // Right Room Bottom
  };

  const npcPositions = npcs.map((npc, index) => {
    let pos = getNpcPosition(index, floor);
    
    // Override for Chaser
    if (chaseMode && chaserPosition && chaserId === npc.id) {
        pos = chaserPosition;
    }

    return {
        id: npc.id,
        ...pos,
        color: chaseMode && chaserId === npc.id ? '#ef4444' : npc.color, // Red if chasing
        name: npc.name
    };
  });

  // Environment Objects
  const getEnvironmentObjects = (floor: number) => {
      const objects = [];
      if (floor === 1) {
          objects.push({ id: 'reception', x: 6, y: 4, label: 'DESK', solid: true, color: 'bg-stone-600' });
          objects.push({ id: 'plant', x: 1, y: 1, label: 'TREE', solid: true, color: 'bg-green-900' });
          objects.push({ id: 'plant', x: 10, y: 1, label: 'TREE', solid: true, color: 'bg-green-900' });
      }
      if (floor === 2) {
          objects.push({ id: 'lockers', x: 2, y: 3, label: 'LCKR', solid: true, color: 'bg-zinc-700' });
          objects.push({ id: 'lockers', x: 3, y: 3, label: 'LCKR', solid: true, color: 'bg-zinc-700' });
          objects.push({ id: 'files', x: 9, y: 3, label: 'FILE', solid: true, color: 'bg-yellow-900' });
      }
      if (floor >= 3 && floor <= 5) {
          // Beds in rooms
          objects.push({ id: 'bed', x: 1, y: 4, label: 'BED', solid: true, color: 'bg-white/20' });
          objects.push({ id: 'bed', x: 1, y: 8, label: 'BED', solid: true, color: 'bg-white/20' });
          objects.push({ id: 'bed', x: 10, y: 4, label: 'BED', solid: true, color: 'bg-white/20' });
          objects.push({ id: 'bed', x: 10, y: 8, label: 'BED', solid: true, color: 'bg-white/20' });
      }
      if (floor === 6) {
          // Monitoring console
          objects.push({ id: 'monitor_console', x: 5, y: 4, label: 'CAM', solid: true, color: 'bg-red-950' });
          objects.push({ id: 'monitor_console', x: 6, y: 4, label: 'CAM', solid: true, color: 'bg-red-950' });
      }
      return objects;
  };

  const envObjects = getEnvironmentObjects(floor);

  // Pathfinding State
  const [movePath, setMovePath] = useState<Position[]>([]);
  const [pendingInteraction, setPendingInteraction] = useState<{id: string, x: number, y: number} | null>(null);

  // Helper: Check if a tile is valid for movement (walkable + no obstacles)
  const isValidMove = useCallback((x: number, y: number) => {
      // Check basic walkability (walls)
      if (!isWalkable(x, y, floor)) return false;

      // Check NPCs
      if (npcPositions.some(p => p.x === x && p.y === y)) return false;

      // Check Environment Objects
      if (envObjects.some(o => o.x === x && o.y === y && o.solid)) return false;

      return true;
  }, [floor, npcPositions, envObjects]);

  // BFS Pathfinding
  const findPath = useCallback((start: Position, end: Position): Position[] | null => {
      if (start.x === end.x && start.y === end.y) return [];
      if (!isValidMove(end.x, end.y)) return null;

      const queue: { pos: Position; path: Position[] }[] = [{ pos: start, path: [] }];
      const visited = new Set<string>();
      visited.add(`${start.x},${start.y}`);

      while (queue.length > 0) {
          const { pos, path } = queue.shift()!;

          if (pos.x === end.x && pos.y === end.y) {
              return path;
          }

          const neighbors = [
              { x: pos.x, y: pos.y - 1 },
              { x: pos.x, y: pos.y + 1 },
              { x: pos.x - 1, y: pos.y },
              { x: pos.x + 1, y: pos.y }
          ];

          for (const next of neighbors) {
              const key = `${next.x},${next.y}`;
              if (!visited.has(key) && isValidMove(next.x, next.y)) {
                  visited.add(key);
                  queue.push({ pos: next, path: [...path, next] });
              }
          }
      }
      return null;
  }, [isValidMove]);

  // Handle Tile Click
  const handleTileClick = (targetX: number, targetY: number) => {
      if (isDialogActive) return;

      // Clear previous pending interaction
      setPendingInteraction(null);

      // If clicked on player, do nothing (maybe interact with floor?)
      if (targetX === playerPosition.x && targetY === playerPosition.y) {
          onInteract('floor');
          return;
      }

      // Check if target is interactable (NPC, EnvObj, Elevator, or Wall)
      const targetNPC = npcPositions.find(p => p.x === targetX && p.y === targetY);
      const targetObj = envObjects.find(o => o.x === targetX && o.y === targetY);
      const isElevator = targetX === elevatorPos.x && targetY === elevatorPos.y;
      const isWall = !isWalkable(targetX, targetY, floor);

      // If interactable, find path to adjacent tile
      if (targetNPC || targetObj || isElevator || isWall) {
          let targetId = targetNPC?.id || targetObj?.id || (isElevator ? 'elevator' : null);
          if (isWall) targetId = 'wall';

          if (targetId) {
               setPendingInteraction({ id: targetId as string, x: targetX, y: targetY });
          }

          // Find closest adjacent walkable tile
          const neighbors = [
              { x: targetX, y: targetY - 1 },
              { x: targetX, y: targetY + 1 },
              { x: targetX - 1, y: targetY },
              { x: targetX + 1, y: targetY }
          ];
          
          let bestPath: Position[] | null = null;

          for (const adj of neighbors) {
              if (isValidMove(adj.x, adj.y) || (adj.x === playerPosition.x && adj.y === playerPosition.y)) {
                  const path = findPath(playerPosition, adj);
                  if (path && (!bestPath || path.length < bestPath.length)) {
                      bestPath = path;
                  }
              }
          }

          if (bestPath) {
              setMovePath(bestPath);
          }
          return;
      }

      // If empty tile, find path directly
      const path = findPath(playerPosition, { x: targetX, y: targetY });
      if (path) {
          setMovePath(path);
      }
  };

  // Process Movement Queue
  useEffect(() => {
      if (movePath.length === 0) {
          if (pendingInteraction) {
              // Check if adjacent or on top
              const dist = Math.abs(playerPosition.x - pendingInteraction.x) + Math.abs(playerPosition.y - pendingInteraction.y);
              if (dist <= 1) {
                  onInteract(pendingInteraction.id as any);
                  // Face the target
                  const dx = pendingInteraction.x - playerPosition.x;
                  const dy = pendingInteraction.y - playerPosition.y;
                  if (dx !== 0 || dy !== 0) setFacing({ x: dx, y: dy });
              }
              setPendingInteraction(null);
          }
          return;
      }

      const timer = setTimeout(() => {
          const nextPos = movePath[0];
          setPlayerPosition(nextPos);
          setMovePath(prev => prev.slice(1));
          
          // Update facing direction
          const dx = nextPos.x - playerPosition.x;
          const dy = nextPos.y - playerPosition.y;
          if (dx !== 0 || dy !== 0) {
              setFacing({ x: dx, y: dy });
          }

      }, 200); // Movement speed

      return () => clearTimeout(timer);
  }, [movePath, playerPosition, setPlayerPosition, pendingInteraction, onInteract]);

  // Cancel path on key press
  useEffect(() => {
    const cancelPath = () => {
        setMovePath([]);
        setPendingInteraction(null);
    };
    window.addEventListener('keydown', cancelPath);
    return () => window.removeEventListener('keydown', cancelPath);
  }, []);

  const [facing, setFacing] = useState({ x: 0, y: 1 });

  useEffect(() => {
    const handleInput = (e: KeyboardEvent) => {
      if (isDialogActive) return;

      // Movement Keys
      if (['ArrowUp', 'w', 'W', 'ArrowDown', 's', 'S', 'ArrowLeft', 'a', 'A', 'ArrowRight', 'd', 'D'].includes(e.key)) {
          e.preventDefault(); // Prevent scrolling
          let dx = 0;
          let dy = 0;
          
          if (['ArrowUp', 'w', 'W'].includes(e.key)) dy = -1;
          else if (['ArrowDown', 's', 'S'].includes(e.key)) dy = 1;
          else if (['ArrowLeft', 'a', 'A'].includes(e.key)) dx = -1;
          else if (['ArrowRight', 'd', 'D'].includes(e.key)) dx = 1;

          setFacing({ x: dx, y: dy });

          const newX = playerPosition.x + dx;
          const newY = playerPosition.y + dy;

          // Use isValidMove for consistent collision logic
          if (isValidMove(newX, newY)) {
              setPlayerPosition({ x: newX, y: newY });
          }
          return;
      }

      // Interaction Keys
      if (e.key === ' ' || e.key === 'Enter') {
        const targetX = playerPosition.x + facing.x;
        const targetY = playerPosition.y + facing.y;

        // 1. Check NPCs at target
        const targetNPC = npcPositions.find(p => p.x === targetX && p.y === targetY);
        if (targetNPC) {
            onInteract(targetNPC.id);
            return;
        }

        // 2. Check Environment Objects at target
        const targetObj = envObjects.find(o => o.x === targetX && o.y === targetY);
        if (targetObj) {
            onInteract(targetObj.id as any);
            return;
        }

        // 3. Check Elevator (Special Case: can interact if standing on it OR facing it)
        // Standing on it
        if (playerPosition.x === elevatorPos.x && playerPosition.y === elevatorPos.y) {
             onInteract('elevator');
             return;
        }
        // Facing it
        if (targetX === elevatorPos.x && targetY === elevatorPos.y) {
             onInteract('elevator');
             return;
        }

        // 4. Generic Tile Interaction (Walls, Floor, etc.)
        // Re-use isWalkable logic to determine if it's a wall
        if (!isWalkable(targetX, targetY, floor)) {
            // It's a wall or void
            onInteract('wall');
        } else {
            // It's a walkable floor
            onInteract('floor');
        }
      }
    };

    window.addEventListener('keydown', handleInput);
    return () => window.removeEventListener('keydown', handleInput);
  }, [playerPosition, facing, isDialogActive, floor, npcPositions, envObjects, setPlayerPosition, onInteract]);

  // Removed separate handleKeyDown and handleInteract useEffects

  // Render Grid
  const renderTile = (x: number, y: number) => {
    const isOuterWall = x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1;
    
    let isInnerWall = false;
    
    if (floor === 6) {
        // Central block
        if ((x === 5 || x === 6) && (y === 4 || y === 5)) isInnerWall = true;
        // Cell walls
        if ((x === 3 || x === 8) && y !== 5) isInnerWall = true;
    } else if (floor === 5) {
        // Room dividers
        if ((x === 3 || x === 8) && !(y === 3 || y === 6 || y === 8)) isInnerWall = true;
    } else {
        // Default
        if (((x === 3 || x === 8) && y > 2) && !(y === 5 || y === 8)) isInnerWall = true;
    }

    const isWall = isOuterWall || isInnerWall;
    
    const isElevator = x === elevatorPos.x && y === elevatorPos.y;
    
    // Determine floor style based on level
    let floorColor = 'bg-stone-800'; // Default dark
    if (floor <= 2) floorColor = 'bg-slate-700'; // Lobby
    if (floor >= 3 && floor <= 4) floorColor = 'bg-stone-400'; // Bright Ward
    if (floor >= 5) floorColor = 'bg-neutral-900'; // Dark Ward

    // Wall color
    const wallColor = floor >= 5 ? 'bg-neutral-800 border-neutral-950' : 'bg-stone-300 border-stone-400';
    const outerWallColor = 'bg-black';

    let tileClass = `w-full h-full border-[1px] border-black/5 ${floorColor}`;
    
    if (isOuterWall) tileClass = `${outerWallColor} border-none`;
    if (isInnerWall) tileClass = `${wallColor} border-b-4`;
    if (isElevator) tileClass = 'bg-zinc-600 border-4 border-zinc-400 flex items-center justify-center cursor-pointer hover:bg-zinc-500';

    // Special rendering for Floor 6 Monitoring Room
    if (floor === 6 && (x === 5 || x === 6) && (y === 4 || y === 5)) {
        tileClass = 'bg-red-950 border border-red-900 flex items-center justify-center';
    }

    // NPC Rendering
    const npc = npcPositions.find(p => p.x === x && p.y === y);
    
    // Environment Object Rendering
    const envObj = envObjects.find(o => o.x === x && o.y === y);
    if (envObj) {
        tileClass = `${envObj.color} border-black/20 flex items-center justify-center`;
    }

    return (
      <div 
        key={`${x}-${y}`} 
        className={`relative ${!isDialogActive ? 'cursor-pointer hover:brightness-110' : ''}`}
        style={{ width: TILE_SIZE, height: TILE_SIZE }}
        onClick={() => handleTileClick(x, y)}
      >
        <div className={tileClass}>
            {isElevator && <span className="text-[10px] text-white font-bold">ELEV</span>}
            {envObj && <span className="text-[8px] text-white/70 font-bold">{envObj.label}</span>}
        </div>
        
        {/* Player */}
        {x === playerPosition.x && y === playerPosition.y && (
          <motion.div 
            layoutId="player"
            className="absolute inset-1 bg-blue-600 rounded-sm shadow-lg z-20 border border-blue-400"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="w-full h-full flex items-center justify-center text-[8px] text-white font-bold">YOU</div>
          </motion.div>
        )}

        {/* NPC */}
        {npc && (
          <div 
            className="absolute inset-1 rounded-sm shadow-md z-10 flex items-center justify-center border border-black/20"
            style={{ backgroundColor: npc.color }}
          >
             <div className="text-[8px] text-black font-bold truncate px-1">{npc.name.split(' ')[0]}</div>
          </div>
        )}
      </div>
    );
  };

  // Flashlight / Darkness Effect
  const isDarkFloor = floor >= 5;
  
  return (
    <div className="relative bg-black p-4 rounded-lg shadow-2xl border-4 border-stone-800 overflow-hidden">
      <div 
        className="grid gap-0"
        style={{ 
            gridTemplateColumns: `repeat(${MAP_WIDTH}, ${TILE_SIZE}px)`,
            width: MAP_WIDTH * TILE_SIZE
        }}
      >
        {Array.from({ length: MAP_HEIGHT }).map((_, y) => (
          Array.from({ length: MAP_WIDTH }).map((_, x) => renderTile(x, y))
        ))}
      </div>
      
      {/* Darkness Overlay */}
      {isDarkFloor && (
        <div 
            className="absolute inset-0 pointer-events-none z-30 transition-all duration-500"
            style={{
                background: `radial-gradient(circle 200px at ${(playerPosition.x * TILE_SIZE) + (TILE_SIZE/2) + 16}px ${(playerPosition.y * TILE_SIZE) + (TILE_SIZE/2) + 16}px, rgba(255, 255, 220, 0.15) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,1) 100%)`
            }}
        />
      )}
      
      {/* Floor Indicator */}
      <button 
        onClick={() => onInteract('elevator')}
        className="absolute top-2 left-2 bg-black/80 text-white px-3 py-1 border border-white/20 z-40 hover:bg-red-900/50 cursor-pointer transition-colors"
      >
        {floor}F
      </button>
    </div>
  );
};
