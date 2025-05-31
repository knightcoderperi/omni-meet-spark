
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pen, Eraser, Square, Circle, Type, Undo, Redo, Download, 
  Trash2, Move, Minus, X, Maximize2, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import WhiteboardColorPalette from './WhiteboardColorPalette';
import { useToast } from '@/hooks/use-toast';

interface WhiteboardProps {
  isVisible: boolean;
  onClose: () => void;
  meetingId: string;
  userId?: string;
  guestName?: string;
}

interface DrawingPath {
  id: string;
  tool: string;
  color: string;
  strokeWidth: number;
  points: { x: number; y: number }[];
  timestamp: number;
}

const Whiteboard: React.FC<WhiteboardProps> = ({
  isVisible,
  onClose,
  meetingId,
  userId,
  guestName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);
  
  // Tool state
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text' | 'move'>('pen');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showColorPalette, setShowColorPalette] = useState(false);
  
  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Configure drawing context
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    
    // Clear and set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    redrawCanvas();
  }, [canvasSize, paths]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all paths
    paths.forEach(path => {
      if (path.points.length < 2) return;

      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.strokeWidth;
      ctx.globalCompositeOperation = path.tool === 'eraser' ? 'destination-out' : 'source-over';

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      
      ctx.stroke();
    });
  }, [paths]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom - panOffset.x,
      y: (e.clientY - rect.top) / zoom - panOffset.y
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'move') return;

    setIsDrawing(true);
    const pos = getMousePos(e);
    
    const newPath: DrawingPath = {
      id: `${Date.now()}_${Math.random()}`,
      tool: activeTool,
      color: selectedColor,
      strokeWidth,
      points: [pos],
      timestamp: Date.now()
    };
    
    setCurrentPath(newPath);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath || activeTool === 'move') return;

    const pos = getMousePos(e);
    const updatedPath = {
      ...currentPath,
      points: [...currentPath.points, pos]
    };
    
    setCurrentPath(updatedPath);

    // Draw current stroke
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = strokeWidth;
    ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';

    const points = updatedPath.points;
    if (points.length >= 2) {
      const lastPoint = points[points.length - 2];
      const currentPoint = points[points.length - 1];
      
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentPath) return;

    setIsDrawing(false);
    
    // Add to undo stack
    setUndoStack(prev => [...prev, paths]);
    setRedoStack([]);
    
    // Add completed path
    setPaths(prev => [...prev, currentPath]);
    setCurrentPath(null);

    toast({
      title: "Drawing saved",
      description: "Your drawing has been added to the whiteboard"
    });
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [paths, ...prev]);
    setPaths(previousState);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[0];
    setUndoStack(prev => [...prev, paths]);
    setPaths(nextState);
    setRedoStack(prev => prev.slice(1));
  };

  const clearCanvas = () => {
    setUndoStack(prev => [...prev, paths]);
    setRedoStack([]);
    setPaths([]);
    
    toast({
      title: "Canvas cleared",
      description: "All drawings have been removed"
    });
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${meetingId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Download started",
      description: "Whiteboard image is being downloaded"
    });
  };

  const tools = [
    { id: 'pen', icon: Pen, label: 'Pen', color: 'text-blue-500' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', color: 'text-red-500' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', color: 'text-green-500' },
    { id: 'circle', icon: Circle, label: 'Circle', color: 'text-purple-500' },
    { id: 'text', icon: Type, label: 'Text', color: 'text-orange-500' },
    { id: 'move', icon: Move, label: 'Move', color: 'text-cyan-500' },
  ];

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Collaborative Whiteboard
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColorPalette(!showColorPalette)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 hover:from-cyan-600 hover:to-blue-700"
              >
                Colors
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="hover:bg-red-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Toolbar */}
          <div className="bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 space-y-4 min-w-[80px]">
            {/* Drawing Tools */}
            <div className="space-y-2">
              {tools.map(tool => (
                <motion.button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as any)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    activeTool === tool.id
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-white dark:bg-slate-700 hover:bg-cyan-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={tool.label}
                >
                  <tool.icon className="w-5 h-5" />
                </motion.button>
              ))}
            </div>

            {/* Stroke Width */}
            <div className="space-y-2">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Size</div>
              {[1, 3, 5, 8, 12].map(width => (
                <motion.button
                  key={width}
                  onClick={() => setStrokeWidth(width)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    strokeWidth === width
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div 
                    className={`rounded-full ${strokeWidth === width ? 'bg-white' : 'bg-slate-400'}`}
                    style={{ width: Math.min(width * 2, 20), height: Math.min(width * 2, 20) }}
                  />
                </motion.button>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <motion.button
                onClick={undo}
                disabled={undoStack.length === 0}
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-green-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Undo"
              >
                <Undo className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={redo}
                disabled={redoStack.length === 0}
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Redo"
              >
                <Redo className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={clearCanvas}
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Clear All"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={downloadCanvas}
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-purple-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Download"
              >
                <Download className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-crosshair bg-white rounded-lg shadow-inner"
              style={{
                transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transformOrigin: 'top left'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            
            {/* Canvas Controls */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <motion.button
                onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
                className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ZoomIn className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
                className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ZoomOut className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}
                className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Color Palette Sidebar */}
          <AnimatePresence>
            {showColorPalette && (
              <motion.div
                className="w-80 bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4"
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              >
                <WhiteboardColorPalette
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Whiteboard;
