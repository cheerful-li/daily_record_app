# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个个人管理网站，旨在提供微习惯培养、事件记录、任务管理等功能，帮助用户建立良好的生活习惯，提高工作效率，促进个人成长。

## 技术栈

- **运行时环境**：Bun
- **包管理器**：pnpm
- **构建工具**：Vite
- **前端框架**：React
- **语言**：TypeScript
- **UI组件**：shadcn/ui
- **状态管理**：MobX
- **数据存储**：IndexedDB + 云存储同步

## 常用命令

- 启动开发环境: `bun run dev`
- 构建项目: `bun run build`
- 代码检查: `bun run lint`
- 类型检查: `bun run typecheck`
- 预览构建: `bun run preview`

## 项目架构

### 模块化结构

1. **核心模块**:
   - **微习惯打卡模块**: 习惯管理与打卡记录 (`src/components/modules/habits`)
   - **生活点滴模块**: 个人事件记录与回顾 (`src/components/modules/lifeMoments`)
   - **任务管理模块**: 工作和成长任务 (`src/components/modules/tasks`)
   - **关系维护模块**: 社交关系管理 (`src/components/modules/relationships`)
   - **灵感收集模块**: 灵感与想法记录 (`src/components/modules/ideas`)
   - **统计分析模块**: 数据可视化 (`src/components/modules/Statistics`)

2. **布局系统**:
   - 采用响应式布局，支持移动端和桌面端
   - 桌面端使用侧边栏导航，移动端使用底部导航栏
   - 主要布局组件位于 `src/components/layout`

### 数据层架构

1. **数据模型**:
   - 微习惯表(Habits)、打卡记录表(CheckIns)
   - 生活点滴表(LifeMoments)
   - 待办事项表(Tasks)
   - 灵感想法表(Ideas)
   - 社交关系表(Relationships)

2. **状态管理**:
   - 使用MobX进行状态管理
   - 每个模块有专属Store (`src/stores/`)
   - 通过Context API提供状态 (`src/stores/StoreContext.tsx`)

3. **数据持久化**:
   - 本地存储使用IndexedDB (`src/services/database.ts`)
   - 增强版数据服务支持自动云同步 (`src/services/enhancedDatabase.ts`)
   - 云同步逻辑 (`src/services/cloudSync.ts`)

4. **认证机制**:
   - 基于MD5哈希的密码验证 (`src/utils/auth.ts`)
   - 使用localStorage存储认证令牌

### 路由系统

- 使用React Router(Hash Router)实现
- 主路由定义在 `src/Routes.tsx`
- 主应用布局在 `/app` 路径下，子模块作为嵌套路由

## 开发规范

1. **TypeScript**:
   - 使用严格的类型定义，避免使用any
   - 使用接口定义数据模型和组件props
   - TypeScript配置启用了verbatimModuleSyntax，导入路径需注意格式

2. **React组件**:
   - 使用函数式组件和React Hooks
   - 组件文件名使用PascalCase
   - 组件内部逻辑和UI展示分离

3. **样式处理**:
   - 使用Tailwind CSS进行样式管理
   - 使用shadcn/ui组件库作为UI基础
   - 使用class-variance-authority处理条件样式
   - 不直接修改src/index.css，模块样式应在各自文件中定义

4. **性能优化**:
   - 使用useMemo和useCallback避免不必要的重渲染
   - 响应式设计优先考虑移动端体验
   - 延迟加载非关键资源

## 开发注意事项

1. **移动端优先**:
   - 本应用主要在手机上使用，确保移动端体验优秀
   - 使用媒体查询和响应式设计支持不同设备

2. **添加UI组件**:
   ```bash
   npx shadcn@latest add <component-name>
   ```
   不要自己创建shadcn组件文件

3. **数据同步**:
   - 应用启动时会从云端拉取最新数据
   - 数据修改时会自动同步到云端
   - 使用enhancedDatabase.ts中的方法而非直接使用database.ts

4. **认证流程**:
   - 首次加载应用时需要密码验证
   - 验证通过后生成令牌用于API认证
   - 令牌存储在localStorage中

5. **调试**:
   - Vite已在其他命令行运行，测试时不要再运行
   - Windows环境下执行命令注意格式
   - 使用浏览器开发工具检查移动端适配
   - 你完成任务后记得要使用 npm run typecheck 检查类型错误