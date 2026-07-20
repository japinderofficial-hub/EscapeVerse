const STORAGE_KEY = "escapeverse_save_game_v5";

/**
 * Saves the current game state to Local Storage.
 * @param {Object} state - The game state object.
 */
export const saveGameState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save game state to localStorage:", error);
  }
};

/**
 * Loads the saved game state from Local Storage.
 * @returns {Object|null} The parsed game state, or null if no save exists.
 */
export const loadGameState = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error("Failed to load game state from localStorage:", error);
    return null;
  }
};

/**
 * Clears the saved game state from Local Storage.
 */
export const clearGameState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear game state in localStorage:", error);
  }
};

const API_KEY_STORAGE_KEY = "escapeverse_gemini_api_key";

/**
 * Saves the Gemini API key to Local Storage.
 * @param {string} key - The API key.
 */
export const saveApiKey = (key) => {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } catch (error) {
    console.error("Failed to save API key to localStorage:", error);
  }
};

/**
 * Loads the Gemini API key from Local Storage.
 * @returns {string|null} The API key, or null if not found.
 */
export const loadApiKey = () => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to load API key from localStorage:", error);
    return null;
  }
};

/**
 * Clears the Gemini API key from Local Storage.
 */
export const clearApiKey = () => {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear API key in localStorage:", error);
  }
};
