import { useState, useEffect, useCallback } from "react";
import { fetchWeather, fetchRisk } from "../api";
import { useProfile } from "../context/ProfileContext";

/**
 * Auto-fetches weather + risk score using saved profile data.
 * Returns { userData, riskData, loading, error, refetch }
 */
export function useAutoRisk() {
  const { profile, profileLoading, isProfileComplete } = useProfile();
  const [userData, setUserData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!profile || !profile.city) return;

    setLoading(true);
    setError(null);
    try {
      const weather = await fetchWeather(profile.city, profile.neighbourhood);
      const combined = { ...profile, ...weather };
      const risk = await fetchRisk(combined);
      setUserData(combined);
      setRiskData(risk);
    } catch (err) {
      console.error("[useAutoRisk] Failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Auto-fetch when profile is loaded and complete
  useEffect(() => {
    if (!profileLoading && isProfileComplete) {
      fetchData();
    }
  }, [profileLoading, isProfileComplete, fetchData]);

  return {
    userData,
    riskData,
    loading: loading || profileLoading,
    error,
    refetch: fetchData,
    isProfileComplete,
  };
}
