/**
 * Void Station: Beyond the Event Horizon
 * Tactical Sector Star Map View
 */

import React, { useRef, useEffect, useState } from 'react';
import { SectorNode, StationStats } from '../game/types.ts';
import { soundEngine } from '../game/audio.ts';

interface SectorMapViewProps {
  nodes: SectorNode[];
  stats: StationStats;
  onScanNode: (nodeId: string) => void;
  onExploreNode: (node: SectorNode) => void;
}

export const SectorMapView: React.FC<SectorMapViewProps> = ({
  nodes,
  stats,
  onScanNode,
  onExploreNode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<SectorNode | null>(nodes[0] || null);

  // Canvas radar animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    const render = () => {
      sweepAngle += 0.02;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Deep space background with coordinate grid
      ctx.fillStyle = '#030611';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#0b162b';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Gravitational Concentric Orbit Rings around Event Horizon
      const cx = w * 0.82;
      const cy = h * 0.45;
      for (let r = 80; r < 600; r += 70) {
        ctx.strokeStyle = 'rgba(0, 213, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radar Sweep Cone
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(sweepAngle);
      const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.7);
      sweepGrad.addColorStop(0, 'rgba(0, 213, 255, 0.25)');
      sweepGrad.addColorStop(1, 'rgba(0, 213, 255, 0)');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, w * 0.7, -0.3, 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Station Hub position (Center-Left)
      const stX = w * 0.15;
      const stY = h * 0.5;
      ctx.fillStyle = '#00d5ff';
      ctx.beginPath();
      ctx.arc(stX, stY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#80ebff';
      ctx.font = '10px "Chakra Petch", sans-serif';
      ctx.fillText('СТАНЦИЯ ГОРИЗОНТ', stX - 45, stY - 12);

      // Draw Sector Nodes
      nodes.forEach((node) => {
        const nx = (node.x / 100) * w;
        const ny = (node.y / 100) * h;
        const isSelected = selectedNode?.id === node.id;

        // Flight vector line from station
        ctx.strokeStyle = isSelected ? 'rgba(0, 213, 255, 0.4)' : 'rgba(71, 91, 130, 0.2)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(stX, stY);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        ctx.setLineDash([]);

        // Node Marker Pip
        let nodeColor = '#00d5ff';
        if (node.type === 'asteroid_field') nodeColor = '#ffaa00';
        if (node.type === 'derelict') nodeColor = '#7590c2';
        if (node.type === 'pirate_corvette') nodeColor = '#ff3333';
        if (node.type === 'alien_beacon') nodeColor = '#b83bfa';
        if (node.type === 'void_anomaly') nodeColor = '#dc2626';

        // Pulsing selection ring
        if (isSelected) {
          ctx.strokeStyle = '#00d5ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(nx, ny, 12, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(nx, ny, node.explored ? 4 : 7, 0, Math.PI * 2);
        ctx.fill();

        // Node Title
        ctx.fillStyle = node.explored ? '#64748b' : '#dbe7ff';
        ctx.font = '10px "Chakra Petch", sans-serif';
        ctx.fillText(node.name, nx + 10, ny + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [nodes, selectedNode]);

  // Handle canvas click to select node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Find closest node
    let closest: SectorNode | null = null;
    let minDist = 40;

    nodes.forEach((node) => {
      const nx = (node.x / 100) * canvas.width;
      const ny = (node.y / 100) * canvas.height;
      const dist = Math.hypot(clickX - nx, clickY - ny);
      if (dist < minDist) {
        minDist = dist;
        closest = node;
      }
    });

    if (closest) {
      soundEngine.playTerminalClick();
      setSelectedNode(closest);
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 p-3 sm:p-4 pt-28 sm:pt-20 pb-20 sm:pb-16 text-[#dbe7ff] select-none overflow-y-auto">
      {/* Left / Center: Interactive Tactical Star Map Canvas */}
      <div className="flex-1 flex flex-col bg-[#060c1d]/90 border-2 border-[#00839e] p-3 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between pb-2 border-b border-[#1f293d]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00d5ff] animate-ping" />
            <h2 className="text-sm font-bold tracking-widest text-[#00d5ff] uppercase font-['Chakra_Petch']">
              Тактическая карта квадранта сингулярности
            </h2>
          </div>
          <span className="text-xs text-[#718096]">КЛИК ПО ТОЧКЕ ДЛЯ НАВЕДЕНИЯ СЕНСОРОВ</span>
        </div>

        {/* Canvas */}
        <div className="relative w-full h-72 sm:h-96 md:h-[450px] my-2 bg-[#02050f] border border-[#1a233a] cursor-crosshair overflow-hidden">
          <canvas
            ref={canvasRef}
            width={720}
            height={460}
            onClick={handleCanvasClick}
            className="w-full h-full object-contain"
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
            <span className="text-[10px] bg-[#0c1326]/80 text-[#00d5ff] px-2 py-0.5 border border-[#00839e]/40">
              РАДИУС СКАНИРОВАНИЯ: 1.4 СВ. ЛЕТ
            </span>
          </div>
        </div>

        {/* Quick Node Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => {
                soundEngine.playTerminalClick();
                setSelectedNode(node);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase whitespace-nowrap cursor-pointer transition-all border ${
                selectedNode?.id === node.id
                  ? 'bg-[#00839e] text-[#03050a] border-[#80ebff]'
                  : 'bg-[#090f20] text-[#7590c2] border-[#1e293b] hover:border-[#00839e]'
              }`}
            >
              {node.name} {node.explored && '✓'}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Node Telemetry & Expedition Dispatch */}
      <div className="w-full md:w-80 flex flex-col bg-[#060c1d]/90 border-2 border-[#00839e] p-3 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#00d5ff] pb-2 border-b border-[#1f293d] flex items-center justify-between">
          <span>Телеметрия цели</span>
          <span className="text-[10px] text-[#ffaa00]">
            {selectedNode ? selectedNode.type.toUpperCase() : 'НЕТ ЦЕЛИ'}
          </span>
        </h3>

        {selectedNode ? (
          <div className="flex flex-col gap-3 my-2 flex-1">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#00d5ff]">{selectedNode.name}</span>
              <span className="text-[10px] text-[#718096]">
                Статус: {selectedNode.explored ? 'ИССЛЕДОВАНО' : selectedNode.scanned ? 'ОТСКАНИРОВАНО' : 'НЕИЗВЕСТНО'}
              </span>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed bg-[#030610] p-2 border border-[#1a233a]">
              {selectedNode.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#1e293b]">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#718096]">УРОВЕНЬ ОПАСНОСТИ:</span>
                <span
                  className={`font-bold tabular-nums ${
                    selectedNode.threat > 60 ? 'text-[#ff3333]' : selectedNode.threat > 30 ? 'text-[#ffaa00]' : 'text-[#00d5ff]'
                  }`}
                >
                  {selectedNode.threat}%
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-[#718096]">ТИП ВСТРЕЧИ:</span>
                <span className="font-bold text-[#dbe7ff] uppercase">
                  {selectedNode.encounterType === 'combat' ? '⚔ Бой' : selectedNode.encounterType === 'scavenge' ? '📦 Добыча' : '✨ Загадка'}
                </span>
              </div>
            </div>

            {selectedNode.scanned && (
              <div className="flex flex-col gap-1 p-2 bg-[#09152b] border border-[#00839e]/50 text-xs">
                <span className="text-[10px] text-[#00d5ff] font-bold uppercase">Обнаруженные ресурсы:</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#dbe7ff]">+{selectedNode.resourceYield.titanium} Титана</span>
                  <span className="text-[#b83bfa]">+{selectedNode.resourceYield.voidCrystals} Кристаллов</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto pt-3 border-t border-[#1e293b] flex flex-col gap-2">
              {!selectedNode.scanned && (
                <button
                  onClick={() => {
                    soundEngine.playLaser();
                    onScanNode(selectedNode.id);
                  }}
                  disabled={stats.energy < 8}
                  className={`w-full py-2 text-xs font-bold uppercase transition-all cursor-pointer ${
                    stats.energy >= 8
                      ? 'bg-[#121c33] hover:bg-[#1c2e54] text-[#00d5ff] border border-[#00839e] active:scale-95'
                      : 'bg-[#1e293b] text-[#64748b] cursor-not-allowed border border-transparent'
                  }`}
                >
                  📡 Сканировать радар (8 энергии)
                </button>
              )}

              <button
                onClick={() => {
                  soundEngine.playWarp();
                  onExploreNode(selectedNode);
                }}
                disabled={selectedNode.explored || stats.energy < 15}
                className={`w-full py-2.5 text-xs font-bold uppercase transition-all cursor-pointer ${
                  !selectedNode.explored && stats.energy >= 15
                    ? 'bg-[#00839e] hover:bg-[#00d5ff] text-[#03050a] border border-[#80ebff] shadow-[0_0_10px_rgba(0,213,255,0.4)] active:scale-95'
                    : 'bg-[#1e293b] text-[#64748b] cursor-not-allowed border border-transparent'
                }`}
              >
                {selectedNode.explored
                  ? '✓ Локация исчерпана'
                  : stats.energy < 15
                  ? 'Недостаточно энергии'
                  : '🚀 Отправить экспедицию (15 эн.)'}
              </button>
            </div>
          </div>
        ) : (
          <div className="my-auto text-center text-xs text-[#718096]">
            Выберите точку интереса на карте
          </div>
        )}
      </div>
    </div>
  );
};
