# Deployment

## 1. 环境

至少区分：

```text
development
preview
production
```

每个环境使用独立配置和数据库。

## 2. 环境变量

`.env.example` 只保存变量名和说明，不保存真实 Secret。

应用构建时需要 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`。使用当前环境的 Supabase 项目，避免把本地 API 地址带进公开部署。部署端的 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 应仅授权需要的 API 和应用域名。服务端运营脚本所用的 `SUPABASE_SERVICE_ROLE_KEY` 应留在对应的运行环境中。

对托管的 Supabase 项目按顺序应用 `supabase/migrations/`。使用全新项目或现有项目时都应应用到最新版本。移除演示自动接受入口的迁移为 `20261121000000_remove_demo_invitation_auto_accept.sql`，公开部署由接收方本人接受邀请。使用迁移创建 schema，`supabase/snippets/` 中的开发账号和演示资料仅用于本地。

启用邮件认证时，在 Supabase Auth 中设置应用的 Site URL 和允许的确认链接回调。Google 登录需要单独配置 OAuth 提供方并允许应用的 `/auth/callback`。

建议分类：

```text
APP
DATABASE
AUTH
MAPS
NOTIFICATIONS
MONITORING
```

## 3. 部署前检查

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

配置测试后：

```bash
npm test
```

涉及数据库时还要检查：

- Migration 顺序
- 备份
- 旧数据兼容
- 回滚方式

## 4. 发布策略

大型功能优先使用 Feature Flag：

```text
开发者
→ 内部测试
→ 少量用户
→ 全部用户
```

## 5. 回滚

记录：

- Commit SHA
- 应用版本
- Migration 版本
- 环境变量变化
- 回滚步骤

## 6. Smoke Test

发布后至少验证：

- 首页可打开
- 登录入口可用
- API 健康检查正常
- 数据库连接正常
- 关键写操作没有重复提交

地点和官方活动来自江户川区 Open Data，部署后按导入文档导入所需目录。可先运行默认的 dry-run 检查数据，再对目标数据库启用写入。确认测试用户能完成登录、制定计划、邀请与接受，并用两个浏览器会话检查实时聊天。

- [公共地点导入](./open-data/edogawa-public-place-import.md)
- [官方活动导入](./open-data/edogawa-event-import.md)
