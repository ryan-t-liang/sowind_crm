# Sowind 售后服务原型

本仓库包含三个纯前端、可交互的静态原型：

- `frontend/`：GP 芝柏表与 UN 雅典表用户端 H5，React + TypeScript + Vite + shadcn/ui。
- `admin/`：Sowind CRM 后台，保留会员、线索并新增售后服务模块。
- `site/`：部署后的三端入口页。

## 本地构建

```bash
npm run install:frontend
npm run build
npm run assemble
```

构建结果位于 `dist-site/mockup/`，对应正式发布路径：

- `/mockup/sowind_crm/`：CRM 后台
- `/mockup/girard-perregaux/`：GP H5
- `/mockup/ulysse-nardin/`：UN H5

本地预览：

```bash
npm run preview
```

然后访问上述三个 `/mockup/.../` 路径。

## 验证

```bash
npm run verify
```

功能边界与验收记录见 `docs/`。本项目无真实后端、微信登录、数据库、支付、物流或图片上传服务；后台演示更改保存在浏览器 LocalStorage。
