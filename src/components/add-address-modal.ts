import {fetch} from '@alwatr/fetch';
import {preloadIcon} from '@alwatr/icon';
import {router} from '@alwatr/router';
import {InputCustomEvent, loadingController} from '@ionic/core';
import {Task} from '@lit-labs/task';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';

import {AppElement} from '../helpers/app-element';
import {responseMessage} from '../utilities/response-message';

import type {CartInterface} from '../types/cart';
import type {FetchData, FetchJson} from '../types/fetch';
import type {UserInterface} from '../types/user';
import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'add-address-modal': AddAddressModal;
  }
}

@customElement('add-address-modal')
export class AddAddressModal extends AppElement {
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
        padding: 24px 10% 16px;
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

  protected _inputs: Record<string, string | boolean> & {isValid: boolean} = {isValid: false};
  protected _cartRemoveTask = new Task(this, async ([id]): Promise<void> => {
    const bodyJson = {
      api_token: localStorage.getItem('token') ?? '',
      id,
    };
    const data = await fetch({
      url: 'https://api.farazmed.com/api/v3/cart/remove',
      method: 'POST',
      body: JSON.stringify(bodyJson),
      bodyJson,
    })
      .then((res) => res.json())
      .then((data) => responseMessage<CartInterface>(data));

    if (data.status === 'error') {
      throw new Error(data.message);
    }
  });

  override connectedCallback(): void {
    super.connectedCallback();

    preloadIcon('close-outline');
  }
  override render(): TemplateResult {
    return html`
      <ion-header>
        <ion-toolbar color="secondary">
          <ion-title>افزودن آدرس</ion-title>

          <ion-buttons slot="end" @click=${this._close}>
            <ion-button>
              <alwatr-icon slot="icon-only" name="close-outline"></alwatr-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content fullscreen>
        <ion-card>
          <div class="image">
            <img src="/images/add-address.svg" alt="add-address" />
          </div>
          <ion-list>
            <ion-item fill="solid">
              <ion-label position="floating">نام تحویل گیرنده</ion-label>
              <ion-input
                name="name"
                type="text"
                inputmode="text"
                pattern="^.{3,}$"
                autocomplete="name"
                @ionChange=${this._inputChange}
                clearOnEdit
                required
              ></ion-input>
            </ion-item>
            <ion-item fill="solid">
              <ion-label position="floating">شماره تحویل گیرنده</ion-label>
              <ion-input
                name="mobile"
                type="text"
                inputmode="tel"
                pattern="^09[0-9]{9}$"
                autocomplete="tel"
                @ionChange=${this._inputChange}
                clearOnEdit
                required
              ></ion-input>
              <ion-note slot="error">شماره تلفن معتبر وارد کنید</ion-note>
            </ion-item>

            <ion-row>
              <ion-col size="12">
                <ion-button expand="block" fill="outline" strong>
                  <ion-label>افزودن</ion-label>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-list>
        </ion-card>
      </ion-content>
    `;
  }

  protected async _submitForm(): Promise<void> {
    this._logger.logMethodArgs('_submitForm', {
      is_valid: this._inputs.isValid,
      mobile: this._inputs['mobile'],
      password: this._inputs['password'],
    });

    if (!this._inputs.isValid || !this._inputs['mobile'] || !this._inputs['password']) return;

    const data = {
      mobile: this._inputs['mobile'],
      password: this._inputs['password'],
    };

    const loader = await loadingController.create({
      message: 'ارسال درخواست به سرور ...',
    });
    await loader.present();

    const response = await fetch({
      url: 'https://api.farazmed.com/api/v3/login',
      body: JSON.stringify(data),
      bodyJson: data,
      method: 'POST',
    })
      .then((res): Promise<FetchData<UserInterface> | FetchJson<'error'>> => res.json())
      .then((data) => responseMessage<UserInterface>(data));

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
      this._inputs.isValid = Object.keys(this._inputs).length === 3;
      item.classList.add('ion-valid');
    } else {
      item.classList.add('ion-invalid');
    }
  }
  protected _close(): void {
    const event = new CustomEvent('close');

    this.dispatchEvent(event);
  }
}
