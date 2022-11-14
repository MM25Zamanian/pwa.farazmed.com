// import {router} from '@alwatr/router';
// import {SignalInterface} from '@alwatr/signal';
// import {Task} from '@lit-labs/task';
// import {css, html, nothing} from 'lit';
// import {customElement} from 'lit/decorators/custom-element.js';
// import {state} from 'lit/decorators/state.js';

// import {AppElement} from '../helpers/app-element';

// import type {CategoryInterface} from '../types/category';
// import type {ProductFilter} from '../types/product-filter';
// import type {RadioGroupCustomEvent} from '@ionic/core';
// import type {TemplateResult, CSSResult} from 'lit';

// declare global {
//   interface HTMLElementTagNameMap {
//     'm-odal-filter': MOdalFilter;
//   }
// }

// @customElement('m-odal-filter')
// export class MOdalFilter extends AppElement {
//   static override styles = [
//     ...(<CSSResult[]>AppElement.styles),

//     css`
//       :host {
//         display: block;
//       }
//       ion-footer ion-button {
//         margin: 0 !important;

//         --padding-start: 12vw;
//         --padding-end: 12vw;
//       }
//     `,
//   ];

//   @state() protected _categoryList: Record<string, CategoryInterface> = {};
//   @state() protected _filters: ProductFilter = {};

//   protected _modalPageSignal = new SignalInterface('modal-page');
//   protected _categoryListSignal = new SignalInterface('category-list');
//   protected _productListSignal = new SignalInterface('product-list');
//   protected _dataTask = new Task(
//     this,
//     async (): Promise<Record<string, CategoryInterface>> => {
//       const data = await this._categoryListSignal.request({});

//       this._categoryList = data;
//       this._logger.logProperty('_categoryList', {data});

//       return data;
//     },
//     () => []
//   );

//   override connectedCallback(): void {
//     super.connectedCallback();
//     this._filters = <ProductFilter>router.currentRoute.queryParamList;
//   }
//   override render(): TemplateResult {
//     return html`
//       <ion-header>
//         <ion-toolbar>
//           <ion-buttons slot="end">
//             <ion-button @click=${this._closeModal}>
//               <ion-icon slot="icon-only" name="close"></ion-icon>
//             </ion-button>
//           </ion-buttons>
//           <ion-title>Filter</ion-title>
//         </ion-toolbar>
//       </ion-header>
//       <ion-content fullscreen>
//         ${this._dataTask.render({
//           pending: () => html``,
//           complete: () => html`<ion-list> ${this._renderCategoryFilters()} </ion-list>`,
//         })}
//       </ion-content>
//       <ion-footer>
//         <ion-button expand="full" size="large" ?disabled=${!this._canApplyFilters} @click=${this._applyFilters}>
//           <ion-icon slot="start" name="funnel-outline"></ion-icon>
//           <ion-label>Apply filter</ion-label>
//         </ion-button>
//       </ion-footer>
//     `;
//   }

//   protected _renderCategoryFilters(): TemplateResult | typeof nothing {
//     if (!this._categoryListSignal.value) return nothing;

//     const categoryListTemplate = Object.values(this._categoryListSignal.value).map(
//       (category) => html`
//         <ion-item>
//           <ion-radio slot="start" value=${category.slug} name="category"></ion-radio>
//           <ion-label>${category.title[this._i18nCode]}</ion-label>
//         </ion-item>
//       `
//     );
//     return html`
//       <ion-radio-group
//         value=${this._productListSignal.value?.filter.category ?? 'all'}
//         name="category"
//         @ionChange=${this._filterCategoryChanged}
//       >
//         <ion-list-header>
//           <ion-label> By Categories: </ion-label>
//         </ion-list-header>

//         <ion-item>
//           <ion-radio slot="start" value="all"></ion-radio>
//           <ion-label>All</ion-label>
//         </ion-item>

//         ${categoryListTemplate}
//       </ion-radio-group>
//     `;
//   }

//   protected _closeModal(): void {
//     this._modalPageSignal.value?.dismiss();
//   }
//   /**
//    * It takes the value of the radio group and sets the `category` property of the `_filters` object to
//    * that value
//    * @param {RadioGroupCustomEvent} event - RadioGroupCustomEvent
//    */
//   protected _filterCategoryChanged(event: RadioGroupCustomEvent): void {
//     const category = <ProductFilter['category']>event.detail.value;
//     this._logger.logMethodArgs('_filterCategoryChange', {category: category, event});
//     this._filters = {...this._filters, category: category};
//     if (category === 'all') {
//       delete this._filters.category;
//     }
//   }
//   protected async _applyFilters(): Promise<void> {
//     router.signal.request({
//       pathname: router.makeUrl({
//         sectionList: ['products'],
//       }),
//       search: router.makeUrl({
//         queryParamList: this._filters,
//       }),
//     });
//     this._closeModal();
//   }

//   protected get _canApplyFilters(): boolean {
//     if (!this._productListSignal.value) return false;

//     if (this._filters.category !== this._productListSignal.value.filter.category) {
//       this._logger.logProperty('_canApplyFilters', true);
//       return true;
//     }

//     this._logger.logProperty('_canApplyFilters', false);
//     return false;
//   }
// }
