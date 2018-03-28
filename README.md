# Yamer - Yet Another Markdown Editor and Reader
使书写变得简单有趣

## 技术栈
- Electron
- React
- Typescript
- Glup & Rollup

## 运行平台
暂只支持Mac

## 特性（暂只实现部分
- Markdown 语法高亮
- 代码高亮
- 支持导出为PDF或HTML文件

## 其他
本软件离不开以下优秀开源库的支持：
- [PEG.js: Parser generator for JavaScript](http://pegjs.org/)
- [highlight.js - Syntax highlighting for the Web](https://highlightjs.org/)

## Todo
- 链接可以包含除了链接的inline
- 光标在边缘的问题（一段文本拆分为多个span最后布局有着不同的表现？），还是考虑用fix定位来做，存在问题：\n的光标问题（方案：遇到\n时offset直接+1）



