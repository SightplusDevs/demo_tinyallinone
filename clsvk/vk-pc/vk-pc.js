import { initImageMarker } from "./VK_image_marker";


// clsvk/vk-pc/vk-pc.js
const { tinyAllinone } = requirePlugin('SPARPlugin');
const { ARManager, easyar, TinyLuncher, AssistantPlugin, SceneSetting, vkTinyPlugin } = tinyAllinone
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wxapi:wx
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  onLoadPC() {
    this.tinyLuncher = TinyLuncher.Instance;
    initImageMarker(this.tinyLuncher.pc,this.tinyLuncher);
    console.log('on load pc invok')
    this.vkPlugin = new vkTinyPlugin();
    this.tinyLuncher.addPlugin(this.vkPlugin);
    // 样例项目 https://playcanvas.com/project/1353949/overview/vk-sample
    // 3D 识别使用：https://sightp-tour-tiny-app.sightp.com/qmytest/ObjectMarker_2025_11_24-17_24_51/tinyapp.json
    // 图片识别使用：https://sightp-tour-tiny-app.sightp.com/qmytest/ImageMarker_2025_06_10-16_34_52/tinyapp.json
    // hittest 使用：https://sightp-tour-tiny-app.sightp.com/qmytest/HitTest_2025_06_11-17_10_20/tinyapp.json
    // https://sightp-tour-tiny-app.sightp.com/GuGongTaoCiGuan/ImageTrack12026_02_11-14_46_36/tinyapp.json
    // let tinyroot = this.tinyLuncher.instantiateFromTinyApp('https://sightp-tour-tiny-app.sightp.com/qmytest/ImageMarker_2026_02_12-12_44_39/tinyapp.json')
    let tinyroot = this.tinyLuncher.instantiateFromTinyApp('https://sightp-tour-tiny-app.sightp.com/ShangHaiZhongXin/ImageTrack5_2026_04_30-19_12_52/tinyapp.json')
    tinyroot.on('load_prograss',(p)=>{
     wx.showLoading({
        title: `加载中${(p*100).toFixed(0)}%`,
      })
    })
    tinyroot.on('loaded',()=>{
      wx.hideLoading()
    })
    tinyroot.rootEntity.setPosition(0,0,-3);
  },
  createMarkerSession() {
    if (this.vkPlugin?.vkSession) this.vkPlugin.destroySession();
    this.vkPlugin?.createSession({ version: 'v1', track: { plane: { mode: 1 }, marker: true } });
  },
  createPlaneSession() {
    if (this.vkPlugin?.vkSession) this.vkPlugin.destroySession();
    this.vkPlugin?.createSession({ version: 'v2', track: { plane: { mode: 1 } } });
  },
  destroySession() {
    this.vkPlugin?.destroySession();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})