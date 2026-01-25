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

// New Dashboard Sub-Pages
import { DashboardHome } from "@/components/DashboardHome";
import { RecentActivity } from "@/components/RecentActivity";
import { AllExpenses } from "@/components/AllExpenses";
import { GroupView } from "@/components/GroupView";
import { FriendView } from "@/components/FriendView";
import { PrivacyPolicy } from "@/pages/PrivacyPolicy";
import { TermsConditions } from "@/pages/TermsConditions";
import { RefundPolicy } from "@/pages/RefundPolicy";
import { ContactUs } from "@/pages/ContactUs";
import { ShippingPolicy } from "@/pages/ShippingPolicy";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { QuickSplit } from "@/pages/QuickSplit";

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
        auth.signOut();
        return;
      }

      const sessionRevokedAt = data.sessionRevokedAt?.toDate?.() || data.sessionRevokedAt;
      const sessionStartTimeStr = localStorage.getItem('sessionStartTime');
      if (!sessionStartTimeStr) return;
      const sessionStartTime = new Date(sessionStartTimeStr);

      if (sessionRevokedAt && new Date(sessionRevokedAt) > sessionStartTime) {
        localStorage.removeItem('sessionStartTime');
        auth.signOut();
      }
    });

    return () => unsubStore();
  }, [user]);

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-12 h-12 text-black" />
          <p className="text-black font-bold tracking-widest uppercase text-xs">Loading...</p>
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

  const firstName = profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'USER';
  const fullName = profile?.displayName || user?.displayName || 'User';

  return (
    <BrowserRouter>
      <ExpenseProvider user={user}>
        <div className="relative flex min-h-screen w-full flex-col items-center bg-white text-black selection:bg-[#32dd9e]/20">
          <Toaster />
          {!user && (
            <Navbar
              onSignUpClick={openSignUp}
              onLoginClick={openLogin}
              user={user}
              profile={profile}
            />
          )}

          <SignUpModal
            isOpen={isSignUpOpen}
            onClose={() => setIsSignUpOpen(false)}
            initialMode={modalMode}
            onSignUpSuccess={() => setShowOnboarding(false)}
          />

          <Routes>
            <Route path="/" element={
              user ? (
                <DashboardLayout
                  user={user}
                  profile={profile}
                  showOnboarding={showOnboarding}
                  onOnboardingComplete={() => setShowOnboarding(false)}
                />
              ) : (
                <LandingPage />
              )
            }>
              {/* Sub-routes inside Dashboard Mat */}
              <Route index element={<DashboardHome userName={fullName} />} />
              <Route path="activity" element={<RecentActivity userName={firstName} user={user!} />} />
              <Route path="expenses" element={<AllExpenses userName={firstName} />} />
              <Route path="group/:id" element={<GroupView userName={user?.displayName || firstName} />} />
              <Route path="friend/:id" element={<FriendView userName={firstName} />} />
            </Route>

            <Route path="/account" element={
              user ? (
                <DashboardLayout user={user} profile={profile}>
                  <AccountSettings user={user} />
                </DashboardLayout>
              ) : (
                <Navigate to="/" replace />
              )
            } />

            <Route path="/deactivate" element={
              user ? (
                <DashboardLayout user={user} profile={profile}>
                  <DeactivateAccount />
                </DashboardLayout>
              ) : (
                <Navigate to="/" replace />
              )
            } />

            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* ... inside function App ... */}
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />

            {/* Guest Feature */}
            <Route path="/quick-split" element={<QuickSplit />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ExpenseProvider>
    </BrowserRouter>
  )
}

export default App
