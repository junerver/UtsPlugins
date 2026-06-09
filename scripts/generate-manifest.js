#!/usr/bin/env node

/**
 * 自动生成 plugins.json 清单文件
 * 扫描 uni_modules 目录下的所有插件，提取信息并生成清单
 */

const fs = require('fs')
const path = require('path')

const UNI_MODULES_DIR = path.join(__dirname, '..', 'uni_modules')
const OUTPUT_FILE = path.join(__dirname, '..', 'plugins.json')

/**
 * 递归获取目录下的所有文件（相对路径）
 * @param {string} dir - 目录路径
 * @param {string} prefix - 前缀（用于计算相对路径）
 * @returns {string[]} 文件路径列表
 */
function getFilesRecursive(dir, prefix = '') {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const relativePath = prefix ? `${prefix}/${item}` : item
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // 递归处理子目录
      files.push(...getFilesRecursive(fullPath, relativePath))
    } else if (stat.isFile()) {
      files.push(relativePath)
    }
  }

  return files
}

/**
 * 获取插件信息
 * @param {string} pluginDir - 插件目录路径
 * @returns {object} 插件信息
 */
function getPluginInfo(pluginDir) {
  const packageJsonPath = path.join(pluginDir, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    return null
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    return {
      description: packageJson.description || packageJson.displayName || '-',
      version: packageJson.version || '1.0.0'
    }
  } catch (error) {
    console.warn(`警告：无法解析 ${packageJsonPath}`)
    return null
  }
}

/**
 * 生成 plugins.json
 */
function generateManifest() {
  // 检查 uni_modules 目录是否存在
  if (!fs.existsSync(UNI_MODULES_DIR)) {
    console.error('错误：uni_modules 目录不存在')
    process.exit(1)
  }

  // 获取所有插件目录
  const pluginDirs = fs.readdirSync(UNI_MODULES_DIR).filter(item => {
    const itemPath = path.join(UNI_MODULES_DIR, item)
    return fs.statSync(itemPath).isDirectory()
  })

  // 生成清单
  const manifest = {
    _comment: '此文件由 scripts/generate-manifest.js 自动生成，请勿手动编辑',
    generated_at: new Date().toISOString(),
    plugins: {}
  }

  for (const pluginName of pluginDirs) {
    const pluginDir = path.join(UNI_MODULES_DIR, pluginName)
    const pluginInfo = getPluginInfo(pluginDir)
    const files = getFilesRecursive(pluginDir)

    manifest.plugins[pluginName] = {
      description: pluginInfo?.description || '-',
      version: pluginInfo?.version || '1.0.0',
      files: files
    }

    console.log(`✓ ${pluginName} (${files.length} files)`)
  }

  // 写入文件
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2) + '\n')

  console.log('')
  console.log(`✅ 已生成 plugins.json（${Object.keys(manifest.plugins).length} 个插件）`)
}

// 执行
generateManifest()