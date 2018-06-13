<div align="center">
  <img src="https://raw.githubusercontent.com/Mutefish0/yamer/master/src/browser/assets/app.png" width="256"/>
  <h1>Yamer</h1>
  <p>使书写变得简单有趣</p>
</div>

## 技术栈
- Electron
- React
- Typescript
- Glup & Rollup

## 运行平台
精力所限，暂只支持Mac

## 特性
- [x] Markdown 语法高亮
- [x] 代码高亮
- [ ] 支持导出为PDF或HTML文件，支持从本地导入md文件
- [ ] 从URL导入（如简书、gitbook、github等）

## 其他
本软件离不开以下优秀开源库的支持：
- [PEG.js: Parser generator for JavaScript](http://pegjs.org/)
- [highlight.js - Syntax highlighting for the Web](https://highlightjs.org/)

## 开发
1. 生成Markdown解析器：`$ npm run generate-markdown-parser`
2. 启动webpack-dev-server：`$ npm run dev-server`
3. 启动本地API服务器：`$ npm run api-server`
4. 启动Electron：`$ npm run electron`

## 构建/打包
1. 生成Markdown解析器：`$ npm run generate-markdown-parser`
2. 构建并打包：`$ npm run build`
3. 可执行程序将在release目录下生成



