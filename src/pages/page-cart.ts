import {getJson, fetch} from '@alwatr/fetch';
import {Task} from '@lit-labs/task';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {map} from 'lit/directives/map.js';
import {range} from 'lit/directives/range.js';

import {AppElement} from '../helpers/app-element';
import {responseMessage} from '../utilities/response-message';

import type {CartInterface, ProductCart, TotalPriceData} from '../types/cart';
import type {FetchData, FetchJson} from '../types/fetch';
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

  protected _listenerList: Array<unknown> = [];
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
          complete: (cart) => [
            this._renderCartList(cart.data.products),
            this._renderFinancialCard(cart.data.TotalPriceData),
          ],
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
      this._cartRemoveTask.run([product.ProductInfo.id]);
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
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    `;
  }
  protected _renderFinancialCard(TotalPriceData: TotalPriceData): TemplateResult {
    return html`
      <ion-card class="financial">
        <ion-card-header>
          <ion-card-title>محصولات</ion-card-title>
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
              <h3>مبلغ قابل پرداخت</h3>
            </ion-label>
            <ion-label slot="end">
              <h3 class="text-medium">${TotalPriceData.final_totalPrice.toLocaleString('fa-IR')} تومان</h3>
            </ion-label>
          </ion-item>
        </ion-list>
        <ion-button expand="block" color="success" class="ion-margin-horizontal ion-margin-bottom">
          <ion-icon name="card-outline" slot="start"></ion-icon>
          <ion-label>پرداخت</ion-label>
        </ion-button>
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
}
