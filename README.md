# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## 🚀 快速上手 (Get Started)

### 1. 安装依赖 (Install Dependencies)

```bash
npm install
```

### 2. 登录 Expo (Login to Expo)

```bash
eas login
```

### 3. 本地运行 (Running Locally)

启动开发服务器:
```bash
npm start
```
然后，你可以根据终端提示在以下环境中打开应用:
- **在 Expo Go 应用中扫描二维码** (推荐用于真机测试)
- **按 `a`** 在 Android 模拟器或连接的设备上运行
- **按 `i`** 在 iOS 模拟器上运行

## 📂 项目结构 (Project Structure)

```
app/
├── components/    # 可复用的 UI 组件
├── context/       # React Context (例如: AuthContext)
├── hooks/         # 自定义 Hooks (例如: useAuth, usePushNotifications)
├── screens/       # 应用的主要页面/屏幕
├── services/      # 与外部 API 或服务交互的模块 (例如: Supabase)
└── types/         # TypeScript 类型定义
```

## 🔒 安全注意事项 (Security)

**重要提示:** `google-services.json` 文件包含敏感的 API 密钥和项目标识符。因此，它**不应该**被提交到版本控制系统 (如 Git)。

- 该文件已在 `.gitignore` 中被忽略。
- 新的开发者需要从 Firebase 控制台获取自己的 `google-services.json` 文件，并将其放置在项目根目录，或通过以下 EAS 命令进行安全配置。

## 🛠️ EAS CLI 工作流 (Workflow)

### 凭据管理 (Credentials)

配置或更新凭据 (例如 `google-services.json`):
```bash
# Android
eas credentials --platform android

# iOS
eas credentials --platform ios
```
> 这将启动一个交互式流程来引导你配置凭据。

### 构建 (Build)

启动构建:
```bash
# 为特定平台构建
eas build --profile production --platform android
eas build --profile production --platform ios

# 为所有平台构建
eas build --profile production --platform all
```

### 更新 (Update)

发布代码更新:
```bash
eas update --branch production --message "你的更新描述"
```

回滚更新:
```bash
eas update:rollback --branch production --update-id <update-id>
```
> **提示:** 使用 `eas update --list` 来获取 `update-id`。

### 提交 (Submit)

提交应用到应用商店:
```bash
eas submit --platform android
```
```bash
eas submit --platform ios
```
> **注意:** 提交前需要配置 `eas.json` 中的 `submit` 部分。

## ✅ 代码规范 (Linting)

运行 linter 来检查代码中的格式和风格问题:
```bash
npm run lint
```

## 📋 示例工作流 (Example Workflows)

### 开发与测试 (Development & Testing)

```bash
# 为开发环境构建应用
eas build --profile development --platform android
eas build --profile development --platform ios

# 向预览分支发布更新
eas update --branch preview
```

### 生产发布 (Production Release)

```bash
# 1. 配置凭据
eas credentials --platform android

# 2. 构建生产版本
eas build --profile production

# 3. 发布更新
eas update --branch production

# 4. 提交到应用商店
eas submit --platform android
```