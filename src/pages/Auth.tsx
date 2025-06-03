
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Video, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  
  const { signIn, signUp, securityStatus, checkSecurityStatus } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowSecurityWarning(false);

    try {
      if (isSignUp) {
        // Basic password strength validation
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        
        await signUp(formData.email, formData.password, formData.fullName);
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        await signIn(formData.email, formData.password);
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle account lockout specifically
      if (error.message.includes('Account temporarily locked')) {
        setShowSecurityWarning(true);
        toast({
          title: "Account Locked",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Check if this was a failed login attempt
        if (!isSignUp && formData.email) {
          setTimeout(async () => {
            const status = await checkSecurityStatus(formData.email);
            if (status.attempts > 0) {
              setShowSecurityWarning(true);
            }
          }, 500);
        }
        
        toast({
          title: "Error",
          description: error.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: '', password: '', fullName: '' });
    setShowSecurityWarning(false);
  };

  const getRemainingLockoutTime = () => {
    if (!securityStatus?.lockout_until) return 0;
    const lockoutTime = new Date(securityStatus.lockout_until);
    const now = new Date();
    return Math.max(0, Math.ceil((lockoutTime.getTime() - now.getTime()) / 1000 / 60));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            MeetingPro
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Professional video meetings made simple
          </p>
        </motion.div>

        {/* Security Warning */}
        {showSecurityWarning && securityStatus && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant={securityStatus.locked ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {securityStatus.locked ? (
                  `Account locked for ${getRemainingLockoutTime()} minutes due to failed login attempts.`
                ) : (
                  `${securityStatus.attempts} failed login attempt(s). Account will be locked after 5 attempts.`
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/20 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400">
                {isSignUp 
                  ? 'Start hosting professional meetings today'
                  : 'Sign in to access your meetings'
                }
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                    Password {isSignUp && <span className="text-xs text-slate-500">(min. 8 characters)</span>}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600"
                      required
                      minLength={isSignUp ? 8 : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  disabled={loading || (securityStatus?.locked ?? false)}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </div>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </p>
                <Button
                  variant="link"
                  onClick={toggleMode}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {isSignUp ? 'Sign In' : 'Create Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span>HD Video</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span>Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span>Easy Setup</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
