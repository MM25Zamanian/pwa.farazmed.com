import {fetch, getJson} from '@alwatr/fetch';
import { preloadIcon } from '@alwatr/icon';
import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {InputCustomEvent, loadingController} from '@ionic/core';
import {Task} from '@lit-labs/task';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';

import {AppElement} from '../helpers/app-element';
import {responseMessage} from '../utilities/response-message';

import type {FetchData, FetchJson} from '../types/fetch';
import type {UserInterface} from '../types/user';
import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'page-profile-edit': PageProfileEdit;
  }
}

@customElement('page-profile-edit')
export class PageProfileEdit extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: flex;
        flex-direction: column;
        --ion-item-background: var(--ion-card-background);
      }
      ion-content {
        justify-content: center;
      }
      ion-list {
        padding: 12px !important;
      }
      ion-item {
        margin-bottom: 16px;
      }
      .image {
        padding: 16px 24% 8px;
      }
      img {
        width: 100%;
      }
      ion-col {
        --ion-grid-column-padding: 1%;
      }
      ion-col ion-button {
        margin: 0;
      }
    `,
  ];

  protected _listenerList: Array<unknown> = [];
  protected _inputs: Partial<UserInterface> = {};
  protected _toastMessageSignal = new SignalInterface('toast-message');
  protected _data?: UserInterface;
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

      this._data = data.data;

      return data;
    },
    () => []
  );

  override connectedCallback(): void {
    super.connectedCallback();

    preloadIcon('arrow-forward-outline');
  }
  override render(): TemplateResult {
    return html`
      <ion-header>
        <ion-toolbar color="secondary">
          <ion-buttons slot="end">
            <ion-button href=${router.makeUrl({sectionList: ['profile']})}>
              <alwatr-icon flip-rtl dir="rtl" slot="icon-only" name="arrow-forward-outline"></alwatr-icon>
            </ion-button>
          </ion-buttons>

          <ion-title>ورود کاربر</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content fullscreen>
        ${this._informationTask.render({
          complete: (value) => html`
            <ion-card>
              <div class="image">
                <img src="/images/profile-edit.svg" alt="log-in" />
              </div>
              <ion-list>
                <form>
                  <ion-item fill="solid">
                    <ion-label position="floating">نام و نام خانوادگی</ion-label>
                    <ion-input
                      name="name"
                      type="text"
                      inputmode="text"
                      pattern="^.{3,}$"
                      value=${value.data.name}
                      @ionChange=${this._inputChange}
                      required
                    ></ion-input>
                    <ion-note slot="helper">نام و نام خانوادگی خود را وارد کنید</ion-note>
                    <ion-note slot="error">نام و نام خانوادگی معتبر وارد کنید</ion-note>
                  </ion-item>

                  <ion-item fill="solid">
                    <ion-label position="floating">کد ملی</ion-label>
                    <ion-input
                      name="mcode"
                      type="number"
                      inputmode="numeric"
                      pattern="^[0-9]{10}$"
                      value=${value.data.mcode}
                      @ionChange=${this._inputChange}
                      required
                    ></ion-input>
                    <ion-note slot="helper">کد ملی خود را وارد کنید</ion-note>
                    <ion-note slot="error">کد ملی معتبر وارد کنید</ion-note>
                  </ion-item>

                  <ion-item fill="solid">
                    <ion-label position="floating">شماره کارت</ion-label>
                    <ion-input
                      name="card"
                      type="number"
                      inputmode="numeric"
                      pattern="^[0-9]{16}$"
                      value=${value.data.card}
                      @ionChange=${this._inputChange}
                      required
                    ></ion-input>
                    <ion-note slot="helper">شماره کارت خود را وارد کنید</ion-note>
                    <ion-note slot="error">شماره کارت معتبر وارد کنید</ion-note>
                  </ion-item>

                  <ion-row>
                    <ion-col size="12">
                      <ion-button expand="block" fill="outline" @click=${this._formData} strong>
                        <ion-label>ثبت اطلاعات</ion-label>
                      </ion-button>
                    </ion-col>
                  </ion-row>
                </form>
              </ion-list>
            </ion-card>
          `,
        })}
      </ion-content>
    `;
  }

  protected async _formData(): Promise<void> {
    if (!this._data) return;

    const data: UserInterface = this._data;

    data.api_token ??= localStorage.getItem('token') ?? data.api_token;
    data.name = this._inputs['name'] ?? data.name;
    data.mcode = this._inputs['mcode'] ?? data.mcode;
    data.card = this._inputs['card'] ?? data.card;

    if (Object.is(this._data, data)) return;

    const loader = await loadingController.create({
      message: 'ارسال درخواست به سرور ...',
    });
    await loader.present();

    const response = await fetch({
      url: 'https://api.farazmed.com/api/v3/user/update',
      body: JSON.stringify(data),
      bodyJson: data,
      method: 'POST',
    })
      .then((res): Promise<FetchData<UserInterface> | FetchJson<'error'>> => res.json())
      .then((data) => {
        if (data.message) {
          this._toastMessageSignal.request({
            duration: 10_000,
            message: data.message,
            icon: data.status === 'success' ? 'checkmark-circle-outline' : 'warning-outline',
          });
        }
        return data;
      });

    if (response.status === 'success') {
      localStorage.setItem('token', response.data.api_token);
      router.signal.request({
        pathname: router.makeUrl({
          sectionList: ['profile'],
        }),
      });
    }

    await loader.dismiss();
  }
  protected _inputChange(event: InputCustomEvent): void {
    const value = event.detail.value;
    const item = event.target.parentElement as HTMLIonItemElement;
    const isValid = event.target.pattern && event.target.name && value && new RegExp(event.target.pattern).test(value);

    item.classList.remove('ion-valid', 'ion-invalid');

    if (isValid) {
      this._inputs[event.target.name] = value;
      item.classList.add('ion-valid');
    } else {
      item.classList.add('ion-invalid');
    }
  }
}
