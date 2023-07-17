import { getCenter } from 'ol/extent';
import { default as ModalOverlay } from './Modal';
import { default as HistoryModal } from './History';
import { default as PhotoModal } from './Photo';
import { default as fetchWorker } from '../worker/fetch.wrapper';
import { featureDateFilter, featureNameFilter, unitFilter } from '../filter';
import { view } from '../view';

export default class InfoModal extends ModalOverlay {

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

    this._photoModal = new PhotoModal('#kt_photo_modal');
    this._historyModal = new HistoryModal('#kt_history_modal');

    this['.card-footer a.btn'].on('mousedown', this.onClickButton.bind(this));

    let that = this;

    this._modalEl.on('hidden.bs.modal', function () {
      that._featureMap.clear();
      that._interaction.getOverlay().setOverlay(null);
      that._interaction.getFeatures().clear();
    });
  }

  setFeature(feature) {
    super.setFeature(feature);
    this._feature = feature;
    this._featureMap.set('table', feature.get('layer') || feature.getId().match(/[^.]+/)[0]);
    this._featureMap.set('layerSub', this.getLayerSubName(feature));
    this._featureMap.set('isClosed', feature.get('폐관일자') !== undefined || feature.get('사용여부') === '폐전');
  }

  setFeatureAsync(feature) {
    this.setFeature(feature);

    let that = this;
    return new Promise((resolve, reject) => {
      fetchWorker.fetch(`${window.webgis.role}/info`, {
        table: that.getFeature('table'),
        id: that.getFeature('id'),
      }).then(updateTableRows)
        .then(updateTableHeader)
        .then(() => resolve(that))
        .catch(() => reject('정보를 표시할 수 없습니다'));
    });

    function updateTableRows(response) {
      let tableRow = '';
      let filterKey = '';
      JSON.stringify(response[0], function (key, value) {
        if (featureNameFilter.has(key)) return undefined;
        if (featureDateFilter.has(key)) {
          value = moment(value).isValid() ? moment(value).format('YYYY년 M월 D일') : value;
        }
        if ([...unitFilter.keys()].some(filter => {
          if (key.includes(filter)) {
            filterKey = filter;
            return true;
          } return false;
        }) && value != null) {
          value = `${value} ${unitFilter.get(filterKey)}`;
        }
        if (key === '') {
          tableRow = '';
        } else {
          tableRow += `<tr class="tr-striped"><th scope="row">${key}</th><td>${value || '<span class="text-muted">없음<small>&nbsp;null</small></span>'}</td></tr>`;
        }
        return value;
      });
      return tableRow;
    }

    function updateTableHeader(tableRows) {
      that['.card-title h3'].html(`${that.getFeature('layer')} 정보`);
      if (that.getFeature('isClosed')) {
        that['.card-title span'].removeClass('label-success');
        that['.card-title span'].addClass('label-danger');
        that['.card-title span'].html(`&nbsp;폐관•폐전`);
      } else {
        that['.card-title span'].removeClass('label-danger');
        that['.card-title span'].addClass('label-success');
        that['.card-title span'].html(`사용 중`);
      }
      that['.card-body tbody'].html(tableRows);
      that['.card-body tbody'][0].scrollIntoView();
      return that;
    }
  }

  checkPhotoAndHistory() {
    let that = this;
    let _layer = that.getFeature('layer');
    let _layerSub = that.getFeature('layerSub');
    _layerSub = _layerSub.match(/(.*받이)/g) !== null ? '물받이' : _layerSub;
    let _id = that.getFeature('id');
    fetchWorker.fetch(`${window.webgis.role}/info/check`, {
      table_image: _layer === '보수공사' ? window.webgis.table.repairPhoto : window.webgis.table.photo,
      table_history: window.webgis.table.maintenance,
      layer: _layerSub,
      id: _id,
    }).then(updateModal);

    function updateModal(result) {
      if (result?.length > 0) {
        result[0]['photo'] ? onButtonEnable(that['.card-footer #btn_photo_modal']) : onButtonDisable(that['.card-footer #btn_photo_modal']);
        result[0]['history'] ? onButtonEnable(that['.card-footer #btn_history_modal']) : onButtonDisable(that['.card-footer #btn_history_modal']);
      }
    }

    function onButtonEnable(element) {
      element
        .removeClass('disabled btn-outline-secondary btn-hover-secondary')
        .addClass('btn-outline-success btn-hover-success');
    }

    function onButtonDisable(element) {
      element
        .removeClass('btn-outline-success btn-hover-success')
        .addClass('disabled btn-outline-secondary btn-hover-secondary');
    }
  }

  onClickButton(event) {
    event.preventDefault();
    switch (event.target.id) {
      case 'btn_location': {
        this._interaction.addFeature(this._feature);
        view.setCenter(getCenter(this._feature.getGeometry().getExtent()));
        break;
      }
      case 'btn_history_modal': {
        this._historyModal.setFeatureAsync(this._feature).then(modal => {
          modal.showModal();
        }, reject => {
          // return $.notify({ message: reject }, { type: 'warning' });
          console.error(reject);
        });
        break;
      }
      case 'btn_photo_modal': {
        this._photoModal.setFeatureAsync(this._feature).then(modal => {
          modal.showModal();
        }, reject => {
          // return $.notify({ message: reject }, { type: 'warning' });
          console.error(reject);
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  addInteraction(interaction) {
    this._interaction = interaction;
  }
}
