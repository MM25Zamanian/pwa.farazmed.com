import {actionSheetController} from '@ionic/core';

import {actionSheetSignal} from '../signal';

actionSheetSignal.setProvider(async function (requestParam): Promise<HTMLIonActionSheetElement> {
  const actoinSheet = await actionSheetController.create(requestParam);

  await actoinSheet.present();
  return actoinSheet;
});
