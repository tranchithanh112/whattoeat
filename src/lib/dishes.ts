// Dish catalogue. Prices are typical single-portion prices in Vietnam,
// in thousands of VND — rough guidance, not restaurant quotes.
//
// Rows are tuples rather than objects: 170 dishes as object literals costs
// several times the bytes for no readability win at this shape.

export type Cuisine = 'vn' | 'cn' | 'jp' | 'kr' | 'th' | 'sea' | 'in' | 'mid' | 'eu' | 'us' | 'mx';
export type Tag =
  | 'veg' | 'spicy' | 'soup' | 'dry' | 'rice' | 'noodle'
  | 'bread' | 'grill' | 'fried' | 'light' | 'seafood';
export type Meal = 'sang' | 'trua' | 'toi';

export type Dish = {
  id: string;
  vi: string;
  en: string;
  price: number;
  emoji: string;
  cuisine: Cuisine;
  tags: Tag[];
  meals: Meal[];
  rarity: number;
  /** Rough kcal for one typical portion — see KCAL. */
  kcal: number;
  custom?: true;
};

/** Rarity bands follow the price ladder, so a pricier dish always reads rarer. */
export function priceRarity(price: number): number {
  return price <= 40 ? 0 : price <= 65 ? 1 : price <= 100 ? 2 : price <= 150 ? 3 : 4;
}

type Row = [id: string, vi: string, en: string, price: number, emoji: string, cuisine: Cuisine, tags: string, meals: string];

const rows: Row[] = [
  // ---- Việt Nam ----
  ['com-tam', 'Cơm tấm sườn bì chả', 'Broken rice with grilled pork', 45, '🍛', 'vn', 'rice grill', 'trua toi'],
  ['pho-bo', 'Phở bò', 'Beef pho', 55, '🍜', 'vn', 'soup noodle', 'sang trua toi'],
  ['pho-ga', 'Phở gà', 'Chicken pho', 50, '🍜', 'vn', 'soup noodle', 'sang trua'],
  ['pho-cuon', 'Phở cuốn', 'Pho rolls', 65, '🌯', 'vn', 'light', 'trua toi'],
  ['pho-chay', 'Phở chay', 'Vegetarian pho', 40, '🍜', 'vn', 'soup noodle veg', 'sang trua'],
  ['banh-mi', 'Bánh mì thịt', 'Banh mi with grilled pork', 25, '🥖', 'vn', 'bread dry', 'sang trua'],
  ['banh-mi-op-la', 'Bánh mì ốp la', 'Banh mi with fried eggs', 30, '🍳', 'vn', 'bread', 'sang'],
  ['banh-mi-chao', 'Bánh mì chảo', 'Skillet banh mi', 45, '🍳', 'vn', 'bread', 'sang'],
  ['banh-mi-chay', 'Bánh mì chay', 'Vegetarian banh mi', 25, '🥖', 'vn', 'bread veg', 'sang trua'],
  ['bun-cha', 'Bún chả', 'Grilled pork with vermicelli', 50, '🍢', 'vn', 'noodle grill', 'trua'],
  ['bun-bo-hue', 'Bún bò Huế', 'Hue spicy beef noodle soup', 50, '🍲', 'vn', 'soup noodle spicy', 'sang trua'],
  ['bun-rieu', 'Bún riêu', 'Crab tomato noodle soup', 45, '🦀', 'vn', 'soup noodle seafood', 'sang trua'],
  ['bun-thit-nuong', 'Bún thịt nướng', 'Grilled pork vermicelli bowl', 40, '🍢', 'vn', 'noodle grill dry', 'trua'],
  ['bun-dau', 'Bún đậu mắm tôm', 'Tofu and noodles with shrimp paste', 55, '🫓', 'vn', 'dry', 'trua'],
  ['bun-ca', 'Bún cá', 'Fish noodle soup', 45, '🐟', 'vn', 'soup noodle seafood', 'sang trua'],
  ['bun-moc', 'Bún mọc', 'Pork meatball noodle soup', 45, '🍲', 'vn', 'soup noodle', 'sang trua'],
  ['bun-mang-vit', 'Bún măng vịt', 'Duck and bamboo noodle soup', 60, '🦆', 'vn', 'soup noodle', 'trua toi'],
  ['bun-bo-nam-bo', 'Bún bò Nam Bộ', 'Southern beef noodle salad', 55, '🥗', 'vn', 'noodle dry', 'trua'],
  ['bun-mam', 'Bún mắm', 'Fermented fish noodle soup', 65, '🍲', 'vn', 'soup noodle seafood', 'trua'],
  ['bun-chay', 'Bún chay', 'Vegetarian noodle bowl', 35, '🥬', 'vn', 'soup noodle veg', 'sang trua'],
  ['hu-tieu', 'Hủ tiếu', 'Hu tieu noodle soup', 40, '🍜', 'vn', 'soup noodle', 'sang trua'],
  ['hu-tieu-nam-vang', 'Hủ tiếu Nam Vang', 'Phnom Penh noodle soup', 55, '🍜', 'vn', 'soup noodle', 'sang trua'],
  ['mi-quang', 'Mì Quảng', 'Quang noodles', 45, '🍜', 'vn', 'noodle', 'sang trua'],
  ['banh-canh-cua', 'Bánh canh cua', 'Crab thick noodle soup', 60, '🦀', 'vn', 'soup noodle seafood', 'trua'],
  ['banh-canh-gio-heo', 'Bánh canh giò heo', 'Pork knuckle thick noodle soup', 50, '🍲', 'vn', 'soup noodle', 'sang trua'],
  ['banh-canh-ghe', 'Bánh canh ghẹ', 'Crab thick noodle soup, deluxe', 90, '🦀', 'vn', 'soup noodle seafood', 'trua toi'],
  ['banh-da-cua', 'Bánh đa cua', 'Hai Phong crab noodle soup', 45, '🦀', 'vn', 'soup noodle seafood', 'sang trua'],
  ['mien-ga', 'Miến gà', 'Chicken glass noodle soup', 50, '🍜', 'vn', 'soup noodle', 'sang trua'],
  ['mien-luon', 'Miến lươn', 'Eel glass noodle soup', 65, '🍜', 'vn', 'soup noodle', 'trua'],
  ['mien-xao', 'Miến xào', 'Stir-fried glass noodles', 55, '🍝', 'vn', 'noodle dry', 'trua toi'],
  ['mi-cua', 'Mì cua', 'Crab egg noodles', 90, '🦀', 'vn', 'soup noodle seafood', 'trua toi'],
  ['mi-tom-trung', 'Mì tôm trứng', 'Instant noodles with egg', 20, '🍜', 'vn', 'soup noodle', 'sang toi'],
  ['mi-xao-bo', 'Mì xào bò', 'Beef stir-fried noodles', 45, '🍝', 'vn', 'noodle dry', 'trua'],
  ['nui-xao-bo', 'Nui xào bò', 'Beef macaroni stir-fry', 50, '🍝', 'vn', 'noodle dry', 'trua'],
  ['banh-cuon', 'Bánh cuốn', 'Steamed rice rolls', 35, '🫔', 'vn', 'light', 'sang'],
  ['banh-uot-thit-nuong', 'Bánh ướt thịt nướng', 'Rice sheets with grilled pork', 40, '🫓', 'vn', 'grill light', 'sang trua'],
  ['banh-xeo', 'Bánh xèo', 'Vietnamese crispy pancake', 50, '🥞', 'vn', 'fried', 'trua toi'],
  ['banh-beo', 'Bánh bèo', 'Steamed rice cakes', 35, '🫓', 'vn', 'light', 'sang trua'],
  ['banh-bot-loc', 'Bánh bột lọc', 'Tapioca shrimp dumplings', 35, '🥟', 'vn', 'light seafood', 'sang trua'],
  ['banh-gio', 'Bánh giò', 'Pyramid rice dumpling', 20, '🫔', 'vn', 'light', 'sang'],
  ['banh-hoi-heo-quay', 'Bánh hỏi heo quay', 'Roast pork with rice vermicelli sheets', 50, '🐷', 'vn', 'grill', 'trua'],
  ['nem-nuong', 'Nem nướng', 'Grilled pork sausage rolls', 55, '🍡', 'vn', 'grill', 'trua toi'],
  ['goi-cuon', 'Gỏi cuốn', 'Fresh spring rolls', 35, '🌯', 'vn', 'light', 'trua'],
  ['goi-cuon-chay', 'Gỏi cuốn chay', 'Vegetarian spring rolls', 35, '🌯', 'vn', 'light veg', 'trua'],
  ['chao-suon', 'Cháo sườn', 'Pork rib congee', 25, '🥣', 'vn', 'soup light', 'sang'],
  ['chao-ga', 'Cháo gà', 'Chicken congee', 40, '🥣', 'vn', 'soup light', 'sang toi'],
  ['chao-vit', 'Cháo vịt', 'Duck congee', 55, '🥣', 'vn', 'soup', 'toi'],
  ['chao-long', 'Cháo lòng', 'Pork offal congee', 40, '🥣', 'vn', 'soup', 'sang'],
  ['chao-hai-san', 'Cháo hải sản', 'Seafood congee', 70, '🥣', 'vn', 'soup seafood', 'toi'],
  ['xoi-man', 'Xôi mặn', 'Savory sticky rice', 30, '🍙', 'vn', 'rice dry', 'sang'],
  ['xoi-ga', 'Xôi gà', 'Sticky rice with chicken', 40, '🍗', 'vn', 'rice', 'sang'],
  ['com-ga-hoi-an', 'Cơm gà Hội An', 'Hoi An chicken rice', 45, '🍗', 'vn', 'rice', 'trua'],
  ['com-ga-xoi-mo', 'Cơm gà xối mỡ', 'Crispy skin chicken rice', 55, '🍗', 'vn', 'rice fried', 'trua toi'],
  ['com-ga-nuong-mat-ong', 'Cơm gà nướng mật ong', 'Honey grilled chicken rice', 70, '🍗', 'vn', 'rice grill', 'trua'],
  ['com-binh-dan', 'Cơm bình dân', 'Vietnamese rice plate', 40, '🍚', 'vn', 'rice', 'trua'],
  ['com-rang-dua-bo', 'Cơm rang dưa bò', 'Beef and pickle fried rice', 50, '🍛', 'vn', 'rice dry fried', 'trua'],
  ['com-suon-nuong', 'Cơm sườn nướng', 'Grilled pork chop rice', 55, '🍖', 'vn', 'rice grill', 'trua toi'],
  ['com-cha-ca', 'Cơm chả cá', 'Fish cake rice plate', 60, '🐟', 'vn', 'rice seafood', 'trua'],
  ['com-hen', 'Cơm hến', 'Hue baby clam rice', 35, '🍚', 'vn', 'rice seafood', 'sang trua'],
  ['com-chay', 'Cơm chay', 'Vegetarian rice plate', 35, '🥗', 'vn', 'rice veg', 'trua'],
  ['com-tam-chay', 'Cơm tấm chay', 'Vegetarian broken rice', 40, '🍚', 'vn', 'rice veg', 'trua'],
  ['com-cari-chay', 'Cơm cà ri chay', 'Vegetarian curry rice', 55, '🍛', 'vn', 'rice veg', 'trua'],
  ['thit-kho-trung', 'Thịt kho trứng', 'Braised pork and eggs with rice', 50, '🥚', 'vn', 'rice', 'trua toi'],
  ['ga-kho-gung', 'Gà kho gừng', 'Ginger braised chicken with rice', 55, '🍗', 'vn', 'rice', 'trua toi'],
  ['ca-kho-to', 'Cá kho tộ', 'Claypot braised fish with rice', 60, '🐟', 'vn', 'rice seafood', 'trua toi'],
  ['canh-chua-ca', 'Canh chua cá & cơm', 'Sour fish soup with rice', 70, '🍲', 'vn', 'soup seafood', 'trua toi'],
  ['bo-luc-lac', 'Bò lúc lắc', 'Shaking beef', 85, '🥩', 'vn', 'grill', 'trua toi'],
  ['bo-ne', 'Bò né', 'Vietnamese steak and eggs', 75, '🍳', 'vn', 'grill', 'sang trua'],
  ['bo-kho', 'Bò kho bánh mì', 'Beef stew with banh mi', 60, '🍖', 'vn', 'soup bread', 'sang trua'],
  ['bo-nuong-la-lot', 'Bò nướng lá lốt', 'Beef in betel leaf', 70, '🍢', 'vn', 'grill', 'toi'],
  ['ga-nuong-com-lam', 'Gà nướng cơm lam', 'Grilled chicken with bamboo rice', 130, '🍗', 'vn', 'grill rice', 'toi'],
  ['lau-bo-ca-nhan', 'Lẩu bò một người', 'Personal beef hotpot', 160, '🍲', 'vn', 'soup', 'toi'],
  ['lau-ca-keo', 'Lẩu cá kèo', 'Goby fish hotpot', 150, '🍲', 'vn', 'soup seafood', 'toi'],
  ['lau-nam-chay', 'Lẩu nấm chay', 'Vegetarian mushroom hotpot', 120, '🍄', 'vn', 'soup veg', 'toi'],
  ['mi-nam-chay', 'Mì nấm chay', 'Vegetarian mushroom noodles', 40, '🍜', 'vn', 'soup noodle veg', 'trua'],
  ['salad-dau-hu', 'Salad đậu hũ chiên', 'Fried tofu salad', 60, '🥗', 'vn', 'veg light', 'trua'],
  ['oc-luoc', 'Ốc luộc', 'Steamed snails', 80, '🐚', 'vn', 'seafood light', 'toi'],

  // ---- Món Hoa ----
  ['com-xa-xiu', 'Cơm xá xíu', 'Char siu rice', 55, '🍚', 'cn', 'rice grill', 'trua'],
  ['com-vit-quay', 'Cơm vịt quay', 'Roast duck rice', 75, '🦆', 'cn', 'rice grill', 'trua toi'],
  ['mi-xa-xiu', 'Mì xá xíu', 'Char siu noodles', 55, '🍜', 'cn', 'soup noodle', 'sang trua'],
  ['mi-hoanh-thanh', 'Mì hoành thánh', 'Wonton noodles', 60, '🥟', 'cn', 'soup noodle', 'sang trua'],
  ['mi-vit-tiem', 'Mì vịt tiềm', 'Braised duck noodles', 95, '🦆', 'cn', 'soup noodle', 'trua toi'],
  ['mi-bo-dai-loan', 'Mì bò Đài Loan', 'Taiwanese beef noodles', 85, '🍜', 'cn', 'soup noodle', 'trua toi'],
  ['mi-xao-gion', 'Mì xào giòn', 'Crispy stir-fried noodles', 70, '🍜', 'cn', 'noodle fried seafood', 'trua toi'],
  ['com-chien-hai-san', 'Cơm chiên hải sản', 'Seafood fried rice', 85, '🍤', 'cn', 'rice fried seafood', 'trua toi'],
  ['com-ga-hai-nam', 'Cơm gà Hải Nam', 'Hainanese chicken rice', 75, '🍗', 'cn', 'rice', 'trua'],
  ['dimsum', 'Dimsum', 'Dim sum', 130, '🥟', 'cn', 'light', 'sang trua'],

  // ---- Nhật Bản ----
  ['ramen', 'Ramen', 'Ramen', 100, '🍜', 'jp', 'soup noodle', 'trua toi'],
  ['udon', 'Udon', 'Udon', 85, '🍜', 'jp', 'soup noodle', 'trua'],
  ['udon-xao', 'Mì udon xào', 'Stir-fried udon', 110, '🍜', 'jp', 'noodle dry seafood', 'trua toi'],
  ['soba', 'Mì soba', 'Soba noodles', 100, '🍜', 'jp', 'noodle light', 'trua'],
  ['sushi-ca-hoi', 'Sushi cá hồi', 'Salmon sushi', 150, '🍣', 'jp', 'seafood light', 'trua toi'],
  ['sashimi', 'Sashimi thập cẩm', 'Assorted sashimi', 220, '🍣', 'jp', 'seafood light', 'toi'],
  ['com-ca-ri-nhat', 'Cơm cà ri Nhật', 'Japanese curry rice', 90, '🍛', 'jp', 'rice', 'trua'],
  ['gyudon', 'Cơm bò gyudon', 'Gyudon beef bowl', 110, '🍚', 'jp', 'rice', 'trua'],
  ['oyakodon', 'Cơm gà trứng oyakodon', 'Oyakodon chicken and egg rice', 100, '🍚', 'jp', 'rice', 'trua'],
  ['katsudon', 'Cơm heo chiên xù', 'Tonkatsu rice bowl', 95, '🍚', 'jp', 'rice fried', 'trua'],
  ['tendon', 'Cơm tempura', 'Tempura rice bowl', 130, '🍤', 'jp', 'rice fried seafood', 'trua toi'],
  ['unagi-don', 'Cơm lươn Nhật', 'Grilled eel rice', 180, '🍱', 'jp', 'rice grill seafood', 'toi'],
  ['saba-don', 'Cơm cá saba nướng', 'Grilled mackerel rice', 110, '🐟', 'jp', 'rice grill seafood', 'trua'],
  ['salmon-teriyaki', 'Cơm cá hồi teriyaki', 'Salmon teriyaki rice', 150, '🐟', 'jp', 'rice grill seafood', 'trua toi'],
  ['com-ga-teriyaki', 'Cơm gà teriyaki', 'Teriyaki chicken rice', 85, '🍗', 'jp', 'rice grill', 'trua'],
  ['bento', 'Cơm bento', 'Bento box', 120, '🍱', 'jp', 'rice', 'trua'],
  ['okonomiyaki', 'Bánh xèo Nhật', 'Okonomiyaki', 110, '🥞', 'jp', 'fried', 'toi'],
  ['sukiyaki', 'Lẩu sukiyaki một người', 'Personal sukiyaki hotpot', 220, '🍲', 'jp', 'soup', 'toi'],

  // ---- Hàn Quốc ----
  ['bibimbap', 'Bibimbap', 'Bibimbap', 85, '🍚', 'kr', 'rice spicy', 'trua'],
  ['kimbap', 'Kimbap', 'Kimbap', 70, '🍙', 'kr', 'rice light', 'sang trua'],
  ['tteokbokki', 'Tteokbokki', 'Tteokbokki', 65, '🌶️', 'kr', 'spicy dry', 'trua toi'],
  ['mi-cay-han', 'Mì cay Hàn Quốc', 'Spicy Korean noodles', 65, '🍜', 'kr', 'soup noodle spicy', 'trua toi'],
  ['jajangmyeon', 'Mì tương đen', 'Jajangmyeon', 70, '🍜', 'kr', 'noodle dry', 'trua'],
  ['naengmyeon', 'Mì lạnh Hàn Quốc', 'Naengmyeon cold noodles', 95, '🍜', 'kr', 'noodle light', 'trua'],
  ['mi-tron-han', 'Mì trộn Hàn Quốc', 'Korean spicy mixed noodles', 75, '🍜', 'kr', 'noodle dry spicy', 'trua'],
  ['kimchi-jjigae', 'Canh kimchi & cơm', 'Kimchi stew with rice', 85, '🍲', 'kr', 'soup spicy', 'trua toi'],
  ['sundubu', 'Canh đậu hũ non & cơm', 'Soft tofu stew with rice', 85, '🍲', 'kr', 'soup spicy', 'trua toi'],
  ['ga-pho-mai-han', 'Gà phô mai Hàn Quốc', 'Korean cheese chicken', 120, '🧀', 'kr', 'fried spicy', 'toi'],
  ['com-chien-kimchi', 'Cơm chiên kimchi', 'Kimchi fried rice', 65, '🍚', 'kr', 'rice fried spicy', 'trua'],
  ['com-bo-nuong-han', 'Cơm bò nướng Hàn', 'Korean grilled beef rice', 150, '🥩', 'kr', 'rice grill', 'trua toi'],
  ['com-suon-cay-han', 'Cơm sườn cay Hàn', 'Spicy Korean pork rice', 95, '🌶️', 'kr', 'rice spicy grill', 'trua toi'],

  // ---- Thái & Đông Nam Á ----
  ['pad-thai', 'Pad Thai', 'Pad Thai', 75, '🍤', 'th', 'noodle dry seafood', 'trua toi'],
  ['mi-tom-yum', 'Mì Tom Yum', 'Tom yum noodles', 80, '🍜', 'th', 'soup noodle spicy', 'trua toi'],
  ['com-ca-ri-thai', 'Cơm cà ri Thái', 'Thai curry rice', 110, '🍛', 'th', 'rice spicy', 'trua toi'],
  ['com-ga-som-tam', 'Cơm gà nướng & som tam', 'Grilled chicken with papaya salad', 95, '🍗', 'th', 'rice grill spicy', 'trua'],
  ['lau-thai', 'Lẩu Thái một người', 'Personal Thai hotpot', 130, '🍲', 'th', 'soup spicy', 'toi'],
  ['com-nieu-singapore', 'Cơm niêu Singapore', 'Singapore claypot rice', 85, '🍚', 'sea', 'rice', 'trua toi'],
  ['chao-ech', 'Cháo ếch Singapore', 'Singapore frog congee', 130, '🥣', 'sea', 'soup', 'toi'],
  ['laksa', 'Laksa', 'Laksa', 95, '🍜', 'sea', 'soup noodle spicy seafood', 'trua'],
  ['nasi-goreng', 'Cơm chiên Indonesia', 'Nasi goreng', 90, '🍚', 'sea', 'rice fried spicy', 'trua'],
  ['satay', 'Satay gà & cơm', 'Chicken satay with rice', 90, '🍢', 'sea', 'grill rice', 'trua toi'],
  ['mi-tron-indomie', 'Mì trộn Indomie', 'Indomie mi goreng', 30, '🍜', 'sea', 'noodle dry spicy', 'sang toi'],

  // ---- Ấn Độ & Trung Đông ----
  ['ca-ri-an-do', 'Cà ri Ấn Độ & naan', 'Indian curry with naan', 200, '🍛', 'in', 'spicy bread', 'toi'],
  ['biryani', 'Cơm biryani', 'Chicken biryani', 190, '🍛', 'in', 'rice spicy', 'toi'],
  ['tikka-masala', 'Gà tikka masala & cơm', 'Chicken tikka masala with rice', 180, '🍗', 'in', 'rice spicy', 'toi'],
  ['falafel', 'Falafel & bánh pita', 'Falafel with pita', 150, '🧆', 'mid', 'veg bread', 'trua'],
  ['shawarma', 'Shawarma', 'Shawarma', 90, '🌯', 'mid', 'bread grill', 'trua toi'],
  ['banh-mi-kebab', 'Bánh mì kebab', 'Doner kebab', 35, '🌯', 'mid', 'bread grill', 'sang trua'],
  ['hummus-bowl', 'Hummus bowl', 'Hummus bowl', 120, '🥙', 'mid', 'veg light', 'trua'],

  // ---- Âu ----
  ['pizza-pho-mai', 'Pizza phô mai', 'Cheese pizza', 100, '🍕', 'eu', 'bread', 'trua toi'],
  ['pizza-pepperoni', 'Pizza pepperoni', 'Pepperoni pizza', 120, '🍕', 'eu', 'bread', 'trua toi'],
  ['pizza-hai-san', 'Pizza hải sản', 'Seafood pizza', 160, '🍕', 'eu', 'bread seafood', 'toi'],
  ['mi-y-bo-bam', 'Mì Ý bò bằm', 'Spaghetti bolognese', 80, '🍝', 'eu', 'noodle', 'trua toi'],
  ['carbonara', 'Mì Ý sốt kem bacon', 'Carbonara', 115, '🍝', 'eu', 'noodle', 'trua toi'],
  ['pesto-pasta', 'Mì Ý pesto', 'Pesto pasta', 130, '🌿', 'eu', 'noodle', 'trua toi'],
  ['mi-y-ca-hoi', 'Mì Ý cá hồi', 'Salmon pasta', 190, '🍝', 'eu', 'noodle seafood', 'toi'],
  ['mi-y-hai-san', 'Mì Ý hải sản', 'Seafood pasta', 160, '🍝', 'eu', 'noodle seafood', 'toi'],
  ['lasagna', 'Lasagna bò', 'Beef lasagna', 125, '🧀', 'eu', 'bread', 'trua toi'],
  ['risotto', 'Cơm risotto', 'Risotto', 200, '🍚', 'eu', 'rice', 'toi'],
  ['gnocchi', 'Gnocchi', 'Gnocchi', 180, '🥔', 'eu', 'light', 'toi'],
  ['fish-and-chips', 'Fish & chips', 'Fish and chips', 170, '🍟', 'eu', 'fried seafood', 'toi'],
  ['bo-bit-tet', 'Bò bít tết', 'Beef steak', 180, '🥩', 'eu', 'grill', 'toi'],
  ['ca-hoi-ap-chao', 'Cá hồi áp chảo', 'Pan-seared salmon', 190, '🐟', 'eu', 'grill seafood', 'toi'],
  ['ga-nuong-khoai-tay', 'Gà nướng kèm khoai tây', 'Roast chicken and potatoes', 140, '🍗', 'eu', 'grill', 'toi'],
  ['salad-uc-ga', 'Salad ức gà', 'Chicken breast salad', 85, '🥗', 'eu', 'light', 'trua'],
  ['salad-ca-ngu', 'Salad cá ngừ', 'Tuna salad', 100, '🥗', 'eu', 'light seafood', 'trua'],
  ['salad-quinoa', 'Salad quinoa đậu gà', 'Quinoa chickpea salad', 115, '🥗', 'eu', 'light veg', 'trua'],
  ['buddha-bowl', 'Buddha bowl chay', 'Vegetarian buddha bowl', 110, '🥙', 'eu', 'veg light rice', 'trua'],

  // ---- Mỹ & Mexico ----
  ['suon-bbq', 'Sườn nướng BBQ', 'BBQ ribs', 210, '🍖', 'us', 'grill', 'toi'],
  ['burger-bo', 'Burger bò', 'Beef burger', 65, '🍔', 'us', 'bread fried', 'trua'],
  ['burger-pho-mai', 'Burger bò phô mai & khoai', 'Cheeseburger and fries', 120, '🍔', 'us', 'bread fried', 'trua toi'],
  ['burger-ga', 'Burger gà & khoai tây', 'Chicken burger and fries', 80, '🍔', 'us', 'bread fried', 'trua'],
  ['ga-ran', 'Gà rán', 'Fried chicken', 65, '🍗', 'us', 'fried', 'trua toi'],
  ['mac-and-cheese', 'Mac & cheese', 'Mac and cheese', 130, '🧀', 'us', 'noodle', 'trua toi'],
  ['hotdog', 'Hot dog', 'Hot dog', 45, '🌭', 'us', 'bread', 'sang trua'],
  ['sandwich', 'Sandwich', 'Sandwich', 70, '🥪', 'us', 'bread light', 'sang trua'],
  ['club-sandwich', 'Club sandwich', 'Club sandwich', 110, '🥪', 'us', 'bread', 'trua'],
  ['chicken-wrap', 'Bánh cuộn gà', 'Chicken wrap', 95, '🌯', 'us', 'bread', 'trua'],
  ['poke-ca-hoi', 'Poke cá hồi', 'Salmon poke bowl', 160, '🐟', 'us', 'light seafood rice', 'trua'],
  ['burrito', 'Burrito', 'Burrito', 150, '🌯', 'mx', 'rice spicy', 'trua toi'],
  ['taco', 'Taco', 'Tacos', 150, '🌮', 'mx', 'spicy', 'toi'],
  ['quesadilla', 'Quesadilla', 'Quesadilla', 140, '🫓', 'mx', 'bread', 'trua toi'],
  ['nachos', 'Nachos', 'Nachos', 110, '🧀', 'mx', 'spicy fried', 'toi'],
];

// Rough kcal for one typical portion as served in Vietnam, kept in a separate
// map so the rows above stay readable. These are estimates, not nutrition
// data: the same dish varies hugely by shop, by how much fat and rice ends up
// in the bowl, and by whether you finish the broth. The UI labels them
// approximate everywhere they appear, and they should never be treated as a
// medical or dietary reference.
const KCAL: Record<string, number> = {
  'com-tam': 620, 'pho-bo': 480, 'pho-ga': 430, 'pho-cuon': 350, 'pho-chay': 350,
  'banh-mi': 400, 'banh-mi-op-la': 480, 'banh-mi-chao': 650, 'banh-mi-chay': 330,
  'bun-cha': 620, 'bun-bo-hue': 550, 'bun-rieu': 450, 'bun-thit-nuong': 520,
  'bun-dau': 700, 'bun-ca': 430, 'bun-moc': 450, 'bun-mang-vit': 480,
  'bun-bo-nam-bo': 480, 'bun-mam': 520, 'bun-chay': 380, 'hu-tieu': 420,
  'hu-tieu-nam-vang': 480, 'mi-quang': 500, 'banh-canh-cua': 450,
  'banh-canh-gio-heo': 520, 'banh-canh-ghe': 480, 'banh-da-cua': 500,
  'mien-ga': 400, 'mien-luon': 450, 'mien-xao': 520, 'mi-cua': 520,
  'mi-tom-trung': 450, 'mi-xao-bo': 550, 'nui-xao-bo': 560, 'banh-cuon': 350,
  'banh-uot-thit-nuong': 420, 'banh-xeo': 600, 'banh-beo': 300,
  'banh-bot-loc': 320, 'banh-gio': 300, 'banh-hoi-heo-quay': 550,
  'nem-nuong': 520, 'goi-cuon': 300, 'goi-cuon-chay': 260, 'chao-suon': 320,
  'chao-ga': 350, 'chao-vit': 420, 'chao-long': 400, 'chao-hai-san': 380,
  'xoi-man': 550, 'xoi-ga': 520, 'com-ga-hoi-an': 600, 'com-ga-xoi-mo': 750,
  'com-ga-nuong-mat-ong': 650, 'com-binh-dan': 650, 'com-rang-dua-bo': 620,
  'com-suon-nuong': 700, 'com-cha-ca': 600, 'com-hen': 450, 'com-chay': 500,
  'com-tam-chay': 520, 'com-cari-chay': 600, 'thit-kho-trung': 650,
  'ga-kho-gung': 600, 'ca-kho-to': 580, 'canh-chua-ca': 450, 'bo-luc-lac': 700,
  'bo-ne': 750, 'bo-kho': 600, 'bo-nuong-la-lot': 550, 'ga-nuong-com-lam': 750,
  'lau-bo-ca-nhan': 700, 'lau-ca-keo': 650, 'lau-nam-chay': 450,
  'mi-nam-chay': 420, 'salad-dau-hu': 350, 'oc-luoc': 300,

  'com-xa-xiu': 650, 'com-vit-quay': 750, 'mi-xa-xiu': 520, 'mi-hoanh-thanh': 480,
  'mi-vit-tiem': 620, 'mi-bo-dai-loan': 600, 'mi-xao-gion': 700,
  'com-chien-hai-san': 700, 'com-ga-hai-nam': 680, dimsum: 550,

  ramen: 600, udon: 480, 'udon-xao': 620, soba: 420, 'sushi-ca-hoi': 400,
  sashimi: 350, 'com-ca-ri-nhat': 750, gyudon: 700, oyakodon: 680, katsudon: 850,
  tendon: 800, 'unagi-don': 750, 'saba-don': 650, 'salmon-teriyaki': 700,
  'com-ga-teriyaki': 680, bento: 700, okonomiyaki: 600, sukiyaki: 800,

  bibimbap: 600, kimbap: 400, tteokbokki: 500, 'mi-cay-han': 650,
  jajangmyeon: 700, naengmyeon: 500, 'mi-tron-han': 600, 'kimchi-jjigae': 550,
  sundubu: 500, 'ga-pho-mai-han': 900, 'com-chien-kimchi': 600,
  'com-bo-nuong-han': 750, 'com-suon-cay-han': 750,

  'pad-thai': 650, 'mi-tom-yum': 550, 'com-ca-ri-thai': 700,
  'com-ga-som-tam': 650, 'lau-thai': 650, 'com-nieu-singapore': 700,
  'chao-ech': 600, laksa: 600, 'nasi-goreng': 650, satay: 600,
  'mi-tron-indomie': 500,

  'ca-ri-an-do': 850, biryani: 800, 'tikka-masala': 780, falafel: 600,
  shawarma: 600, 'banh-mi-kebab': 500, 'hummus-bowl': 500,

  'pizza-pho-mai': 800, 'pizza-pepperoni': 900, 'pizza-hai-san': 850,
  'mi-y-bo-bam': 650, carbonara: 800, 'pesto-pasta': 700, 'mi-y-ca-hoi': 750,
  'mi-y-hai-san': 700, lasagna: 750, risotto: 700, gnocchi: 650,
  'fish-and-chips': 900, 'bo-bit-tet': 700, 'ca-hoi-ap-chao': 550,
  'ga-nuong-khoai-tay': 750, 'salad-uc-ga': 400, 'salad-ca-ngu': 420,
  'salad-quinoa': 450, 'buddha-bowl': 500,

  'suon-bbq': 950, 'burger-bo': 600, 'burger-pho-mai': 900, 'burger-ga': 800,
  'ga-ran': 700, 'mac-and-cheese': 750, hotdog: 400, sandwich: 400,
  'club-sandwich': 600, 'chicken-wrap': 550, 'poke-ca-hoi': 550, burrito: 800,
  taco: 600, quesadilla: 700, nachos: 700,
};

export const dishes: Dish[] = rows.map(([id, vi, en, price, emoji, cuisine, tags, meals]) => ({
  id,
  vi,
  en,
  price,
  emoji,
  cuisine,
  tags: tags ? (tags.split(' ') as Tag[]) : [],
  meals: meals.split(' ') as Meal[],
  rarity: priceRarity(price),
  // A missing entry means the KCAL table drifted out of sync with the rows;
  // fall back to a price-based guess rather than rendering NaN.
  kcal: KCAL[id] ?? Math.round(price * 7),
}));

export const dishById = new Map(dishes.map((d) => [d.id, d]));
