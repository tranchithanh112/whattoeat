import { memo } from 'react';
import { mapsUrl, priceBand, CITY_CENTRE, type Cafe, type CafeTag } from '@/lib/cafes';
import { copy, type Lang } from '@/lib/i18n';
import { Cup } from './CafeCard';

export const VIBE: Record<CafeTag, { vi: string; en: string; icon: string }> = {
  work: { vi: 'Ngồi làm việc', en: 'Work-friendly', icon: '💻' },
  quiet: { vi: 'Yên tĩnh', en: 'Quiet', icon: '🤫' },
  view: { vi: 'View đẹp', en: 'Good view', icon: '🌅' },
  garden: { vi: 'Sân vườn', en: 'Garden', icon: '🌿' },
  rooftop: { vi: 'Rooftop', en: 'Rooftop', icon: '🏙️' },
  vintage: { vi: 'Hoài cổ', en: 'Vintage', icon: '📻' },
  book: { vi: 'Cà phê sách', en: 'Books', icon: '📚' },
  photo: { vi: 'Chụp ảnh', en: 'Photogenic', icon: '📸' },
  late: { vi: 'Mở khuya', en: 'Open late', icon: '🌙' },
  pet: { vi: 'Có mèo', en: 'Cats', icon: '🐱' },
  chain: { vi: 'Chuỗi', en: 'Chain', icon: '🏪' },
};

// Labels only the café views use, so they stay out of the shared copy table.
const L = {
  vi: {
    rating: 'Đánh giá',
    reviews: 'lượt',
    price: 'Mức giá / người',
    noPrice: 'Maps chưa ghi mức giá',
    under: 'Dưới',
    over: 'Trên',
    branches: 'Chi nhánh',
    source:
      'Địa chỉ, đánh giá và mức giá theo Google Maps (10/09/2026). Mức giá là khoảng Maps ước tính cho một người, chỉ để tham khảo, không phải giá từng món.',
  },
  en: {
    rating: 'Rating',
    reviews: 'reviews',
    price: 'Price / person',
    noPrice: 'No price range on Maps',
    under: 'Under',
    over: 'Over',
    branches: 'Branches',
    source:
      'Address, rating and price range from Google Maps (10 Sept 2026). The price is the per-person range Maps estimates, a rough guide rather than a menu price.',
  },
} as const;

/** Maps' own price bucket, restated in thousands of đồng. */
export function priceText(price: string | undefined, lang: Lang): string {
  const band = priceBand(price);
  const l = L[lang];
  if (!band) return l.noPrice;
  if (band.hi === null) return `${l.over} ${band.lo}k`;
  if (band.lo <= 1) return `${l.under} ${band.hi}k`;
  return `${band.lo}k–${band.hi}k`;
}

type Props = {
  cafe: Cafe;
  lang: Lang;
  /** How many branches share this café's brand in the current city. */
  branches?: number;
  /** Play the pop-in animation: true for a reel result, false for a catalogue pick. */
  reveal?: boolean;
};

export const CafeInfo = memo(function CafeInfo({ cafe, lang, branches = 1, reveal = false }: Props) {
  const t = copy[lang];
  const l = L[lang];
  const count = (n: number) => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US').format(n);

  return (
    <div className={`cafe-result ${reveal ? 'reveal' : ''}`} role="status" aria-live="polite">
      <div className="cafe-hero">
        <Cup cafe={cafe} size="lg" />
        <div className="cafe-hero-copy">
          <strong>{cafe.name}</strong>
          <span className="cafe-where">
            {cafe.area} · {cafe.address}
          </span>
          <span className="cafe-meta">
            ~{cafe.km} km {t.fromCentre} {CITY_CENTRE[cafe.city]}
          </span>
        </div>
      </div>

      <dl className="cafe-facts">
        {cafe.rating !== undefined && (
          <div>
            <dt>{l.rating}</dt>
            <dd>
              ★ {cafe.rating.toFixed(1)}
              {cafe.reviews !== undefined && ` · ${count(cafe.reviews)} ${l.reviews}`}
            </dd>
          </div>
        )}
        <div>
          <dt>{l.price}</dt>
          <dd>{priceText(cafe.price, lang)}</dd>
        </div>
        {branches > 1 && (
          <div>
            <dt>{l.branches}</dt>
            <dd>{branches}</dd>
          </div>
        )}
      </dl>

      {cafe.tags.length > 0 && (
        <div className="chips">
          {cafe.tags.map((tag) => (
            <span key={tag} className="chip static">
              {VIBE[tag].icon} {VIBE[tag][lang]}
            </span>
          ))}
        </div>
      )}

      <a className="cta solid" href={mapsUrl(cafe)} target="_blank" rel="noreferrer noopener">
        {t.openMaps} ↗
      </a>

      <p className="hint">{l.source}</p>
    </div>
  );
});
