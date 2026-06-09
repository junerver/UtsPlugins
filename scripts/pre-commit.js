#!/usr/bin/env node

/**
 * pre-commit hook
 * 检查 uni_modules 目录是否有变更，如果有则重新生成 plugins.json
 */

const { execSync } = require('child_process')
const path = require('path')

try {
  // 检查暂存区中是否有 uni_modules 相关的变更
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
  const hasUniModulesChanges = stagedFiles.split('\n').some(file => file.startsWith('uni_modules/'))

  if (hasUniModulesChanges) {
    console.log('📦 检测到 uni_modules 变更，正在更新 plugins.json...')

    // 运行生成脚本
    execSync('node scripts/generate-manifest.js', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    })

    // 将 plugins.json 添加到暂存区
    execSync('git add plugins.json', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    })

    console.log('✅ plugins.json 已更新并添加到暂存区')
  }
} catch (error) {
  console.error('❌ pre-commit hook 执行失败:', error.message)
  process.exit(1)
}