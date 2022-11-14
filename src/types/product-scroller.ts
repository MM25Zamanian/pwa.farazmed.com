import type {MultiLanguageStringType} from './language';
import type {ProductInterface} from './product';

export type ProductScroller = {
  title: MultiLanguageStringType;
  href?: string;
  productList: Record<string, ProductInterface>;
};

export type FetchProductScroller = {
  title: MultiLanguageStringType;
  href?: string;
  productIdList: [];
};
