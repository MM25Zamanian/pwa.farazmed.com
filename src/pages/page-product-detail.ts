import {getJson, fetch} from '@alwatr/fetch';
import {preloadIcon} from '@alwatr/icon';
import {isNumber} from '@alwatr/math';
import {router} from '@alwatr/router';
import {Task} from '@lit-labs/task';
import {css, html, nothing} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {property} from 'lit/decorators/property.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {AppElement} from '../helpers/app-element';
import {responseMessage} from '../utilities/response-message';

import type {CartInterface} from '../types/cart';
import type {ResponseProducts} from '../types/fetch';
import type {ProductInterface, TotalPrice, VariantSelectedDefaultElement} from '../types/product';
import type {SegmentCustomEvent} from '@ionic/core';
import type {TemplateResult, CSSResult, PropertyDeclaration} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'page-product-detail': PageProductDetail;
  }
}

@customElement('page-product-detail')
export class PageProductDetail extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: block;
      }
      ion-header ion-toolbar ion-back-button {
        display: block !important;
      }
      ion-footer ion-toolbar {
        padding: 0 12px;
      }
      span.key {
        font-weight: 600;
        color: var(--ion-color-dark-shade, #1e2023);
      }
      .attr * {
        color: var(--ion-color-dark-tint, #383a3e);
      }
      .variants,
      .attr {
        margin: 12px 0;
      }
    `,

    css`
      .p__price {
        padding: 4px 8px 4px 0;
      }
      ins,
      del {
        display: flex;
        position: relative;
        width: max-content;
        margin-right: auto;
        flex: 1 1 0;
        padding-left: 44px;
        font-size: 14px;
        color: var(--ion-color-medium, #92949c);
      }
      ins {
        text-decoration: none;
        color: var(--ion-color-dark, #222428);
      }
      ins::after,
      del::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
      }
      ins::after {
        content: 'تومان';
      }
      del::after {
        content: attr(data-discount);
        color: var(--ion-color-primary-contrast, #fff);
        background-color: var(--ion-color-primary, #eb445a);
        padding: 0 8px;
        border-radius: 100vw;
      }
    `,
  ];

  @property({reflect: true}) pid?: string;
  @property({reflect: true, type: Number}) vid = 0;

  protected imageFile: HTMLImageElement | typeof nothing = nothing;
  protected _apiTask = new Task(
    this,
    async (productId): Promise<ResponseProducts<ProductInterface> | null> => {
      if (!productId[0]) return null;

      const response = await getJson<ResponseProducts<ProductInterface>>({
        url: 'https://api.farazmed.com/api/v3/product/' + productId[0],
        cacheStrategy: 'stale_while_revalidate',
        cacheStorageName: 'farazmed',
      });

      await new Promise((resolve) => {
        const image = new Image();

        image.addEventListener('load', () => {
          resolve(image);

          this.imageFile = image;
        });

        image.src = response.data.image;
      });

      const id = response.data.variant.variant_selected_default.id;
      if (id) {
        this.vid = id;
      }

      return response;
    },
    () => [this.pid]
  );
  protected _cartAddTask = new Task(this, async ([pid, vid]): Promise<void> => {
    const bodyJson = {
      api_token: localStorage.getItem('token') ?? '',
      pid,
      vid,
    };
    const data = await fetch({
      url: 'https://api.farazmed.com/api/v3/cart/add',
      method: 'POST',
      body: JSON.stringify(bodyJson),
      bodyJson,
    })
      .then((res) => res.json())
      .then((data) => responseMessage<CartInterface>(data));

    if (data.status === 'error') {
      throw new Error(data.message);
    }

    router.signal.request({
      pathname: '/cart',
    });
  });

  override connectedCallback(): void {
    super.connectedCallback();

    preloadIcon('add-outline');
  }
  override render(): TemplateResult {
    return html`
      ${this._apiTask.render({
        pending: () => html`loading ...`,
        complete: (productFetch: ResponseProducts<ProductInterface> | null) => {
          this._logger.logMethodArgs('_apiTask', {productFetch});

          if (!productFetch) return nothing;

          const product = productFetch.data;
          const variant =
            product.variant.variant_items.find((variant) => variant.id === this.vid)?.totalPrice ??
            product.variant.variant_selected_default.totalPrice;

          return html`
            ${this._renderHeaderTemplate()} ${this._renderDetailTemplate(product)}
            ${this._renderFooterTemplate(variant)}
          `;
        },
      })}
    `;
  }
  override requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: PropertyDeclaration<unknown, unknown>
  ): void {
    super.requestUpdate(name, oldValue, options);
    if (name === 'pid' && this.pid) {
      this._apiTask.run([this.pid]);
    }
  }

  protected _renderHeaderTemplate(): TemplateResult {
    return html`
      <ion-header>
        <ion-toolbar color="secondary">
          <ion-title>جزئیات محصول</ion-title>
        </ion-toolbar>
      </ion-header>
    `;
  }
  protected _renderFooterTemplate(totalPrice: TotalPrice): TemplateResult {
    const price = Number(totalPrice.oldPrice.replaceAll(',', '')).toLocaleString('fa');
    const discount = Number(totalPrice.totalPrice.replaceAll(',', '')).toLocaleString('fa');
    const discountPercentage = Number(totalPrice.totalDiscount).toLocaleString('fa');
    const isDiscount = totalPrice.totalDiscount != '0' && totalPrice.totalPrice != totalPrice.oldPrice;

    const discountTemplate = isDiscount
      ? html`
          <del data-discount=${discountPercentage + '٪'}>${price}</del>
          <ins>${discount}</ins>
        `
      : html`<ins>${price}</ins>`;

    const addCart = (event: PointerEvent): void => {
      event.preventDefault();

      if (this.pid != null) {
        this._cartAddTask.run([this.pid, this.vid ?? 0]);
      }
    };

    return html`
      <ion-footer>
        <ion-toolbar>
          <ion-button slot="start" fill="solid" color="primary" expand="block" @click=${addCart}>
            <alwatr-icon flip-rtl dir="rtl" slot="start" name="add-outline"></alwatr-icon>
            <ion-label>افزودن به سبد خرید</ion-label>
          </ion-button>

          <div class="p__price" slo="end">${discountTemplate}</div>
        </ion-toolbar>
      </ion-footer>
    `;
  }
  protected _renderDetailTemplate(product: ProductInterface): TemplateResult {
    const descriptionTemplate = product.description.split('/n').map((p) => html`<p>${p}</p>`);
    return html`
      <ion-content fullscreen>
        ${this.imageFile}
        <ion-card-header>
          <ion-card-title>${product.fa_name}</ion-card-title>
          <ion-card-subtitle>${product.en_name}</ion-card-subtitle>
          <ion-card-subtitle>
            <ion-text color="medium"> دسته بندی: </ion-text>
            <a href="#"> ${product.catinfo} </a>
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          ${descriptionTemplate} ${this._renderVariantSelector(product.variant.variant_items)}
          ${this._renderAttributesTemplate(product.attr)}
        </ion-card-content>
      </ion-content>
    `;
  }
  protected _renderAttributesTemplate(attributes: ProductInterface['attr']): TemplateResult {
    const attrTemplate = Object.entries(attributes).map(([attrKey, attrVal]) => {
      const propertyTemplate = Object.entries(attrVal).map(([propKey, propVal]) => {
        if (propVal.length < 2) {
          return html` <li><span class="key">${propKey}:</span> ${propVal[0]}</li> `;
        }
        const propertyValueTemplate = propVal.map((propertyValue): TemplateResult => html`<li>${propertyValue}</li>`);

        return html`
          <li>
            <span class="key">${propKey}</span>
            <ul>
              ${propertyValueTemplate}
            </ul>
          </li>
        `;
      });

      return html`
        <p>${attrKey}</p>
        <ul>
          ${propertyTemplate}
        </ul>
      `;
    });

    return html`<div class="attr">${attrTemplate}</div>`;
  }
  protected _renderVariantSelector(variants: VariantSelectedDefaultElement[]): TemplateResult | typeof nothing {
    if (!variants.length) return nothing;

    const variantsTemplate = variants.map(
      (variant) => html`
        <ion-segment-button value=${variant.id}>
          <ion-label>${variant.variantAttrInfo.title}</ion-label>
        </ion-segment-button>
      `
    );

    this.vid ??= variants[0].id;

    return html`
      <div class="variants">
        <p>بسته بندی:</p>
        <ion-segment value=${ifDefined(this.vid)} mode="ios" @ionChange=${this._variantChange}>
          ${variantsTemplate}
        </ion-segment>
      </div>
    `;
  }

  protected _variantChange(event: SegmentCustomEvent): void {
    const vid = event.detail.value;

    if (vid != null && isNumber(vid)) {
      this.vid = Number(vid);
    }
  }
}
