import {SignalInterface} from '@alwatr/signal';

import type {FetchData, FetchJson} from '../types/fetch';

const toastMessageSignal = new SignalInterface('toast-message');

export function responseMessage<T>(data: FetchData<T> | FetchJson<'error'>): FetchData<T> | FetchJson<'error'> {
  if (data != null && data?.message && typeof data.message === 'string') {
    toastMessageSignal.request({
      duration: 10_000,
      message: data.message,
      icon: data.status === 'success' ? 'checkmark-circle-outline' : 'warning-outline',
    });
  }
  return data;
}
