import {getJson, fetch} from '@alwatr/fetch';
import {preloadIcon} from '@alwatr/icon';
import {Task} from '@lit-labs/task';
import {css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {map} from 'lit/directives/map.js';
import {range} from 'lit/directives/range.js';

import {AppElement} from '../helpers/app-element';
import {AddressInterface} from '../types/address';
import {phoneNumberFormat} from '../utilities/phone-number';
import {responseMessage} from '../utilities/response-message';

import type {CartInterface, ProductCart, TotalPriceData} from '../types/cart';
import type {FetchData, FetchJson} from '../types/fetch';
import type {ShipmentInterface} from '../types/shipment';
import type {RadioGroupCustomEvent} from '@ionic/core';
import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'page-cart': PageCart;
  }
}

/**
 * APP PWA Cart Page Element
 *
 * ```html
 * <page-cart></page-cart>
 * ```
 */
@customElement('page-cart')
export class PageCart extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: flex;
        flex-direction: column;
      }
      ion-item ion-buttons {
        margin-inline-start: 8px !important;
      }
      ion-card {
        --ion-item-background: var(--ion-color-primary-contrast);
        --ion-item-background-rgb: var(--ion-color-primary-contrast-rgb);
      }
      .text-medium {
        color: var(--ion-color-step-600);
      }
      .financial ion-item {
        --min-height: 32px;
      }
      .financial ion-item ion-label {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }

      ion-item.address ion-label {
        white-space: normal !important;
      }
      ion-item.address h2 {
        margin-bottom: 8px;
      }
      ion-item.address h4 {
        color: var(--ion-color-step-800) !important;
      }
      ion-item.address ion-text[color='medium'] {
        --ion-color-medium: var(--ion-color-step-600) !important;
      }
      ion-item.address span {
        display: inline-block;
        white-space: normal;
      }
      ion-item.address span.number {
        direction: ltr;
      }
      ion-item.shipment ion-label p {
        white-space: normal;
        line-height: normal;
      }
    `,
    css`
      .discount {
        display: flex;
        gap: 8px;
      }
      ins,
      del {
        display: inline-flex;
        width: min-content;
        font-size: 13px;
        gap: 8px;
        color: var(--ion-color-step-600);
      }
      ins {
        flex-grow: 1;
        text-decoration: none;
        font-weight: bold;
        color: var(--ion-color-dark, #222428);
      }
      ins::after {
        content: 'تومان';
        color: var(--ion-color-step-700);
        font-weight: lighter;
      }
    `,
  ];

  @state() protected _address?: AddressInterface;
  @state() protected _shipment?: ShipmentInterface;

  protected _addressListTask = new Task(
    this,
    async (): Promise<FetchData<AddressInterface[]>> => {
      const data = await getJson<FetchData<AddressInterface[]> | FetchJson<'error'>>({
        url: 'https://api.farazmed.com/api/v3/address/list',
        queryParameters: {
          api_token: localStorage.getItem('token') ?? '',
        },
      }).then((data) => responseMessage<AddressInterface[]>(data));

      if (data.status === 'error') {
        throw new Error(data.message);
      }

      this._address = data.data[0];

      return data;
    },
    () => []
  );
  protected _shipmentListTask = new Task(
    this,
    async (): Promise<FetchData<ShipmentInterface[]>> => {
      const data = await getJson<FetchData<ShipmentInterface[]> | FetchJson<'error'>>({
        url: 'https://api.farazmed.com/api/v3/shipments',
      }).then((data) => responseMessage<ShipmentInterface[]>(data));

      if (data.status === 'error') {
        throw new Error(data.message);
      }

      this._shipment = data.data[0];

      return data;
    },
    () => []
  );
  protected _cartTask = new Task(
    this,
    async (): Promise<FetchData<CartInterface>> => {
      const data = await getJson<FetchData<CartInterface> | FetchJson<'error'>>({
        url: 'https://api.farazmed.com/api/v3/cart',
        queryParameters: {
          api_token: localStorage.getItem('token') ?? '',
        },
      }).then((data) => responseMessage<CartInterface>(data));

      if (data.status === 'error') {
        throw new Error(data.message);
      }

      const promisedData = data.data.products.map(async (product) => {
        product.ProductInfo['imageElem'] = await new Promise((resolve) => {
          const image = new Image();

          image.addEventListener('load', () => {
            resolve(image);
          });

          image.alt = product.ProductInfo.en_name;
          image.src = product.ProductInfo.image;
        });

        return product;
      });

      data.data.products = await Promise.all(promisedData);

      return data;
    },
    () => []
  );
  protected _cartRemoveTask = new Task(this, async ([id]): Promise<void> => {
    const bodyJson = {
      api_token: localStorage.getItem('token') ?? '',
      id,
    };
    const data = await fetch({
      url: 'https://api.farazmed.com/api/v3/cart/remove',
      method: 'POST',
      body: JSON.stringify(bodyJson),
      bodyJson,
    })
      .then((res) => res.json())
      .then((data) => responseMessage<CartInterface>(data));

    if (data.status === 'error') {
      throw new Error(data.message);
    }

    this._cartTask.run();
  });

  override connectedCallback(): void {
    super.connectedCallback();

    preloadIcon('close-outline');
    preloadIcon('card-outline');
  }
  override render(): TemplateResult {
    return html`
      <ion-header>
        <ion-toolbar color="secondary">
          <ion-title>سبد خرید</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content fullscreen>
        ${this._cartTask.render({
          pending: () => this._renderSkeleton(6),
          complete: (cart) => this._renderCartList(cart.data.products),
        })}
        ${this._shipmentListTask.render({
          pending: () => this._renderSkeleton(3),
          complete: (data) => this._renderShipmentListCard(data.data),
        })}
        ${this._addressListTask.render({
          complete: (data) => this._renderAddressListCard(data.data),
        })}
        ${this._cartTask.render({
          pending: () => this._renderSkeleton(3),
          complete: (cart) => this._renderFinancialCard(cart.data.TotalPriceData),
        })}
      </ion-content>
    `;
  }

  protected _renderCartList(productList: ProductCart[]): TemplateResult {
    const productListTemplate = map(productList, (product, index) =>
      this._renderCartCard(product, index, productList.length)
    );

    return html`
      <ion-card>
        <ion-card-header>
          <ion-card-title>محصولات</ion-card-title>
        </ion-card-header>

        <ion-list lines="full"> ${productListTemplate} </ion-list>
      </ion-card>
    `;
  }
  protected _renderCartCard(product: ProductCart, index: number, total: number): TemplateResult {
    const image =
      product.ProductInfo.imageElem ??
      html`<img src=${product.ProductInfo.image} alt=${product.ProductInfo.en_name} />`;
    const price = product.totalPrice.oldPrice.toLocaleString('fa');
    const discount = product.totalPrice.totalPrice.toLocaleString('fa');

    const isDiscount =
      product.totalPrice.totalDiscount != 0 && product.totalPrice.totalPrice != product.totalPrice.oldPrice;

    const discountTemplate = isDiscount
      ? html`
          <del>${price}</del>
          <ins>${discount}</ins>
        `
      : html`<ins>${price}</ins>`;

    const delCart = (event: PointerEvent): void => {
      event.preventDefault();
      this._cartRemoveTask.run([product.cart_id]);
    };

    return html`
      <ion-item .lines=${index === total - 1 ? 'none' : undefined}>
        <ion-thumbnail slot="start"> ${image} </ion-thumbnail>

        <ion-label>
          <h3>${product.ProductInfo.fa_name}</h3>
          <div class="discount">${discountTemplate}</div>
        </ion-label>

        <ion-buttons slot="end">
          <ion-button color="danger" @click=${delCart}>
            <alwatr-icon flip-rtl dir="rtl" slot="icon-only" name="close-outline"></alwatr-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    `;
  }
  protected _renderFinancialCard(TotalPriceData: TotalPriceData): TemplateResult {
    const shipmentPrice = this._shipment?.price ? this._shipment.price.toLocaleString('fa-IR') + ' تومان' : 'پس کرایه';

    return html`
      <ion-card class="financial">
        <ion-card-header>
          <ion-card-title>تکمیل سفارش</ion-card-title>
        </ion-card-header>

        <ion-list lines="none">
          <ion-item>
            <ion-label>
              <h3>جمع کل</h3>
            </ion-label>
            <ion-label slot="end">
              <h3 class="text-medium">${TotalPriceData.final_totalOldPrice.toLocaleString('fa-IR')} تومان</h3>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h3>سود شما از این خرید</h3>
            </ion-label>
            <ion-label slot="end">
              <h3 class="text-medium">${TotalPriceData.final_totalDiscountPrice.toLocaleString('fa-IR')} تومان</h3>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h3>هزینه ارسال</h3>
            </ion-label>
            <ion-label slot="end">
              <h3 class="text-medium">${shipmentPrice}</h3>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h3>مبلغ قابل پرداخت</h3>
            </ion-label>
            <ion-label slot="end">
              <h3 class="text-medium">
                ${(TotalPriceData.final_totalPrice + (this._shipment?.price ?? 0)).toLocaleString('fa-IR')} تومان
              </h3>
            </ion-label>
          </ion-item>
        </ion-list>
        <ion-button expand="block" color="success" class="ion-margin-horizontal ion-margin-bottom">
          <alwatr-icon flip-rtl dir="rtl" name="card-outline" slot="start"></alwatr-icon>
          <ion-label>پرداخت</ion-label>
        </ion-button>
      </ion-card>
    `;
  }
  protected _renderAddressListCard(addressList: AddressInterface[]): TemplateResult {
    const addressListTemplate = map(
      addressList,
      (address, index) => html`
        <ion-item class="address" .lines=${index === addressList.length - 1 ? 'none' : undefined}>
          <ion-radio slot="start" value=${address.id}></ion-radio>
          <ion-label>
            <h2>${address.province} - ${address.city}</h2>
            <h4>
              <ion-text color="medium"> تحویل گیرنده: </ion-text>
              <span>${address.name}</span>
              <span class="number">${phoneNumberFormat(address.tel)}</span>
            </h4>
            <h4>
              <ion-text color="medium"> آدرس: </ion-text>
              ${address.addr}
            </h4>
          </ion-label>
        </ion-item>
      `
    );

    return html`
      <ion-card>
        <ion-card-header>
          <ion-card-title>انتخاب آدرس</ion-card-title>
        </ion-card-header>

        <ion-list lines="full">
          <ion-radio-group name="address" value=${ifDefined(this._address?.id)} @ionChange=${this._addressChange}>
            ${addressListTemplate}
          </ion-radio-group>
        </ion-list>
      </ion-card>
    `;
  }
  protected _renderShipmentListCard(shipmentList: ShipmentInterface[]): TemplateResult {
    const addressListTemplate = map(shipmentList, (shipment, index) => {
      const shipmentPrice = shipment.price ? shipment.price.toLocaleString('fa-IR') : 'پس کرایه';

      return html`
        <ion-item class="shipment" .lines=${index === shipmentList.length - 1 ? 'none' : undefined}>
          <ion-radio slot="start" value=${shipment.id}></ion-radio>
          <ion-label>
            <p>${shipment.name}</p>
            <p>هزینه ارسال: ${shipmentPrice}</p>
          </ion-label>
        </ion-item>
      `;
    });

    return html`
      <ion-card>
        <ion-card-header>
          <ion-card-title>روش ارسال</ion-card-title>
        </ion-card-header>

        <ion-list lines="full">
          <ion-radio-group name="shipment" value=${ifDefined(this._shipment?.id)} @ionChange=${this._shipmentChange}>
            ${addressListTemplate}
          </ion-radio-group>
        </ion-list>
      </ion-card>
    `;
  }
  protected _renderSkeleton(count = 4): TemplateResult {
    const itemsTemplate = map(
      range(count),
      (i) => html`
        <ion-item .lines=${i === count - 1 ? 'none' : undefined}>
          <ion-thumbnail slot="start">
            <ion-skeleton-text animated></ion-skeleton-text>
          </ion-thumbnail>

          <ion-label>
            <ion-skeleton-text animated style="width: 70%"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 60%"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 50%"></ion-skeleton-text>
          </ion-label>
        </ion-item>
      `
    );

    return html`
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-skeleton-text animated style="width: 100%"></ion-skeleton-text>
          </ion-card-title>
          <ion-card-subtitle>
            <ion-skeleton-text animated style="width: 90%"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 80%"></ion-skeleton-text>
          </ion-card-subtitle>
        </ion-card-header>

        <ion-list lines="full"> ${itemsTemplate} </ion-list>
      </ion-card>
    `;
  }

  protected _shipmentChange(event: RadioGroupCustomEvent<string>): void {
    const newShipment = this._shipmentListTask.value?.data?.find((s) => s.id === Number(event.detail.value));

    this._logger.logMethodArgs('_shipmentChange', {event, newShipment});

    if (newShipment) {
      this._shipment = newShipment;
    }
  }
  protected _addressChange(event: RadioGroupCustomEvent<string>): void {
    const newAddress = this._addressListTask.value?.data?.find((s) => s.id === Number(event.detail.value));

    this._logger.logMethodArgs('_addressChange', {event, newAddress});

    if (newAddress) {
      this._address = newAddress;
    }
  }
}
