---
name: playcanvas-sparengine
description: PlayCanvas v1.77.0 guidance for 3D code through SPAREngine in this Mini Program sample. Use when Codex writes or reviews PlayCanvas scripts, pc.* math and entity APIs, transforms, materials, marker pose updates, or SPAREngine-rendered scene logic, especially to avoid Three.js or newer PlayCanvas APIs.
---

# PlayCanvas via SPAREngine

## Version Constraint

This project receives PlayCanvas through `SPAREngine`. Write 3D code against PlayCanvas Engine `v1.77.0`.

Reference: https://api.playcanvas.com/engine-v1/

Do not use Three.js APIs. Do not assume APIs from newer PlayCanvas versions exist.

## Getting PlayCanvas Objects

From the `spar-clsvkclient-new` component:

```js
onLoadPC(e) {
  this.pcCtx = e.detail;
  this.pc = this.pcCtx.pc;
  this.app = this.pcCtx.app;
  this.camera = this.pcCtx.camera;
}
```

In existing tinyallinone code, `TinyLuncher.Instance.pc` is also used.

## Script Pattern

Follow the existing `clsvk/vk-pc/VK_image_marker.js` style:

```js
export function initExampleScript(pc) {
  const Example = pc.createScript('example');

  Example.attributes.add('speed', { type: 'number', default: 1 });

  Example.prototype.initialize = function () {
    // Setup.
  };

  Example.prototype.update = function (dt) {
    // Per-frame logic.
  };
}
```

Register scripts before loading tinyApp content that expects them.

## Common API Shape

- Entity transform: `entity.setPosition(...)`, `entity.getPosition()`, `entity.setRotation(...)`, `entity.setLocalScale(...)`.
- Math classes: `new pc.Vec3(...)`, `new pc.Quat(...)`, `new pc.Mat4(...)`.
- Mat4 usage in marker transforms:

  ```js
  const transform = new pc.Mat4();
  transform.set(Array.from(anchor.transform));
  entity.setPosition(transform.getTranslation());
  entity.setRotation(new pc.Quat().setFromMat4(transform));
  entity.setLocalScale(transform.getScale());
  ```

- Scene lookup: `app.root.findByName("EntityName")`.

## Mini Program Considerations

- The plugin has already handled WeChat Mini Program compatibility for PlayCanvas. Do not add browser-only assumptions such as direct `document`, `window`, or DOM canvas access in page code.
- Prefer component-provided contexts over global engine objects.
- Keep frame work light; mobile AR and camera rendering are performance-sensitive.

## Verification

- Code uses `pc.*` classes from the provided PlayCanvas namespace.
- No `THREE.*`, DOM canvas, or web-only event assumptions are introduced.
- Any script expected by a tinyApp is registered before that tinyApp is instantiated.
- Runtime objects created by the page are cleaned up on unload where applicable.

## Avoid

- Do not import `three`.
- Do not use `new pc.Application(...)` unless the task is explicitly about standalone PlayCanvas initialization; the component already owns the app.
- Do not rewrite working 3D sample code into a different style just for consistency.
