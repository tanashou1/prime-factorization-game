# prime-factorization-game

**Play the game here: https://tanashou1.github.io/prime-factorization-game/**

nxnマスの盤面に、数字のタイルが出てきます。
数字のタイルはスライドで動かすことができます。
片方が片方の数字の約数であれば合体して、割った数になります。
約数でなければ、合体せず、手前で止まります。
1になると消えます。得点は、元の数字の積がポイントになりめす。
連鎖要素として、隣の数字が約数なら、勝手に合体します。位置は、もともと大きい方の数字の位置になります。
k回か動かすか、数字が消えたら、新しい数字タイルが出てきます。
初期配置は、m枚のタイルをランダム配置します。
出てくるタイルの数値は、pまでの複数の素数の積から、ランダムに算出します。
パラメータは、バランス調整のため、ゲーム画面で変えられるようにし、リセットボタンも配置して、リセットされたら、反映するようにします。

## 開発 (Development)

### セットアップ (Setup)
```bash
npm install
```

### 開発サーバー (Dev Server)
```bash
npm run dev
```

### ビルド (Build)
```bash
npm run build
```

### テスト (Testing)

#### ユニットテスト (Unit Tests)
```bash
npm run test        # watch mode
npm run test:run    # run once
npm run test:ui     # UI mode
```

#### E2Eテスト (E2E Tests with Playwright)
```bash
npm run test:e2e           # run E2E tests
npm run test:e2e:ui        # UI mode
npm run test:e2e:debug     # debug mode
npm run playwright:codegen # generate test code
```

## MCP (Model Context Protocol) 設定

このプロジェクトはPlaywright MCPサーバーをサポートしています。

### Claude Desktopでの使用

`claude_desktop_config.json`を参照して、Claude Desktopの設定ファイル（通常は`~/Library/Application Support/Claude/claude_desktop_config.json`）に以下のようにMCPサーバーを追加してください：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "true",
        "PLAYWRIGHT_BASE_URL": "http://localhost:5173"
      }
    }
  }
}
```

これにより、Claude DesktopからPlaywrightを使用してブラウザの自動化やE2Eテストを実行できるようになります。
