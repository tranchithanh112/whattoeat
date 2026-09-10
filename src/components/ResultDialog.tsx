import { useEffect, useRef } from 'react';
import type { Dish } from '@/lib/dishes';
import { copy, dishName, dishSubtitle, priceLabel, quipFor, type Lang } from '@/lib/i18n';
import { Plate } from './DishCard';

type Props = {
  dish: Dish | null;
  lang: Lang;
  favorite: boolean;
  onFavorite: () => void;
  onBlock: () => void;
  onShare: () => void;
  onAgain: () => void;
  onClose: () => void;
  shareNote: string;
};

export function ResultDialog({
  dish,
  lang,
  favorite,
  onFavorite,
  onBlock,
  onShare,
  onAgain,
  onClose,
  shareNote,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const t = copy[lang];

  // Native <dialog> gives focus trapping, Escape handling and the top layer
  // for free — no focus-management library needed.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (dish && !node.open) node.showModal();
    if (!dish && node.open) node.close();
  }, [dish]);

  const query = dish ? encodeURIComponent(dish.vi) : '';

  return (
    <dialog ref={ref} className="result-dialog" onClose={onClose} onCancel={onClose}>
      {dish && (
        <div className={`result rarity-${dish.rarity}`}>
          <span className="result-label">{t.result}</span>
          <Plate dish={dish} size="lg" />
          <h2>{dishName(dish, lang)}</h2>
          <p className="result-sub">{dishSubtitle(dish, lang)}</p>
          <p className="result-price">
            {t.referencePrice} · <strong>{priceLabel(dish.price, lang, true)}</strong> {t.perPerson}
          </p>
          <p className="result-quip">{quipFor(dish, lang)}</p>

          <div className="result-links">
            <a
              className="cta"
              href={`https://www.google.com/maps/search/?api=1&query=${query}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {t.findNearby} ↗
            </a>
            <a
              className="cta ghost"
              href={`https://food.grab.com/vn/vi/restaurants?search=${query}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {t.orderGrab} ↗
            </a>
            <a
              className="cta ghost"
              href={`https://shopeefood.vn/ho-chi-minh/danh-sach-dia-diem-phuc-vu-mon-${query}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {t.orderShopee} ↗
            </a>
          </div>

          <div className="result-actions">
            <button type="button" className={favorite ? 'on' : ''} onClick={onFavorite}>
              ★ {favorite ? t.unfavorite : t.favorite}
            </button>
            <button type="button" onClick={onBlock}>
              ⊘ {t.block}
            </button>
            <button type="button" onClick={onShare}>
              ↗ {shareNote || t.share}
            </button>
          </div>

          <div className="result-footer">
            <button type="button" className="cta solid" onClick={onAgain}>
              {t.again}
            </button>
            <button type="button" className="link-button" onClick={onClose}>
              {t.close}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
