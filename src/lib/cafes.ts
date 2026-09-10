// Cafés for the café picker, one row per branch.
//
// Every row was checked against Google Maps on 2026-09-10, one place at a
// time: open on that date, the address as Maps writes it, real coordinates
// (from the Maps listing or the place's plus code), and the star rating,
// review count and price range Maps shows. Wards follow the names Maps now
// writes, which is why some read "Gia Viên", "Cửa Nam" or "Sài Gòn" rather
// than an older district.
//
// What the check changed, against the lists first compiled from review sites:
//   Hải Phòng  24 → 32. 9 were not on Maps, 4 had closed, several had the
//              wrong address or name.
//   Hà Nội     26 → 37. Aerie (temporarily closed), Hanoi Moment, Mơ Cà Phê
//              and Nhà Trong Ngõ (permanently closed), Quán Lãng and Uptown
//              Terrace (not on Maps; 11 Nguyễn Đình Thi is now a Katinat),
//              Rani Kissaten and Hanoi Roastery (the addresses are now a bar
//              and a restaurant) were dropped.
//   TP.HCM     26 → 41. Lang Thang Rooftop (permanently closed), Allure and
//              Cafe Trầm (not found at the reviewed address) were dropped.
// In all three cities, chains list every branch Maps returns. Trung Nguyên
// Legend has far more branches than that city-wide; only the ones Maps
// returns around Quận 1 are listed.
//
// Branches of one chain share an id prefix before "--" (kafa--ho-sen). The
// reel draws a brand first and a branch second, so a chain with eight
// branches is not eight times as likely as a one-off café.
//
// Vibe tags come from those reviews, and only for brands they described.
// Cafés added during verification get no tags rather than invented ones,
// unless the vibe is in the café's own name (Aries Rooftop, Méo Meo Cat Cafe).
//
// Bars and nightlife venues were left out: the ask was cafés.

export type City = 'hp' | 'hn' | 'hcm';
export type CafeTag =
  | 'view' | 'work' | 'garden' | 'rooftop' | 'vintage'
  | 'book' | 'chain' | 'quiet' | 'late' | 'pet' | 'photo';

export type Cafe = {
  id: string;
  name: string;
  city: City;
  area: string;
  address: string;
  tags: CafeTag[];
  /** Straight-line distance from the city centre, km, one decimal. */
  km: number;
  coords: [lat: number, lng: number];
  /** Google Maps star rating and review count. */
  rating?: number;
  reviews?: number;
  /** Maps' per-person price bucket, verbatim: "₫1–100,000", "₫100–200K". */
  price?: string;
};

export const CITY_LABEL: Record<City, string> = {
  hp: 'Hải Phòng',
  hn: 'Hà Nội',
  hcm: 'TP.HCM',
};

/** The point the radius is measured from, shown in the UI. */
export const CITY_CENTRE: Record<City, string> = {
  hp: 'Nhà hát lớn',
  hn: 'Hồ Hoàn Kiếm',
  hcm: 'Chợ Bến Thành',
};

// Hải Phòng Opera House (plus code VM4J+WP), Turtle Tower in Hoàn Kiếm Lake
// (2VH2+4WJ), Bến Thành Market (QMFX+26).
const CENTRE_POINT: Record<City, [number, number]> = {
  hp: [20.85731, 106.68181],
  hn: [21.02784, 105.85227],
  hcm: [10.77256, 106.69806],
};

function kmBetween([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

type Row = [
  id: string,
  name: string,
  city: City,
  area: string,
  address: string,
  tags: string,
  lat: number,
  lng: number,
  rating?: number,
  reviews?: number,
  price?: string,
];

const rows: Row[] = [
  // ---------- Hải Phòng ----------
  ['1986--dinh-tien-hoang', '1986 Cafe & Stay', 'hp', 'Hồng Bàng', '33 P. Đinh Tiên Hoàng', 'chain photo view', 20.86094, 106.6824, 4.2, 963],
  ['1986--quang-trung', '1986 Café & Bakes', 'hp', 'Hồng Bàng', '11 P. Quang Trung (góc Phan Bội Châu)', 'chain photo', 20.85734, 106.68096, 4.4, 175, '₫1–100,000'],
  ['1986--ho-xuan-huong', '1986 Cafe & Bakes', 'hp', 'Hồng Bàng', '20 P. Hồ Xuân Hương', 'chain photo', 20.86279, 106.68423, 4.3, 257],
  ['1986--tran-phu', '1986 Cafe & Stay', 'hp', 'Ngô Quyền', '1A P. Trần Phú', 'chain photo', 20.86458, 106.68919, 4.1, 53, '₫1–100,000'],

  ['kafa--dien-bien-phu', 'KAFA Café', 'hp', 'Hồng Bàng', '27c P. Điện Biên Phủ', 'chain', 20.86133, 106.68665, 3.8, 265, '₫1–100,000'],
  ['kafa--ho-sen', 'KAFA Café', 'hp', 'Lê Chân', '126 P. Hồ Sen', 'chain', 20.84399, 106.68183, 4.1, 101, '₫1–100,000'],
  ['kafa--hai-ba-trung', 'KAFA Café', 'hp', 'Lê Chân', '17 P. Hai Bà Trưng', 'chain', 20.85343, 106.68316, 4.1, 35, '₫1–100,000'],
  ['kafa--le-hong-phong', 'KAFA Café', 'hp', 'Gia Viên', 'Lô 22B Đ. Lê Hồng Phong', 'chain', 20.84828, 106.7057, 4.5, 82, '₫1–100,000'],
  ['kafa--lach-tray', 'KAFA Café', 'hp', 'Gia Viên', '243A Lạch Tray', 'chain', 20.83301, 106.6978, 3.9, 47, '₫1–100,000'],

  ['bac-viet--tran-hung-dao', 'Cà phê Bắc Việt', 'hp', 'Hồng Bàng', '4a P. Trần Hưng Đạo', 'vintage', 20.8602, 106.68708, 4.6, 843, '₫1–100,000'],
  ['bac-viet--ha-ly', 'Cafe Bắc Việt', 'hp', 'Hồng Bàng', '39c P. Hạ Lý', 'vintage', 20.86039, 106.67844, 4.9, 234, '₫1–100,000'],
  ['bac-viet--lach-tray', 'Bắc Việt coffee', 'hp', 'Gia Viên', '215 Lạch Tray', 'vintage', 20.83826, 106.69538, 4.5, 374, '₫1–100,000'],
  ['bac-viet--aeon', 'Bắc Việt Coffee', 'hp', 'An Biên', 'T1-40, tầng 1 Aeon Mall', 'vintage', 20.8321, 106.68302, 4.3, 243, '₫1–100,000'],
  // Maps gives this branch only a plus code, no street address or ward.
  ['bac-viet--vj5r', 'Cafe Bắc Việt coffee', 'hp', 'Hải Phòng', 'Plus code VJ5R+9J3', 'vintage', 20.85835, 106.64156, 4.7, 195, '₫1–100,000'],

  ['cong-van-cao', 'Cộng Cà Phê', 'hp', 'Gia Viên', '178 P. Văn Cao', 'chain vintage', 20.83568, 106.70113, 4.9, 197, '₫1–100,000'],
  ['tch-tran-phu', 'The Coffee House', 'hp', 'Gia Viên', '15 P. Trần Phú', 'chain work', 20.85909, 106.68747, 4.3, 428, '₫1–100,000'],

  ['caro-coffee', 'Caro Coffee', 'hp', 'Gia Viên', '139 P. Lê Lợi', 'photo', 20.85718, 106.69139, 4.3, 170, '₫1–100,000'],
  ['breathe', 'Breathe', 'hp', 'Gia Viên', '89 P. Lê Lợi', 'rooftop view', 20.85819, 106.69244, 4.7, 148, '₫1–100,000'],
  ['maple-cafe', 'Maple Cafe & Bistro', 'hp', 'Lê Chân', '38 P. Mê Linh', 'photo quiet', 20.85381, 106.68006, 4.4, 11],
  ['viviria', 'Viviria Coffee', 'hp', 'Gia Viên', 'Số 4B4 Lô 26BC, Đ. Lê Hồng Phong', 'garden photo', 20.85516, 106.69775, 4.4, 225, '₫1–100,000'],
  ['zebee-cafe', 'Zebee Cafe', 'hp', 'An Biên', 'HD96 Vinhomes Marina, Cầu Rào 2', 'quiet', 20.81964, 106.68689, 4.3, 51, '₫1–100,000'],
  ['harru-quan', 'Harru Quán', 'hp', 'Hải An', '747 Ngô Gia Tự', 'vintage photo', 20.82969, 106.71881, 5, 1],
  ['cung-tram', 'Cung Trầm Cafe', 'hp', 'Hải An', '55/135 Trung Lực', 'garden quiet', 20.83381, 106.71056, 4.5, 37, '₫1–100,000'],

  ['muse-coffee', 'Muse Coffee & Pastry', 'hp', 'Hồng Bàng', '61 P. Trần Quang Khải', '', 20.85984, 106.68007, 4.7, 543, '₫1–100,000'],
  ['tra-cuc-vang', 'Trà Cúc Vàng', 'hp', 'Hồng Bàng', '33 P. Phan Bội Châu', '', 20.85727, 106.68045, 4.2, 224, '₫1–100,000'],
  ['twinnie', 'Twinnie Coffee Lounge', 'hp', 'Hồng Bàng', '25 P. Phan Bội Châu', '', 20.85729, 106.68062, 4.4, 72, '₫1–200,000'],
  ['tree-house', 'Tree house coffee', 'hp', 'Gia Viên', '143 Đường bao quanh hồ An Biên', '', 20.8487, 106.69599, 4.6, 202, '₫1–100,000'],
  ['venus-coffee', 'Venus Coffee', 'hp', 'Gia Viên', 'Lô 6B Đ. Lê Hồng Phong', '', 20.85184, 106.70677, 4.2, 141, '₫1–100,000'],
  ['vong-coffee', 'Vòng Coffee', 'hp', 'Gia Viên', '15a Đường vòng hồ', '', 20.85124, 106.69366, 4.2, 104, '₫1–100,000'],
  ['may-tropical', 'May Tropical', 'hp', 'An Biên', 'Đối diện cổng G Aeon Mall', '', 20.83145, 106.67973, 4.4, 177, '₫1–100,000'],
  ['laban', 'Laban Cafe & Space', 'hp', 'Lê Chân', 'P. Nguyễn Tất Tố', '', 20.82974, 106.68653, 4.2, 112, '₫1–100,000'],
  ['bana-coffee', 'Ba n’a Coffee', 'hp', 'Hải An', '18 Trung Lực', '', 20.83839, 106.70954, 4.5, 86, '₫1–100,000'],

  // ---------- Hà Nội ----------
  ['mien-man', 'Miên man', 'hn', 'Hoàn Kiếm', '3 P. Ấu Triệu', 'view photo', 21.02856, 105.84844, 4, 199, '₫1–100,000'],
  ['cafe-pho-co', 'Cafe Phố Cổ', 'hn', 'Hoàn Kiếm', '11 P. Hàng Gai', 'vintage view rooftop', 21.03221, 105.85105, 4.3, 3168, '₫1–100,000'],
  ['cafe-dinh', 'Cafe Dinh', 'hn', 'Hoàn Kiếm', '13 Đinh Tiên Hoàng', 'vintage view', 21.03206, 105.85219, 4.6, 4771, '₫1–100,000'],
  ['mi-ami', 'Mi Ami Caffè & Bistro', 'hn', 'Hoàn Kiếm', '4 P. Tống Duy Tân', 'photo', 21.02969, 105.84381, 4.4, 502, '₫1–100,000'],
  ['hidden-gem', 'Hidden Gem Cafe Hanoi', 'hn', 'Hoàn Kiếm', '1 Hàng Mắm', '', 21.03369, 105.85519, 4.8, 4498, '₫1–100,000'],
  ['lermalermer', 'Lermalermer', 'hn', 'Văn Miếu - Quốc Tử Giám', '16 Ng. Yên Thế', '', 21.02866, 105.84023, 4.7, 1111, '₫1–100,000'],
  ['aries-rooftop', 'Aries Rooftop Cafe', 'hn', 'Ô Chợ Dừa', '8 P. Ô Chợ Dừa', 'rooftop', 21.01914, 105.82931, 4.2, 112, '₫1–100,000'],
  ['lofita', 'Lofita Cafe', 'hn', 'Cửa Nam', '30A Trần Hưng Đạo', 'chain', 21.02043, 105.85465, 4.5, 216, '₫1–100,000'],

  ['tranquil--nguyen-quang-bich', 'Tranquil Books & Coffee', 'hn', 'Hoàn Kiếm', '5 P. Nguyễn Quang Bích', 'book quiet work', 21.03251, 105.84565, 4.7, 2173, '₫1–100,000'],
  ['tranquil--nguyen-bieu', 'Tranquil Books & Coffee', 'hn', 'Ba Đình', '18B Nguyễn Biểu', 'book quiet work', 21.04161, 105.83998, 4.6, 949, '₫1–100,000'],
  ['tranquil--tran-hung-dao', 'Tranquil Books & Coffee', 'hn', 'Cửa Nam', '15B Trần Hưng Đạo', 'book quiet work', 21.01957, 105.85647, 4.6, 524, '₫1–100,000'],
  // Listed on Maps as just "Tranquil"; not assumed to be the same chain.
  ['tranquil-cao-ba-quat', 'Tranquil', 'hn', 'Ba Đình', '19 P. Cao Bá Quát', '', 21.03005, 105.83945, 4.5, 882, '₫1–100,000'],

  ['katinat--ly-thuong-kiet', 'Katinat Coffee', 'hn', 'Cửa Nam', '60 Lý Thường Kiệt', 'chain photo', 21.02511, 105.84496, 3.4, 618, '₫1–100,000'],
  ['katinat--pho-hue', 'KATINAT Phố Huế', 'hn', 'Hai Bà Trưng', '98 Phố Huế', 'chain photo', 21.01706, 105.85129, 3.5, 386, '₫1–100,000'],
  ['katinat--dien-bien-phu', 'KATINAT 26 Điện Biên Phủ', 'hn', 'Ba Đình', '26 Điện Biên Phủ', 'chain photo', 21.03041, 105.84154, 3.8, 100, '₫1–100,000'],
  ['katinat--phan-dinh-phung', 'Katinat Cafe', 'hn', 'Ba Đình', '18 P. Phan Đình Phùng', 'chain photo', 21.04047, 105.8438, 3.2, 689, '₫1–100,000'],
  ['katinat--nguyen-dinh-thi', 'KATINAT Nguyễn Đình Thi', 'hn', 'Tây Hồ', '11 P. Nguyễn Đình Thi', 'chain photo', 21.04198, 105.82689, 3.2, 381, '₫1–100,000'],
  ['katinat--ve-ho', 'Katinat Cafe', 'hn', 'Tây Hồ', '1 P. Vệ Hồ', 'chain photo', 21.05982, 105.80908, 3.4, 696, '₫1–100,000'],
  ['katinat--trung-hoa', 'KATINAT Trung Hòa', 'hn', 'Yên Hòa', '36 P. Trung Hòa', 'chain photo', 21.01439, 105.80204, 3, 548, '₫1–100,000'],

  ['tote--dang-thai-than', 'Cafe Tòte - Đặng Thái Thân', 'hn', 'Cửa Nam', '1A P. Đặng Thái Thân', 'photo', 21.02307, 105.85907, 4.6, 71, '₫1–100,000'],
  ['tote--van-phuc', 'Cafe Tòte - Vạn Phúc', 'hn', 'Ngọc Hà', '18 Ng. 3 P. Vạn Phúc', 'photo', 21.03422, 105.81605, 4.5, 156, '₫1–100,000'],
  ['tote--lang-ha', 'Cafe Tòte - Láng Hạ', 'hn', 'Ô Chợ Dừa', '6 Ng. 71 Láng Hạ', 'photo', 21.01824, 105.81678, 4.8, 31, '₫1–100,000'],

  ['30days--hoang-hoa-tham', '30Days Cafe - Hoàng Hoa Thám', 'hn', 'Ngọc Hà', '3 Ngách 42 Ng. 55 Đ. Hoàng Hoa Thám', 'photo work', 21.03782, 105.82646, 4.9, 1112, '₫1–100,000'],
  ['30days--lang-ha', '30Days Cafe - Láng Hạ', 'hn', 'Ba Đình', '19 Ng. 10 P. Láng Hạ', 'photo work', 21.02178, 105.8175, 4.9, 3434, '₫1–100,000'],

  ['quan-x98', 'Quận X98', 'hn', 'Đống Đa', '1 Ng. 31 P. Hoàng Cầu', 'garden photo', 21.01906, 105.82519, 4, 274, '₫1–100,000'],
  ['jidai--hoang-cau', 'JIDAI by Cerenote Hoàng Cầu', 'hn', 'Đống Đa', '3 Ng. 31 P. Hoàng Cầu', 'quiet late work', 21.01888, 105.82548, 4.8, 207, '₫1–100,000'],
  ['jidai--cau-giay', 'JIDAI by Cerenote Coffee', 'hn', 'Cầu Giấy', '20 Ng. 165 Đ. Cầu Giấy', 'quiet late work', 21.03171, 105.7975, 4.2, 555, '₫1–100,000'],
  ['day-mo-cafe', 'Đây Mơ Cafe', 'hn', 'Ô Chợ Dừa', 'Ng. 148 Mai Anh Tuấn', 'garden view', 21.01948, 105.82046, 4.6, 127, '₫1–100,000'],
  ['abc-roasters--dang-van-ngu', 'ABC Coffee Roasters', 'hn', 'Kim Liên', '91 P. Đặng Văn Ngữ', 'quiet', 21.01084, 105.83057, 4.3, 79],

  ['october-coffee', 'October Lounge, Coffee & Studio', 'hn', 'Tây Hồ', '115 P. Nguyễn Đình Thi', 'vintage view', 21.04394, 105.82119, 4.1, 230, '₫1–100,000'],
  ['bonjour--thuy-khue', 'Bonjour Cafe', 'hn', 'Tây Hồ', '129 Đ. Thụy Khuê (góc Nguyễn Đình Thi)', 'view quiet', 21.04411, 105.82071, 4.5, 908, '₫1–100,000'],
  ['bonjour--to-ngoc-van', 'Bonjour Cafe', 'hn', 'Tây Hồ', '11 Đ. Tô Ngọc Vân', 'view quiet', 21.06792, 105.82545, 4.5, 286, '₫1–100,000'],
  ['santorini-vibes', 'Santorini Vibes', 'hn', 'Tây Hồ', '181 P. Nhật Chiêu', 'photo view', 21.07206, 105.817, 4, 511, '₫1–100,000'],
  ['abc-roasters--lac-long-quan', 'ABC Coffee Roasters', 'hn', 'Tây Hồ', '612A Đ. Lạc Long Quân', 'quiet', 21.07664, 105.81507, 4.1, 435, '₫1–100,000'],
  ['abc-roasters--to-hieu', 'ABC Coffee Roasters', 'hn', 'Nghĩa Đô', '106B9 P. Tô Hiệu', 'quiet', 21.04241, 105.79577, 4.2, 168, '₫1–100,000'],
  ['hom-nao', 'hôm nào cà phê?', 'hn', 'Nghĩa Đô', '10 ngõ 82, KTT Nghĩa Tân', 'garden work', 21.04431, 105.79081, 4.5, 472, '₫1–100,000'],
  ['xi-nghiep', 'Xí Nghiệp cafe & pub', 'hn', 'Hà Đông', 'A60 TT11 Văn Quán', 'photo work', 20.97805, 105.78906, 4.9, 26],

  // ---------- TP.HCM ----------
  ['the-workshop', 'The Workshop Coffee', 'hcm', 'Sài Gòn', '27 Ngô Đức Kế', 'work quiet', 10.77344, 106.70556, 4.4, 4115, '₫100–200K'],
  ['hoff-coffee', 'Hoff Coffee Brewers', 'hcm', 'Sài Gòn', '42bis Lý Tự Trọng', '', 10.77716, 106.70015, 4.8, 357, '₫1–100,000'],
  ['the-coffee-lab', 'THE COFFEE LAB', 'hcm', 'Sài Gòn', '53A Nguyễn Du', 'work late', 10.77969, 106.70069, 4.1, 535, '₫1–100,000'],
  ['bang-khuang', 'Bâng Khuâng Café', 'hcm', 'Sài Gòn', '9 Thái Văn Lung', 'vintage quiet', 10.77869, 106.70506, 4.3, 651, '₫1–100,000'],
  ['paper-and-i', 'Paper & I', 'hcm', 'Sài Gòn', '152 Nam Kỳ Khởi Nghĩa', 'book quiet', 10.77931, 106.69556, 4.2, 682, '₫1–100,000'],
  // Maps lists it as a Vietnamese coffee house, not a cat café, so the
  // review's "pet" tag is not carried over.
  ['nha-cua-meo', 'Nhà Của Mèo - cà phê việt', 'hcm', 'Sài Gòn', '13/9 Lê Thánh Tôn', '', 10.78119, 106.70581, 4.8, 375, '₫1–100,000'],
  ['flat-white', 'Flat White Coffee', 'hcm', 'Bến Thành', '274 Lý Tự Trọng', 'quiet', 10.77169, 106.69369, 4.5, 372, '₫1–100,000'],
  ['soo-kafe', 'Soo Kafe', 'hcm', 'Bến Thành', '35 Phan Chu Trinh', 'quiet work', 10.77244, 106.69719, 4.6, 2016, '₫1–100,000'],
  ['thiba-coffee', 'ThiBa Coffee Bar', 'hcm', 'Bến Thành', 'Hẻm 68-70 Sương Nguyệt Anh', 'vintage', 10.77244, 106.68931, 4.4, 872, '₫1–100,000'],
  ['meo-meo-q1', 'Méo Meo Cat Cafe', 'hcm', 'Bến Thành', '30 Phan Bội Châu', 'pet', 10.77297, 106.69858, 4.8, 1052],
  ['bibli-library', 'Bibli Library Café', 'hcm', 'Cầu Ông Lãnh', '42/5 Hồ Hảo Hớn', 'book work', 10.76194, 106.69231, 4.6, 599, '₫1–100,000'],

  ['trung-3t--ton-duc-thang', '3T Cà Phê Trứng', 'hcm', 'Sài Gòn', '1A Tôn Đức Thắng', 'vintage', 10.77628, 106.7066, 4.3, 1735, '₫1–100,000'],
  ['trung-3t--ngo-van-nam', '3T Egg Coffee', 'hcm', 'Sài Gòn', '2B Ngô Văn Năm', 'vintage', 10.78047, 106.70721, 4, 1349, '₫1–100,000'],
  ['trung-3t--355-hoang-sa', '3T Egg Coffee Sài Gòn', 'hcm', 'Tân Định', '355 Hoàng Sa', 'vintage', 10.79402, 106.68609, 4.4, 1807, '₫1–100,000'],
  ['trung-3t--83b-hoang-sa', 'Cà Phê Trứng 3T - 83B Hoàng Sa', 'hcm', 'Quận 1', '83B Hoàng Sa', 'vintage', 10.79246, 106.70206, 4.8, 584, '₫1–100,000'],
  ['trung-3t--trung-son', 'Cà Phê Trứng 3T - Trung Sơn', 'hcm', 'Bình Hưng', '110 Đ. số 9A, KDC Trung Sơn', 'vintage', 10.73559, 106.68932, 4.7, 717, '₫1–100,000'],

  ['little-hanoi--yersin', 'Little HaNoi Egg Coffee (Yersin)', 'hcm', 'Bến Thành', '119/5 Phạm Ngũ Lão (góc Yersin)', 'vintage', 10.7694, 106.69601, 4.8, 5598, '₫100–200K'],
  ['little-hanoi--ky-con', 'Little HaNoi Egg Coffee (Ky Con)', 'hcm', 'Bến Thành', '167 Ký Con', 'vintage', 10.76842, 106.69722, 4.8, 1400, '₫100–200K'],
  ['little-hanoi--le-lai', 'Little HaNoi Egg Coffee', 'hcm', 'Bến Thành', '212 Lê Lai', 'vintage', 10.76866, 106.69009, 4.8, 1049, '₫100–200K'],
  ['little-hanoi--dien-bien-phu', 'Little HaNoi Egg Coffee', 'hcm', 'Xuân Hòa', '258/1 Điện Biên Phủ', 'vintage', 10.77952, 106.68655, 4.8, 1704, '₫100–200K'],

  ['trung-nguyen--dong-khoi', 'Cà Phê Thế Giới Trung Nguyên Legend', 'hcm', 'Sài Gòn', '80 Đồng Khởi', 'chain', 10.7753, 106.70403, 4.7, 3837, '₫100–200K'],
  ['trung-nguyen--nguyen-du', 'Trung Nguyen Legend Coffee World', 'hcm', 'Sài Gòn', '80 Nguyễn Du', 'chain', 10.77964, 106.70042, 4.8, 979, '₫100–200K'],
  ['trung-nguyen--pasteur', 'Cà Phê Thế Giới Trung Nguyên Legend', 'hcm', 'Sài Gòn', '164 Pasteur', 'chain', 10.77767, 106.69961, 4.9, 332, '₫100–200K'],
  ['trung-nguyen--alexandre-de-rhodes', 'Trung Nguyên Legend Café', 'hcm', 'Sài Gòn', '12 Alexandre de Rhodes', 'chain', 10.7794, 106.69635, 4.3, 1592, '₫100–200K'],
  ['trung-nguyen--nam-ky-khoi-nghia', 'Trung Nguyên Legend', 'hcm', 'Sài Gòn', '110 Nam Kỳ Khởi Nghĩa', 'chain', 10.77464, 106.69968, 5, 300, '₫1–100,000'],
  ['trung-nguyen--ly-tu-trong', 'Trung Nguyên Legend Café', 'hcm', 'Bến Thành', '219 Lý Tự Trọng', 'chain', 10.77266, 106.69545, 4.2, 1323, '₫1–100,000'],
  ['trung-nguyen--bui-thi-xuan', 'Trung Nguyen Legend Café', 'hcm', 'Bến Thành', '02 Bùi Thị Xuân', 'chain', 10.77259, 106.69086, 4.3, 1947, '₫1–100,000'],
  ['trung-nguyen--tran-hung-dao', 'Trung Nguyên Legend Coffee', 'hcm', 'Cầu Ông Lãnh', '603 Trần Hưng Đạo', 'chain', 10.75639, 106.68548, 4.3, 1476, '₫1–100,000'],

  ['chieu-cafe-sach', 'Chiêu Cafe Sách', 'hcm', 'Tân Định', '377 Hoàng Sa', 'book quiet', 10.79269, 106.68681, 4, 1088, '₫1–100,000'],
  ['ngam-coffee', 'ngâm CAFE', 'hcm', 'Xuân Hòa', '193/19 Nam Kỳ Khởi Nghĩa', 'book late work', 10.78644, 106.68619, 4.5, 3585, '₫1–100,000'],
  ['nham-coffee', 'Nhâm Café', 'hcm', 'Hòa Hưng', '91/1 Hoà Hưng', 'book late work', 10.77894, 106.67481, 4.3, 3311, '₫1–100,000'],
  ['the-comma', 'The Comma', 'hcm', 'Cầu Kiệu', '21 Hoa Mai', 'quiet', 10.79716, 106.68735, 4.4, 507, '₫1–100,000'],
  ['noveri', 'noveri cafe & chanhhome.decor', 'hcm', 'Gia Định', '236/43/11 Điện Biên Phủ', 'photo quiet', 10.79744, 106.70794, 4.5, 265, '₫1–100,000'],
  ['so-far-so-good', 'So Far So Good Coffee', 'hcm', 'Bình Lợi Trung', '18 Vũ Ngọc Phan', 'vintage garden', 10.82056, 106.70731, 4.1, 588, '₫1–100,000'],
  ['on-and-on', 'On and On coffee', 'hcm', 'Bình Lợi Trung', '41F Đ. Đặng Thuỳ Trâm', 'photo', 10.82756, 106.70306, 4.1, 275, '₫1–100,000'],
  ['soco-saigon', 'Soco Saigon Coffee', 'hcm', 'Thạnh Mỹ Tây', '42/3 Đ. Ung Văn Khiêm', 'garden', 10.80831, 106.71369, 4.2, 529, '₫1–100,000'],
  ['aramour', 'Aramour Coffee Roasters', 'hcm', 'An Khánh', '7 Lê Văn Miến', 'quiet work', 10.80481, 106.73181, 4.5, 668, '₫1–100,000'],
  ['bamos-coffee', 'Bamos Coffee', 'hcm', 'An Khánh', '9/8 Đường số 10, Bình Khánh', 'garden late', 10.79594, 106.73231, 4.6, 1470, '₫1–100,000'],

  ['catfe--estella', 'CATFE Estella cat cafe', 'hcm', 'Bình Trưng', '88 Song Hành', 'pet', 10.80199, 106.74878, 4.9, 248, '₫1–100,000'],
  ['catfe--aeon-tan-phu', 'CATFE cat cafe - Aeon Tân Phú', 'hcm', 'Tân Sơn Nhì', 'Aeon Mall Tân Phú, Celadon City', 'pet', 10.80176, 106.61753, 4.8, 466, '₫1–100,000'],
  // Maps has a second, smaller listing for the same shop 50 m away (369
  // reviews); this is the main one.
  ['catfe--aeon-binh-tan', 'CATFE', 'hcm', 'An Lạc', 'Aeon Mall Bình Tân, Đ. Số 17A', 'pet', 10.74288, 106.61204, 4.8, 3003, '₫1–100,000'],
];

export const cafes: Cafe[] = rows.map(
  ([id, name, city, area, address, tags, lat, lng, rating, reviews, price]) => ({
    id,
    name,
    city,
    area,
    address,
    tags: tags ? (tags.split(' ') as CafeTag[]) : [],
    km: Math.round(kmBetween(CENTRE_POINT[city], [lat, lng]) * 10) / 10,
    coords: [lat, lng],
    rating,
    reviews,
    price,
  }),
);

export const cafeById = new Map(cafes.map((c) => [c.id, c]));

/** Branches of one chain share the id prefix before "--". */
export function brandOf(cafe: Cafe): string {
  return cafe.id.split('--')[0];
}

/**
 * One café from a pool: a brand uniformly first, then one of its branches.
 * Picking a branch directly would make every chain as many times likelier
 * as it has branches.
 */
export function pickCafe(pool: Cafe[], random: () => number = Math.random): Cafe {
  const brands = [...new Set(pool.map(brandOf))];
  const brand = brands[Math.floor(random() * brands.length)];
  const branches = pool.filter((c) => brandOf(c) === brand);
  return branches[Math.floor(random() * branches.length)];
}

// "₫1–100,000" spells out both bounds in đồng; "₫100–200K" puts the K on the
// upper bound only, meaning both are thousands; "₫200K+" is open-ended.
const PRICE = /^₫([\d.,]+)(K?)(?:[–-]([\d.,]+)(K?)|\+)$/;

/** A Maps price bucket in thousands of đồng, or null when there is none. */
export function priceBand(price: string | undefined): { lo: number; hi: number | null } | null {
  const m = price ? PRICE.exec(price) : null;
  if (!m) return null;
  const [, lo, loK, hi, hiK] = m;
  const inThousands = Boolean(loK || hiK);
  const k = (s: string) => Math.round(Number(s.replace(/[.,]/g, '')) / (inThousands ? 1 : 1000));
  return { lo: k(lo), hi: hi === undefined ? null : k(hi) };
}

/**
 * The pool a set of café filters produces. No vibe selected means any café;
 * otherwise one matching vibe is enough — requiring every selected vibe
 * empties the pool almost immediately at this catalogue size.
 */
export function filterCafes(list: Cafe[], city: City, radiusKm: number, tags: CafeTag[]): Cafe[] {
  return list.filter(
    (c) =>
      c.city === city &&
      c.km <= radiusKm &&
      (tags.length === 0 || tags.some((tag) => c.tags.includes(tag))),
  );
}

// Card art shows the most characterful vibe a café has, in this order, so a
// cat café shows a cat rather than the generic cup every chain would get.
const EMOJI_BY_VIBE: [CafeTag, string][] = [
  ['pet', '🐱'],
  ['book', '📚'],
  ['rooftop', '🏙️'],
  ['garden', '🌿'],
  ['view', '🌅'],
  ['vintage', '📻'],
  ['work', '💻'],
  ['late', '🌙'],
  ['photo', '📸'],
  ['quiet', '🍃'],
  ['chain', '🏪'],
];

export function cafeEmoji(cafe: Cafe): string {
  return EMOJI_BY_VIBE.find(([tag]) => cafe.tags.includes(tag))?.[1] ?? '☕';
}

/**
 * Searched by name AND address: for a chain such as KAFA, a name-only search
 * opens a list of every branch instead of the one the reel picked.
 */
export function mapsUrl(cafe: Cafe): string {
  const query = `${cafe.name} ${cafe.address} ${CITY_LABEL[cafe.city]}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
