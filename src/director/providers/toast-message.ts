import {toastController} from '@ionic/core';

import {toastMessageSignal} from '../signal';

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

  await toast.present();
  return toast;
});
