export default class ModalOverlay {

  constructor(element) {
    this._modalEl = $(`${element}`);

    this._featureMap = new Map();
  }

  addElements(selectors) {
    selectors.forEach(selector => {
      this[selector] = this._modalEl.find(selector);
    }, this);
  }

  getLayerName(feature) {
    return (feature.get('레이어') || feature.get('layer') || feature.get('시설물구분') || '').trim();
  }

  getLayerSubName(feature) {
    return (feature.get('시설물구분') || feature.get('레이어') || feature.get('layer'))
      .replace(/역지변|이토변|배기변|감압변|안전변/g, '제수변')
      .replace(/오수관|우수관|차집관/g, '하수관거(암거)')
      .replace(/오수받이|우수받이/g, '물받이')
      .replace(/오수맨홀|우수맨홀|집수맨홀|차집맨홀|합류맨홀/g, '하수맨홀')
      .replace('블럭', '')
      .trim();
  }

  getFeature(key) {
    return this._featureMap.get(key);
  }

  setFeature(feature) {
    this._featureMap.set('layer', this.getLayerName(feature));
    this._featureMap.set('id', feature.get('관리번호') || feature.get('ftr_idn'));
  }

  showModal() {
    this._modalEl.modal('show');
  }

  hideModal() {
    this._modalEl.modal('hide');
  }
//
  updateCarousel(data) {
    for (let i = 0, len = data.length; i < len; i++) {
      const title = `${data[i]['img_name']}`;
      const imageBlob = data[i]['url'];
      let parts = imageBlob.split("_"); // Split the string into an array using "_" as delimiter
      let lastPart = parts[parts.length - 1]; // Get the last element of the array
      let fileName = lastPart.replace(".jpg", ""); // Remove the ".jpg" extension from the last part
      const imagesHtml = `<h2>${fileName}</h2><img src="${imageBlob}" style="width: 100%;" alt="현재 작업 중입니다">`;

      if (i === 0) {
        this['.carousel-item img'].attr('src', imageBlob);
        this['.carousel-item button'].html(title);
        this['.carousel-item button'].on('mousedown', () => {
          // window.open('about:blank', 'Popup', 'location, resizable');
          const popup = window.open('about:blank', 'Popup', 'location, resizable');
          if (popup) {
            popup.document.body.innerHTML = imagesHtml;
          }
        });
        this['.carousel-item'].addClass('active');
      } else {
        const _node = this['.carousel-item'].clone();
        _node.removeClass('active');
        _node.find('img').attr('src', imageBlob);
        _node.find('div > button').html(title);
        _node.find('div > button').on('mousedown', () => {
          const popup = window.open('about:blank', 'Popup', 'location, resizable');
          if (popup) {
            popup.document.body.innerHTML = imagesHtml;
          }
        });
        this['.carousel-inner'].append(_node);
      }
    }
  }

  resetCarousel() {
    if (this['.carousel-inner']) {
      this['.carousel-inner'].children().slice(1).remove();
      this['.carousel-item img'].attr('src', './assets/media/bg/bg-default.png');
      this['.carousel-item button'].html('등록된 사진이 없습니다');
      this['.carousel-item button'].off('mousedown');
      this['.carousel-item'].addClass('active');
    }
  }
}
