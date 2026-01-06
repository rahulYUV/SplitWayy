import { Navbar } from "@/components/Navbar";
import { useState, useEffect } from "react";
import { SignUpModal } from "@/components/SignUpModal";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { syncUserProfile } from "@/services/userService";
import { LandingPage } from "@/pages/LandingPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AccountSettings } from "@/pages/AccountSettings";
import { DeactivateAccount } from "@/pages/DeactivateAccount";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function App() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'signup' | 'login'>('signup');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (!localStorage.getItem('sessionStartTime')) {
          localStorage.setItem('sessionStartTime', new Date().toISOString());
        }
        // Sync in background to avoid blocking initialization
        syncUserProfile(currentUser).catch(error => {
          console.error("Auto-sync failed:", error);
        });
      } else {
        localStorage.removeItem('sessionStartTime');
      }
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubStore = onSnapshot(userRef, (docSnap) => {
      const data = docSnap.data();
      if (!data) return;
      setProfile(data);

      if (data.isDeactivated) {
        console.log("Account is deactivated. Logging out...");
        auth.signOut();
        return;
      }

      const sessionRevokedAt = data.sessionRevokedAt?.toDate?.() || data.sessionRevokedAt;
      const sessionStartTimeStr = localStorage.getItem('sessionStartTime');
      if (!sessionStartTimeStr) return;

      const sessionStartTime = new Date(sessionStartTimeStr);

      if (sessionRevokedAt && new Date(sessionRevokedAt) > sessionStartTime) {
        console.log("Session revoked globally. Logging out...");
        localStorage.removeItem('sessionStartTime');
        auth.signOut();
      }
    });

    return () => unsubStore();
  }, [user]);

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#32dd9e] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Initializing SplitWayy...</p>
        </div>
      </div>
    );
  }

  const openSignUp = () => {
    setShowOnboarding(false);
    setModalMode('signup');
    setIsSignUpOpen(true);
  };

  const openLogin = () => {
    setModalMode('login');
    setIsSignUpOpen(true);
  };

  return (
    <BrowserRouter>
      <div className="relative flex min-h-screen w-full flex-col items-center bg-white text-black selection:bg-[#32dd9e]/20">
        <Navbar
          onSignUpClick={openSignUp}
          onLoginClick={openLogin}
          user={user}
          profile={profile}
        />

        <SignUpModal
          isOpen={isSignUpOpen}
          onClose={() => setIsSignUpOpen(false)}
          initialMode={modalMode}
          onSignUpSuccess={() => setShowOnboarding(true)}
        />

        <Routes>
          <Route path="/" element={
            user ? (
              <DashboardLayout
                user={user}
                showOnboarding={showOnboarding}
                onOnboardingComplete={() => setShowOnboarding(false)}
              />
            ) : (
              <LandingPage />
            )
          } />

          <Route path="/account" element={
            user ? (
              // Reuse DashboardLayout structure but replace Hero with AccountSettings
              // Actually DashboardLayout currently hardcodes Hero. 
              // We should make DashboardLayout accept children or create a new Layout wrapper.
              // For now, let's just render the AccountPage with a top spacer for the fixed Navbar.
              <div className="w-full pt-24 min-h-screen flex justify-center">
                <AccountSettings user={user} />
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          } />

          <Route path="/deactivate" element={
            user ? (
              <div className="w-full pt-24 min-h-screen flex justify-center">
                <DeactivateAccount />
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
