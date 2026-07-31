# SketchLayer

SketchLayer 是一個輕量 React 視覺標註層，讓人類畫下回饋，同時產生可被 AI workflow 解析的結構化 JSON。它專注於嵌入式標註，不是通用白板。

目前完成 Phase 2 MVP：

- 高 DPI Canvas 2D state-backed render loop
- Pointer Events 的 Pen、Highlighter 與物件級 Eraser
- Undo、Redo、Clear（Clear 可復原）
- Product Feedback 語意色彩與 metadata
- Arrow、Rectangle、Circle drag-create
- Product Feedback 與 Teaching 語意色彩
- Brush size、opacity 與 6 組 gradient presets
- Background image、Live JSON、PNG 與 JSON 下載
- Responsive floating toolbar、鍵盤快捷鍵與 accessible labels

## 開發環境

- Node.js 20.19+ 或 22.12+
- npm 11（以 `package-lock.json` 鎖定依賴）

```bash
npm install
npm run dev
```

## 品質檢查

```bash
npm run typecheck
npm test
npm run build
```

此工作區位於 OneDrive；為避免同步程序鎖住 `dist` 時讓重複建置失敗，Vite 不會自動清空該資料夾。`dist` 不納入版本控制，CI／發布環境會從乾淨工作目錄建置。

工作範圍、決策債與後續任務請見 [`tasks.md`](./tasks.md)。正式解封決策見 [`docs/decisions/001-unarchive-phase-1.md`](./docs/decisions/001-unarchive-phase-1.md)。
