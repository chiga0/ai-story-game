/**
 * 示例剧本种子数据
 * 
 * 使用统一类型定义，确保类型安全
 */

import type {
  Script,
  Scene,
  Character,
  Ending,
  Choice,
  InitialState,
} from '../types'

// ============================================
// 剧本一：神秘古堡（扩展版 - 15+ 场景）
// ============================================

const mysteryCastleCharacters: Record<string, Character> = {
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
  chef: {
    id: 'chef',
    name: '厨师玛莎',
    description: '古堡的厨师，为威廉爵士服务了二十年',
    personality: '热情、健谈、对威廉爵士忠诚',
    speakingStyle: '爽朗、直接',
    avatar: '👩‍🍳',
  },
  gardener: {
    id: 'gardener',
    name: '园丁汤姆',
    description: '沉默寡言的园丁，了解古堡的一草一木',
    personality: '沉默、勤劳、观察敏锐',
    speakingStyle: '简短、犹豫',
    avatar: '👨‍🌾',
  },
}

const mysteryCastleScenes: Record<string, Scene> = {
  // ========== 起始场景 ==========
  start: {
    id: 'start',
    text: '你站在古堡大门前，阴沉的天空下，这座古老的建筑显得格外神秘。管家亨利为你打开了门。',
    speaker: 'butler',
    background: '/images/castle-entrance.jpg',
    choices: [
      { id: 'enter-hall', text: '进入古堡大厅', nextSceneId: 'hall' },
      { id: 'ask-about-castle', text: '询问这座古堡的历史', nextSceneId: 'castle-history' },
    ],
  },

  // ========== 大厅区域 ==========
  'castle-history': {
    id: 'castle-history',
    text: '"这座古堡已有三百年历史，"亨利缓缓说道，"威廉爵士是最后一位继承人。他的去世...确实令人遗憾。"',
    speaker: 'butler',
    choices: [{ id: 'enter-hall-after-history', text: '进入古堡', nextSceneId: 'hall' }],
  },
  hall: {
    id: 'hall',
    text: '大厅内灯光昏暗，墙上挂着历代主人的画像。你可以听到远处传来的脚步声。楼梯通向二楼，左侧是厨房，右侧是图书馆，还有一扇通往地下室的小门。',
    speaker: 'butler',
    background: '/images/hall.jpg',
    choices: [
      {
        id: 'go-study',
        text: '前往威廉爵士的书房（二楼）',
        nextSceneId: 'study',
        effects: [{ attribute: 'courage', change: 5 }],
      },
      {
        id: 'explore-hall',
        text: '仔细观察大厅',
        nextSceneId: 'hall-examine',
        effects: [{ attribute: 'clue', change: 1 }],
      },
      { id: 'go-kitchen', text: '前往厨房', nextSceneId: 'kitchen' },
      { id: 'go-library', text: '前往图书馆', nextSceneId: 'library' },
      { id: 'go-basement', text: '进入地下室', nextSceneId: 'basement' },
    ],
  },
  'hall-examine': {
    id: 'hall-examine',
    text: '你注意到一幅画像似乎被移动过。仔细观察后，你发现画像后面有一个小保险箱。此外，你注意到地板上有一些奇怪的脚印，似乎是通往花园的方向。',
    choices: [
      {
        id: 'try-open-safe',
        text: '尝试打开保险箱',
        nextSceneId: 'safe-attempt',
        condition: { attribute: 'clue', min: 3 },
      },
      { id: 'follow-footprints', text: '追踪脚印去花园', nextSceneId: 'garden' },
      { id: 'ignore-safe', text: '先去别处看看', nextSceneId: 'hall' },
    ],
  },
  'safe-attempt': {
    id: 'safe-attempt',
    text: '你发现保险箱的锁很旧，尝试了几个简单的组合后，它咔嗒一声打开了。里面有一张泛黄的照片，照片上威廉爵士和一个年轻女人站在一起，背面写着："永远的爱人——E"',
    effects: [{ attribute: 'clue', change: 3 }],
    choices: [
      { id: 'ask-about-photo', text: '询问管家关于照片的事', nextSceneId: 'photo-question' },
      { id: 'continue-search', text: '继续调查', nextSceneId: 'hall' },
    ],
  },
  'photo-question': {
    id: 'photo-question',
    text: '亨利的表情微变："这是...威廉爵士年轻时的照片。那位女士...我不清楚。"他明显在隐瞒什么。',
    speaker: 'butler',
    effects: [{ attribute: 'suspicion', change: 5 }],
    choices: [
      { id: 'press-butler', text: '追问更多细节', nextSceneId: 'butler-secret' },
      { id: 'leave-for-now', text: '暂时放过他', nextSceneId: 'hall' },
    ],
  },
  'butler-secret': {
    id: 'butler-secret',
    text: '"好吧！"亨利叹了口气，"那位女士叫艾琳娜，是威廉爵士年轻时的恋人。但他们的爱情遭到了家族的反对...后来她神秘失踪了。威廉爵士一直在寻找她的下落，直到去世。"',
    speaker: 'butler',
    effects: [
      { attribute: 'clue', change: 2 },
      { relationship: { charId: 'butler', change: -10 } },
    ],
    choices: [{ id: 'hall-after-secret', text: '返回大厅', nextSceneId: 'hall' }],
  },

  // ========== 厨房场景 ==========
  kitchen: {
    id: 'kitchen',
    text: '厨房里飘着炖肉的香气。厨师玛莎正在忙碌，看到你进来，她热情地招呼你。',
    speaker: 'chef',
    background: '/images/kitchen.jpg',
    choices: [
      {
        id: 'talk-to-chef',
        text: '与厨师交谈',
        nextSceneId: 'chef-conversation',
        effects: [{ relationship: { charId: 'chef', change: 10 } }],
      },
      {
        id: 'search-kitchen',
        text: '搜查厨房',
        nextSceneId: 'kitchen-search',
        effects: [{ attribute: 'clue', change: 1 }],
      },
      { id: 'leave-kitchen', text: '返回大厅', nextSceneId: 'hall' },
    ],
  },
  'chef-conversation': {
    id: 'chef-conversation',
    text: '"威廉爵士是个好人，"玛莎边切菜边说，"但最近几个月他变得很奇怪。我注意到他的食物有时候味道不太对...我怀疑有人在他的食物里加了什么东西。"',
    speaker: 'chef',
    choices: [
      {
        id: 'ask-about-poison',
        text: '询问更多关于食物的事',
        nextSceneId: 'poison-info',
        effects: [{ attribute: 'clue', change: 2 }],
      },
      { id: 'ask-about-doctor', text: '询问医生的事', nextSceneId: 'doctor-info' },
    ],
  },
  'kitchen-search': {
    id: 'kitchen-search',
    text: '你在厨房的角落发现了一个小瓶子，里面有些白色的粉末。标签已经被撕掉了。',
    effects: [{ attribute: 'clue', change: 2 }],
    choices: [
      { id: 'take-bottle', text: '拿走瓶子作为证据', nextSceneId: 'take-bottle' },
      { id: 'leave-bottle', text: '不触碰，记住位置', nextSceneId: 'kitchen' },
    ],
  },
  'take-bottle': {
    id: 'take-bottle',
    text: '你小心地将瓶子收好。这可能是重要的证据。玛莎注意到你的动作，但什么也没说。',
    effects: [
      { attribute: 'clue', change: 2 },
      { attribute: 'evidence', change: 1 },
    ],
    choices: [{ id: 'back-to-hall', text: '返回大厅', nextSceneId: 'hall' }],
  },
  'poison-info': {
    id: 'poison-info',
    text: '"我不能确定，"玛莎压低声音，"但我注意到华生医生经常来厨房查看威廉爵士的饮食。他说是关心爵士的健康，但总觉得有些奇怪..."',
    speaker: 'chef',
    effects: [
      { attribute: 'suspicion', change: 5 },
      { attribute: 'clue', change: 1 },
    ],
    choices: [{ id: 'kitchen-after-info', text: '感谢她的信息，返回大厅', nextSceneId: 'hall' }],
  },
  'doctor-info': {
    id: 'doctor-info',
    text: '"华生医生？"玛莎的表情变得谨慎，"他是个好医生，但...威廉爵士曾经告诉我，他怀疑医生的诊断。说他开的药让他越来越虚弱。"',
    speaker: 'chef',
    effects: [
      { attribute: 'suspicion', change: 3 },
      { attribute: 'clue', change: 1 },
    ],
    choices: [{ id: 'kitchen-after-doctor', text: '返回大厅', nextSceneId: 'hall' }],
  },

  // ========== 图书馆场景 ==========
  library: {
    id: 'library',
    text: '图书馆内弥漫着旧书的气息。高大的书架排列整齐，阳光从彩色玻璃窗洒进来，在地面上投下斑斓的光影。',
    background: '/images/library.jpg',
    choices: [
      {
        id: 'search-books',
        text: '搜索书架',
        nextSceneId: 'library-search',
        effects: [{ attribute: 'clue', change: 1 }],
      },
      {
        id: 'check-desk',
        text: '检查威廉爵士的书桌',
        nextSceneId: 'library-desk',
        effects: [{ attribute: 'clue', change: 2 }],
      },
      { id: 'leave-library', text: '返回大厅', nextSceneId: 'hall' },
    ],
  },
  'library-search': {
    id: 'library-search',
    text: '你在书架间寻找，发现了一本奇怪的书籍——书脊上没有标题。打开后，你发现里面夹着一张日记页，上面写着："亨利在说谎。我必须小心。"',
    effects: [{ attribute: 'clue', change: 2 }],
    choices: [
      { id: 'take-diary-page', text: '收起日记页', nextSceneId: 'library' },
      { id: 'continue-searching', text: '继续搜索', nextSceneId: 'library-hidden' },
    ],
  },
  'library-hidden': {
    id: 'library-hidden',
    text: '你继续搜索，发现一个隐藏的抽屉！里面有一封信，信封上写着："如果我出事，请交给警方。"',
    effects: [{ attribute: 'clue', change: 3 }],
    choices: [{ id: 'read-secret-letter', text: '阅读信件', nextSceneId: 'secret-letter' }],
  },
  'secret-letter': {
    id: 'secret-letter',
    text: '信上写着："我发现亨利一直在监视我，记录我的一举一动。更可怕的是，我发现他和我年轻时失踪的恋人艾琳娜有过联系。我怀疑她的失踪与他有关。如果你们在阅读这封信，说明我可能已经遭遇不测。请调查地下室——那里有我发现的证据。"',
    effects: [{ attribute: 'clue', change: 5 }],
    choices: [{ id: 'go-to-basement', text: '前往地下室', nextSceneId: 'basement' }],
  },
  'library-desk': {
    id: 'library-desk',
    text: '书桌上有一些文件和一本日记。日记的最后几页被撕掉了，但你能看到一些笔记："地下室"、"密室"、"真相"这几个词被反复提及。',
    effects: [{ attribute: 'clue', change: 2 }],
    choices: [
      { id: 'investigate-basement', text: '去地下室查看', nextSceneId: 'basement' },
      { id: 'return-hall', text: '返回大厅', nextSceneId: 'hall' },
    ],
  },

  // ========== 地下室场景 ==========
  basement: {
    id: 'basement',
    text: '地下室的空气阴冷潮湿，只有一盏微弱的灯泡提供照明。你注意到墙上有一个奇怪的砖块图案，似乎和周围不同。',
    background: '/images/basement.jpg',
    choices: [
      {
        id: 'examine-wall',
        text: '仔细检查墙壁',
        nextSceneId: 'basement-wall',
        effects: [{ attribute: 'clue', change: 2 }],
      },
      { id: 'search-basement', text: '搜索地下室', nextSceneId: 'basement-search' },
      { id: 'leave-basement', text: '返回大厅', nextSceneId: 'hall' },
    ],
  },
  'basement-wall': {
    id: 'basement-wall',
    text: '你发现那块砖可以按动！按下后，墙壁缓缓打开，露出一个隐藏的密室入口。密室里透出微弱的光。',
    effects: [{ attribute: 'clue', change: 3 }],
    choices: [
      { id: 'enter-secret-room', text: '进入密室', nextSceneId: 'secret-room' },
      { id: 'fetch-help', text: '去找人帮忙', nextSceneId: 'hall' },
    ],
  },
  'basement-search': {
    id: 'basement-search',
    text: '你在地下室发现了一个旧箱子，里面有一些文件和照片。照片上是年轻的威廉爵士和一个女人——照片背后的"E"让你想起保险箱里的照片。还有一些关于"艾琳娜调查"的文件。',
    effects: [{ attribute: 'clue', change: 3 }],
    choices: [
      { id: 'take-evidence', text: '收起这些证据', nextSceneId: 'basement-wall' },
      { id: 'leave-evidence', text: '记住位置，先去别处', nextSceneId: 'hall' },
    ],
  },

  // ========== 花园场景 ==========
  garden: {
    id: 'garden',
    text: '花园里种满了玫瑰和百合。虽然已是深秋，但仍有些花朵在坚持绽放。园丁汤姆正在修剪灌木，看到你来，他停下了手中的工作。',
    speaker: 'gardener',
    background: '/images/garden.jpg',
    choices: [
      {
        id: 'talk-gardener',
        text: '与园丁交谈',
        nextSceneId: 'gardener-conversation',
        effects: [{ relationship: { charId: 'gardener', change: 10 } }],
      },
      {
        id: 'examine-garden',
        text: '检查花园',
        nextSceneId: 'garden-examine',
        effects: [{ attribute: 'clue', change: 1 }],
      },
      { id: 'return-hall', text: '返回大厅', nextSceneId: 'hall' },
    ],
  },
  'gardener-conversation': {
    id: 'gardener-conversation',
    text: '汤姆是个沉默的人，但当你提到威廉爵士时，他开口了："爵士...是个好人。他让我保管这个。"他递给你一把生锈的钥匙。"他说，如果有人来问真相，就把这个给他。"',
    speaker: 'gardener',
    effects: [
      { attribute: 'clue', change: 3 },
      { relationship: { charId: 'gardener', change: 20 } },
    ],
    choices: [
      { id: 'ask-about-key', text: '询问钥匙的用途', nextSceneId: 'key-purpose' },
      { id: 'thank-gardener', text: '感谢他，返回大厅', nextSceneId: 'hall' },
    ],
  },
  'key-purpose': {
    id: 'key-purpose',
    text: '"阁楼，"汤姆说，"威廉爵士让我告诉你：阁楼的箱子里有他最珍贵的东西。他说...那是解开一切的钥匙。"',
    speaker: 'gardener',
    effects: [{ attribute: 'clue', change: 2 }],
    choices: [{ id: 'go-attic', text: '前往阁楼', nextSceneId: 'attic' }],
  },
  'garden-examine': {
    id: 'garden-examine',
    text: '你在花园的角落发现了一串脚印，从花园通向后山的方向。脚印看起来很新，似乎是最近留下的。你还发现了一块被翻动过的土地，下面埋着一个金属盒子。',
    effects: [{ attribute: 'clue', change: 2 }],
    choices: [
      { id: 'open-box', text: '打开盒子', nextSceneId: 'garden-box' },
      { id: 'follow-prints', text: '追踪脚印', nextSceneId: 'footprint-trail' },
    ],
  },
  'garden-box': {
    id: 'garden-box',
    text: '盒子里有一封信和一张照片。信是艾琳娜写的——她告诉威廉爵士她被亨利囚禁在古堡的阁楼，然后被转移到了一个秘密地点。照片上是亨利和一个陌生男人（看起来很眼熟，像是医生的哥哥）的合影。',
    effects: [{ attribute: 'clue', change: 4 }],
    choices: [{ id: 'attic-after-box', text: '这证实了阁楼的重要性', nextSceneId: 'attic' }],
  },
  'footprint-trail': {
    id: 'footprint-trail',
    text: '你追踪脚印，发现它们在古堡后墙附近消失了。墙上有一个暗门，但需要钥匙才能打开。',
    choices: [
      {
        id: 'try-door',
        text: '尝试打开（需要钥匙）',
        nextSceneId: 'secret-passage',
        condition: { attribute: 'clue', min: 8 },
      },
      { id: 'return-garden', text: '先去找钥匙', nextSceneId: 'garden' },
    ],
  },
  'secret-passage': {
    id: 'secret-passage',
    text: '你用之前找到的钥匙打开了暗门，发现了一条通往阁楼的秘密通道！通道尽头有光线透出。',
    effects: [{ attribute: 'clue', change: 3 }],
    choices: [{ id: 'enter-passage', text: '进入通道', nextSceneId: 'attic' }],
  },

  // ========== 阁楼场景 ==========
  attic: {
    id: 'attic',
    text: '阁楼里堆满了旧家具和箱子。灰尘在阳光中飞舞。在房间深处，你看到了一个精致的木箱，上面刻着威廉爵士的名字。',
    background: '/images/attic.jpg',
    choices: [
      {
        id: 'open-trunk',
        text: '打开木箱',
        nextSceneId: 'trunk-contents',
        effects: [{ attribute: 'clue', change: 3 }],
      },
      { id: 'search-attic', text: '搜索阁楼', nextSceneId: 'attic-search' },
    ],
  },
  'trunk-contents': {
    id: 'trunk-contents',
    text: '箱子里装满了威廉爵士的遗物：他与艾琳娜的合照、一叠情书、以及一份重要的法律文件——证明亨利和医生合谋欺诈威廉爵士遗产的证据。还有艾琳娜的日记，记录了她被囚禁的真相。',
    effects: [{ attribute: 'clue', change: 5 }],
    choices: [
      { id: 'confront-now', text: '是时候揭露真相了', nextSceneId: 'confrontation' },
    ],
  },
  'attic-search': {
    id: 'attic-search',
    text: '你在阁楼的角落发现了一扇小窗户，能看到花园。窗户下有一个暗格，里面藏着一本完整的日记——威廉爵士的调查记录。他发现了亨利和医生的秘密勾当，以及艾琳娜被囚禁的地点。',
    effects: [{ attribute: 'clue', change: 4 }],
    choices: [{ id: 'ready-to-confront', text: '收集了足够的证据', nextSceneId: 'confrontation' }],
  },

  // ========== 书房场景（原有） ==========
  study: {
    id: 'study',
    text: '书房内一片狼藉，书籍散落一地。威廉爵士似乎在临终前翻找过什么。桌上放着一封未寄出的信，窗户微微开着，窗帘被风吹动。',
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
        id: 'check-window',
        text: '检查窗户',
        nextSceneId: 'window-clue',
        effects: [{ attribute: 'clue', change: 1 }],
      },
    ],
  },
  'letter': {
    id: 'letter',
    text: '信上写着："如果您正在阅读这封信，说明我已经遭遇不测。凶手就在古堡中。请检查我的日记，它在图书馆的书架里。真相在地下室..."',
    effects: [{ attribute: 'clue', change: 3 }],
    choices: [
      { id: 'go-library', text: '前往图书馆', nextSceneId: 'library' },
      { id: 'go-basement-from-study', text: '前往地下室', nextSceneId: 'basement' },
    ],
  },
  'search': {
    id: 'search',
    text: '你仔细搜查了房间，在抽屉的夹层里发现了一张纸条："亨利不是他声称的那个人。他冒充了真正的管家。真正的亨利在十五年前已经去世了。"',
    effects: [{ attribute: 'clue', change: 3 }],
    choices: [{ id: 'back-to-hall', text: '返回大厅继续调查', nextSceneId: 'hall' }],
  },
  'window-clue': {
    id: 'window-clue',
    text: '窗台上有一些泥土痕迹，像是有人从外面爬进来过。你注意到窗帘后面有一小块撕破的布料，颜色和管家的制服一样。',
    effects: [{ attribute: 'clue', change: 2 }],
    choices: [{ id: 'study-after-window', text: '返回房间继续调查', nextSceneId: 'study' }],
  },

  // ========== 女仆场景（原有） ==========
  'maid-conversation': {
    id: 'maid-conversation',
    text: '女仆安娜看起来很紧张。"先生，我...我看到一些奇怪的事情。有人深夜在地下室活动，还有...医生给爵士的药，颜色有时候不一样..."',
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
  'maid-secret': {
    id: 'maid-secret',
    text: '安娜四处张望后压低声音说："有一天晚上，我看到医生和管家在花园里秘密交谈。他们提到了\'阁楼\'和\'那个女人\'。还有，我在清理书房时发现了这个..."她递给你一个小的金属徽章。',
    speaker: 'maid',
    effects: [{ attribute: 'clue', change: 3 }],
    choices: [{ id: 'thank-maid', text: '感谢她的帮助', nextSceneId: 'hall' }],
  },
  'maid-reassured': {
    id: 'maid-reassured',
    text: '"谢谢您的安慰，先生。"安娜看起来放松了一些，"如果您需要任何帮助，请告诉我。我知道这座古堡的很多秘密..."',
    speaker: 'maid',
    effects: [
      { relationship: { charId: 'maid', change: 15 } },
      { attribute: 'clue', change: 1 },
    ],
    choices: [{ id: 'ask-maid-secrets', text: '询问她知道的秘密', nextSceneId: 'maid-secret' }],
  },

  // ========== 密室场景 ==========
  'secret-room': {
    id: 'secret-room',
    text: '密室里保存着威廉爵士最重要的证据：一份详细的调查报告，记录了亨利和医生如何合谋杀害真正的管家，冒充他的身份，以及他们如何囚禁艾琳娜来威胁威廉爵士。还有一份遗嘱的副本，证明威廉爵士将所有财产捐赠给慈善机构，如果他的死因可疑的话。',
    background: '/images/secret-room.jpg',
    effects: [{ attribute: 'clue', change: 5 }],
    choices: [
      { id: 'take-all-evidence', text: '收起所有证据', nextSceneId: 'have-evidence' },
    ],
  },
  'have-evidence': {
    id: 'have-evidence',
    text: '你将所有证据整理好。现在，你有了足够的证据来揭露真相。是时候与凶手对峙了。',
    choices: [{ id: 'confront', text: '开始对峙', nextSceneId: 'confrontation' }],
  },

  // ========== 最终对峙场景 ==========
  confrontation: {
    id: 'confrontation',
    text: '你召集了所有人——管家亨利、医生华生、女仆安娜、厨师玛莎、园丁汤姆。你将证据一件件展示出来：艾琳娜的日记、威廉爵士的调查记录、冒充管家的证据、以及医生的投药记录。',
    background: '/images/hall.jpg',
    choices: [
      {
        id: 'reveal-truth',
        text: '揭露真相',
        nextSceneId: 'truth-revealed',
        condition: { attribute: 'clue', min: 10 },
      },
      {
        id: 'partial-truth',
        text: '展示部分证据',
        nextSceneId: 'partial-reveal',
        condition: { attribute: 'clue', min: 5 },
      },
      {
        id: 'failed-confrontation',
        text: '证据不足，试图对峙',
        nextSceneId: 'failed-ending',
      },
    ],
  },
  'truth-revealed': {
    id: 'truth-revealed',
    text: '"真相已经大白！"你指着亨利和医生，"亨利，或者我应该说——你根本不是真正的管家。真正的亨利在十五年前就已经被你杀害了。而你，医生，一直在给威廉爵士下药，让他看起来像是自然死亡。你们囚禁艾琳娜来威胁爵士，企图夺取他的财产。但威廉爵士已经预见到了这一切，留下了证据！"',
    effects: [{ attribute: 'clue', change: 10 }],
    choices: [{ id: 'ending-perfect', text: '正义终于得到伸张', nextSceneId: 'ending-perfect' }],
  },
  'partial-reveal': {
    id: 'partial-reveal',
    text: '你展示了一些证据，但亨利和医生开始否认。"这只是巧合！"医生辩解道。虽然你引起了怀疑，但还不足以定他们的罪。安娜站出来作证，提供了关键的证词。',
    choices: [{ id: 'ending-good', text: '真相逐渐浮出水面', nextSceneId: 'ending-good' }],
  },
  'failed-ending': {
    id: 'failed-ending',
    text: '没有足够的证据，亨利和医生狡猾地否认了一切。"这位客人似乎有些精神恍惚，"亨利对其他人说。你意识到自己低估了他们...',
    choices: [{ id: 'ending-bad', text: '真相永远埋葬...', nextSceneId: 'ending-bad' }],
  },

  // ========== 结局场景 ==========
  'ending-perfect': {
    id: 'ending-perfect',
    text: '警方很快赶到，亨利和医生被逮捕。艾琳娜被找到了，她被囚禁在一个偏远的地方。威廉爵士的遗愿得到了实现——他的财产捐赠给了慈善机构，而他的冤屈也终于昭雪。你成功揭开了这座古堡的所有秘密，成为了一个传奇的侦探。',
    choices: [],
  },
  'ending-good': {
    id: 'ending-good',
    text: '虽然证据不够充分，但安娜的证词和其他线索引起了警方的注意。经过进一步调查，亨利和医生最终被绳之以法。艾琳娜虽然受了很多苦，但最终获救。威廉爵士可以安息了。',
    choices: [],
  },
  'ending-truth': {
    id: 'ending-truth',
    text: '你终于揭开了真相！管家亨利和医生华生合谋杀害了威廉爵士，为了古堡地下隐藏的宝藏。你成功将他们绳之以法。',
    choices: [],
  },
  'ending-bad': {
    id: 'ending-bad',
    text: '真相永远埋葬在这座古堡中。你带着遗憾离开，知道威廉爵士的冤屈无人知晓，而真正的凶手依然逍遥法外...',
    choices: [],
  },
}

const mysteryCastleEndings: Ending[] = [
  {
    id: 'perfect-ending',
    title: '完美侦探',
    description: '你收集了所有证据，揭露了所有真相，拯救了艾琳娜，将凶手绳之以法。威廉爵士终于可以安息。',
    condition: { clue: { min: 15 } },
  },
  {
    id: 'good-ending',
    title: '真相大白',
    description: '虽然有些细节未能完全查明，但你成功揭露了凶手的罪行，正义得到了伸张。',
    condition: { clue: { min: 10, max: 14 } },
  },
  {
    id: 'partial-ending',
    title: '迷雾渐散',
    description: '你发现了部分真相，引起了警方的注意。凶手最终难逃法网，但有些秘密永远无法揭晓。',
    condition: { clue: { min: 5, max: 9 } },
  },
  {
    id: 'bad-ending',
    title: '迷雾重重',
    description: '真相永远埋葬在这座古堡中。威廉爵士的冤屈无人知晓，真正的凶手逍遥法外...',
    condition: { clue: { max: 4 } },
  },
]

const mysteryCastleInitialState: InitialState = {
  attributes: { courage: 50, clue: 0, suspicion: 0, evidence: 0 },
  relationships: { butler: 0, maid: 0, doctor: 0, chef: 0, gardener: 0 },
}

export const mysteryCastleScript: Script = {
  id: 'mystery-castle',
  title: '神秘古堡',
  description: '一个充满谜团的古老城堡，等待你来揭开真相。作为侦探，你需要调查威廉爵士神秘死亡的背后隐藏的秘密。',
  genre: 'mystery',
  cover: '/images/mystery-castle.jpg',
  duration: 25,
  difficulty: 2,
  characters: mysteryCastleCharacters,
  scenes: mysteryCastleScenes,
  endings: mysteryCastleEndings,
  initialState: mysteryCastleInitialState,
}

// ============================================
// 剧本二：星际迷途
// ============================================

const lostInSpaceCharacters: Record<string, Character> = {
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
}

const lostInSpaceScenes: Record<string, Scene> = {
  start: {
    id: 'start',
    text: '你从冷冻舱中醒来，警报声刺耳。AI ARIA的声音响起："舰长，我们遭遇了未知能量冲击，飞船部分系统受损..."',
    speaker: 'ai',
    choices: [
      { id: 'check-damage', text: '检查飞船受损情况', nextSceneId: 'damage-report' },
      { id: 'check-crew', text: '询问船员情况', nextSceneId: 'crew-status' },
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
      { id: 'ask-about-anomaly', text: '询问刚才的能量冲击', nextSceneId: 'anomaly-question' },
    ],
  },
  'crew-status': { id: 'crew-status', text: '船员状态检查...', choices: [] },
  'engine-room': { id: 'engine-room', text: '引擎室...', choices: [] },
  'anomaly-question': { id: 'anomaly-question', text: '能量冲击详情...', choices: [] },
}

const lostInSpaceEndings: Ending[] = [
  {
    id: 'escape',
    title: '成功逃离',
    description: '你带领幸存者修好飞船，成功返回人类领地。',
    condition: { leadership: { min: 60 } },
  },
]

const lostInSpaceInitialState: InitialState = {
  attributes: { leadership: 70, suspicion: 0, trust: 50 },
  relationships: { ai: 50, engineer: 50 },
}

export const lostInSpaceScript: Script = {
  id: 'lost-in-space',
  title: '星际迷途',
  description: '你的飞船在未知星域坠毁，船员们一个接一个失踪。作为舰长，你必须找出真相并带领幸存者逃离。',
  genre: 'scifi',
  cover: '/images/space.jpg',
  duration: 20,
  difficulty: 3,
  characters: lostInSpaceCharacters,
  scenes: lostInSpaceScenes,
  endings: lostInSpaceEndings,
  initialState: lostInSpaceInitialState,
}

// ============================================
// 剧本三：龙之谷
// ============================================

const dragonValleyCharacters: Record<string, Character> = {
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
}

const dragonValleyScenes: Record<string, Scene> = {
  start: {
    id: 'start',
    text: '长老艾尔文将一把古老的钥匙交给你。"这是通往龙之谷的钥匙。记住，真正的宝藏不是黄金..."',
    speaker: 'elder',
    choices: [
      { id: 'ask-about-treasure', text: '询问真正的宝藏是什么', nextSceneId: 'treasure-question' },
      { id: 'enter-valley', text: '直接进入龙之谷', nextSceneId: 'valley-entrance' },
    ],
  },
  'valley-entrance': {
    id: 'valley-entrance',
    text: '你踏入龙之谷，空气中弥漫着硫磺的气息。远处的山洞中传来低沉的咆哮声...',
    choices: [
      { id: 'approach-cave', text: '向山洞走去', nextSceneId: 'dragon-meeting' },
      { id: 'explore-first', text: '先探索周围', nextSceneId: 'valley-explore' },
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
  'treasure-question': { id: 'treasure-question', text: '关于宝藏...', choices: [] },
  'valley-explore': { id: 'valley-explore', text: '探索山谷...', choices: [] },
  'respect-shown': { id: 'respect-shown', text: '你恭敬地行礼...', choices: [] },
  'battle-start': { id: 'battle-start', text: '你准备战斗...', choices: [] },
}

const dragonValleyEndings: Ending[] = [
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
]

const dragonValleyInitialState: InitialState = {
  attributes: { courage: 60, wisdom: 40, dragonTrust: 0 },
  relationships: { elder: 50, dragon: 0 },
}

export const dragonValleyScript: Script = {
  id: 'dragon-valley',
  title: '龙之谷',
  description: '作为一名年轻的冒险者，你被选中进入传说中的龙之谷，寻找失落已久的龙族宝藏。但这里远比你想象的危险...',
  genre: 'fantasy',
  cover: '/images/dragon.jpg',
  duration: 25,
  difficulty: 2,
  characters: dragonValleyCharacters,
  scenes: dragonValleyScenes,
  endings: dragonValleyEndings,
  initialState: dragonValleyInitialState,
}

// ============================================
// 所有示例剧本
// ============================================

/**
 * 所有示例剧本列表
 */
export const sampleScripts: Script[] = [
  mysteryCastleScript,
  lostInSpaceScript,
  dragonValleyScript,
]