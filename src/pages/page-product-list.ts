import {getJson} from '@alwatr/fetch';
import {router} from '@alwatr/router';
import {Task} from '@lit-labs/task';
import {css, html, nothing} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {map} from 'lit/directives/map.js';
import {range} from 'lit/directives/range.js';
import {repeat} from 'lit/directives/repeat.js';
import {when} from 'lit/directives/when.js';

import {AppElement} from '../helpers/app-element';

import '../components/pc-ard';
import '../components/m-odal-filter';
import '../components/m-odal-search';

import type {Links, ResponseProducts} from '../types/fetch';
import type {ProductInterface} from '../types/product';
import type {ListenerInterface} from '@alwatr/signal';
import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'page-product-list': PageProductList;
  }
}

/**
 * Alwatr PWA Home Page Element
 *
 * ```html
 * <page-product-list></page-product-list>
 * ```
 */
@customElement('page-product-list')
export class PageProductList extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: flex;
        flex-direction: column;
      }

      input[type='search']::-webkit-search-cancel-button,
      input[type='search']::-webkit-search-decoration {
        -webkit-appearance: none;
      }

      ion-grid {
        --ion-grid-padding: 2vw;
      }
      ion-col {
        --ion-grid-column-padding: 2vw;
      }
      ion-col[hidden] {
        display: none;
      }

      .pagination {
        display: flex;
        width: 100%;
        padding: 12px 12px 8px;
        justify-content: space-between;
      }
    `,
  ];

  protected _listenerList: Array<unknown> = [];
  protected _dataTask = new Task(
    this,
    async (): Promise<ResponseProducts<ProductInterface[]>> => {
      const data = await getJson<ResponseProducts<ProductInterface[]>>({
        url: 'https://api.farazmed.com/api/v3/products',
        cacheStrategy: 'stale_while_revalidate',
        cacheStorageName: 'farazmed',
        queryParameters: router.currentRoute.queryParamList,
      });

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

  override connectedCallback(): void {
    super.connectedCallback();
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }
  override render(): TemplateResult {
    return html`
      <ion-header> ${this._renderToolbarTemplate()} </ion-header>
      <ion-content fullscreen .scrollY=${this._dataTask.status === 2}>
        ${this._dataTask.render({
          pending: () => this._renderSkeletonCardsTemplate(),
          complete: (value) => this._renderCardsTemplate(value),
        })}
      </ion-content>
    `;
  }

  protected _renderCardsTemplate(data: ResponseProducts<ProductInterface[]>): TemplateResult {
    const productListTemplate = repeat(
      Object.values(data.data),
      (product) => product.id,
      (product) => html`
        <ion-col size="6">
          <pc-ard .info=${product}></pc-ard>
        </ion-col>
      `
    );

    return html`
      <ion-grid>
        <ion-row>${productListTemplate}</ion-row>
        ${when(data.links != null, () => this._renderPaginationTemplate(data.links as Links))}
      </ion-grid>
    `;
  }
  protected _renderSkeletonCardsTemplate(): TemplateResult {
    const productListTemplate = map(
      range(10),
      () => html`
        <ion-col size="6">
          <pc-ard></pc-ard>
        </ion-col>
      `
    );

    return html`
      <ion-grid>
        <ion-row>${productListTemplate}</ion-row>
      </ion-grid>
    `;
  }
  protected _renderToolbarTemplate(): TemplateResult {
    return html`
      <ion-toolbar color="secondary">
        <ion-buttons slot="primary">
          <ion-button>
            <ion-icon slot="icon-only" name="filter-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>محصولات</ion-title>
      </ion-toolbar>
    `;
  }
  protected _renderPaginationTemplate(pagination: Links): TemplateResult {
    const pervPageButton = this._renderPaginatorButton(
      'chevron-back-outline',
      'start',
      'قبلی',
      pagination.prev ?? undefined
    );
    const nextPageButton = this._renderPaginatorButton(
      'chevron-forward-outline',
      'end',
      'بعدی',
      pagination.next ?? undefined
    );

    return html` <div class="pagination">${pervPageButton}${nextPageButton}</div> `;
  }
  protected _renderPaginatorButton(
    icon: 'chevron-forward-outline' | 'chevron-back-outline',
    slotIcon: 'end' | 'start',
    label: string,
    _url?: string
  ): TemplateResult | typeof nothing {
    let disabled = false;

    if (!_url) disabled = true;

    const url = _url ? new URL(_url) : undefined;
    const click = async (): Promise<void> => {
      if (!url) return;

      await router.signal.request({
        pathname: location.pathname,
        search: '?' + url.searchParams.toString(),
      });
      this._dataTask.run();
    };

    return html`
      <ion-button shape="round" @click=${click} ?disabled=${disabled}>
        <ion-icon slot=${slotIcon} name=${icon}></ion-icon>
        <ion-label>${label}</ion-label>
      </ion-button>
    `;
  }
}
