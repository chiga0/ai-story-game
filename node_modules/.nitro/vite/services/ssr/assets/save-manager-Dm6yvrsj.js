const SAVE_KEY = "ai-story-game-saves";
const MAX_SAVES = 10;
function getAllSaves() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function getSave(saveId) {
  const saves = getAllSaves();
  return saves.find((s) => s.id === saveId) || null;
}
function saveGame(scriptId, scriptTitle, state) {
  const saves = getAllSaves();
  const save = {
    id: `save-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    scriptId,
    scriptTitle,
    currentScene: state.currentScene,
    state,
    savedAt: Date.now(),
    playDuration: Math.floor((Date.now() - state.startTime) / 1e3)
  };
  saves.unshift(save);
  if (saves.length > MAX_SAVES) {
    saves.pop();
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
  return save;
}
function deleteSave(saveId) {
  const saves = getAllSaves();
  const index = saves.findIndex((s) => s.id === saveId);
  if (index === -1) return false;
  saves.splice(index, 1);
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
  return true;
}
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  return `${hours}小时${minutes}分钟`;
}
function formatSaveTime(timestamp) {
  const date = new Date(timestamp);
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - timestamp;
  if (diff < 6e4) return "刚刚";
  if (diff < 36e5) return `${Math.floor(diff / 6e4)}分钟前`;
  if (diff < 864e5) return `${Math.floor(diff / 36e5)}小时前`;
  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
export {
  formatSaveTime as a,
  getSave as b,
  deleteSave as d,
  formatDuration as f,
  getAllSaves as g,
  saveGame as s
};
