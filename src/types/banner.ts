export interface BannerRowInterface {
  banners: Banner[];
}
export interface InfoBannerRowInterface {
  banners: InfoBanner[];
}

export type Banner = InfoBanner | CategoryBanner;

export interface CategoryBanner {
  categoryId: string;
}
export interface InfoBanner {
  label: string;
  src: string;
  href?: string;
  imageElement?: HTMLImageElement;
}
