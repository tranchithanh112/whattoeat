# Trưa nay ăn gì 🍜

Quay ngẫu nhiên món ăn theo mức chi, bữa, vùng ẩm thực và khẩu vị. Không tài
khoản, không backend, không gọi API — mọi thứ chạy trong trình duyệt.

Lấy cảm hứng từ [truanayangi](https://github.com/truanayangi-com/truanayangi)
của Nagi / Walter, nhưng viết lại từ đầu: code riêng, nhận diện riêng, và
**không dùng lại ảnh hay âm thanh của bản gốc** (xem [Bản quyền](#bản-quyền)).

## Có gì

- **170 món** — Việt, Hoa, Nhật, Hàn, Thái, Đông Nam Á, Ấn, Trung Đông, Âu, Mỹ, Mexico.
- **Bộ lọc** — mức chi (slider 15–250k), bữa sáng/trưa/tối, vùng ẩm thực, và
  tag *phải có* / *loại bỏ*: chay, cay, món nước, món khô, cơm, mì/bún, bánh mì,
  nướng, chiên, nhẹ bụng, hải sản.
- **Yêu thích & chặn** — món yêu thích ra nhiều hơn 3 lần, món bị chặn không bao giờ ra.
- **Món của tôi** — tự thêm tối đa 60 món (tên, giá, emoji, chay).
- **Lịch sử & thống kê** — 300 lượt gần nhất, tổng chi ước tính, chuỗi ngày,
  món hay ra nhất, biểu đồ 30 lượt gần nhất.
- **Quay nhóm** — cùng mã phòng + cùng ngày ⇒ cả nhóm ra cùng một món, không cần server.
- **Chia sẻ** — copy link `?d=<mã-món>` để khoe kết quả, `?room=<mã>` để mời nhóm.
- **Song ngữ** Việt / English, giao diện sáng / tối, PWA cài được, chạy offline.

## Cơ chế quay

Không phải random đều. Mỗi món có prior log-normal quanh mốc 50k, rồi cả phân
phối được "nghiêng" bằng một hệ số duy nhất cho tới khi **kỳ vọng giá đúng bằng
mức chi bạn chọn**. Đây là phân phối maximum-entropy với ràng buộc trung bình —
cách ít áp đặt nhất để trúng mức chi mà không phải cắt cứng danh sách món.

Hệ quả:

- Món xa mức chi vẫn có thể ra, chỉ hiếm hơn.
- Thêm 3 biến thể cùng một mức giá **không** làm mức giá đó ra gấp 3 — prior
  được chia đều theo từng mức giá.
- Món yêu thích nhân hệ số 3; món bị chặn không vào pool.

Chi tiết trong [`src/lib/selector.ts`](src/lib/selector.ts), test trong
[`tests/selector.test.mjs`](tests/selector.test.mjs).

## Chạy local

Cần Node.js 20.19+ (riêng `npm test` dùng type-stripping nên cần Node 22.6+).

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # 9 test cho thuật toán chọn món
npm run typecheck
npm run build      # ra dist/
npm run preview
```

## Deploy

Static build, deploy thẳng lên Vercel:

```sh
npx vercel login
npx vercel --prod
```

`vercel.json` đã cấu hình sẵn security headers (CSP, nosniff, frame-deny) và
cache 1 năm cho `/assets/*`.

## Dữ liệu lưu ở đâu

`localStorage`, không cookie, không gửi đi đâu cả:

| Key | Nội dung |
| --- | --- |
| `tnag.v2.prefs` | ngôn ngữ, theme, âm thanh, mức chi, bộ lọc |
| `tnag.v2.pool` | yêu thích, món bị chặn, món tự thêm |
| `tnag.v2.history` | tối đa 300 lượt `{id, at, price}`, `at` là epoch ms |

Mọi giá trị đọc lên đều được validate — dữ liệu bị sửa tay hay hỏng cũng không
làm app crash. Nếu trình duyệt chặn lưu trữ, app vẫn chạy và báo rằng lựa chọn
chỉ giữ trong phiên đó.

## Kích thước

| | Bản này | Bản gốc |
| --- | --- | --- |
| Ảnh món | 0 (CSS + emoji) | ~3.7 MB WebP atlas |
| Âm thanh | 0 (Web Audio synth) | ~5 MB WAV/MP3 |
| JS + CSS | ~285 KB (~90 KB gzip) | — |

Âm thanh được **tổng hợp** bằng Web Audio API (oscillator + noise buffer) chứ
không phát file: tick khi thẻ chạy qua vạch, whoosh khi bắt đầu, hợp âm rải khi
ra kết quả — món càng hiếm thì hợp âm càng dài và sáng hơn.

Ảnh món là **đĩa vẽ bằng CSS**: màu lấy từ hash id của món, cộng emoji. Nhờ vậy
món bạn tự thêm cũng có hình đồng bộ, và không tốn một byte tải ảnh nào.

## Bản quyền

Repo gốc không có LICENSE, và `ATTRIBUTION.md` của họ nói rõ rằng việc công
khai source không tự động cấp quyền dùng lại asset của bên thứ ba. Vì vậy dự án
này:

- **Không** dùng lại ảnh món, logo hay branding của bản gốc.
- **Không** dùng lại âm thanh CS:GO (thuộc Valve) — thay bằng âm thanh tổng hợp.
- Không sao chép code của bản gốc; thuật toán chọn theo mức chi được viết lại
  (exponential tilting là kỹ thuật phổ biến, không phải code của họ).

Tên món ăn và giá tham khảo là dữ kiện thực tế, không phải nội dung có bản quyền.

Giá chỉ mang tính tham khảo cho một suất một người, không phải báo giá của quán.
