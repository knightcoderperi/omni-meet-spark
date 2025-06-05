
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bell, Shield, Camera, Mic, Volume2, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      timezone: 'UTC'
    },
    audio: {
      microphoneId: 'default',
      speakerId: 'default',
      noiseReduction: true,
      echoCancellation: true,
      autoGainControl: true
    },
    video: {
      cameraId: 'default',
      resolution: '720p',
      frameRate: 30,
      virtualBackground: false
    },
    notifications: {
      meetingReminders: true,
      participantJoined: true,
      chatMessages: true,
      emailNotifications: true
    },
    privacy: {
      allowRecording: true,
      sharePresence: true,
      dataCollection: false
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'video', label: 'Video', icon: Camera },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  const handleSaveSettings = () => {
    // Here you would save settings to Supabase
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully."
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-cyan-500/20 h-full">
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-64 border-r border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Settings
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                          activeTab === tab.id
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Profile Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={settings.profile.name}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, name: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={settings.profile.email}
                          disabled
                          className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg text-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Timezone
                        </label>
                        <select
                          value={settings.profile.timezone}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, timezone: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'audio' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Audio Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Noise Reduction</h4>
                          <p className="text-gray-400 text-sm">Reduce background noise</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.audio.noiseReduction}
                          onChange={(e) => setSettings({
                            ...settings,
                            audio: { ...settings.audio, noiseReduction: e.target.checked }
                          })}
                          className="w-4 h-4 text-cyan-600"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Echo Cancellation</h4>
                          <p className="text-gray-400 text-sm">Remove echo from audio</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.audio.echoCancellation}
                          onChange={(e) => setSettings({
                            ...settings,
                            audio: { ...settings.audio, echoCancellation: e.target.checked }
                          })}
                          className="w-4 h-4 text-cyan-600"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Auto Gain Control</h4>
                          <p className="text-gray-400 text-sm">Automatically adjust volume</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.audio.autoGainControl}
                          onChange={(e) => setSettings({
                            ...settings,
                            audio: { ...settings.audio, autoGainControl: e.target.checked }
                          })}
                          className="w-4 h-4 text-cyan-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'video' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Video Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Video Quality
                        </label>
                        <select
                          value={settings.video.resolution}
                          onChange={(e) => setSettings({
                            ...settings,
                            video: { ...settings.video, resolution: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="480p">480p</option>
                          <option value="720p">720p HD</option>
                          <option value="1080p">1080p Full HD</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Virtual Background</h4>
                          <p className="text-gray-400 text-sm">Use virtual backgrounds</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.video.virtualBackground}
                          onChange={(e) => setSettings({
                            ...settings,
                            video: { ...settings.video, virtualBackground: e.target.checked }
                          })}
                          className="w-4 h-4 text-cyan-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Notification Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Meeting Reminders</h4>
                          <p className="text-gray-400 text-sm">Get notified before meetings start</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.meetingReminders}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, meetingReminders: e.target.checked }
                          })}
                          className="w-4 h-4 text-cyan-600"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Participant Joined</h4>
                          <p className="text-gray-400 text-sm">Notify when someone joins</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.participantJoined}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, participantJoined: e.target.checked }
                          })}
                          className="w-4 h-4 text-cyan-600"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Email Notifications</h4>
                          <p className="text-gray-400 text-sm">Receive notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                          })}
                          className="w-4 h-4 text-cyan-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Privacy Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Allow Recording</h4>
                          <p className="text-gray-400 text-sm">Allow hosts to record meetings you join</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.privacy.allowRecording}
                          onChange={(e) => setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, allowRecording: e.target.checked }
                          })}
                          className="w-4 h-4 text-cyan-600"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Share Presence</h4>
                          <p className="text-gray-400 text-sm">Let others see when you're online</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.privacy.sharePresence}
                          onChange={(e) => setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, sharePresence: e.target.checked }
                          })}
                          className="w-4 h-4 text-cyan-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-white/10">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveSettings}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;
