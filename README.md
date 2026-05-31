# TasteLens MVP

一个“拍照预测食物味道”的前端 MVP。当前版本用本地视觉线索和示例数据模拟 AI 分析流程，适合验证产品体验；后续可以把 `buildReport` 替换为真实视觉模型接口。

## 运行

```bash
npm install
npm run dev
```

网页端预览地址：

- 本机浏览器：http://localhost:5177/
- 手机同 Wi-Fi 预览：使用电脑当前局域网 IP，例如 `http://10.x.x.x:5177/`

生产构建预览：

```bash
npm run build
npm run preview
```

构建后的预览地址是：http://localhost:4177/

## GitHub Pages 部署

推送到 GitHub 后，仓库会通过 `.github/workflows/deploy.yml` 自动构建并发布 `dist`。

```bash
npm run build
git push origin main
```

## MVP 范围

- 上传或选择示例食物图片
- 生成味道维度、口感标签、香气标签和喜欢概率
- 根据个人口味偏好调整推荐结果
- 收集简单反馈

当前结果是视觉推测，不用于判断食品安全、过敏原或真实调味比例。
