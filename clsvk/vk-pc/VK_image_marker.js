export function initImageMarker(pc,tinyLuncher) {
  var VkImageMarker = pc.createScript('vkImageMarker');
  VkImageMarker.attributes.add('markerImage', { type: 'asset', assetType: 'texture' });
  VkImageMarker.attributes.add('showMarkerPlane', { type: 'boolean', default: false });

  // initialize code called once per entity
  VkImageMarker.prototype.initialize = async function () {
    let markerPlane = this.entity.findByName('MarkerPlane');
    if (this.showMarkerPlane) {
      markerPlane.enabled = true;
    } else {
      markerPlane.enabled = false;
    }
    let vkPlugin = tinyLuncher.getPlugin('vkPlugin');
    if (!vkPlugin) {
      console.error('未找到 vkPlugin');
      return
    }
    if (vkPlugin.vkSession && vkPlugin._setting.track.marker) {
      // 当前 session 已在运行且支持图像识别
      this.vkSession = vkPlugin.vkSession;
    } else {
      // https://developers.weixin.qq.com/miniprogram/dev/api/ai/visionkit/VKSession.html
      this.vkSession = await vkPlugin.createSession({ version: 'v1', track: { plane: { mode: 1 }, marker: true } });
    }
    // 获取 asset 的 url 会携带 Url 参数，split 掉
    this.markerId = await vkPlugin.addMarker(this.markerImage.getFileUrl().split('?')[0]);
    this.app.on(`addMarkerAnchor:${this.markerId}`, this.show, this);
    this.app.on(`updateMarkerAnchor:${this.markerId}`, this.updatePose, this);
    this.app.on(`removeMarkerAnchor:${this.markerId}`, this.hide, this);
    this.entity.enabled = false;
    this.on('destroy', () => {
      this.app.off(`addMarkerAnchor:${this.markerId}`, this.show, this);
      this.app.off(`updateMarkerAnchor:${this.markerId}`, this.updatePose, this);
      this.app.off(`removeMarkerAnchor:${this.markerId}`, this.hide, this);
    })
  };
  VkImageMarker.prototype.show = function (anchor) {
    console.log('show')
    if (!this.entity.enabled) this.entity.enabled = true;
    // https://developers.weixin.qq.com/miniprogram/dev/api/ai/visionkit/VKMarkerAnchor.html
    this.updateTransform(anchor.transform);
  };
  VkImageMarker.prototype.updatePose = function (anchor) {
    console.log("update")
    if (!this.entity.enabled) this.entity.enabled = true;
    this.updateTransform(anchor.transform);
  };
  VkImageMarker.prototype.hide = function () {
    console.log('hide');
    this.entity.enabled = false;
  };
  VkImageMarker.prototype.updateTransform = function (_transform) {
    const transform = new pc.Mat4();
    transform.set(Array.from(_transform));
    this.entity.setPosition(transform.getTranslation());
    this.entity.setRotation(new pc.Quat().setFromMat4(transform));
    this.entity.setLocalScale(transform.getScale());
  };
}