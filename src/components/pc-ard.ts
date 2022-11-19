import {router} from '@alwatr/router';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {property} from 'lit/decorators/property.js';

import {AppElement} from '../helpers/app-element';

import type {ProductInterface} from '../types/product';
import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'pc-ard': ProductCard;
  }
}

/**
 * ```html
 * <pc-ard></pc-ard>
 * ```
 */
@customElement('pc-ard')
export class ProductCard extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: block;
        height: 100%;
      }
      ion-card {
        display: flex;
        flex-direction: column;
        margin: 0;
        height: 100%;
      }
      ion-card ion-card-header {
        padding: 16px 12px;
        margin: 0 0 auto;
      }
      ion-card ion-card-header ion-card-title {
        font-size: 14px;
        font-weight: 300;
      }
      img {
        padding: 0.5em 1em 0;
      }
    `,
    css`
      ins,
      del {
        display: flex;
        position: relative;
        width: 100%;
        color: var(--ion-color-medium, #92949c);
      }
      ins {
        text-decoration: none;
        color: var(--ion-color-dark, #222428);
        margin-top: 4px;
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

  @property({type: Object}) info!: ProductInterface;

  override render(): TemplateResult {
    if (this.info) {
      return this._renderCard(this.info);
    }
    return this._renderSkeleton();
  }

  protected _renderCard(product: ProductInterface): TemplateResult {
    const price = Number(
      product.variant.variant_selected_default.totalPrice.oldPrice.replaceAll(',', '')
    ).toLocaleString('fa');
    const discount = Number(
      product.variant.variant_selected_default.totalPrice.totalPrice.replaceAll(',', '')
    ).toLocaleString('fa');
    const discountPercentage = Number(product.variant.variant_selected_default.totalPrice.totalDiscount).toLocaleString(
      'fa'
    );
    const isDiscount =
      product.variant.variant_selected_default.totalPrice.totalDiscount != '0' &&
      product.variant.variant_selected_default.totalPrice.totalPrice !=
        product.variant.variant_selected_default.totalPrice.oldPrice;

    const discountTemplate = isDiscount
      ? html`
          <del data-discount=${discountPercentage + '٪'}>${price}</del>
          <ins>${discount}</ins>
        `
      : html`<ins>${price}</ins>`;
    const image = product.imageElem ?? html`<img src=${product.image} alt=${product.en_name} />`;

    return html`
      <ion-card href=${router.makeUrl({sectionList: ['products', product.id]})}>
        ${image}

        <ion-card-header>
          <ion-card-title> ${product.fa_name} </ion-card-title>
        </ion-card-header>

        <ion-card-content> ${discountTemplate} </ion-card-content>
      </ion-card>
    `;
  }
  protected _renderSkeleton(): TemplateResult {
    return html`
      <ion-card>
        <ion-thumbnail style="--size:45vw;">
          <ion-skeleton-text animated></ion-skeleton-text>
        </ion-thumbnail>

        <ion-card-header>
          <ion-card-title>
            <ion-skeleton-text animated style="width: 100%"></ion-skeleton-text>
          </ion-card-title>
          <ion-card-subtitle>
            <ion-skeleton-text animated style="width: 90%"></ion-skeleton-text>
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-row>
            <ion-skeleton-text animated style="width: 60%;margin-left:auto;"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 30%"></ion-skeleton-text>

            <ion-skeleton-text animated style="width: 50%;margin-left:auto;"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 40%"></ion-skeleton-text>
          </ion-row>
        </ion-card-content>
      </ion-card>
    `;
  }
}
