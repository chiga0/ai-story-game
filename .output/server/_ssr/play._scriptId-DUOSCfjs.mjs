import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button, c as cn } from "./button-vkN4wIJs.mjs";
import { b as getSave, s as saveGame } from "./save-manager-Dm6yvrsj.mjs";
import { s as sampleScripts } from "./scripts-zSQzaMad.mjs";
import { a as Route } from "./router-Yfz65LYq.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/base-ui__react.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/base-ui__utils.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/tiny-warning.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
function Card({
  className,
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "card",
      "data-size": size,
      className: cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      ),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-4 group-data-[size=sm]/card:px-3", className),
      ...props
    }
  );
}
function DialogueBox({ speaker, text, avatar, onTypingComplete }) {
  const [displayedText, setDisplayedText] = reactExports.useState("");
  const [isTyping, setIsTyping] = reactExports.useState(true);
  reactExports.useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
        onTypingComplete?.();
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text, onTypingComplete]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-black/80 backdrop-blur-sm border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
    avatar && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: avatar,
        alt: speaker || "角色",
        className: "w-16 h-16 rounded-full border-2 border-gray-600"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      speaker && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-amber-400 font-medium mb-1", children: speaker }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-white leading-relaxed", children: [
        displayedText,
        isTyping && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-pulse", children: "▌" })
      ] })
    ] })
  ] }) }) });
}
function ChoicePanel({ choices, onChoose, disabled }) {
  if (choices.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: choices.map((choice, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      variant: "outline",
      className: "w-full justify-start text-left h-auto py-3 px-4 bg-gray-900/80 border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition-all",
      onClick: () => onChoose(choice.id),
      disabled,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-400 mr-2 font-mono", children: [
          index + 1,
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: choice.text })
      ]
    },
    choice.id
  )) });
}
function StatusBar({ attributes, relationships, characterNames }) {
  const attributeLabels = {
    courage: "勇气",
    wisdom: "智慧",
    charm: "魅力",
    luck: "运气",
    health: "健康",
    sanity: "理智"
  };
  const getAttributeColor = (value) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-blue-500";
    if (value >= 40) return "bg-yellow-500";
    if (value >= 20) return "bg-orange-500";
    return "bg-red-500";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-gray-900/90 border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-400 uppercase tracking-wider", children: "属性" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: Object.entries(attributes).map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-300 w-12", children: attributeLabels[key] || key }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-2 bg-gray-700 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `h-full ${getAttributeColor(value)} transition-all duration-300`,
            style: { width: `${Math.min(100, Math.max(0, value))}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 w-8", children: value })
      ] }, key)) })
    ] }),
    relationships && Object.keys(relationships).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-400 uppercase tracking-wider", children: "关系" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: Object.entries(relationships).map(([charId, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: characterNames?.[charId] || charId }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: `font-mono ${value >= 50 ? "text-green-400" : value >= 0 ? "text-yellow-400" : "text-red-400"}`,
                children: [
                  value > 0 ? "+" : "",
                  value
                ]
              }
            )
          ]
        },
        charId
      )) })
    ] })
  ] }) });
}
function SaveButton({ scriptId, scriptTitle, state, onSave }) {
  const [saving, setSaving] = reactExports.useState(false);
  const [lastSave, setLastSave] = reactExports.useState(null);
  const handleSave = async () => {
    setSaving(true);
    try {
      const save = saveGame(scriptId, scriptTitle, state);
      setLastSave((/* @__PURE__ */ new Date()).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
      onSave?.(save);
    } catch (error) {
      console.error("Save failed:", error);
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleSave,
        disabled: saving,
        className: "px-4 py-2 bg-[var(--sea-ink)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50",
        children: saving ? "保存中..." : "保存游戏"
      }
    ),
    lastSave && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-[var(--sea-ink-soft)]", children: [
      "上次保存: ",
      lastSave
    ] })
  ] });
}
function applyEffects(state, effects) {
  const newState = { ...state };
  newState.attributes = { ...state.attributes };
  newState.relationships = { ...state.relationships };
  for (const effect of effects) {
    if (effect.attribute !== void 0 && effect.change !== void 0) {
      const currentValue = newState.attributes[effect.attribute] || 0;
      newState.attributes[effect.attribute] = currentValue + effect.change;
    }
    if (effect.relationship) {
      const { charId, change } = effect.relationship;
      const currentValue = newState.relationships[charId] || 0;
      newState.relationships[charId] = Math.max(-100, Math.min(100, currentValue + change));
    }
  }
  return newState;
}
function evaluateCondition(state, condition) {
  if (!condition.attribute) return true;
  const value = state.attributes[condition.attribute] || 0;
  if (condition.min !== void 0 && value < condition.min) {
    return false;
  }
  if (condition.max !== void 0 && value > condition.max) {
    return false;
  }
  return true;
}
function checkEnding(state, endings) {
  const matchedEndings = [];
  for (const ending of endings) {
    let matched = true;
    for (const [attr, condition] of Object.entries(ending.condition)) {
      const value = state.attributes[attr] || 0;
      if (condition.min !== void 0 && value < condition.min) {
        matched = false;
        break;
      }
      if (condition.max !== void 0 && value > condition.max) {
        matched = false;
        break;
      }
    }
    if (matched) {
      matchedEndings.push(ending);
    }
  }
  return matchedEndings.length > 0 ? matchedEndings[0] : null;
}
function createInitialState(scriptId, initialAttributes = {}, initialRelationships = {}) {
  return {
    scriptId,
    currentScene: "",
    attributes: { ...initialAttributes },
    relationships: { ...initialRelationships },
    history: [],
    startTime: Date.now()
  };
}
function cloneState(state) {
  return {
    scriptId: state.scriptId,
    currentScene: state.currentScene,
    attributes: { ...state.attributes },
    relationships: { ...state.relationships },
    history: state.history.map((entry) => ({ ...entry })),
    startTime: state.startTime
  };
}
class GameEngine {
  script = null;
  state = null;
  /**
   * 初始化游戏
   * @param script 剧本对象
   * @returns 初始游戏状态
   */
  async init(script) {
    this.script = script;
    const scenes = script.scenes;
    const sceneIds = Object.keys(scenes);
    const initialScene = sceneIds.length > 0 ? sceneIds[0] : "";
    const initialState = script.initialState || {};
    const attributes = initialState.attributes || {};
    const relationships = initialState.relationships || {};
    this.state = createInitialState(script.id, attributes, relationships);
    this.state.currentScene = initialScene;
    return cloneState(this.state);
  }
  /**
   * 从存档恢复游戏
   * @param savedState 保存的游戏状态
   * @param script 剧本对象
   */
  async restore(savedState, script) {
    this.script = script;
    this.state = cloneState(savedState);
  }
  /**
   * 获取当前场景
   * @returns 当前场景，或 null
   */
  getCurrentScene() {
    if (!this.script || !this.state) return null;
    const scenes = this.script.scenes;
    return scenes[this.state.currentScene] || null;
  }
  /**
   * 获取可用选项列表（过滤条件不满足的选项）
   * @returns 可用选项列表
   */
  getChoices() {
    const scene = this.getCurrentScene();
    if (!scene?.choices) return [];
    if (!this.state) return [];
    return scene.choices.filter((choice) => {
      if (!choice.condition) return true;
      return evaluateCondition(this.state, choice.condition);
    });
  }
  /**
   * 处理玩家选择
   * @param choiceId 选项ID
   * @returns 选择结果
   */
  async processChoice(choiceId) {
    if (!this.script || !this.state) return null;
    const choices = this.getChoices();
    const choice = choices.find((c) => c.id === choiceId);
    if (!choice) return null;
    const currentScene = this.getCurrentScene();
    const appliedEffects = [];
    if (currentScene) {
      if (choice.effects && choice.effects.length > 0) {
        this.state = applyEffects(this.state, choice.effects);
        appliedEffects.push(...choice.effects);
      }
      this.state.history.push({
        sceneId: currentScene.id,
        text: currentScene.text,
        choice: choice.text,
        timestamp: Date.now()
      });
    }
    this.state.currentScene = choice.nextSceneId;
    const endings = this.script.endings;
    const ending = checkEnding(this.state, endings);
    if (ending) {
      return {
        type: "ending",
        ending,
        effects: appliedEffects
      };
    }
    const nextScene = this.getCurrentScene();
    return {
      type: "continue",
      scene: nextScene || void 0,
      effects: appliedEffects
    };
  }
  /**
   * 检查是否达到结局
   * @returns 结局对象，或 null
   */
  checkEnding() {
    if (!this.script || !this.state) return null;
    const endings = this.script.endings;
    if (!endings || endings.length === 0) return null;
    return checkEnding(this.state, endings);
  }
  /**
   * 获取游戏状态
   * @returns 游戏状态
   */
  getState() {
    if (!this.state) return null;
    return cloneState(this.state);
  }
  /**
   * 获取游玩时长（秒）
   * @returns 游玩时长
   */
  getPlayDuration() {
    if (!this.state) return 0;
    return Math.floor((Date.now() - this.state.startTime) / 1e3);
  }
  /**
   * 获取属性值
   * @param attributeName 属性名
   * @returns 属性值
   */
  getAttribute(attributeName) {
    if (!this.state) return 0;
    return this.state.attributes[attributeName] || 0;
  }
  /**
   * 获取关系值
   * @param characterId 角色ID
   * @returns 关系值
   */
  getRelationship(characterId) {
    if (!this.state) return 0;
    return this.state.relationships[characterId] || 0;
  }
}
function createGameEngine() {
  return new GameEngine();
}
function PlayPage() {
  const {
    scriptId
  } = Route.useParams();
  const [engine, setEngine] = reactExports.useState(null);
  const [gameState, setGameState] = reactExports.useState(null);
  const [currentScene, setCurrentScene] = reactExports.useState(null);
  const [choices, setChoices] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [isTyping, setIsTyping] = reactExports.useState(true);
  const [scriptTitle, setScriptTitle] = reactExports.useState("");
  reactExports.useEffect(() => {
    const initGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const script = sampleScripts.find((s) => s.id === scriptId);
        if (!script) {
          setError("剧本不存在");
          setLoading(false);
          return;
        }
        setScriptTitle(script.title);
        const gameEngine = createGameEngine();
        const params = new URLSearchParams(window.location.search);
        const saveId = params.get("saveId");
        let state;
        if (saveId) {
          const save = getSave(saveId);
          if (save) {
            await gameEngine.restore(save.state, {
              id: script.id,
              title: script.title,
              scenes: script.scenes,
              endings: script.endings
            });
            state = save.state;
          } else {
            state = await gameEngine.init({
              id: script.id,
              title: script.title,
              scenes: script.scenes,
              endings: script.endings
            });
          }
        } else {
          state = await gameEngine.init({
            id: script.id,
            title: script.title,
            scenes: script.scenes,
            endings: script.endings
          });
        }
        setEngine(gameEngine);
        setGameState(state);
        setCurrentScene(gameEngine.getCurrentScene());
        setChoices(gameEngine.getChoices());
        setLoading(false);
      } catch (err) {
        console.error("Failed to init game:", err);
        setError("游戏初始化失败");
        setLoading(false);
      }
    };
    initGame();
  }, [scriptId]);
  const handleChoice = reactExports.useCallback(async (choiceId) => {
    if (!engine || !gameState) return;
    setIsTyping(true);
    const result = await engine.processChoice(choiceId);
    if (!result) return;
    if (result.type === "ending") {
      setCurrentScene({
        id: "ending",
        text: `🏆 ${result.ending?.title}

${result.ending?.description}`
      });
      setChoices([]);
    } else {
      setCurrentScene(result.scene || null);
      setChoices(engine.getChoices());
    }
    setGameState(engine.getState());
  }, [engine, gameState]);
  const getAvatar = (speakerId) => {
    if (!speakerId) return void 0;
    const script = sampleScripts.find((s) => s.id === scriptId);
    if (!script?.characters) return void 0;
    const characters = script.characters;
    return characters[speakerId]?.avatar;
  };
  const getSpeakerName = (speakerId) => {
    if (!speakerId) return void 0;
    const script = sampleScripts.find((s) => s.id === scriptId);
    if (!script?.characters) return void 0;
    const characters = script.characters;
    return characters[speakerId]?.name;
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-[var(--bg-base)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--sea-ink)] mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[var(--sea-ink-soft)]", children: "加载中..." })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-[var(--bg-base)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 mb-4", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/scripts", className: "text-[var(--sea-ink)] hover:underline", children: "返回剧本列表" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col bg-[var(--bg-base)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-[var(--sea-ink-light)] flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/scripts", className: "text-[var(--sea-ink)] hover:underline", children: "← 返回" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/saves", className: "text-[var(--sea-ink)] hover:underline", children: "存档管理" })
    ] }),
    gameState && /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBar, { attributes: gameState.attributes, relationships: gameState.relationships }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col justify-end p-4 max-w-4xl mx-auto w-full", children: [
      gameState && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-[var(--sea-ink-soft)]", children: [
          "游玩时长: ",
          Math.floor((Date.now() - gameState.startTime) / 6e4),
          " 分钟"
        ] }),
        scriptTitle && gameState && /* @__PURE__ */ jsxRuntimeExports.jsx(SaveButton, { scriptId, scriptTitle, state: gameState })
      ] }),
      currentScene && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogueBox, { speaker: getSpeakerName(currentScene.speaker), text: currentScene.text, avatar: getAvatar(currentScene.speaker), onTypingComplete: () => setIsTyping(false) }),
      choices.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChoicePanel, { choices: choices.map((c) => ({
        id: c.id,
        text: c.text
      })), onChoose: handleChoice, disabled: isTyping }) }),
      choices.length === 0 && currentScene?.id === "ending" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/scripts", className: "inline-block px-6 py-3 bg-[var(--sea-ink)] text-white rounded-lg hover:opacity-90 transition-opacity", children: "返回剧本列表" }) })
    ] })
  ] });
}
export {
  PlayPage as component
};
