<p align="center">
<img alt='Due Helper Logo' width="400"  src='/public/logo.png'/>
<br/>
<span>A free & open-source software for managing tasks. Optimized for tasks with due dates under categories.</span>
<br/>
<span>Made by <a href="https://github.com/BenjaminYe36">Guangyin Ye</a></span>
</p>

English | [简体中文](./README-zh_CN.md)

## Big Changes
- Switched from Electron to Tauri for reduced executable size (From 193 MB down to less than 3 MB (on Windows))
- Added localization support for zh-CN

## Screenshots
[![en-1.png](https://s1.ax1x.com/2022/08/21/vyQ2uR.png)](https://imgse.com/i/vyQ2uR)
[![en-2.png](https://s1.ax1x.com/2022/08/21/vyQRD1.png)](https://imgse.com/i/vyQRD1)
[![en-3.png](https://s1.ax1x.com/2022/08/21/vyQcv9.png)](https://imgse.com/i/vyQcv9)

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
