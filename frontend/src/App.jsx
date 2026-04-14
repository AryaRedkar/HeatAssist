import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import PrivateRoute from "./pages/PrivateRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AppLayout from "./pages/AppLayout";
import RiskScorePage from "./pages/RiskScorePage";
import HeatMapPage from "./pages/HeatMapPage";
import PetPlantPage from "./pages/PetPlantPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/"       element={<LandingPage />} />
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* ── Protected app routes with shared layout ── */}
            <Route
              path="/app"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              {/* Index route = Risk Score (default) */}
              <Route index           element={<RiskScorePage />} />
              <Route path="heatmap"  element={<HeatMapPage />} />
              <Route path="pet"      element={<PetPlantPage />} />
              <Route path="chat"     element={<ChatPage />} />
              <Route path="profile"  element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProfileProvider>
    </AuthProvider>
  );
}