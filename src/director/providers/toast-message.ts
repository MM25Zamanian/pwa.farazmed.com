import {toastController} from '@ionic/core';
import {defineCustomElement} from '@ionic/core/components/ion-toast.js';

import {toastMessageSignal} from '../signal';

defineCustomElement();

toastMessageSignal.setProvider(async function (requestParam): Promise<HTMLIonToastElement> {
  const toast = await toastController.create({
    duration: 2500,
    position: 'bottom',
    buttons: [
      {
        icon: 'close',
        side: 'end',
        role: 'cancel',
      },
    ],
    ...requestParam,
  });

  console.log(toast);

  await toast.present();
  return toast;
});
