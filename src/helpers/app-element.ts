import {AlwatrElement} from '@alwatr/element';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Components as _} from '@ionic/core/dist/types/components';
import {Components as __} from 'ionicons/dist/types/components';
import {css} from 'lit';

import ionicReset from '../stylesheets/ionic.reset';
import ionicTheming from '../stylesheets/ionic.theming';
import ionicUtilities from '../stylesheets/ionic.utilities';
import reset from '../stylesheets/reset';

import type {CSSResult} from 'lit';

export class AppElement extends AlwatrElement {
  static override styles: CSSResult[] = [
    ionicReset,
    reset,
    ionicTheming,
    ionicUtilities,
    css`
      [unresolved] {
        visibility: hidden !important;
      }
    `,
  ];
}
