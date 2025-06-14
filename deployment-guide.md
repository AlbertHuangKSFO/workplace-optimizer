# Ubuntu x86 部署指南

## 🚀 从 ARM 开发环境迁移到 Ubuntu x86 生产环境

### 1. 系统准备

#### 安装 Docker 和 Docker Compose

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 添加用户到docker组
sudo usermod -aG docker $USER
newgrp docker

# 安装Docker Compose
sudo apt install docker-compose-plugin -y

# 验证安装
docker --version
docker compose version
```

### 2. 项目部署

#### 克隆项目

```bash
git clone <your-repo-url>
cd workplace-toolkit
```

#### 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量（重要！）
nano .env
```

**必须配置的环境变量：**

```bash
# AI API配置
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
ALIBABA_API_KEY=your_alibaba_api_key

# 服务端口（如果需要修改）
BACKEND_PORT=8000
FRONTEND_PORT=3000
REDIS_PORT=6379

# 生产环境安全配置
JWT_SECRET=your_super_secure_jwt_secret_here
NODE_ENV=production
```

### 3. 部署选项

#### 选项 A：开发模式部署（推荐用于测试）

```bash
# 启动开发环境
make dev

# 或者直接使用docker-compose
docker-compose up -d
```

#### 选项 B：生产模式部署（推荐用于正式环境）

```bash
# 构建生产镜像
make prod-build

# 启动生产环境
make prod

# 或者直接使用docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### 4. 网络配置

#### 防火墙设置

```bash
# 开放必要端口
sudo ufw allow 3000  # 前端
sudo ufw allow 8000  # 后端
sudo ufw enable
```

#### Nginx 反向代理（可选，推荐生产环境）

```bash
# 安装Nginx
sudo apt install nginx -y

# 创建配置文件
sudo nano /etc/nginx/sites-available/workplace-optimizer
```

**Nginx 配置示例：**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/workplace-optimizer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. 系统服务配置（可选）

#### 创建 systemd 服务

```bash
sudo nano /etc/systemd/system/workplace-optimizer.service
```

```ini
[Unit]
Description=Workplace Optimizer
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/workplace-toolkit
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# 启用服务
sudo systemctl enable workplace-optimizer.service
sudo systemctl start workplace-optimizer.service
```

### 6. 监控和维护

#### 查看服务状态

```bash
# 查看容器状态
docker ps

# 查看日志
make logs

# 实时查看日志
make logs-f

# 健康检查
make health
```

#### 备份和恢复

```bash
# 备份Redis数据
docker exec workplace-optimizer-redis-prod redis-cli BGSAVE

# 备份整个项目
tar -czf workplace-optimizer-backup-$(date +%Y%m%d).tar.gz .
```

### 7. 性能优化

#### 系统优化

```bash
# 增加文件描述符限制
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# 优化内核参数
echo "net.core.somaxconn = 65536" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 8. 故障排除

#### 常见问题

1. **端口冲突**：检查端口是否被占用

   ```bash
   sudo netstat -tlnp | grep :3000
   sudo netstat -tlnp | grep :8000
   ```

2. **权限问题**：确保 Docker 权限正确

   ```bash
   sudo chown -R $USER:$USER .
   ```

3. **内存不足**：检查系统资源

   ```bash
   free -h
   df -h
   ```

4. **API 密钥问题**：验证环境变量
   ```bash
   docker-compose exec backend printenv | grep API_KEY
   ```

### 9. 安全建议

1. **定期更新**：

   ```bash
   sudo apt update && sudo apt upgrade -y
   docker-compose pull
   ```

2. **SSL 证书**（生产环境）：

   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

3. **备份策略**：设置定期备份脚本

4. **监控**：考虑使用 Prometheus + Grafana 进行监控

### 10. 访问地址

部署完成后，可以通过以下地址访问：

- **前端**: http://your-server-ip:3000 或 http://your-domain.com
- **后端 API**: http://your-server-ip:8000/api 或 http://your-domain.com/api
- **健康检查**: http://your-server-ip:8000/health

---

## 🎯 快速部署命令总结

```bash
# 1. 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh

# 2. 克隆项目
git clone <repo-url> && cd workplace-toolkit

# 3. 配置环境
cp .env.example .env && nano .env

# 4. 启动服务
make prod-build && make prod

# 5. 检查状态
make health
```
