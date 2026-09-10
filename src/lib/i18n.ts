import type { Cuisine, Dish, Meal, Tag } from './dishes';

export type Lang = 'vi' | 'en';

export const copy = {
  vi: {
    // The brand is a name, not a phrase: it stays identical in both
    // languages. Only the tagline is translated.
    brand: 'whattoeat',
    tagline: 'Hết phân vân trong 8 giây',
    spin: 'CHỐT MÓN',
    spinning: 'ĐANG CHỌN…',
    spinAgain: 'CHỐT LẠI',
    budget: 'Tối đa mỗi bữa',
    budgetHint: 'Không món nào vượt mức này. Món sát trần ra ít hơn.',
    poolAverage: 'Trung bình pool',
    meal: 'Bữa',
    meals: { any: 'Cả ngày', sang: 'Sáng', trua: 'Trưa', toi: 'Tối' },
    cuisine: 'Ẩm thực',
    include: 'Phải có',
    exclude: 'Loại bỏ',
    allCuisines: 'Tất cả',
    reset: 'Đặt lại bộ lọc',
    dishes: 'món',
    emptyPool: 'Không còn món nào khớp bộ lọc. Nới lỏng bớt hoặc bỏ chặn vài món.',
    result: 'CHỐT RỒI',
    referencePrice: 'Giá tham khảo',
    perPerson: '/ người',
    findNearby: 'Tìm quán gần đây',
    orderGrab: 'Đặt GrabFood',
    orderShopee: 'Đặt ShopeeFood',
    again: 'Quay lại',
    close: 'Đóng',
    favorite: 'Yêu thích',
    unfavorite: 'Bỏ yêu thích',
    block: 'Không bao giờ nữa',
    unblock: 'Bỏ chặn',
    share: 'Chia sẻ',
    copied: 'Đã copy link',
    tabCatalog: 'Kho món',
    tabCustom: 'Món của tôi',
    tabHistory: 'Lịch sử',
    tabStats: 'Thống kê',
    tabGroup: 'Quay nhóm',
    search: 'Tìm món…',
    addDish: 'Thêm món',
    dishName: 'Tên món',
    price: 'Giá (nghìn đồng)',
    vegetarian: 'Món chay',
    remove: 'Xoá',
    noCustom: 'Chưa có món nào. Thêm quán cơm ruột của bạn.',
    noHistory: 'Chưa quay lần nào.',
    clearHistory: 'Xoá lịch sử',
    totalSpins: 'Lượt quay',
    estSpend: 'Ước tính đã chi',
    topDish: 'Món hay ra nhất',
    streak: 'Chuỗi ngày',
    days: 'ngày',
    last30: '30 lượt gần nhất',
    groupTitle: 'Quay nhóm',
    groupHint: 'Nhập cùng một mã phòng, cả nhóm ra cùng một món trong ngày hôm nay.',
    roomCode: 'Mã phòng',
    joinRoom: 'Chốt cho cả nhóm',
    copyInvite: 'Copy link mời',
    groupResult: 'Món của phòng',
    sound: 'Âm thanh',
    theme: 'Giao diện',
    language: 'English',
    storageWarning: 'Trình duyệt chặn lưu trữ. Lựa chọn chỉ giữ trong phiên này.',
    favoritesNote: 'Món yêu thích ra nhiều hơn 3 lần.',
    blockedNote: 'món bị chặn',
    settings: 'Tuỳ chỉnh',
    tiers: ['Bình dân', 'Quen thuộc', 'Đáng thử', 'Sang chảnh', 'Chiêu đãi'],
  },
  en: {
    brand: 'whattoeat',
    tagline: 'Stop deciding. Start eating.',
    spin: 'PICK ONE',
    spinning: 'PICKING…',
    spinAgain: 'PICK AGAIN',
    budget: 'Max per meal',
    budgetHint: 'Nothing above this price is drawn. Dishes near the cap are rarer.',
    poolAverage: 'Pool average',
    meal: 'Meal',
    meals: { any: 'All day', sang: 'Breakfast', trua: 'Lunch', toi: 'Dinner' },
    cuisine: 'Cuisine',
    include: 'Must have',
    exclude: 'Exclude',
    allCuisines: 'All',
    reset: 'Reset filters',
    dishes: 'dishes',
    emptyPool: 'Nothing matches these filters. Loosen them or unblock a few dishes.',
    result: 'DECIDED',
    referencePrice: 'Typical price',
    perPerson: '/ person',
    findNearby: 'Find nearby',
    orderGrab: 'Order on GrabFood',
    orderShopee: 'Order on ShopeeFood',
    again: 'Spin again',
    close: 'Close',
    favorite: 'Favourite',
    unfavorite: 'Unfavourite',
    block: 'Never again',
    unblock: 'Unblock',
    share: 'Share',
    copied: 'Link copied',
    tabCatalog: 'Catalogue',
    tabCustom: 'My dishes',
    tabHistory: 'History',
    tabStats: 'Stats',
    tabGroup: 'Group',
    search: 'Search dishes…',
    addDish: 'Add dish',
    dishName: 'Dish name',
    price: 'Price (thousand VND)',
    vegetarian: 'Vegetarian',
    remove: 'Remove',
    noCustom: 'Nothing yet. Add the place you actually go to.',
    noHistory: 'No spins yet.',
    clearHistory: 'Clear history',
    totalSpins: 'Spins',
    estSpend: 'Estimated spend',
    topDish: 'Most drawn',
    streak: 'Day streak',
    days: 'days',
    last30: 'Last 30 spins',
    groupTitle: 'Group spin',
    groupHint: 'Everyone who enters the same room code gets the same dish today.',
    roomCode: 'Room code',
    joinRoom: 'Decide for the group',
    copyInvite: 'Copy invite link',
    groupResult: "The room's dish",
    sound: 'Sound',
    theme: 'Theme',
    language: 'Tiếng Việt',
    storageWarning: 'Storage is blocked. Choices last only for this visit.',
    favoritesNote: 'Favourites are 3x more likely.',
    blockedNote: 'blocked',
    settings: 'Settings',
    tiers: ['Everyday', 'Familiar', 'Worth a try', 'Fancy', 'Treat'],
  },
} as const;

export const cuisineLabel: Record<Cuisine, { vi: string; en: string; flag: string }> = {
  vn: { vi: 'Việt Nam', en: 'Vietnamese', flag: '🇻🇳' },
  cn: { vi: 'Món Hoa', en: 'Chinese', flag: '🥢' },
  jp: { vi: 'Nhật Bản', en: 'Japanese', flag: '🇯🇵' },
  kr: { vi: 'Hàn Quốc', en: 'Korean', flag: '🇰🇷' },
  th: { vi: 'Thái Lan', en: 'Thai', flag: '🇹🇭' },
  sea: { vi: 'Đông Nam Á', en: 'Southeast Asian', flag: '🌏' },
  in: { vi: 'Ấn Độ', en: 'Indian', flag: '🇮🇳' },
  mid: { vi: 'Trung Đông', en: 'Middle Eastern', flag: '🧆' },
  eu: { vi: 'Châu Âu', en: 'European', flag: '🇪🇺' },
  us: { vi: 'Mỹ', en: 'American', flag: '🇺🇸' },
  mx: { vi: 'Mexico', en: 'Mexican', flag: '🇲🇽' },
};

export const tagLabel: Record<Tag, { vi: string; en: string; icon: string }> = {
  veg: { vi: 'Chay', en: 'Vegetarian', icon: '🌱' },
  spicy: { vi: 'Cay', en: 'Spicy', icon: '🌶️' },
  soup: { vi: 'Món nước', en: 'Soupy', icon: '💧' },
  dry: { vi: 'Món khô', en: 'Dry', icon: '🥡' },
  rice: { vi: 'Cơm', en: 'Rice', icon: '🍚' },
  noodle: { vi: 'Mì / bún', en: 'Noodles', icon: '🍜' },
  bread: { vi: 'Bánh mì', en: 'Bread', icon: '🥖' },
  grill: { vi: 'Nướng', en: 'Grilled', icon: '🔥' },
  fried: { vi: 'Chiên', en: 'Fried', icon: '🍳' },
  light: { vi: 'Nhẹ bụng', en: 'Light', icon: '🥗' },
  seafood: { vi: 'Hải sản', en: 'Seafood', icon: '🦐' },
};

const quips = {
  vi: [
    'Rẻ mà chắc bụng. Chốt.',
    'Quen thuộc là có lý do.',
    'Hôm nay đổi gió chút.',
    'Ví hơi đau nhưng xứng đáng.',
    'Tự thưởng đi, làm cả tuần rồi.',
  ],
  en: [
    'Cheap and filling. Done.',
    'A classic for a reason.',
    'A change of pace today.',
    'Wallet winces. Worth it.',
    'Treat yourself, you earned it.',
  ],
} as const;

export const quipFor = (dish: Dish, lang: Lang): string =>
  quips[lang][Math.min(dish.rarity, quips[lang].length - 1)];

export const dishName = (dish: Dish, lang: Lang): string => (lang === 'en' ? dish.en : dish.vi);

export function dishSubtitle(dish: Dish, lang: Lang): string {
  if (dish.custom) return lang === 'vi' ? 'Món của tôi' : 'My dish';
  const parts = [cuisineLabel[dish.cuisine][lang]];
  for (const tag of dish.tags.slice(0, 2)) parts.push(tagLabel[tag][lang]);
  return parts.join(' · ');
}

export function priceLabel(thousands: number, lang: Lang, approx = false): string {
  const value = Math.round(thousands) * 1000;
  const text =
    lang === 'en'
      ? `₫${new Intl.NumberFormat('en-US').format(value)}`
      : `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
  return approx ? `~${text}` : text;
}

export const mealLabel = (meal: Meal | 'any', lang: Lang): string => copy[lang].meals[meal];
