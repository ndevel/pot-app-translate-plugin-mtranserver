# Pot-App MTranServer 翻译插件

## 简介

MTranServer 翻译插件是为 [Pot](https://pot-app.com/) 设计的一款翻译插件，它通过调用 [MTranServer](https://github.com/xxnuo/MTranServer) 作为翻译引擎，为用户提供一个私有化、高效的翻译解决方案。

## 功能特点

- **数据安全**：支持本地化部署翻译服务器，所有翻译请求均在您自己的网络环境中完成。
- **配置灵活**：支持自定义 API 地址和 Token，满足个性化需求。
- **高可靠性**：内置超时机制和错误处理，确保稳定运行。

## 安装与配置

### 1. 安装插件

1.  前往本项目的 [**Releases**](https://github.com/Mars-Sea/pot-app-translate-plugin-mtranserver/releases) 页面。
2.  下载最新版本的 `plugin.com.pot-app.mtranserver.potext` 文件。
3.  在 Pot 应用中，进入 **设置 > 插件 > 安装外部插件**，选择刚刚下载的 `.potext` 文件即可。

### 2. 配置插件

1.  安装成功后，在插件列表中找到 **MTranServer翻译服务**。
2.  点击设置按钮，填写您的 `API 地址` 和 `API 密钥`（如果您的服务需要）。
3.  保存配置，即可开始使用。

## 常见问题

- **插件无法连接到服务器？**
  - 请确认填写的 API 地址是否正确，且 MTranServer 服务正在正常运行。
  - 如果您的服务配置了 Token 验证，请确保填写的 API 密钥无误。

- **翻译质量不符合预期？**
  - MTranServer 专注于翻译速度和私有化部署，其翻译质量可能与大型商业翻译引擎存在差异。

- **翻译请求超时？**
  - 网络延迟或服务器负载过高可能导致超时，请检查网络连接或服务器状态。

## 开发与构建

如果您想自行修改或构建此插件，请按以下步骤操作：

1.  克隆本项目到本地。
2.  修改代码（主要逻辑位于 `main.js`）。
3.  将 `info.json`, `mtranserver.svg`, `main.js` 三个文件打包成 ZIP 压缩包。
4.  将压缩包的扩展名从 `.zip` 修改为 `.potext`。

### 项目结构

```
├── info.json          # 插件配置文件
├── main.js            # 插件核心逻辑
├── mtranserver.svg    # 插件图标
├── README.md          # 说明文档
└── .github/workflows  # GitHub Actions 构建流程
```

### 代码规范

- 遵循现代JavaScript ES6+ 语法
- 使用 JSDoc 编写函数注释
- 采用模块化设计，功能分离
- 完善的错误处理机制

## 致谢

- [MTranServer](https://github.com/xxnuo/MTranServer)
- [bob-plugin-MTranServer](https://github.com/gray0128/bob-plugin-MTranServer)

## 贡献

欢迎通过提交 [Issue](https://github.com/Mars-Sea/pot-app-translate-plugin-mtranserver/issues) 或 Pull Request 的方式为本项目做出贡献。

### 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request
