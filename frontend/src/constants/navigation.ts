import {
  Bot,
  Drama,
  FolderKanban,
  Home,
  Lightbulb,
  LineChart,
  MessageSquareText,
  ShieldAlert,
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
    label: '摸鱼作乐',
    icon: Drama,
    children: [
      { href: '/tools/pro-slackers-time-manager', label: '摸鱼时间管理大师', icon: Lightbulb },
      { href: '/tools/awesome-compliment-generator', label: '彩虹屁生成器', icon: Lightbulb },
      {
        href: '/tools/weekly-report-sparkle-enhancer',
        label: '"这周干了啥"亮点包装器',
        icon: Lightbulb,
      },
      { href: '/tools/universal-excuse-generator', label: '"万能借口"生成器', icon: Lightbulb },
      {
        href: '/tools/lunch-decision-overlord',
        label: '"今天中午吃什么？"终极选择器',
        icon: Lightbulb,
      },
      { href: '/tools/meeting-doodle-buddy', label: '"会议神游"涂鸦伴侣', icon: Lightbulb },
      { href: '/tools/daily-grind-affirmations', label: '"打工人"每日一句', icon: Lightbulb },
      { href: '/tools/meeting-bingo-generator', label: '"会议BINGO"卡片生成器', icon: Lightbulb },
      { href: '/tools/office-outfit-advisor', label: '"今天穿什么？"职场版', icon: Lightbulb },
      { href: '/tools/anti-pua-assistant', label: '"拒绝PUA"小助手', icon: Lightbulb },
      { href: '/tools/impressive-meeting-phrases', label: '"开会装B速成手册"', icon: Lightbulb },
      {
        href: '/tools/office-fengshui-detector',
        label: '"办公室风水/工位能量检测器（玄学版）"',
        icon: Lightbulb,
      },
      { href: '/tools/sanity-check-meter', label: '"下班前精神状态检查器"', icon: Lightbulb },
      { href: '/tools/daily-slacking-almanac', label: '"今日宜摸鱼/忌加班"黄历', icon: Lightbulb },
    ],
  },
];
