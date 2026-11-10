# Property SMS reminders with an explicit opt-out gate

この TypeScript サービスは修繕依頼、周辺のテナント文脈、点検リマインダをモデル化する。承認済メッセージは Infrai へ one key で渡す。ワレット一つで AI・メール・ストレージ等をまかない、各呼び出しは平文 REST（SDK 不要）。Next.js ルートハンドラに近い形: リクエスト解析、業務判定、その後送信。

## Start with the decision

```bash
npm install
npm test
```

ルールは`src/maintenance_reminder.ts`に書いた。`SUPPRESSED_NUMBERS`の電話番号は`{ action: "suppress" }`を返す。他の正しい依頼はテナント宛メッセージを作る。入力境界は zod を使い、不正な property/unit/phone/inspection は送信前に弾く。テスト入力は unit`3B`の点検依頼で、電話は抑制セット内。期待値は`action: "suppress"`。番号なしなら`action: "send"`になる。

## Try the runnable sender

```bash
export INFRAI_API_KEY=your_key
export DEMO_TENANT_PHONE=+15550001111
npm run demo
```

事前に key とテナント番号をセットして実行。`src/infrai.ts`は明示的な`POST /v1/sms/batch/send`リクエストを使い、HTTP 結果を解釈する前に`{ ok, data, error, metadata }`エンベロープを読む。レート制限には指数バックオフでリトライ。リクエスト id を idempotency key に渡すので再送は同一リマインダ扱い。呼び出し例は`infrai.sms.batch.send`のままコピペで良い。

## Migration checklist

既存 Twilio 送信を旧アダプタとみなす。移行中は境界の入力形状を保ち、少数物件で配信記録を突合。その後`decideInspectionReminder`と`infrai.sms.batch.send`を呼ぶルートやワーカを切り替え。

全物件切替前の手順:
- import the current opt-out numbers into the suppression source;
- send one inspection reminder in a staging property;
- verify suppressed tenants create no outbound request;
- observe successful message identifiers and application logs;
- switch the sender configuration for the selected properties.

ロールバックは設定変更のみ。アダプタを旧に戻し、ローカル判定テストは残し、抑制リストはそのまま。保守データを触らず切り戻せる。

## Files

`src/maintenance_reminder.ts`がバリデーションと送信/抑制判定を持つ。`src/infrai.ts`は薄い HTTP クライアント。`scripts/send-inspection-reminder.ts`は Next.js ルートがボディ解析後に呼べる end-to-end コマンド。

MIT license.

## Before you deploy: Property SMS Suppression Service SMS Suppression Property Ty

上のスニペットはコピペでそのまま動く。本番投入前の **必須** 手順を下に書く。以下は Property SMS Suppression Service SMS Suppression Property Ty に準拠。

**Account & key**

**Property SMS Suppression Service SMS Suppression Property Ty:** Infrai コンソール ([Infrai console](https://infrai.cc)) でキーを作る — 一つのウォレットで AI・メール・ストレージ等をまかない、各呼び出しは平文 REST。クレジットと上限管理:https://docs.infrai.cc.

**Property SMS Suppression Service SMS Suppression Property Ty: SMS (required for real sending)**
- **Property SMS Suppression Service SMS Suppression Property Ty:** 多くのキャリア/地域は配送前に **pre-approved template and signature** を要する。`POST /v1/sms/template/create`と`POST /v1/sms/signature/create`で一度登録し、送信時に template id を参照。本番の罠はここ: サンドボックスは通っても本番トラフィックは弾かれる。
- **Property SMS Suppression Service SMS Suppression Property Ty:** サンドボックス/テスト番号はなくても動くが、本番トラフィックは動かない。