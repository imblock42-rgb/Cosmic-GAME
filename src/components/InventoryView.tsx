/**
 * Void Station: Beyond the Event Horizon
 * Sci-Fi Grid Inventory, Station Sockets, Item Tooltips & Crafting Workbench
 */

import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem, ItemCategory, StationSlot, StationStats } from '../game/types.ts';
import { CRAFTING_RECIPES } from '../game/initialData.ts';
import { CraftingRecipe } from '../game/rules.ts';
import { drawPixelItemIcon, RARITY_COLORS } from '../game/proceduralGraphics.ts';
import { soundEngine } from '../game/audio.ts';

interface InventoryViewProps {
  items: InventoryItem[];
  slots: StationSlot[];
  stats: StationStats;
  onEquipItem: (slotId: string, item: InventoryItem) => void;
  onUnequipSlot: (slotId: string) => void;
  onCraftItem: (recipe: CraftingRecipe) => void;
}

// Single item icon canvas renderer
const ItemIcon: React.FC<{ item: InventoryItem; size?: number }> = ({ item, size = 48 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, size, size);
        drawPixelItemIcon(ctx, item.iconType, item.rarity, 0, 0, size);
      }
    }
  }, [item, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="w-full h-full object-contain pointer-events-none" />;
};

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  slots,
  stats,
  onEquipItem,
  onUnequipSlot,
  onCraftItem,
}) => {
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(items[0] || null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'crafting'>('inventory');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const filteredItems = items.filter((it) => (activeCategory === 'all' ? true : it.category === activeCategory));

  const handleEquip = (slotId: string, item: InventoryItem) => {
    soundEngine.playTerminalClick();
    onEquipItem(slotId, item);
    setFeedbackMsg(`Модуль «${item.name}» успешно смонтирован на станцию.`);
  };

  const handleUnequip = (slotId: string) => {
    soundEngine.playTerminalClick();
    onUnequipSlot(slotId);
    setFeedbackMsg('Оборудование демонтировано и возвращено на склад.');
  };

  const handleCraft = (recipe: CraftingRecipe) => {
    if (
      stats.titanium >= recipe.cost.titanium &&
      stats.voidCrystals >= recipe.cost.voidCrystals &&
      stats.energy >= recipe.cost.energy
    ) {
      soundEngine.playWarp();
      onCraftItem(recipe);
      setFeedbackMsg(`Сборка завершена: «${recipe.name}» добавлен на склад!`);
    } else {
      soundEngine.playAlarm();
      setFeedbackMsg('ОШИБКА: Недостаточно титана, энергии или кристаллов для сборки!');
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 p-3 sm:p-4 pt-28 sm:pt-20 pb-20 sm:pb-16 text-[#dbe7ff] select-none overflow-y-auto">
      {/* Left Column: Station Sockets Chassis */}
      <div className="w-full md:w-80 flex flex-col bg-[#060c1d]/90 border-2 border-[#00839e] p-3 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#00d5ff] pb-2 border-b border-[#1f293d] flex items-center justify-between">
          <span>Слоты оборудования станции</span>
          <span className="text-[10px] text-[#ffaa00]">АКТИВНЫЕ МОДУЛИ</span>
        </h3>

        <div className="flex flex-col gap-2 my-2 overflow-y-auto max-h-[380px]">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="p-2 bg-[#090f20] border border-[#1e293b] flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#040711] border border-[#2d3a54] flex items-center justify-center p-0.5">
                  {slot.installedItem ? (
                    <ItemIcon item={slot.installedItem} size={36} />
                  ) : (
                    <span className="text-xs text-[#475569]">∅</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#e2e8f0]">{slot.name}</span>
                  <span className="text-[10px] text-[#718096]">
                    {slot.installedItem ? slot.installedItem.name : 'Свободный слот'}
                  </span>
                </div>
              </div>

              {slot.installedItem ? (
                <button
                  onClick={() => handleUnequip(slot.id)}
                  title="Демонтировать модуль"
                  className="px-2 py-1 bg-[#1e293b] hover:bg-[#991b1b] text-[10px] font-bold text-[#fecaca] uppercase cursor-pointer transition-all"
                >
                  Снять
                </button>
              ) : selectedItem && selectedItem.category === 'module' ? (
                <button
                  onClick={() => handleEquip(slot.id, selectedItem)}
                  title="Установить выбранный модуль в этот слот"
                  className="px-2 py-1 bg-[#00839e] hover:bg-[#00d5ff] text-[10px] font-bold text-[#03050a] uppercase cursor-pointer transition-all"
                >
                  Вставить
                </button>
              ) : (
                <span className="text-[9px] text-[#64748b]">Пусто</span>
              )}
            </div>
          ))}
        </div>

        {feedbackMsg && (
          <div className="mt-auto p-2 bg-[#09152b] border border-[#00d5ff] text-[11px] font-mono text-[#00d5ff] flex items-center gap-1.5 animate-pulse">
            <span>› {feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* Center & Right Column: Grid Inventory & Crafting Workbench */}
      <div className="flex-1 flex flex-col bg-[#060c1d]/90 border-2 border-[#00839e] p-3 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
        {/* View Switcher: Inventory vs Crafting */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1f293d]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playTerminalClick();
                setActiveTab('inventory');
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#00839e] text-[#03050a] border border-[#80ebff]'
                  : 'bg-[#0f172a] text-[#7590c2] hover:bg-[#1e293b]'
              }`}
            >
              📦 Склад станции ({items.length} предм.)
            </button>

            <button
              onClick={() => {
                soundEngine.playTerminalClick();
                setActiveTab('crafting');
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'crafting'
                  ? 'bg-[#00839e] text-[#03050a] border border-[#80ebff]'
                  : 'bg-[#0f172a] text-[#7590c2] hover:bg-[#1e293b]'
              }`}
            >
              🛠 Верстак синтезатора ({CRAFTING_RECIPES.length} рецептов)
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="flex items-center gap-1">
              {(['all', 'module', 'raw', 'artifact'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    soundEngine.playTerminalClick();
                    setActiveCategory(cat);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#00d5ff] text-[#03050a]'
                      : 'bg-[#152342] text-[#9dfcff] hover:bg-[#1e293b]'
                  }`}
                >
                  {cat === 'all' && 'Все'}
                  {cat === 'module' && 'Модули'}
                  {cat === 'raw' && 'Сырье'}
                  {cat === 'artifact' && 'Реликвии'}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === 'inventory' ? (
          <div className="flex flex-col md:flex-row gap-4 my-2 flex-1">
            {/* Grid of items */}
            <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2 bg-[#030610] border border-[#1a233a] overflow-y-auto max-h-[380px]">
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const rarityColor = RARITY_COLORS[item.rarity].main;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      soundEngine.playTerminalClick();
                      setSelectedItem(item);
                    }}
                    className={`relative aspect-square p-1 border cursor-pointer transition-all duration-150 flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-[#00d5ff] bg-[#17274a] shadow-[0_0_10px_rgba(0,213,255,0.5)]'
                        : 'border-[#1e293b] bg-[#080d1a] hover:border-[#475b82]'
                    }`}
                    style={{ borderColor: isSelected ? '#00d5ff' : rarityColor }}
                  >
                    <ItemIcon item={item} size={48} />
                    {item.quantity > 1 && (
                      <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white bg-[#000000]/80 px-1 tabular-nums">
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Item Detail Inspector Card */}
            {selectedItem ? (
              <div className="w-full md:w-64 p-3 bg-[#0a1124] border border-[#00839e] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-[#040711] border border-[#2d3a54] p-0.5">
                    <ItemIcon item={selectedItem} size={44} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#00d5ff]">{selectedItem.name}</span>
                    <span
                      className="text-[10px] font-bold uppercase"
                      style={{ color: RARITY_COLORS[selectedItem.rarity].main }}
                    >
                      {selectedItem.rarity === 'common' && 'Обычный'}
                      {selectedItem.rarity === 'rare' && 'Редкий'}
                      {selectedItem.rarity === 'epic' && 'Эпический'}
                      {selectedItem.rarity === 'relic' && 'Реликт Бездны'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#94a3b8] leading-tight pt-1 border-t border-[#1e293b]">
                  {selectedItem.description}
                </p>

                {selectedItem.stats && (
                  <div className="flex flex-col gap-1 text-[11px] pt-1 border-t border-[#1e293b]">
                    <span className="text-[#ffaa00] font-bold text-[10px] uppercase">Характеристики:</span>
                    {selectedItem.stats.powerDraw !== undefined && (
                      <span className="text-[#00d5ff]">
                        Энергия: {selectedItem.stats.powerDraw > 0 ? `-${selectedItem.stats.powerDraw}` : `+${Math.abs(selectedItem.stats.powerDraw)}`}
                      </span>
                    )}
                    {selectedItem.stats.oxygenGen !== undefined && (
                      <span className="text-[#4ade80]">
                        Генерация O2: +{selectedItem.stats.oxygenGen}
                      </span>
                    )}
                    {selectedItem.stats.shieldBonus !== undefined && (
                      <span className="text-[#80ebff]">
                        Прочность щита: +{selectedItem.stats.shieldBonus}
                      </span>
                    )}
                    {selectedItem.stats.attackPower !== undefined && (
                      <span className="text-[#ff3333]">
                        Орудийная мощь: +{selectedItem.stats.attackPower}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-2 border-t border-[#1e293b] flex items-center justify-between text-[10px] text-[#718096]">
                  <span>Стоимость: {selectedItem.marketValue} тит.</span>
                  <span>Кол-во: {selectedItem.quantity} шт.</span>
                </div>
              </div>
            ) : (
              <div className="w-full md:w-64 p-3 bg-[#0a1124] border border-[#1e293b] flex items-center justify-center text-xs text-[#718096]">
                Выберите предмет для просмотра
              </div>
            )}
          </div>
        ) : (
          /* Crafting Workbench Tab */
          <div className="my-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[380px]">
            {CRAFTING_RECIPES.map((recipe) => {
              const canAfford =
                stats.titanium >= recipe.cost.titanium &&
                stats.voidCrystals >= recipe.cost.voidCrystals &&
                stats.energy >= recipe.cost.energy;

              return (
                <div
                  key={recipe.id}
                  className="p-3 bg-[#090f20] border border-[#1e293b] hover:border-[#00839e] flex flex-col justify-between transition-all"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-[#00d5ff]">{recipe.name}</span>
                    <p className="text-[11px] text-[#94a3b8] leading-tight">{recipe.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#1e293b] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] text-[#718096]">
                      <span>Затраты:</span>
                      <div className="flex items-center gap-2">
                        <span className={stats.titanium >= recipe.cost.titanium ? 'text-[#dbe7ff]' : 'text-[#ff3333]'}>
                          {recipe.cost.titanium} Тит.
                        </span>
                        <span className={stats.voidCrystals >= recipe.cost.voidCrystals ? 'text-[#b83bfa]' : 'text-[#ff3333]'}>
                          {recipe.cost.voidCrystals} Крист.
                        </span>
                        <span className={stats.energy >= recipe.cost.energy ? 'text-[#00d5ff]' : 'text-[#ff3333]'}>
                          {recipe.cost.energy} Эн.
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCraft(recipe)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-[#00839e] hover:bg-[#00d5ff] text-[#03050a] border border-[#80ebff] active:scale-95'
                          : 'bg-[#1e293b] text-[#64748b] cursor-not-allowed border border-transparent'
                      }`}
                    >
                      {canAfford ? '⚙ Синтезировать' : 'Недостаточно ресурсов'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
