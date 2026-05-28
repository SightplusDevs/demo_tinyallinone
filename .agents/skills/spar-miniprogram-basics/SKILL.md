---
name: spar-miniprogram-basics
description: Native WeChat Mini Program project guidance for this SPARPlugin sample. Use when Codex adds or changes pages, app startup, app.json plugin declarations, subpackage routes, config templates, privacy permissions, or cleanup lifecycle code in the demo_tinyallinone project.
---

# SPAR Miniprogram Basics

## Context

This repository is a native WeChat Mini Program sample. It demonstrates EasyAR Mega cloud localization, navigation, VK image / plane features, and PlayCanvas rendering through SPAR plugins.

Key files:

- `app.js` initializes `SPARPlugin` by loading `SPAREngine` and `easyar-core`, then calling `SPARPlugin.inject(engine, easyarCore)`, `setWxApi(wx)`, and `setLicense(...)`.
- `app.json` declares pages, subpackages, plugins, and privacy permissions.
- `pages/index` is the demo menu.
- `clsvk/*` contains AR / CLS / navigation examples.
- `config.example.js` is the only safe credential template. Real `config.js` should stay local.

## Workflow

1. Identify whether the change belongs to the root page, `clsvk` subpackage, or app startup.
2. Match the current native Mini Program style: `Page({...})`, WXML bindings, WXSS, and page JSON.
3. If a page needs AR/3D/CLS, declare `clsclient` in its page JSON:

   ```json
   {
     "usingComponents": {
       "clsclient": "plugin://SPARPlugin/spar-clsvkclient-new"
     },
     "disableScroll": true
   }
   ```

4. Keep sensitive values out of source files. Use `config.example.js` for shape only.
5. Add cleanup in `onUnload` for objects created by the page, such as `tinyLuncher`, `navManager`, or VK sessions.

## Project Rules

- Do not add dependencies unless the task clearly requires them.
- Keep sample code small and readable; this repository is meant to teach integration patterns.

## Verification

- For configuration-only edits, inspect JSON syntax and page paths.
- For JS/WXML edits, verify the page can still be imported by WeChat Developer Tools.
- For AR/CLS behavior, success usually requires a real device or a VK-capable WeChat environment.

## Avoid

- Do not replace native Mini Program structure with a web framework.
- Do not commit real `license`, `apiKey`, `apiSecret`, `apiToken`, or road server credentials.
- Do not remove existing plugin declarations unless the task explicitly changes the integration model.
