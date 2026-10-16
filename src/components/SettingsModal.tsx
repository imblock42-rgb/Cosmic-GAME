/**
 * Void Station: Beyond the Event Horizon
 * Audio & Graphics Settings Modal
 */

import React from 'react';
import { soundEngine } from '../game/audio.ts';

interface SettingsModalProps {
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isMuted,
  onToggleMute,
  scanlinesEnabled,
  onToggleScanlines,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02040a]/85 select-none p-4">
      <div className="w-full max-w-md bg-[#060c1d] border-2 border-[#00839e] p-6 shadow-[0_0_30px_rgba(0,213,255,0.4)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00d5ff] animate-ping" />
            <h2 className="text-sm font-bold tracking-widest text-[#00d5ff] uppercase font-['Chakra_Petch']">
              Параметры терминала // Настройки
            </h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onClose();
            }}
            className="w-7 h-7 flex items-center justify-center bg-[#121c33] hover:bg-[#991b1b] text-white text-xs cursor-pointer border border-[#00839e]"
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="my-5 flex flex-col gap-4 text-xs font-['Chakra_Petch']">
          {/* Sound Synthesizer */}
          <div className="flex items-center justify-between p-3 bg-[#030610] border border-[#1a233a]">
            <div className="flex flex-col">
              <span className="font-bold text-[#dbe7ff]">Процедурный синтезатор звука</span>
              <span className="text-[10px] text-[#718096]">Web Audio API звуковые эффекты и эмбиент</span>
            </div>
            <button
              onClick={() => {
                soundEngine.playTerminalClick();
                onToggleMute();
              }}
              className={`px-3 py-1.5 font-bold uppercase text-xs cursor-pointer transition-all ${
                !isMuted
                  ? 'bg-[#00839e] text-[#03050a] border border-[#80ebff]'
                  : 'bg-[#1e293b] text-[#94a3b8]'
              }`}
            >
              {!isMuted ? 'ВКЛ' : 'ВЫКЛ'}
            </button>
          </div>

          {/* CRT Scanline Filter */}
          <div className="flex items-center justify-between p-3 bg-[#030610] border border-[#1a233a]">
            <div className="flex flex-col">
              <span className="font-bold text-[#dbe7ff]">Эффект CRT-сканлайнов</span>
              <span className="text-[10px] text-[#718096]">Ретро-футуристический кинескоп терминала</span>
            </div>
            <button
              onClick={() => {
                soundEngine.playTerminalClick();
                onToggleScanlines();
              }}
              className={`px-3 py-1.5 font-bold uppercase text-xs cursor-pointer transition-all ${
                scanlinesEnabled
                  ? 'bg-[#00839e] text-[#03050a] border border-[#80ebff]'
                  : 'bg-[#1e293b] text-[#94a3b8]'
              }`}
            >
              {scanlinesEnabled ? 'ВКЛ' : 'ВЫКЛ'}
            </button>
          </div>

          {/* Graphical Pipeline Spec */}
          <div className="p-3 bg-[#030610] border border-[#1a233a] flex flex-col gap-1 text-[11px] text-[#94a3b8]">
            <span className="text-[#ffaa00] font-bold text-[10px] uppercase">Графический пайплайн:</span>
            <span>• Движок: Procedural Canvas Rasterizer</span>
            <span>• Рендеринг: Pixelated / Crisp Edges</span>
            <span>• Разрешение текстур: 32x32 / 64x64 пиксельные матрицы</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1f293d] flex justify-end">
          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onClose();
            }}
            className="px-5 py-2 bg-[#00839e] hover:bg-[#00d5ff] text-[#03050a] font-bold text-xs uppercase cursor-pointer transition-all active:scale-95"
          >
            Сохранить и закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
