# Agent Guide

本仓库是 EasyAR / SPARPlugin 的微信小程序样例，用来演示云定位、导航、AR 图片识别、hitTest 与 3D tinyallinone 场景加载。Agent 在本项目中工作时，应优先保持样例清晰、最小、可复制，避免把业务工程的复杂抽象带进来。

## 开发环境

- 主要验证方式是微信开发者工具导入项目、编译运行，并在真机或支持 VK 能力的环境中验证 AR/定位能力。

## 项目结构

- `app.js`：小程序启动入口，读取 `config.js`，异步加载 `SPAREngine` 与 `easyar-core`，再调用 `SPARPlugin.inject(engine, easyarCore)`、`setWxApi(wx)`、`setLicense(...)`。
- `app.json`：声明主包页面、`clsvk` 分包、`SPAREngine`、`easyar-core`、`SPARPlugin`、定位隐私权限。
- `config.example.js`：本地配置模板。真实 `config.js` 不应提交，里面会包含 license、CLS API 凭证、路算服务凭证。
- `pages/index`：示例入口页，跳转到各 AR/3D 示例。
- `clsvk/clsvk_pc`：云定位示例。
- `clsvk/clsvk_pc_nav`：云定位 + 路算导航示例。
- `clsvk/vk-pc`：3D 渲染、图片识别、hitTest / VK session 示例。
- `clsvk/vk-pc/VK_image_marker.js`：PlayCanvas script 示例，用 VK marker anchor 更新实体姿态。

## 技术栈与插件

- 小程序框架：原生微信小程序，使用 `Page` / `App` / WXML / WXSS / JSON 配置。
- 3D 引擎：通过 `SPAREngine` 引入 PlayCanvas，引擎版本固定按 PlayCanvas `v1.77.0` API 编写。
- SPAR 插件：`SPARPlugin` 版本见 `app.json`，通过 `requirePlugin('SPARPlugin')` 使用。
- AR / 定位组件：`plugin://SPARPlugin/spar-clsvkclient-new`，在页面 JSON 中声明为本地组件名，现有样例使用 `clsclient`。
- tinyallinone：`const { tinyAllinone } = requirePlugin('SPARPlugin')`，提供 `ARManager`、`TinyLuncher`、`LoadCondition`、`TinyRootType`、`initNavSystem`、`NavManager`、`vkTinyPlugin` 等 3D、AR、导航能力。
- EasyAR Core：通过 `easyar-core` 插件注入给 `SPARPlugin`。

## PlayCanvas 约束

- 3D 代码必须按 PlayCanvas Engine `v1.77.0` API 编写，参考 <https://api.playcanvas.com/engine-v1/> 。
- 不要使用 Three.js API，例如 `THREE.Vector3`、`scene.add`、`Object3D`、`MeshBasicMaterial`。
- 不要默认使用高于 `v1.77.0` 的 PlayCanvas API。若不确定某个 API 是否存在，先查文档或在现有样例中找相同模式。
- 本项目常见对象来自 `PCContext`：`pcCtx.pc` 是 PlayCanvas 命名空间，`pcCtx.app` 是应用实例，`pcCtx.camera` 是相机实体。
- 创建 PlayCanvas script 时沿用 `pc.createScript(...)`、`Script.attributes.add(...)`、`prototype.initialize/update/destroy` 等样例风格。

## spar-clsvkclient-new 组件要点

页面 JSON：

```json
{
  "usingComponents": {
    "clsclient": "plugin://SPARPlugin/spar-clsvkclient-new"
  },
  "disableScroll": true
}
```

常用 WXML：

```xml
<clsclient
  wxapi="{{wxapi}}"
  clsConfig="{{clsConfig}}"
  running="{{running}}"
  enableAR="{{true}}"
  includePerf="{{true}}"
  maxFps="{{30}}"
  bind:load="onClsClientLoad"
  bind:loadPC="onLoadPC"
  bind:loadEMA="onLoadEMA"
  bind:loadCamera="onLoadCamera"
  bind:result="onClsClientResult"
  bind:error="onClsClientError"
/>
```

关键参数：

- `wxapi` 必传，通常是页面 `data.wxapi = wx`，用于规避插件白名单限制。
- `clsConfig` 必传，来自服务端或本地 `config.js`，包含 `apiKey/apiSecret` 或 `apiToken`、`clsAppId`、`serverAddress`、`serviceType` 等。
- `running` 控制是否持续定位。
- `enableAR=false` 时仅渲染 3D，不做 SLAM 跟踪或 CLS 云定位。
- `minInterval` 控制两次定位请求的最小间隔，默认 500ms。
- `multiMapSetting` 用于多地图定位和导航。
- `prior`、`blockid`、`blacklist`、`beaconInfo` 可用于先验位置、地图块限制、设备黑名单、蓝牙 beacon 辅助定位。
- `transparentCanvas` 与 `useWebgl2` 会影响渲染 Canvas 行为，改动前确认目标机型兼容性。

关键事件：

- `load`：组件加载完成，`detail` 包含 `clsClientContext`、`VKSessionContext`、`clsVKCameraContext`、`PCContext` 等上下文。
- `loadPC`：PlayCanvas 场景加载完成，可拿到 `PCContext`。
- `loadCamera`：AR 相机加载完成，可拿到 `ARManager.instance`。
- `loadEMA`：EMA 数据加载完成，可用 `TinyLuncher.instantiateFromAnotation(...)` 实例化标注内容。
- `result`：定位结果。`statusCode === 0` 表示定位成功。
- `error`：组件错误。
- `beacon_status`、`beacon_locationchange`、`beacon_beaconupdate`、`beacon_error`：蓝牙 beacon 状态与错误。

## 常见开发流程

1. 新增页面时，先决定它是普通入口页还是需要放进 `clsvk` 分包。
2. 需要 AR/3D 能力的页面，在页面 JSON 中声明 `clsclient`，WXML 中绑定需要的事件。
3. 在 JS 中设置 `data.wxapi = wx`，配置 `clsConfig`、`running`、`debug`、`multiMapSetting` 等。
4. 在 `onLoadPC` 中拿 `PCContext`，初始化 `TinyLuncher`、tinyApp、GLTF、导航或自定义 PlayCanvas 脚本。
5. 在 `onLoadCamera` 中处理 AR session、VK session、模拟定位等 AR 相关逻辑。
6. 在 `onClsClientResult` 中只处理定位成功后的业务逻辑，并防止重复触发导航等一次性动作。
7. 在 `onUnload` 中销毁 `navManager`、`tinyLuncher`、VK session 或页面创建的插件对象。

## 安全与配置

- 不要提交真实 `config.js`、license、API key、API secret、token、路算服务凭证。
- 示例里可以引用 `config.example.js` 的字段名，但真实凭证应由开发者本地或服务端注入。
- 新增需要定位、相机、蓝牙的能力时，同步检查 `app.json` 的 `requiredPrivateInfos`、`permission` 和微信平台权限说明。

## 本地 Skills

本项目内置了面向 Agent 的开发 skill，位于 `.agents/skills`：

- `.agents/skills/spar-miniprogram-basics/SKILL.md`：项目结构、小程序页面与插件初始化。
- `.agents/skills/clsvkclient-new/SKILL.md`：`spar-clsvkclient-new` 组件接入、事件和定位参数。
- `.agents/skills/tinyallinone/SKILL.md`：tinyallinone 的 tinyApp、EMA、导航、VK 插件使用。
- `.agents/skills/playcanvas-sparengine/SKILL.md`：PlayCanvas v1.77.0 与 SPAREngine 3D 代码约束。

处理相关任务时，优先阅读对应 skill，再做最小必要改动。

## 成功标准

- 改动能被现有样例结构解释，不引入无关框架或抽象。
- 3D 代码使用 PlayCanvas v1.77.0 API。
- 插件组件仍通过 `SPARPlugin` / `SPAREngine` / `easyar-core` 的既有初始化链路工作。
- 敏感配置不进入仓库。
- 页面生命周期中创建的导航、tinyallinone、VK 资源有对应清理逻辑。
