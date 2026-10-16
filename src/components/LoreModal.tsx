/**
 * Void Station: Beyond the Event Horizon
 * Comprehensive Lore & Station Manual Modal
 */

import React from 'react';
import { soundEngine } from '../game/audio.ts';

interface LoreModalProps {
  onClose: () => void;
}

export const LoreModal: React.FC<LoreModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02040a]/85 select-none p-4">
      <div className="w-full max-w-2xl bg-[#060c1d] border-2 border-[#00839e] p-6 shadow-[0_0_30px_rgba(0,213,255,0.4)] flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00d5ff] animate-ping" />
            <h2 className="text-base font-bold tracking-widest text-[#00d5ff] uppercase font-['Chakra_Petch']">
              Бортовой кодекс // Руководство командира станции
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

        {/* Scrollable Lore Content */}
        <div className="my-4 overflow-y-auto pr-2 flex flex-col gap-4 text-xs leading-relaxed text-[#cbd5e1] font-['Chakra_Petch']">
          <section className="p-3 bg-[#030610] border border-[#1a233a]">
            <h3 className="text-sm font-bold text-[#ffaa00] uppercase mb-1">
              1. Сеттинг: Бездна и Горизонт Событий
            </h3>
            <p>
              Станция «Горизонт-01» развернута в точке Лагранжа сверхмассивной темной аномалии. 
              Гравитационные приливные силы искривляют пространство-время, порождая уникальные Кристаллы Бездны. 
              Ваша цель — поддерживать станцию в рабочем состоянии, исследовать сектор и разгадать природу сингулярности.
            </p>
          </section>

          <section className="p-3 bg-[#030610] border border-[#1a233a]">
            <h3 className="text-sm font-bold text-[#00d5ff] uppercase mb-1">
              2. Менеджмент ресурсов и жизнь экипажа
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-[#94a3b8]">
              <li>
                <strong className="text-[#dbe7ff]">Энергия (⚡):</strong> Генерируется фотонными крыльями. Питает щиты, гидропонику и лазеры. Если энергия упадет до нуля, системы жизнеобеспечения перестанут снабжать станцию кислородом.
              </li>
              <li>
                <strong className="text-[#4ade80]">Кислород (🌱):</strong> Потребляется экипажем (4 чел.). Производится био-куполом гидропоники. Падение кислорода до нуля ведет к удушью и гибели станции.
              </li>
              <li>
                <strong className="text-[#dbe7ff]">Титан (⛏):</strong> Фундаментальный металл для ремонта пробоин корпуса и синтеза новых модулей.
              </li>
              <li>
                <strong className="text-[#b83bfa]">Кристаллы Бездны (🔮):</strong> Редчайший катализатор темной энергии, необходимый для высокоуровневых щитов и квантовых радаров.
              </li>
              <li>
                <strong className="text-[#ff3333]">Угроза аномалии (⚠):</strong> При росте угрозы выше 80% гравитационные штормы наносят прямой урон обшивке. Снижайте угрозу сканированием!
              </li>
            </ul>
          </section>

          <section className="p-3 bg-[#030610] border border-[#1a233a]">
            <h3 className="text-sm font-bold text-[#22c55e] uppercase mb-1">
              3. Экипаж станции и задания (NPC)
            </h3>
            <p>
              Общайтесь с тремя ключевыми фигурами на борту:
              <br />
              • <strong className="text-[#ffaa00]">Векс:</strong> Починка корпуса, калибровка реактора и укрепление переборок.
              <br />
              • <strong className="text-[#00d5ff]">Элира:</strong> Разведка аномальных узлов карты, навигация сквозь звездные штормы.
              <br />
              • <strong className="text-[#c044ff]">Калло:</strong> Сбыт кристаллов, нелегальные военные модули и заказы на пиратов.
            </p>
          </section>

          <section className="p-3 bg-[#030610] border border-[#1a233a]">
            <h3 className="text-sm font-bold text-[#f43f5e] uppercase mb-1">
              4. Тактический космический бой
            </h3>
            <p>
              При встрече с пиратами или порождениями сингулярности следите за намерениями врага (красная строка телеграфа):
              <br />
              - Против мощных залпов используйте <strong className="text-[#ffaa00]">ЭМИ-срыв</strong> или <strong className="text-[#34d399]">Маневровое уклонение</strong>.
              <br />
              - Сначала сбивайте щиты противника, затем уничтожайте корпус залпом тяжелой плазмы!
            </p>
          </section>
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
            Понятно, на боевой пост!
          </button>
        </div>
      </div>
    </div>
  );
};
