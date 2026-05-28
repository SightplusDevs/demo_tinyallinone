---
name: clsvkclient-new
description: Integration guidance for the SPARPlugin spar-clsvkclient-new component. Use when Codex works on CLS localization, AR camera startup, PlayCanvas context events, wxapi and clsConfig wiring, running/minInterval, multi-map settings, prior position, blockid, blacklist, beaconInfo, or component load/result/error handlers in this Mini Program sample.
---

# spar-clsvkclient-new

## Component Purpose

`clsvkclient_new` integrates camera preview, VK session management, CLS localization, PlayCanvas rendering context, AR tracking, and optional beacon-assisted positioning.

The existing pages alias it as `clsclient`:

```json
{
  "usingComponents": {
    "clsclient": "plugin://SPARPlugin/spar-clsvkclient-new"
  }
}
```

## Common WXML

```xml
<clsclient
  wxapi="{{wxapi}}"
  clsConfig="{{clsConfig}}"
  running="{{running}}"
  minInterval="{{minInterval}}"
  multiMapSetting="{{multiMapSetting}}"
  blacklist="{{blackList}}"
  includePerf="{{true}}"
  maxFps="{{30}}"
  debug="{{debug}}"
  bind:load="onClsClientLoad"
  bind:loadPC="onLoadPC"
  bind:loadEMA="onLoadEMA"
  bind:loadCamera="onLoadCamera"
  bind:result="onClsClientResult"
  bind:error="onClsClientError"
/>
```

## Important Parameters

- `wxapi`: required. Use `wx` from page data to avoid plugin whitelist issues.
- `license`: optional if `SPARPlugin.setLicense(...)` has already run in `app.js`.
- `clsConfig`: required for CLS. It should include either `apiKey` + `apiSecret` or `apiToken`, plus `clsAppId`, `serverAddress`, and `serviceType`.
- `running`: whether to continuously locate.
- `minInterval`: minimum interval between localization requests, default 500ms.
- `enableAR`: default `true`. Set `false` for 3D-only rendering without SLAM tracking or CLS cloud localization.
- `trackImage`: enables image tracking when VK v2 is supported.
- `multiMapSetting`: use with road / multi-map flows.
- `prior`: prior position with `x`, `y`, `z`, `accuracy`, `timestamp`, `is2d`, and `validTime`.
- `blockid`: restricts map block IDs.
- `blacklist`: can include `vk6Dof`, `vk3Dof`, and other device model lists used by the integration.
- `beaconInfo`: enables beacon-assisted positioning.
- `transparentCanvas` and `useWebgl2`: rendering settings; treat as compatibility-sensitive.

## Events

- `load`: unified component load event. `detail` can include `clsClientContext`, `VKSessionContext`, `clsVKCameraContext`, and `PCContext`.
- `loadPC`: PlayCanvas context is ready. Initialize 3D scene, tinyallinone content, or navigation here.
- `loadCamera`: AR camera is ready. Access `ARManager.instance`, current VK session, or simulator geo input here.
- `loadEMA`: EMA data loaded. Instantiate annotation content through `TinyLuncher` if needed.
- `result`: localization result. Check `detail.statusCode === 0` before using map or camera position.
- `error`: component error event.
- `beacon_status`, `beacon_locationchange`, `beacon_beaconupdate`, `beacon_error`: beacon lifecycle events.

## CLS Config Shape

```js
clsConfig: {
  apiKey: "xxx",
  apiSecret: "xxx",
  // apiToken can replace apiKey + apiSecret
  clsAppId: "xxx",
  landmarkSpotVersionId: "xxx",
  landmarkSpotId: "xxx",
  serverAddress: "https://clsv3-api.easyar.com",
  serviceType: "block",
  arannotationId: "xxx",
  serverTrack5Dof: false
}
```

## Beacon Config Shape

```js
beaconInfo: {
  enabled: true,
  beaconId: 41,
  interval: 1000,
  accuracy: 5,
  validTime: 3,
  requestOption: {
    appKey: "CLIENT_APP_KEY",
    appSecret: "CLIENT_APP_SECRET",
    host: "https://dijkstra-server-api.easyar.com"
  }
}
```

## Implementation Notes

- If config is fetched asynchronously, render the component after config is ready, as in `clsvk/clsvk_pc/clsvk.js`.
- Guard one-shot behavior in `result`; localization can fire repeatedly.
- Use `this.pcCtx.camera.getPosition()` only after `PCContext` exists and localization succeeded.
- If enabling simulator geolocation, keep it visibly test-only.

## Verification

- Page JSON has the component declaration.
- WXML passes `wxapi` and `clsConfig`.
- `result` handles success and failure paths.
- Any object created in event callbacks is cleaned up in `onUnload`.
