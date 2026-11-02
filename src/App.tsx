/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrollfaceBackground } from './components/TrollfaceBackground.tsx';
import { AlbumCarousel } from './components/AlbumCarousel.tsx';

export default function App() {
  return (
    <main className="relative w-full h-full min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center">
      {/* Top-Left Author Information */}
      <header className="fixed top-6 sm:top-8 left-6 sm:left-8 z-30 flex flex-col text-left select-none pointer-events-auto">
        <span
          className="text-[13px] sm:text-[14px] font-medium tracking-tight text-[#0a0a0a] leading-tight"
          style={{
            textShadow:
              '0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff, 1px 1px 2px #ffffff, -1px -1px 2px #ffffff',
          }}
        >
          SLAVYAN13
        </span>
        <a
          href="mailto:nick@0to8.us"
          className="text-[11px] sm:text-[12px] font-normal tracking-wide text-[#737373] hover:text-black transition-colors leading-tight mt-0.5"
          style={{
            textShadow:
              '0 0 8px #ffffff, 0 0 16px #ffffff, 0 0 24px #ffffff, 1px 1px 2px #ffffff, -1px -1px 2px #ffffff',
          }}
        >
          nick@0to8.us
        </a>
      </header>

      {/* Floating 3D Trollface Background */}
      <TrollfaceBackground />

      {/* Main 3D Album Cover Carousel and Minimal Release Information */}
      <AlbumCarousel />
    </main>
  );
}
