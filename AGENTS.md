# AGENTS.md - UtsPlugins 仓库

## 项目概述

UtsPlugins 是 uni-app UTS 插件的集中管理仓库，配合 [uts-plugin-cli](https://github.com/junerver/uts-plugin-cli) 工具使用。

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
├── scripts/                        # 自动化脚本
│   ├── generate-manifest.js       # 生成 plugins.json 清单
│   └── pre-commit.js              # pre-commit hook 逻辑
├── .husky/                         # Git hooks
│   └── pre-commit                 # 提交前自动执行
├── plugins.json                    # 插件清单（自动生成）
├── package.json                    # 项目配置
└── README.md                       # 项目文档
```

## 特殊文件和目录

### .uts-plugin.json（外部文件声明）

用于声明插件需要合并到项目中的外部配置文件。

**配置格式：**
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

**字段说明：**
- `source`: 相对于插件的 `_external` 目录
- `target`: 相对于项目根目录
- `strategy`: `merge`（合并）或 `overwrite`（覆盖）
- `arrayKeys`: 需要去重追加的数组键名，支持嵌套路径，为空时合并全部字段

### _external 目录（外部文件存储）

约定的外部文件存储目录，用于存放需要合并到项目中的配置文件片段。

**特点：**
- 不会收录到 `plugins.json` 的 `files` 列表中
- 只是为了方便仓库归档
- 多个插件可以操作同一个目标文件，各自存储自己的片段
- CLI 安装后会自动清理

## 开发规范

### 添加新插件

1. 在 `uni_modules/` 目录下创建新插件
2. 如果需要外部文件关联，创建 `.uts-plugin.json` 和 `_external/` 目录
3. 正常提交代码
4. pre-commit hook 会自动更新 `plugins.json`

### 提交规范

使用 Gitmoji 格式：

```
✨ [Plugin]: 新增功能
🐛 [Plugin]: 修复问题
📝 [Plugin]: 更新文档
🔖 [Plugin]: 版本发布
📦 [Plugin]: 提交剩余修改
```

### 版本管理

- 遵循 Semantic Versioning
- 每次发布必须更新 `package.json` 中的 `version`
- 同步更新 `readme.md` 和 `changelog.md`

## 自动化流程

- **pre-commit hook**: 检测 `uni_modules/` 目录变更，自动运行 `generate-manifest.js`
- **plugins.json**: 自动生成，包含插件名称、版本、描述、文件列表和外部文件配置

## 相关项目

- [uts-plugin-cli](https://github.com/junerver/uts-plugin-cli) - 插件管理工具
