import { getCenter } from 'ol/extent';
import { default as ModalOverlay } from './Modal';
import { default as HistoryModal } from './History';
import { default as PhotoModal } from './Photo';
import { default as PdfModal } from './PdfModal';
import { default as fetchWorker } from '../worker/fetch.wrapper';
import { featureDateFilter, featureNameFilter, unitFilter } from '../filter';
import { view } from '../view';
import {selectInteraction} from "../map";

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
            tableRow = `
<table>
<thead>1.시설 현황</thead>
<tr>
<th>시설 명칭</th>
<td>${response[0]['시설명칭']}</td>
<th>관리자</th>
<td>${response[0]['관리자']}</td>
<th>대장작성일</th>
<td>${response[0]['대장작성일']}</td>
</tr>
<tr>
<th>소유자/점유자<br>또는 관리인</th>
<td>${response[0]['소유자']=== null ? '' : response[0]['소유자']}</td>
<th>위험시설<br>지정일</th>
<td>${response[0]['위험시설지정일']=== null ? '' : response[0]['위험시설지정일']}</td>
<th>위험시설 지정<br>고시번호</th>
<td>${response[0]['위험시설지정고시번호']=== null ? '' : response[0]['위험시설지정고시번호']}</td>
</tr>
<tr>
<th>위치</th>
<td colspan="5">${response[0]['위치']}</td>
</tr>
<tr>
<!--<th>폭</th>-->
<!--<td>${response[0]["제원_폭"]=== undefined ? '' : response[0]['제원_폭']}</td>-->
<th>평균 폭</th>
<td>${response[0]["제원_평균폭"]=== undefined ? '' : response[0]['제원_평균폭']}</td>
<th>연장</th>
<td>${response[0]['제원_연장']}</td>
<th>높이</th>
<td>${response[0]['제원_높이']=== undefined ? '' : response[0]['제원_높이']}</td>
</tr>
<tr>
<th>수혜구역</th>
<td>${response[0]['수혜구역']=== null ? '' : response[0]['수혜구역']}</td>
</tr>
<tr>
<th>시설부속물_수량</th>
<td>${response[0]['시설부속물_총수량']=== null ? '' : response[0]['시설부속물_총수량']}</td>
<th>시설부속물_유형</th>
<td>${response[0]['시설부속물_유형별'] === null ? '' : response[0]['시설부속물_유형별']}</td>
</tr>
<tr>
<th>그 밖의 사항</th>
<td>${response[0]['그밖의사항'] === null ? '' : response[0]['그밖의사항']}</td>
</tr>
</table>
<br>
<br>
<table>
<thead>2.시설 정비 현황</thead>
<tr>
<th>구분</th>
<th>사업량_연장</th>
<th>사업량_폭</th>
<th>사업비</th>
<th>착공일</th>
<th>준공일</th>
<th>시설부속물</th>
</tr>
<tr>
<th>전체계획</th>
<td>${response[0]['전체계획_사업량_연장'] === null ? '' : response[0]['전체계획_사업량_연장']}</td>
<td>${response[0]['전체계획_사업량_폭'] === null ? '' : response[0]['전체계획_사업량_폭']}</td>
<td>${response[0]['전체계획_사업비'] === null ? '' : response[0]['전체계획_사업비']}</td>
<td>${response[0]['전체계획_착공일'] === null ? '' : response[0]['전체계획_착공일']}</td>
<td>${response[0]['전체계획_준공일'] === null ? '' : response[0]['전체계획_준공일']}</td>
<td>${response[0]['전체계획_시설부속물'] === null ? '' : response[0]['전체계획_시설부속물']}</td>
</tr>
</table>`;
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
    console.log('check layer: ', _layer)
    let _layer2 = window.webgis.table.photo
    let _layerSub = that.getFeature('layer');
    _layerSub = _layerSub.match(/(.*받이)/g) !== null ? '물받이' : _layerSub;
    let _id = that.getFeature('id');
    fetchWorker.fetch(`${window.webgis.role}/info/check`, {
      table_image: _layer === '보수공사' ? window.webgis.table.repairPhoto : _layer2.get(_layer),
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

