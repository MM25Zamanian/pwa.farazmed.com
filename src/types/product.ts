export interface FavoriteProductInterface extends ProductInterface {
  pid: number;
}

export interface ProductInterface {
  id: number;
  fa_name: string;
  en_name: string;
  description: string;
  brandInfo: string;
  catinfo: string;
  attr: Record<string, Record<string, string[]>>;
  gallery: string[];
  image: string;
  imageElem?: HTMLImageElement;
  quantity: string;
  variant: Variant;
}

export interface Variant {
  variant_selected_default: Partial<VariantSelectedDefaultElement> & {totalPrice: TotalPrice};
  variant_items: VariantSelectedDefaultElement[];
}

export interface VariantSelectedDefaultElement {
  id: number;
  product_id: string;
  variant_attr_id: string;
  price: string;
  Inventory: string;
  discount: string;
  variantAttrInfo: VariantAttrInfo;
  totalPrice: TotalPrice;
}

export interface TotalPrice {
  totalPrice: string;
  totalDiscount: string;
  oldPrice: string;
  is_special: boolean;
  quantity: string;
}

export interface VariantAttrInfo {
  id: number;
  title: string;
  variant_id: string;
  data: unknown[];
}
