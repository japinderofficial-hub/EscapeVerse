import lockedApartment from "../missions/locked-apartment.json";
import hauntedMansion from "../missions/haunted-mansion.json";

// Registry mapping mission IDs to their respective JSON configurations
const missionRegistry = {
  "locked-apartment": lockedApartment,
  "locked_apartment": lockedApartment, // support underscore variant
  "haunted-mansion": hauntedMansion,
  "haunted_mansion": hauntedMansion    // support underscore variant
};

/**
 * Retrieves the mission data JSON based on a unique mission ID.
 * 
 * @param {string} missionId - The ID of the mission.
 * @returns {Object|null} The mission data, or null if not found.
 */
export const getMissionById = (missionId) => {
  if (!missionId) return null;
  return missionRegistry[missionId.toLowerCase()] || null;
};

/**
 * Returns a list of all currently available mission IDs.
 * @returns {Array<string>}
 */
export const getAvailableMissions = () => {
  return Object.keys(missionRegistry);
};
export default getMissionById;
