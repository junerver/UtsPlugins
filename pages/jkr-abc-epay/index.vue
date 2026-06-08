<template>
	<view class="container">
		<!-- 插件介绍 -->
		<view class="section">
			<view class="section-title">插件介绍</view>
			<view class="intro-card">
				<view class="intro-header">
					<u-icon name="rmb-circle" size="64" color="#007AFF"></u-icon>
					<view class="intro-info">
						<text class="intro-name">农行e支付</text>
						<text class="intro-version">v1.0.3</text>
					</view>
				</view>
				<text class="intro-desc">
					农行掌银支付鸿蒙SDK封装插件，支持农行掌银支付功能。
					通过封装 ABCEPay.har SDK，提供简洁的 API 供 uni-app 调用。
				</text>
				<view class="intro-tags">
					<view class="tag">鸿蒙</view>
					<view class="tag">支付</view>
					<view class="tag">农行</view>
				</view>
			</view>
		</view>

		<!-- 功能演示 -->
		<view class="section">
			<view class="section-title">功能演示</view>
			
			<!-- 检查安装状态 -->
			<view class="demo-card">
				<view class="demo-title">检查农行APP安装状态</view>
				<view class="demo-desc">使用 bundleManager.canOpenLink 检查</view>
				<u-button type="primary" text="检查安装状态" @click="checkAbcApp"></u-button>
				<view class="demo-result" v-if="installResult !== null">
					<u-icon :name="installResult ? 'checkmark-circle' : 'close-circle'" 
						:size="40" 
						:color="installResult ? '#07c160' : '#ee0a24'">
					</u-icon>
					<text :class="['result-text', installResult ? 'success' : 'error']">
						{{ installResult ? '农行APP已安装' : '农行APP未安装' }}
					</text>
				</view>
			</view>

			<!-- 调起支付（含中间页面） -->
			<view class="demo-card">
				<view class="demo-title">调起支付（含中间页面）</view>
				<view class="demo-desc">通过 URL 调起农行支付，会显示中间过渡页面</view>
				<view class="form-item">
					<text class="label">支付链接：</text>
					<u-input v-model="payUrl" placeholder="请输入支付链接" />
				</view>
				<view class="form-item">
					<text class="label">是否生产环境：</text>
					<u-switch v-model="isRelease"></u-switch>
				</view>
				<u-button type="success" text="调起支付" @click="handleCallPay"></u-button>
			</view>

			<!-- 调起支付（不含中间页面） -->
			<view class="demo-card">
				<view class="demo-title">调起支付（不含中间页面）</view>
				<view class="demo-desc">通过订单号直接调起农行支付</view>
				<view class="form-item">
					<text class="label">支付方式：</text>
					<u-input v-model="payMethod" placeholder="请输入支付方式" />
				</view>
				<view class="form-item">
					<text class="label">订单号：</text>
					<u-input v-model="payToken" placeholder="请输入订单号" />
				</view>
				<u-button type="success" text="调起支付" @click="handleStartBankABC"></u-button>
			</view>
		</view>

		<!-- 代码示例 -->
		<view class="section">
			<view class="section-title">代码示例</view>
			
			<view class="code-card">
				<view class="code-title">1. 检查安装状态</view>
				<view class="code-block">
					<text class="code-text">
// #ifdef APP-HARMONY
import { checkInstall } from "@/uni_modules/jkr-abc-epay"
// #endif

// 检查农行APP是否安装
const isInstalled = checkInstall()
					</text>
				</view>
			</view>

			<view class="code-card">
				<view class="code-title">2. 调起支付（含中间页面）</view>
				<view class="code-block">
					<text class="code-text">
// #ifdef APP-HARMONY
import { callPay } from "@/uni_modules/jkr-abc-epay"
// #endif

callPay({
  url: "http://example.com/pay?TOKEN=xxx",
  isRelease: false,
  success: (res) => {
    console.log("支付成功", res.message)
  },
  fail: (err) => {
    console.error("支付失败", err.errMsg)
  }
})
					</text>
				</view>
			</view>

			<view class="code-card">
				<view class="code-title">3. 调起支付（不含中间页面）</view>
				<view class="code-block">
					<text class="code-text">
// #ifdef APP-HARMONY
import { startBankABC } from "@/uni_modules/jkr-abc-epay"
// #endif

startBankABC({
  method: "pay",
  token: "1111111111111",
  isRelease: false,
  success: (res) => {
    console.log("支付成功", res.message)
  },
  fail: (err) => {
    console.error("支付失败", err.errMsg)
  }
})
					</text>
				</view>
			</view>
		</view>

		<!-- API 说明 -->
		<view class="section">
			<view class="section-title">API 说明</view>
			
			<view class="api-card">
				<view class="api-item">
					<text class="api-name">callPay(options)</text>
					<text class="api-desc">调起农行支付（含中间页面）</text>
					<view class="api-params">
						<view class="param">
							<text class="param-name">url</text>
							<text class="param-type">string</text>
							<text class="param-desc">支付链接地址</text>
						</view>
						<view class="param">
							<text class="param-name">isRelease</text>
							<text class="param-type">boolean</text>
							<text class="param-desc">是否生产环境</text>
						</view>
					</view>
				</view>

				<view class="api-item">
					<text class="api-name">startBankABC(options)</text>
					<text class="api-desc">调起农行支付（不含中间页面）</text>
					<view class="api-params">
						<view class="param">
							<text class="param-name">method</text>
							<text class="param-type">string</text>
							<text class="param-desc">支付方式</text>
						</view>
						<view class="param">
							<text class="param-name">token</text>
							<text class="param-type">string</text>
							<text class="param-desc">订单号</text>
						</view>
					</view>
				</view>

				<view class="api-item">
					<text class="api-name">checkInstall()</text>
					<text class="api-desc">检查农行APP是否已安装</text>
					<view class="api-params">
						<view class="param">
							<text class="param-name">返回值</text>
							<text class="param-type">boolean</text>
							<text class="param-desc">是否已安装</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 注意事项 -->
		<view class="section">
			<view class="section-title">注意事项</view>
			<view class="notice-card">
				<view class="notice-item">
					<u-icon name="info-circle" size="32" color="#ff9900"></u-icon>
					<text class="notice-text">此插件仅支持鸿蒙平台，使用时必须添加条件编译指令</text>
				</view>
				<view class="notice-item">
					<u-icon name="info-circle" size="32" color="#ff9900"></u-icon>
					<text class="notice-text">需要在 entry 模块的 module.json5 中配置 querySchemes: ["bankabc"]</text>
				</view>
				<view class="notice-item">
					<u-icon name="info-circle" size="32" color="#ff9900"></u-icon>
					<text class="notice-text">使用前需确保已将APP包名添加至农行掌银白名单</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	
	// #ifdef APP-HARMONY
	import { callPay, startBankABC, checkInstall } from "@/uni_modules/jkr-abc-epay"
	// #endif
	
	const installResult = ref(null)
	const payUrl = ref('http://10.230.132.250:8530/mpay/?TOKEN=xxx')
	const isRelease = ref(false)
	const payMethod = ref('pay')
	const payToken = ref('')
	
	// 检查农行APP安装状态
	const checkAbcApp = () => {
		// #ifdef APP-HARMONY
		installResult.value = checkInstall()
		uni.showToast({
			title: installResult.value ? '已安装' : '未安装',
			icon: 'none'
		})
		// #endif
		
		// #ifndef APP-HARMONY
		uni.showToast({
			title: '此功能仅支持鸿蒙平台',
			icon: 'none'
		})
		// #endif
	}
	
	// 调起支付（含中间页面）
	const handleCallPay = () => {
		// #ifdef APP-HARMONY
		if (!payUrl.value) {
			uni.showToast({ title: '请输入支付链接', icon: 'none' })
			return
		}
		callPay({
			url: payUrl.value,
			isRelease: isRelease.value,
			success: (res) => {
				console.log('支付成功', res)
				uni.showModal({
					title: '支付成功',
					content: res.message,
					showCancel: false
				})
			},
			fail: (err) => {
				console.error('支付失败', err)
				uni.showModal({
					title: '支付失败',
					content: err.errMsg,
					showCancel: false
				})
			}
		})
		// #endif
		
		// #ifndef APP-HARMONY
		uni.showToast({
			title: '此功能仅支持鸿蒙平台',
			icon: 'none'
		})
		// #endif
	}
	
	// 调起支付（不含中间页面）
	const handleStartBankABC = () => {
		// #ifdef APP-HARMONY
		if (!payMethod.value || !payToken.value) {
			uni.showToast({ title: '请填写完整信息', icon: 'none' })
			return
		}
		startBankABC({
			method: payMethod.value,
			token: payToken.value,
			isRelease: isRelease.value,
			success: (res) => {
				console.log('支付成功', res)
				uni.showModal({
					title: '支付成功',
					content: res.message,
					showCancel: false
				})
			},
			fail: (err) => {
				console.error('支付失败', err)
				uni.showModal({
					title: '支付失败',
					content: err.errMsg,
					showCancel: false
				})
			}
		})
		// #endif
		
		// #ifndef APP-HARMONY
		uni.showToast({
			title: '此功能仅支持鸿蒙平台',
			icon: 'none'
		})
		// #endif
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 30rpx;
		padding-bottom: 60rpx;
	}

	.section {
		margin-bottom: 40rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 24rpx;
		padding-left: 16rpx;
		border-left: 6rpx solid #007AFF;
	}

	.intro-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;

		.intro-header {
			display: flex;
			align-items: center;
			margin-bottom: 24rpx;
		}

		.intro-info {
			margin-left: 24rpx;

			.intro-name {
				display: block;
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
			}

			.intro-version {
				display: block;
				font-size: 24rpx;
				color: #007AFF;
				margin-top: 8rpx;
			}
		}

		.intro-desc {
			display: block;
			font-size: 28rpx;
			color: #666;
			line-height: 1.6;
			margin-bottom: 24rpx;
		}

		.intro-tags {
			display: flex;
		}

		.tag {
			padding: 8rpx 20rpx;
			background: #f0f8ff;
			color: #007AFF;
			font-size: 24rpx;
			border-radius: 8rpx;
			margin-right: 16rpx;
		}
	}

	.demo-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;

		.demo-title {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 12rpx;
		}

		.demo-desc {
			font-size: 24rpx;
			color: #666;
			margin-bottom: 24rpx;
		}

		.form-item {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;

			.label {
				width: 180rpx;
				font-size: 28rpx;
				color: #333;
			}
		}

		.demo-result {
			display: flex;
			align-items: center;
			margin-top: 24rpx;
			padding-top: 24rpx;
			border-top: 1rpx solid #f0f0f0;

			.result-text {
				margin-left: 16rpx;
				font-size: 28rpx;

				&.success {
					color: #07c160;
				}

				&.error {
					color: #ee0a24;
				}
			}
		}
	}

	.code-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;

		.code-title {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 16rpx;
		}

		.code-block {
			background: #1e1e1e;
			border-radius: 12rpx;
			padding: 24rpx;
			overflow-x: auto;

			.code-text {
				font-family: 'Courier New', monospace;
				font-size: 24rpx;
				color: #d4d4d4;
				line-height: 1.6;
				white-space: pre;
			}
		}
	}

	.api-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;

		.api-item {
			padding: 24rpx 0;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}
		}

		.api-name {
			display: block;
			font-size: 30rpx;
			font-weight: bold;
			color: #007AFF;
			margin-bottom: 8rpx;
		}

		.api-desc {
			display: block;
			font-size: 26rpx;
			color: #666;
			margin-bottom: 16rpx;
		}

		.api-params {
			padding-left: 20rpx;
		}

		.param {
			display: flex;
			margin-bottom: 12rpx;

			.param-name {
				width: 160rpx;
				font-size: 26rpx;
				color: #333;
				font-weight: bold;
			}

			.param-type {
				width: 120rpx;
				font-size: 24rpx;
				color: #007AFF;
			}

			.param-desc {
				flex: 1;
				font-size: 24rpx;
				color: #666;
			}
		}
	}

	.notice-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;

		.notice-item {
			display: flex;
			align-items: flex-start;
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 0;
			}
		}

		.notice-text {
			margin-left: 16rpx;
			font-size: 26rpx;
			color: #666;
			line-height: 1.5;
		}
	}
</style>