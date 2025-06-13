# 🤝 贡献指南

感谢你对职场优化器项目的关注！我们欢迎所有形式的贡献，无论是代码、文档、设计还是想法建议。

## 📋 贡献方式

### 🐛 报告 Bug

- 使用 [Bug 报告模板](https://github.com/AlbertHuangKSFO/workplace-optimizer/issues/new?template=bug_report.yml) 创建 Issue
- 提供详细的复现步骤和环境信息
- 如果可能，请提供截图或错误日志

### 💡 功能建议

- 使用 [功能请求模板](https://github.com/AlbertHuangKSFO/workplace-optimizer/issues/new?template=feature_request.yml) 创建 Issue
- 详细描述功能需求和使用场景
- 说明为什么这个功能对用户有价值

### 💻 代码贡献

#### 开发环境设置

1. **Fork 项目**

   ```bash
   # 克隆你的 fork
   git clone https://github.com/YOUR_USERNAME/workplace-optimizer.git
   cd workplace-optimizer
   ```

2. **使用 Docker 启动开发环境（推荐）**

   ```bash
   # 启动开发环境
   ./docker-dev.sh
   # 或者
   make dev
   ```

3. **或者手动安装依赖**

   ```bash
   # 前端
   cd frontend && npm install

   # 后端
   cd ../backend && npm install
   ```

#### 开发流程

1. **创建功能分支**

   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

2. **进行开发**

   - 遵循现有的代码风格
   - 添加必要的注释
   - 确保代码可读性

3. **测试你的更改**

   ```bash
   # 前端测试
   cd frontend && npm run build

   # 后端测试
   cd backend && npm run build
   ```

4. **提交更改**

   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   # 或
   git commit -m "fix: 修复某个问题"
   ```

5. **推送并创建 PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 代码规范

### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具链更新

**示例：**

```
feat: 添加职场人设生成器功能
fix: 修复邮件润色器的格式问题
docs: 更新 Docker 部署文档
```

### 代码风格

- **TypeScript**: 使用严格模式，添加类型注解
- **React**: 使用函数组件和 Hooks
- **CSS**: 使用 Tailwind CSS，避免自定义 CSS
- **命名**: 使用有意义的变量和函数名

### 文件结构

```
frontend/src/
├── app/                    # Next.js App Router 页面
├── components/             # 通用组件
│   ├── ui/                # Shadcn UI 组件
│   └── layout/            # 布局组件
├── features/              # 功能模块
│   ├── communication/     # 沟通优化
│   ├── translation/       # 语言转换
│   ├── generation/        # 内容生成
│   ├── crisis/           # 危机处理
│   ├── analysis/         # 智能分析
│   └── entertainment/    # 摸鱼作乐
├── lib/                  # 工具函数
└── constants/            # 常量配置
```

## 🎯 功能开发指南

### 添加新工具

1. **在对应的功能目录下创建组件**

   ```
   frontend/src/features/[category]/[tool-name]/
   ├── [ToolName].tsx          # 主组件
   ├── types.ts               # 类型定义
   └── constants.ts           # 常量配置
   ```

2. **组件结构模板**

   ```tsx
   'use client';

   import { useState } from 'react';
   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
   // ... 其他导入

   export default function ToolName() {
     // 状态管理
     // 表单处理
     // API 调用

     return (
       <div className="container mx-auto p-6">
         <Card>
           <CardHeader>
             <CardTitle>工具标题</CardTitle>
           </CardHeader>
           <CardContent>{/* 工具内容 */}</CardContent>
         </Card>
       </div>
     );
   }
   ```

3. **添加路由**
   在 `frontend/src/app/` 下创建对应的页面文件

4. **更新导航**
   在相关的导航组件中添加新工具的链接

### UI/UX 设计原则

- **一致性**: 使用统一的设计语言和组件
- **可访问性**: 确保键盘导航和屏幕阅读器支持
- **响应式**: 支持移动端和桌面端
- **性能**: 优化加载速度和交互响应

## 🧪 测试

### 手动测试

- 在不同浏览器中测试（Chrome, Firefox, Safari, Edge）
- 测试移动端响应式布局
- 验证表单验证和错误处理
- 测试 AI 功能的输入输出

### 测试清单

- [ ] 功能正常工作
- [ ] UI 在不同屏幕尺寸下正常显示
- [ ] 错误处理正确
- [ ] 加载状态显示
- [ ] 无控制台错误

## 📚 文档贡献

### 文档类型

- **README**: 项目介绍和快速开始
- **功能文档**: 详细的功能使用说明
- **开发文档**: 技术实现和架构说明
- **API 文档**: 后端 API 接口文档

### 文档规范

- 使用清晰的标题结构
- 提供代码示例
- 添加截图说明
- 保持内容更新

## 🎨 设计贡献

我们欢迎以下设计贡献：

- UI/UX 改进建议
- 新功能的设计稿
- 图标和插图
- 品牌视觉优化

## 🌟 社区参与

### 讨论区

- 参与 [GitHub Discussions](https://github.com/AlbertHuangKSFO/workplace-optimizer/discussions)
- 分享使用经验和技巧
- 提出改进建议

### 代码审查

- 积极参与 PR 审查
- 提供建设性反馈
- 分享最佳实践

## 📞 获取帮助

如果你在贡献过程中遇到问题：

1. **查看现有文档**: README 和相关文档
2. **搜索 Issues**: 看看是否有类似问题
3. **创建 Issue**: 使用问题咨询模板
4. **参与讨论**: 在 Discussions 中提问

## 🙏 致谢

感谢每一位贡献者的努力！你的贡献让这个项目变得更好。

### 贡献者名单

<!-- 这里会自动更新贡献者列表 -->

---

再次感谢你的贡献！让我们一起打造更好的职场工具！ 🚀
