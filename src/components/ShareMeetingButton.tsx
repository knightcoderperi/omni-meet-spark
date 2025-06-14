
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Mail, MessageCircle, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShareMeetingButtonProps {
  meetingType: 'instant' | 'scheduled';
  meetingData: {
    id?: string;
    title: string;
    code?: string;
    scheduledTime?: string;
    duration?: number;
  };
  className?: string;
}

const ShareMeetingButton: React.FC<ShareMeetingButtonProps> = ({
  meetingType,
  meetingData,
  className = ""
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const getMeetingUrl = () => {
    // For instant meetings, use the meeting code path
    if (meetingType === 'instant' && meetingData.code) {
      return `${window.location.origin}/meeting/${meetingData.code}`;
    }
    // For scheduled meetings, provide a join link with meeting ID
    if (meetingData.id) {
      return `${window.location.origin}/meeting/${meetingData.code || meetingData.id}`;
    }
    // Fallback to current URL if no specific meeting data
    return window.location.href;
  };

  const getShareText = () => {
    const baseText = `Join "${meetingData.title}"`;
    const url = getMeetingUrl();
    
    if (meetingType === 'instant') {
      return `${baseText}\n\nJoin here: ${url}\nMeeting Code: ${meetingData.code || 'N/A'}`;
    } else {
      const time = meetingData.scheduledTime ? new Date(meetingData.scheduledTime).toLocaleString() : 'TBD';
      return `${baseText}\n\nScheduled for: ${time}\nJoin here: ${url}`;
    }
  };

  const copyToClipboard = async () => {
    try {
      const url = getMeetingUrl();
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Meeting link has been copied to clipboard"
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = getMeetingUrl();
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast({
          title: "Link copied!",
          description: "Meeting link has been copied to clipboard"
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Unable to copy to clipboard",
          variant: "destructive"
        });
      }
      
      document.body.removeChild(textArea);
    }
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join ${meetingData.title}`);
    const body = encodeURIComponent(getShareText());
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meetingData.title,
          text: `Join "${meetingData.title}"`,
          url: getMeetingUrl()
        });
      } catch (error) {
        console.log('Native share cancelled or failed:', error);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setShowShareOptions(!showShareOptions)}
        className="btn-primary-premium flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2"
        size={isMobile ? "sm" : "default"}
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      {showShareOptions && (
        <motion.div
          className={`absolute top-full mt-2 right-0 z-50 ${isMobile ? 'w-72' : 'w-64'}`}
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="glass-card p-4 shadow-2xl border border-white/10">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                {meetingType === 'instant' ? (
                  <Clock className="w-4 h-4 text-green-500" />
                ) : (
                  <Calendar className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-sm font-medium text-slate-700 dark:text-white">
                  {meetingType === 'instant' ? 'Instant Meeting' : 'Scheduled Meeting'}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                {meetingData.title}
              </h3>
              {meetingType === 'instant' && meetingData.code && (
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  Code: {meetingData.code}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full justify-start text-left glass-button"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>

              <Button
                onClick={shareViaWhatsApp}
                variant="outline"
                className="w-full justify-start text-left glass-button bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
                WhatsApp
              </Button>

              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="w-full justify-start text-left glass-button bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
                size="sm"
              >
                <Mail className="w-4 h-4 mr-2 text-blue-500" />
                Email
              </Button>

              {navigator.share && (
                <Button
                  onClick={shareNative}
                  variant="outline"
                  className="w-full justify-start text-left glass-button"
                  size="sm"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  More Options
                </Button>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Share this link to invite others to join your meeting
              </p>
              <div className="mt-2 p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded text-xs font-mono break-all">
                {getMeetingUrl()}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Backdrop to close share options */}
      {showShareOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowShareOptions(false)}
        />
      )}
    </div>
  );
};

export default ShareMeetingButton;
