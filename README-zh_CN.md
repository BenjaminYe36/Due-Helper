<p align="center">
<img alt='Due Helper Logo' width="400"  src='/public/logo.png'/>
<br/>
<span>一款开源免费的任务管理软件。 最适合处理不同类别下有截止日期的任务。</span>
<br/>
<span>作者：<a href="https://github.com/BenjaminYe36">叶广荫</a></span>
</p>

[English](./README.md) | 简体中文

## 近期大改动
- Due Helper 现已推出网页应用! (点击下方链接即可尝试或使用，无需任何安装)
- 链接: [https://benjaminye36.github.io/Due-Helper/](https://benjaminye36.github.io/Due-Helper/)
- **重要提示**: 此网页应用依赖于浏览器的 localStorage 来储存数据，使用无痕模式或清理浏览器数据会使应用数据消失。

## 软件截图
[![zh-1.png](https://i.ibb.co/4dmG5xn/due-helper-2-3-0-zh-1.png)](https://ibb.co/Kw0k3Hp)
[![zh-2.png](https://i.ibb.co/kMVv07k/due-helper-2-3-0-zh-2.png)](https://ibb.co/XVfMpQN)
[![zh-3.png](https://i.ibb.co/R9W1H1d/due-helper-2-3-0-zh-3-local.png)](https://ibb.co/zrw1f1D)

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
