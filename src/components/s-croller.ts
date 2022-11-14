import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
// import {property} from 'lit/decorators/property.js';

import {AppElement} from '../helpers/app-element';

import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    's-croller': Scroller;
  }
}

@customElement('s-croller')
export class Scroller extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: block;
        padding: 0 0 8px;
      }
      .content {
        display: flex;
        overflow-x: auto;
        padding: 0 0 8px;
      }
      .row {
        display: flex;
        flex-shrink: 0;
        width: max-content;
        gap: 8px;
        padding: 0 16px 8px;
      }
      ::slotted(*) {
        width: calc(50vw - 24px);
      }
    `,
  ];

  override render(): TemplateResult {
    return html`
      <div class="content">
        <div class="row">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
