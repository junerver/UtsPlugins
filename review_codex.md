# UtsPlugins 代码审查报告

审查日期：2026-06-08

审查范围：

- `uni_modules/jkr-abc-epay/` 下插件元信息、声明文件、UTS 接口、鸿蒙实现、HAR 依赖配置、文档与更新日志
- `pages/` 下示例页面
- `pages.json`、`manifest.json`、`harmony-configs/entry/src/main/module.json5`、`main.js`、`App.vue`、`package.json` 等项目配置

总体结论：

- 项目结构整体符合 uni-app/uni_modules 的基本组织方式：插件代码放在 `uni_modules/jkr-abc-epay/utssdk/app-harmony/`，鸿蒙 entry 级配置单独放在 `harmony-configs/entry/`，示例页面集中在 `pages/`。
- 当前主要风险集中在 **UTS/TypeScript 声明与实际导出不一致**、**鸿蒙 SDK Promise 异常未处理**、**接口类型与文档不一致**。这些问题会影响插件编译、类型提示、调用可靠性和后续发布质量。
- 页面代码可作为演示使用，但存在硬编码测试地址、逻辑重复、类型缺失和可维护性不足等问题。

## 严重问题

### 1. UTS/TypeScript 接口声明与实际导出不一致，可能导致调用方类型不可用或编译失败

涉及文件：

- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:24`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:72`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:136`
- `uni_modules/jkr-abc-epay/index.d.ts:49`
- `uni_modules/jkr-abc-epay/index.d.ts:69`
- `uni_modules/jkr-abc-epay/utssdk/interface.uts:108`
- `pages/jkr-abc-epay/index.vue:219`
- `uni_modules/jkr-abc-epay/readme.md:56`

问题说明：

- 鸿蒙实现实际导出的是三个命名函数：`callPay`、`startBankABC`、`checkInstall`。
- 示例页面和 README 也使用命名导入：`import { callPay, startBankABC, checkInstall } from "@/uni_modules/jkr-abc-epay"`。
- 但 `index.d.ts` 没有声明任何命名导出，只声明了 `ABCEPayApi` 接口和 `declare class Uni { abcEpay: ABCEPayApi }`。
- `package.json` 中又通过 `uni_modules.uni-ext-api.uni` 声明了 `uni.abcEpay`，这与文档和页面中的“命名导入”使用方式没有统一。
- `interface.uts:108` 的 `export default ABCEPayApi` 也存在风险：`ABCEPayApi` 是接口类型，不是运行时值；在 TypeScript/ArkTS 语义下，直接默认导出一个纯类型标识符通常会触发“类型被当作值使用”的问题。

影响：

- 使用 TypeScript 的调用方可能无法获得 `callPay`、`startBankABC`、`checkInstall` 的正确类型提示。
- 如果构建链严格校验声明文件或 UTS 类型导出，可能出现编译错误。
- 插件对外 API 形态不清晰：到底推荐 `uni.abcEpay.callPay()`，还是推荐 `import { callPay } ...`，目前两套写法混在一起。

建议：

- 明确插件唯一推荐 API 形态。建议优先选择一种：
  - 方案 A：保留命名导出，补齐 `index.d.ts` 中的 `export function callPay(...)`、`export function startBankABC(...)`、`export function checkInstall(): boolean`。
  - 方案 B：改为标准 `uni.abcEpay` 扩展 API，并调整 README、页面和声明文件，统一使用 `uni.abcEpay.callPay(...)`。
- 删除或修正 `interface.uts:108` 的默认导出，避免把接口类型当成运行时默认值导出。
- 如果继续保留 `ABCEPayApi` 类型，可只做类型导出，不做运行时默认导出。
- 页面示例、README、`index.d.ts`、`package.json` 的 API 形态必须完全一致。

### 2. SDK 方法返回 Promise，但当前实现未 await 或 catch，异步失败不会进入 fail/complete

涉及文件：

- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:25`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:38`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:61`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:96`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:120`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/libs/ABCEPay.har`

问题说明：

- 从 HAR 包声明看，`ABCEPayApi.callPay(...)` 和 `ABCEPayApi.startBankABC(...)` 的返回值均为 `Promise<void>`。
- 当前 `callPay` 和 `startBankABC` 使用同步 `try/catch` 包裹 SDK 调用，但没有 `await`、没有 `.catch()`，也没有返回 Promise。
- 同步 `try/catch` 只能捕获立即抛出的同步异常，无法捕获 Promise reject。

影响：

- SDK 如果通过 Promise reject 表达失败，当前插件不会触发 `fail` 回调。
- `complete` 也不会触发，调用方会卡在“支付中”或缺失收尾逻辑。
- 可能产生未处理的 Promise rejection，影响运行稳定性。

建议：

- 将内部 SDK 调用改为显式处理 Promise：
  - 使用 `ABCEPayApi.callPay(...).catch((e) => { ... })`。
  - 或将导出函数设计为 `async`，并用 `await` 捕获异常。
- 保持外部 API 是否返回 `void` 的约定不变也可以，但内部必须处理 Promise reject。
- 异步 catch 中应复用统一的失败回调逻辑，保证 `fail` 与 `complete` 一定成对触发。

### 3. `isRelease` 类型定义、文档和实现不一致

涉及文件：

- `uni_modules/jkr-abc-epay/utssdk/interface.uts:35`
- `uni_modules/jkr-abc-epay/utssdk/interface.uts:53`
- `uni_modules/jkr-abc-epay/index.d.ts:25`
- `uni_modules/jkr-abc-epay/index.d.ts:40`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:40`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:99`
- `uni_modules/jkr-abc-epay/readme.md:139`
- `uni_modules/jkr-abc-epay/readme.md:154`

问题说明：

- UTS 接口中 `isRelease` 被声明为必填 `boolean`。
- TypeScript 声明文件和 README 中 `isRelease` 被声明为可选。
- 实现中又使用了 `options.isRelease ?? false`，说明实现层实际支持缺省。

影响：

- UTS/ArkTS 调用方会认为 `isRelease` 必填，和文档不符。
- TypeScript 调用方会认为可选，但底层接口文件又表达为必填，长期维护容易引入兼容问题。
- 插件的 API 契约不稳定，影响第三方集成。

建议：

- 统一为“可选，默认 `false`”，并让 UTS 类型、`.d.ts`、README、页面示例保持一致。
- 如果鸿蒙 ArkTS 对可选字段映射有更严格要求，可统一采用插件规范中推荐的空值写法，并在实现中显式归一化默认值。
- 为两个支付方法补充参数默认值说明，并在文档中明确测试环境/生产环境行为差异。

## 中等问题

### 4. `complete` 回调与 `fail` 回调返回对象不一致，且会丢失具体错误信息

涉及文件：

- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:29`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:33`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:44`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:48`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:77`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:81`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:103`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:107`

问题说明：

- 失败时传给 `fail` 的是普通对象 `{ errCode, errMsg }`。
- 传给 `complete` 的却是 `ABCEPayFailImpl` 实例。
- 部分分支中 `fail` 使用了更具体的错误信息，例如“支付方式不能为空”“订单号不能为空”或 SDK 返回的错误字符串，但 `complete(error)` 中仍是通用错误文案“参数错误”或“支付失败”。

影响：

- 调用方如果只监听 `complete`，拿到的错误信息可能不准确。
- `fail` 和 `complete` 的数据结构不一致，增加调用方适配成本。
- 违反 uni API 常见约定：`complete` 通常应收到与 `success` 或 `fail` 一致的结果对象。

建议：

- 生成一次失败结果对象，例如 `const failResult: ABCEPayFail = { errCode, errMsg }`。
- 同一个对象同时传给 `fail` 和 `complete`。
- 将 `complete` 类型从 `any` 改为 `ABCEPayResult | ABCEPayFail`，减少调用方不确定性。

### 5. 成功结果字段始终为 `null`，接口暴露的信息与实际能力不匹配

涉及文件：

- `uni_modules/jkr-abc-epay/utssdk/interface.uts:13`
- `uni_modules/jkr-abc-epay/utssdk/interface.uts:15`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:52`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:54`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:55`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:111`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:113`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:114`

问题说明：

- `ABCEPayResult` 暴露了 `orderId` 和 `transactionId`。
- 实现中两个字段始终返回 `null`。
- 如果 SDK 的成功字符串 `suc` 内包含结构化信息，当前实现没有解析。
- 如果 SDK 本身不提供这些字段，接口中暴露它们会给调用方造成误解。

影响：

- 调用方可能误以为可以从成功回调中获取订单号或交易流水号。
- 支付结果确认通常应该以后端回调/查单为准，前端暴露空字段容易引发错误使用。

建议：

- 如果 SDK 成功回调有明确格式，应解析并填充字段。
- 如果没有明确格式，应简化结果类型，只保留 `message` 和原始返回值，例如 `rawResult`。
- 在 README 中强调：支付最终状态应以服务端通知或查单结果为准，前端回调仅表示调起流程返回。

### 6. `checkInstall` 只检查 URL Scheme，可用性判断可能不够准确

涉及文件：

- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:15`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:136`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:138`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:139`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/libs/ABCEPay.har`

问题说明：

- 当前实现使用 `bundleManager.canOpenLink('bankabc://')` 判断是否可打开 scheme。
- HAR 包中实际存在 `ABCEPayApi.isABCEPayAvailable(...)` 方法，可能是 SDK 官方提供的可用性判断。
- `canOpenLink` 只能判断链接是否可被打开，无法判断 SDK 所需版本、白名单、参数能力或支付入口可用性。
- `console.log('检查农行APP安装状态：:', canOpen)` 存在多余冒号，也不建议在插件核心能力中保留默认日志。

影响：

- 某些设备上 scheme 可打开但支付能力不可用，仍会返回 `true`。
- 插件 API 名称是 `checkInstall`，但实际语义更接近 `canOpenBankAbcScheme`。

建议：

- 优先确认农行 SDK 官方推荐的可用性检查方式。
- 如果 `ABCEPayApi.isABCEPayAvailable(...)` 是官方方法，建议使用它或将它与 `bundleManager.canOpenLink` 组合判断。
- 将异常信息通过可选调试开关或错误码暴露，避免只返回 `false` 导致定位困难。
- 删除默认 `console.log`，或改为仅开发环境输出。

### 7. 插件权限声明与实际项目配置不完全一致

涉及文件：

- `uni_modules/jkr-abc-epay/package.json:32`
- `uni_modules/jkr-abc-epay/package.json:35`
- `harmony-configs/entry/src/main/module.json5:37`
- `harmony-configs/entry/src/main/module.json5:42`
- `uni_modules/jkr-abc-epay/readme.md:25`
- `uni_modules/jkr-abc-epay/readme.md:171`

问题说明：

- 插件元信息中 `dcloudext.declaration.permissions` 写的是“无”。
- 项目鸿蒙 entry 配置中实际申请了 `ohos.permission.INTERNET`。
- 插件还依赖 `querySchemes: ["bankabc"]` 才能执行 `canOpenLink`。
- README 有说明 `querySchemes`，但插件元信息没有体现这些前置配置。

影响：

- 插件发布或被其他项目复用时，使用者可能误以为无需任何权限或宿主配置。
- 宿主项目如果漏配 `querySchemes`，`checkInstall` 可能始终失败或抛异常。
- 支付类插件对权限和外部跳转能力说明应更严格，否则容易影响上架审核与合规说明。

建议：

- 在插件 `package.json` 的声明中明确说明依赖宿主配置：
  - Harmony entry 需要 `querySchemes: ["bankabc"]`。
  - 如 SDK 或支付页面需要联网，应明确说明 `ohos.permission.INTERNET`。
- README 中区分“插件目录内配置”和“宿主项目必须手动配置”，避免“插件已配置”这类容易误解的表述。
- 增加运行前自检说明：漏配 `querySchemes` 时如何排查。

### 8. `manifest.json` 保留大量 Android 权限，与当前鸿蒙插件合集定位不匹配

涉及文件：

- `manifest.json:23`
- `manifest.json:25`
- `manifest.json:29`
- `manifest.json:33`
- `manifest.json:35`
- `manifest.json:40`
- `uni_modules/jkr-abc-epay/package.json:67`
- `uni_modules/jkr-abc-epay/package.json:68`
- `uni_modules/jkr-abc-epay/package.json:69`

问题说明：

- 插件元信息声明仅支持 Harmony，不支持 Android/iOS。
- 但根项目的 `manifest.json` 保留了较多 Android 权限，例如 `READ_LOGS`、`CAMERA`、`READ_PHONE_STATE`、`WRITE_SETTINGS` 等。
- 这些权限与当前农行 e 支付鸿蒙示例没有直接关系。

影响：

- 如果项目未来被误用于 Android 打包，会带来不必要的权限申请和隐私合规风险。
- 示例工程作为插件合集模板时，过多默认权限会误导使用者。

建议：

- 删除与当前演示无关的 Android 权限，只保留实际需要的权限。
- 如果项目明确只面向 Harmony，可在 README 或项目说明中注明 Android/iOS 配置未维护。
- 保持插件元信息、示例工程配置和实际支持平台一致。

### 9. 页面演示中存在硬编码测试支付地址和弱校验

涉及文件：

- `pages/jkr-abc-epay/index.vue:223`
- `pages/jkr-abc-epay/index.vue:249`
- `pages/jkr-abc-epay/index.vue:253`
- `pages/jkr-abc-epay/index.vue:286`
- `pages/jkr-abc-epay/index.vue:290`

问题说明：

- 页面默认支付链接为内网 HTTP 地址 `http://10.230.132.250:8530/mpay/?TOKEN=xxx`。
- `handleCallPay` 只判断 `!payUrl.value`，没有 `trim()` 和基本 URL 格式校验。
- `handleStartBankABC` 只判断是否为空，没有去除空白字符。
- 调起支付前没有复用 `checkInstall()` 进行前置确认。

影响：

- 内网测试地址容易被误提交、误发布或误用于外部演示。
- 用户输入空格也可能通过页面校验，直到插件层才失败。
- 未安装农行 APP 时仍可直接点击支付，用户体验较差。

建议：

- 将默认支付链接改为空值或明显的占位符，不内置真实/内网地址。
- 页面层也使用 `trim()` 和基础格式校验。
- 支付前先检查安装状态，并给出安装/打开农行 APP 的明确提示。
- 示例页面中加入“测试环境请填写商户服务端返回的真实支付链接/Token”的说明。

### 10. 页面代码维护成本偏高，展示内容与插件元信息重复

涉及文件：

- `pages/index/index.vue:12`
- `pages/index/index.vue:18`
- `pages/index/index.vue:26`
- `pages/jkr-abc-epay/index.vue:10`
- `pages/jkr-abc-epay/index.vue:11`
- `pages/jkr-abc-epay/index.vue:81`
- `pages/jkr-abc-epay/index.vue:145`
- `uni_modules/jkr-abc-epay/package.json:4`

问题说明：

- 插件名称、版本号、描述、标签在首页、插件详情页和插件 `package.json` 中重复维护。
- 详情页模板很长，混合了介绍、表单、代码示例、API 文档和注意事项。
- 目前页面使用普通 `<script setup>`，没有开启 TypeScript 类型约束。

影响：

- 插件版本升级时容易漏改页面中的硬编码版本。
- 后续增加更多插件时，首页会继续堆叠硬编码卡片，维护成本增加。
- 支付回调参数没有页面层类型约束，IDE 不能帮助发现字段错误。

建议：

- 抽取插件列表配置，例如 `plugins.ts` 或 JSON 配置，由首页和详情页复用。
- 将代码示例、API 说明、注意事项拆成数据驱动渲染，减少模板长度。
- 页面脚本改为 `<script setup lang="ts">`，并复用插件导出的类型。
- 支付演示逻辑可抽成 composable，例如 `useAbcEpayDemo()`。

## 低优先级问题

### 11. README 和 `index.d.ts` 中部分代码示例字符串格式损坏

涉及文件：

- `uni_modules/jkr-abc-epay/index.d.ts:75`
- `uni_modules/jkr-abc-epay/index.d.ts:76`
- `uni_modules/jkr-abc-epay/readme.md:62`
- `uni_modules/jkr-abc-epay/readme.md:63`

问题说明：

- `index.d.ts` 示例中 `url` 字符串没有正常闭合，`isRelease` 被拼进了同一行注释/字符串附近。
- README 中 `callPay` 示例也存在同类格式问题。

影响：

- 使用者复制示例代码会直接报错。
- 文档可信度下降。

建议：

- 修复示例代码格式，确保所有代码块可直接复制运行。
- 建议将 README 中示例代码与页面示例保持一致，并定期人工复制验证。

### 12. 存在未使用导入和调试输出，影响代码整洁度

涉及文件：

- `pages/index/index.vue:39`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:10`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:19`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:62`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/index.uts:121`
- `App.vue:4`
- `App.vue:7`
- `App.vue:10`

问题说明：

- 首页导入了 `ref`，但没有使用。
- 鸿蒙实现导入了 `ABCEPayFail` 和 `BusinessError`，但没有使用。
- `App.vue` 中保留了生命周期调试日志。
- 插件核心实现中也有默认日志输出。

影响：

- 在严格 lint 或 ArkTS 静态检查配置下，未使用导入可能导致告警甚至阻断。
- 支付插件默认输出日志不利于生产环境排查和隐私控制。

建议：

- 删除未使用导入。
- 将日志封装为可控调试开关，或仅在开发环境输出。
- 示例工程可以保留少量日志，但插件核心代码应尽量保持安静。

### 13. `uni.scss` 中主题变量重复定义

涉及文件：

- `uni.scss:10`
- `uni.scss:12`

问题说明：

- `$u-tips-color` 被定义了两次，第二次会覆盖第一次。

影响：

- 当前影响较小，但容易让维护者误判实际生效颜色。

建议：

- 保留一次最终值，删除重复定义。
- 如果需要区分浅提示色和普通提示色，使用不同变量名。

### 14. 插件元信息不完整，不利于发布和复用

涉及文件：

- `uni_modules/jkr-abc-epay/package.json:13`
- `uni_modules/jkr-abc-epay/package.json:29`
- `uni_modules/jkr-abc-epay/package.json:37`
- `uni_modules/jkr-abc-epay/utssdk/app-harmony/libs/ABCEPay.har`

问题说明：

- `repository`、`contact.qq`、`npmurl` 为空。
- HAR 是二进制依赖，当前文档没有说明来源、版本、授权、校验方式和更新流程。

影响：

- 插件发布到市场或被其他团队复用时，维护责任和依赖来源不清晰。
- 支付 SDK 属于关键第三方依赖，缺少版本来源说明会增加合规和排障成本。

建议：

- 补充仓库地址、维护者联系方式或内部维护渠道。
- 在 README 中加入 `ABCEPay.har` 的来源、官方版本号、获取方式、更新流程和校验信息。
- 如果 SDK 有授权限制，应在文档中明确说明使用者需要自行获得农行授权。

### 15. 缺少基础校验脚本和质量门禁

涉及文件：

- `package.json:1`
- `package.json:6`

问题说明：

- 根项目 `package.json` 只有依赖，没有 `scripts`。
- 当前没有格式化、lint、类型检查或构建校验入口。

影响：

- 后续增加更多插件后，难以及时发现声明文件损坏、未使用导入、示例代码错误等问题。
- 代码审查和发布主要依赖人工检查。

建议：

- 增加基础脚本，例如 `lint`、`format`、`typecheck` 或 HBuilderX/uni CLI 可执行的构建校验命令。
- 至少为文档示例和声明文件加入人工发布检查清单。
- 如果团队暂不引入自动化工具，也建议在 README 中写明本插件的手工验证流程。

### 16. 文档表述容易混淆“插件配置”和“宿主项目配置”

涉及文件：

- `uni_modules/jkr-abc-epay/readme.md:25`
- `uni_modules/jkr-abc-epay/readme.md:31`
- `uni_modules/jkr-abc-epay/readme.md:46`
- `uni_modules/jkr-abc-epay/readme.md:216`

问题说明：

- README 多处写“插件已在 `harmony-configs/entry/src/main/module.json5` 中配置了 `querySchemes`”。
- 实际上 `harmony-configs/entry/...` 是宿主示例项目的配置，不属于插件 `uni_modules/jkr-abc-epay` 内部配置。

影响：

- 使用者复制插件目录到其他项目时，可能误以为 `querySchemes` 会自动生效。
- 插件市场发布时，也可能产生“安装后即可用”的误解。

建议：

- 将描述改为“本示例项目已配置；其他宿主项目必须手动在 entry 模块配置”。
- 在 README 前置条件中单独列出“宿主项目配置清单”。
- 给出漏配时的典型现象和排查步骤。

## 项目结构评价

优点：

- `uni_modules/jkr-abc-epay/` 目录结构清晰，包含 `package.json`、`readme.md`、`changelog.md`、`index.d.ts` 和 `utssdk/`。
- 鸿蒙平台实现位于 `utssdk/app-harmony/`，平台边界明确。
- `app-harmony/config.json` 将 `@abc/abcepay` 指向本地 HAR，依赖路径直观。
- `harmony-configs/entry/src/main/module.json5` 单独承载 entry 级 `querySchemes`，没有错误放入 HAR 模块配置，这一点是合理的。

改进点：

- 建议把“示例工程配置”和“插件本体配置”在文档和目录说明中明确区分。
- 如果插件合集会持续扩展，建议为插件列表建立统一元数据文件，避免首页、详情页和插件 `package.json` 多处手动同步。
- 现有 `CODE_REVIEW.md`、`review_output.md` 与本次 `review_codex.md` 都是审查产物，建议后续统一归档到 `docs/reviews/` 或删除过期报告，避免根目录噪音。

## UTS 插件接口设计评价

优点：

- API 粒度清晰，覆盖 `callPay`、`startBankABC`、`checkInstall` 三个核心能力。
- 支持 `success`、`fail`、`complete` 回调，符合 uni API 用户习惯。
- 定义了错误码和错误对象，具备统一错误处理的雏形。

主要不足：

- 对外导出方式不统一：命名导出、`uni.abcEpay` 扩展和接口默认导出同时存在，容易混淆。
- 失败结果对象不统一，`complete` 的入参类型过宽。
- 错误码定义较粗，无法区分用户取消、未安装、SDK reject、scheme 不可打开等不同原因。
- 对支付结果字段的承诺偏多，但实现并未填充订单号和流水号。

建议目标形态：

- 明确唯一 API 使用方式。
- 统一声明文件、UTS 类型、README 和页面示例。
- 将失败结果统一为稳定结构。
- 将异步异常、SDK 回调异常和参数校验异常都纳入同一套错误处理流程。

## 鸿蒙/ArkTS 类型与配置评价

优点：

- `orderId`、`transactionId` 使用 `string | null`，比 `undefined` 更适合鸿蒙侧对象传递。
- `querySchemes` 放在 entry 模块，而不是 HAR 模块，方向正确。
- `module.json5` 中 HAR 模块没有错误配置 entry-only 字段。

主要不足：

- `interface.uts` 中 `export default ABCEPayApi` 存在类型/值混用风险。
- `complete?: (res: any) => void` 使用 `any`，不利于 ArkTS 严格类型检查。
- 未处理 SDK Promise 返回值，不符合异步 API 的稳健封装要求。
- 存在未使用导入，严格检查下可能暴露问题。

建议：

- 使用明确的 union 类型替代 `any`。
- 移除类型默认导出或改为合法的运行时对象导出。
- 对所有 SDK Promise 调用进行 `.catch` 或 `await` 处理。
- 对鸿蒙平台专属 API 增加更详细的异常日志或错误码映射。

## 页面代码质量评价

优点：

- 页面结构直观，适合作为插件演示入口。
- 详情页覆盖插件介绍、功能演示、代码示例、API 说明和注意事项，信息完整。
- 非 Harmony 平台有条件编译提示，避免直接调用平台专属 API。

主要不足：

- 示例页面过长，文档内容和运行逻辑混在一个 Vue 文件中。
- 插件名称、版本、描述等元信息重复硬编码。
- 支付表单校验偏弱。
- 默认内网 HTTP 支付地址不适合长期保留。
- 未使用 TypeScript，无法复用插件类型。

建议：

- 将演示逻辑、插件元数据、代码示例数据拆分。
- 使用 `<script setup lang="ts">`。
- 删除默认内网地址，改为输入占位符。
- 支付前先执行安装检查并给出用户引导。

## 配置文件评价

优点：

- `pages.json` 页面注册正确，导航标题清晰。
- `manifest.json` 已配置 `app-harmony.harmonyConfigs.entry` 指向自定义 entry 配置。
- `harmony-configs/entry/src/main/module.json5` 包含 `ohos.permission.INTERNET` 和 `querySchemes: ["bankabc"]`，满足当前示例运行基础需求。
- `main.js` 正确注册 `uview-plus`，页面中的 `u-` 组件有全局插件来源。

主要不足：

- `manifest.json` 中 Android 权限过多且与当前 Harmony 插件无关。
- 根项目没有 scripts，缺少可重复执行的质量检查入口。
- `package-lock.json` 实际安装 `uview-plus@3.8.49`，而 `package.json` 使用 `^3.3.69` 浮动范围；虽然 lock 当前可锁定版本，但新安装或更新时可能继续漂移。

建议：

- 清理无关 Android 权限。
- 如需稳定复现依赖，考虑收窄关键 UI 库版本范围或明确使用 lockfile。
- 补充最小化构建/检查脚本或手工验证流程。

## 建议整改顺序

1. 先统一 API 导出方式和声明文件，解决类型/编译层风险。
2. 处理 SDK Promise reject，保证 `fail` 和 `complete` 可靠触发。
3. 统一 `isRelease`、`complete`、失败对象和成功结果类型。
4. 修复 README 与 `index.d.ts` 中损坏的示例代码。
5. 清理页面默认内网地址、弱校验、重复硬编码和未使用导入。
6. 补充插件权限/宿主配置说明，清理无关 Android 权限。
7. 增加基础质量检查或发布前手工验证清单。
