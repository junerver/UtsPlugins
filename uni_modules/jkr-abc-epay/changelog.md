# 更新日志

## [1.0.3] - 2026-06-05

### 优化
- 简化 `checkInstall` 方法返回值，直接返回 `boolean`
- 移除不必要的 `ABCEPayCheckInstallResult` 类型定义
- 理由：`bundleManager.canOpenLink` 只能判断是否可访问，无法获取版本信息

## [1.0.2] - 2026-06-05

### 修复
- 修复 ArkTS 类型错误，遵循 UTS 与 ArkTS 对象映射规范
  - 将 `undefined` 替换为 `null`（鸿蒙平台使用 `null` 表示空值）
  - 将可选属性改为 `type | null` 形式（如 `orderId: string | null`）
  - 确保所有类型定义符合 ArkTS 编译要求

## [1.0.1] - 2026-06-05

### 修复
- 修复 `module.json5` 配置错误，移除 `querySchemes` 配置
  - `querySchemes` 只允许在 `entry` 类型的模块中配置，不能在 `har` 模块中配置
  - 将 `querySchemes` 配置移到 `harmony-configs/entry/src/main/module.json5` 中

## [1.0.0] - 2026-06-05

### 新增
- 初始版本发布
- 支持农行掌银支付（含中间页面）- `callPay` 方法
- 支持农行掌银支付（不含中间页面）- `startBankABC` 方法
- 支持检查农行APP安装状态 - `checkInstall` 方法
- 完整的错误处理机制，包含6种错误码
- TypeScript类型声明支持
- 详细的使用文档和示例代码

### 实现细节
- `checkInstall` 方法使用鸿蒙原生API `bundleManager.canOpenLink` 实现
- 通过检查农行APP的URL scheme `bankabc://` 判断应用是否可访问
- 需要在应用的 `entry` 模块的 `module.json5` 中配置 `querySchemes: ["bankabc"]`

### 依赖
- ABCEPay.har 农行支付SDK
- 鸿蒙平台支持
- 鸿蒙原生API：`@kit.AbilityKit` 中的 `bundleManager`