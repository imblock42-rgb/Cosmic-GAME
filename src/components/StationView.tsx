/**
 * Void Station: Beyond the Event Horizon
 * Interactive Station Management View
 */

import React, { useRef, useEffect, useState } from 'react';
import { StationSlot, StationStats } from '../game/types.ts';
import { drawPixelStation, drawPixelItemIcon } from '../game/proceduralGraphics.ts';
import { soundEngine } from '../game/audio.ts';

interface StationViewProps {
  slots: StationSlot[];
  stats: StationStats;
  onLaunchDrone: () => void;
  onBoostShields: () => void;
  onScanAnomaly: () => void;
}

export const StationView: React.FC<StationViewProps> = ({
  slots,
  stats,
  onLaunchDrone,
  onBoostShields,
  onScanAnomaly,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedSlot, setSelectedSlot] = useState<StationSlot | null>(slots[0]);
  const [stationMessage, setStationMessage] = useState<string>(
    'Все системы орбитального комплекса функционируют в штатном режиме.'
  );

  // Station canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Orbital Grid Ring
      ctx.strokeStyle = 'rgba(0, 131, 158, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w * 0.38, h * 0.28, 0.15, 0, Math.PI * 2);
      ctx.stroke();

      const hasShieldModule = slots.some((s) => s.slotType === 'shield' && s.installedItem !== null);
      drawPixelStation(ctx, w / 2, h / 2, 1.25, t, hasShieldModule, stats.threatLevel);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [slots, stats.threatLevel]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 p-3 sm:p-4 pt-28 sm:pt-20 pb-20 sm:pb-16 text-[#dbe7ff] select-none overflow-y-auto">
      {/* Left / Center: Interactive Station Viewport */}
      <div className="flex-1 flex flex-col bg-[#060c1d]/85 border-2 border-[#00839e] p-3 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between pb-2 border-b border-[#1f293d]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00d5ff] animate-ping" />
            <h2 className="text-sm font-bold tracking-widest text-[#00d5ff] uppercase font-['Chakra_Petch']">
              Орбитальный узел станции // Сектор 07
            </h2>
          </div>
          <span className="text-xs text-[#718096]">МАСШТАБ 1:1 · РЕЖИМ РЕАЛЬНОГО ВРЕМЕНИ</span>
        </div>

        {/* Canvas Surface */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 my-2 bg-[#030610] border border-[#1a233a] flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={580}
            height={400}
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Quick HUD Overlay on Canvas */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
            <span className="text-[10px] bg-[#0c1326]/80 text-[#00d5ff] px-2 py-0.5 border border-[#00839e]/40">
              ЦЕНТРИФУГА: 4.2 ОБ/МИН
            </span>
            <span className="text-[10px] bg-[#0c1326]/80 text-[#ffaa00] px-2 py-0.5 border border-[#ffaa00]/40">
              ГРАВИТАЦИОННЫЙ ПРИЛИВ: 0.14G
            </span>
          </div>

          <div className="absolute bottom-2 right-2 flex flex-col gap-1 pointer-events-none text-right">
            <span className="text-[10px] text-[#718096]">КООРДИНАТЫ АНОМАЛИИ</span>
            <span className="text-xs font-mono text-[#00d5ff]">RA 17h 45m / DEC -29° 00'</span>
          </div>
        </div>

        {/* Station Command Action Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-auto pt-2 border-t border-[#1f293d]">
          <button
            onClick={() => {
              soundEngine.playWarp();
              onLaunchDrone();
              setStationMessage('Дрон-разведчик запущен! Сбор образцов титана в поясе астероидов начат.');
            }}
            className="p-2.5 bg-[#121c33] hover:bg-[#00839e] hover:text-[#03050a] text-[#00d5ff] border border-[#00839e] font-bold text-xs uppercase transition-all duration-150 cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <span>🚀 Запуск дрона-сборщика</span>
            <span className="text-[9px] opacity-75 font-normal">Расход: 10 энергии (+25 титана)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playShieldHit();
              onBoostShields();
              setStationMessage('Дефлекторные катушки перегружены! Силовой барьер усилен на максимум.');
            }}
            className="p-2.5 bg-[#121c33] hover:bg-[#00839e] hover:text-[#03050a] text-[#00d5ff] border border-[#00839e] font-bold text-xs uppercase transition-all duration-150 cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <span>🛡 Перегрузка щита</span>
            <span className="text-[9px] opacity-75 font-normal">Расход: 15 энергии (+30 к щиту)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playLaser();
              onScanAnomaly();
              setStationMessage('Сканеры Бездны провели спектральный анализ! Угроза аномалии снижена.');
            }}
            className="p-2.5 bg-[#121c33] hover:bg-[#00839e] hover:text-[#03050a] text-[#00d5ff] border border-[#00839e] font-bold text-xs uppercase transition-all duration-150 cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <span>📡 Сканировать горизонт</span>
            <span className="text-[9px] opacity-75 font-normal">Расход: 12 энергии (-15% угрозы)</span>
          </button>
        </div>

        {/* Live Station Log Ticker */}
        <div className="mt-2 p-2 bg-[#0b1021] border border-[#1e293b] text-xs font-mono text-[#94a3b8] flex items-center gap-2">
          <span className="text-[#00d5ff]">› ТЕЛЕМЕТРИЯ:</span>
          <span className="truncate">{stationMessage}</span>
        </div>
      </div>

      {/* Right: Station Modules Hierarchy & Diagnostics */}
      <div className="w-full md:w-80 flex flex-col bg-[#060c1d]/85 border-2 border-[#00839e] p-3 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#00d5ff] pb-2 border-b border-[#1f293d] flex items-center justify-between">
          <span>Слоты оборудования станции</span>
          <span className="text-[10px] text-[#718096]">6 СЛОТОВ</span>
        </h3>

        {/* Slots List */}
        <div className="flex flex-col gap-2 my-2 overflow-y-auto max-h-[280px]">
          {slots.map((slot) => {
            const isSelected = selectedSlot?.id === slot.id;
            return (
              <div
                key={slot.id}
                onClick={() => {
                  soundEngine.playTerminalClick();
                  setSelectedSlot(slot);
                }}
                className={`p-2 border transition-all duration-150 cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#152342] border-[#00d5ff] shadow-[0_0_8px_rgba(0,213,255,0.4)]'
                    : 'bg-[#0a0f21] border-[#1e293b] hover:border-[#00839e]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#7590c2]">
                    {slot.slotType === 'core' && '⚡'}
                    {slot.slotType === 'life_support' && '🌱'}
                    {slot.slotType === 'shield' && '🛡'}
                    {slot.slotType === 'weapon' && '💥'}
                    {slot.slotType === 'hangar' && '🛸'}
                    {slot.slotType === 'scanner' && '📡'}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#e2e8f0]">{slot.name}</span>
                    <span className="text-[10px] text-[#718096]">
                      {slot.installedItem ? slot.installedItem.name : 'Пустой слот'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[9px] px-1.5 py-0.5 font-bold uppercase ${
                    slot.installedItem ? 'bg-[#064e3b] text-[#34d399]' : 'bg-[#1f2937] text-[#6b7280]'
                  }`}
                >
                  {slot.installedItem ? 'АКТИВЕН' : 'ПУСТО'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Slot Detailed Diagnostic Card */}
        {selectedSlot && (
          <div className="mt-auto p-3 bg-[#0a1124] border border-[#00839e] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#ffaa00] font-bold uppercase">Диагностика узла</span>
              <span className="text-[10px] text-[#718096]">ID: {selectedSlot.id}</span>
            </div>

            {selectedSlot.installedItem ? (
              <div className="flex flex-col gap-1.5 text-xs">
                <span className="font-bold text-[#00d5ff]">{selectedSlot.installedItem.name}</span>
                <p className="text-[11px] text-[#94a3b8] leading-tight">
                  {selectedSlot.installedItem.description}
                </p>
                <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-[#1e293b]">
                  {selectedSlot.installedItem.stats?.powerDraw !== undefined && (
                    <span className="text-[#00d5ff]">
                      Энергия: {selectedSlot.installedItem.stats.powerDraw > 0 ? `-${selectedSlot.installedItem.stats.powerDraw}` : `+${Math.abs(selectedSlot.installedItem.stats.powerDraw)}`}
                    </span>
                  )}
                  {selectedSlot.installedItem.stats?.oxygenGen !== undefined && (
                    <span className="text-[#4ade80]">
                      Кислород: +{selectedSlot.installedItem.stats.oxygenGen}
                    </span>
                  )}
                  {selectedSlot.installedItem.stats?.shieldBonus !== undefined && (
                    <span className="text-[#80ebff]">
                      Щит: +{selectedSlot.installedItem.stats.shieldBonus}
                    </span>
                  )}
                  {selectedSlot.installedItem.stats?.attackPower !== undefined && (
                    <span className="text-[#ff3333]">
                      Атака: +{selectedSlot.installedItem.stats.attackPower}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1 text-xs text-[#718096]">
                <span>В данном узле не установлено оборудование.</span>
                <span className="text-[11px] text-[#ffaa00]">
                  Перейдите во вкладку «Модули & Крафт» для сборки и установки модулей.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
