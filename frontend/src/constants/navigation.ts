import {
  Bot,
  FolderKanban,
  Home,
  Lightbulb,
  LineChart,
  MessageSquareText,
  ShieldAlert,
  Users,
} from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavLink[];
  isCategory?: boolean;
}

export interface NavCategory {
  label: string;
  icon: React.ElementType;
  children: NavLink[];
}

export const navigationLinks: NavCategory[] = [
  {
    label: '概览',
    icon: Home,
    children: [{ href: '/', label: '主页', icon: Home }],
  },
  {
    label: '沟通优化',
    icon: MessageSquareText,
    children: [
      { href: '/tools/speech-optimizer', label: '话术优化器', icon: Lightbulb },
      { href: '/tools/email-polisher', label: '邮件润色器', icon: Lightbulb },
      { href: '/tools/meeting-speech-generator', label: '会议发言生成器', icon: Lightbulb },
    ],
  },
  {
    label: '语言转换',
    icon: Bot,
    children: [
      { href: '/tools/jargon-translator', label: '黑话翻译器', icon: Lightbulb },
      { href: '/tools/cross-department-translator', label: '跨部门沟通翻译', icon: Lightbulb },
      { href: '/tools/eq-assistant', label: '职场情商助手', icon: Lightbulb },
    ],
  },
  {
    label: '内容生成',
    icon: FolderKanban,
    children: [
      { href: '/tools/ppt-phrase-generator', label: 'PPT金句生成器', icon: Lightbulb },
      { href: '/tools/professional-persona-generator', label: '职场人设生成器', icon: Lightbulb },
      { href: '/tools/data-beautifier', label: '汇报数据美化器', icon: Lightbulb },
    ],
  },
  {
    label: '危机处理',
    icon: ShieldAlert,
    children: [
      { href: '/tools/blame-tactics', label: '甩锅/背锅话术', icon: Lightbulb },
      { href: '/tools/crisis-communication-templates', label: '危机公关模板', icon: Lightbulb },
      { href: '/tools/resignation-templates', label: '离职/跳槽文案', icon: Lightbulb },
    ],
  },
  {
    label: '智能分析',
    icon: LineChart,
    children: [
      { href: '/tools/team-mood-detector', label: '团队氛围检测器', icon: Lightbulb },
      { href: '/tools/meeting-notes-organizer', label: '会议记录智能整理', icon: Lightbulb },
      { href: '/tools/workplace-meme-generator', label: '职场梗图生成器', icon: Lightbulb },
    ],
  },
  {
    label: '团队与设置',
    icon: Users, // Example icon for a different category
    children: [
      { href: '/settings', label: '设置', icon: Lightbulb },
      { href: '/team', label: '团队管理', icon: Lightbulb },
    ],
  },
];
