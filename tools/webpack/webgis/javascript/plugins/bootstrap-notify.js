/**
 * $.notify(options, settings);
 * OR
 * var notify = $.notify(...);
 * notify.update('message', '...');
 *
 * options:
 * icon: 'la la-check',
 * title: 'Bootstrap notify',
 * message: 'Bootstrap notify message',
 * url: 'http://bootstrap-notify.remabledesigns.com',
 * target: '_blank'
 *
 * settings:
 * element: Default is 'body', use jQuery selectors
 * (ex. "#someElementId") to append to any specific element.
 *
 * @link http://bootstrap-notify.remabledesigns.com
 */

const notifySettings = {
  type: 'info',
  allow_dismiss: true,
  showProgressbar: false,
  placement: {
    from: 'top',
    align: 'right',
  },
  offset: {
    x: 20,
    y: 70,
  },
  spacing: 10,
  delay: 5000,
  timer: 1000,
  url_target: '_blank',
  mouse_over: 'pause',
  // @link https://animate.style
  animate: {
    enter: 'animate__animated animate__fadeInRight',
    exit: 'animate__animated animate__fadeOutRight',
  },
  onShow: null,
  onShown: null,
  onClose: null,
  onClosed: null,
  icon_type: 'class',
  template: `<div data-notify="container" class="col-3 alert alert-custom shadow-lg alert-{0}" role="alert">
  <button type="button" aria-hidden="true" class="close" data-notify="dismiss"></button>
  <span data-notify="icon" class="alert-icon font-size-lg font-size-lg-h6"></span>
  <span data-notify="title" class="alert-text font-size-lg font-size-lg-h6">{1}</span>
  <span data-notify="message" class="alert-text font-size-lg font-size-lg-h6">{2}</span>
  <div class="progress" data-notify="progressbar">
    <div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0"
         aria-valuemax="100" style="width: 0%;"></div>
  </div>
  <a href="{3}" target="{4}" data-notify="url"></a>
</div>`,
};

document.addEventListener('DOMContentLoaded', () => {
  $.notifyDefaults(notifySettings);
});
