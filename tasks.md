# SketchLayer Tasks

## Demo and blank-board workflow

- [x] Keep AI Dashboard Feedback as the initial annotated example.
- [x] Add a document switcher that creates a clean, untitled board.
- [x] Reset background image, annotations, history, and JSON for a blank board.
- [x] Let users remove a background image independently from annotation erasing.

## Phase 4 — SketchLayer Pro 0.2

- [x] Add optional `sketchlayer/pro` and `sketchlayer/pro.css` package entries.
- [x] Add `InstructionMeta`, `TargetRef`, target resolver, and legacy `FeedbackMeta` compatibility.
- [x] Add Color Studio with React Aria controls, semantic binding, brand colors, opacity, and controlled templates.
- [x] Add Brush Studio with size, opacity, smoothing, pressure, and `perfect-freehand` outlines.
- [x] Add Problem Circle, Suggestion Arrow, and Preserve Marker AI shape presets.
- [x] Add selection-only metadata editing and Annotation Inspector save/cancel behavior.
- [x] Keep incomplete annotations visible while disabling agent export until target and note are complete.
- [ ] Validate the full 0.2 flow with at least three target users before adding 0.3 features.

## Reference-alignment UI pass

- [x] Align the desktop workspace to reference image 2 at 1487 × 1058.
- [x] Add the Acme Analytics annotation scenario and five structured feedback cards.
- [x] Align the top bar, left tool rail, central canvas, floating toolbar, and right JSON panel.
- [x] Verify Send to Agent interaction and responsive behavior at 390 × 844.
- [x] Complete the side-by-side visual review in `design-qa.md` with `final result: passed`.

更新日期：2026-08-01
目前狀態：**已正式解除封存；Phase 2 MVP 完成。**

## 使用規則

- `[x]` 已完成；`[ ]` 未開始；`[-]` 由專案擁有者明確豁免或延後；`[!]` 阻擋中。
- 2026-08-01 專案擁有者明確要求正式解除封存並直接實作 Phase 1；詳見 ADR 001。
- 原 Gate 0 的研究項目不是已完成證據，而是被明確豁免為 Phase 1 的啟動條件。
- 產品定位以「可嵌入的 AI-readable visual annotation layer」為界，不擴張成通用白板。

## Phase 0 — 專案初始化

- [x] 建立 React + TypeScript + Vite 專案骨架。
- [x] 啟用 TypeScript strict mode。
- [x] 加入 `dev`、`typecheck`、`build`、`preview` 指令。
- [x] 建立最小狀態頁，明示目前封存狀態。
- [x] 建立 `.gitignore` 與開發說明。
- [x] 採用 npm，提交 `package-lock.json` 以鎖定依賴。
- [x] 採用工作套件名 `sketchlayer`、MIT 授權與 npm metadata；公開前仍需補 repository URL。
- [x] 建立 CI：typecheck、test、build。

## Gate 0 — 解封與問題驗證（產品實作前置）

- [-] 冷卻期與憲法 §7.2 重審：由 2026-08-01 owner Go 決策明確豁免。
- [-] WIP 啟動限制：由 2026-08-01 owner Go 決策明確豁免。
- [ ] 訪談至少 3 位目標使用者，驗證「AI 生成介面 → 人工圈選／標記 → 結構化回饋給 agent」流程（保留為 discovery debt）。
- [ ] 收集至少 1 份外部行為證據，而非只有口頭興趣（保留為 discovery debt）。
- [-] 無產品程式碼 mock：因 owner 已授權直接實作 Phase 1，不再作為前置條件。
- [ ] 定義 Phase 1 實測成功門檻：完成時間、回饋正確率、agent 可解析率、再次使用意願。
- [ ] 重新比較 tldraw、Excalidraw、Fabric.js、perfect-freehand 的可嵌入性、授權、bundle size 與缺口。
- [x] Go 決策已記錄於 ADR 001；此決策只解除 Phase 1，不自動解除 Phase 2/3。

## Phase 1 — 可驗證的最小核心（Gate 0 通過後）

### 1.1 資料契約

- [x] 定義 `Point`、`Stroke`、`ShapeAnnotation`、`SemanticColorMeta` 與版本化匯出 schema。
- [x] 定義 controlled / uncontrolled state contract 與不可變 history model。
- [x] 建立 JSON round-trip 與不支援版本拒絕測試；`0.1.0` 是相容性基線。

### 1.2 Canvas 核心

- [x] 建立可縮放且支援高 DPI 的 Canvas 2D render loop。
- [x] 以 Pointer Events 支援滑鼠、觸控與壓感資料。
- [x] 實作 Pen 與 Highlighter；所有筆畫從 state 重繪。
- [x] 實作 stroke-level Undo、Redo、Clear（Clear 可復原）。
- [x] 實作物件級 Eraser；一次拖曳擦除視為單一 history commit。
- [x] 加入 ResizeObserver、pointer capture、離開畫布與 pointer cancel 處理；capture/cancel 有自動化測試。

### 1.3 語意標註

- [x] 先只實作 Product Feedback 範本：Suggestion、Problem、Approved、Highlight。
- [x] 新標註同時保存實際色值與語意 metadata。
- [x] 建立 live JSON preview，並以自動化與瀏覽器 QA 驗證映射。

### 1.4 最小介面

- [x] 首屏直接進入可畫狀態；預設 Pen、Ink、4px、100% opacity。
- [x] 建立 responsive floating toolbar，含 Pen、Highlighter、Eraser、Undo、Redo、Clear、Color、Export JSON。
- [x] 限制同時只開一個 popover；375px viewport 無 overlap、clipping 或水平溢出。
- [x] 完成 accessible names、tooltip、focus state、鍵盤操作與 canvas label。

## Phase 2 — MVP 完整範圍（Phase 1 證據達標後）

- [x] 實作 Arrow、Rectangle、Circle 的 drag-create 行為。
- [x] 實作筆刷大小與透明度控制。
- [x] 加入 Teaching 語意色彩範本。
- [x] 加入 6 組 gradient presets、套用背景與 Copy CSS。
- [x] 匯出 JSON：版本、畫布、背景、background image metadata、annotations 與語意 metadata。
- [x] 匯出固定 960×540 PNG；背景圖片、gradient、grid、筆畫與形狀共用同一渲染路徑。
- [x] 加入 background image、載入成功與可見失敗狀態。
- [x] 完成 desktop 與 375px mobile responsive QA；無 page overflow、popover clipping 或 console error。

## Phase 3 — 套件化與發布準備（MVP 通過後）

- [x] 拆出 `SketchCanvas`、`SketchToolbar`、`ColorTemplatePicker`、`GradientCreator`、`useSketchLayer` 公開 API。
- [x] 驗證最簡使用方式不超過五行，並加入完整 TypeScript types。
- [x] 設計 tree-shakable exports、CSS variables 與最小必要 CSS import。
- [x] 建立 package build、exports map、types、peer dependencies 與 35 KB bundle-size budget。
- [x] 建立 Basic、Image Annotation、Teaching、AI Feedback demos。
- [x] 撰寫安裝、受控模式、匯出與無障礙文件。
- [x] 加入單元、互動、匯出 snapshot 與 Chromium／Firefox／WebKit CI 測試。
- [!] 版本、MIT、provenance 與 supply-chain checklist 已完成；2026-08-01 registry 查無 `sketchlayer`，但 repository URL 與 npm owner 登入仍須在真正發布前確認。

## 明確不在 MVP

- Text、selection、layers、多人游標。
- Advanced shape editing、SVG export、PDF/video annotation。
- Multi-stop/radial/mesh gradient editor 與自訂範本管理器。
- AI prompt region selection、後端、帳號與驗證。
- 任何把產品擴張成 Figma、Excalidraw 或 Miro 替代品的功能。

## MVP 完成定義

- 首屏可直接繪圖，Pen、Highlighter、Eraser、Arrow、Rectangle、Circle 正常運作。
- 色彩範本會同時更新畫面色彩與 JSON 語意資料。
- Size、opacity、gradient 對新標註／背景生效。
- PNG 與 JSON 可下載，且內容可驗證、可還原或可被 agent 消費。
- Undo / Redo / Clear 行為一致；桌面與 mobile 無控制項重疊。
- 鍵盤與 touch 核心流程可用，正常操作無 console error。
- `npm run typecheck`、`npm run build` 與測試套件全數通過。
