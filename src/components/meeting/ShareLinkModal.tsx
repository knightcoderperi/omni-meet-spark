
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Share2, Mail, MessageCircle, X, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingCode: string;
  meetingTitle: string;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  meetingCode,
  meetingTitle
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const meetingUrl = `${window.location.origin}/meeting/${meetingCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Meeting link has been copied to clipboard"
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join ${meetingTitle}`);
    const body = encodeURIComponent(`You're invited to join "${meetingTitle}"\n\nJoin here: ${meetingUrl}\n\nMeeting Code: ${meetingCode}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`Join "${meetingTitle}" - ${meetingUrl} - Code: ${meetingCode}`);
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
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Share Meeting
                  </h2>
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
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Meeting Code
                  </p>
                  <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                    {meetingCode}
                  </p>
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
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-l-lg text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className={`px-4 py-2 rounded-l-none transition-colors ${
                      copied 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Share via:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={shareViaEmail}
                    className="flex items-center justify-center space-x-2 p-3"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={shareViaSMS}
                    className="flex items-center justify-center space-x-2 p-3"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>SMS</span>
                  </Button>
                </div>

                {navigator.share && (
                  <Button
                    variant="outline"
                    onClick={shareNative}
                    className="w-full flex items-center justify-center space-x-2 p-3"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share...</span>
                  </Button>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>How to join:</strong> Share the meeting code or link. 
                  Participants can enter the code on the homepage or click the direct link.
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
