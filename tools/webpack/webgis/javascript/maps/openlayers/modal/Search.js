import { default as ModalOverlay } from './Modal';

export default class SearchModal extends ModalOverlay {

  constructor(options) {
    super(options);

    this.addElements([
      '.card-title h3',
      '.card-title span',
      '.card-body tbody',
      '.card-footer a.btn',
      '.card-footer #btn_photo_modal',
      '.card-footer #btn_history_modal',
    ]);

    this._feature = null;
    this._interaction = null;
  }
}
