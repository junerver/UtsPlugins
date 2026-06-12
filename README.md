# UtsPlugins

uni-app UTS 插件合集，配合 [uts-plugin-cli](https://github.com/junerver/uts-plugin-cli) 工具使用。

## 简介

本仓库是 UTS 插件的集中管理仓库，提供原生插件供 uni-app 项目使用。通过 CLI 工具可以快速安装、更新、卸载插件。

```bash
# 列出可用插件
npx @junerver/uts-plugin-cli list

# 安装插件
npx @junerver/uts-plugin-cli install jkr-abc-epay
```

## 仓库结构

```
UtsPlugins/
├── uni_modules/                    # 插件目录
│   └── jkr-abc-epay/              # 农行e支付插件
│       ├── .uts-plugin.json       # 外部文件声明（可选）
│       ├── _external/             # 外部文件存储目录（可选）
│       │   └── module.json5       # 外部配置文件片段
│       ├── package.json           # 插件配置和版本信息
│       ├── readme.md              # 使用文档
│       ├── changelog.md           # 更新日志
│       └── utssdk/                # UTS 实现
│           ├── interface.uts      # 接口定义
│           ├── unierror.uts       # 错误处理
│           └── app-harmony/       # 鸿蒙平台实现
│               ├── index.uts      # 主要实现
│               ├── config.json    # 平台配置
│               └── libs/          # 原生 SDK
├── scripts/                        # 自动化脚本
│   ├── generate-manifest.js       # 生成 plugins.json 清单
│   └── pre-commit.js              # pre-commit hook 逻辑
├── .husky/                         # Git hooks
│   └── pre-commit                 # 提交前自动执行
├── plugins.json                    # 插件清单（自动生成）
├── package.json                    # 项目配置
└── README.md                       # 本文件
```

## 特殊文件说明

### .uts-plugin.json（外部文件声明）

某些插件需要修改项目根目录下的配置文件（如鸿蒙配置）。`.uts-plugin.json` 用于声明这些外部关联文件：

```json
{
  "externalFiles": [
    {
      "source": "module.json5",
      "target": "harmony-configs/entry/src/main/module.json5",
      "strategy": "merge",
      "description": "配置 querySchemes",
      "arrayKeys": ["module.querySchemes"]
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| `source` | 源文件路径（相对于插件的 `_external` 目录） |
| `target` | 目标文件路径（相对于项目根目录） |
| `strategy` | 处理策略：`merge`（合并）、`overwrite`（覆盖） |
| `description` | 文件描述（可选） |
| `arrayKeys` | 需要去重追加的数组键名，支持嵌套路径如 `module.querySchemes`。为空时合并全部字段 |

### _external 目录（外部文件存储）

`_external` 是约定的外部文件存储目录，用于存放需要合并到项目中的配置文件片段。

**特点：**
- 存储插件需要的外部配置文件
- **不会收录到 `plugins.json` 的 `files` 列表中**
- 只是为了方便仓库归档，每个插件只存储自己的配置片段
- 多个插件可以操作同一个目标文件，各自存储自己的片段
- **CLI 安装后会自动清理** `_external` 目录和 `.uts-plugin.json` 文件

**目录结构示例：**
```
uni_modules/jkr-abc-epay/
├── _external/
│   └── module.json5        # 只包含 querySchemes 配置片段
└── .uts-plugin.json        # 声明如何合并到项目
```

## 路径解析规则

| 字段 | 路径起点 | 示例 |
|------|----------|------|
| `files[].path` | 插件目录 | `utssdk/app-harmony/index.uts` |
| `externalFiles[].source` | 插件的 `_external` 目录 | `module.json5` |
| `externalFiles[].target` | 项目根目录 | `harmony-configs/entry/src/main/module.json5` |

## 插件清单

| 插件 | 版本 | 描述 | 平台 |
|------|------|------|------|
| [jkr-abc-epay](uni_modules/jkr-abc-epay) | 1.0.4 | 农行e支付鸿蒙SDK封装 | 鸿蒙 |

## 自动同步机制

本仓库配置了 **husky + pre-commit hook**，实现插件清单的自动同步。

### 工作原理

```
开发者修改插件代码
       ↓
git commit 触发 pre-commit hook
       ↓
检测 uni_modules/ 目录是否有变更
       ↓
自动运行 generate-manifest.js
       ↓
扫描所有插件目录，提取：
  - 插件名称（目录名）
  - 版本号（package.json）
  - 描述（package.json）
  - 文件列表（递归扫描）
       ↓
生成/更新 plugins.json
       ↓
将 plugins.json 添加到暂存区
       ↓
完成提交
```

### plugins.json 结构

```json
{
  "_comment": "此文件由 scripts/generate-manifest.js 自动生成，请勿手动编辑",
  "generated_at": "2026-06-09T06:06:59.972Z",
  "plugins": {
    "jkr-abc-epay": {
      "description": "农行e支付鸿蒙SDK封装，支持农行掌银支付功能",
      "version": "1.0.4",
      "files": [
        "package.json",
        "index.d.ts",
        "readme.md",
        "changelog.md",
        "utssdk/app-harmony/index.uts",
        "utssdk/interface.uts",
        "utssdk/unierror.uts"
      ]
    }
  }
}
```

### CLI 工具如何使用

[uts-plugin-cli](https://github.com/junerver/uts-plugin-cli) 通过以下流程工作：

1. **读取清单**：从 `raw.githubusercontent.com` 下载 `plugins.json`
2. **展示列表**：解析并显示可用插件、版本、描述
3. **精确下载**：根据文件列表，只下载指定插件的文件
4. **本地安装**：保存到用户项目的 `uni_modules/` 目录

```
┌─────────────────────────────────────────────────────────────┐
│                    UtsPlugins 仓库                          │
├─────────────────────────────────────────────────────────────┤
│  plugins.json ← 自动生成（包含版本、描述、文件列表）         │
│  uni_modules/ ← 插件源码                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    uts-plugin-cli                            │
├─────────────────────────────────────────────────────────────┤
│  1. 下载 plugins.json（从 raw.githubusercontent.com）        │
│  2. 展示插件列表（名称、版本、描述）                         │
│  3. 下载指定插件的文件                                       │
│  4. 安装到 uni_modules/                                      │
└─────────────────────────────────────────────────────────────┘
```

## 使用方法

### 安装插件

在 uni-app 项目根目录下执行：

```bash
# 安装指定插件
npx @junerver/uts-plugin-cli install jkr-abc-epay

# 或使用别名
npx @junerver/uts-plugin-cli i jkr-abc-epay
```

### 查看可用插件

```bash
npx @junerver/uts-plugin-cli list
```

输出示例：

```
可用插件列表：
仓库：junerver/UtsPlugins

  名称                    版本      描述
  ─────────────────────────────────────────────────────────
  jkr-abc-epay            1.0.4     农行e支付鸿蒙SDK封装，支持农行掌银支付功能
```

### 卸载插件

```bash
npx @junerver/uts-plugin-cli uninstall jkr-abc-epay
```

### 升级插件

```bash
npx @junerver/uts-plugin-cli update jkr-abc-epay
```

### 查看已安装插件

```bash
npx @junerver/uts-plugin-cli list --installed
```

## 网络代理

如果无法访问 GitHub，可设置 HTTP 代理：

### PowerShell

```powershell
$Env:HTTPS_PROXY="http://127.0.0.1:7890"
npx @junerver/uts-plugin-cli list
```

### CMD

```cmd
set HTTPS_PROXY=http://127.0.0.1:7890
npx @junerver/uts-plugin-cli list
```

### Linux/Mac

```bash
export HTTPS_PROXY=http://127.0.0.1:7890
npx @junerver/uts-plugin-cli list
```

## 添加新插件

### 1. 创建插件目录

```bash
mkdir -p uni_modules/my-plugin/utssdk/app-harmony
```

### 2. 创建必要文件

```bash
# package.json（必须包含 version 字段）
# readme.md（使用说明）
# changelog.md（版本记录）
# index.d.ts（TypeScript 声明）
# utssdk/interface.uts（接口定义）
# utssdk/app-harmony/index.uts（实现）
```

### 3. 提交代码

```bash
git add .
git commit -m "✨ [Plugin]: 添加 my-plugin 插件"
```

pre-commit hook 会自动更新 `plugins.json`。

### 4. 推送到远程

```bash
git push
```

推送后用户即可通过 CLI 安装新插件。

## 插件开发规范

### 版本管理

- 遵循 [Semantic Versioning](https://semver.org/)
- 每次发布必须更新 `package.json` 中的 `version`
- 同步更新 `readme.md` 和 `changelog.md`

### 文档要求

- **readme.md**：必须包含使用说明、API 文档、示例代码
- **changelog.md**：必须记录每个版本的变更
- **index.d.ts**：必须提供 TypeScript 类型声明

### 提交规范

使用 Gitmoji 格式：

```
✨ [Plugin]: 新增功能
🐛 [Plugin]: 修复问题
📝 [Plugin]: 更新文档
🔖 [Plugin]: 版本发布
```

## 相关项目

- [uts-plugin-cli](https://github.com/junerver/uts-plugin-cli) - 插件管理工具
- [UtsPlugins](https://github.com/junerver/UtsPlugins) - 本仓库

## License

MIT