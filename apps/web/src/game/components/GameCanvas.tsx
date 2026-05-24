import React, { useEffect, useRef, useState } from 'react';
import { GameStatus, Player, Obstacle } from '../types/game.types';
import { useKeyboardControls } from '../hooks/useKeyboardControls';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: (finalScore: number) => void;
  onScoreUpdate: (currentScore: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ status, onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  // High-performance mutable values for the animation frame loop
  const gameStateRef = useRef<{
    status: GameStatus;
    score: number;
    gameSpeed: number;
    player: Player;
    obstacles: Obstacle[];
    lastObstacleSpawn: number;
    gridOffset: number;
  }>({
    status: 'idle',
    score: 0,
    gameSpeed: 6,
    player: {
      y: 0, // 0 is ground level (measured upwards from floor)
      vy: 0,
      width: 32,
      height: 44,
      action: 'none'
    },
    obstacles: [],
    lastObstacleSpawn: 0,
    gridOffset: 0
  });

  // Keep state sync for keyboard hooks
  const [isControlsActive, setIsControlsActive] = useState(false);

  // Physics constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 280;
  const FLOOR_Y = 220; // Y pixel position of the ground line
  const GRAVITY = 0.6;
  const JUMP_FORCE = -11.5;
  const INITIAL_SPEED = 6;
  const MAX_SPEED = 14;
  const SPEED_ACCEL = 0.0005; // speed up rate per frame
  const OBSTACLE_SPAWN_MIN = 80; // min frames between obstacles
  const OBSTACLE_SPAWN_VAR = 120; // spawn variation frames

  // Initialize and Reset Game
  const resetGame = () => {
    gameStateRef.current = {
      status: 'running',
      score: 0,
      gameSpeed: INITIAL_SPEED,
      player: {
        y: 0,
        vy: 0,
        width: 32,
        height: 44,
        action: 'none'
      },
      obstacles: [],
      lastObstacleSpawn: 0,
      gridOffset: 0
    };
    onScoreUpdate(0);
  };

  // Keyboard actions
  const handleJump = () => {
    const { player } = gameStateRef.current;
    if (player.y === 0) { // Can only jump from the ground
      player.vy = JUMP_FORCE;
      player.action = 'jumping';
    }
  };

  useKeyboardControls(
    {
      onJump: handleJump,
      onStart: () => {} // Managed by parent but hooks enter cleanly
    },
    isControlsActive
  );

  useEffect(() => {
    setIsControlsActive(status === 'running');
    if (status === 'running') {
      resetGame();
    }
  }, [status]);

  // Main Canvas Render and Game Update Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set resolution adjustments for Retina/High-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    const updatePhysicsAndDraw = () => {
      const state = gameStateRef.current;

      // 1. CLEAR CANVAS
      ctx.fillStyle = '#0f1720'; // Deep Space Blue background
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Distant geometric planet in background (low-poly desaturated)
      ctx.strokeStyle = 'rgba(143, 175, 199, 0.1)';
      ctx.fillStyle = 'rgba(143, 175, 199, 0.02)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Octagonal geometric planet outline (Low-Poly style!)
      const planetX = CANVAS_WIDTH - 160;
      const planetY = 65;
      const planetR = 30;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const px = planetX + planetR * Math.cos(angle);
        const py = planetY + planetR * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Slanted planet orbit line
      ctx.strokeStyle = 'rgba(143, 175, 199, 0.05)';
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH - 220, 85);
      ctx.lineTo(CANVAS_WIDTH - 100, 45);
      ctx.stroke();

      // Draw subtle low-poly stars
      ctx.fillStyle = 'rgba(143, 175, 199, 0.35)';
      const starPositions = [
        { x: 80, y: 25 }, { x: 210, y: 45 }, { x: 360, y: 20 },
        { x: 490, y: 55 }, { x: 630, y: 35 }, { x: 740, y: 25 }
      ];
      starPositions.forEach(p => {
        // Draw tiny diamond stars
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 2);
        ctx.lineTo(p.x + 2, p.y);
        ctx.lineTo(p.x, p.y + 2);
        ctx.lineTo(p.x - 2, p.y);
        ctx.closePath();
        ctx.fill();
      });

      // Horizon jagged low-poly mountains
      ctx.strokeStyle = 'rgba(143, 175, 199, 0.06)';
      ctx.fillStyle = 'rgba(143, 175, 199, 0.01)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, FLOOR_Y);
      ctx.lineTo(80, FLOOR_Y - 25);
      ctx.lineTo(150, FLOOR_Y - 12);
      ctx.lineTo(240, FLOOR_Y - 35);
      ctx.lineTo(310, FLOOR_Y - 18);
      ctx.lineTo(400, FLOOR_Y - 30);
      ctx.lineTo(520, FLOOR_Y - 8);
      ctx.lineTo(600, FLOOR_Y - 40);
      ctx.lineTo(690, FLOOR_Y - 18);
      ctx.lineTo(800, FLOOR_Y);
      ctx.stroke();

      // 2. RENDER TERRAIN GROUND
      ctx.strokeStyle = '#8fafc7'; // Desaturated space blue ground horizon line
      ctx.lineWidth = 2;
      
      // Ground horizon line
      ctx.beginPath();
      ctx.moveTo(0, FLOOR_Y);
      ctx.lineTo(CANVAS_WIDTH, FLOOR_Y);
      ctx.stroke();

      // Scrolling grid lines beneath floor (low-poly style)
      if (status === 'running') {
        state.gridOffset = (state.gridOffset - state.gameSpeed) % 40;
      }
      ctx.strokeStyle = 'rgba(143, 175, 199, 0.08)';
      ctx.lineWidth = 1;
      for (let x = state.gridOffset; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, FLOOR_Y);
        // Perspective slant lines
        ctx.lineTo(x - 50, CANVAS_HEIGHT);
        ctx.stroke();
      }

      // Horizontal lines that compress towards horizon
      for (let y = FLOOR_Y; y < CANVAS_HEIGHT; y += 12) {
        const opacity = (y - FLOOR_Y) / (CANVAS_HEIGHT - FLOOR_Y) * 0.15;
        ctx.strokeStyle = `rgba(143, 175, 199, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // 3. GAME PLAY LOGIC
      if (status === 'running') {
        // Accelerate speed gradually
        state.gameSpeed = Math.min(state.gameSpeed + SPEED_ACCEL, MAX_SPEED);

        // Player physics
        const { player } = state;
        player.vy += GRAVITY;
        player.y -= player.vy;

        // Ground collision check
        if (player.y <= 0) {
          player.y = 0;
          player.vy = 0;
          player.action = 'none';
        }

        // Increment Score
        state.score += 1;
        if (state.score % 6 === 0) {
          onScoreUpdate(Math.floor(state.score / 6));
        }

        // Spawn obstacles
        const framesSinceLastSpawn = state.score - state.lastObstacleSpawn;
        const randomThreshold = OBSTACLE_SPAWN_MIN + Math.random() * OBSTACLE_SPAWN_VAR;
        
        if (framesSinceLastSpawn > randomThreshold || state.obstacles.length === 0) {
          const height = 24 + Math.random() * 28; // cactus size variation
          const width = 16 + Math.random() * 12;
          
          state.obstacles.push({
            x: CANVAS_WIDTH + 50,
            y: FLOOR_Y - height,
            width,
            height,
            speed: state.gameSpeed,
            passed: false
          });
          state.lastObstacleSpawn = state.score;
        }

        // Update obstacles position and verify collision
        const playerScreenX = 100; // Dino X offset on screen
        const playerScreenY = FLOOR_Y - player.y - player.height;

        state.obstacles = state.obstacles.filter(obstacle => {
          // Move left
          obstacle.x -= state.gameSpeed;

          // AABB Collision Detection with small inset tolerance padding for fair game feel
          const tolerance = 4;
          const isColliding = 
            playerScreenX + tolerance < obstacle.x + obstacle.width &&
            playerScreenX + player.width - tolerance > obstacle.x &&
            playerScreenY + tolerance < obstacle.y + obstacle.height &&
            playerScreenY + player.height - tolerance > obstacle.y;

          if (isColliding) {
            onGameOver(Math.floor(state.score / 6));
            return false;
          }

          // Filter out offscreen obstacles
          return obstacle.x + obstacle.width > 0;
        });
      }

      // 4. DRAW DINO ASTRONAUT (Player Character)
      const playerX = 100;
      const playerY = FLOOR_Y - state.player.y - state.player.height;

      // Draw Dino outline using space explorer low-poly design
      ctx.strokeStyle = '#8fafc7';
      ctx.fillStyle = '#253140';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      // Faceted body outline matching exact 32x44 size
      ctx.moveTo(playerX + 10, playerY); // Head top-left
      ctx.lineTo(playerX + 28, playerY); // Head top-right
      ctx.lineTo(playerX + 28, playerY + 12); // Snout
      ctx.lineTo(playerX + 22, playerY + 12); // Mouth inner
      ctx.lineTo(playerX + 22, playerY + 16); // Jaw
      ctx.lineTo(playerX + 16, playerY + 16); // Neck right
      ctx.lineTo(playerX + 16, playerY + 28); // Body back right
      ctx.lineTo(playerX + 6, playerY + 28); // Body floor back
      ctx.lineTo(playerX + 4, playerY + 20); // Tail bottom
      ctx.lineTo(playerX, playerY + 12); // Tail tip
      ctx.lineTo(playerX + 4, playerY + 12); // Tail top
      ctx.lineTo(playerX + 8, playerY + 16); // Back top
      ctx.lineTo(playerX + 10, playerY + 12); // Neck back left
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Astronaut helmet gold visor facets (Desaturated Orange!)
      ctx.fillStyle = '#d9a066';
      ctx.strokeStyle = '#e4ae77';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playerX + 17, playerY + 2.5);
      ctx.lineTo(playerX + 26, playerY + 2.5);
      ctx.lineTo(playerX + 26, playerY + 9);
      ctx.lineTo(playerX + 20, playerY + 9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Helmet visor shine facet
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(playerX + 22, playerY + 4);
      ctx.lineTo(playerX + 25, playerY + 4);
      ctx.lineTo(playerX + 24, playerY + 6);
      ctx.closePath();
      ctx.fill();

      // Space Suit detail lines
      ctx.strokeStyle = 'rgba(143, 175, 199, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(playerX + 10, playerY + 16);
      ctx.lineTo(playerX + 16, playerY + 20);
      ctx.stroke();

      // Legs (simple clean astronaut boots)
      ctx.strokeStyle = '#8fafc7';
      ctx.lineWidth = 2.5;

      const legOffset = status === 'running' ? Math.sin(state.score * 0.25) * 8 : 0;

      // Leg 1 (with small boot facet)
      ctx.beginPath();
      ctx.moveTo(playerX + 10, playerY + 28);
      ctx.lineTo(playerX + 10 - (legOffset > 0 ? 4 : -4), playerY + 38);
      ctx.stroke();

      // Leg 2 (with small boot facet)
      ctx.beginPath();
      ctx.moveTo(playerX + 16, playerY + 28);
      ctx.lineTo(playerX + 16 + (legOffset > 0 ? 4 : -4), playerY + 38);
      ctx.stroke();

      // 5. DRAW OBSTACLES (Faceted low-poly moon rocks)
      state.obstacles.forEach(obstacle => {
        ctx.strokeStyle = '#8fafc7';
        ctx.fillStyle = '#253140';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';

        ctx.beginPath();
        // Low-poly faceted rock contour
        ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height / 3);
        ctx.lineTo(obstacle.x + obstacle.width * 0.85, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width * 0.15, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x, obstacle.y + obstacle.height / 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Internal low-poly facets
        ctx.strokeStyle = 'rgba(143, 175, 199, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height / 3);
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height / 3);
        ctx.stroke();

        // Crystal minerals core inside rock (space coral orange highlight)
        ctx.fillStyle = 'rgba(217, 160, 102, 0.35)';
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 3);
        ctx.lineTo(obstacle.x + obstacle.width * 0.65, obstacle.y + obstacle.height / 2);
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height * 0.7);
        ctx.lineTo(obstacle.x + obstacle.width * 0.35, obstacle.y + obstacle.height / 2);
        ctx.closePath();
        ctx.fill();
      });

      // 6. DRAW WATERMARK/IDLE OVERLAYS
      if (status === 'idle') {
        ctx.fillStyle = 'rgba(8, 12, 16, 0.75)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#f3f4f6';
        ctx.font = 'bold 15px var(--font-sans)';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS [ ENTER ] OR CLICK START TO BEGIN MISSION', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px var(--font-sans)';
        ctx.fillText('Avoid space hazard debris by jumping with [ SPACE ] or [ ↑ ]', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      }

      requestRef.current = requestAnimationFrame(updatePhysicsAndDraw);
    };

    requestRef.current = requestAnimationFrame(updatePhysicsAndDraw);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [status]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas 
        ref={canvasRef} 
        style={{
          border: '2px solid rgba(143, 175, 199, 0.15)',
          borderRadius: '12px',
          backgroundColor: '#0f1720',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
        }}
        data-testid="game-canvas"
      />
    </div>
  );
};
export default GameCanvas;
