/**
 * 示例剧本种子数据
 * 剧本：神秘古堡
 */
export const mysteryCastleScript = {
  id: 'mystery-castle',
  title: '神秘古堡',
  description:
    '一个充满谜团的古老城堡，等待你来揭开真相。作为侦探，你需要调查威廉爵士神秘死亡的背后隐藏的秘密。',
  genre: 'mystery',
  cover: '/images/mystery-castle.jpg',
  duration: 20,
  difficulty: 2,
  characters: {
    butler: {
      id: 'butler',
      name: '管家亨利',
      description: '古堡的管家，神秘莫测',
      personality: '严肃、神秘、忠诚',
      speakingStyle: '恭敬但疏离',
      avatar: '👴',
    },
    maid: {
      id: 'maid',
      name: '女仆安娜',
      description: '年轻的古堡女仆',
      personality: '胆小、善良、观察力强',
      speakingStyle: '小心翼翼、低声细语',
      avatar: '👩',
    },
    doctor: {
      id: 'doctor',
      name: '医生华生',
      description: '威廉爵士的私人医生',
      personality: '专业、冷静、有秘密',
      speakingStyle: '正式、简短',
      avatar: '👨‍⚕️',
    },
  },
  scenes: {
    start: {
      id: 'start',
      text: '你站在古堡大门前，阴沉的天空下，这座古老的建筑显得格外神秘。管家亨利为你打开了门。',
      speaker: 'butler',
      background: '/images/castle-entrance.jpg',
      choices: [
        {
          id: 'enter-hall',
          text: '进入古堡大厅',
          nextSceneId: 'hall',
        },
        {
          id: 'ask-about-castle',
          text: '询问这座古堡的历史',
          nextSceneId: 'castle-history',
        },
      ],
    },
    hall: {
      id: 'hall',
      text: '大厅内灯光昏暗，墙上挂着历代主人的画像。你可以听到远处传来的脚步声。',
      speaker: 'butler',
      background: '/images/hall.jpg',
      choices: [
        {
          id: 'go-study',
          text: '前往威廉爵士的书房',
          nextSceneId: 'study',
          effects: [{ attribute: 'courage', change: 5 }],
        },
        {
          id: 'explore-hall',
          text: '仔细观察大厅',
          nextSceneId: 'hall-examine',
          effects: [{ attribute: 'clue', change: 1 }],
        },
        {
          id: 'talk-maid',
          text: '与路过的女仆交谈',
          nextSceneId: 'maid-conversation',
        },
      ],
    },
    'castle-history': {
      id: 'castle-history',
      text: '"这座古堡已有三百年历史，"亨利缓缓说道，"威廉爵士是最后一位继承人。他的去世...确实令人遗憾。"',
      speaker: 'butler',
      choices: [
        {
          id: 'enter-hall-after-history',
          text: '进入古堡',
          nextSceneId: 'hall',
        },
      ],
    },
    study: {
      id: 'study',
      text: '书房内一片狼藉，书籍散落一地。威廉爵士似乎在临终前翻找过什么。桌上放着一封未寄出的信。',
      background: '/images/study.jpg',
      choices: [
        {
          id: 'read-letter',
          text: '阅读那封信',
          nextSceneId: 'letter',
          effects: [{ attribute: 'clue', change: 2 }],
        },
        {
          id: 'search-room',
          text: '搜查房间',
          nextSceneId: 'search',
          effects: [{ attribute: 'clue', change: 1 }],
        },
        {
          id: 'call-someone',
          text: '叫人来问问',
          nextSceneId: 'call-help',
        },
      ],
    },
    'hall-examine': {
      id: 'hall-examine',
      text: '你注意到一幅画像似乎被移动过。仔细观察后，你发现画像后面有一个小保险箱。',
      choices: [
        {
          id: 'try-open-safe',
          text: '尝试打开保险箱',
          nextSceneId: 'safe-attempt',
          condition: { attribute: 'clue', min: 2 },
        },
        {
          id: 'ignore-safe',
          text: '先不管它',
          nextSceneId: 'hall',
        },
      ],
    },
    'maid-conversation': {
      id: 'maid-conversation',
      text: '女仆安娜看起来很紧张。"先生，我...我看到一些奇怪的事情..."她压低声音说道。',
      speaker: 'maid',
      choices: [
        {
          id: 'ask-what-she-saw',
          text: '问她看到了什么',
          nextSceneId: 'maid-secret',
          effects: [
            { attribute: 'clue', change: 2 },
            { relationship: { charId: 'maid', change: 10 } },
          ],
        },
        {
          id: 'reassure-maid',
          text: '安慰她不要害怕',
          nextSceneId: 'maid-reassured',
          effects: [{ relationship: { charId: 'maid', change: 20 } }],
        },
      ],
    },
    letter: {
      id: 'letter',
      text: '信上写着："如果您正在阅读这封信，说明我已经遭遇不测。凶手就在古堡中。请检查我的日记，它在...楼梯下的暗格里。"',
      choices: [
        {
          id: 'find-diary',
          text: '去寻找日记',
          nextSceneId: 'diary',
          effects: [{ attribute: 'clue', change: 3 }],
        },
        {
          id: 'confront-butler',
          text: '质问管家',
          nextSceneId: 'confront-butler',
        },
      ],
    },
    diary: {
      id: 'diary',
      text: '你找到了威廉爵士的日记。最后一页写着："亨利一直在监视我，医生开的药让我越来越虚弱...如果我的怀疑是正确的..."',
      choices: [
        {
          id: 'ending-truth',
          text: '真相大白',
          nextSceneId: 'ending-truth',
          effects: [{ attribute: 'clue', change: 5 }],
        },
      ],
    },
    'ending-truth': {
      id: 'ending-truth',
      text: '你终于揭开了真相！管家亨利和医生华生合谋杀害了威廉爵士，为了古堡地下隐藏的宝藏。你成功将他们绳之以法。',
      isEnding: true,
      endingId: 'good-ending',
    },
  },
  endings: [
    {
      id: 'good-ending',
      title: '真相大白',
      description: '你成功揭开了古堡的秘密，将凶手绳之以法。',
      condition: { clue: { min: 5 } },
    },
    {
      id: 'bad-ending',
      title: '迷雾重重',
      description: '真相永远埋葬在这座古堡中...',
      condition: { clue: { max: 4 } },
    },
  ],
  initialState: {
    attributes: {
      courage: 50,
      clue: 0,
      suspicion: 0,
    },
    relationships: {
      butler: 0,
      maid: 0,
      doctor: 0,
    },
  },
}

/**
 * 第二个示例剧本：星际迷途
 */
export const lostInSpaceScript = {
  id: 'lost-in-space',
  title: '星际迷途',
  description:
    '你的飞船在未知星域坠毁，船员们一个接一个失踪。作为舰长，你必须找出真相并带领幸存者逃离。',
  genre: 'scifi',
  cover: '/images/space.jpg',
  duration: 20,
  difficulty: 3,
  characters: {
    ai: {
      id: 'ai',
      name: 'ARIA（飞船AI）',
      description: '飞船的人工智能系统',
      personality: '冷静、逻辑、似乎隐藏着什么',
      speakingStyle: '电子音、简洁',
      avatar: '🤖',
    },
    engineer: {
      id: 'engineer',
      name: '工程师杰克',
      description: '飞船的首席工程师',
      personality: '务实、直率、有疑点',
      speakingStyle: '粗犷、直接',
      avatar: '👨‍🔧',
    },
  },
  scenes: {
    start: {
      id: 'start',
      text: '你从冷冻舱中醒来，警报声刺耳。AI ARIA的声音响起："舰长，我们遭遇了未知能量冲击，飞船部分系统受损..."',
      speaker: 'ai',
      choices: [
        {
          id: 'check-damage',
          text: '检查飞船受损情况',
          nextSceneId: 'damage-report',
        },
        {
          id: 'check-crew',
          text: '询问船员情况',
          nextSceneId: 'crew-status',
        },
      ],
    },
    'damage-report': {
      id: 'damage-report',
      text: '"主要引擎受损40%，通讯系统离线。正在尝试修复..." ARIA的指示灯闪烁着不寻常的频率。',
      speaker: 'ai',
      choices: [
        {
          id: 'go-engine-room',
          text: '前往引擎室检查',
          nextSceneId: 'engine-room',
          effects: [{ attribute: 'suspicion', change: 1 }],
        },
        {
          id: 'ask-about-anomaly',
          text: '询问刚才的能量冲击',
          nextSceneId: 'anomaly-question',
        },
      ],
    },
  },
  endings: [
    {
      id: 'escape',
      title: '成功逃离',
      description: '你带领幸存者修好飞船，成功返回人类领地。',
      condition: { leadership: { min: 60 } },
    },
  ],
  initialState: {
    attributes: {
      leadership: 70,
      suspicion: 0,
      trust: 50,
    },
    relationships: {
      ai: 50,
      engineer: 50,
    },
  },
}

/**
 * 第三个示例剧本：龙之谷
 */
export const dragonValleyScript = {
  id: 'dragon-valley',
  title: '龙之谷',
  description:
    '作为一名年轻的冒险者，你被选中进入传说中的龙之谷，寻找失落已久的龙族宝藏。但这里远比你想象的危险...',
  genre: 'fantasy',
  cover: '/images/dragon.jpg',
  duration: 25,
  difficulty: 2,
  characters: {
    elder: {
      id: 'elder',
      name: '长老艾尔文',
      description: '守护村庄的老者，知晓许多秘密',
      personality: '智慧、神秘、有预谋',
      speakingStyle: '古老、充满隐喻',
      avatar: '🧙',
    },
    dragon: {
      id: 'dragon',
      name: '红龙伊格尼斯',
      description: '传说中的守护之龙',
      personality: '高傲、古老、有故事',
      speakingStyle: '威严、充满力量',
      avatar: '🐉',
    },
  },
  scenes: {
    start: {
      id: 'start',
      text: '长老艾尔文将一把古老的钥匙交给你。"这是通往龙之谷的钥匙。记住，真正的宝藏不是黄金..."',
      speaker: 'elder',
      choices: [
        {
          id: 'ask-about-treasure',
          text: '询问真正的宝藏是什么',
          nextSceneId: 'treasure-question',
        },
        {
          id: 'enter-valley',
          text: '直接进入龙之谷',
          nextSceneId: 'valley-entrance',
        },
      ],
    },
    'valley-entrance': {
      id: 'valley-entrance',
      text: '你踏入龙之谷，空气中弥漫着硫磺的气息。远处的山洞中传来低沉的咆哮声...',
      choices: [
        {
          id: 'approach-cave',
          text: '向山洞走去',
          nextSceneId: 'dragon-meeting',
        },
        {
          id: 'explore-first',
          text: '先探索周围',
          nextSceneId: 'valley-explore',
        },
      ],
    },
    'dragon-meeting': {
      id: 'dragon-meeting',
      text: '红龙伊格尼斯从洞穴中探出头，巨大的金色眼睛注视着你。"又一个贪婪的人类？"它的声音如雷鸣般回荡。',
      speaker: 'dragon',
      choices: [
        {
          id: 'show-respect',
          text: '恭敬地行礼',
          nextSceneId: 'respect-shown',
          effects: [{ relationship: { charId: 'dragon', change: 20 } }],
        },
        {
          id: 'draw-weapon',
          text: '准备战斗',
          nextSceneId: 'battle-start',
          effects: [{ attribute: 'courage', change: 10 }],
        },
      ],
    },
  },
  endings: [
    {
      id: 'dragon-friend',
      title: '龙之友',
      description: '你与龙族建立了深厚的友谊，获得了真正的宝藏——智慧与力量。',
      condition: { dragonTrust: { min: 80 } },
    },
    {
      id: 'dragon-slayer',
      title: '屠龙者',
      description: '你击败了龙，但失去了更珍贵的东西...',
      condition: { courage: { min: 90 }, dragonTrust: { max: 20 } },
    },
  ],
  initialState: {
    attributes: {
      courage: 60,
      wisdom: 40,
      dragonTrust: 0,
    },
    relationships: {
      elder: 50,
      dragon: 0,
    },
  },
}

/**
 * 所有示例剧本
 */
export const sampleScripts = [mysteryCastleScript, lostInSpaceScript, dragonValleyScript]
