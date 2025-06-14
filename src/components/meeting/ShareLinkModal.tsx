
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Share2, Mail, MessageCircle, X, QrCode, Calendar, Clock, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingCode: string;
  meetingTitle: string;
  meetingType?: 'instant' | 'scheduled';
  scheduledTime?: string;
  duration?: number;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  meetingCode,
  meetingTitle,
  meetingType = 'instant',
  scheduledTime,
  duration
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const meetingUrl = `${window.location.origin}/meeting/${meetingCode}`;

  const getShareMessage = () => {
    const baseMessage = `You're invited to join "${meetingTitle}"`;
    const joinInfo = `\n\nJoin here: ${meetingUrl}\nMeeting Code: ${meetingCode}`;
    
    if (meetingType === 'scheduled' && scheduledTime) {
      const time = new Date(scheduledTime).toLocaleString();
      const durationText = duration ? ` (${duration} minutes)` : '';
      return `${baseMessage}\n\nScheduled for: ${time}${durationText}${joinInfo}`;
    }
    
    return `${baseMessage}${joinInfo}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Meeting link has been copied to clipboard"
    });
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join ${meetingTitle}`);
    const body = encodeURIComponent(getShareMessage());
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`sms:?body=${message}`);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meetingTitle,
          text: `Join "${meetingTitle}"`,
          url: meetingUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const generateCalendarLink = () => {
    if (meetingType === 'scheduled' && scheduledTime) {
      const startDate = new Date(scheduledTime);
      const endDate = new Date(startDate.getTime() + (duration || 60) * 60000);
      
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meetingTitle)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(getShareMessage())}`;
      
      window.open(calendarUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="glass-card border border-white/10 shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    {meetingType === 'instant' ? (
                      <Clock className="w-5 h-5 text-green-500" />
                    ) : (
                      <Calendar className="w-5 h-5 text-blue-500" />
                    )}
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Share {meetingType === 'instant' ? 'Instant' : 'Scheduled'} Meeting
                    </h2>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Invite others to join "{meetingTitle}"
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Meeting Info */}
              <div className="mb-6 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Meeting Code
                  </p>
                  <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-wider mb-3">
                    {meetingCode}
                  </p>
                  
                  {meetingType === 'scheduled' && scheduledTime && (
                    <div className="flex items-center justify-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(scheduledTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {duration && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{duration}m</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Copy Link */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Meeting Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={meetingUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-600/50 rounded-l-lg text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className={`px-4 py-2 rounded-l-none transition-colors ${
                      copied 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'btn-primary-premium'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Share Options */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Share via:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={shareViaWhatsApp}
                    className="glass-button flex items-center justify-center space-x-2 p-3 bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span>WhatsApp</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={shareViaEmail}
                    className="glass-button flex items-center justify-center space-x-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
                  >
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>Email</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={shareViaSMS}
                    className="glass-button flex items-center justify-center space-x-2 p-3"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>SMS</span>
                  </Button>

                  {meetingType === 'scheduled' && scheduledTime && (
                    <Button
                      variant="outline"
                      onClick={generateCalendarLink}
                      className="glass-button flex items-center justify-center space-x-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30"
                    >
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span>Calendar</span>
                    </Button>
                  )}
                </div>

                {navigator.share && (
                  <Button
                    variant="outline"
                    onClick={shareNative}
                    className="w-full glass-button flex items-center justify-center space-x-2 p-3"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>More sharing options...</span>
                  </Button>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>How to join:</strong> Share the meeting code or link. 
                  Participants can enter the code on the homepage or click the direct link to join instantly.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareLinkModal;
