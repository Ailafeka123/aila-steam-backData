# steam資料的更新網頁

主要用於準備另一個steam網頁展示的資料保存使用

## 使用框架

- 前端
  1. React + TypeScript + vite : 主框架
  
- 後端
  1. steamSPA : 抓取最新熱門資料，減少算力
  2. Github Acitve : 定時觸發使用
  3. vercel : 主要運行部分，減輕Github Acitve的運行消耗，且作為計時使用
  4. firebase-admin: 避免firebaseSDK的權限。


## 大致流程
- 定時更新
  1. github Active 時間觸發 呼叫vercel更新
  2. 接受到Active資訊 檢查上一次更新時間 檢查通過 進行更新。
  2. vercel 抓取steamSPA 這兩周熱門選項 然後依序去steam官方API抓取資料去更新firebase
  3. 更新最後更新時間

- 手動更新
  1. 檢查上一次更新時間 
  2. 通過 進行上面更新流程 不通過 拒絕 回傳上次更新時間 表示近期以更新 不需要更新


