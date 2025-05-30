
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Mic, MicOff, Video, VideoOff, Hand, Crown, 
  MoreVertical, UserMinus, Shield, Volume2, VolumeX 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  handRaised: boolean;
  stream?: MediaStream;
}

interface ParticipantsPanelProps {
  participants: Participant[];
  onClose: () => void;
}

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showActions, setShowActions] = useState<string | null>(null);

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMuteParticipant = (participantId: string) => {
    console.log('Muting participant:', participantId);
    // Implement mute functionality
  };

  const handleRemoveParticipant = (participantId: string) => {
    console.log('Removing participant:', participantId);
    // Implement remove functionality
  };

  const handleMakeHost = (participantId: string) => {
    console.log('Making host:', participantId);
    // Implement make host functionality
  };

  return (
    <motion.div
      className="h-full flex flex-col bg-white/90 dark:bg-black/80 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-white/10">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Participants
          </h3>
          <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2 py-1 rounded-full text-xs">
            {participants.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200/50 dark:border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-100 dark:bg-slate-800 border-0"
          />
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredParticipants.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {participant.name[0].toUpperCase()}
                    </div>
                    
                    {/* Status indicators */}
                    {participant.isHost && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Crown className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    )}
                    
                    {participant.handRaised && (
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Hand className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                        {participant.name}
                        {participant.id === 'self' && (
                          <span className="text-slate-500 dark:text-gray-400 ml-1">(You)</span>
                        )}
                      </p>
                      {participant.isHost && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                          Host
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-slate-500 dark:text-gray-400">
                        {participant.isMuted ? 'Muted' : 'Speaking'}
                      </span>
                      {!participant.isVideoOff && (
                        <span className="text-xs text-green-500">• Camera on</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Icons */}
                <div className="flex items-center space-x-2">
                  {participant.isMuted ? (
                    <div className="p-1 bg-red-100 dark:bg-red-900 rounded-full">
                      <MicOff className="w-3 h-3 text-red-500" />
                    </div>
                  ) : (
                    <motion.div
                      className="p-1 bg-green-100 dark:bg-green-900 rounded-full"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Mic className="w-3 h-3 text-green-500" />
                    </motion.div>
                  )}

                  {participant.isVideoOff && (
                    <div className="p-1 bg-red-100 dark:bg-red-900 rounded-full">
                      <VideoOff className="w-3 h-3 text-red-500" />
                    </div>
                  )}

                  {/* Actions Menu */}
                  {participant.id !== 'self' && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowActions(showActions === participant.id ? null : participant.id)}
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>

                      <AnimatePresence>
                        {showActions === participant.id && (
                          <motion.div
                            className="absolute right-0 top-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 py-2 min-w-[160px] z-50"
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ duration: 0.15 }}
                          >
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center"
                              onClick={() => handleMuteParticipant(participant.id)}
                            >
                              {participant.isMuted ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                              {participant.isMuted ? 'Unmute' : 'Mute'}
                            </button>
                            
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center"
                              onClick={() => handleMakeHost(participant.id)}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Make Host
                            </button>
                            
                            <div className="border-t border-slate-200 dark:border-slate-600 my-1" />
                            
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
                              onClick={() => handleRemoveParticipant(participant.id)}
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remove
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-200/50 dark:border-white/10 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
        >
          <VolumeX className="w-4 h-4 mr-2" />
          Mute All
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start"
        >
          <Hand className="w-4 h-4 mr-2" />
          Lower All Hands
        </Button>
      </div>
    </motion.div>
  );
};

export default ParticipantsPanel;
