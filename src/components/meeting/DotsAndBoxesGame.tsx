
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, RotateCcw, Users, Timer, Gamepad2, Crown, 
  Zap, Target, Star, Volume2, VolumeX 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  avatar?: string;
}

interface GameState {
  gridSize: number;
  lines: Set<string>;
  completedSquares: Map<string, string>;
  currentPlayerIndex: number;
  players: Player[];
  gameStarted: boolean;
  gameEnded: boolean;
  timeLeft: number;
  spectators: string[];
}

interface DotsAndBoxesGameProps {
  meetingId: string;
  isVisible: boolean;
  waitingForApproval?: boolean;
}

const playerColors = [
  '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', 
  '#F59E0B', '#EC4899', '#14B8A6', '#F97316'
];

const DotsAndBoxesGame: React.FC<DotsAndBoxesGameProps> = ({
  meetingId,
  isVisible,
  waitingForApproval = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>({
    gridSize: 4,
    lines: new Set(),
    completedSquares: new Map(),
    currentPlayerIndex: 0,
    players: [],
    gameStarted: false,
    gameEnded: false,
    timeLeft: 15,
    spectators: []
  });
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    totalSquares: 0,
    bestStreak: 0
  });

  // Initialize game channel for real-time multiplayer
  useEffect(() => {
    if (!meetingId || !user || !isVisible) return;

    const gameChannel = supabase
      .channel(`dots-boxes-${meetingId}`)
      .on('presence', { event: 'sync' }, () => {
        const presences = gameChannel.presenceState();
        updatePlayersFromPresence(presences);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Player joined:', newPresences);
        handlePlayerJoin(newPresences[0]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Player left:', leftPresences);
        handlePlayerLeave(leftPresences[0]);
      })
      .on('broadcast', { event: 'game_move' }, ({ payload }) => {
        handleGameMove(payload);
      })
      .on('broadcast', { event: 'game_state' }, ({ payload }) => {
        setGameState(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await gameChannel.track({
            user_id: user.id,
            name: user.user_metadata?.full_name || user.email || 'Anonymous',
            avatar: user.user_metadata?.avatar_url,
            timestamp: Date.now()
          });
        }
      });

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [meetingId, user, isVisible]);

  // Game timer
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameEnded) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          // Auto-skip turn when time runs out
          const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
          broadcastGameState({
            ...prev,
            currentPlayerIndex: nextPlayerIndex,
            timeLeft: 15
          });
          return {
            ...prev,
            currentPlayerIndex: nextPlayerIndex,
            timeLeft: 15
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gameStarted, gameState.gameEnded, gameState.currentPlayerIndex]);

  const updatePlayersFromPresence = (presences: any) => {
    const activePlayers: Player[] = [];
    const spectatorIds: string[] = [];

    Object.values(presences).forEach((presence: any) => {
      presence.forEach((p: any) => {
        if (activePlayers.length < 8) {
          activePlayers.push({
            id: p.user_id,
            name: p.name,
            color: playerColors[activePlayers.length],
            score: 0,
            avatar: p.avatar
          });
        } else {
          spectatorIds.push(p.user_id);
        }
      });
    });

    setGameState(prev => ({
      ...prev,
      players: activePlayers,
      spectators: spectatorIds
    }));
  };

  const handlePlayerJoin = (presence: any) => {
    playSound('join');
    toast({
      title: "Player joined",
      description: `${presence.name} joined the game`,
    });
  };

  const handlePlayerLeave = (presence: any) => {
    toast({
      title: "Player left",
      description: `${presence.name} left the game`,
    });
  };

  const broadcastGameState = async (newState: GameState) => {
    const channel = supabase.channel(`dots-boxes-${meetingId}`);
    await channel.send({
      type: 'broadcast',
      event: 'game_state',
      payload: newState
    });
  };

  const handleGameMove = (payload: any) => {
    const { lineId, playerId } = payload;
    if (gameState.lines.has(lineId)) return;

    makeMove(lineId, playerId);
  };

  const startGame = () => {
    if (gameState.players.length < 2) {
      toast({
        title: "Need more players",
        description: "At least 2 players are required to start",
        variant: "destructive"
      });
      return;
    }

    const newState: GameState = {
      ...gameState,
      gameStarted: true,
      gameEnded: false,
      lines: new Set(),
      completedSquares: new Map(),
      currentPlayerIndex: 0,
      timeLeft: 15,
      players: gameState.players.map(p => ({ ...p, score: 0 }))
    };

    setGameState(newState);
    broadcastGameState(newState);
    playSound('start');
  };

  const resetGame = () => {
    const newState: GameState = {
      ...gameState,
      gameStarted: false,
      gameEnded: false,
      lines: new Set(),
      completedSquares: new Map(),
      currentPlayerIndex: 0,
      timeLeft: 15,
      players: gameState.players.map(p => ({ ...p, score: 0 }))
    };

    setGameState(newState);
    broadcastGameState(newState);
  };

  const getLineId = (row: number, col: number, isHorizontal: boolean): string => {
    return `${row}-${col}-${isHorizontal ? 'h' : 'v'}`;
  };

  const getSquareId = (row: number, col: number): string => {
    return `${row}-${col}`;
  };

  const checkCompletedSquares = (newLines: Set<string>, playerId: string): number => {
    let completedCount = 0;
    const newCompletedSquares = new Map(gameState.completedSquares);

    for (let row = 0; row < gameState.gridSize - 1; row++) {
      for (let col = 0; col < gameState.gridSize - 1; col++) {
        const squareId = getSquareId(row, col);
        if (newCompletedSquares.has(squareId)) continue;

        const topLine = getLineId(row, col, true);
        const bottomLine = getLineId(row + 1, col, true);
        const leftLine = getLineId(row, col, false);
        const rightLine = getLineId(row, col + 1, false);

        if (newLines.has(topLine) && newLines.has(bottomLine) && 
            newLines.has(leftLine) && newLines.has(rightLine)) {
          newCompletedSquares.set(squareId, playerId);
          completedCount++;
        }
      }
    }

    setGameState(prev => ({
      ...prev,
      completedSquares: newCompletedSquares
    }));

    return completedCount;
  };

  const makeMove = (lineId: string, playerId: string) => {
    if (!gameState.gameStarted || gameState.gameEnded) return;
    if (gameState.players[gameState.currentPlayerIndex]?.id !== playerId) return;
    if (gameState.lines.has(lineId)) return;

    const newLines = new Set([...gameState.lines, lineId]);
    const completedSquares = checkCompletedSquares(newLines, playerId);
    
    // Update player score
    const newPlayers = gameState.players.map(player => 
      player.id === playerId 
        ? { ...player, score: player.score + completedSquares }
        : player
    );

    // Check if game is over
    const totalPossibleSquares = (gameState.gridSize - 1) * (gameState.gridSize - 1);
    const totalCompletedSquares = Array.from(gameState.completedSquares.values()).length + completedSquares;
    const gameEnded = totalCompletedSquares === totalPossibleSquares;

    // Determine next player (player gets another turn if they completed squares)
    let nextPlayerIndex = gameState.currentPlayerIndex;
    if (completedSquares === 0) {
      nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    }

    const newState: GameState = {
      ...gameState,
      lines: newLines,
      players: newPlayers,
      currentPlayerIndex: nextPlayerIndex,
      timeLeft: 15,
      gameEnded
    };

    setGameState(newState);
    broadcastGameState(newState);

    // Play sounds
    if (completedSquares > 0) {
      playSound('square');
      if (completedSquares > 1) {
        playSound('combo');
      }
    } else {
      playSound('line');
    }

    if (gameEnded) {
      playSound('win');
      updateGameStats(playerId);
    }
  };

  const handleLineClick = (lineId: string) => {
    if (!user || !gameState.gameStarted || gameState.gameEnded) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer?.id !== user.id) {
      toast({
        title: "Not your turn",
        description: `It's ${currentPlayer?.name}'s turn`,
        variant: "destructive"
      });
      return;
    }

    makeMove(lineId, user.id);

    // Broadcast move to other players
    const channel = supabase.channel(`dots-boxes-${meetingId}`);
    channel.send({
      type: 'broadcast',
      event: 'game_move',
      payload: { lineId, playerId: user.id }
    });
  };

  const playSound = (type: 'line' | 'square' | 'combo' | 'win' | 'start' | 'join') => {
    if (!soundEnabled) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'line':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'square':
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'combo':
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.setValueAtTime(440 + (i * 220), audioContext.currentTime);
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            osc.start();
            osc.stop(audioContext.currentTime + 0.1);
          }, i * 100);
        }
        break;
      default:
        break;
    }
  };

  const updateGameStats = (winnerId: string) => {
    setGameStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesWon: winnerId === user?.id ? prev.gamesWon + 1 : prev.gamesWon,
      totalSquares: prev.totalSquares + (gameState.players.find(p => p.id === user?.id)?.score || 0)
    }));
  };

  const renderGrid = () => {
    const grid = [];
    
    // Render dots and lines
    for (let row = 0; row <= gameState.gridSize; row++) {
      for (let col = 0; col <= gameState.gridSize; col++) {
        const dotKey = `dot-${row}-${col}`;
        
        grid.push(
          <motion.div
            key={dotKey}
            className="absolute w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full z-20"
            style={{
              left: `${(col / gameState.gridSize) * 100}%`,
              top: `${(row / gameState.gridSize) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
            whileHover={{ scale: 1.5, backgroundColor: '#3B82F6' }}
          />
        );

        // Horizontal lines
        if (col < gameState.gridSize) {
          const hLineId = getLineId(row, col, true);
          const isDrawn = gameState.lines.has(hLineId);
          const isHovered = hoveredLine === hLineId;
          
          grid.push(
            <motion.div
              key={hLineId}
              className={`absolute h-1 cursor-pointer z-10 ${
                isDrawn 
                  ? 'bg-blue-500' 
                  : isHovered 
                    ? 'bg-blue-300' 
                    : 'bg-slate-300 dark:bg-slate-600'
              }`}
              style={{
                left: `${(col / gameState.gridSize) * 100}%`,
                top: `${(row / gameState.gridSize) * 100}%`,
                width: `${(1 / gameState.gridSize) * 100}%`,
                transform: 'translateY(-50%)'
              }}
              whileHover={{ scaleY: 2 }}
              onHoverStart={() => setHoveredLine(hLineId)}
              onHoverEnd={() => setHoveredLine(null)}
              onClick={() => handleLineClick(hLineId)}
            />
          );
        }

        // Vertical lines
        if (row < gameState.gridSize) {
          const vLineId = getLineId(row, col, false);
          const isDrawn = gameState.lines.has(vLineId);
          const isHovered = hoveredLine === vLineId;
          
          grid.push(
            <motion.div
              key={vLineId}
              className={`absolute w-1 cursor-pointer z-10 ${
                isDrawn 
                  ? 'bg-blue-500' 
                  : isHovered 
                    ? 'bg-blue-300' 
                    : 'bg-slate-300 dark:bg-slate-600'
              }`}
              style={{
                left: `${(col / gameState.gridSize) * 100}%`,
                top: `${(row / gameState.gridSize) * 100}%`,
                height: `${(1 / gameState.gridSize) * 100}%`,
                transform: 'translateX(-50%)'
              }}
              whileHover={{ scaleX: 2 }}
              onHoverStart={() => setHoveredLine(vLineId)}
              onHoverEnd={() => setHoveredLine(null)}
              onClick={() => handleLineClick(vLineId)}
            />
          );
        }
      }
    }

    // Render completed squares
    for (let row = 0; row < gameState.gridSize - 1; row++) {
      for (let col = 0; col < gameState.gridSize - 1; col++) {
        const squareId = getSquareId(row, col);
        const ownerId = gameState.completedSquares.get(squareId);
        
        if (ownerId) {
          const player = gameState.players.find(p => p.id === ownerId);
          
          grid.push(
            <motion.div
              key={squareId}
              className="absolute rounded-lg z-5"
              style={{
                left: `${((col + 0.1) / gameState.gridSize) * 100}%`,
                top: `${((row + 0.1) / gameState.gridSize) * 100}%`,
                width: `${(0.8 / gameState.gridSize) * 100}%`,
                height: `${(0.8 / gameState.gridSize) * 100}%`,
                backgroundColor: player?.color || '#3B82F6',
                opacity: 0.6
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <motion.div
                className="w-full h-full rounded-lg"
                animate={{ 
                  boxShadow: [
                    `0 0 0 rgba(${player?.color}, 0)`,
                    `0 0 20px rgba(${player?.color}, 0.5)`,
                    `0 0 0 rgba(${player?.color}, 0)`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          );
        }
      }
    }

    return grid;
  };

  const getWinner = () => {
    if (!gameState.gameEnded) return null;
    return gameState.players.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    );
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-4xl mx-auto"
      >
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl border border-purple-500/20 p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Dots & Boxes</h3>
                {waitingForApproval && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                    Waiting for host
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-white hover:bg-white/10"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                
                {gameState.players.length > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-gray-300">
                    <Users className="w-4 h-4" />
                    <span>{gameState.players.length}/8</span>
                  </div>
                )}
              </div>
            </div>

            {/* Game Status */}
            {gameState.gameStarted && !gameState.gameEnded && (
              <div className="flex flex-col sm:flex-row items-center justify-between bg-black/20 rounded-lg p-3 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white">
                      {gameState.players[gameState.currentPlayerIndex]?.name}'s turn
                    </span>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: gameState.players[gameState.currentPlayerIndex]?.color }}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-cyan-400" />
                  <span className={`text-sm font-mono ${
                    gameState.timeLeft <= 5 ? 'text-red-400' : 'text-white'
                  }`}>
                    {gameState.timeLeft}s
                  </span>
                </div>
              </div>
            )}

            {/* Players Scoreboard */}
            {gameState.players.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {gameState.players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`bg-white/10 rounded-lg p-2 text-center ${
                      index === gameState.currentPlayerIndex && gameState.gameStarted 
                        ? 'ring-2 ring-cyan-400' 
                        : ''
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: player.color }}
                    />
                    <p className="text-xs text-white truncate">{player.name}</p>
                    <p className="text-sm font-bold text-white">{player.score}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Game Grid */}
            {gameState.gameStarted && (
              <div className="relative mx-auto" style={{ width: '300px', height: '300px' }}>
                <div className="absolute inset-0 bg-slate-800/50 rounded-lg">
                  {renderGrid()}
                </div>
              </div>
            )}

            {/* Game Over Screen */}
            {gameState.gameEnded && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4 bg-black/30 rounded-lg p-6"
              >
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
                <h4 className="text-2xl font-bold text-white">Game Over!</h4>
                <p className="text-xl text-yellow-400">
                  🎉 {getWinner()?.name} wins with {getWinner()?.score} squares!
                </p>
                
                <div className="space-y-2">
                  <h5 className="text-lg font-semibold text-white">Final Scores:</h5>
                  {gameState.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: player.color }}
                          />
                          <span className="text-white">{player.name}</span>
                        </div>
                        <span className="text-white font-bold">{player.score}</span>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Game Controls */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {!gameState.gameStarted && !gameState.gameEnded && (
                <Button
                  onClick={startGame}
                  disabled={gameState.players.length < 2}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Start Game ({gameState.players.length}/8 players)
                </Button>
              )}

              {(gameState.gameStarted || gameState.gameEnded) && (
                <Button
                  onClick={resetGame}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Game
                </Button>
              )}

              {/* Grid Size Selector */}
              {!gameState.gameStarted && (
                <div className="flex space-x-1">
                  {[4, 5, 6].map(size => (
                    <Button
                      key={size}
                      variant={gameState.gridSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGameState(prev => ({ ...prev, gridSize: size }))}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      {size}x{size}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            {!gameState.gameStarted && gameState.players.length === 0 && (
              <div className="text-center space-y-2 text-gray-400 text-sm">
                <p>🎯 Connect dots to create lines and complete squares</p>
                <p>🏆 Player with the most squares wins</p>
                <p>⚡ Get an extra turn when you complete a square</p>
                <p>👥 2-8 players can join - others can spectate</p>
              </div>
            )}

            {/* Spectators */}
            {gameState.spectators.length > 0 && (
              <div className="text-center text-xs text-gray-400">
                <span>{gameState.spectators.length} spectator(s) watching</span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default DotsAndBoxesGame;
