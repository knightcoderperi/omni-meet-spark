
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Meeting from "./pages/Meeting";
import SystemValidation from "./pages/SystemValidation";
import NotFound from "./pages/NotFound";
import SmoothLoader from "./components/SmoothLoader";

const queryClient = new QueryClient();

const AppContent = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Apply premium theme meta tags based on current theme
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const themeColor = theme === 'light' ? '#ff6b35' : '#0a0a0a';
    
    if (metaTheme) {
      metaTheme.setAttribute('content', themeColor);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = themeColor;
      document.head.appendChild(meta);
    }

    // Apply theme class to document for global theme consistency
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner 
          theme={theme === 'dark' ? 'dark' : 'light'}
          className={theme === 'light' ? 'light' : ''}
        />
        <BrowserRouter>
          <Suspense fallback={<SmoothLoader message="Loading OmniMeet..." />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/meeting/:meetingCode" element={<Meeting />} />
              <Route path="/validation/:meetingId" element={<SystemValidation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;
