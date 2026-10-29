# Một Ngày Làm Tổ Bồi Thường (bản 3D, chơi nhiều người)

Game trình duyệt: một ngày làm nhân viên tổ bồi thường GPMB. Kiểm đếm, xác minh, xử lý 4 loại hồ sơ
(nguồn gốc đất, lấn chiếm, đất nông nghiệp xen kẹt, tranh chấp thừa kế), né chó, né khiếu nại, né triều cường.
Có lồng tiếng tiếng Việt (giọng đọc của máy), chat và bảng xếp hạng theo xóm (tối đa 30 người/xóm).

## Chạy

**Windows:** bấm đúp `start.bat`. Lần đầu tự cài thư viện (cần Node.js 16 trở lên, tải ở nodejs.org).
**Linux/macOS:** `./start.sh` hoặc `npm install && npm start`.

Mở `http://localhost:8080`. Màn hình server in thêm địa chỉ LAN (vd `http://192.168.1.5:8080`),
điện thoại cùng wifi mở địa chỉ đó là vào chung xóm. Đổi cổng: `PORT=3000 node server.js`
(Windows: `set PORT=3000 && node server.js`).

**Chơi một mình, không cần server:** mở thẳng `public/index.html` bằng Chrome/Edge.

## Rủ bạn
Trong game bấm 🔗 để chép link dạng `...?xom=abc12`. Ai mở link đó vào đúng xóm của mình.

## Đưa lên mạng (VPS)
```
npm install --omit=dev
npx pm2 start server.js --name tobt
```
Nginx (nhớ 2 dòng Upgrade cho WebSocket):
```
location / {
  proxy_pass http://127.0.0.1:8080;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
}
```
Chỉ có thư mục `public/` mà không chạy server (hosting tĩnh) thì game vẫn chơi một mình được.

## Lồng tiếng
Dùng giọng đọc có sẵn của máy (Web Speech API), không gửi dữ liệu đi đâu.
Windows: Settings › Time & Language › Speech › thêm Tiếng Việt (giọng Microsoft An).
Android: cài Google Text-to-Speech, tải gói tiếng Việt. iOS có sẵn giọng Linh.

## Sửa nội dung
Toàn bộ hồ sơ nằm đầu file `public/game.js`:
- `CASES`: từng hộ (`kind`: `moc` | `lan` | `xenket` | `thuake`), lời khai, lời nhân chứng, hồ sơ lưu trữ.
- `DECIDE`: phương án xử lý cho lấn chiếm / xen kẹt / thừa kế (`ok` đúng, `fav` có lợi cho dân, `fb` sếp nhận xét).
- `COMPLAINTS`: thắc mắc của dân khi lấy chữ ký.
- `ROLES`: các vị trí bốc thăm.

## Cấu trúc
```
server.js            máy chủ tĩnh + WebSocket /ws (thư viện ws)
public/index.html    giao diện
public/game.js       logic game, 3D (three.js r128), lồng tiếng, client chơi nhiều người
public/vendor/       three.min.js và font Be Vietnam Pro (chạy offline)
```
Nội dung hư cấu, cách xử lý phỏng theo Luật Đất đai 2024 cho vui, không thay thẩm định thật.
