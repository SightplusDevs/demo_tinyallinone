const sysInfo = wx.getSystemInfoSync();
import { config } from '../../config.js';
const { RoadServer, tinyAllinone } = requirePlugin('SPARPlugin');
const { ARManager, TinyLuncher, LoadCondition, TinyRootType, AssistantPlugin, initNavSystem, NavManager } = tinyAllinone;

ARManager.instance.logger.setLevel(0);
Page({
  data: {
    wxapi: wx,
    canvasW: sysInfo.windowWidth,
    canvasH: sysInfo.windowHeight,
    canvasT: 0,
    canvasL: 0,
    //TODO 配置 cls 相关参数,可从 easyar 管理后台获取,通常需要从放到服务器上通过请求获取，然后通过 setdata 设置
    clsConfig: config.clsConfig,
    // 是否开启定位
    running: true,
    multiMapSetting: null,
    roadId: 600,
    blackList: {
      // "vk6Dof": [sysInfo.model],
      // "vk5Dof":[sysInfo.model],
      // "vk3Dof": [sysInfo.model],
      // "camera5Dof": [sysInfo.model],
      // "camera3Dof": ["iPhone 15 pro<iPhone16,1>"],
      // "camera0Dof": []
    }
  },
  onLoad: function (options) {
    console.error('page onLoad');
    // wx.setKeepScreenOn({
    //   keepScreenOn: true,
    // });
    //TODO 路算服务相关配置，如果不使用 easyar 路算服务，可以不设置
    const roadServerConfig = config.roadServerConfig;
    this.roadServer = new RoadServer(roadServerConfig);
    this.roadServer.getConfig(this.data.roadId).then((data) => {
      console.log("获得路网多地图信息", data);
      this.blockConfig = data.config.blocks;
      this.setData({
        multiMapSetting: {
          useMultiMap: true,
          multiMapConfig: data.config.blocks
        },
      })
    }).catch(e => {
      console.error(e);
      debugger
    })
  },
  onReady: function () {
  },
  onUnload: function () {
    if (this.navManager) {
      this.navManager.destroy();
    }
    if (this.tinyLuncher) {
      this.tinyLuncher.destroy();
    }

  },
  // 3D 引擎初始化完成回调
  onLoadPC(e) {
    console.log("playcanvas 启动成功");
    this.pcCtx = e.detail;
    this.app = this.pcCtx.app;

    this.initTinyLuncher(this.pcCtx);
    // 初始化导航系统
    let navSetting = {
      id: this.data.roadId,
      // 请求路算的方法，如果不使用 easyar 的路算服务，可以更改为自己的路算服务
      // 该方法的具体输入和输出参数可以查看文档
      requestRoute: this.roadServer.getRoute,
      // ... otherSetting
    }
    console.info('开始初始化导航系统', this.pcCtx.pc)
    this.navManager = initNavSystem(this.pcCtx.pc, this.pcCtx.app, navSetting);
    console.info('初始化导航系统成功')
  },
  // AR 初始化完成回调，通常晚于 3D 引擎初始化完成回调
  onLoadCamera(e) {
    console.log("AR 启动成功");
    // 代表 AR Start 成功
    this.arManager = e.detail;// e.detail == ARManager.instance
    this.vkSession = this.arManager.arCtrl.curARSession;
    // 如果需要远程扫描现场图片测试，可以使用以下代码，通常不用传入经纬度
    this.arManager.clsClient.setGeoLocationInput("Simulator")
    // 传入经纬度，模拟定位，对于 landmark 模式，需要传入经纬度
    // this.arManager.clsClient.setGeoLocationInput("Simulator", {
    //   latitude: "31.183624",
    //   longitude: "121.456639",
    // })    
  },
  // EMA 加载完成回调，通常晚于 3D 引擎初始化完成回调
  onLoadEMA(e) {
    console.log("EMA 加载成功");
    this.ema = e.detail;
    console.info(this.ema);
    if (this.tinyLuncher) {
      // 将 unity 当中所标注的位置信息初始化到场景当中，
      // 如果在 unity 当中使用脚本挂载了 tinyapp，将一并初始化
      // 如果 show 为 false 时会创建空节点
      this.emaTinyRoot = this.tinyLuncher.instantiateFromAnotation(
        {
          type: "Annotation",
          ema: this.ema,
          externalData: {
            // 设置为 true 时会在标注的位置画一个 cube
            show: true
          }
        });
    }
  },
  // clsClient 初始化完成回调,是 AR 系统 3D 引擎初始化完成的统一回调，此回调中可以拿到所有上下文
  onClsClientLoad(e) {
    let { VKSessionContext, PCContext } = e.detail;
    this.vkCtx = VKSessionContext;
    this.pcCtx = PCContext;
    console.log("onClsClientLoad", e.detail);
    // this.ema = VKSessionContext.self.clsdata?.ema;
    // console.log('ema', this.ema);
    this.camera = this.pcCtx.camera;
    this.app = this.pcCtx.app;
  },
  initTinyLuncher(pcCtx) {
    this.tinyLuncher = TinyLuncher.Instance;
    // 手动加载一个 tinyApp 到场景中
    // this.defaultTinyRoot = this.tinyLuncher.instantiateTinyRoot({
    //   type: TinyRootType.TinyAPP,// 加载 playcanvas 打包的 tinyApp
    //   name: "Box04",
    //   position: { x: 0, y: 0, z: 0 },// 模型位置，可以没有，如果没有模型将被放到原点
    //   euler: { x: 0, y: 0, z: 0 },//模型旋转，欧拉角，可以没有，如果没有角度三轴都为 0
    //   scale: { x: 1, y: 1, z: 1 },//模型缩放，可以没有，默认 1,1,1
    //   tinyAppUrl: "https://sightp-tour-tiny-app.sightp.com/WangXiangHui_Test/79Guan_2024_08_30-11_23_22/tinyapp.json",// 模型地址
    //   loadCondition: LoadCondition.auto, // 自动加载模型，其他可选项有 LoadCondition.distance -- 按与相机的距离加载， LoadCondition.auto -- 自动加载；LoadCondition.manual -- 只初始化但不加载，需手动调用load加载，unLoad 卸载
    //   loadDistance: 5,
    //   showCondition: LoadCondition.auto,// 自动显示模型，其他可选项有 LoadCondition.distance -- 按与相机的距离显示， LoadCondition.auto -- 自动显示；LoadCondition.manual -- 只初始化但不显示，需手动调用setActive(true)显示
    //   showDistance: 4
    // });
    // 手动加载一个 glb 模型作为 tinyapp 到场景中
    // this.gltfTinyRoot = this.tinyLuncher.instantiateTinyRoot({
    //   type: TinyRootType.GLTF,// 加载 glb 或 gltf 模型
    //   name: "myModel",
    //   position: { x: 16, y: -1.83, z: -7.4 },// 模型位置，可以没有，如果没有模型将被放到原点
    //   euler: { x: 0, y: 0, z: 0 },//模型旋转，欧拉角，可以没有，如果没有角度三轴都为 0
    //   scale: { x: 0.01, y: 0.01, z: 0.01 },//模型缩放，可以没有，默认 1,1,1
    //   tinyAppUrl: "https://sightp-tour-tiny-app.sightp.com/gltfOrGlb/xiaoxiongmao_1.glb",// 模型地址
    //   loadCondition: LoadCondition.auto, // 自动加载模型，其他可选项有 LoadCondition.distance -- 按与相机的距离加载， LoadCondition.auto -- 自动加载；LoadCondition.manual -- 只初始化但不加载，需手动调用load加载，unLoad 卸载
    //   loadDistance: 5,//当 loadCondition 为 distance 时生效
    //   showCondition: LoadCondition.auto,// 自动显示模型，其他可选项有 LoadCondition.distance -- 按与相机的距离显示， LoadCondition.auto -- 自动显示；LoadCondition.manual -- 只初始化但不显示，需手动调用setActive(true)显示
    //   showDistance: 3,// 当showCondition 为 distance 时生效
    //   externalData: { clickable: true }
    // });
    // this.gltfTinyRoot.on("loaded", () => {
    // })
    // 当LoadCondition不为 distance 时，也可以通过以下方式加载卸载，显示隐藏
    // this.gltfTinyRoot.setActive(false);//隐藏模型
    // this.gltfTinyRoot.unLoad();// 卸载模型
    // this.gltfTinyRoot.load();// 重新加载模型
    // this.gltfTinyRoot.destroy();// 删除，删除后将不可再调用 load

    // 当添加了externalData: { clickable: true } 参数时，可以通过以下方法监听点击消息
    // this.gltfTinyRoot.on("click", () => {
    //   wx.showToast({
    //     title: 'clicked',
    //   })
    // });
  },
  onClsClientResult(e) {
    console.log("onClsClientResult", e.detail);
    if (e.detail.statusCode == 0) {
      console.log("定位到地图：", e.detail.result._blockId)
      // 定位成功
      let cameraPosition = this.pcCtx.camera.getPosition();
      console.log("当前相机位置：", cameraPosition);
      // 简单演示发起导航,发起导航时需要至少定位成功过一次。
      if (this.navManager && !this.naving) {
        console.info('发起导航')
        this.naving = true;
        // 只有初始化完 ema,且 ema 标注中有这个名字的 cube 才能找到
        let endPosition = this.app.root.findByName("荣誉墙").getPosition();
        // 打印终点坐标
        console.log("endPosition", endPosition.toString());
        this.navManager.fire("nav_start", endPosition);
        this.navManager.once("nav_arrive", () => {
          console.log("到达终点");
        });
      }
    } else {
      // 定位失败
    }
  },
  onClsClientError(e) {
    console.log("onClsClientError", e.detail);
  }
});