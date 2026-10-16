/**
 * Void Station: Beyond the Event Horizon
 * NPC Crew Comms & Procedural Pixel Portrait Dialogue Terminal
 */

import React, { useRef, useEffect, useState } from 'react';
import { DialogueChoice, NPCProfile, Quest, StationStats } from '../game/types.ts';
import { drawNPCPortrait } from '../game/proceduralGraphics.ts';
import { soundEngine } from '../game/audio.ts';

interface NPCLogViewProps {
  npcs: Record<'vex' | 'elira' | 'kallo', NPCProfile>;
  quests: Quest[];
  stats: StationStats;
  onAcceptQuest: (questId: string) => void;
  onClaimQuestReward: (questId: string) => void;
  onDialogueAction: (choice: DialogueChoice, npcId: 'vex' | 'elira' | 'kallo') => void;
}

export const NPCLogView: React.FC<NPCLogViewProps> = ({
  npcs,
  quests,
  stats,
  onAcceptQuest,
  onClaimQuestReward,
  onDialogueAction,
}) => {
  const [activeNpcId, setActiveNpcId] = useState<'vex' | 'elira' | 'kallo'>('vex');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeNpc = npcs[activeNpcId];
  const currentNode = activeNpc.dialogueTree[activeNpc.activeDialogueId] || activeNpc.dialogueTree['start'];

  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Animate procedural pixel portrait
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawNPCPortrait(ctx, activeNpcId, 0, 0, canvas.width, canvas.height, t);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeNpcId]);

  // Typewriter text effect
  useEffect(() => {
    const fullText = currentNode.npcText;
    setDisplayedText('');
    setIsTyping(true);

    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        if (index % 3 === 0) {
          soundEngine.playBeep(activeNpcId === 'vex' ? 620 : activeNpcId === 'elira' ? 980 : 440, 'sine', 0.02);
        }
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 18);

    return () => clearInterval(timer);
  }, [currentNode.npcText, activeNpcId]);

  const handleSkipTyping = () => {
    setDisplayedText(currentNode.npcText);
    setIsTyping(false);
  };

  const handleChoice = (choice: DialogueChoice) => {
    soundEngine.playTerminalClick();
    onDialogueAction(choice, activeNpcId);
    if (choice.action === 'accept_quest' && choice.questId) {
      onAcceptQuest(choice.questId);
    }
  };

  const activeQuests = quests.filter((q) => q.npcId === activeNpcId);

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 p-3 sm:p-4 pt-28 sm:pt-20 pb-20 sm:pb-16 text-[#dbe7ff] select-none overflow-y-auto">
      {/* Left Column: NPC Selector & Portrait Frame */}
      <div className="w-full md:w-80 flex flex-col bg-[#060c1d]/90 border-2 border-[#00839e] p-3 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
        {/* NPC Tabs */}
        <div className="grid grid-cols-3 gap-1.5 pb-2 border-b border-[#1f293d]">
          {(['vex', 'elira', 'kallo'] as const).map((id) => (
            <button
              key={id}
              onClick={() => {
                soundEngine.playTerminalClick();
                setActiveNpcId(id);
              }}
              className={`py-1.5 px-1 text-xs font-bold uppercase transition-all cursor-pointer ${
                activeNpcId === id
                  ? 'bg-[#00839e] text-[#03050a] border border-[#80ebff]'
                  : 'bg-[#090f20] text-[#7590c2] hover:bg-[#152342]'
              }`}
            >
              {id === 'vex' && 'Векс'}
              {id === 'elira' && 'Элира'}
              {id === 'kallo' && 'Калло'}
            </button>
          ))}
        </div>

        {/* Procedural Pixel Portrait Canvas */}
        <div className="relative w-48 h-48 mx-auto my-3 bg-[#030610] border-2 border-[#1a233a] shadow-[0_0_15px_rgba(0,213,255,0.25)] flex items-center justify-center">
          <canvas ref={canvasRef} width={192} height={192} className="w-full h-full object-contain" />
          <div className="absolute bottom-1 right-1 text-[9px] bg-[#000000]/80 text-[#00d5ff] px-1 font-mono">
            LIVE // ВИДЕОСВЯЗЬ
          </div>
        </div>

        {/* NPC Profile Information */}
        <div className="flex flex-col gap-1 p-2 bg-[#090f20] border border-[#1e293b]">
          <span className="text-xs font-bold text-[#00d5ff]">{activeNpc.name}</span>
          <span className="text-[10px] text-[#ffaa00] font-semibold">{activeNpc.title}</span>
          <p className="text-[11px] text-[#94a3b8] leading-tight pt-1 border-t border-[#1e293b]">
            {activeNpc.description}
          </p>

          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#1e293b]">
            <span className="text-[#718096]">Репутация доверия:</span>
            <span className="font-bold text-[#00d5ff] tabular-nums">{activeNpc.reputation}%</span>
          </div>
        </div>
      </div>

      {/* Center & Right Column: Interactive Dialogue Terminal & Quest Log */}
      <div className="flex-1 flex flex-col bg-[#060c1d]/90 border-2 border-[#00839e] p-3 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between pb-2 border-b border-[#1f293d]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00d5ff] animate-ping" />
            <h2 className="text-sm font-bold tracking-widest text-[#00d5ff] uppercase font-['Chakra_Petch']">
              Канал внутренней связи // {activeNpc.role.toUpperCase()}
            </h2>
          </div>
          <span className="text-xs text-[#718096]">ЧАСТОТА: 1420.405 МГЦ</span>
        </div>

        {/* Dialogue Output Box */}
        <div
          onClick={handleSkipTyping}
          className="my-3 p-4 bg-[#030610] border border-[#1a233a] min-h-[140px] flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-start gap-2">
            <span className="text-sm text-[#00d5ff] font-bold">›</span>
            <p className="text-sm md:text-base text-[#dbe7ff] font-['Chakra_Petch'] leading-relaxed">
              {displayedText}
              {isTyping && <span className="inline-block w-2 h-4 bg-[#00d5ff] ml-1 animate-pulse" />}
            </p>
          </div>
          {isTyping && (
            <span className="text-[10px] text-[#718096] self-end mt-2">Кликните для пропуска анимации</span>
          )}
        </div>

        {/* Dialogue Choices */}
        <div className="flex flex-col gap-2 mb-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#ffaa00]">
            Варианты ответа Командира:
          </span>
          {currentNode.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => handleChoice(choice)}
              className="p-2.5 bg-[#09152b] hover:bg-[#00839e] hover:text-[#03050a] text-[#9dfcff] border border-[#00839e]/60 font-semibold text-xs md:text-sm text-left transition-all duration-150 cursor-pointer active:scale-98 flex items-center justify-between"
            >
              <span>{choice.text}</span>
              {choice.cost && (
                <span className="text-[10px] text-[#ffaa00] ml-2">
                  (Расход: {choice.cost.titanium ? `${choice.cost.titanium} тит.` : ''})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* NPC Quests Assigned to this Character */}
        <div className="mt-auto pt-3 border-t border-[#1f293d] flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#00d5ff] flex items-center justify-between">
            <span>Задания от {activeNpc.name}</span>
            <span className="text-[10px] text-[#718096]">{activeQuests.length} ЗАДАЧ</span>
          </h3>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[160px]">
            {activeQuests.map((quest) => (
              <div
                key={quest.id}
                className="p-2.5 bg-[#090f20] border border-[#1e293b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#dbe7ff]">{quest.title}</span>
                  <span className="text-[11px] text-[#94a3b8]">{quest.objectiveText}</span>
                  <span className="text-[10px] text-[#ffaa00]">
                    Награда: +{quest.reward.titanium} титана, +{quest.reward.voidCrystals} кристаллов, +{quest.reward.energy} энергии
                  </span>
                </div>

                {quest.claimed ? (
                  <span className="text-xs font-bold text-[#22c55e] px-2 py-1 bg-[#052e16] border border-[#166534]">
                    ВЫПОЛНЕНО
                  </span>
                ) : quest.completed ? (
                  <button
                    onClick={() => {
                      soundEngine.playWarp();
                      onClaimQuestReward(quest.id);
                    }}
                    className="px-3 py-1 bg-[#ffaa00] hover:bg-[#ffd780] text-[#03050a] font-bold text-xs uppercase cursor-pointer transition-all active:scale-95 animate-bounce"
                  >
                    ★ Забрать награду
                  </button>
                ) : (
                  <span className="text-xs font-bold text-[#718096] px-2 py-1 bg-[#1e293b]">
                    В ПРОЦЕССЕ
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
