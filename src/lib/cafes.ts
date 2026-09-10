// Real cafés, compiled 2026-09-10 from Vietnamese review listicles:
//   ticotravel.com.vn/cafe-hai-phong, vinwonders.com  (Hải Phòng)
//   palatinostudio.com/quan-cafe-dep-o-ha-noi          (Hà Nội)
//   greensm.com/news/ca-phe-quan-1, noithatanthinhphat.vn (TP.HCM)
//
// Two deliberate limits, because this kind of data ages badly:
//   * The address is stored for display only. Every "open in Maps" link
//     searches by NAME + CITY, so a café that moved still resolves, and one
//     that closed shows as closed rather than sending someone to an address
//     that is now a phone shop.
//   * Distance is per AREA, not per café. Accurate coordinates for 74 shops
//     are not something this project can keep correct, and a district-level
//     estimate is at least honest about its own precision.
//
// Bars and nightlife venues in those lists were left out: the ask was cafés.

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
  /** Approximate km from the city centre, via AREA_KM. */
  km: number;
  custom?: true;
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

// Rough straight-line distance from each city centre, whole km. Only used to
// filter by the radius slider.
const AREA_KM: Record<string, number> = {
  'Hồng Bàng': 1, 'Ngô Quyền': 2, 'Lê Chân': 3, 'Hải An': 6,
  'Kiến An': 8, 'Dương Kinh': 9, 'Thuỷ Nguyên': 10, 'Đồ Sơn': 20,

  'Hoàn Kiếm': 1, 'Ba Đình': 3, 'Đống Đa': 4, 'Tây Hồ': 5,
  'Long Biên': 5, 'Thanh Xuân': 7, 'Cầu Giấy': 7, 'Hà Đông': 12,

  'Quận 1': 1, 'Quận 3': 2, 'Quận 5': 4, 'Quận 10': 4,
  'Phú Nhuận': 5, 'Bình Thạnh': 5, 'Gò Vấp': 8, 'Thảo Điền': 8,
  'Thủ Đức': 12,
};

type Row = [id: string, name: string, city: City, area: string, address: string, tags: string];

const rows: Row[] = [
  // ---------- Hải Phòng ----------
  ['no-1986', 'No 1986 Coffee', 'hp', 'Hồng Bàng', '33-35 Đinh Tiên Hoàng', 'photo view'],
  ['cong-cafe-hp', 'Cộng Cà Phê', 'hp', 'Hồng Bàng', '84 Điện Biên Phủ', 'chain vintage'],
  ['the-coffee-house-hp', 'The Coffee House', 'hp', 'Hồng Bàng', '86 Điện Biên Phủ', 'chain work'],
  ['cafe-delices', 'Café Délices', 'hp', 'Hồng Bàng', '43 Điện Biên Phủ', 'view quiet'],
  ['class-coffee-books', 'Class Coffee and Books', 'hp', 'Hồng Bàng', '178 Phan Bội Châu', 'book quiet work'],
  ['prince-coffee', 'Prince Coffee', 'hp', 'Hồng Bàng', 'Manhattan 11, Vinhomes Imperia, Thượng Lý', 'photo'],
  ['mercy-coffee', 'Mercy Coffee and Bread', 'hp', 'Hồng Bàng', 'Manhattan 11, Vinhomes Imperia', 'quiet photo'],
  ['poppy-premium', 'Poppy Premium', 'hp', 'Ngô Quyền', '2 Lương Khánh Thiện', 'photo'],
  ['buta-tea', 'Buta Tea & Fruit', 'hp', 'Ngô Quyền', '46 Lương Khánh Thiện', 'photo'],
  ['maple-cafe', 'Maple Café & Bistro', 'hp', 'Ngô Quyền', '93 Lê Lợi', 'photo quiet'],
  ['caro-coffee', 'Caro Coffee', 'hp', 'Ngô Quyền', '139 Lê Lợi', 'photo'],
  ['breath-rooftop', 'Breath', 'hp', 'Ngô Quyền', '89 Lê Lợi', 'rooftop view'],
  ['vivaria', 'Vivaria Coffee & Trees', 'hp', 'Ngô Quyền', 'Lô 26BC Lê Hồng Phong', 'garden photo'],
  ['banhs-coffee', 'BANHS Coffee', 'hp', 'Ngô Quyền', '81/384 Lạch Tray', 'garden view'],
  ['zebee-cafe', 'ZeBee Cafe', 'hp', 'Ngô Quyền', '207 Lạch Tray', 'quiet vintage'],
  ['bac-viet', 'Bắc Việt Coffee', 'hp', 'Ngô Quyền', '180A Văn Cao', 'vintage'],
  ['mats-coffee', 'MATs Coffee', 'hp', 'Lê Chân', '27 vòng xoay Hồ Sen', 'view garden'],
  ['venice-coffee', 'Venice Coffee', 'hp', 'Lê Chân', '274 Lạch Tray', 'quiet photo'],
  ['am-tea', 'A.M Tea', 'hp', 'Lê Chân', '16/49 Nguyễn Đức Cảnh', 'vintage'],
  ['palm-coffee', 'Palm Coffee', 'hp', 'Lê Chân', '115 Tô Hiệu, Trại Cau', 'garden photo'],
  ['miss-coffee', 'Miss Coffee', 'hp', 'Lê Chân', 'KĐT ven sông Lạch Tray', 'view garden'],
  ['harru-quan', 'Harru Quán', 'hp', 'Hải An', '747 Ngô Gia Tự, Đằng Lâm', 'vintage photo'],
  ['time-coffee', 'Time Coffee & Bakery', 'hp', 'Hải An', 'Lô 10 Lê Hồng Phong, Đằng Hải', 'vintage work'],
  ['cung-tram', 'Cung Trầm Cafe', 'hp', 'Hải An', '137 Trung Lực, Đằng Lâm', 'garden quiet'],

  // ---------- Hà Nội ----------
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

  // ---------- TP.HCM ----------
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

export const cafes: Cafe[] = rows.map(([id, name, city, area, address, tags]) => ({
  id,
  name,
  city,
  area,
  address,
  tags: tags.split(' ') as CafeTag[],
  // An unmapped area means AREA_KM drifted out of sync; 99 keeps it out of
  // any sane radius instead of silently pretending it is next door.
  km: AREA_KM[area] ?? 99,
}));

export const cafeById = new Map(cafes.map((c) => [c.id, c]));

/** Search by name and city, never by the stored address — see the note above. */
export function mapsUrl(cafe: Cafe): string {
  const where = cafe.custom ? cafe.address : CITY_LABEL[cafe.city];
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cafe.name} ${where}`)}`;
}
