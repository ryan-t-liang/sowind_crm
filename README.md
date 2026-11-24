# Sowind 售后服务原型

本仓库包含三个纯前端、可交互的静态原型：

- `frontend/`：GP 芝柏表与 UN 雅典表用户端 H5，React + TypeScript + Vite + shadcn/ui。
- `admin/`：Sowind CRM 后台，保留会员、线索并新增售后服务模块。
- `site/`：部署后的三端入口页。
- `shared/service-model.js`：三端共用的工单、状态流转和浏览器存储模型。

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
npm run preview
# 在另一终端执行浏览器回归
npm run qa
```

功能边界与验收记录见 `docs/`。本项目无真实后端、微信登录、数据库、支付、物流或图片上传服务。三端在同一域名、同一浏览器中共用 LocalStorage，前端提交的工单可在后台处理，处理结果同步回用户端；不同浏览器或设备之间不会同步。当前流程按“先确认报价/付款，再订件或维修”推进；作品收件图片与维修完成图片在两个独立节点分别上传、保存和预览。作品认证确认卡会按 GP/UN 品牌展示对应腕表图片。

首次访问每个品牌提供一条示例预约；已有后台数据会迁移到新版存储，原存储保留。源码中的 GP/UN 品牌混用素材遵循用户对当前 Figma 稿件的明确要求。
