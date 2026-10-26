import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";

import Dashboard from "./Pages/Dashboard";
import Market from "./Pages/Market";        // ← Fixed (file is Market.jsx)
import Portfolio from "./Pages/Portfolio";
import Orders from "./Pages/Orders";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#0B1220] text-slate-100">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/markets" element={<Market />} />   {/* ← Fixed */}
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}