/**
 * Void Station: Beyond the Event Horizon
 * Status Modals: Pause, Victory, and Game Over
 */

import React from 'react';
import { StationStats } from '../game/types.ts';
import { soundEngine } from '../game/audio.ts';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onExitToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onExitToTitle,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02040a]/80 select-none p-4">
      <div className="w-full max-w-md bg-[#060c1d] border-2 border-[#00839e] p-6 shadow-[0_0_30px_rgba(0,213,255,0.4)] flex flex-col items-center text-center">
        <span className="text-xs text-[#ffaa00] font-bold tracking-widest uppercase">
          БОРТОВОЙ КОМПЬЮТЕР // СИМУЛЯЦИЯ ПРИОСТАНОВЛЕНА
        </span>
        <h2 className="text-2xl font-black text-white uppercase tracking-wider my-3 font-['Chakra_Petch']">
          ПАУЗА
        </h2>

        <p className="text-xs text-[#94a3b8] mb-6 leading-relaxed">
          Телеметрия реактора и гравитационные поля зафиксированы. Вы можете возобновить командование или перезагрузить системы.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onResume();
            }}
            className="w-full py-3 bg-[#00839e] hover:bg-[#00d5ff] text-[#03050a] font-bold text-sm uppercase transition-all cursor-pointer border border-[#80ebff] active:scale-95"
          >
            ▶ Продолжить (Esc)
          </button>

          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onRestart();
            }}
            className="w-full py-2.5 bg-[#121c33] hover:bg-[#1c2e54] text-[#dbe7ff] font-semibold text-xs uppercase transition-all cursor-pointer border border-[#00839e]"
          >
            🔄 Начать заново
          </button>

          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onExitToTitle();
            }}
            className="w-full py-2 bg-[#090f20] hover:bg-[#991b1b] text-[#94a3b8] hover:text-white font-semibold text-xs uppercase transition-all cursor-pointer border border-[#1e293b]"
          >
            ⏹ Выйти в главное меню
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  stats: StationStats;
  reason: string;
  onRetry: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  reason,
  onRetry,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0202]/90 select-none p-4">
      <div className="w-full max-w-lg bg-[#140606] border-2 border-[#ff3333] p-6 shadow-[0_0_35px_rgba(255,51,51,0.5)] flex flex-col items-center text-center">
        <span className="text-xs text-[#ff3333] font-bold tracking-widest uppercase animate-pulse">
          КРИТИЧЕСКАЯ АВАРИЯ // СТАНЦИЯ УНИЧТОЖЕНА
        </span>
        <h2 className="text-3xl font-black text-white uppercase tracking-wider my-3 font-['Chakra_Petch']">
          ПОГЛОЩЕНИЕ БЕЗДНОЙ
        </h2>

        <p className="text-xs sm:text-sm text-[#fca5a5] mb-6 leading-relaxed bg-[#250808] p-3 border border-[#991b1b]">
          {reason}
        </p>

        {/* Stats Metrics */}
        <div className="grid grid-cols-3 gap-2 w-full mb-6 text-center">
          <div className="p-2 bg-[#1f0b0b] border border-[#7f1d1d]">
            <span className="text-[10px] text-[#f87171] uppercase">ПРОЖИТО ЦИКЛОВ</span>
            <span className="text-lg font-bold text-white block tabular-nums">#{stats.cycle}</span>
          </div>
          <div className="p-2 bg-[#1f0b0b] border border-[#7f1d1d]">
            <span className="text-[10px] text-[#f87171] uppercase">ДОБЫТО ТИТАНА</span>
            <span className="text-lg font-bold text-white block tabular-nums">{Math.round(stats.titanium)}</span>
          </div>
          <div className="p-2 bg-[#1f0b0b] border border-[#7f1d1d]">
            <span className="text-[10px] text-[#f87171] uppercase">КРИСТАЛЛОВ</span>
            <span className="text-lg font-bold text-white block tabular-nums">{Math.round(stats.voidCrystals)}</span>
          </div>
        </div>

        <button
          data-start="true"
          onClick={() => {
            soundEngine.playTerminalClick();
            onRetry();
          }}
          className="w-full py-3.5 bg-[#dc2626] hover:bg-[#ef4444] text-white font-bold text-sm uppercase transition-all cursor-pointer border border-[#fca5a5] shadow-[0_0_15px_rgba(239,68,68,0.6)] active:scale-95"
        >
          🔄 Повторить экспедицию
        </button>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  stats: StationStats;
  onContinue: () => void;
  onExit: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  onContinue,
  onExit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020a06]/85 select-none p-4">
      <div className="w-full max-w-lg bg-[#06180e] border-2 border-[#22c55e] p-6 shadow-[0_0_35px_rgba(34,197,94,0.5)] flex flex-col items-center text-center">
        <span className="text-xs text-[#4ade80] font-bold tracking-widest uppercase">
          ТРИУМФ НАУКИ // СЕКРЕТ СИНГУЛЯРНОСТИ РАЗГАДАН
        </span>
        <h2 className="text-3xl font-black text-white uppercase tracking-wider my-3 font-['Chakra_Petch']">
          ПОБЕДА НАД ГОРИЗОНТОМ
        </h2>

        <p className="text-xs sm:text-sm text-[#bbf7d0] mb-6 leading-relaxed bg-[#0b2816] p-3 border border-[#166534]">
          Октаэдр Бездны стабилизирован квантовым радаром станции! Гравитационные волны подчинены, а научная база «Горизонт-01» стала первым форпостом человечества внутри аномалии.
        </p>

        <div className="grid grid-cols-3 gap-2 w-full mb-6 text-center">
          <div className="p-2 bg-[#092213] border border-[#166534]">
            <span className="text-[10px] text-[#86efac] uppercase">ВСЕГО ЦИКЛОВ</span>
            <span className="text-lg font-bold text-white block tabular-nums">#{stats.cycle}</span>
          </div>
          <div className="p-2 bg-[#092213] border border-[#166534]">
            <span className="text-[10px] text-[#86efac] uppercase">ПРОЧНОСТЬ БАЗЫ</span>
            <span className="text-lg font-bold text-white block tabular-nums">{Math.round(stats.hull)}%</span>
          </div>
          <div className="p-2 bg-[#092213] border border-[#166534]">
            <span className="text-[10px] text-[#86efac] uppercase">КРИСТАЛЛОВ</span>
            <span className="text-lg font-bold text-white block tabular-nums">{Math.round(stats.voidCrystals)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            data-start="true"
            onClick={() => {
              soundEngine.playTerminalClick();
              onContinue();
            }}
            className="w-full py-3 bg-[#22c55e] hover:bg-[#4ade80] text-[#03050a] font-bold text-sm uppercase transition-all cursor-pointer border border-[#86efac] active:scale-95"
          >
            🚀 Продолжить бесконечную экспансию
          </button>
          <button
            onClick={() => {
              soundEngine.playTerminalClick();
              onExit();
            }}
            className="w-full py-2 bg-[#06180e] hover:bg-[#0f2e1b] text-[#86efac] font-semibold text-xs uppercase transition-all cursor-pointer border border-[#166534]"
          >
            ⏹ Главное меню
          </button>
        </div>
      </div>
    </div>
  );
};
