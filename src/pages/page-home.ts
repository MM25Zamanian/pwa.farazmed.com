// import {SignalInterface} from '@alwatr/signal';
// import {Task} from '@lit-labs/task';
// import {css, html, nothing} from 'lit';
// import {customElement} from 'lit/decorators/custom-element.js';
// import {ifDefined} from 'lit/directives/if-defined.js';
// import {map} from 'lit/directives/map.js';

// import {AppElement} from '../helpers/app-element';
// import {PageContent} from '../types/page-content';

// import '../components/b-anner';
// import '../components/s-croller';
// import '../components/p-roduct';

// import type {InfoBanner, InfoBannerRowInterface} from '../types/banner';
// import type {ProductInterface} from '../types/product';
// import type {ListenerInterface} from '@alwatr/signal';
// import type {TemplateResult, CSSResult} from 'lit';

// declare global {
//   interface HTMLElementTagNameMap {
//     'page-home': PageHome;
//   }
// }

// /**
//  * APP PWA Home Page Element
//  *
//  * ```html
//  * <page-home></page-home>
//  * ```
//  */
// @customElement('page-home')
// export class PageHome extends AppElement {
//   static override styles = [
//     ...(<CSSResult[]>AppElement.styles),
//     css`
//       .banners {
//         display: flex;
//         flex-direction: column;
//         gap: 8px;
//         padding: 6px 6px 12px;
//       }
//       .banners b-anner {
//         --height: 50vw;
//         --title-fs: 16px;
//         --title-fw: 300;
//       }
//       .banners .banners-group {
//         display: flex;
//         gap: 8px;
//       }
//       .banners .banners-group b-anner {
//         flex: 1 1 0;
//         --title-fs: 13px;
//         --title-fw: 100;
//         --height: 30vw;
//       }
//     `,
//   ];

//   protected _listenerList: Array<unknown> = [];
//   protected _categoryListSignal = new SignalInterface('category-list');
//   protected _productListSignal = new SignalInterface('product-list');
//   protected _pageContentSignal = new SignalInterface('page-content');
//   protected _pageContentTask = new Task(
//     this,
//     async (): Promise<Record<string, PageContent>> => {
//       const pageContent = await this._pageContentSignal.request(this.tagName);

//       this._logger.logProperty('pageContent', {pageContent});

//       return pageContent;
//     },
//     () => []
//   );

//   override connectedCallback(): void {
//     super.connectedCallback();
//     // this._listenerList.push(router.signal.addListener(() => this.requestUpdate()));
//   }
//   override disconnectedCallback(): void {
//     super.disconnectedCallback();
//     this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
//   }
//   override render(): TemplateResult {
//     return html`
//       <ion-content fullscreen>
//         ${this._pageContentTask.render({
//           complete: (pageContent) => {
//             return Object.values(pageContent).map((content) => {
//               switch (content.type) {
//                 case 'banner':
//                   return this._renderBanners(content.data);

//                 case 'scroller':
//                   return this._renderProductScroller(
//                     content.data.title[this._i18nCode],
//                     content.data.productList,
//                     content.data.href
//                   );

//                 default:
//                   return nothing;
//               }
//             });
//           },
//         })}
//       </ion-content>
//     `;
//   }

//   protected _renderBannersSkeleton(): TemplateResult {
//     return html`
//       <div class="banners">
//         <b-anner skeleton></b-anner>
//         <div class="banners-group">
//           <b-anner skeleton></b-anner>
//           <b-anner skeleton></b-anner>
//         </div>
//         <div class="banners-group">
//           <b-anner skeleton></b-anner>
//           <b-anner skeleton></b-anner>
//         </div>
//         <b-anner skeleton></b-anner>
//       </div>
//     `;
//   }
//   protected _renderBanners(bannerRows: Record<string, InfoBannerRowInterface>): TemplateResult | typeof nothing {
//     const bannerRowsTemplate = Object.values(bannerRows).map((bannerRow) => {
//       if (bannerRow.banners.length === 1) {
//         return this._renderBanner(bannerRow.banners[0]);
//       }

//       return html` <div class="banners-group">
// ${map(bannerRow.banners, (banner) => this._renderBanner(banner))}</div> `;
//     });

//     return html` <div class="banners">${bannerRowsTemplate}</div> `;
//   }
//   protected _renderBanner(banner: InfoBanner): TemplateResult {
//     return html`
//       <b-anner
//         label=${banner.label}
//         src=${banner.src}
//         href=${ifDefined(banner.href)}
//         .image=${banner.imageElement}
//       ></b-anner>
//     `;
//   }
//   protected _renderProductScroller(
//     title: string,
//     productList: Record<string, ProductInterface>,
//     href?: string
//   ): TemplateResult {
//     const productCardTemplates = Object.values(productList).map(
//       (product) => html` <p-roduct .info=${product}></p-roduct> `
//     );

//     return html`
//       <ion-item lines="none">
//         <ion-label slot="start">${title}</ion-label>
//         <ion-button fill="clear" slot="end" href=${ifDefined(href)}> More </ion-button>
//       </ion-item>
//       <s-croller> ${productCardTemplates} </s-croller>
//     `;
//   }
// }
