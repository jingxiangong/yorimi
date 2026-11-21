# Testing

## 1. 测试层级

```text
Unit
Integration
E2E
```

## 2. Unit Tests

放在对应 Feature：

```text
src/features/fixed-schedules/tests/
src/features/recommendations/tests/
src/features/invitations/tests/
src/features/meetups/tests/
```

### FixedSchedule

- 创建合法计划
- 至少选择一个星期
- 暂停和恢复
- Soft Delete
- 只有 active 参与推荐

### Recommendation

- 活动不同不推荐
- 星期无重合不推荐
- 时间无重合不推荐
- 距离超出不推荐
- Block 后不推荐
- 满足条件时正确排序

### Invitation

- 正常发送
- 不能邀请自己
- 防止重复 pending
- 只有接收者可以接受
- 只有发送者可以撤回
- 非 pending 不可处理
- 过期后不可接受

### Meetup

- accepted Invitation 创建 Meetup
- 一个 Invitation 只创建一个 Meetup
- 取消后不删除
- 非法状态转换失败

## 3. Integration Tests

放在：

```text
tests/integration/
```

重点：

```text
Invitation accepted
→ Invitation 状态更新
→ Meetup 创建
→ 通知创建
```

```text
Block 用户
→ 推荐停止
→ 消息停止
→ 邀请停止
```

```text
Meetup cancelled
→ 双方读取相同状态
→ 双方收到通知
```

## 4. E2E Tests

放在：

```text
tests/e2e/
```

第一批 E2E：

- Onboarding
- 创建 FixedSchedule
- 查看推荐
- 打招呼并进入聊天
- 发送和接受 Invitation
- 查看 Meetup Detail
- 取消 Meetup
- 活动后反馈

## 5. Bug 修复

1. 写出稳定重现步骤
2. 添加回归测试
3. 确认修复前失败
4. 做最小修改
5. 确认修复后通过
6. 运行相关回归测试

禁止：

- 删除测试
- 跳过测试
- 使用 `any` 掩盖问题
- 关闭 TypeScript
- 关闭 Lint Rule
- Catch 后不处理

## 6. 最低检查

```bash
npm run typecheck
npm run lint
npm run build
```

配置测试工具后：

```bash
npm test
```

### 本地 Supabase 集成测试

`npm test` 会发现 `tests/` 下的所有 `*.test.mjs`。连接数据库的测试默认跳过。

1. 启动本地 Supabase，并运行 `npx supabase migration up --local`。
2. 从 `npx supabase status -o env` 获取本地值，将 `ANON_KEY`、`SERVICE_ROLE_KEY` 和 `JWT_SECRET` 分别写入被 Git 忽略的 `.env.local` 中的 `SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY` 和 `SUPABASE_JWT_SECRET`。填写 `NEXT_PUBLIC_SUPABASE_URL` 或 `SUPABASE_URL` 为本地 API 地址。
3. 运行 `npm run test:integration`。测试会串行执行并写入测试数据。使用按 README 初始化的可丢弃本地数据库，部分场景依赖默认种子账号。

集成测试会检查邀请、连接、事件、推荐以及 PostGIS 等数据库行为。构建完成后，可在浏览器从 `/welcome` 验证邮件登录，检查新用户进入 Onboarding，并确认接收方可以接受邀请。

### 浏览器验证

启动本地应用和 Supabase，设置本地 `SUPABASE_SERVICE_ROLE_KEY`，然后运行 `npm run test:browser`。脚本验证邮件密码登录、Onboarding、头像上传和首页跳转。它需要 Puppeteer 管理的 Chrome（`npx puppeteer browsers install chrome`），或用 `PUPPETEER_EXECUTABLE_PATH` 指定兼容的 Chromium。应用端口不为 3000 时，可用 `YORIMI_APP_URL` 指定本地地址。
