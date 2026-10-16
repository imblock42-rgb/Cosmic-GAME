/**
 * Void Station: Beyond the Event Horizon
 * Sci-Fi Neon Terminal HUD with World-Matched Perimeter Clusters
 */

import React, { useEffect, useRef } from 'react';
import { StationStats } from '../game/types.ts';
import { drawPixelItemIcon } from '../game/proceduralGraphics.ts';
import { soundEngine } from '../game/audio.ts';

export type ActiveTab = 'station' | 'inventory' | 'map' | 'crew' | 'combat';

interface HUDProps {
  stats: StationStats;
  netEnergy: number;
  netOxygen: number;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onAdvanceCycle: () => void;
  onTogglePause: () => void;
  onOpenSettings: () => void;
  onOpenLore: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  inCombat: boolean;
  activeAlert: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  netEnergy,
  netOxygen,
  activeTab,
  onTabChange,
  onAdvanceCycle,
  onTogglePause,
  onOpenSettings,
  onOpenLore,
  isMuted,
  onToggleMute,
  inCombat,
  activeAlert,
}) => {
  // Mini icon canvases for HUD resources
  const tiCanvasRef = useRef<HTMLCanvasElement>(null);
  const enCanvasRef = useRef<HTMLCanvasElement>(null);
  const o2CanvasRef = useRef<HTMLCanvasElement>(null);
  const vcCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (tiCanvasRef.current) {
      const ctx = tiCanvasRef.current.getContext('2d');
      if (ctx) drawPixelItemIcon(ctx, 'titanium_ore', 'common', 0, 0, 24);
    }
    if (enCanvasRef.current) {
      const ctx = enCanvasRef.current.getContext('2d');
      if (ctx) drawPixelItemIcon(ctx, 'energy_cell', 'rare', 0, 0, 24);
    }
    if (o2CanvasRef.current) {
      const ctx = o2CanvasRef.current.getContext('2d');
      if (ctx) drawPixelItemIcon(ctx, 'bio_gel', 'common', 0, 0, 24);
    }
    if (vcCanvasRef.current) {
      const ctx = vcCanvasRef.current.getContext('2d');
      if (ctx) drawPixelItemIcon(ctx, 'void_crystal', 'epic', 0, 0, 24);
    }
  }, []);

  const threatColor =
    stats.threatLevel > 75 ? 'text-[#ff3333]' : stats.threatLevel > 40 ? 'text-[#ffaa00]' : 'text-[#00d5ff]';

  const hullPct = Math.max(0, Math.min(100, (stats.hull / stats.maxHull) * 100));

  return (
    <header className="absolute inset-0 pointer-events-none flex flex-col justify-between select-none z-30 p-1 sm:p-4">
      {/* Top Bar: Sci-Fi Neon Perimeter Readouts */}
      <div className="w-full flex flex-col gap-1 sm:gap-2">
        <div className="w-full flex flex-wrap items-center justify-between gap-2 sm:gap-3 bg-[#060c1d]/90 border-b-2 border-[#00839e] px-2 sm:px-4 py-1.5 sm:py-2 pointer-events-auto shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
          {/* Station Identity & Integrity */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] tracking-widest text-[#7590c2] font-semibold">СТАНЦИЯ // ГОРИЗОНТ-01</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#e2e8f0]">КОРПУС:</span>
                <div className="w-24 sm:w-32 h-3.5 bg-[#1a2233] border border-[#2d3a54] relative overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      hullPct < 30 ? 'bg-[#ff3333]' : hullPct < 60 ? 'bg-[#ffaa00]' : 'bg-[#00d5ff]'
                    }`}
                    style={{ width: `${hullPct}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white tabular-nums">
                    {Math.round(stats.hull)} / {stats.maxHull}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resources Clusters with Pixel Icons & Tabular Numerals */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            {/* Titanium */}
            <div className="flex items-center gap-1.5" title="Титаниум для строительства и ремонта">
              <canvas ref={tiCanvasRef} width={24} height={24} className="w-6 h-6 border border-[#2d3a54]" />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-[#718096] uppercase font-bold">ТИТАН</span>
                <span className="text-xs sm:text-sm font-bold text-[#dbe7ff] tabular-nums">
                  {Math.round(stats.titanium)}
                </span>
              </div>
            </div>

            {/* Energy */}
            <div className="flex items-center gap-1.5" title="Энергия станции">
              <canvas ref={enCanvasRef} width={24} height={24} className="w-6 h-6 border border-[#00839e]" />
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-[#718096] uppercase font-bold">ЭНЕРГИЯ</span>
                  <span
                    className={`text-[9px] font-bold ${
                      netEnergy >= 0 ? 'text-[#2ee66b]' : 'text-[#ff3333]'
                    }`}
                  >
                    ({netEnergy >= 0 ? `+${netEnergy}` : netEnergy})
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#00d5ff] tabular-nums">
                  {Math.round(stats.energy)} / {stats.maxEnergy}
                </span>
              </div>
            </div>

            {/* Oxygen */}
            <div className="flex items-center gap-1.5" title="Кислород и жизнеобеспечение">
              <canvas ref={o2CanvasRef} width={24} height={24} className="w-6 h-6 border border-[#166534]" />
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-[#718096] uppercase font-bold">КИСЛОРОД</span>
                  <span
                    className={`text-[9px] font-bold ${
                      netOxygen >= 0 ? 'text-[#2ee66b]' : 'text-[#ff3333]'
                    }`}
                  >
                    ({netOxygen >= 0 ? `+${netOxygen.toFixed(1)}` : netOxygen.toFixed(1)})
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#4ade80] tabular-nums">
                  {Math.round(stats.oxygen)}%
                </span>
              </div>
            </div>

            {/* Void Crystals */}
            <div className="flex items-center gap-1.5" title="Редкие Кристаллы Бездны">
              <canvas ref={vcCanvasRef} width={24} height={24} className="w-6 h-6 border border-[#691e9e]" />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-[#718096] uppercase font-bold">КРИСТАЛЛЫ</span>
                <span className="text-xs sm:text-sm font-bold text-[#b83bfa] tabular-nums">
                  {Math.round(stats.voidCrystals)}
                </span>
              </div>
            </div>

            {/* Anomaly Threat Level */}
            <div className="flex items-center gap-2 border-l border-[#2d3a54] pl-3">
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-[#718096] uppercase font-bold">УГРОЗА БЕЗДНЫ</span>
                <span className={`text-xs sm:text-sm font-bold tabular-nums ${threatColor}`}>
                  {Math.round(stats.threatLevel)}%
                </span>
              </div>
            </div>

            {/* Cycle / Date */}
            <div className="flex items-center gap-2 border-l border-[#2d3a54] pl-3">
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-[#718096] uppercase font-bold">ЦИКЛ СТАНЦИИ</span>
                <span className="text-xs sm:text-sm font-bold text-[#ffaa00] tabular-nums">
                  #{stats.cycle}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playTerminalClick();
                onAdvanceCycle();
              }}
              title="Перейти к следующему циклу (выработка ресурсов / расчет систем)"
              className="px-3 py-1.5 bg-[#00839e] hover:bg-[#00d5ff] text-[#03050a] text-xs font-bold uppercase transition-all duration-150 cursor-pointer border border-[#80ebff] active:scale-95 flex items-center gap-1.5"
            >
              ⏩ Цикл +1
            </button>

            <button
              tabIndex={-1}
              onClick={() => {
                soundEngine.playTerminalClick();
                onToggleMute();
              }}
              title="Вкл / Выкл звук"
              className="w-8 h-8 flex items-center justify-center bg-[#121c33] hover:bg-[#1c2e54] text-[#00d5ff] border border-[#00839e] cursor-pointer text-xs"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            <button
              tabIndex={-1}
              onClick={() => {
                soundEngine.playTerminalClick();
                onTogglePause();
              }}
              title="Пауза [Esc]"
              className="w-8 h-8 flex items-center justify-center bg-[#121c33] hover:bg-[#1c2e54] text-[#ffaa00] border border-[#00839e] cursor-pointer text-xs"
            >
              ⏸
            </button>

            <button
              tabIndex={-1}
              onClick={() => {
                soundEngine.playTerminalClick();
                onOpenLore();
              }}
              title="Справка / Лор"
              className="w-8 h-8 flex items-center justify-center bg-[#121c33] hover:bg-[#1c2e54] text-[#dbe7ff] border border-[#00839e] cursor-pointer text-xs"
            >
              ❓
            </button>

            <button
              tabIndex={-1}
              onClick={() => {
                soundEngine.playTerminalClick();
                onOpenSettings();
              }}
              title="Настройки"
              className="w-8 h-8 flex items-center justify-center bg-[#121c33] hover:bg-[#1c2e54] text-[#dbe7ff] border border-[#00839e] cursor-pointer text-xs"
            >
              ⚙
            </button>
          </div>
        </div>

        {/* Emergency Alert Ticker (if active) */}
        {activeAlert && (
          <div className="w-full bg-[#991b1b]/90 border border-[#ff3333] text-white text-xs font-bold px-4 py-1.5 flex items-center justify-between animate-pulse pointer-events-auto">
            <span>⚠ {activeAlert}</span>
            <span className="text-[10px] text-[#fecaca] uppercase">УГРОЗА СИСТЕМЕ</span>
          </div>
        )}
      </div>

      {/* Bottom Dock Navigation Strip */}
      <div className="w-full flex justify-center pb-1 sm:pb-2 px-2 overflow-x-auto">
        <nav aria-label="Game Navigation" className="flex items-center gap-1 sm:gap-2 bg-[#060c1d]/95 border-2 border-[#00839e] p-1 sm:p-1.5 pointer-events-auto shadow-[0_0_20px_rgba(0,131,158,0.3)] max-w-full overflow-x-auto">
          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onTabChange('station');
            }}
            className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'station'
                ? 'bg-[#00839e] text-[#03050a] border border-[#80ebff] shadow-[0_0_10px_rgba(0,213,255,0.6)]'
                : 'bg-[#0f172a] text-[#9dfcff] hover:bg-[#1e293b] border border-transparent'
            }`}
          >
            🛸 Станция
          </button>

          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onTabChange('inventory');
            }}
            className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-[#00839e] text-[#03050a] border border-[#80ebff] shadow-[0_0_10px_rgba(0,213,255,0.6)]'
                : 'bg-[#0f172a] text-[#9dfcff] hover:bg-[#1e293b] border border-transparent'
            }`}
          >
            📦 Модули & Крафт
          </button>

          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onTabChange('map');
            }}
            className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-[#00839e] text-[#03050a] border border-[#80ebff] shadow-[0_0_10px_rgba(0,213,255,0.6)]'
                : 'bg-[#0f172a] text-[#9dfcff] hover:bg-[#1e293b] border border-transparent'
            }`}
          >
            🌌 Карта сектора
          </button>

          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onTabChange('crew');
            }}
            className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'crew'
                ? 'bg-[#00839e] text-[#03050a] border border-[#80ebff] shadow-[0_0_10px_rgba(0,213,255,0.6)]'
                : 'bg-[#0f172a] text-[#9dfcff] hover:bg-[#1e293b] border border-transparent'
            }`}
          >
            👤 Экипаж & NPC
          </button>

          {inCombat && (
            <button
              onClick={() => {
                soundEngine.playTerminalClick();
                onTabChange('combat');
              }}
              className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 bg-[#991b1b] text-white border border-[#ff3333] animate-pulse"
            >
              ⚔ БОЙ!
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
