import {
  Bot, // Renamed to avoid conflict with Next/Image
  Briefcase,
  ClipboardList,
  FileText,
  Flame,
  FolderKanban,
  Image as ImageIcon,
  Lightbulb,
  LineChart,
  Mail,
  MessageSquareText,
  Palette,
  Presentation,
  ShieldAlert,
  Smile,
  UserCheck,
  Users,
  Waypoints,
} from 'lucide-react';
import { NavCategory } from './navigation'; // Reuse NavCategory for structure if suitable

export type ToolCategoryKey =
  | 'communication'
  | 'translation'
  | 'generation'
  | 'crisis'
  | 'analysis';

export interface Tool {
  id: string;
  name: string;
  description: string;
  categoryKey: ToolCategoryKey;
  categoryName: string; // For display
  icon: React.ElementType;
  href: string;
  tags?: string[]; // Optional tags for searching/filtering
}

export interface ToolCategory extends NavCategory {
  // Extending NavCategory
  key: ToolCategoryKey;
  tools: Tool[];
}

export const toolCategories: ToolCategory[] = [
  {
    key: 'communication',
    label: '沟通优化',
    icon: MessageSquareText,
    children: [], // NavCategory expects children, tools will be in 'tools' prop
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
        icon: Presentation, // Re-using, or find a more specific one
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
        icon: Palette, // Changed to Palette
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
        icon: Flame, // Changed to Flame
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
        icon: Users, // Re-using, or find specific
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
];

// Helper function to get all tools in a flat list
export const allTools: Tool[] = toolCategories.reduce(
  (acc, category) => acc.concat(category.tools),
  [] as Tool[]
);
