import type {ProductInterface} from './product';

export interface CartInterface extends Record<string, unknown> {
  products: ProductCart[];
  TotalPriceData: TotalPriceData;
  countProduct: number;
}

export interface ProductCart {
  cart_id: number;
  quantityInCart: number;
  ProductInfo: ProductInterface;
  ProductVariantInfo: ProductVariantInfo;
  variantAttrInfo: VariantAttrInfo;
  totalPrice: TotalPrice;
}

export interface TotalPrice {
  totalPrice: number;
  totalDiscount: number;
  oldPrice: number;
  is_special: boolean;
  quantity: number;
}

export interface ProductVariantInfo {
  id: number;
  product_id: number;
  variant_attr_id: number;
  price: number;
  Inventory: number;
  discount: number;
}

export interface VariantAttrInfo {
  id: number;
  title: string;
  variant_id: number;
}

export interface TotalPriceData {
  final_totalPrice: number;
  final_totalOldPrice: number;
  final_totalDiscountPrice: number;
}
