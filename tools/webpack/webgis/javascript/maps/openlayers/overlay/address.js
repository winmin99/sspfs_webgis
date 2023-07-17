import Overlay from 'ol/Overlay';

const addressOverlayDefault = {
  html: true,
  placement: 'top',
  trigger: 'manual',
  template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div><a href="#" class="popover-close"></a></div>',
};

Overlay.prototype.setPositionAndContent = function (position, content) {
  setTimeout(function () {
    const overlayElement = $(this.getElement());
    overlayElement.popover('dispose');
    this.setPosition(position);
    overlayElement.popover({
      ...addressOverlayDefault,
      container: this.getElement(),
      content: content,
    });
    overlayElement.popover('show');
    overlayElement.find('.popover').addClass('popover-info');
    overlayElement.find('.popover-close').on('mousedown', () => {
      overlayElement.popover('hide');
    });
  }.bind(this), 250);
};

const addressOverlay = new Overlay({
  element: document.getElementById('popup'),
});

const hoverOverlay = new Overlay({
  element: document.getElementById('popup_hover'),
});

$(document).on('click', '.addr-clipboard', function (event) {
  event.stopPropagation();
  const el = document.createElement('textarea');
  el.value = $(this).text() || '';
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  navigator.clipboard.writeText(el.value);
  document.body.removeChild(el);
  $(addressOverlay.getElement()).popover('hide');
  $.notify({
    message: '선택한 주소(좌표)가 클립보드에 저장되었습니다',
  });
});

export { addressOverlay, hoverOverlay };
