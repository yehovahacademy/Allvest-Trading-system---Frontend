
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Navbar from "./Components/Layout/Navbar";
import Footer from "./Components/Layout/Footer";

import IntroPage from "./Pages/IntroPage";
import Dashboard from "./Pages/Dashboard";
import Market from "./Pages/Market";
import Portfolio from "./Pages/Portfolio";
import Orders from "./Pages/Orders";

import Login from "./auth/Login";
import Signup from "./auth/Signup";
import { supabase } from "./lib/supabaseClient";

function TradingApp({ onLogout }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B1220] text-slate-100">
      <Navbar />

      <div className="flex justify-end border-b border-slate-800 px-6 py-3">
        <button
          onClick={onLogout}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Log out
        </button>
      </div>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/markets" element={<Market />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function AppContent() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setCheckingSession(false);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;

        if (error) {
          console.error("Unable to retrieve session:", error.message);
        }

        setSession(data?.session ?? null);
        setCheckingSession(false);
      })
      .catch((error) => {
        if (!mounted) return;

        console.error("Session check failed:", error);
        setSession(null);
        setCheckingSession(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }

    navigate("/", { replace: true });
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1220] text-slate-100">
        Checking your session...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public welcome page; authenticated users go to dashboard */}
      <Route
        path="/"
        element={
          session ? (
            <TradingApp onLogout={handleLogout} />
          ) : (
            <IntroPage />
          )
        }
      />

      {/* Existing authentication pages */}
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to="/" replace />
          ) : (
            <Login
              onSwitchToSignup={() => navigate("/signup")}
            />
          )
        }
      />

      <Route
        path="/signup"
        element={
          session ? (
            <Navigate to="/" replace />
          ) : (
            <Signup
              onSwitchToLogin={() => navigate("/login")}
            />
          )
        }
      />

      {/* Protect all other trading routes */}
      <Route
        path="/*"
        element={
          session ? (
            <TradingApp onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
