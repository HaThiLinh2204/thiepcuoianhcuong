# Thiệp Cưới Online — Nguyễn Cường & Thu Hương

Thiệp cưới online tĩnh (HTML/CSS/JS thuần, không cần build tool) gồm:

- Trang bìa mở thiệp (chạm để mở, tự bật nhạc nền)
- Thiệp mời tiệc chung vui (giờ / ngày / địa chỉ nhà trai)
- Thông tin cô dâu / chú rể (minh hoạ anime)
- Đếm ngược ngày cưới
- Lịch trình hôn lễ (timeline)
- Album ảnh thật
- Bản đồ chỉ đường nhà trai (nhúng Google Maps)
- Mã QR mừng cưới
- Sổ lời chúc (lưu trên trình duyệt người xem, không cần server)
- Responsive cho điện thoại

## Cấu trúc thư mục

```
thiepcuoi/
├── index.html
├── README.md
└── assets/
    ├── css/style.css
    ├── js/script.js
    ├── audio/  (nhạc nền)
    └── img/    (ảnh cưới, ảnh anime, ảnh QR)
```

Nhạc nền: *Canon in D* (Pachelbel), trình bày bởi Mathsci — giấy phép CC BY 4.0
(nguồn: Wikimedia Commons). Nếu đổi nhạc khác, nhớ giữ đúng giấy phép và cập
nhật dòng credit ở cuối trang.

## Chạy thử ở máy local

Chỉ cần mở trực tiếp file `index.html` bằng trình duyệt, hoặc chạy một server tĩnh đơn giản:

```bash
# Python
python -m http.server 8000

# hoặc Node
npx serve .
```

Sau đó truy cập http://localhost:8000

## Deploy lên GitHub Pages

1. Tạo repository mới trên GitHub (ví dụ `thiep-cuoi`).
2. Khởi tạo git và đẩy code lên (nếu chưa làm):

   ```bash
   git init
   git add .
   git commit -m "Thiệp cưới online Cường & Hương"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```

3. Vào repo trên GitHub → **Settings → Pages**.
4. Ở mục **Build and deployment**, chọn **Source: Deploy from a branch**.
5. Chọn **Branch: main**, thư mục **/ (root)** → **Save**.
6. Sau 1–2 phút, trang sẽ có tại:
   `https://<username>.github.io/<repo>/`

## Tuỳ chỉnh nội dung

- Đổi ảnh: thay file trong `assets/img/` (giữ nguyên tên hoặc sửa lại đường dẫn `src` trong `index.html`).
- Đổi ngày giờ đếm ngược: sửa biến `WEDDING_DATE` trong `assets/js/script.js`.
- Đổi thông tin ngân hàng/QR: sửa phần `<section class="gift-section">` trong `index.html`.
- Đổi địa chỉ bản đồ: sửa `src` của thẻ `<iframe>` (toạ độ `lat,lng`) và link "Mở Google Maps" trong `index.html`.
- Đổi nhạc nền: thay file `assets/audio/bg-music.mp3` (giữ nguyên tên hoặc sửa `src` của thẻ `<audio>`).
