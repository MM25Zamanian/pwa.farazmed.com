import {fetch} from '@alwatr/fetch';
import {router} from '@alwatr/router';
import {loadingController} from '@ionic/core';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';

import {AppElement} from '../helpers/app-element';
import {responseMessage} from '../utilities/response-message';

import type {FetchData, FetchJson} from '../types/fetch';
import type {UserInterface} from '../types/user';
import type {ListenerInterface} from '@alwatr/signal';
import type {InputCustomEvent} from '@ionic/core';
import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'page-login': PageLogin;
  }
}

@customElement('page-login')
export class PageLogin extends AppElement {
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
        padding: 32px 8px 16px;
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
  protected _inputs: Record<string, string | boolean> & {isValid: boolean} = {isValid: false};

  override connectedCallback(): void {
    super.connectedCallback();

    // this._listenerList.push(router.signal.addListener(() => this.requestUpdate()));
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }
  override render(): TemplateResult {
    return html`
      <ion-header>
        <ion-toolbar color="secondary">
          <ion-title>ورود کاربر</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content fullscreen>
        <ion-card>
          <div class="image">
            <img src="/images/log-in.svg" alt="log-in" />
          </div>
          <ion-list>
            <form>
              <ion-item fill="solid">
                <ion-label position="floating">شماره تلفن</ion-label>
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
              <ion-item fill="solid">
                <ion-label position="floating">گذرواژه</ion-label>
                <ion-input
                  name="password"
                  type="password"
                  inputmode="text"
                  pattern="^.{3,}$"
                  autocomplete="current-password"
                  @ionChange=${this._inputChange}
                  clearOnEdit
                  required
                ></ion-input>
                <ion-note slot="error">گذرواژه معتبر وارد کنید</ion-note>
              </ion-item>
              <ion-row>
                <ion-col size="12">
                  <ion-button expand="block" fill="outline" @click=${this._submitForm} strong>
                    <ion-label>ورود</ion-label>
                  </ion-button>
                </ion-col>
                <ion-col size="6">
                  <ion-button expand="block" size="small" color="tertiary" fill="clear">
                    <ion-label>ثبت نام</ion-label>
                  </ion-button>
                </ion-col>
                <ion-col size="6">
                  <ion-button expand="block" size="small" color="tertiary" fill="clear">
                    <ion-label>بازیابی گذرواژه</ion-label>
                  </ion-button>
                </ion-col>
              </ion-row>
            </form>
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
}
