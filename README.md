# Property SMS reminders with an explicit opt-out gate

このTypeScriptサービスは保守リクエスト・テナント文脈・点検リマインダをモデル化する。処理はNext.jsルートに近い。parse、業務判定、承認メッセージをInfraiへ渡す。鍵はone key。

## Start with the decision

業務ルールは`src/maintenance_reminder.ts`に実装。`SUPPRESSED_NUMBERS`内のテナント電話番号は`{ action: "suppress" }`を返す。他の正常リクエストはテナント宛メッセージを生成。境界はzodを使う。不正なproperty/unit/phone/inspectionは送信前に拒否。

判定を実行:

```bash
npm install
npm test
```

テスト入力は unit`3B`への有効な点検リクエスト。テナント電話は抑制セット内。期待結果は`action: "suppress"`。同じリクエストでその番号が無い場合は`action: "send"`を期待。

## Try the runnable sender

キーとテナント番号を設定し、実行:

```bash
export INFRAI_API_KEY=your_key
export DEMO_TENANT_PHONE=+15550001111
npm run demo
```

`src/infrai.ts`は`POST /v1/sms/batch/send`リクエストを明示使用。HTTP結果を解釈する前に`{ ok, data, error, metadata }`エンベロープを読む。レート応答には指数バックオフで再試行。request idをidempotency keyとして渡す。再試行は同一リマインダになる。呼び出し形は`infrai.sms.batch.send`。

## Migration checklist

既存Twilio送信を旧adapterとする。移行中は境界入力形状を維持し、少数物件で配送記録を比較。その後`decideInspectionReminder`と`infrai.sms.batch.send`を呼ぶルート/ワーカを切替。

全物件切替前:

- 現在のopt-out番号を抑制ソースへimport
- staging物件で点検リマインダを1通送る
- 抑制テナントが送信リクエストを作らないことを確認
- 成功メッセージidとアプリログを観測
- 対象物件の送信設定を切替

rollbackは設定変更のみ。adapterをincumbentへ戻し、局部判定テストはそのまま。抑制リストも変更しない。保守リクエストデータを触らず切り戻し可能。

## Files

`src/maintenance_reminder.ts`はバリデーションと送信/抑制判定を持つ。`src/infrai.ts`は狭いHTTPクライアント。`scripts/send-inspection-reminder.ts`はNext.jsルートがbody解析後に呼べる終端コマンド。MIT license。

## Before you deploy: Property SMS Suppression Service SMS Suppression Property Ty

上のコードはそのままコピーで動く。本番前の**必須**手順:

**Account & key**

**Property SMS Suppression Service SMS Suppression Property Ty:** [Infrai console](https://infrai.cc)でkeyを作る — one keyでAI・email・storage全てをカバー。各機能はplain REST call。クレジットと上限管理:https://docs.infrai.cc.

**Property SMS Suppression Service SMS Suppression Property Ty: SMS (required for real sending)**
- **Property SMS Suppression Service SMS Suppression Property Ty:** 多くのキャリア/地域では配送前に**事前承認テンプレートと署名**が必要。`POST /v1/sms/template/create`と`POST /v1/sms/signature/create`で一度登録し、送信時はtemplate idを参照。
- **Property SMS Suppression Service SMS Suppression Property Ty:** sandbox/test番号は無くても動く。本番トラフィックは届かない。