import {
  BatteryCharging,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  ChefHat,
  ClipboardList,
  Clock,
  Drama,
  FileText,
  Flame,
  FolderKanban,
  Image as ImageIcon,
  KanbanSquare,
  Lightbulb,
  LineChart,
  Mail,
  MessageSquareText,
  Mic,
  Palette,
  Presentation,
  Quote,
  ShieldAlert,
  ShieldCheck,
  Shirt,
  Smile,
  Sparkles,
  Star,
  UserCheck,
  Users,
  Utensils,
  VenetianMask,
  Waypoints,
} from 'lucide-react';
import { NavCategory } from './navigation';

export type ToolCategoryKey =
  | 'communication'
  | 'translation'
  | 'generation'
  | 'crisis'
  | 'analysis'
  | 'office-fun';

export interface Tool {
  id: string;
  name: string;
  description: string;
  englishName?: string;
  englishDescription?: string;
  categoryKey: ToolCategoryKey;
  categoryName: string;
  icon: React.ElementType;
  href: string;
  tags?: string[];
}

export interface ToolCategory extends NavCategory {
  key: ToolCategoryKey;
  tools: Tool[];
}

export const toolCategories: ToolCategory[] = [
  {
    key: 'communication',
    label: '沟通优化',
    icon: MessageSquareText,
    children: [],
    tools: [
      {
        id: 'speech-optimizer',
        name: '话术优化器',
        description: '优化您的日常沟通话术，使其更专业、更得体。',
        categoryKey: 'communication',
        categoryName: '沟通优化',
        icon: Lightbulb,
        href: '/tools/speech-optimizer',
        tags: ['speech', 'communication', 'optimization'],
      },
      {
        id: 'email-polisher',
        name: '邮件润色器',
        description: '专业润色您的邮件内容，提升沟通效率和专业形象。',
        categoryKey: 'communication',
        categoryName: '沟通优化',
        icon: Mail,
        href: '/tools/email-polisher',
        tags: ['email', 'writing', 'professionalism'],
      },
      {
        id: 'meeting-speech-generator',
        name: '会议发言生成器',
        description: '根据会议主题和目的，快速生成结构清晰、观点明确的发言稿。',
        categoryKey: 'communication',
        categoryName: '沟通优化',
        icon: Presentation,
        href: '/tools/meeting-speech-generator',
        tags: ['meeting', 'presentation', 'speech'],
      },
    ],
  },
  {
    key: 'translation',
    label: '语言转换',
    icon: Bot,
    children: [],
    tools: [
      {
        id: 'jargon-translator',
        name: '黑话翻译器',
        description: '轻松翻译行业黑话和专业术语，消除沟通壁垒。',
        categoryKey: 'translation',
        categoryName: '语言转换',
        icon: Waypoints,
        href: '/tools/jargon-translator',
        tags: ['jargon', 'glossary', 'translation'],
      },
      {
        id: 'cross-department-translator',
        name: '跨部门沟通翻译',
        description: '将专业内容转化为易于其他部门理解的语言，促进协作。',
        categoryKey: 'translation',
        categoryName: '语言转换',
        icon: Users,
        href: '/tools/cross-department-translator',
        tags: ['collaboration', 'communication', 'interdepartmental'],
      },
      {
        id: 'eq-assistant',
        name: '职场情商助手',
        description: '分析沟通场景，提供高情商的表达建议和应对策略。',
        categoryKey: 'translation',
        categoryName: '语言转换',
        icon: Smile,
        href: '/tools/eq-assistant',
        tags: ['emotional intelligence', 'soft skills', 'communication'],
      },
    ],
  },
  {
    key: 'generation',
    label: '内容生成',
    icon: FolderKanban,
    children: [],
    tools: [
      {
        id: 'ppt-phrase-generator',
        name: 'PPT金句生成器',
        description: '为您的PPT生成画龙点睛的金句和亮点标题。',
        categoryKey: 'generation',
        categoryName: '内容生成',
        icon: Presentation,
        href: '/tools/ppt-phrase-generator',
        tags: ['ppt', 'presentation', 'writing', 'key phrases'],
      },
      {
        id: 'professional-persona-generator',
        name: '职场人设生成器',
        description: '根据需求和场景，生成符合定位的职场人设描述。',
        categoryKey: 'generation',
        categoryName: '内容生成',
        icon: UserCheck,
        href: '/tools/professional-persona-generator',
        tags: ['personal branding', 'profile', 'career'],
      },
      {
        id: 'data-beautifier',
        name: '汇报数据美化器',
        description: '将枯燥的数据转化为生动、易于理解的文字描述和亮点。',
        categoryKey: 'generation',
        categoryName: '内容生成',
        icon: Palette,
        href: '/tools/data-beautifier',
        tags: ['data visualization', 'reporting', 'writing'],
      },
    ],
  },
  {
    key: 'crisis',
    label: '危机处理',
    icon: ShieldAlert,
    children: [],
    tools: [
      {
        id: 'blame-tactics',
        name: '甩锅/背锅话术',
        description: '提供在复杂职场情境下的高情商甩锅与背锅话术参考。',
        categoryKey: 'crisis',
        categoryName: '危机处理',
        icon: Flame,
        href: '/tools/blame-tactics',
        tags: ['conflict resolution', 'problem solving', 'communication tactics'],
      },
      {
        id: 'crisis-communication-templates',
        name: '危机公关模板',
        description: '提供多种危机公关场景下的专业沟通模板。',
        categoryKey: 'crisis',
        categoryName: '危机处理',
        icon: FileText,
        href: '/tools/crisis-communication-templates',
        tags: ['public relations', 'crisis management', 'templates'],
      },
      {
        id: 'resignation-templates',
        name: '离职/跳槽文案',
        description: '生成专业的离职信和跳槽沟通文案，体面过渡。',
        categoryKey: 'crisis',
        categoryName: '危机处理',
        icon: Briefcase,
        href: '/tools/resignation-templates',
        tags: ['resignation', 'job change', 'career transition'],
      },
    ],
  },
  {
    key: 'analysis',
    label: '智能分析',
    icon: LineChart,
    children: [],
    tools: [
      {
        id: 'team-mood-detector',
        name: '团队氛围检测器',
        description: '通过文本分析感知团队沟通中的情绪倾向和氛围。',
        categoryKey: 'analysis',
        categoryName: '智能分析',
        icon: Users,
        href: '/tools/team-mood-detector',
        tags: ['team dynamics', 'sentiment analysis', 'hr tech'],
      },
      {
        id: 'meeting-notes-organizer',
        name: '会议记录智能整理',
        description: '智能提取会议纪要的关键信息、待办事项和总结。',
        categoryKey: 'analysis',
        categoryName: '智能分析',
        icon: ClipboardList,
        href: '/tools/meeting-notes-organizer',
        tags: ['meeting productivity', 'note taking', 'summary'],
      },
      {
        id: 'workplace-meme-generator',
        name: '职场梗图生成器',
        description: '结合职场热点和您的创意，快速生成有趣的梗图。',
        categoryKey: 'analysis',
        categoryName: '智能分析',
        icon: ImageIcon,
        href: '/tools/workplace-meme-generator',
        tags: ['meme', 'humor', 'content creation', 'fun'],
      },
    ],
  },
  {
    key: 'office-fun',
    label: '摸鱼作乐',
    icon: Drama,
    children: [],
    tools: [
      {
        id: 'pro-slacker-time-manager',
        name: '摸鱼时钟',
        englishName: "Pro Slacker's Time Manager",
        description: '精准计算下一个摸鱼黄金点，工作再忙也要劳逸结合，准点开溜！',
        englishDescription:
          'Calculates the next prime slacking opportunity. Work hard, play hard, and clock out on time!',
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: Clock,
        href: '/tools/pro-slacker-time-manager',
        tags: ['time management', 'fun', 'productivity', 'slacking'],
      },
      {
        id: 'awesome-compliment-generator',
        name: '彩虹屁生成器',
        englishName: 'Awesome Compliment Generator',
        description: '一键生成"真心实意"的商业互吹文案，让同事如沐春风，老板心花怒放。',
        englishDescription:
          "Generates 'sincere' compliments to make your colleagues feel great and your boss delighted.",
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: Sparkles,
        href: '/tools/awesome-compliment-generator',
        tags: ['compliments', 'fun', 'workplace', 'communication'],
      },
      {
        id: 'introduction-to-slacking',
        name: '摸鱼学导论',
        englishName: 'Introduction to Slacking',
        description: '系统阐述摸鱼的艺术与科学，助您成为理论与实践双修的摸鱼大师。',
        englishDescription:
          'A systematic guide to the art and science of slacking, helping you master both theory and practice.',
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: BookOpen,
        href: '/tools/introduction-to-slacking',
        tags: ['slacking', 'fun', 'philosophy', 'productivity', 'guide'],
      },
      {
        id: 'bullshit-fortune-telling',
        name: '今日运势（胡说版）',
        englishName: "Today's Fortune (Bullshit Edition)",
        description: '上班好累？让AI用一本正经的胡说八道为你占卜今日运势，纯属娱乐，切勿当真！',
        englishDescription:
          "Tired of work? Let AI tell your fortune with serious-sounding nonsense. Purely for entertainment, don't take it seriously!",
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: Star,
        href: '/tools/bullshit-fortune-telling',
        tags: ['fun', 'fortune telling', 'humor', 'entertainment', 'astrology'],
      },
      {
        id: 'weekly-report-sparkle-enhancer',
        name: '"这周干了啥"亮点包装器',
        englishName: 'Weekly Report "Sparkle" Enhancer',
        description:
          '周报写不出亮点？AI帮你点石成金，让你的周报也能闪闪发光，卷出新高度！别让努力默默无闻！',
        englishDescription:
          "Weekly report lacking luster? AI adds that magic touch, making your achievements shine. Don't let your hard work go unnoticed!",
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: VenetianMask,
        href: '/tools/weekly-report-sparkle-enhancer',
        tags: ['reporting', 'writing', 'achievement', 'fun', 'embellishment'],
      },
      {
        id: 'universal-excuse-generator',
        name: '"万能借口"生成器',
        englishName: 'Universal Excuse Generator',
        description:
          '上班迟到？会议缺席？不想加班？AI为你量身打造天衣无缝的万能借口，助你轻松脱身，免除后顾之忧！',
        englishDescription:
          'Late for work? Missed a meeting? AI crafts the perfect, seamless excuse for any situation. Get out of anything, worry-free!',
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: ChefHat,
        href: '/tools/universal-excuse-generator',
        tags: ['excuses', 'fun', 'problem solving', 'humor', 'workplace'],
      },
      {
        id: 'lunch-decision-overlord',
        name: '"今天中午吃什么？"终极选择器',
        englishName: 'Lunch Decision Overlord',
        description:
          '选择困难症的福音！告别每日灵魂拷问，让AI帮你决定今天中午吃什么，简单快捷，美味不重样！',
        englishDescription:
          "The ultimate cure for indecision! Ends the daily 'what to eat' dilemma. Let AI choose your lunch, fast and delicious!",
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: Utensils,
        href: '/tools/lunch-decision-overlord',
        tags: ['food', 'decision making', 'fun', 'lunch', 'ai choice'],
      },
      {
        id: 'meeting-doodle-buddy',
        name: '"会议神游"涂鸦伴侣',
        englishName: 'Meeting Doodle Buddy',
        description:
          '开会太无聊？AI为你提供源源不断的涂鸦灵感，让你的思绪在纸上尽情遨游，同时保持"专注"形象。',
        englishDescription:
          "Bored in meetings? AI provides endless doodle ideas to let your mind wander creatively while looking 'attentive'.",
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: Quote,
        href: '/tools/meeting-doodle-buddy',
        tags: ['fun', 'meeting', 'doodle', 'creativity', 'boredom buster'],
      },
      {
        id: 'daily-grind-affirmations',
        name: '"打工人"每日一句',
        englishName: 'Daily Grind Affirmations',
        description:
          '负能量爆棚？让AI为你送上每日专属"打工人"语录，或毒舌或治愈，总有一句能戳中你的"工位灵魂"。',
        englishDescription:
          "Feeling drained? Get your daily dose of 'worker bee' wisdom from AI – sometimes snarky, sometimes healing, always relatable.",
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: KanbanSquare,
        href: '/tools/daily-grind-affirmations',
        tags: ['motivation', 'fun', 'quotes', 'daily', 'workplace humor'],
      },
      {
        id: 'meeting-bingo-generator',
        name: '"会议BINGO"卡片生成器',
        englishName: 'Meeting BINGO Generator',
        description:
          '将无聊的会议变成一场刺激的BINGO游戏！自定义BINGO卡片，看看谁先达成"会议废话"BINGO！',
        englishDescription:
          'Turn boring meetings into an exciting BINGO game! Customize your cards and see who hits "Meeting Buzzword BINGO" first!',
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: Shirt,
        href: '/tools/meeting-bingo-generator',
        tags: ['fun', 'meeting', 'game', 'bingo', 'engagement'],
      },
      {
        id: 'office-outfit-advisor',
        name: '"今天穿什么？"职场版',
        englishName: 'Office Outfit Advisor',
        description:
          '根据天气、会议和你的"躺平"指数，AI为你推荐今日最佳职场穿搭，让你每天多睡五分钟。',
        englishDescription:
          "Based on weather, meetings, and your 'chill level', AI suggests the perfect office outfit. Sleep an extra five minutes!",
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: ShieldCheck,
        href: '/tools/office-outfit-advisor',
        tags: ['fashion', 'office wear', 'ai advisor', 'fun', 'decision making'],
      },
      {
        id: 'anti-pua-assistant',
        name: '"拒绝PUA"小助手',
        englishName: 'Anti-PUA Assistant',
        description: '面对职场PUA，AI教你如何优雅回怼，或提供"金蝉脱壳"之计，保护你的精神健康。',
        englishDescription:
          'Combat workplace manipulation! AI teaches you to respond gracefully or offers escape tactics to protect your mental well-being.',
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: Brain,
        href: '/tools/anti-pua-assistant',
        tags: ['workplace', 'pua', 'mental health', 'self help', 'communication'],
      },
      {
        id: 'impressive-meeting-phrases',
        name: '"开会装B速成手册"',
        englishName: 'Impressive Meeting Phrases',
        description:
          '精选开会高频"黑话"和"金句"，让你在关键时刻一鸣惊人，轻松营造专业且深刻的印象。',
        englishDescription:
          'A curated list of buzzwords and power phrases to make you sound impressive in meetings, effortlessly.',
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: Mic,
        href: '/tools/impressive-meeting-phrases',
        tags: ['communication', 'meeting', 'professionalism', 'fun', 'lingo'],
      },
      {
        id: 'office-fengshui-detector',
        name: '"办公室风水/工位能量检测器（玄学版）"',
        englishName: 'Office Feng Shui Detector (Metaphysical Edition)',
        description:
          '利用尖端AI（的想象力）分析你工位的神秘能量流动，提供不科学但有趣的"开运"建议。',
        englishDescription:
          "Using cutting-edge AI (imagination), analyze your desk's mystical energy flow and get unscientific but fun 'luck-boosting' tips.",
        categoryKey: 'office-fun',
        categoryName: '摸鱼作乐',
        icon: BatteryCharging,
        href: '/tools/office-fengshui-detector',
        tags: ['fun', 'fengshui', 'office', 'metaphysics', 'humor', 'wellbeing'],
      },
    ],
  },
];

export const allTools: Tool[] = toolCategories.reduce(
  (acc, category) => acc.concat(category.tools),
  [] as Tool[]
);
