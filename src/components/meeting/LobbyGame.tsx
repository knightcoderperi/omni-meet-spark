
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Trophy, Star, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LobbyGameProps {
  isVisible: boolean;
  waitingForApproval?: boolean;
}

const LobbyGame: React.FC<LobbyGameProps> = ({ isVisible, waitingForApproval = false }) => {
  const [gameType, setGameType] = useState<'memory' | 'math' | 'riddle'>('memory');
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

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [gameStarted, timeLeft]);

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

  const startGame = (type: 'memory' | 'math' | 'riddle') => {
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

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl border border-purple-500/20 p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Gamepad2 className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">
                {waitingForApproval ? 'While You Wait...' : 'Lobby Games'}
              </h3>
            </div>

            {waitingForApproval && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Waiting for host approval</span>
                </div>
                <p className="text-xs text-yellow-300 mt-1">Play some games to pass the time!</p>
              </div>
            )}

            {!gameStarted ? (
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                  {waitingForApproval ? 'Keep yourself entertained!' : 'Play a quick game while waiting!'}
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => startGame('memory')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3"
                  >
                    🧠 Memory Match
                  </Button>
                  <Button
                    onClick={() => startGame('math')}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3"
                  >
                    🔢 Quick Math
                  </Button>
                  <Button
                    onClick={() => startGame('riddle')}
                    className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white py-3"
                  >
                    🧩 Brain Riddles
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-semibold">Score: {score}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white">⏱️ {timeLeft}s</span>
                  </div>
                </div>

                {gameOver ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <Trophy className="w-12 h-12 text-yellow-400 mx-auto" />
                    <h4 className="text-xl font-bold text-white">Game Over!</h4>
                    <p className="text-gray-300">Final Score: {score}</p>
                    <Button
                      onClick={resetGame}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    {gameType === 'memory' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-white">Memory Match</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {memoryCards.map((card) => (
                            <motion.button
                              key={card.id}
                              onClick={() => handleMemoryCardClick(card.id)}
                              className={`aspect-square rounded-lg border-2 text-2xl font-bold transition-all duration-300 ${
                                card.flipped || card.matched
                                  ? 'bg-white border-purple-400 text-gray-800'
                                  : 'bg-purple-800/50 border-purple-600 hover:bg-purple-700/50'
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
                        <h4 className="font-semibold text-white">Quick Math</h4>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white mb-4">{mathQuestion.question} = ?</p>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              value={userAnswer}
                              onChange={(e) => setUserAnswer(e.target.value)}
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                              placeholder="Your answer"
                              onKeyPress={(e) => e.key === 'Enter' && handleMathAnswer()}
                            />
                            <Button
                              onClick={handleMathAnswer}
                              disabled={!userAnswer}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Submit
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {gameType === 'riddle' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-white">Brain Riddles</h4>
                        <div className="text-center">
                          <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                            {riddles[currentRiddle].question}
                          </p>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={riddleAnswer}
                              onChange={(e) => setRiddleAnswer(e.target.value)}
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                              placeholder="Your answer"
                              onKeyPress={(e) => e.key === 'Enter' && handleRiddleAnswer()}
                            />
                            <Button
                              onClick={handleRiddleAnswer}
                              disabled={!riddleAnswer.trim()}
                              className="bg-orange-600 hover:bg-orange-700"
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
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
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
