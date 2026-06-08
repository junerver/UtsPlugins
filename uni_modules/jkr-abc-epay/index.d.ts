/**
 * 农行e支付插件TypeScript声明
 */

interface ABCEPayResult {
  /** 支付结果信息 */
  message: string
  /** 订单号 */
  orderId: string | null
  /** 交易流水号 */
  transactionId: string | null
}

interface ABCEPayFail {
  /** 错误码 */
  errCode: number
  /** 错误信息 */
  errMsg: string
}

interface ABCEPayCallPayOptions {
  /** 支付链接地址 */
  url: string
  /** 是否是生产环境 */
  isRelease?: boolean
  /** 支付成功回调 */
  success?: (res: ABCEPayResult) => void
  /** 支付失败回调 */
  fail?: (res: ABCEPayFail) => void
  /** 完成回调（成功/失败都会调用） */
  complete?: (res: any) => void
}

interface ABCEPayStartBankABCOptions {
  /** 支付方式 */
  method: string
  /** 订单号 */
  token: string
  /** 是否是生产环境 */
  isRelease?: boolean
  /** 支付成功回调 */
  success?: (res: ABCEPayResult) => void
  /** 支付失败回调 */
  fail?: (res: ABCEPayFail) => void
  /** 完成回调（成功/失败都会调用） */
  complete?: (res: any) => void
}

interface ABCEPayApi {
  /**
   * 调起农行支付（含中间页面）
   * @param options 支付选项
   */
  callPay(options: ABCEPayCallPayOptions): void
  
  /**
   * 调起农行支付（不含中间页面）
   * @param options 支付选项
   */
  startBankABC(options: ABCEPayStartBankABCOptions): void
  
  /**
   * 检查农行APP是否已安装
   * @returns 是否已安装
   */
  checkInstall(): boolean
}

declare class Uni {
  /**
   * 调起农行支付（含中间页面）
   * @param options 支付选项
   * @example
   * ```ts
   * uni.abcEpay.callPay({
   *   url: 'http://example.com/pay?TOKEN=***   *   isRelease: false,
   *   success(res) {
   *     console.log('支付成功:', res.message)
   *   },
   *   fail(err) {
   *     console.error('支付失败:', err.errMsg)
   *   }
   * })
   * ```
   */
  abcEpay: ABCEPayApi
}