import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";
import Chat from "./Chat";

/**
 * Chat page wrapper — passes profile data as optional context
 * to the Chat component. Works even without a saved profile.
 */
export default function ChatPage() {
  const navigate = useNavigate();
  const { profile, profileLoading } = useProfile();

  if (profileLoading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "3px solid #f3f4f6", borderTopColor: "#6366f1",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ color: "#6b7280", fontSize: 14 }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Pass profile data if available, otherwise pass minimal/empty userData
  // Chat component uses geolocation as fallback when no city is provided
  const userData = profile
    ? { ...profile, location: profile.city }
    : {};

  return (
    <div style={{ margin: "-1.5rem -1rem", height: "calc(100vh - 68px)" }}>
      <Chat
        userData={userData}
        onBack={() => navigate("/app")}
      />
    </div>
  );
}
