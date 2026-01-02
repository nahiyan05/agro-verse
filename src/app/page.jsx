"use client";

import { useState } from "react";
import { HeroSection } from "./_components/hero-section";

export default function Home() {
  const [loginFormOpen, setLoginFormOpen] = useState(false);

  return (
    <div className="relative w-full min-h-screen">
      <div className="relative z-10">
        {/* First Page - Hero */}
        <div id="home" className="bg-white">
          <HeroSection
            loginFormOpen={loginFormOpen}
            setLoginFormOpen={setLoginFormOpen}
          />
        </div>
      </div>
    </div>
  );
}
