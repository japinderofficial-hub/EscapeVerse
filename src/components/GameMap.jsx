import React from "react";
import { useGameState } from "../hooks/useGameState";

const GameMap = () => {
  const { mission, currentRoomId, visitedRooms, solvedPuzzles } = useGameState();

  // If mission is not loaded yet or doesn't define a map layout, don't render anything
  if (!mission || !mission.rooms || !mission.mapLayout) return null;

  const mapLayout = mission.mapLayout;
  const numRows = mapLayout.length;
  const numCols = mapLayout[0]?.length || 0;

  /**
   * Helper to check the current state of a room for map coloration.
   */
  const getRoomStatus = (roomId) => {
    if (roomId === currentRoomId) return "current";
    if (visitedRooms.includes(roomId)) return "visited";

    // Inspect exits in all rooms to see if this target room is currently locked
    let isLocked = false;
    Object.values(mission.rooms).forEach((room) => {
      if (room.exits) {
        Object.values(room.exits).forEach((exit) => {
          if (typeof exit === "object" && exit.roomId === roomId) {
            if (exit.requiredPuzzle && !solvedPuzzles[exit.requiredPuzzle]) {
              isLocked = true;
            }
          }
        });
      }
    });

    if (isLocked) return "locked";
    return "unvisited";
  };

  return (
    <div className="game-map-container">
      <h4 className="map-title">{mission.title} Map</h4>
      <div 
        className="map-grid-dynamic"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, 1fr)`,
          gridTemplateRows: `repeat(${numRows}, 40px)`,
          gap: "4px",
          alignItems: "center",
          justifyItems: "center",
          margin: "0 auto",
          maxWidth: "320px"
        }}
      >
        {mapLayout.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            {row.map((cell, cIdx) => {
              if (cell === null) {
                return <div key={cIdx} className="map-cell-empty" />;
              }

              if (cell === "v-line") {
                return (
                  <div key={cIdx} className="map-connector vertical" style={{ height: "100%" }}>
                    <div className="line" />
                  </div>
                );
              }

              if (cell === "h-line") {
                return (
                  <div key={cIdx} className="map-connector horizontal" style={{ width: "100%" }}>
                    <div className="line" />
                  </div>
                );
              }

              // Render active room block
              const status = getRoomStatus(cell);
              const roomName = mission.rooms[cell]?.name || cell;

              return (
                <div 
                  key={cIdx} 
                  className={`map-cell-room room-${status}`}
                  title={`${roomName} (${status})`}
                  style={{ width: "100%", height: "100%" }}
                >
                  <span className="room-text">
                    {status === "locked" ? "🔒" : ""}
                    {roomName}
                  </span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GameMap;












