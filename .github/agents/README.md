# Agent Configuration for prime-factorization-game

このディレクトリには、GitHub Copilot エージェントが効率的に作業するためのカスタムインストラクションが含まれています。

## ファイル一覧

### 1. version-manager.md
**目的**: セマンティックバージョニングとGitタグ管理の自動化

**使用タイミング**:
- 各PRでバージョンを更新する時
- 新機能追加、バグ修正、破壊的変更の判断時
- Gitタグの作成時

**主な内容**:
- セマンティックバージョニングのルール (MAJOR.MINOR.PATCH)
- バージョンインクリメントのガイドライン
- PRごとのワークフロー
- Gitタグの作成コマンド

### 2. development-guide.md
**目的**: 開発ワークフローとベストプラクティスの統一

**使用タイミング**:
- 新しいissueに取り組む時
- コードレビュー時
- 開発標準を確認する時

**主な内容**:
- プロジェクト構造の説明
- 開発前の準備手順
- コーディングパターンとガイドライン
- テスト・ビルド手順
- PRのベストプラクティス

## 使い方

### エージェントとして作業する場合

1. **Issue を受け取る**
   - Issue の内容を理解する
   - 関連するファイルを特定する

2. **適切なガイドを参照**
   - バージョン管理が必要な場合: `version-manager.md` を確認
   - 開発全般: `development-guide.md` を確認

3. **変更を実装**
   - ガイドラインに従ってコードを修正
   - 最小限の変更に留める
   - 既存の機能を壊さない

4. **バージョン更新**
   - `version-manager.md` のルールに従って `package.json` を更新
   - 変更内容に応じて適切なバージョンコンポーネントをインクリメント

5. **PR を作成**
   - 変更内容を明確に説明
   - バージョン番号を含める
   - スクリーンショットを添付（UI変更の場合）

6. **マージ後**
   - Gitタグを作成（`vX.Y.Z` 形式）
   - タグをプッシュ

## バージョン管理の例

```bash
# 現在のバージョン確認
cat package.json | grep version

# バージョン更新（手動またはnpmコマンド）
npm version patch  # バグ修正
npm version minor  # 新機能
npm version major  # 破壊的変更

# タグ作成とプッシュ（マージ後）
git tag -a v1.0.1 -m "Fix tile animation bugs"
git push origin v1.0.1
```

## 継続的改善

このディレクトリのドキュメントは以下の場合に更新してください：

- 新しい開発パターンが確立された時
- バージョニングルールに例外が必要になった時
- ビルド・デプロイプロセスが変更された時
- 新しいツールやライブラリが追加された時

## 参考リンク

- [Semantic Versioning 2.0.0](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
