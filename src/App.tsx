import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/i18n";
import { BottomNav } from "@/components/BottomNav";
import Onboarding from "./pages/Onboarding";
import MoodCheck from "./pages/MoodCheck";
import Techniques from "./pages/Techniques";
import BreatheV2 from "./pages/BreatheV2";
import Auth from "./pages/Auth";
import UpdatePassword from "./pages/UpdatePassword";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Onboarding />} />
              <Route path="/mood-check" element={<MoodCheck />} />
              <Route path="/techniques" element={<Techniques />} />
              <Route path="/breathe/:techniqueId" element={<BreatheV2 />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
