# Backend Case

NestJS ile JWT kimlik doğrulama ve kullanıcı bazlı JPEG medya erişimi örneği.

## Kurulum

Node.js ve pnpm kurulu olmalı. `pnpm install` çalıştırın, `.env.example` dosyasını `.env` olarak kopyalayıp değerleri doldurun ve `pnpm start:dev` ile başlatın. `MONGO_URI` için erişebildiğiniz MongoDB Atlas bağlantı dizesini ve `backend_case` veritabanını kullanın. İki JWT sırrı farklı ve en az 32 karakter olmalı. `UPLOAD_DIR` uygulamanın yazabildiği bir klasör olmalı. JWT süreleri **milisaniye** cinsindendir: örnekte erişim 15 dakika, yenileme 7 gündür. `MAX_FILE_SIZE` bayt cinsindendir. Uygulama açılışta gerekli ortam değerlerini doğrular.

API ve istek şemaları: `http://localhost:3000/docs`. Sağlık kontrolü: `GET /health`.

## Kısa deneme

```bash
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"owner@example.com","password":"Password123!"}'

curl -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"owner@example.com","password":"Password123!"}'
```

Kayıt yalnız parola hash'i çıkarılmış kullanıcıyı döndürür; giriş ayrı `/auth/login` isteğidir. Giriş yanıtındaki `accessToken` değerini medya isteklerinde `Authorization: Bearer <accessToken>` başlığında gönderin. Erişim için `Authentication` cookie'si tek başına kabul edilmez. `Refresh` cookie'si yalnız `/auth/refresh` için kullanılır:

```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/refresh
curl -H 'Authorization: Bearer <accessToken>' \
  -F 'file=@sample.jpg;type=image/jpeg' \
  http://localhost:3000/media/upload
```

Yükleme yanıtındaki medya `_id` değeriyle `GET /media/:id`, `GET /media/:id/download`, `GET /media/:id/permissions`, `POST /media/:id/permissions` ve `DELETE /media/:id` uçlarını deneyin. İzin ekleme örneği: `{ "userId": "<MongoDB ObjectId>", "action": "add" }`; kaldırmak için `remove`. Yalnız sahip izinleri yönetebilir ve medyayı silebilir. İzin verilen kullanıcı medyayı görüntüleyip indirebilir. Yükleme tek JPEG dosyası ve `MAX_FILE_SIZE` sınırı ile sınırlıdır.

`pnpm test` birim testlerini, `pnpm test:e2e` HTTP controller/guard testlerini çalıştırır. HTTP testleri kullanıcı ve medya depolamasını bellekte taklit eder; Atlas veya gerçek dosya sistemiyle entegrasyon testi değildir. `pnpm lint` ve `pnpm build` ek kontrollerdir.
