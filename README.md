# PreCoach

## Dockerで起動する

Docker Desktopを起動した状態で、プロジェクトのルートディレクトリから実行します。

```powershell
docker compose up --build
```

起動後は以下のURLを開いてください。

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:8000

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