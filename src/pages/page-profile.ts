import {fetch, getJson} from '@alwatr/fetch';
import {preloadIcon} from '@alwatr/icon';
import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {Task} from '@lit-labs/task';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {map} from 'lit/directives/map.js';
import {range} from 'lit/directives/range.js';

import {AppElement} from '../helpers/app-element';
import {OrderInterface} from '../types/order';
import {bankNumberFormat} from '../utilities/bank-number';
import {phoneNumberFormat} from '../utilities/phone-number';
import {responseMessage} from '../utilities/response-message';

import '../components/pc-ard';

import type {AddressInterface} from '../types/address';
import type {FetchData, FetchJson} from '../types/fetch';
import type {FavoriteProductInterface} from '../types/product';
import type {UserInterface} from '../types/user';
import type {TemplateResult, CSSResult} from 'lit';


declare global {
  interface HTMLElementTagNameMap {
    'page-profile': PageProfile;
  }
}

@customElement('page-profile')
export class PageProfile extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: flex;
        flex-direction: column;
        --ion-item-background: var(--ion-card-background);
      }
      ion-list {
        padding-bottom: 0 !important;
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
      ion-item.images ion-row {
        padding-bottom: 8px;
        gap: 4px;
        overflow: hidden;
        flex-wrap: nowrap;
      }
      ion-item.images ion-row ion-thumbnail {
        padding: 0 4px;
        border-left: 1px solid var(--ion-color-step-100);
        width: calc(var(--size, 48px) + 8px);
      }
      ion-item.images ion-row ion-thumbnail:last-child {
        border: none;
      }
    `,
  ];

  protected _listenerList: Array<unknown> = [];
  protected _toastMessageSignal = new SignalInterface('toast-message');
  protected _informationTask = new Task(
    this,
    async (): Promise<FetchData<UserInterface>> => {
      const data = await getJson<FetchData<UserInterface> | FetchJson<'error'>>({
        url: 'https://api.farazmed.com/api/v3/user',
        cacheStrategy: 'stale_while_revalidate',
        cacheStorageName: 'farazmed',
        queryParameters: {
          api_token: localStorage.getItem('token') ?? '',
        },
      }).then((data) => responseMessage<UserInterface>(data));

      if (data.status === 'error') {
        throw new Error(data.message);
      }

      return data;
    },
    () => []
  );
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

      return data;
    },
    () => []
  );
  protected _addressDeleteTask = new Task(this, async ([id]): Promise<void> => {
    const bodyJson = {
      api_token: localStorage.getItem('token') ?? '',
      id,
    };
    const data = await fetch({
      url: 'https://api.farazmed.com/api/v3/address/delete',
      method: 'POST',
      body: JSON.stringify(bodyJson),
      bodyJson,
    })
      .then((response) => response.json())
      .then((data) => responseMessage<undefined>(data));

    if (data.status === 'error') {
      throw new Error(data.message);
    }

    this._addressListTask.run();
  });
  protected _favoriteListTask = new Task(
    this,
    async (): Promise<FetchData<FavoriteProductInterface[]>> => {
      const data = await getJson<FetchData<FavoriteProductInterface[]> | FetchJson<'error'>>({
        url: 'https://api.farazmed.com/api/v3/favorites',
        queryParameters: {
          api_token: localStorage.getItem('token') ?? '',
        },
      }).then((data) => responseMessage<FavoriteProductInterface[]>(data));

      if (data.status === 'error') {
        throw new Error(data.message);
      }

      const promisedData = data.data.map(async (product) => {
        product['imageElem'] = await new Promise((resolve) => {
          const image = new Image();

          image.addEventListener('load', () => {
            resolve(image);
          });

          image.alt = product.en_name;
          image.src = product.image;
        });

        return product;
      });

      data.data = await Promise.all(promisedData);

      return data;
    },
    () => []
  );
  protected _favoriteDeleteTask = new Task(this, async ([pid]): Promise<void> => {
    const bodyJson = {
      api_token: localStorage.getItem('token') ?? '',
      pid,
    };
    const data = await fetch({
      url: 'https://api.farazmed.com/api/v3/favorites/delete',
      method: 'POST',
      body: JSON.stringify(bodyJson),
      bodyJson,
    })
      .then((response) => response.json())
      .then((data) => responseMessage<undefined>(data));

    if (data.status === 'error') {
      throw new Error(data.message);
    }

    this._favoriteListTask.run();
  });
  protected _orderListTask = new Task(
    this,
    async (): Promise<FetchData<OrderInterface[]>> => {
      const data = await getJson<FetchData<OrderInterface[]> | FetchJson<'error'>>({
        url: 'https://api.farazmed.com/api/v3/orders',
        queryParameters: {
          api_token: localStorage.getItem('token') ?? '',
        },
      }).then((data) => responseMessage<OrderInterface[]>(data));

      if (data.status === 'error') {
        throw new Error(data.message);
      }

      const promisedData = data.data.map(async (order) => {
        const promisedProducts = order.products.map(async (product) => {
          product['imageElem'] = await new Promise((resolve) => {
            const image = new Image();

            image.addEventListener('load', () => {
              resolve(image);
            });

            image.alt = product.en_name;
            image.src = product.image;
          });

          return product;
        });

        order.products = await Promise.all(promisedProducts);

        return order;
      });

      data.data = await Promise.all(promisedData);

      return data;
    },
    () => []
  );

  override connectedCallback(): void {
    super.connectedCallback();

    preloadIcon('person-outline');
    preloadIcon('call-outline');
    preloadIcon('card-outline');
    preloadIcon('log-out-outline');
    preloadIcon('add-outline');
    preloadIcon('close-outline');
    preloadIcon('arrow-forward-outline');

    if (localStorage.getItem('token') == null) {
      router.signal.request({
        pathname: router.makeUrl({
          sectionList: ['log-in'],
        }),
      });
    }
  }
  override render(): TemplateResult {
    return html`
      <ion-header>
        <ion-toolbar color="secondary">
          <ion-title>
            ${this._informationTask.render({
              pending: () => html` <ion-skeleton-text animated style="width: 100%"></ion-skeleton-text> `,
              complete: (value) => `پروفایل ${value.data.name}`,
            })}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content fullscreen>
        ${this._informationTask.render({
          pending: () => this._renderSkeletonCard(2),
          complete: (value) => [this._renderInformationCard(value.data)],
        })}
        ${this._addressListTask.render({
          pending: () => this._renderSkeletonCard(4),
          complete: (value) => [this._renderAddressListCard(value.data)],
        })}
        ${this._favoriteListTask.render({
          pending: () => this._renderSkeletonCard(6),
          complete: (value) => [this._renderFavoriteListCard(value.data)],
        })}
        ${this._orderListTask.render({
          pending: () => this._renderSkeletonCard(6),
          complete: (value) => [this._renderOrderListCard(value.data)],
        })}
      </ion-content>
    `;
  }

  protected _renderSkeletonCard(items = 10): TemplateResult {
    const itemsTemplate = map(
      range(items),
      () => html`
        <ion-item>
          <ion-thumbnail slot="start">
            <ion-skeleton-text animated></ion-skeleton-text>
          </ion-thumbnail>
          <ion-label>
            <h2>
              <ion-skeleton-text animated style="width: 80%"></ion-skeleton-text>
            </h2>
            <h3>
              <ion-skeleton-text animated style="width: 60%"></ion-skeleton-text>
            </h3>
          </ion-label>
        </ion-item>
      `
    );

    return html`
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-skeleton-text animated style="width: 100%"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 90%"></ion-skeleton-text>
          </ion-card-title>
          <ion-card-subtitle>
            <ion-skeleton-text animated style="width: 60%"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 50%"></ion-skeleton-text>
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <ion-list>${itemsTemplate}</ion-list>
        </ion-card-content>
      </ion-card>
    `;
  }
  protected _renderInformationCard(information: UserInterface): TemplateResult {
    const itemTemplate = (icon: string, name: string, value: string): TemplateResult => html`
      <ion-item>
        <alwatr-icon flip-rtl dir="rtl" slot="start" name="${icon}-outline" class="ion-margin-end"></alwatr-icon>
        <ion-label class="ion-margin-end">
          <ion-text color="dark">
            <h4>${name}</h4>
          </ion-text>
        </ion-label>
        <ion-label slot="end">
          <h4>${value}</h4>
        </ion-label>
      </ion-item>
    `;
    const logout = (): void => {
      localStorage.removeItem('token');

      router.signal.request({
        pathname: router.makeUrl({
          sectionList: ['log-in'],
        }),
      });
    };

    return html`
      <ion-card>
        <ion-card-header class="ion-no-padding ion-padding-vertical">
          <ion-item lines="none">
            <ion-card-title>اطلاعات کاربر</ion-card-title>

            <ion-buttons slot="end">
              <ion-button color="tertiary" href=${router.makeUrl({sectionList: ['profile-edit']})}>
                <alwatr-icon flip-rtl dir="rtl" slot="icon-only" name="settings-outline"></alwatr-icon>
              </ion-button>
            </ion-buttons>
          </ion-item>
        </ion-card-header>

        <ion-card-content class="ion-no-padding">
          <ion-list lines="none">
            ${itemTemplate('person', 'نام و نام خانوادگی', information.name)}
            ${itemTemplate('call', 'شماره تلفن', phoneNumberFormat(information.mobile))}
            ${itemTemplate('card', 'شماره کارت', bankNumberFormat(information.card))}
          </ion-list>
          <ion-button
            class="ion-margin-horizontal ion-margin-bottom"
            expand="block"
            fill="solid"
            color="danger"
            @click=${logout}
          >
            <alwatr-icon flip-rtl dir="rtl" slot="start" name="log-out-outline"></alwatr-icon>
            <ion-label>خروج</ion-label>
          </ion-button>
        </ion-card-content>
      </ion-card>
    `;
  }
  protected _renderAddressListCard(addressList: AddressInterface[]): TemplateResult {
    const addressItemsTemplate = map(addressList, (address, index) =>
      this._renderAddressItem(address, index, addressList.length)
    );

    return html`
      <ion-card>
        <ion-card-header class="ion-no-padding ion-padding-vertical">
          <ion-item lines="none">
            <ion-card-title>آدرس ها</ion-card-title>

            <ion-buttons slot="end">
              <ion-button color="tertiary">
                <alwatr-icon flip-rtl dir="rtl" slot="icon-only" name="add-outline"></alwatr-icon>
              </ion-button>
            </ion-buttons>
          </ion-item>
        </ion-card-header>

        <ion-card-content class="ion-no-padding">
          <ion-list lines="full"> ${addressItemsTemplate} </ion-list>
        </ion-card-content>
      </ion-card>
    `;
  }
  protected _renderAddressItem(address: AddressInterface, index: number, total: number): TemplateResult {
    const delAddress = (event: PointerEvent): void => {
      event.preventDefault();
      this._addressDeleteTask.run([address.id]);
    };

    return html`
      <ion-item class="address" .lines=${index === total - 1 ? 'none' : undefined}>
        <ion-label>
          <h2>${address.province} - ${address.city}</h2>
          <h4>
            <ion-text color="medium"> نام تحویل گیرنده: </ion-text>
            <span>${address.name}</span>
          </h4>
          <h4>
            <ion-text color="medium"> شماره تحویل گیرنده: </ion-text>
            <span>${phoneNumberFormat(address.tel)}</span>
          </h4>
          <h4>
            <ion-text color="medium"> آدرس: </ion-text>
            ${address.addr}
          </h4>
        </ion-label>

        <ion-buttons slot="end" class="ion-no-margin">
          <ion-button color="danger" @click=${delAddress}>
            <alwatr-icon flip-rtl dir="rtl" slot="icon-only" name="close-outline"></alwatr-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    `;
  }
  protected _renderFavoriteListCard(favoriteList: FavoriteProductInterface[]): TemplateResult {
    const favoriteListTemplate = map(favoriteList.slice(0, 12), (product, index) =>
      this._renderFavoriteItem(product, index, favoriteList.length)
    );

    return html`
      <ion-card>
        <ion-card-header class="ion-no-padding ion-padding-vertical">
          <ion-item lines="none">
            <ion-card-title>علاقه مندی ها</ion-card-title>

            <ion-buttons slot="end">
              <ion-button color="tertiary">
                <alwatr-icon flip-rtl dir="rtl" slot="icon-only" name="arrow-forward-outline"></alwatr-icon>
              </ion-button>
            </ion-buttons>
          </ion-item>
        </ion-card-header>

        <ion-card-content class="ion-no-padding">
          <ion-list lines="full"> ${favoriteListTemplate} </ion-list>
        </ion-card-content>
      </ion-card>
    `;
  }
  protected _renderFavoriteItem(product: FavoriteProductInterface, index: number, total: number): TemplateResult {
    const image = product.imageElem ?? html`<img src=${product.image} alt=${product.en_name} />`;
    const delFavorite = (event: PointerEvent): void => {
      event.preventDefault();
      this._favoriteDeleteTask.run([product.pid]);
    };

    return html`
      <ion-item
        href=${router.makeUrl({sectionList: ['products', product.id]})}
        .lines=${index === total - 1 ? 'none' : undefined}
      >
        <ion-thumbnail slot="start"> ${image} </ion-thumbnail>

        <ion-label>
          <h2>${product.fa_name}</h2>
          <h3>${product.en_name}</h3>
        </ion-label>

        <ion-buttons slot="end" class="ion-no-margin">
          <ion-button color="danger" @click=${delFavorite}>
            <alwatr-icon flip-rtl dir="rtl" slot="icon-only" name="close-outline"></alwatr-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    `;
  }

  protected _renderOrderListCard(orderList: OrderInterface[]): TemplateResult {
    const orderListTemplate = map(orderList.slice(0, 12), (order, index) =>
      this._renderOrderItem(order, index, orderList.length)
    );

    return html`
      <ion-card>
        <ion-card-header class="ion-no-padding ion-padding-vertical">
          <ion-item lines="none">
            <ion-card-title>آخرین سفارش ها</ion-card-title>

            <ion-buttons slot="end">
              <ion-button color="tertiary">
                <alwatr-icon flip-rtl dir="rtl" slot="icon-only" name="arrow-forward-outline"></alwatr-icon>
              </ion-button>
            </ion-buttons>
          </ion-item>
        </ion-card-header>

        <ion-card-content class="ion-no-padding">
          <ion-list lines="full"> ${orderListTemplate} </ion-list>
        </ion-card-content>
      </ion-card>
    `;
  }
  protected _renderOrderItem(order: OrderInterface, index: number, total: number): TemplateResult {
    const productImagesTemplate = map(
      order.products.slice(0, 5),
      (product) => html` <ion-thumbnail> ${product.imageElem} </ion-thumbnail> `
    );

    return html`
      <ion-item lines="none">
        <ion-label slot="start">
          <h3>سفارش کد ${order.uniqid}</h3>
        </ion-label>
        <ion-label slot="end">
          <h3>${order.price.toLocaleString('fa-IR')} تومان</h3>
        </ion-label>
      </ion-item>
      <ion-item .lines=${index === total - 1 ? 'none' : undefined} class="images">
        <ion-row> ${productImagesTemplate} </ion-row>
      </ion-item>
    `;
  }
}
