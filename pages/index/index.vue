<template>
	<view class="container">
		<!-- 顶部介绍 -->
		<view class="header">
			<text class="title">UTS 插件合集</text>
			<text class="subtitle">uniapp 工程的原生插件集合</text>
		</view>

		<!-- 插件列表 -->
		<view class="plugin-list">
			<view class="section-title">支付插件</view>
			<view class="plugin-card" @click="goToPlugin('jkr-abc-epay')">
				<view class="card-header">
					<view class="plugin-icon">
						<u-icon name="rmb-circle" size="48" color="#007AFF"></u-icon>
					</view>
					<view class="plugin-info">
						<text class="plugin-name">农行e支付</text>
						<text class="plugin-desc">农行掌银支付鸿蒙SDK封装</text>
					</view>
					<u-icon name="arrow-right" size="32" color="#999"></u-icon>
				</view>
				<view class="card-footer">
					<view class="tag">鸿蒙</view>
					<view class="tag">支付</view>
					<view class="tag">v1.0.3</view>
				</view>
			</view>
		</view>

		<!-- 更多插件提示 -->
		<view class="more-tip">
			<text class="tip-text">更多插件开发中...</text>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'

	const goToPlugin = (name) => {
		uni.navigateTo({
			url: `/pages/${name}/index`
		})
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 30rpx;
	}

	.header {
		text-align: center;
		padding: 40rpx 0;
		margin-bottom: 30rpx;

		.title {
			display: block;
			font-size: 44rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 16rpx;
		}

		.subtitle {
			display: block;
			font-size: 28rpx;
			color: #666;
		}
	}

	.section-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		padding-left: 10rpx;
	}

	.plugin-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

		.card-header {
			display: flex;
			align-items: center;
		}

		.plugin-icon {
			width: 80rpx;
			height: 80rpx;
			background: #f0f8ff;
			border-radius: 16rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 24rpx;
		}

		.plugin-info {
			flex: 1;

			.plugin-name {
				display: block;
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 8rpx;
			}

			.plugin-desc {
				display: block;
				font-size: 24rpx;
				color: #666;
			}
		}

		.card-footer {
			display: flex;
			margin-top: 20rpx;
			padding-top: 20rpx;
			border-top: 1rpx solid #f0f0f0;
		}

		.tag {
			padding: 8rpx 16rpx;
			background: #f0f8ff;
			color: #007AFF;
			font-size: 22rpx;
			border-radius: 8rpx;
			margin-right: 16rpx;
		}
	}

	.more-tip {
		text-align: center;
		padding: 40rpx 0;

		.tip-text {
			font-size: 26rpx;
			color: #999;
		}
	}
</style>