import { config } from './config.js';
const SPARPlugin = requirePlugin('SPARPlugin');

// app.js
App({
  // TODO：请在此处填写您的license
  license: config.license,
  async onLaunch() {
    // ------ 开发者工具中为保证插件正常加载，增加了延时，正式发布后可删除
    const _= await new Promise((resolve)=>setTimeout(resolve,1000));
    // ------
    
    const engine = await requirePlugin.async('SPAREngine');
    const easyarCore = await requirePlugin.async('easyar-core')
    SPARPlugin.inject(engine, easyarCore)
    const { setLicense, setWxApi } = SPARPlugin;
    setWxApi(wx)
    await setLicense(this.license)
    console.log('------初始化插件完成------');
  },
})
