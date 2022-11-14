import {modalController} from '@ionic/core';

import {modalPageSignal} from '../signal';

modalPageSignal.setProvider(async function (requestParam): Promise<HTMLIonModalElement> {
  const modalPage = await modalController.create(requestParam);
  await modalPage.present();
  return modalPage;
});
