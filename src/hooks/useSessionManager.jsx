import React, { useEffect, useRef, useCallback } from "react";

import { useAuth } from "../context/AuthContext";
import { useAuthActions } from "./useAuth";
import { SESSION_TIMEOUT, SESSION_WARNING_TIME } from "../utils/constants";
import toast from "react-hot-toast";
import SessionExpiringToast from "../components/common/SessionExpiringToast";

export const useSessionManager = () => {
  const { user } = useAuth();
  const { logout } = useAuthActions();

  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const activityRef = useRef(Date.now());

  // Reset activity timestamp
  const resetActivity = useCallback(() => {
    activityRef.current = Date.now();
  }, []);

  // Clear timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
  }, []);

  // Set up session timeout
  const setupSessionTimeout = useCallback(() => {
    clearTimers();

    // Warning timer
    warningRef.current = setTimeout(() => {
      toast.custom(
        (t) => (
          <SessionExpiringToast
            toastId={t.id}
            onStayLoggedIn={() => {
              resetActivity();
            }}
            onLogout={() => {
              logout();
            }}
          />
        ),
        { duration: Infinity }
      );
    }, SESSION_WARNING_TIME);

    // Logout timer
    timeoutRef.current = setTimeout(() => {
      toast.error("Your session has expired. Please login again.");
      logout();
    }, SESSION_TIMEOUT);
  }, [logout, resetActivity, clearTimers]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      resetActivity();
      setupSessionTimeout();
    };

    // Monitor various activities
    const events = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initial setup
    setupSessionTimeout();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimers();
    };
  }, [user, resetActivity, setupSessionTimeout, clearTimers]);

  return { resetActivity };
};
