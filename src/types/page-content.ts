import type {BannerRowInterface, InfoBannerRowInterface} from './banner';
import type {FetchProductScroller, ProductScroller} from './product-scroller';

export type PageContent =
  | {
      type: 'banner';
      data: Record<string, InfoBannerRowInterface>;
    }
  | {
      type: 'scroller';
      data: ProductScroller;
    };

export type FetchPageContent =
  | {
      type: 'banner';
      data: Record<string, BannerRowInterface>;
    }
  | {
      type: 'scroller';
      data: FetchProductScroller;
    };
