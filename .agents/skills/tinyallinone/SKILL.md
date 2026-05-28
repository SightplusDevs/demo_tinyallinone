---
name: tinyallinone
description: SPARPlugin tinyallinone workflow guidance for this Mini Program sample. Use when Codex adds or changes TinyLuncher usage, tinyApp or GLTF loading, EMA annotation instantiation, RoadServer and initNavSystem navigation, ARManager access, vkTinyPlugin sessions, image marker flows, or tinyallinone lifecycle cleanup.
---

# tinyallinone

## Import Pattern

```js
const { RoadServer, tinyAllinone } = requirePlugin('SPARPlugin');
const {
  ARManager,
  TinyLuncher,
  LoadCondition,
  TinyRootType,
  initNavSystem,
  NavManager,
  vkTinyPlugin
} = tinyAllinone;
```

Only import what the page uses.

## Lifecycle Pattern

1. Use `onLoadPC(e)` to receive `PCContext`.
2. Store `this.pcCtx = e.detail`, `this.app = this.pcCtx.app`, and initialize `this.tinyLuncher = TinyLuncher.Instance`.
3. Use `onLoadCamera(e)` for AR-specific access: `this.arManager = e.detail`.
4. Use `onLoadEMA(e)` for annotation data.
5. Use `onUnload` to destroy `navManager`, `tinyLuncher`, and any session/plugin created by the page.

## EMA Annotation

```js
this.emaTinyRoot = this.tinyLuncher.instantiateFromAnotation({
  type: "Annotation",
  ema: this.ema,
  externalData: {
    show: true
  }
});
```

Use this when the CLS service returns EMA / Unity annotation data. Keep `show: true` only for debug or demo visualization.

## tinyApp / GLTF Loading

Use `TinyLuncher` for content managed by the SPAR tinyallinone runtime:

```js
const tinyRoot = this.tinyLuncher.instantiateTinyRoot({
  type: TinyRootType.TinyAPP,
  name: "Example",
  position: { x: 0, y: 0, z: 0 },
  euler: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  tinyAppUrl: "https://example.com/tinyapp.json",
  loadCondition: LoadCondition.auto,
  showCondition: LoadCondition.auto
});
```

For GLB / GLTF, use `TinyRootType.GLTF` and scale deliberately; many GLTF assets need small scale values.

## Navigation

Pattern from `clsvk/clsvk_pc_nav/clsvk_nav.js`:

```js
this.roadServer = new RoadServer(config.roadServerConfig);
this.navManager = initNavSystem(this.pcCtx.pc, this.pcCtx.app, {
  id: this.data.roadId,
  requestRoute: this.roadServer.getRoute
});
```

Start navigation only after at least one successful localization:

```js
if (this.navManager && !this.naving && e.detail.statusCode === 0) {
  this.naving = true;
  const endPosition = this.app.root.findByName("targetName").getPosition();
  this.navManager.fire("nav_start", endPosition);
}
```

Guard `findByName(...)` if target names can be absent in the configured EMA scene.

## VK Plugin / Image Marker

For image marker and hitTest examples, use `vkTinyPlugin` with the existing `VK_image_marker.js` pattern:

- Create a `vkTinyPlugin`.
- Add it to `TinyLuncher`.
- Create or reuse a VK session.
- Add marker images through `vkPlugin.addMarker(...)`.
- Listen for marker anchor add/update/remove events.

## Verification

- tinyallinone APIs are only called after their relevant load event.
- Navigation starts after successful CLS result, not during initial page load.
- Repeated `result` events do not repeatedly start navigation or load duplicate content.
- `onUnload` destroys managers and runtime objects created by the page.

## Avoid

- Do not manually manipulate internal plugin fields unless the sample already does so and there is no public API.
- Do not assume EMA object names exist across maps.
- Do not mix PlayCanvas scene/entity APIs with Three.js scene APIs.
