<p align="center">
<img alt='Due Helper Logo' width="400"  src='/public/logo.png'/>
<br/>
<span>一款开源免费的任务管理软件。 最适合处理不同类别下有截止日期的任务。</span>
<br/>
<span>作者：<a href="https://github.com/BenjaminYe36">叶广荫</a></span>
</p>

[English](./README.md) | 简体中文

[comment]: <> (The start of badges part)
[![GitHub Release](https://img.shields.io/github/v/release/benjaminye36/due-helper?logo=github)](https://github.com/BenjaminYe36/Due-Helper/releases/latest)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/benjaminye36/due-helper/.github%2Fworkflows%2Fbuild-on-3-platforms.yml?logo=Tauri&label=Build%20on%203%20platforms)](https://github.com/BenjaminYe36/Due-Helper/actions/workflows/build-on-3-platforms.yml)
[![GitHub deployments](https://img.shields.io/github/deployments/benjaminye36/due-helper/github-pages?logo=React&label=Github%20Pages%20Deployment)](https://benjaminye36.github.io/Due-Helper/)
[![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/benjaminye36/due-helper/total)](https://github.com/BenjaminYe36/Due-Helper/releases)
[![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/t/benjaminye36/due-helper/main-tauri)](https://github.com/BenjaminYe36/Due-Helper/commits/main-tauri/)
[![GitHub License](https://img.shields.io/github/license/benjaminye36/due-helper)](https://github.com/BenjaminYe36/Due-Helper/blob/main-tauri/LICENSE)

## 近期大改动
- Due Helper 现已推出网页应用! (点击下方链接即可尝试或使用，无需任何安装)
- 链接: [https://benjaminye36.github.io/Due-Helper/](https://benjaminye36.github.io/Due-Helper/)
- **重要提示**: 此网页应用依赖于浏览器的 localStorage 来储存数据，使用无痕模式或清理浏览器数据会使应用数据消失。

## 近期新增
- 添加了一个可自定义的推迟任务右键菜单功能（见下截图）

## 软件截图
<p align="left">
  <img alt='Due Helper Screenshot en 1' src='/public/due-helper-2-4-0-zh-1.png'/>
  <img alt='Due Helper Screenshot en 2' src='/public/due-helper-2-4-0-zh-2.png'/>
  <img alt='Due Helper Screenshot en 3' src='/public/due-helper-2-4-0-zh-3.png'/>
</p>

## 网页应用页面
[点此查看已部署的网页应用](https://benjaminye36.github.io/Due-Helper/)

## 下载页面
[点击此处跳转](https://github.com/BenjaminYe36/Due-Helper/releases)

## 使用说明书
[点击此处跳转](https://github.com/BenjaminYe36/Due-Helper/wiki/%E8%BD%AF%E4%BB%B6%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E)

## 测试与编译
### 测试所需环境

- Rust & 和操作系统有关的环境 ([请查阅Tauri的文档](https://tauri.app/v1/guides/getting-started/prerequisites))
- NodeJs & npm

### 测试步骤指南
1. 用git克隆到本地 或 下载源码压缩包并解压
2. 安装Tauri的依赖环境 [参照此指南](https://tauri.app/v1/guides/getting-started/prerequisites)
3. 在项目文件夹下运行 `npm install`
4. 运行 `npm run tauri dev` 来启动测试

### 编译，打包
运行命令 `npm run tauri build` 来创建你现在所在平台的安装包

## 十分感谢 Tauri 以及它的文档

- 你可以从 [这里](https://tauri.app/) 了解Tauri
