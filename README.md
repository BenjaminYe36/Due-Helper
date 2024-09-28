<p align="center">
<img alt='Due Helper Logo' width="400"  src='/public/logo.png'/>
<br/>
<span>A free & open-source software for managing tasks. Optimized for tasks with due dates under categories.</span>
<br/>
<span>Made by <a href="https://github.com/BenjaminYe36">Guangyin Ye</a></span>
</p>

English | [简体中文](./README-zh_CN.md)

<p align="left">
  <img alt="GitHub Release" src="https://img.shields.io/github/v/release/benjaminye36/due-helper?logo=github">
  <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/benjaminye36/due-helper/.github%2Fworkflows%2Fbuild-on-3-platforms.yml?logo=Tauri&label=Build%20on%203%20platforms">
  <img alt="GitHub deployments" src="https://img.shields.io/github/deployments/benjaminye36/due-helper/github-pages?logo=React&label=Github%20Pages%20Deployment">
  <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/benjaminye36/due-helper/total">
  <img alt="GitHub commit activity (branch)" src="https://img.shields.io/github/commit-activity/t/benjaminye36/due-helper/main-tauri">
  <img alt="GitHub License" src="https://img.shields.io/github/license/benjaminye36/due-helper">
</p>

## Big Changes
- Now Due Helper has a Web App version! (which means you can try out or use without any installation)
- Link: [https://benjaminye36.github.io/Due-Helper/](https://benjaminye36.github.io/Due-Helper/)
- **IMPORTANT NOTE**: The Web App relies on browser localStorage to persist data, using incognito mode or clearing the browsing data
  will make the task data go away.

## Screenshots
<p align="left">
  <img alt='Due Helper Screenshot en 1' src='/public/due-helper-2-3-0-en-1.png'/>
  <img alt='Due Helper Screenshot en 2' src='/public/due-helper-2-3-0-en-2.png'/>
  <img alt='Due Helper Screenshot en 3' src='/public/due-helper-2-3-0-en-3.png'/>
</p>

## Web App Page
[See deployed Web App here](https://benjaminye36.github.io/Due-Helper/)

## Download page
[See release here](https://github.com/BenjaminYe36/Due-Helper/releases)

## User Guide
[See wiki here](https://github.com/BenjaminYe36/Due-Helper/wiki)

## Testing & Building
### Pre-req for testing

- Rust & System specific pre-req ([please view Tauri doc here](https://tauri.app/v1/guides/getting-started/prerequisites))
- NodeJs & npm

### Testing instructions
1. git clone this repo or download source code and extract
2. install Tauri pre-req by following [this guide](https://tauri.app/v1/guides/getting-started/prerequisites)
3. run `npm install` under project folder
4. run `npm run tauri dev` for dev build testing

### Building
run command `npm run tauri build` for creating distribution for your platform

## Many Thanks to Tauri and its documentation

- You could learn more about Tauri [here](https://tauri.app/)
