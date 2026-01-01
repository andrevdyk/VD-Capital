"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";
import LightPillar from "./light-pillar";
import NavBar from "./navbar";

export default function HeroSection() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black -mx-3 -mb-[1rem] md:-mx-0 md:-mb-0 md:mt-0"> {/* Full viewport height container */}
      {/* LightPillar - now relative to hero, exactly 100vh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LightPillar
          topColor="#000000"
          bottomColor="#af9fff"
          intensity={1.2}
          rotationSpeed={0.4}
          glowAmount={0.003}
          pillarWidth={1.6}
          pillarHeight={0.7}
          noiseIntensity={0}
          pillarRotation={93}
          interactive={false}
          mixBlendMode="normal"
        />
      </div>

      {/* Hero content - now inside the h-screen container */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Navigation */}
        <NavBar />
        {/* Main hero content - takes remaining space */}
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="relative mb-12">
            <h1
              className="text-[80px] md:text-[120px] lg:text-[180px] xl:text-[220px] font-bold tracking-tight text-center leading-none select-none"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #D0D0D0 50%, #808080 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              VD CAPITAL
            </h1>
          </div>

          {/* Search Input */}
          <div className="w-full max-w-2xl">
            <div className="relative group">
              <input
                type="text"
                placeholder="What do you want to know?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-sm border border-gray-700 rounded-2xl px-6 py-4 pr-14 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-all hover:border-gray-600"
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors"
                aria-label="Submit"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </main>

        {/* Scroll Indicator */}
        <div className="pb-12 flex justify-center flex-shrink-0">
          <div className="animate-bounce">
            <svg width="20" height="30" viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 5V25M10 25L5 20M10 25L15 20"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}