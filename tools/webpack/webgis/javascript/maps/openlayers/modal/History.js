import { default as ModalOverlay } from './Modal';
import { default as fetchWorker } from '../worker/fetch.wrapper';

export default class HistoryModal extends ModalOverlay {

  constructor(element) {
    super(element);

    this.addElements([
      '.card-title h3',
      '.carousel-inner',
      '.carousel-item',
      '.carousel-item img',
      '.carousel-item button',
      '.card-body table',
      '#kt_history_modal_details',
    ]);

    this._imageBlobSet = new Set();

    let that = this;

    this._table = function () {

      let _tableEl;

      /**
       * @link https://datatables.net/manual/tech-notes/3
       */
      const _createTable = function (result) {
        _tableEl = that['.card-body table'].DataTable({
          autoWidth: true,
          columns: [
            { data: '유지보수일련번호' },
            { data: '유지보수일자' },
            { data: '유지보수구분' },
            { data: '유지보수사유' },
            { data: '시공자명' },
            { data: '_PHOTOS' },
          ],
          columnDefs: [
            {
              targets: 4,
              render: $.fn.dataTable.render.ellipsis(4),
            },
            {
              targets: 5,
              render: function (data, type, full, meta) {
                return data == null ? `` : `<a href="javascript:;" class="label label-inline label-info">${data.length} 장</a>`;
              },
            },
          ],
          data: result,
          deferRender: true,
          dom: `<'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-6'i><'col-sm-12 col-md-6'p>>`,
          language: {
            url: '/assets/media/json/datatables-net-i18n.json',
            select: {
              processing: '불러오는 중...',
              rows: {
                0: '내역을 선택하세요',
                _: '',
              },
            },
          },
          lengthMenu: [5],
          ordering: false,
          pageLength: 5,
          processing: true,
          responsive: true,
          destroy: true,
          searching: false,
          select: 'single',
          serverSide: false,
        });
      };

      const _onSelectTable = function (event, dt, type, indexes) {
        if (type === 'row') {
          that.resetCarousel();
          let rowData = _tableEl.rows(indexes).data();
          let rowDataPhoto = rowData.pluck('_PHOTOS')[0];
          if (rowDataPhoto != null) {
            that.updateCarousel(rowDataPhoto);
          }
          let rowDataDetails = rowData.pluck('유지보수내용')[0];
          if (rowDataDetails != null) {
            that['#kt_history_modal_details'].html(rowDataDetails);
            that['#kt_history_modal_details'].removeClass('text-muted');
          } else {
            that['#kt_history_modal_details'].html('등록된 상세 내용이 없습니다');
            that['#kt_history_modal_details'].addClass('text-muted');
          }
        }
      };

      return {
        init: function (result) {
          _createTable(result);

          _tableEl.on('select', _onSelectTable);
        },
      };
    }();

    this._modalEl.on('hidden.bs.modal', function () {
      that._featureMap.clear();
      that._imageBlobSet.forEach(blob => URL.revokeObjectURL(blob));
      that._imageBlobSet.clear();
      that.resetCarousel();
    });
  }

  setFeature(feature) {
    super.setFeature(feature);
    this._featureMap.set('layerSub', this.getLayerSubName(feature));
  }

  setFeatureAsync(feature) {
    this.setFeature(feature);

    let that = this;
    that.resetCarousel();
    let _layer = that.getFeature('layer');
    let _id = that.getFeature('id');
    return new Promise((resolve, reject) => {
      fetchWorker.fetch(`${window.webgis.role}/info/history`, {
        table: window.webgis.table.maintenance,
        layer: that.getFeature('layerSub'),
        id: _id,
      }, 'image/jpg')
        .then(formatResult)
        .then(updateModal)
        .then(hasHistory => {
          if (hasHistory) {
            resolve(that);
          } else {
            reject(`${_layer} (관리번호: ${_id}) 에 등록된 보수내역이 없습니다`);
          }
        })
        .catch(() => reject('보수내역을 표시할 수 없습니다'));
    });

    function formatResult(result) {
      if (result?.length > 0) {
        let photoMap = new Map();
        result.forEach(function (item) {
          let key = item['유지보수일련번호'];
          // Format photo records
          let photoKey = item['사진일련번호'];
          if (photoKey != null) {
            let photoUrl = item['사진'];
            let photoName = item['사진명칭'];
            if (!photoMap.has(key)) {
              // noinspection NonAsciiCharacters
              item['_PHOTOS'] = [{
                '사진일련번호': photoKey,
                '사진': photoUrl,
                '사진명칭': photoName,
              }];
              delete item['사진일련번호'];
              delete item['사진'];
              delete item['사진명칭'];
              photoMap.set(key, item);
            } else {
              let oldItem = photoMap.get(key);
              // noinspection NonAsciiCharacters
              oldItem['_PHOTOS'].push({
                '사진일련번호': photoKey,
                '사진': photoUrl,
                '사진명칭': photoName,
              });
              photoMap.set(key, oldItem);
            }
          } else {
            item['_PHOTOS'] = null;
            photoMap.set(key, item);
          }
          // Format dates
          item['유지보수일자'] = moment(item['유지보수일자']).format('YY.MM.DD HH:mm');
        });
        return [...photoMap.values()];
      } else return null;
    }

    function updateModal(result) {
      if (result != null) {
        that['.card-title h3'].html(`${_layer} (관리번호: ${_id}) 유지・보수 내역`);
        that['.carousel-item button'].html('유지보수내역을 선택하세요');
        that._table.init(result);
        return true;
      }
      return false;
    }
  }
}
