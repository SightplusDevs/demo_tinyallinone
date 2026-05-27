# EasyAR 小程序云定位示例

这是一个用于演示在微信小程序中接入 EasyAR Mega 云定位能力的样例项目。项目包含云定位、导航、AR 图片识别和 hitTest 相关示例，方便开发者快速参考和调试。

## 示例目录

- `clsvk/clsvk_pc`：简单云定位示例
- `clsvk/clsvk_pc_nav`：简单导航示例
- `clsvk/vk-pc`：AR 识别图片和 hitTest 示例

## 快速开始

1. 复制配置模板：

   ```bash
   cp config.example.js config.js
   ```

2. 打开 `config.js`，填写 EasyAR 相关配置：

   ```js
   export const config = {
     license: 'a long string',
     clsConfig: {
       apiKey: 'xxx',
       apiSecret: 'xxx',
       clsAppId: 'xxx',
       arannotationId: 'xxx',
       serverAddress: 'https://clsv3-api.easyar.com'
     }
   }
   ```

   字段说明：

   - `license`：EasyAR 插件 license，可联系 EasyAR 商务获取
   - `apiKey` / `apiSecret`：Mega 云定位服务 API 凭证，从 easyar 官网后台获取
   - `clsAppId`：云定位应用 ID
   - `arannotationId`：空间标注 ID,如果不使用标注功能可以留空
   - `serverAddress`：云定位服务地址

3. 使用微信开发者工具导入本项目目录。

4. 在微信开发者工具中编译运行，并进入对应示例页面体验功能。

## 注意事项

- 请不要将包含真实 `license`、`apiKey`、`apiSecret` 的 `config.js` 提交到公开仓库。
- 运行云定位和导航示例前，请确认 EasyAR Mega 后台已创建应用并完成相关地图、空间或识别资源配置。
