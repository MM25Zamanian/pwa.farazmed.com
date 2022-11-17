import {toastController} from '@ionic/core';

import type {FetchData, FetchJson} from '../types/fetch';

export async function responseMessage<T>(
  data: FetchData<T> | FetchJson<'error'>
): Promise<FetchData<T> | FetchJson<'error'>> {
  if (data != null && data?.message && typeof data.message === 'string') {
    await toastController
      .create({
        animated: true,
        duration: 4_096,
        position: 'bottom',
        message: data.message,
      })
      .then((toast) => toast.present());
  }
  return data;
}
