#!/bin/bash

# 职场优化器 - 开发环境启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 启动职场优化器开发环境...${NC}"

# 检查 .env 文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  未找到 .env 文件，正在从 .env.example 复制...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ 已创建 .env 文件，请根据需要修改配置${NC}"
    else
        echo -e "${RED}❌ 未找到 .env.example 文件${NC}"
        exit 1
    fi
fi

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi

# 清理旧容器 (可选)
if [ "$1" = "--clean" ]; then
    echo -e "${YELLOW}🧹 清理旧容器和卷...${NC}"
    docker-compose down -v
    docker system prune -f
fi

# 构建并启动服务
echo -e "${BLUE}🔨 构建并启动服务...${NC}"
docker-compose up --build -d

# 等待服务启动
echo -e "${BLUE}⏳ 等待服务启动...${NC}"
sleep 10

# 检查服务状态
echo -e "${BLUE}📊 检查服务状态...${NC}"
docker-compose ps

# 显示日志
echo -e "${GREEN}✅ 开发环境启动完成！${NC}"
echo -e "${BLUE}📱 前端地址: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 后端地址: http://localhost:8000${NC}"
echo -e "${BLUE}🗄️  Redis: localhost:6379${NC}"
echo ""
echo -e "${YELLOW}💡 常用命令:${NC}"
echo -e "  查看日志: ${GREEN}docker-compose logs -f${NC}"
echo -e "  停止服务: ${GREEN}docker-compose down${NC}"
echo -e "  重启服务: ${GREEN}docker-compose restart${NC}"
echo -e "  进入容器: ${GREEN}docker-compose exec frontend sh${NC}"
echo ""

# 可选：自动打开浏览器
if command -v open > /dev/null 2>&1; then
    read -p "是否打开浏览器? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:3000
    fi
fi
