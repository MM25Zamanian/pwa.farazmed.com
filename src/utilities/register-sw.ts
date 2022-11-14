// import {createLogger} from '@alwatr/logger';
// import {SignalInterface} from '@alwatr/signal';

/**
 * It registers a service worker, and if it's successful, it adds a listener to the service worker's
 * update event, and it adds a listener to the signal interface's update event
 * @returns A promise that resolves when the service worker is registered.
 */
export default async function registerSW(): Promise<void> {
  // const logger = createLogger('register-sw');
  // const signal = new SignalInterface('sw-update');
  // const toastSignal = new SignalInterface('toast-message');
  // if ('serviceWorker' in navigator) {
  //   return await navigator.serviceWorker
  //     .register('/sw.js')
  //     .then((registration) => {
  //       logger.logMethodArgs('then', {registration: registration});
  //       const update = (): Promise<void> =>
  //         registration.update().then(() => {
  //           toastSignal.request({
  //             message: 'Application Successfully Updated',
  //           });
  //         });
  //       registration.addEventListener('updatefound', () => {
  //         logger.logMethod('updatefound');
  //         update();
  //       });
  //       signal.addListener(() => update());
  //     })
  //     .catch((error) => logger.error('sw_register', 'load_sw_error', error));
  // }
}
