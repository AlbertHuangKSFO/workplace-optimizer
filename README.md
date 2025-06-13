# 打工人必备工具 - 职场优化器

![Banner](./img/banner.png)

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/AlbertHuangKSFO/workplace-optimizer?style=flat-square)](https://github.com/AlbertHuangKSFO/workplace-optimizer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/AlbertHuangKSFO/workplace-optimizer?style=flat-square)](https://github.com/AlbertHuangKSFO/workplace-optimizer/network)
[![GitHub issues](https://img.shields.io/github/issues/AlbertHuangKSFO/workplace-optimizer?style=flat-square)](https://github.com/AlbertHuangKSFO/workplace-optimizer/issues)
[![License](https://img.shields.io/github/license/AlbertHuangKSFO/workplace-optimizer?style=flat-square)](https://github.com/AlbertHuangKSFO/workplace-optimizer/blob/main/LICENSE)

**🚀 AI 驱动的职场工具集合，让工作更高效、沟通更顺畅、摸鱼更有艺术感**

[在线体验](https://office.mrerhuang.com) | [功能介绍](#功能特色) | [快速开始](#快速开始) | [贡献指南](#贡献指南)

</div>

## 📖 项目简介

职场优化器是一个基于 AI 的综合性职场工具平台，旨在帮助职场人士提升工作效率、优化沟通技巧、应对职场挑战。无论你是初入职场的新人，还是经验丰富的老手，这里都有适合你的工具。

![Homepage](./img/homepage_compressed.gif)

![Function Demo](./img/function_compressed.gif)

### 🎯 核心理念

- **效率至上**：用 AI 技术解决职场中的重复性工作
- **沟通优化**：提升职场沟通的专业性和有效性
- **危机应对**：提供职场困境的解决方案和话术模板
- **寓教于乐**：在提升工作效率的同时，不忘工作的乐趣

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Git

### 安装步骤 - 🐳 Docker 部署 (推荐)

1. **克隆项目**

```bash
git clone https://github.com/AlbertHuangKSFO/workplace-optimizer.git
cd workplace-optimizer
```

2. **配置环境变量**

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量，添加你的AI API密钥
nano .env
```

3. 启动 docker

```bash
# 方式一：使用启动脚本
./docker-dev.sh

# 方式二：直接使用 docker-compose
docker-compose up -d
```

3. **生产环境部署**

```bash
# 构建生产镜像
make prod-build

# 启动生产环境
make prod
```

#### 服务地址

- **前端**: http://localhost:3000
- **后端**: http://localhost:8000
- **Redis**: localhost:6379

## 🆙 待实现功能

- 亮色暗色切换
- 英文支持
- 其他功能
  - 起名花名
  - 工作日倒计时
  - 划水指数计算器
  - 今日宜忌：工作版黄历（宜摸鱼、忌加班等）
  - 工资倒推计算器：显示"这一分钟赚了多少钱"
  - 打工人表情包生成器
  - 随机鸡汤/毒鸡汤切换器
  - 夸夸生成器
  - 同事人设分析器
  - 会议废话翻译器
  - 危险系数监测：根据老板位置提醒摸鱼风险
  - 副业潜力测试：评估搞副业的可行性
  - 财务自由倒计时：按当前存钱速度算何时退休
  - 办公室瑜伽指导：适合工位的拉伸动作
  - 隐形消费追踪：计算奶茶、外卖的年度总花费
  - 平行宇宙工作模拟：如果选择了另一个职业会怎样
  - 电子木鱼：敲一敲消除工作烦恼
  - 办公室鬼故事：上班族专属恐怖故事

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是新功能、bug 修复、文档改进还是设计优化。

### 贡献方式

1. **Fork 项目**
2. **创建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **创建 Pull Request**

### 开发规范

- 遵循现有的代码风格
- 为新功能添加适当的测试
- 更新相关文档
- 确保所有测试通过

### 问题反馈

如果你发现了 bug 或有新功能建议，请：

1. 查看 [Issues](https://github.com/AlbertHuangKSFO/workplace-optimizer/issues) 确认问题未被报告
2. 创建新的 Issue，详细描述问题或建议
3. 使用合适的标签分类

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢所有贡献者的努力
- 感谢开源社区提供的优秀工具和库
- 特别感谢所有提供反馈和建议的用户

## 📞 联系我们

- **项目主页**: [GitHub Repository](https://github.com/AlbertHuangKSFO/workplace-optimizer)
- **在线体验**: [Live Demo](https://workplace-optimizer.vercel.app)
- **问题反馈**: [GitHub Issues](https://github.com/AlbertHuangKSFO/workplace-optimizer/issues)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个星标！**

Made with ❤️ by [Albert Huang](https://github.com/AlbertHuangKSFO)

</div>
