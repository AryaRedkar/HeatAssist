import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext(null);

const DEFAULT_PROFILE = {
  city: "Mumbai",
  neighbourhood: "",
  activity: "walking",
  duration: 30,
  profile: [],       // health conditions array
  pet: "",
  plant_type: "",
};

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  /* ── Load profile from Firestore on auth change ── */
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setProfileLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!cancelled) {
          setProfile(snap.exists() ? { ...DEFAULT_PROFILE, ...snap.data() } : null);
        }
      } catch (err) {
        console.error("[ProfileContext] Load failed:", err);
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  /* ── Save profile to Firestore ── */
  const saveProfile = useCallback(async (data) => {
    if (!user) throw new Error("Not authenticated");
    const payload = {
      ...DEFAULT_PROFILE,
      ...data,
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", user.uid), payload, { merge: true });
    setProfile(payload);
    return payload;
  }, [user]);

  /* ── Check if profile has essential data ── */
  const isProfileComplete = Boolean(profile && profile.city);

  return (
    <ProfileContext.Provider value={{
      profile,
      profileLoading,
      saveProfile,
      isProfileComplete,
      DEFAULT_PROFILE,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
