
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChartCandlestick,
  ArrowLeftRight,
  BriefcaseBusiness,
} from "lucide-react";

import Navbar from "../Components/Layout/Navbar";
import Footer from "../Components/Layout/Footer";
import tradingVideo from "../assets/trading-background.mp4";

const headlines = [
  "Welcome to your Trading Journey",
  "Explore the World of Markets",
  "Your Portfolio, All in One Place",
];

export default function IntroPage() {
  const navigate = useNavigate();

  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setDisplayedText(headlines[0]);
      return;
    }

    const currentHeadline = headlines[headlineIndex];

    let delay = deleting ? 35 : 75;

    if (!deleting && displayedText === currentHeadline) {
      delay = 1800;
    } else if (deleting && displayedText === "") {
      delay = 400;
    }

    const timer = window.setTimeout(() => {
      if (!deleting && displayedText === currentHeadline) {
        setDeleting(true);
      } else if (deleting && displayedText === "") {
        setDeleting(false);
        setHeadlineIndex(
          (previous) => (previous + 1) % headlines.length
        );
      } else {
        setDisplayedText(
          deleting
            ? currentHeadline.slice(0, displayedText.length - 1)
            : currentHeadline.slice(0, displayedText.length + 1)
        );
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [displayedText, deleting, headlineIndex]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B1220] text-white">
      {/* Video background and hero */}
      <section className="relative isolate min-h-screen overflow-hidden">
        <video
          className="pointer-events-none absolute inset-0 z-[-2] h-full w-full object-cover"
          src={tradingVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onError={(event) => {
            console.error(
              "Trading background video failed to load:",
              event.currentTarget.error
            );
          }}
        />

        {/* Video contrast overlay */}
        <div className="pointer-events-none absolute inset-0 z-[-1] bg-gradient-to-r from-[#0B1220]/90 via-[#0B1220]/65 to-[#0B1220]/35" />

        {/* Existing navbar */}
        <div className="relative z-10">
          <Navbar />
        </div>

        {/* Welcome hero */}
        <div className="relative z-10 flex min-h-[calc(100vh-80px)] flex-col justify-center px-6 py-16 md:px-14 lg:px-24">
          <div className="max-w-4xl">
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-emerald-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              A SMARTER TRADING EXPERIENCE
            </div>

            <h1
              className="min-h-[2.5em] max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              aria-label={headlines[0]}
            >
              <span aria-hidden="true">
                {displayedText}
                <span className="ml-1 inline-block animate-pulse text-emerald-400">
                  |
                </span>
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Explore market data, manage your buy and sell
              orders, and track your portfolio through one
              simple, intuitive platform.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-9 inline-flex items-center gap-3 rounded-xl bg-emerald-400 px-7 py-4 font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-[#0B1220]"
            >
              Get Started
              <ArrowRight size={20} />
            </button>

            <p className="mt-4 text-sm text-slate-300">
              Sign in or create an account to continue.
            </p>
          </div>

          <div className="mt-16 flex items-center gap-4 text-xs font-semibold tracking-[0.3em] text-slate-300 sm:absolute sm:bottom-10 sm:left-14 lg:left-24">
            <span>EXPLORE</span>
            <span className="h-px w-8 bg-emerald-400" />
            <span>TRADE</span>
            <span className="h-px w-8 bg-emerald-400" />
            <span>TRACK</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 bg-[#0B1220] px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-[0.22em] text-emerald-300">
              BUILT AROUND YOU
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to get started.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              One platform to explore the markets and manage
              your trading activity.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-emerald-400/40">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <ChartCandlestick size={25} />
              </span>
              <h3 className="mt-6 text-xl font-semibold">
                Explore Markets
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                View available instruments and their market
                prices using the connected data feed.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-emerald-400/40">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <ArrowLeftRight size={25} />
              </span>
              <h3 className="mt-6 text-xl font-semibold">
                Manage Orders
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Place buy and sell orders and review your
                order history.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-emerald-400/40">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <BriefcaseBusiness size={25} />
              </span>
              <h3 className="mt-6 text-xl font-semibold">
                Track Portfolio
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Keep track of your holdings and average
                purchase prices.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Existing footer */}
      <Footer />
    </main>
  );
}
