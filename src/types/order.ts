import {ProductInterface} from './product';

export interface OrderInterface {
  id: number;
  uniqid: string;
  token: string;
  products: ProductInterface[];
  discountCode: string;
  userid: number;
  price: number;
  gateway: string;
  shipment: string;
  address: boolean | AddressClass;
  transid: string;
  pcode: string;
  description_order: string;
  status: number;
  status_description: string;
  created_at: string;
  updated_at: string;
  shipment_price: number;
  rated: number;
  number_send_notify_scoring: number;
}

export interface AddressClass {
  id: number;
  userid: number;
  name: string;
  tel: string;
  provinceid: number;
  cityid: number;
  addr: string;
  pcode: string;
}
