import React from "react";
import { useGameState } from "../hooks/useGameState";
import { Key, Wrench, BookOpen, FlaskConical, Zap, Coins, Package } from "lucide-react";

/**
 * Returns a matching Lucide icon based on the item ID string.
 */
const getItemIcon = (itemId) => {
  switch (itemId) {
    case "old_key":
    case "brass_key":
      return <Key className="item-icon" size={18} />;
    case "rusty_crowbar":
      return <Wrench className="item-icon" size={18} />;
    case "code_notebook":
      return <BookOpen className="item-icon" size={18} />;
    case "ghost_potion":
      return <FlaskConical className="item-icon" size={18} />;
    case "battery":
      return <Zap className="item-icon" size={18} />;
    case "ancient_coin":
      return <Coins className="item-icon" size={18} />;
    default:
      return <Package className="item-icon" size={18} />;
  }
};

const InventoryPanel = () => {
  const { inventory, mission } = useGameState();

  return (
    <aside className="inventory-panel">
      <h2>Inventory</h2>
      <div className="inventory-content">
        {inventory.length === 0 ? (
          <p className="empty-inventory">Your inventory is empty.</p>
        ) : (
          <ul className="inventory-list">
            {inventory.map((itemId) => {
              const itemInfo = mission.items[itemId];
              return (
                <li key={itemId} className="inventory-item">
                  <div className="item-header">
                    {getItemIcon(itemId)}
                    <span className="item-name">{itemInfo?.name || itemId}</span>
                  </div>
                  {itemInfo?.description && (
                    <span className="item-desc">{itemInfo.description}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default InventoryPanel;
