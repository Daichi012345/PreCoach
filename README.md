# PreCoach

## Dockerで起動する

Docker Desktopを起動した状態で、プロジェクトのルートディレクトリから実行します。

### PostgreSQLの初回設定

初回起動前にプロジェクトルートに `.env` を作成し、以下を設定してください。`.env` はGit管理対象外です。どちらのパスワードもローカル開発用に `admin` としています。共有環境や本番環境では必ず変更してください。

```dotenv
POSTGRES_PASSWORD=admin
PRECOACH_USER_PASSWORD=admin
VITE_HOST=10.200.5.86
VITE_PORT=5173
VITE_API_BASE_URL=http://10.200.5.86:8000
CORS_ORIGINS=http://localhost:5173
```

PostgreSQLだけを起動する場合:

```powershell
docker compose up -d postgres
```

初回起動時に `precoach` データベースと `precoach_user` を作成し、`docker/postgres/init/01-create-user-and-grants.sh` の権限設定を実行します。データは `postgres_data` ボリュームに保存されます。接続情報はホスト `localhost`、ポート `5432`、データベース `precoach`、ユーザー `precoach_user` です。

バックエンド起動時に `users` と `practices` テーブルを自動作成します。新規登録・ログイン・練習履歴はPostgreSQLに保存され、フロントエンドはログイン時に取得したトークンでAPIへアクセスします。

既存の `postgres_data` ボリュームを使っている場合、`.env` の変更だけではPostgreSQL内のパスワードは変わりません。コンテナ起動後に以下を実行して管理者パスワードを合わせてください。`precoach_user` のパスワードは既存ボリュームでは初期化時の値のままです。

```powershell
docker compose exec -it postgres psql -U postgres -d precoach
```

psqlのプロンプトで実行します。

```sql
ALTER ROLE postgres WITH PASSWORD 'admin';
ALTER ROLE precoach_user WITH PASSWORD 'admin';

GRANT CONNECT ON DATABASE precoach TO precoach_user;
GRANT USAGE ON SCHEMA public TO precoach_user;
GRANT CREATE ON SCHEMA public TO precoach_user;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO precoach_user;

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO precoach_user;
```

PostgreSQLの状態を確認するには以下を実行します。

```powershell
docker compose exec postgres pg_isready -U precoach_user -d precoach
```

### アプリ全体の起動

```powershell
docker compose up --build
```

PostgreSQLは `localhost:5432` のみで待ち受け、Docker内の他サービスからは `postgres:5432` で接続できます。

起動後は以下のURLを開いてください。

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:8000

別端末からアクセスする場合は、`.env` の `CORS_ORIGINS` にフロントエンドのURLを指定してください（例: `CORS_ORIGINS=http://192.168.1.10:5173`）。

`.env` の `CORS_ORIGIN_REGEX` はLAN内のIPアドレスを初期値で許可しています。起動後、`ipconfig` で確認したPCのIPv4アドレスを使って `http://<IPv4アドレス>:5173` を開いてください。フロントエンドは開いたホストのIPアドレスを自動的にAPI接続先として使用します。

`npm run dev` を使う場合は、フロントエンドディレクトリで実行します。`.env` の `VITE_HOST`、`VITE_PORT`、`VITE_API_BASE_URL` を変更すると、待受IP・ポート・API接続先を変更できます。例:

```powershell
cd front
npm run dev
```

初回利用時はフロントエンドの「新規登録」からアカウントを作成してください。登録後にログインすると、練習履歴ページでアカウントごとのデータを確認できます。

### 同じネットワークの別端末からアクセスする

Dockerを起動しているPCのローカルIPアドレスを確認します。

```powershell
ipconfig
```

例えばローカルIPが `192.168.1.10` の場合、別端末のブラウザーから以下にアクセスします。

- フロントエンド: http://192.168.1.10:5173
- バックエンドAPI: http://192.168.1.10:8000

接続できない場合は、Windows Defender ファイアウォールでTCPポート `5173` と `8000` の受信を許可してください。また、接続する端末が同じWi-FiまたはLANに接続されていることを確認してください。

バックグラウンドで起動する場合は `-d` を付けます。

```powershell
docker compose up -d --build
```

コンテナの状態やログを確認するには、以下を実行します。

```powershell
docker compose ps
docker compose logs -f
```

停止する場合は以下を実行します。

```powershell
docker compose down
```

ソースコードはコンテナにマウントされているため、開発中の変更はフロントエンド・バックエンドの自動リロードに反映されます。