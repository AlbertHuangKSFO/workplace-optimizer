# AI Agent 开发指令文档 - 职场沟通优化器

> 专为 AI Agent 和 Cursor 设计的详细开发指令，包含阶段性总结和开源准备

## 项目概述

### 项目名称

- 中文名：职场沟通优化器
- 英文名：Workplace Communication Optimizer
- 项目代码：workplace-optimizer

### 核心功能

创建一个为互联网大厂员工设计的职场沟通工具，采用 iTools 风格界面设计，支持多 AI 供应商，包含以下功能模块：

**沟通优化类:**

1. 话术优化器 (Speech Optimizer)
2. 邮件润色器 (Email Polisher)
3. 会议发言生成器 (Meeting Speech Generator)

**语言转换类:** 4. 黑话翻译器 (Jargon Translator) 5. 跨部门沟通翻译 (Cross-Department Translator) 6. 职场情商助手 (EQ Assistant)

**内容生成类:** 7. PPT 金句生成器 (PPT Phrase Generator) 8. 职场人设生成器 (Professional Persona Generator) 9. 汇报数据美化器 (Data Beautifier)

**危机处理类:** 10. 甩锅/背锅话术 (Blame/Cover Tactics) 11. 危机公关模板 (Crisis Communication Templates) 12. 离职/跳槽文案生成器 (Resignation/Job-hopping Templates)

**智能分析类:** 13. 团队氛围检测器 (Team Mood Detector) 14. 会议记录智能整理 (Meeting Notes Organizer) 15. 职场梗图生成器 (Workplace Meme Generator)

**摸鱼作乐与职场调剂 (Office Fun & Well-being):**

16. 摸鱼时间管理大师 (Pro Slacker's Time Manager)
17. 彩虹屁生成器 (Awesome Compliment Generator)
18. "这周干了啥"亮点包装器 (Weekly Report "Sparkle" Enhancer)
19. "万能借口"生成器 (Universal Excuse Generator)
20. "今天中午吃什么？"终极选择器 (Lunch Decision Overlord)
21. "会议神游"涂鸦伴侣 (Meeting Doodle Buddy)
22. "打工人"每日一句 (Daily Grind Affirmations/Antidotes)
23. "会议BINGO"卡片生成器 (Meeting BINGO Card Generator)
24. "今天穿什么？"职场版 (What to Wear - Office Edition)
25. "拒绝PUA"小助手 (Anti-PUA Assistant / Workplace Gaslight Shield)
26. "开会装B速成手册" (Meeting Bullsh*t Bingo Companion / Impressive Phrases for Meetings)
27. "办公室风水/工位能量检测器（玄学版）" (Office Feng Shui / Desk Energy Detector - Metaphysical Edition)
28. "下班前精神状态检查器" (End-of-Day Sanity Check / Burnout Meter - Humorous)
29. "今日宜摸鱼/忌加班"黄历 (Daily "Good for Slacking / Bad for Overtime" Almanac)

### 技术要求

- **前端**: React 18 + TypeScript + Tailwind CSS + Shadcn/ui
- **后端**: Node.js + Express + TypeScript
- **AI 模型**: 多供应商接入 (OpenAI、Anthropic、Google、国内厂商)
- **UI 设计**: 仿 iTools 风格，现代化界面设计
- **容器化**: Docker + Docker Compose
- **多语言**: 中文 + 英文完整支持
- **开源准备**: 完整的开源项目结构
- **git update**: 该项目属于一个 git 库，当你完成阶段性任务以后需要上传到这个库
- **访客统计**: 实现匿名的基本访客和工具使用频率统计

## AI Agent 执行指令

### 阶段一：项目初始化和基础架构 (Stage 1)

#### 任务 1.1: 创建项目结构

```bash
# 创建以下完整的项目目录结构
workplace-optimizer/
├── frontend/                    # React前端应用
├── backend/                     # Node.js后端API
├── docs/                        # 项目文档
│   ├── zh/                      # 中文文档
│   └── en/                      # 英文文档
├── .github/                     # GitHub配置
│   ├── workflows/               # CI/CD工作流
│   ├── ISSUE_TEMPLATE/          # Issue模板
│   └── PULL_REQUEST_TEMPLATE.md # PR模板
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
├── README.md                    # 英文README
├── README.zh.md                 # 中文README
└── LICENSE
```

#### 任务 1.2: 初始化前端项目

```bash
# 在frontend目录执行：
npx create-react-app . --template typescript
npm install tailwindcss @headlessui/react lucide-react
npm install i18next react-i18next i18next-browser-languagedetector
npm install axios react-router-dom @types/react-router-dom
npm install react-hot-toast react-loading-skeleton
npm install @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-tabs
npm install class-variance-authority clsx tailwind-merge
npm install framer-motion  # 动画库

# 创建以下目录结构：
src/
├── components/
│   ├── layout/                  # 布局组件
│   │   ├── AppLayout.tsx       # 主布局 (仿iTools)
│   │   ├── Sidebar.tsx         # 左侧导航栏
│   │   ├── Header.tsx          # 顶部导航
│   │   └── ModelSelector.tsx   # 模型选择器
│   ├── ui/                     # 基础UI组件 (shadcn/ui风格)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Dialog.tsx
│   │   ├── Popover.tsx
│   │   ├── Progress.tsx
│   │   └── index.ts
│   ├── tools/                  # 工具组件
│   │   ├── ToolCard.tsx        # 工具卡片 (仿iTools风格)
│   │   ├── ToolModal.tsx       # 工具使用弹窗
│   │   ├── ToolGrid.tsx        # 工具网格布局
│   │   └── CategoryTabs.tsx    # 分类标签
│   └── model/                  # 模型相关组件
│       ├── ModelDashboard.tsx  # 模型监控面板
│       ├── ModelStatus.tsx    # 模型状态显示
│       └── CostTracker.tsx    # 成本追踪器
├── features/                   # 功能模块
│   ├── communication/          # 沟通优化类
│   │   ├── optimizer/         # 话术优化
│   │   ├── email/             # 邮件润色
│   │   └── meeting/           # 会议发言
│   ├── translation/            # 语言转换类
│   │   ├── jargon/            # 黑话翻译
│   │   ├── department/        # 跨部门沟通
│   │   └── eq-assistant/      # 情商助手
│   ├── generation/             # 内容生成类
│   │   ├── ppt/               # PPT金句
│   │   ├── persona/           # 人设生成
│   │   └── data-beautifier/   # 数据美化
│   ├── crisis/                 # 危机处理类
│   │   ├── tactics/           # 甩锅/背锅
│   │   ├── pr/                # 危机公关
│   │   └── resignation/       # 离职文案
│   └── analysis/               # 智能分析类
│       ├── mood-detector/     # 团队氛围
│       ├── meeting-notes/     # 会议整理
│       └── meme-generator/    # 梗图生成
├── hooks/                      # 全局Hooks
├── services/                   # API服务
│   ├── api.ts                 # 统一API接口
│   ├── modelService.ts        # 模型服务
│   └── providers/             # 各供应商适配
├── utils/                      # 工具函数
├── i18n/                       # 国际化
│   ├── locales/zh/
│   └── locales/en/
├── types/                      # TypeScript类型
│   ├── global.ts              # 全局类型
│   ├── model.ts               # 模型相关类型
│   └── tool.ts                # 工具相关类型
├── constants/                  # 常量定义
│   ├── tools.ts               # 工具配置
│   ├── models.ts              # 模型配置
│   └── colors.ts              # 配色方案
└── styles/                     # 样式文件
    ├── globals.css            # 全局样式
    └── components.css         # 组件样式
```

#### 任务 1.3: 初始化后端项目

```bash
# 在backend目录执行：
npm init -y
npm install express cors dotenv helmet morgan compression
npm install -D @types/express @types/cors @types/node typescript ts-node nodemon
npm install axios rate-limiter-flexible node-cache
npm install joi @types/joi    # 数据验证
# 多AI供应商支持
npm install openai @anthropic-ai/sdk @google/generative-ai

# 创建以下目录结构：
src/
├── controllers/                # 控制器层
│   ├── communication/         # 沟通优化控制器
│   ├── translation/           # 翻译功能控制器
│   ├── generation/            # 内容生成控制器
│   ├── crisis/                # 危机处理控制器
│   ├── analysis/              # 智能分析控制器
│   └── model/                 # 模型管理控制器
├── services/                   # 业务逻辑层
│   ├── ai/                    # AI服务
│   │   ├── adapters/          # 供应商适配器
│   │   │   ├── OpenAIAdapter.ts
│   │   │   ├── AnthropicAdapter.ts
│   │   │   ├── GoogleAdapter.ts
│   │   │   ├── MoonshotAdapter.ts
│   │   │   ├── ZhipuAdapter.ts
│   │   │   ├── BaiduAdapter.ts
│   │   │   ├── AlibabaAdapter.ts
│   │   │   ├── DeepSeekAdapter.ts
│   │   │   └── index.ts
│   │   ├── ModelManager.ts    # 模型管理器
│   │   ├── ModelRouter.ts     # 智能路由
│   │   ├── CostTracker.ts     # 成本追踪
│   │   └── HealthChecker.ts   # 健康检查
│   ├── prompt/                # 提示词管理
│   │   ├── PromptBuilder.ts   # 提示词构建器
│   │   ├── PromptOptimizer.ts # 提示词优化器
│   │   └── PromptTemplates.ts # 提示词模板
│   └── cache/                 # 缓存服务
│       ├── CacheService.ts
│       └── CacheStrategy.ts
├── routes/                     # 路由层
│   ├── api/                   # API路由
│   │   ├── communication.ts
│   │   ├── translation.ts
│   │   ├── generation.ts
│   │   ├── crisis.ts
│   │   ├── analysis.ts
│   │   └── models.ts
│   └── index.ts
├── middleware/                 # 中间件
│   ├── rateLimit.ts          # 限流中间件
│   ├── validation.ts         # 验证中间件
│   └── errorHandler.ts       # 错误处理
├── config/                     # 配置文件
│   ├── database.ts           # 数据库配置
│   ├── ai.ts                 # AI配置
│   └── app.ts                # 应用配置
├── data/                       # 数据文件
│   ├── prompts/               # 提示词库
│   │   ├── zh/               # 中文提示词
│   │   │   ├── communication/ # 沟通优化
│   │   │   ├── translation/   # 翻译功能
│   │   │   ├── generation/    # 内容生成
│   │   │   ├── crisis/        # 危机处理
│   │   │   └── analysis/      # 智能分析
│   │   └── en/               # 英文提示词
│   │       ├── communication/
│   │       ├── translation/
│   │       ├── generation/
│   │       ├── crisis/
│   │       └── analysis/
│   ├── templates/             # 模板文件
│   └── models/                # 模型配置
│       ├── providers.json     # 供应商配置
│       └── pricing.json       # 定价信息
├── types/                      # 类型定义
│   ├── api.ts                # API类型
│   ├── model.ts              # 模型类型
│   └── common.ts             # 通用类型
└── utils/                      # 工具函数
    ├── logger.ts             # 日志工具
    ├── validator.ts          # 验证工具
    └── helper.ts             # 辅助函数
```

#### 任务 1.4: 创建 Docker 配置

创建完整的 Docker 配置文件，包括开发和生产环境。

#### 任务 1.5: 创建环境变量文件

```bash
# .env.example内容：
# OpenAI配置
OPENAI_API_KEY=your_openai_key
OPENAI_BASE_URL=https://api.openai.com/v1

# Anthropic配置
ANTHROPIC_API_KEY=your_anthropic_key
ANTHROPIC_BASE_URL=https://api.anthropic.com

# Google配置
GOOGLE_API_KEY=your_google_key

# 国内AI供应商配置
MOONSHOT_API_KEY=your_moonshot_key
MOONSHOT_BASE_URL=https://api.moonshot.cn/v1

ZHIPU_API_KEY=your_zhipu_key
ZHIPU_BASE_URL=https://open.bigmodel.cn/api/paas/v4

BAIDU_API_KEY=your_baidu_key
BAIDU_SECRET_KEY=your_baidu_secret_key

ALIBABA_API_KEY=your_alibaba_key
ALIBABA_BASE_URL=https://dashscope.aliyuncs.com/api/v1

DEEPSEEK_API_KEY=your_deepseek_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# 智能路由配置
DEFAULT_PROVIDER=anthropic
FALLBACK_PROVIDERS=openai,google,moonshot,openrouter
AUTO_FALLBACK=true
LOAD_BALANCE=true

# 成本控制
COST_LIMIT_DAILY=50.00
COST_LIMIT_MONTHLY=1000.00
COST_ALERT_THRESHOLD=0.8

# 性能配置
PERFORMANCE_THRESHOLD_MS=5000
TIMEOUT_MS=30000
MAX_RETRIES=3

# 服务配置
NODE_ENV=development
BACKEND_PORT=8000
FRONTEND_PORT=3000

# 缓存配置
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# 安全配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 日志配置
LOG_LEVEL=info
LOG_FORMAT=combined

# UI配置
UI_THEME=dark
UI_ANIMATION=enabled
SIDEBAR_DEFAULT_COLLAPSED=false
```

#### 阶段一总结检查点

完成阶段一后，AI Agent 需要生成总结报告：

```markdown
## 阶段一完成总结

- [x] 项目目录结构创建完成
- [x] 前端 React 项目初始化完成，依赖安装成功
- [x] 后端 Node.js 项目初始化完成，依赖安装成功
- [x] Docker 配置文件创建完成
- [x] 环境变量模板文件创建完成
- [x] 基础开源项目结构准备完成

### 验证命令

docker-compose up --build # 验证所有服务能正常启动
npm run dev # 验证前后端开发服务器能正常运行

### 下一阶段准备

- 确认所有依赖安装无错误
- 确认 Docker 服务能正常启动
- 准备开始核心功能开发
```

### 阶段二：核心功能开发 (Stage 2)

#### 任务 2.1: 开发 iTools 风格界面布局

```typescript
// 需要创建的核心界面文件：
frontend/src/components/layout/
├── AppLayout.tsx              # 主布局 (仿iTools)
├── Sidebar.tsx                # 左侧导航栏
├── Header.tsx                 # 顶部导航
└── ModelSelector.tsx          # 模型选择器

frontend/src/components/tools/
├── ToolCard.tsx               # 工具卡片 (仿iTools风格)
├── ToolGrid.tsx               # 工具网格布局
├── ToolModal.tsx              # 工具使用弹窗
└── CategoryTabs.tsx           # 分类标签

frontend/src/constants/
├── tools.ts                   # 工具配置
├── colors.ts                  # 配色方案 (仿iTools)
└── navigation.ts              # 导航配置

# 界面特性要求：
- 深色主题为主，支持亮色切换
- 左侧可折叠导航栏
- 工具卡片采用渐变背景和悬停效果
- 响应式设计，完美适配移动端
- 流畅的动画过渡效果
```

#### 任务 2.2: 开发多 AI 供应商适配器

```typescript
// backend/src/services/ai/adapters/
// 为每个AI供应商创建统一接口适配器
// 包含：OpenAI、Anthropic、Google、Moonshot、智谱、百度、阿里、DeepSeek

// 统一接口定义：
interface AIAdapter {
  provider: string;
  generateText(prompt: string, options?: GenerateOptions): Promise<string>;
  estimateCost(prompt: string): number;
  checkHealth(): Promise<boolean>;
  getModels(): Promise<ModelInfo[]>;
}

// 智能路由器：
class ModelRouter {
  selectOptimalModel(task: TaskType): AIAdapter;
  executeWithFallback(adapters: AIAdapter[]): Promise<string>;
  loadBalance(): AIAdapter;
}
```

#### 任务 2.3: 开发核心功能模块 (分类实现)

```typescript
// 按功能分类开发，每类包含前后端完整实现：

// 1. 沟通优化类
frontend/src/features/communication/
backend/src/controllers/communication/
backend/src/data/prompts/zh/communication/
backend/src/data/prompts/en/communication/

// 2. 语言转换类
frontend/src/features/translation/
backend/src/controllers/translation/

// 3. 内容生成类
frontend/src/features/generation/
backend/src/controllers/generation/

// 4. 危机处理类
frontend/src/features/crisis/
backend/src/controllers/crisis/

// 5. 智能分析类
frontend/src/features/analysis/
backend/src/controllers/analysis/
```

#### 任务 2.4: 开发模型管理和监控系统

```typescript
// backend/src/services/ai/ModelManager.ts
// 实现模型管理、健康检查、成本追踪
// 前端模型监控面板和切换界面

// frontend/src/components/model/
├── ModelDashboard.tsx         # 模型监控面板
├── ModelStatus.tsx           # 实时状态显示
├── CostTracker.tsx           # 成本追踪器
└── ModelSwitcher.tsx         # 模型切换器
```

#### 任务 2.5: 实现国际化支持

```json
// frontend/src/i18n/locales/zh/common.json
// frontend/src/i18n/locales/en/common.json
// 完整的多语言文本配置
```

#### 阶段二总结检查点

```markdown
## 阶段二完成总结

- [x] iTools 风格界面布局开发完成，包含左侧导航栏和响应式设计
- [x] 多 AI 供应商适配器开发完成，支持 8 家主流供应商
- [x] 15 个核心功能模块按分类开发完成，包含前后端实现
- [x] 模型管理和监控系统实现完成，支持智能路由和成本控制
- [x] 国际化支持实现完成，支持中英文切换

### 界面功能测试

- 测试左侧导航栏展开/折叠功能
- 测试工具卡片的悬停效果和点击交互
- 测试响应式布局在不同屏幕尺寸下的表现
- 测试深色/亮色主题切换

### AI 供应商测试

- 测试各供应商 API 连接状态
- 测试智能路由和降级策略
- 测试成本追踪和预警功能
- 测试模型切换的响应速度

### 功能模块测试

- 测试沟通优化类功能 (话术优化、邮件润色、会议发言)
- 测试语言转换类功能 (黑话翻译、跨部门沟通、情商助手)
- 测试内容生成类功能 (PPT 金句、人设生成、数据美化)
- 测试危机处理类功能 (甩锅话术、危机公关、离职文案)
- 测试智能分析类功能 (团队氛围、会议整理、梗图生成)

### API 端点验证

- POST /api/communication/\* (沟通优化类接口)
- POST /api/translation/\* (翻译功能类接口)
- POST /api/generation/\* (内容生成类接口)
- POST /api/crisis/\* (危机处理类接口)
- POST /api/analysis/\* (智能分析类接口)
- GET /api/models/status (模型状态接口)
- GET /api/models/cost (成本统计接口)
```

### 阶段三：功能扩展和 UI 完善 (Stage 3)

#### 任务 3.1: 完善界面交互和用户体验

- 优化左侧导航栏的交互体验
- 完善工具卡片的加载状态和错误处理
- 实现全局搜索功能
- 添加键盘快捷键支持
- 优化移动端触摸交互

#### 任务 3.2: 增强 AI 模型能力

- 实现 A/B 测试功能，对比不同提示词效果
- 实现智能成本控制，自动优化 API 调用
- 添加模型性能分析和报告功能
- 实现基本的匿名访客统计和工具使用频率统计

#### 任务 3.3: 完善功能模块细节

- 为每个功能添加高级选项和参数调节
- 实现历史记录和收藏功能
- 添加批量处理能力
- 实现结果导出和分享功能

#### 任务 3.4: 性能优化和缓存策略

- 实现智能缓存减少重复 API 调用
- 优化前端代码分割和懒加载
- 实现请求去重和防抖
- 添加离线模式支持错误处理界面

#### 任务 3.3: 性能优化

- 缓存策略实现
- 请求限流
- 代码分割
- 图片懒加载

#### 阶段三总结检查点

```markdown
## 阶段三完成总结

- [x] 所有 8 个核心功能模块开发完成
- [x] 用户界面完善，支持响应式和暗黑模式
- [x] 性能优化实施完成
- [x] 完整的错误处理和用户反馈

### 完整功能测试

- 测试所有 8 个功能模块
- 测试响应式布局
- 测试暗黑模式切换
- 测试性能和缓存
```

### 阶段四：开源准备和文档完善 (Stage 4)

#### 任务 4.1: 创建完整的 README 文档

```markdown
# 需要创建的文档文件：

README.md # 英文主 README
README.zh.md # 中文 README
docs/en/
├── installation.md # 安装指南
├── api.md # API 文档
├── development.md # 开发指南
├── deployment.md # 部署指南
└── contributing.md # 贡献指南

docs/zh/
├── installation.md # 安装指南
├── api.md # API 文档
├── development.md # 开发指南
├── deployment.md # 部署指南
└── contributing.md # 贡献指南
```

#### 任务 4.2: 创建 GitHub 模板文件

```markdown
# .github/ISSUE_TEMPLATE/

├── bug_report.md # Bug 报告模板
├── feature_request.md # 功能请求模板
└── question.md # 问题咨询模板

# .github/PULL_REQUEST_TEMPLATE.md

# PR 模板，包含检查清单
```

#### 任务 4.3: 创建 CI/CD 工作流

```yaml
# .github/workflows/
├── ci.yml            # 持续集成
├── docker.yml        # Docker构建和推送
└── release.yml       # 发布工作流
```

#### 任务 4.4: 创建开源协议和贡献指南

```markdown
# LICENSE 文件 (建议 MIT 协议)

# CONTRIBUTING.md 贡献指南

# CODE_OF_CONDUCT.md 行为准则
```

#### 任务 4.5: 创建部署脚本和配置

```bash
# scripts/
├── deploy.sh         # 部署脚本
├── backup.sh         # 备份脚本
└── setup.sh          # 环境设置脚本

# docker-compose.prod.yml  # 生产环境配置
```

#### 阶段四总结检查点

```markdown
## 阶段四完成总结 (最终总结)

- [x] 完整的中英文 README 文档创建完成
- [x] API 文档和开发文档完善完成
- [x] GitHub Issue 和 PR 模板创建完成
- [x] CI/CD 工作流配置完成
- [x] 开源协议和贡献指南创建完成
- [x] 部署脚本和生产配置完成

### 开源准备检查清单

- [x] 代码质量检查通过
- [x] 安全漏洞扫描通过
- [x] 完整的文档覆盖
- [x] 示例和演示完成
- [x] 许可证和法律文件完整

### 最终验证

- 完整功能演示录屏
- 部署文档验证
- 新用户 onboarding 测试
- 社区反馈收集准备
```

## 特殊要求和注意事项

### AI Agent 执行规范

1. **阶段性检查**: 每完成一个阶段必须生成总结报告
2. **错误处理**: 遇到错误时提供详细的错误信息和解决方案
3. **代码质量**: 所有代码必须包含完整的 TypeScript 类型定义
4. **注释标准**: 关键功能必须有中英文注释
5. **测试要求**: 核心功能必须包含单元测试

### 开源项目标准

1. **文档完整性**: 中英文文档必须同步更新
2. **社区友好**: 包含完整的贡献指南和行为准则
3. **部署简单**: 一键 Docker 部署
4. **示例丰富**: 包含完整的使用示例
5. **持续集成**: 自动化测试和部署

### 多语言支持要求

1. **界面语言**: 前端界面完整的中英文支持
2. **提示词本地化**: AI 提示词针对中英文分别优化
3. **文档双语**: 所有文档必须有中英文版本
4. **错误信息**: 错误提示支持多语言
5. **API 响应**: API 响应消息支持国际化

### Docker 和部署要求

1. **多环境配置**: 开发、测试、生产环境分离
2. **健康检查**: 所有服务包含健康检查
3. **日志管理**: 完整的日志收集和管理
4. **监控告警**: 基础的监控和告警配置
5. **备份策略**: 数据备份和恢复方案

## 最终交付清单

### 代码交付

- [x] 完整的前端 React 应用
- [x] 完整的后端 Node.js API
- [x] SGLang 模型服务集成
- [x] Docker 完整配置
- [x] 环境变量配置模板

### 文档交付

- [x] 中英文 README
- [x] API 文档
- [x] 部署指南
- [x] 开发指南
- [x] 贡献指南

### 开源准备

- [x] GitHub 模板文件
- [x] CI/CD 工作流
- [x] 开源协议
- [x] 社区管理文件

### 运维配置

- [x] 生产环境 Docker 配置
- [x] 部署脚本
- [x] 备份方案
- [x] 监控配置

## AI Agent 执行命令

开始执行请使用以下命令格式：

```bash
# 开始执行
AI Agent: 开始执行阶段一任务，创建项目基础架构

# 阶段完成报告
AI Agent: 生成阶段一完成总结报告

# 继续下一阶段
AI Agent: 开始执行阶段二任务，开发核心功能
```

请确保每个阶段完成后都生成详细的总结报告，包含完成状态、验证结果和下一步计划。
