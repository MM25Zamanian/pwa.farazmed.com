import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {property} from 'lit/decorators/property.js';

import {AppElement} from '../helpers/app-element';

import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'b-anner': Banner;
  }
}

/**
 * ```html
 * <b-anner></b-anner>
 * ```
 */
@customElement('b-anner')
export class Banner extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: flex;
        margin: var(--margin, 2px);
        overflow: hidden;
        align-items: center;
        justify-content: center;
        height: var(--height);
        box-shadow: rgba(0, 0, 0, 0.15) 0px 4px 12px;
      }
      .banner-box {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: var(--border-radius, 4px);
      }
      .banner-box .banner-image {
        display: flex;
        width: 100%;
        height: 100%;
      }
      .banner-box .banner-image img {
        max-inline-size: 100%;
        min-width: 100%;
        block-size: auto;
        aspect-ratio: 16/9;
        object-fit: cover;
        object-position: top center;
      }
      .banner-title {
        position: absolute;
        background-color: #333;
        color: white;
        font-weight: var(--title-fw, 400);
        margin: auto;
        padding: 0.3em 1.2em;
        border-radius: 6px;
        font-size: var(--title-fs, 20px);
        user-select: none;
        z-index: 3;
        text-align: center;
      }
      @supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))) {
        .banner-title {
          backdrop-filter: saturate(2) brightness(50%) blur(1px);
          background-color: #0001;
        }
      }
    `,
  ];

  @property({type: Boolean}) skeleton = false;
  @property() label = '';
  @property() src = '';
  @property({type: Object}) image?: HTMLImageElement;
  @property() href?: string;

  override render(): TemplateResult {
    if (this.skeleton) {
      return html`
        <div class="banner-box">
          <div class="banner-image">
            <ion-thumbnail style="--size:100%">
              <ion-skeleton-text animated></ion-skeleton-text>
            </ion-thumbnail>
          </div>
        </div>
      `;
    }

    const image = this.image ?? html`<img src=${this.src} alt=${this.label} />`;

    if (this.href) {
      return html`
        <a class="banner-box" href=${this.href}>
          <h2 class="banner-title">${this.label}</h2>
          <div class="banner-image">${image}</div>
        </a>
      `;
    }

    return html`
      <div class="banner-box">
        <h2 class="banner-title">${this.label}</h2>
        <div class="banner-image">${image}</div>
      </div>
    `;
  }
}
