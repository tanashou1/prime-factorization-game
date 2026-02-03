# バグ修正レポート v2.1.6

## 問題の説明
「15と5が反応したあと、3になり、その後、15に戻りました。」

このバグは、タイルが正常にマージされた後（例：15÷5=3）、マージされたタイルがゲームステートから失われ、消失または元の値に戻る問題でした。

## 根本原因

Game.tsx の `moveTiles` 関数内で、以下の問題が発生していました：

1. **Line 474-485**: マージされたタイル（`isDividing` や `mergeHighlight` フラグが付いたもの）がチェーン反応処理のために `activeTiles` からフィルタリングされる
2. **Line 546**: `chainResult.tiles` を使用して最終状態を設定するが、これにはフィルタリングされたタイルが含まれていない
3. **結果**: マージされたタイルが最終的なゲームステートから失われる

### 具体例：
```
初期状態: タイル15（位置[0,1]）、タイル5（位置[0,0]）
↓ 移動
マージ: 15 ÷ 5 = 3（新しいタイルid=3、isDividing=true）
↓ チェーン反応フィルター
activeTiles = [] （タイル3はisDividing=trueなので除外される）
↓ チェーン反応処理
chainResult.tiles = [] （変更なし）
↓ 最終状態設定
finalTiles = [] （タイル3が失われる！）
```

## 修正内容

**変更ファイル**: `src/Game.tsx`
**変更行数**: 2行追加、1行変更

### 修正前：
```typescript
const activeTiles = movedTiles.filter(t => 
  t.value !== 0 && 
  !t.mergeHighlight && 
  !t.isDividing && 
  !t.isPowerEliminating
);
const chainResult = processChainReactions(activeTiles, 1, currentNextTileId);
...
let finalTiles = chainResult.tiles;
```

### 修正後：
```typescript
const activeTiles = movedTiles.filter(t => 
  t.value !== 0 && 
  !t.mergeHighlight && 
  !t.isDividing && 
  !t.isPowerEliminating
);
// フィルタリングされたマージタイルを追跡
const filteredMergedTiles = movedTiles.filter(t => 
  t.value !== 0 && 
  (t.mergeHighlight || t.isDividing || t.isPowerEliminating)
);
const chainResult = processChainReactions(activeTiles, 1, currentNextTileId);
...
// チェーン反応結果とフィルタリングされたタイルを結合
let finalTiles = [...chainResult.tiles, ...filteredMergedTiles];
```

## 修正の効果

1. **マージされたタイルが保持される**: `filteredMergedTiles` 変数で追跡し、最終状態に含める
2. **チェーン反応は正常に動作**: マージ直後のタイルはチェーン反応から除外される（意図した動作）
3. **最終状態に両方を含める**: チェーン反応の結果とフィルタリングされたマージタイルを結合

## テスト結果

- ✅ 全テスト82件合格
- ✅ リント問題なし
- ✅ ビルド成功
- ✅ セキュリティチェック: 脆弱性0件
- ✅ 新しい検証テスト追加（`bug_fix_verification.test.ts`）

## コードレビュー

コードレビュー実施済み。1件の改善提案（冗長なフィルタ削除）に対応済み。

## バージョン

- **変更前**: 2.1.5
- **変更後**: 2.1.6（パッチバージョン - バグ修正）

## 修正方針

カスタム指示に従い：
- ✅ 最小限の変更（2行のみ追加・変更）
- ✅ 既存のテストを壊さない
- ✅ シンプルで明確なコード
- ✅ 段階的に実装し検証
- ✅ 必要な処理のみを実行

---

**修正日**: 2026-02-03
**修正者**: GitHub Copilot Agent
