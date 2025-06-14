import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Trophy, Star, RotateCcw, Clock, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DotsAndBoxesGame from './DotsAndBoxesGame';

interface LobbyGameProps {
  meetingId: string;
  isVisible: boolean;
  waitingForApproval?: boolean;
}

type GameType = 'memory' | 'math' | 'riddle' | 'dotsboxes';

const LobbyGame: React.FC<LobbyGameProps> = ({ 
  meetingId,
  isVisible, 
  waitingForApproval = false 
}) => {
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  // Memory Game State
  const [memoryCards, setMemoryCards] = useState<{ id: number; value: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  // Math Game State
  const [mathQuestion, setMathQuestion] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');

  // Riddle Game State
  const riddles = [
    { question: "I speak without a mouth and hear without ears. What am I?", answer: "echo" },
    { question: "The more you take, the more you leave behind. What am I?", answer: "footsteps" },
    { question: "I have cities, but no houses. I have mountains, but no trees. What am I?", answer: "map" },
    { question: "What has keys but no locks, space but no room?", answer: "keyboard" },
    { question: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "m" },
    { question: "What gets wet while drying?", answer: "towel" }
  ];
  const [currentRiddle, setCurrentRiddle] = useState(0);
  const [riddleAnswer, setRiddleAnswer] = useState('');

  // Auto-show games when waiting for approval
  useEffect(() => {
    if (waitingForApproval && !gameType) {
      // Automatically show dots and boxes game when waiting for approval
      setGameType('dotsboxes');
    } else if (!waitingForApproval && gameType) {
      // Hide games when approved (no longer waiting)
      resetGame();
    }
  }, [waitingForApproval, gameType]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && gameType && gameType !== 'dotsboxes') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameType && gameType !== 'dotsboxes') {
      setGameOver(true);
    }
  }, [gameStarted, timeLeft, gameType]);

  const initializeMemoryGame = () => {
    const symbols = ['🎵', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺'];
    const cards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        value: symbol,
        flipped: false,
        matched: false
      }));
    setMemoryCards(cards);
  };

  const generateMathQuestion = () => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer;
    let question;
    
    switch (operation) {
      case '+':
        answer = a + b;
        question = `${a} + ${b}`;
        break;
      case '-':
        answer = Math.max(a, b) - Math.min(a, b);
        question = `${Math.max(a, b)} - ${Math.min(a, b)}`;
        break;
      case '*':
        answer = a * b;
        question = `${a} × ${b}`;
        break;
      default:
        answer = a + b;
        question = `${a} + ${b}`;
    }
    
    setMathQuestion({ question, answer });
  };

  const startGame = (type: Exclude<GameType, 'dotsboxes'>) => {
    setGameType(type);
    setGameStarted(true);
    setScore(0);
    setTimeLeft(60); // Increased time for better experience
    setGameOver(false);
    setCurrentQuestion(0);

    if (type === 'memory') {
      initializeMemoryGame();
    } else if (type === 'math') {
      generateMathQuestion();
    } else if (type === 'riddle') {
      setCurrentRiddle(0);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setCurrentQuestion(0);
    setMemoryCards([]);
    setFlippedCards([]);
    setUserAnswer('');
    setRiddleAnswer('');
    setCurrentRiddle(0);
    setGameType(null);
  };

  const handleMemoryCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || memoryCards[cardId].flipped || memoryCards[cardId].matched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    const newCards = memoryCards.map(card =>
      card.id === cardId ? { ...card, flipped: true } : card
    );
    setMemoryCards(newCards);

    if (newFlippedCards.length === 2) {
      const [first, second] = newFlippedCards;
      if (memoryCards[first].value === memoryCards[second].value) {
        setTimeout(() => {
          setMemoryCards(prev => prev.map(card =>
            card.id === first || card.id === second ? { ...card, matched: true } : card
          ));
          setScore(prev => prev + 10);
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setMemoryCards(prev => prev.map(card =>
            card.id === first || card.id === second ? { ...card, flipped: false } : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleMathAnswer = () => {
    if (parseInt(userAnswer) === mathQuestion.answer) {
      setScore(prev => prev + 5);
    }
    setUserAnswer('');
    generateMathQuestion();
    setCurrentQuestion(prev => prev + 1);
  };

  const handleRiddleAnswer = () => {
    if (riddleAnswer.toLowerCase().trim() === riddles[currentRiddle].answer.toLowerCase()) {
      setScore(prev => prev + 15);
    }
    setRiddleAnswer('');
    if (currentRiddle < riddles.length - 1) {
      setCurrentRiddle(prev => prev + 1);
    } else {
      setCurrentRiddle(0);
    }
    setCurrentQuestion(prev => prev + 1);
  };

  // Don't show games if not visible or not waiting for approval
  if (!isVisible || !waitingForApproval) return null;

  // If Dots and Boxes is selected, render the dedicated component
  if (gameType === 'dotsboxes') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 px-4">
        {/* Game Type Selector - Mobile Optimized */}
        <Card className="glass-premium theme-card p-3 sm:p-4">
          <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
            <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-gradient-electric" />
            <h3 className="text-lg sm:text-xl font-bold text-gradient-primary">
              {waitingForApproval ? 'While You Wait...' : 'Lobby Games'}
            </h3>
          </div>

          {waitingForApproval && (
            <div className="theme-notification p-2 sm:p-3 mb-3 sm:mb-4">
              <div className="flex items-center justify-center space-x-2 text-yellow-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Waiting for host approval</span>
              </div>
              <p className="text-xs text-yellow-300 mt-1 text-center">Play some games to pass the time!</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              onClick={() => setGameType('dotsboxes')}
              variant="default"
              className="text-xs py-2 theme-button btn-primary-premium"
            >
              <Grid3X3 className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Dots & Boxes</span>
              <span className="sm:hidden">Dots</span>
            </Button>
            <Button
              onClick={() => startGame('memory')}
              variant="outline"
              className="text-xs py-2 theme-button btn-secondary-premium"
            >
              🧠 <span className="hidden sm:inline">Memory</span>
            </Button>
            <Button
              onClick={() => startGame('math')}
              variant="outline"
              className="text-xs py-2 theme-button btn-secondary-premium"
            >
              🔢 <span className="hidden sm:inline">Math</span>
            </Button>
            <Button
              onClick={() => startGame('riddle')}
              variant="outline"
              className="text-xs py-2 theme-button btn-secondary-premium"
            >
              🧩 <span className="hidden sm:inline">Riddles</span>
            </Button>
          </div>
        </Card>

        <DotsAndBoxesGame 
          meetingId={meetingId}
          isVisible={true}
          waitingForApproval={waitingForApproval}
        />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-md mx-auto px-4"
      >
        <Card className="glass-premium theme-card p-4 sm:p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-gradient-electric" />
              <h3 className="text-lg sm:text-xl font-bold text-gradient-primary">
                {waitingForApproval ? 'While You Wait...' : 'Lobby Games'}
              </h3>
            </div>

            {waitingForApproval && (
              <div className="theme-notification p-3 mb-4">
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Waiting for host approval</span>
                </div>
                <p className="text-xs text-yellow-300 mt-1">Play some games to pass the time!</p>
              </div>
            )}

            {!gameStarted ? (
              <div className="space-y-4">
                <p className="theme-text-secondary text-sm">
                  {waitingForApproval ? 'Keep yourself entertained!' : 'Play a quick game while waiting!'}
                </p>
                
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  <Button
                    onClick={() => setGameType('dotsboxes')}
                    className="btn-primary-premium py-2 sm:py-3 text-sm sm:text-base"
                  >
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    🎯 Dots & Boxes (Multiplayer)
                  </Button>
                  <Button
                    onClick={() => startGame('memory')}
                    className="btn-primary-premium py-2 sm:py-3 text-sm sm:text-base"
                  >
                    🧠 Memory Match
                  </Button>
                  <Button
                    onClick={() => startGame('math')}
                    className="btn-primary-premium py-2 sm:py-3 text-sm sm:text-base"
                  >
                    🔢 Quick Math
                  </Button>
                  <Button
                    onClick={() => startGame('riddle')}
                    className="btn-primary-premium py-2 sm:py-3 text-sm sm:text-base"
                  >
                    🧩 Brain Riddles
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm sm:text-base">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    <span className="theme-text-primary font-semibold">Score: {score}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="theme-text-primary">⏱️ {timeLeft}s</span>
                  </div>
                </div>

                {gameOver ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mx-auto" />
                    <h4 className="text-lg sm:text-xl font-bold theme-text-primary">Game Over!</h4>
                    <p className="theme-text-secondary">Final Score: {score}</p>
                    <Button
                      onClick={resetGame}
                      className="btn-secondary-premium"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    {gameType === 'memory' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold theme-text-primary text-sm sm:text-base">Memory Match</h4>
                        <div className="grid grid-cols-4 gap-1 sm:gap-2 max-w-xs mx-auto">
                          {memoryCards.map((card) => (
                            <motion.button
                              key={card.id}
                              onClick={() => handleMemoryCardClick(card.id)}
                              className={`aspect-square rounded-lg border-2 text-lg sm:text-2xl font-bold transition-all duration-300 ${
                                card.flipped || card.matched
                                  ? 'bg-white border-purple-400 text-gray-800'
                                  : 'theme-card-background border-purple-600 hover:bg-purple-700/50'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={card.matched}
                            >
                              {card.flipped || card.matched ? card.value : '?'}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {gameType === 'math' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold theme-text-primary text-sm sm:text-base">Quick Math</h4>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold theme-text-primary mb-4">{mathQuestion.question} = ?</p>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              value={userAnswer}
                              onChange={(e) => setUserAnswer(e.target.value)}
                              className="input-premium flex-1 px-3 py-2 text-sm sm:text-base"
                              placeholder="Your answer"
                              onKeyPress={(e) => e.key === 'Enter' && handleMathAnswer()}
                            />
                            <Button
                              onClick={handleMathAnswer}
                              disabled={!userAnswer}
                              className="btn-primary-premium text-sm sm:text-base"
                            >
                              Submit
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {gameType === 'riddle' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold theme-text-primary text-sm sm:text-base">Brain Riddles</h4>
                        <div className="text-center">
                          <p className="text-sm theme-text-secondary mb-4 leading-relaxed px-2">
                            {riddles[currentRiddle].question}
                          </p>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={riddleAnswer}
                              onChange={(e) => setRiddleAnswer(e.target.value)}
                              className="input-premium flex-1 px-3 py-2 text-sm sm:text-base"
                              placeholder="Your answer"
                              onKeyPress={(e) => e.key === 'Enter' && handleRiddleAnswer()}
                            />
                            <Button
                              onClick={handleRiddleAnswer}
                              disabled={!riddleAnswer.trim()}
                              className="btn-primary-premium text-sm sm:text-base"
                            >
                              Submit
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!gameOver && (
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    size="sm"
                    className="w-full btn-ghost-premium text-sm"
                  >
                    End Game
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default LobbyGame;
