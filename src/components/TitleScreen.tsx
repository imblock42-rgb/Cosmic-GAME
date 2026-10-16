/**
 * Void Station: Beyond the Event Horizon
 * Atmospheric Title Screen with Bespoke SVG Title Lockup & Start Handshake
 */

import React from 'react';
import { soundEngine } from '../game/audio.ts';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenLore: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLore,
  onOpenSettings,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col justify-between items-center z-20 pointer-events-none p-6 md:p-12 select-none">
      {/* Top Tagline */}
      <div className="w-full flex justify-between items-center text-xs tracking-widest text-[#00d5ff] font-['Chakra_Petch'] opacity-80 uppercase">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00d5ff] rounded-none animate-pulse"></span>
          ОРБИТАЛЬНЫЙ ТЕРМИНАЛ // КВАДРАНТ 07-X
        </span>
        <span className="text-[#ffaa00]">СТАТУС: ВНЕ СОБЫТИЙНОГО ГОРИЗОНТА</span>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center justify-center my-auto text-center max-w-4xl pointer-events-auto">
        <div className="relative mb-6 drop-shadow-[0_0_25px_rgba(0,213,255,0.4)]">
          <svg
            className="w-[300px] sm:w-[480px] md:w-[620px] h-auto"
            viewBox="0 0 600 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hexagonal Decorative Framing */}
            <path
              d="M20 65 L40 20 L560 20 L580 65 L560 110 L40 110 Z"
              stroke="#00839e"
              strokeWidth="2"
              fill="#060c1d"
              fillOpacity="0.85"
            />
            <path
              d="M30 65 L45 30 L555 30 L570 65 L555 100 L45 100 Z"
              stroke="#00d5ff"
              strokeWidth="1"
              strokeDasharray="8 4"
            />
            {/* Tech Corner Brackets */}
            <path d="M10 40 L10 15 L35 15" stroke="#ffaa00" strokeWidth="3" />
            <path d="M590 40 L590 15 L565 15" stroke="#ffaa00" strokeWidth="3" />
            <path d="M10 90 L10 115 L35 115" stroke="#ffaa00" strokeWidth="3" />
            <path d="M590 90 L590 115 L565 115" stroke="#ffaa00" strokeWidth="3" />

            {/* Glowing Main Title */}
            <text
              x="300"
              y="68"
              textAnchor="middle"
              className="font-['Chakra_Petch'] font-black text-[38px] tracking-[6px]"
              fill="#ffffff"
              stroke="#003a4d"
              strokeWidth="2"
            >
              VOID STATION
            </text>

            {/* Sub-Header */}
            <text
              x="300"
              y="94"
              textAnchor="middle"
              className="font-['Chakra_Petch'] font-semibold text-[14px] tracking-[8px]"
              fill="#00d5ff"
            >
              BEYOND THE EVENT HORIZON
            </text>
          </svg>
        </div>

        <p className="text-[#a0aec0] text-sm md:text-base max-w-xl mb-8 leading-relaxed font-['Chakra_Petch']">
          Командуйте исследовательской станцией на краю аномалии сингулярности. 
          Управляйте ресурсами, исследуйте темный космос, общайтесь с экипажем и выживайте за горизонтом событий.
        </p>

        {/* Primary Start & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            data-start="true"
            onClick={() => {
              soundEngine.playTerminalClick();
              onStartGame();
            }}
            className="w-56 py-3.5 px-6 bg-[#00839e] hover:bg-[#00d5ff] text-[#03050a] font-['Chakra_Petch'] font-bold text-base tracking-wider uppercase transition-all duration-150 border-2 border-[#80ebff] shadow-[0_0_15px_rgba(0,213,255,0.5)] hover:shadow-[0_0_25px_rgba(0,213,255,0.8)] cursor-pointer active:scale-95"
          >
            ▶ Новая игра
          </button>

          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onOpenLore();
            }}
            className="w-48 py-3.5 px-5 bg-[#121c33] hover:bg-[#1c2e54] text-[#9dfcff] font-['Chakra_Petch'] font-semibold text-sm tracking-wide uppercase transition-all duration-150 border border-[#00839e] cursor-pointer active:scale-95"
          >
            📜 Инструкция / Лор
          </button>

          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onOpenSettings();
            }}
            className="w-44 py-3.5 px-4 bg-[#121c33] hover:bg-[#1c2e54] text-[#9dfcff] font-['Chakra_Petch'] font-semibold text-sm tracking-wide uppercase transition-all duration-150 border border-[#00839e] cursor-pointer active:scale-95"
          >
            ⚙ Настройки
          </button>
        </div>
      </div>

      {/* Flat Single-Line Control Hint */}
      <div className="text-center text-xs text-[#718096] font-['Share_Tech_Mono'] tracking-widest uppercase">
        WASD / Клик Навигация · Пробел / Enter Старт · Esc Пауза · M Вкл/Выкл звук
      </div>
    </div>
  );
};
