import {isNumber} from '@alwatr/math';
import {html} from 'lit';

import type {Route} from '../types/route';

import '../pages/page-product-list';
import '../pages/page-product-detail';
import '../pages/page-login';
import '../pages/page-profile';
import '../pages/page-profile-edit';
import '../pages/page-cart';

const routes: Record<string, Route> = {
  products: {
    title: 'محصولات',
    icon: 'grid',
    show_in_bar: true,
    render: (route) => {
      const productId = route.sectionList[1] as string | undefined;

      if (productId && isNumber(productId)) {
        return html`<page-product-detail class="ion-page" .pid=${productId}></page-product-detail>`;
      }

      return html`<page-product-list class="ion-page"></page-product-list>`;
    },
  },
  cart: {
    title: 'سبد خرید',
    icon: 'cart',
    get show_in_bar(): boolean {
      return localStorage.getItem('token') != null;
    },
    render: () => {
      return html`<page-cart class="ion-page"></page-cart>`;
    },
  },
  profile: {
    title: 'پروفایل',
    icon: 'person',
    get show_in_bar(): boolean {
      return localStorage.getItem('token') != null;
    },
    render: () => {
      return html`<page-profile class="ion-page"></page-profile>`;
    },
  },
  'profile-edit': {
    title: 'ویرایش پروفایل',
    icon: 'person',
    show_in_bar: false,
    render: () => {
      return html`<page-profile-edit class="ion-page"></page-profile-edit>`;
    },
  },
  'log-in': {
    title: 'ورود',
    icon: 'log-in',
    get show_in_bar(): boolean {
      return localStorage.getItem('token') == null;
    },
    render: () => {
      return html`<page-login class="ion-page"></page-login>`;
    },
  },
};

export default routes;
