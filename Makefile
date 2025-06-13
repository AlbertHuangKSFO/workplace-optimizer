# 职场优化器 - Makefile

.PHONY: help dev prod stop clean logs shell-frontend shell-backend restart build

# 默认目标
help:
	@echo "职场优化器 - Docker 管理命令"
	@echo ""
	@echo "开发环境:"
	@echo "  make dev          - 启动开发环境"
	@echo "  make dev-clean    - 清理并启动开发环境"
	@echo "  make stop         - 停止所有服务"
	@echo "  make restart      - 重启所有服务"
	@echo "  make logs         - 查看所有服务日志"
	@echo "  make logs-f       - 实时查看日志"
	@echo ""
	@echo "生产环境:"
	@echo "  make prod         - 启动生产环境"
	@echo "  make prod-build   - 构建生产镜像"
	@echo ""
	@echo "调试:"
	@echo "  make shell-frontend  - 进入前端容器"
	@echo "  make shell-backend   - 进入后端容器"
	@echo "  make shell-redis     - 进入 Redis 容器"
	@echo ""
	@echo "清理:"
	@echo "  make clean        - 清理容器和卷"
	@echo "  make clean-all    - 清理所有 Docker 资源"

# 开发环境
dev:
	@echo "🚀 启动开发环境..."
	@if [ ! -f .env ]; then \
		echo "⚠️  复制 .env.example 到 .env"; \
		cp .env.example .env; \
	fi
	docker-compose up -d
	@echo "✅ 开发环境启动完成!"
	@echo "📱 前端: http://localhost:3000"
	@echo "🔧 后端: http://localhost:8000"

dev-clean:
	@echo "🧹 清理并启动开发环境..."
	docker-compose down -v
	docker system prune -f
	$(MAKE) dev

# 生产环境
prod:
	@echo "🚀 启动生产环境..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ 生产环境启动完成!"

prod-build:
	@echo "🔨 构建生产镜像..."
	docker-compose -f docker-compose.prod.yml build

# 基本操作
stop:
	@echo "⏹️  停止所有服务..."
	docker-compose down
	docker-compose -f docker-compose.prod.yml down

restart:
	@echo "🔄 重启服务..."
	docker-compose restart

logs:
	docker-compose logs

logs-f:
	docker-compose logs -f

# 进入容器
shell-frontend:
	docker-compose exec frontend sh

shell-backend:
	docker-compose exec backend sh

shell-redis:
	docker-compose exec redis redis-cli

# 清理
clean:
	@echo "🧹 清理容器和卷..."
	docker-compose down -v
	docker-compose -f docker-compose.prod.yml down -v

clean-all:
	@echo "🧹 清理所有 Docker 资源..."
	docker system prune -a -f
	docker volume prune -f

# 健康检查
health:
	@echo "🏥 检查服务健康状态..."
	@docker-compose ps
	@echo ""
	@echo "前端健康检查:"
	@curl -s http://localhost:3000/api/health || echo "❌ 前端服务异常"
	@echo ""
	@echo "后端健康检查:"
	@curl -s http://localhost:8000/health || echo "❌ 后端服务异常"
