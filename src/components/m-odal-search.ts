// import {SignalInterface} from '@alwatr/signal';
// import {Task} from '@lit-labs/task';
// import {css, html} from 'lit';
// import {customElement} from 'lit/decorators/custom-element.js';
// import {state} from 'lit/decorators/state.js';
// import {live} from 'lit/directives/live.js';
// import {repeat} from 'lit/directives/repeat.js';

// import {AppElement} from '../helpers/app-element';
// import {ProductInterface} from '../types/product';

// import '../components/p-roduct';

// import type {SearchbarCustomEvent} from '@ionic/core';
// import type {TemplateResult, CSSResult} from 'lit';

// declare global {
//   interface HTMLElementTagNameMap {
//     'm-odal-search': MOdalSearch;
//   }
// }

// @customElement('m-odal-search')
// export class MOdalSearch extends AppElement {
//   static override styles = [
//     ...(<CSSResult[]>AppElement.styles),

//     css`
//       :host {
//         display: block;
//       }
//     `,
//   ];

//   @state() protected _products: Record<string, ProductInterface> = {};
//   @state() protected _query = '';

//   protected _modalPageSignal = new SignalInterface('modal-page');
//   protected _productListSignal = new SignalInterface('product-list');
//   protected _dataTask = new Task(
//     this,
//     async (): Promise<Record<string, ProductInterface>> => {
//       const products = await this._productListSignal.request({});

//       this._products = products.data;

//       return products.data;
//     },
//     () => []
//   );

//   override render(): TemplateResult {
//     return html`
//       <ion-header>
//         <ion-toolbar>
//           <ion-searchbar
//             placeholder="Search"
//             cancel-button-icon="arrow-back"
//             show-cancel-button="always"
//             show-clear-button="focus"
//             clear-icon="close-outline"
//             debounce="200"
//             animated
//             spellcheck
//             .value=${live(this._query)}
//             @ionCancel=${this._closeModal}
//             @ionChange=${this._onSearch}
//           ></ion-searchbar>
//         </ion-toolbar>
//       </ion-header>
//       <ion-content fullscreen>${this._renderCardList()}</ion-content>
//       <ion-footer> </ion-footer>
//     `;
//   }

//   protected _renderCardList(): TemplateResult {
//     const products = Object.values(this._products);
//     const productList = this._query?.length > 0 ? this._productListSearch(products, this._query) : [];

//     if (!productList.length) {
//       return html`
//         <ion-text color="dark" class="ion-text-center">
//           <p>Nothing.</p>
//         </ion-text>
//       `;
//     }
//     return html`
//       <ion-list lines="inset">
//         ${repeat(
//           productList,
//           (product) => product._id,
//           (product) => html`<p-roduct .info=${product} type="item-card"></p-roduct>`
//         )}
//       </ion-list>
//     `;
//   }

//   protected _closeModal(): void {
//     this._modalPageSignal.value?.dismiss();
//   }
//   protected _onSearch(event: SearchbarCustomEvent): void {
//     const value = event.detail.value;
//     this._logger.logMethodArgs('_onSearch', {value});
//     this._query = value ?? '';
//   }
//   /**
//    * It takes a list of products and a query string, and returns a list of products that match the query
//    * @param {ProductInterface[]} products - ProductInterface[]
//    * @param {string} query - string - The search query
//    * @returns An array of products that match the query.
//    */
//   protected _productListSearch(products: ProductInterface[], query: string): ProductInterface[] {
//     return products.filter((product) => {
//       const getV = Object.values;
//       const queryModel = [
//         getV(product.name),
//         getV(product.description),
//         product.features.map((feat) => getV(feat)).flat(),
//         product.slug,
//       ]
//         .flat()
//         .join(' ');

//       return queryModel.indexOf(query) !== -1;
//     });
//   }
// }
