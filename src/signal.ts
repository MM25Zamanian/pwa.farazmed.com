import type {ActionSheetOptions, ComponentRef, ModalOptions, ToastOptions} from '@ionic/core';

export {};

declare global {
  interface AlwatrSignals {
    readonly 'sw-update': void;
    readonly 'toast-message': HTMLIonToastElement;
    readonly 'action-sheet': HTMLIonActionSheetElement;
    readonly 'modal-page': HTMLIonModalElement;
  }
  interface AlwatrRequestSignals {
    readonly 'toast-message': ToastOptions;
    readonly 'action-sheet': ActionSheetOptions;
    readonly 'modal-page': ModalOptions<ComponentRef>;
  }
}
