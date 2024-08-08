import {getCenter} from 'ol/extent';
import {default as ModalOverlay} from './Modal';
import {default as HistoryModal} from './History';
import {default as PhotoModal} from './Photo';
import {default as fetchWorker} from '../worker/fetch.wrapper';
import {featureDateFilter, featureNameFilter, unitFilter} from '../filter';
import {view} from '../view';

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
          }
          return false;
        }) && value != null) {
          value = `${value} ${unitFilter.get(filterKey)}`;
        }
        if (key === '') {
          tableRow = '';
        } else {
          tableRow = setTableHTML(response[0]);
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

    function setTableHTML(res) {
      const spec = switchWidthHTML(res)
      const spec2 = switchWidthHTML2(res)
      return `
        <table>
	<h6 style="font-weight: bold; font-size: 1rem">1.시설 현황</h6>
	<tr>
		<th style="width: 15%;">시설 명칭</th>
		<td style="width: 20%;" colspan="2">${res['시설명칭'] !== null ? res['시설명칭'] : ""}</td>
		<th style="width: 15%;">관리자</th>
		<td style="width: 15%; text-align: center" colspan="2">${res['관리자'] !== null ? res['관리자'] : ""}</td>
		<th style="width: 20%;">대장작성일</th>
		<td style="width: 15%; text-align: center">${res['대장작성일'] !== null ? res['대장작성일'] : ""}</td>
	</tr>
	<tr>
		<th>소유자/점유자<br>또는 관리인</th>
		<td style="text-align: center" colspan="2">${res['소유자'] !== null ? res['소유자'] : ""}</td>
		<th>위험시설<br>지정일</th>
		<td style="text-align: center" colspan="2">${res['위험시설지정일'] !== null ? res['위험시설지정일'] : ""}</td>
		<th>위험시설 지정<br>고시번호</th>
		<td style="text-align: center">${res['위험시설지정고시번호'] !== null ? res['위험시설지정고시번호'] : ""}</td>
	</tr>
	<tr>
		<th>위치</th>
		<td colspan="7">${res['위치'] !== null ? res['위치'] : ""}</td>
	</tr>
	<tr>
		${spec}
	</tr>
	<tr>
		<th>수혜구역</th>
		<td colspan="7">${res['수혜구역'] !== null ? res['수혜구역'] : ""}</td>
	</tr>
	<tr>
		<th>시설부속물</th>
<!--		<td colspan="7">총 ${res['시설부속물_총수량'] !== null ? res['시설부속물_총수량'] : ""}개소 (유형별: ${res['시설부속물_유형별'] !== null ? res['시설부속물_유형별'] : ""})</td>-->
        <td colspan="7">${res['시설부속물_총수량'] !== null ? `총 ${res['시설부속물_총수량']}개소 ${res['시설부속물_유형별'] !== null ? `(유형별: ${res['시설부속물_유형별']})` : ""}` : ""}</td>
	</tr>
	<tr>
		${spec2}
	</tr>
  </table>
  <br>
  <br>

  <table>
	<h6 style="font-weight: bold; font-size: 1rem">2.시설 정비 현황</h6>
	<tr>
		<th style="width: 15%;" rowspan="2">구분</th>
		<th style="width: 20%;" colspan="2">제원(m)</th>
		<th style="width: 15%;" rowspan="2">사업비<br>(백만원)</th>
		<th style="width: 15%;" colspan="2">공사기간</th>
		<th style="width: 35%;" colspan="2" rowspan="2">시설부속물</th>
	</tr>
	<tr>
		<th style="width: 10%;">연장</th>
		<th style="width: 10%;">폭</th>
		<th style="width: 7.5%;">착공</th>
		<th style="width: 7.5%;">준공</th>
	</tr>
          <tr>
            <th>전체계획</th>
            <td>${res['전체계획_사업량_연장'] === '0.00' ? '' : res['전체계획_사업량_연장'] === null ? '' : res['전체계획_사업량_연장']}</td>
            <td>${res['전체계획_사업량_폭'] === '0.00' ? '' : res['전체계획_사업량_폭'] === null ? '' : res['전체계획_사업량_폭']}</td>
            <td style="text-align: end">${res['전체계획_사업비'] === '0.00' ? '' : res['전체계획_사업비'] === null ? '' : res['전체계획_사업비']}</td>
            <td>${res['전체계획_착공일'] === '0.00' ? '' : res['전체계획_착공일'] === null ? '' : res['전체계획_착공일']}</td>
            <td>${res['전체계획_준공일'] === '0.00' ? '' : res['전체계획_준공일'] === null ? '' : res['전체계획_준공일']}</td>
            <td colspan="2">${res['전체계획_시설부속물'] === '0.00' ? '' : res['전체계획_시설부속물'] === null ? '' : res['전체계획_시설부속물']}</td>
          </tr>
      </table>

`
    }

    function switchWidthHTML(res) {
      switch (res["레이어"]) {
        case "소교량":
          return `<th>폭</th>
            <td colspan="2">${res["제원_폭"] === undefined ? '' : res['제원_폭']} m</td>
            <th>연 장</th>
            <td colspan="2">${res['제원_연장'] === null ? '' : res['제원_연장']} m</td>
            <th>높 이</th>
            <td>${res['제원_높이'] === undefined || res['제원_높이'] === null ? '' : res['제원_높이']} m</td>`
        case "낙차공":
          return `<th>연 장</th>
            <td colSpan="3">${res['제원_연장'] === null ? '' : res['제원_연장']} m</td>
            <th colspan="2">높 이</th>
            <td colspan="2">${res['제원_높이'] === undefined || res['제원_높이'] === null ? '' : res['제원_높이']} m</td>`
        default:
          return `<th>연 장</th>
            <td colspan="3">${res['제원_연장'] === null ? '' : res['제원_연장']} m</td>
            <th colspan="2">평균 폭</th>
            <td colspan="2">${res["제원_평균폭"] === undefined ? '' : res['제원_평균폭']} m</td>`
      }
    }

    function switchWidthHTML2(res) {
      switch (res["레이어"]) {
        case "소교량":
          return `<th>그 밖의 사항</th>
            <td colspan="7">${res['그밖의사항'] === null ? `구조형식:${res['구조형식']}` : `구조형식:${res['구조형식']}/ ${res["그밖의사항"]}`}</td>`
        case "낙차공":
          return `<th>그 밖의 사항</th>
            <td colspan="7">${res['그밖의사항'] === null ? `구조형식:${res['구조형식']}` : `구조형식:${res['구조형식']}/ ${res["그밖의사항"]}`}</td>`
        default:
          return `<th>그 밖의 사항</th>
            <td colspan="7">${res['그밖의사항'] === null ? '' : res['그밖의사항']}</td>`
      }
    }
  }

  checkPhotoAndHistory() {
    let that = this;
    let _layer = that.getFeature('layer');
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
        .addClass('btn-outline-dark btn-hover-dark');
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


