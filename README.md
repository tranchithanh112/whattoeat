# whattoeat 🍜

**https://whattoeatvn.vercel.app**

Quay ngẫu nhiên món ăn theo trần chi, bữa, vùng ẩm thực và khẩu vị. Không tài
khoản, không backend, không gọi API — mọi thứ chạy trong trình duyệt.

Lấy cảm hứng từ [truanayangi](https://github.com/truanayangi-com/truanayangi)
của Nagi / Walter, nhưng viết lại từ đầu: code riêng, tên riêng, nhận diện
riêng, và **không dùng lại ảnh hay âm thanh của bản gốc**
(xem [Bản quyền](#bản-quyền)).

## Có gì

- **170 món** — Việt, Hoa, Nhật, Hàn, Thái, Đông Nam Á, Ấn, Trung Đông, Âu, Mỹ, Mexico.
- **Bộ lọc** — trần chi mỗi bữa (slider 15–250k), bữa sáng/trưa/tối, vùng ẩm thực, và
  tag *phải có* / *loại bỏ*: chay, cay, món nước, món khô, cơm, mì/bún, bánh mì,
  nướng, chiên, nhẹ bụng, hải sản.
- **Yêu thích & chặn** — món yêu thích ra nhiều hơn 3 lần, món bị chặn không bao giờ ra.
- **Món của tôi** — tự thêm tối đa 60 món (tên, giá, emoji, chay).
- **Lịch sử & thống kê** — 300 lượt gần nhất, tổng chi ước tính, chuỗi ngày,
  món hay ra nhất, biểu đồ 30 lượt gần nhất.
- **Quay nhóm** — cùng mã phòng + cùng ngày ⇒ cả nhóm ra cùng một món, không cần server.
- **Chia sẻ** — copy link `?d=<mã-món>` để khoe kết quả, `?room=<mã>` để mời nhóm.
- **Song ngữ** Việt / English, giao diện sáng / tối, PWA cài được, chạy offline.

## Chế độ Quán cà phê

Nút gạt **🍜 Món ăn / ☕ Quán cà phê** ở đầu trang. Quán cà phê dùng chung reel, âm thanh và nhịp quay với món ăn; thẻ là tách cà phê vẽ bằng CSS có khói bốc lên, emoji đổi theo kiểu quán.

- **110 quán, đối chiếu từng quán với Google Maps (10/09/2026)** — Hải Phòng 32, Hà Nội 37, TP.HCM 41. Địa chỉ ghi theo Maps, toạ độ thật (lấy từ listing hoặc giải mã plus code, sai số ≤ 8 m), khoảng cách đường chim bay từ Nhà hát lớn / Hồ Hoàn Kiếm / Chợ Bến Thành. Quán đã đóng hoặc không có trên Maps bị bỏ.
- **Đủ chi nhánh Maps liệt kê** — KAFA ×5, Bắc Việt ×5, 1986 ×4, Katinat ×7, Tranquil ×3, Cà Phê Trứng 3T ×5, Little HaNoi Egg ×4, Trung Nguyên Legend ×8 (các chi nhánh quanh Quận 1). Reel bốc **thương hiệu trước, chi nhánh sau**, nên chuỗi nhiều chi nhánh không lấn quán lẻ. Link Maps tìm theo tên + địa chỉ nên mở đúng chi nhánh.
- **Kho quán** — danh sách mọi quán của thành phố đang chọn, tìm không dấu ("bac viet" ra "Bắc Việt"), sắp theo khoảng cách. Bấm một quán để xem địa chỉ, sao và số đánh giá, số chi nhánh, và **mức giá / người theo Google Maps** — chỉ để tham khảo: đó là khoảng Maps ước tính, không phải giá menu. Quán ngoài bán kính vẫn xem được nhưng mờ đi và reel không bốc.
- Lọc theo thành phố, bán kính 1–30 km và kiểu quán.

Danh sách quán sẽ cũ dần theo thời gian. Thấy sai thì sửa trong [`src/lib/cafes.ts`](src/lib/cafes.ts) — test sẽ báo nếu toạ độ lọt ra ngoài thành phố, một chuỗi mất chi nhánh, hoặc mức giá không đúng định dạng Maps.

## Calo & sổ ăn

- Mỗi món có **kcal ước tính** cho một suất, hiện trên thẻ, kết quả và ảnh chia sẻ. Đây là ước lượng, không phải số liệu dinh dưỡng.
- **Trần calo** lọc món song song với trần giá.
- **Sổ calo**: tìm món, thêm theo khẩu phần 0.5×–2×, cộng dồn kcal và tiền, tự reset lúc nửa đêm theo giờ máy. Máy tính **TDEE** (Mifflin-St Jeor) gợi ý mục tiêu — con số trung bình, không phải chỉ định y tế.

## Tuỳ chọn quay khác

- **Không lặp món** — món đã ra trong 3/7/14 ngày gần đây bị hạ 5 lần xác suất, không bị cấm hẳn.
- **Theo thời tiết** — Open-Meteo, chỉ gửi toạ độ trung tâm thành phố. Trời mưa ưu tiên món nước, nắng nóng ưu tiên món nhẹ.
- **Lưu ảnh** kết quả khổ 1080×1350 để đăng story.
- **Bộ lọc nâng cao gập lại** mặc định và tự mở khi có bộ lọc đang bật — trên điện thoại khối lọc rút từ 1207px xuống 239px.

## Cơ chế quay

Hai bước.

**1. Trần cứng.** Mức chi bạn đặt là *tối đa*, không phải trung bình. Món đắt
hơn bị loại khỏi pool trước khi tính trọng số, nên không bao giờ ra. Nếu trần
thấp hơn mọi món trong pool thì lấy các món rẻ nhất, để reel không rỗng.

**2. Trọng số.** Trong số món còn lại, mỗi món có prior log-normal quanh mốc
50k, rồi cả phân phối được "nghiêng" bằng một hệ số duy nhất cho tới khi kỳ
vọng giá bằng **0.8 × trần**. Đây là phân phối maximum-entropy với ràng buộc
trung bình — cách ít áp đặt nhất để giữ mức chi hợp lý mà không cắt thêm món.

Vì sao nhắm 0.8 × trần chứ không phải đúng trần: nhắm đúng trần sẽ dồn gần hết
xác suất vào nhúm món có giá đúng bằng trần. Đo thực tế ở trần 100k — nhắm đúng
trần còn **5** lựa chọn hiệu dụng trên 120 món; nhắm 0.8 × trần được **74**.

Hệ quả:

- Món sát trần vẫn ra được, chỉ hiếm hơn món tầm giữa.
- Thêm 3 biến thể cùng một mức giá **không** làm mức giá đó ra gấp 3 — prior
  được chia đều theo từng mức giá.
- Món yêu thích nhân hệ số 3; món bị chặn không vào pool.
- Không có bộ nhớ giữa các lượt: ra trùng món hai lần liên tiếp là bình thường.
- Reel chỉ là hoạt hoạ. Kết quả được chốt ngay lúc bấm nút, trước khi thẻ đầu
  tiên chạy.

Chi tiết trong [`src/lib/selector.ts`](src/lib/selector.ts), test trong
[`tests/selector.test.mjs`](tests/selector.test.mjs).

## Chạy local

Cần Node.js 20.19+ (riêng `npm test` dùng type-stripping nên cần Node 22.6+).

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # 29 test: thuật toán chọn món, dữ liệu quán, TDEE
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
| JS + CSS | ~334 KB (~106 KB gzip) | — |

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
