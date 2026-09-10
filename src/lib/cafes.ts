// Cafés for the café picker.
//
// Hải Phòng — verified against Google Maps on 2026-09-10, one place at a time.
// Every row below is open on Maps as of that date, with the address Maps
// shows and real coordinates (from the Maps listing, or from the place's plus
// code). Chains list every branch Maps returns. The earlier list, compiled
// from review sites, had 24 entries: 9 did not exist on Maps, 4 had closed,
// and several of the rest had the wrong address or name. Wards follow the
// addresses as Maps now writes them, which is why some read "Gia Viên" or
// "An Biên" rather than an older district name.
//
// Vibe tags are carried over from those reviews only for brands they
// described; cafés added during verification have no tags rather than
// invented ones, so they simply do not match a vibe filter.
//
// Hà Nội and TP.HCM — still compiled from review sites
//   (palatinostudio.com, greensm.com, noithatanthinhphat.vn), with distance
//   estimated per district. They have not been checked against Maps.
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
  /** Real distance from the city centre when coordinates are known,
   *  otherwise the per-district estimate from AREA_KM. */
  km: number;
  coords?: [lat: number, lng: number];
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

// Coordinates of those centres, where the city's cafés have coordinates to
// measure against. Hải Phòng Opera House, 28 Trần Hưng Đạo, from its Maps
// plus code VM4J+WP.
const CENTRE_POINT: Partial<Record<City, [number, number]>> = {
  hp: [20.85731, 106.68181],
};

// Rough straight-line distance from the centre, whole km, for cafés without
// coordinates (Hà Nội and TP.HCM only).
const AREA_KM: Record<string, number> = {
  'Hoàn Kiếm': 1, 'Ba Đình': 3, 'Đống Đa': 4, 'Tây Hồ': 5,
  'Long Biên': 5, 'Thanh Xuân': 7, 'Cầu Giấy': 7, 'Hà Đông': 12,

  'Quận 1': 1, 'Quận 3': 2, 'Quận 5': 4, 'Quận 10': 4,
  'Phú Nhuận': 5, 'Bình Thạnh': 5, 'Gò Vấp': 8, 'Thảo Điền': 8,
  'Thủ Đức': 12,
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
  lat?: number,
  lng?: number,
];

const rows: Row[] = [
  // ---------- Hải Phòng (Google Maps, 2026-09-10) ----------
  ['1986-dinh-tien-hoang', '1986 Cafe & Stay', 'hp', 'Hồng Bàng', '33 P. Đinh Tiên Hoàng', 'chain photo view', 20.86094, 106.6824],
  ['1986-quang-trung', '1986 Café & Bakes', 'hp', 'Hồng Bàng', '11 P. Quang Trung (góc Phan Bội Châu)', 'chain photo', 20.85734, 106.68096],
  ['1986-ho-xuan-huong', '1986 Cafe & Bakes', 'hp', 'Hồng Bàng', '20 P. Hồ Xuân Hương', 'chain photo', 20.86279, 106.68423],
  ['1986-tran-phu', '1986 Cafe & Stay', 'hp', 'Ngô Quyền', '1A P. Trần Phú', 'chain photo', 20.86458, 106.68919],

  ['kafa-dien-bien-phu', 'KAFA Café', 'hp', 'Hồng Bàng', '27c P. Điện Biên Phủ', 'chain', 20.86133, 106.68665],
  ['kafa-ho-sen', 'KAFA Café', 'hp', 'Lê Chân', '126 P. Hồ Sen', 'chain', 20.84399, 106.68183],
  ['kafa-hai-ba-trung', 'KAFA Café', 'hp', 'Lê Chân', '17 P. Hai Bà Trưng', 'chain', 20.85343, 106.68316],
  ['kafa-le-hong-phong', 'KAFA Café', 'hp', 'Gia Viên', 'Lô 22B Đ. Lê Hồng Phong', 'chain', 20.84828, 106.7057],
  ['kafa-lach-tray', 'KAFA Café', 'hp', 'Gia Viên', '243A Lạch Tray', 'chain', 20.83301, 106.6978],

  ['bac-viet-tran-hung-dao', 'Cà phê Bắc Việt', 'hp', 'Hồng Bàng', '4a P. Trần Hưng Đạo', 'vintage', 20.8602, 106.68708],
  ['bac-viet-ha-ly', 'Cafe Bắc Việt', 'hp', 'Hồng Bàng', '39c P. Hạ Lý', 'vintage', 20.86039, 106.67844],
  ['bac-viet-lach-tray', 'Bắc Việt coffee', 'hp', 'Gia Viên', '215 Lạch Tray', 'vintage', 20.83826, 106.69538],
  ['bac-viet-aeon', 'Bắc Việt Coffee', 'hp', 'An Biên', 'T1-40, tầng 1 Aeon Mall', 'vintage', 20.8321, 106.68302],
  // Maps gives this branch only a plus code, no street address or ward.
  ['bac-viet-vj5r', 'Cafe Bắc Việt coffee', 'hp', 'Hải Phòng', 'Plus code VJ5R+9J3', 'vintage', 20.85835, 106.64156],

  ['cong-van-cao', 'Cộng Cà Phê', 'hp', 'Gia Viên', '178 P. Văn Cao', 'chain vintage', 20.83568, 106.70113],
  ['tch-tran-phu', 'The Coffee House', 'hp', 'Gia Viên', '15 P. Trần Phú', 'chain work', 20.85909, 106.68747],

  ['caro-coffee', 'Caro Coffee', 'hp', 'Gia Viên', '139 P. Lê Lợi', 'photo', 20.85718, 106.69139],
  ['breathe', 'Breathe', 'hp', 'Gia Viên', '89 P. Lê Lợi', 'rooftop view', 20.85819, 106.69244],
  ['maple-cafe', 'Maple Cafe & Bistro', 'hp', 'Lê Chân', '38 P. Mê Linh', 'photo quiet', 20.85381, 106.68006],
  ['viviria', 'Viviria Coffee', 'hp', 'Gia Viên', 'Số 4B4 Lô 26BC, Đ. Lê Hồng Phong', 'garden photo', 20.85516, 106.69775],
  ['zebee-cafe', 'Zebee Cafe', 'hp', 'An Biên', 'HD96 Vinhomes Marina, Cầu Rào 2', 'quiet', 20.81964, 106.68689],
  ['harru-quan', 'Harru Quán', 'hp', 'Hải An', '747 Ngô Gia Tự', 'vintage photo', 20.82969, 106.71881],
  ['cung-tram', 'Cung Trầm Cafe', 'hp', 'Hải An', '55/135 Trung Lực', 'garden quiet', 20.83381, 106.71056],

  ['muse-coffee', 'Muse Coffee & Pastry', 'hp', 'Hồng Bàng', '61 P. Trần Quang Khải', '', 20.85984, 106.68007],
  ['tra-cuc-vang', 'Trà Cúc Vàng', 'hp', 'Hồng Bàng', '33 P. Phan Bội Châu', '', 20.85727, 106.68045],
  ['twinnie', 'Twinnie Coffee Lounge', 'hp', 'Hồng Bàng', '25 P. Phan Bội Châu', '', 20.85729, 106.68062],
  ['tree-house', 'Tree house coffee', 'hp', 'Gia Viên', '143 Đường bao quanh hồ An Biên', '', 20.8487, 106.69599],
  ['venus-coffee', 'Venus Coffee', 'hp', 'Gia Viên', 'Lô 6B Đ. Lê Hồng Phong', '', 20.85184, 106.70677],
  ['vong-coffee', 'Vòng Coffee', 'hp', 'Gia Viên', '15a Đường vòng hồ', '', 20.85124, 106.69366],
  ['may-tropical', 'May Tropical', 'hp', 'An Biên', 'Đối diện cổng G Aeon Mall', '', 20.83145, 106.67973],
  ['laban', 'Laban Cafe & Space', 'hp', 'Lê Chân', 'P. Nguyễn Tất Tố', '', 20.82974, 106.68653],
  ['bana-coffee', 'Ba n’a Coffee', 'hp', 'Hải An', '18 Trung Lực', '', 20.83839, 106.70954],

  // ---------- Hà Nội (review sites, not Maps-verified) ----------
  ['mien-man', 'Miên Man', 'hn', 'Hoàn Kiếm', '3 Ấu Triệu', 'view photo'],
  ['tranquil-books', 'Tranquil Books & Coffee', 'hn', 'Hoàn Kiếm', '5 Nguyễn Quang Bích', 'book quiet work'],
  ['cafe-pho-co', 'Café Phố Cổ', 'hn', 'Hoàn Kiếm', '11 Hàng Gai', 'vintage view rooftop'],
  ['cafe-dinh', 'Cafe Đinh', 'hn', 'Hoàn Kiếm', '13 Đinh Tiên Hoàng', 'vintage view'],
  ['mi-ami-caffe', 'MI AMI Caffè', 'hn', 'Hoàn Kiếm', '4 Tống Duy Tân', 'photo'],
  ['aerie-coffee', 'Aerie Coffee', 'hn', 'Hoàn Kiếm', 'Tầng 4, 717 Hồng Hà', 'quiet view'],
  ['hanoi-moment', 'Hanoi Moment', 'hn', 'Ba Đình', '62 Nguyễn Thái Học', 'vintage view'],
  ['katinat-pdp', 'Katinat Saigon Kafe', 'hn', 'Ba Đình', '18 Phan Đình Phùng', 'chain photo'],
  ['cafe-tote', 'Cafe Tòte', 'hn', 'Ba Đình', 'Ngõ 71 Láng Hạ', 'photo'],
  ['rani-kissaten', 'Rani Kissaten', 'hn', 'Ba Đình', 'Ngõ 3 Liễu Giai', 'quiet'],
  ['quan-cafe-lang', 'Quán Cafe Lãng', 'hn', 'Đống Đa', 'Ngõ 6 Đặng Văn Ngữ', 'vintage quiet'],
  ['quan-x98', 'Quận X98', 'hn', 'Đống Đa', 'Ngõ 31 Hoàng Cầu', 'garden photo'],
  ['30days-cafe', '30Days Cafe', 'hn', 'Đống Đa', 'Ngõ 10 Láng Hạ', 'photo work'],
  ['day-mo-cafe', 'Đây Mơ Cafe', 'hn', 'Đống Đa', 'Ngõ 148 Mai Anh Tuấn', 'garden view'],
  ['october-coffee', 'October Coffee & Studio', 'hn', 'Tây Hồ', '115 Nguyễn Đình Thi', 'vintage view'],
  ['santorini-vibes', 'Santorini Vibes Cafe', 'hn', 'Tây Hồ', '181 Nhật Chiêu', 'photo view'],
  ['abc-roasters', 'ABC Coffee Roasters', 'hn', 'Tây Hồ', '10 Quảng Khánh', 'quiet'],
  ['hanoi-roastery', 'Hanoi Roastery', 'hn', 'Tây Hồ', '179 Trích Sài', 'garden view'],
  ['uptown-terrace', 'Uptown Terrace', 'hn', 'Tây Hồ', '11 Nguyễn Đình Thi', 'rooftop view'],
  ['bonjour-ho-tay', 'Bonjour Cafe Hồ Tây', 'hn', 'Tây Hồ', '129 Nguyễn Đình Thi', 'view quiet'],
  ['lofita', 'Lofita Tea & Coffee', 'hn', 'Cầu Giấy', '225 Trần Quốc Hoàn', 'rooftop chain'],
  ['hom-nao', 'Hôm Nào Cà Phê', 'hn', 'Cầu Giấy', 'Ngõ 82 Nghĩa Tân', 'garden work'],
  ['mo-ca-phe', 'Mơ Cà Phê', 'hn', 'Cầu Giấy', '2 Nguyễn Bá Khoản', 'garden late'],
  ['jidai', 'JIDAI by Cerenote', 'hn', 'Cầu Giấy', 'Ngõ 165 Cầu Giấy', 'quiet late work'],
  ['nha-trong-ngo', 'Nhà Trong Ngõ', 'hn', 'Hà Đông', 'Ngõ 23 Nguyễn Khuyến', 'garden quiet'],
  ['cafe-xi-nghiep', 'Cafe Xí Nghiệp', 'hn', 'Hà Đông', '60A TT11 Văn Quán', 'photo work'],

  // ---------- TP.HCM (review sites, not Maps-verified) ----------
  ['the-workshop', 'The Workshop Coffee', 'hcm', 'Quận 1', '27 Ngô Đức Kế, Bến Nghé', 'work quiet'],
  ['ca-phe-trung-3t', 'Cà Phê Trứng 3T', 'hcm', 'Quận 1', '1A Tôn Đức Thắng, Bến Nghé', 'vintage'],
  ['little-hanoi-egg', 'Little HaNoi Egg Coffee', 'hcm', 'Quận 1', '212 Lê Lai, Bến Thành', 'vintage'],
  ['flat-white', 'Flat White Coffee', 'hcm', 'Quận 1', '274 Lý Tự Trọng, Bến Thành', 'quiet'],
  ['bang-khuang', 'Bâng Khuâng Café', 'hcm', 'Quận 1', 'Tầng 2, 9 Thái Văn Lung', 'vintage quiet'],
  ['soo-kafe', 'Soo Kafe', 'hcm', 'Quận 1', '10 Phan Kế Bính, Đa Kao', 'quiet work'],
  ['catfe', 'CATFE Coffee', 'hcm', 'Quận 1', '119 Nguyễn Thị Minh Khai', 'pet'],
  ['nha-cua-meo', 'Nhà Của Mèo', 'hcm', 'Quận 1', '11bis Nguyễn Bỉnh Khiêm', 'pet'],
  ['trung-nguyen-legend', 'Trung Nguyên Legend', 'hcm', 'Quận 1', '80 Đồng Khởi, Bến Nghé', 'chain'],
  ['paper-and-i', 'Paper & I', 'hcm', 'Quận 1', '152 Nam Kỳ Khởi Nghĩa', 'book quiet'],
  ['chieu-cafe-sach', 'Chiêu Cafe Sách', 'hcm', 'Quận 1', '377 Hoàng Sa, Tân Định', 'book quiet'],
  ['bibli-library', 'Bibli Library Café', 'hcm', 'Quận 1', '42/5 Hồ Hảo Hớn, Cô Giang', 'book work'],
  ['the-coffee-lab', 'The Coffee Lab', 'hcm', 'Quận 1', '53A Nguyễn Du, Bến Nghé', 'work late'],
  ['thi-ba-cafe', 'Thi Ba Cafe', 'hcm', 'Quận 1', '68 Sương Nguyệt Ánh, Bến Thành', 'vintage'],
  ['ngam-coffee', 'NGÂM Coffee', 'hcm', 'Quận 3', '193/19 Nam Kỳ Khởi Nghĩa', 'book late work'],
  ['nham-coffee', 'Nhâm Coffee', 'hcm', 'Quận 10', '91/1 Hòa Hưng', 'book late work'],
  ['allure-coffee', 'Allure Coffee', 'hcm', 'Phú Nhuận', '19 Hồ Văn Huê', 'photo'],
  ['lang-thang-rooftop', 'Lang Thang Rooftop', 'hcm', 'Phú Nhuận', 'Tầng 7, 240 Nguyễn Đình Chính', 'rooftop view'],
  ['the-comma', 'The Comma', 'hcm', 'Phú Nhuận', '100 Trần Huy Liệu', 'quiet'],
  ['cafe-tram', 'Cafe Trầm', 'hcm', 'Phú Nhuận', '110 Lê Văn Sỹ', 'vintage quiet'],
  ['noveri', 'Noveri Cafe', 'hcm', 'Bình Thạnh', '236/43/11 Điện Biên Phủ', 'photo quiet'],
  ['so-far-so-good', 'So Far So Good', 'hcm', 'Bình Thạnh', '18 Vũ Ngọc Phan', 'vintage garden'],
  ['soco-saigon', 'Soco Saigon Coffee', 'hcm', 'Bình Thạnh', '42/3 Ung Văn Khiêm', 'garden'],
  ['on-and-on', 'On and On Coffee', 'hcm', 'Bình Thạnh', '41F Đặng Thùy Trâm', 'photo'],
  ['aramour', 'Aramour Coffee Roasters', 'hcm', 'Thảo Điền', '7 Lê Văn Miến', 'quiet work'],
  ['bamos-coffee', 'Bamos Coffee', 'hcm', 'Thủ Đức', '9/8 Đường số 10, Bình Khánh', 'garden late'],
];

export const cafes: Cafe[] = rows.map(([id, name, city, area, address, tags, lat, lng]) => {
  const coords: [number, number] | undefined =
    lat !== undefined && lng !== undefined ? [lat, lng] : undefined;
  const centre = CENTRE_POINT[city];
  return {
    id,
    name,
    city,
    area,
    address,
    tags: tags ? (tags.split(' ') as CafeTag[]) : [],
    km:
      coords && centre
        ? Math.round(kmBetween(centre, coords) * 10) / 10
        : // An unmapped area means AREA_KM drifted; 99 keeps it out of any
          // sane radius instead of silently pretending it is next door.
          (AREA_KM[area] ?? 99),
    coords,
  };
});

export const cafeById = new Map(cafes.map((c) => [c.id, c]));

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
 * Verified cafés are searched by name AND address: for a chain such as KAFA,
 * a name-only search opens a list of all five branches instead of the one the
 * reel picked. Unverified cafés fall back to name + city, which still resolves
 * if the stored address is stale.
 */
export function mapsUrl(cafe: Cafe): string {
  const query = cafe.coords
    ? `${cafe.name} ${cafe.address} ${CITY_LABEL[cafe.city]}`
    : `${cafe.name} ${CITY_LABEL[cafe.city]}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
