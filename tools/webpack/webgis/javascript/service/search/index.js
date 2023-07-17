import { setMapMarker, setMapMarkerSet } from './kakaoMap';
import { default as EditModal } from './EditModal';
import { default as sweetalert } from '../../plugins/sweetalert-mixin';

const ServiceSearch = function () {

  let _tableEl;
  let _table;
  let _tableButtonOptions;
  let _tableControl;
  let _tableSearchButton;
  let _tableSearchButtonLabel;
  let _tableSearchResetButton;
  let _searchResultSet;
  // eslint-disable-next-line no-undef
  let _dateRangeFilter = yadcf;
  let _contextmenuAjaxDefault;

  let _map;
  let _mapWrapper;
  let _mapToggle;
  let _isExpandMap = false;

  let _defaultMapHeight;
  let _expandMapHeight;

  let _tableEditModal;

  $.fn.dataTable.Api.register('column().title()', function () {
    return $(this.header()).text().trim();
  });

  const _init = function () {
    moment.locale('ko');

    _tableButtonOptions = {
      pageSize: 'A4',
      orientation: 'landscape',
      filename: moment().format('YYYYMMDD') + '_민원',
      messageTop: moment().format('llll'),
      title: '',
    };

    _contextmenuAjaxDefault = {
      url: null,
      headers: { 'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content') },
      type: 'POST',
      data: null,
      success: null,
      error: err => {
        $.notify({
          message: `[오류] ${err.responseText}`,
        }, { type: 'danger' });
      },
    };

    _defaultMapHeight = document.querySelector('#search_map').offsetHeight;
    _expandMapHeight = document.querySelector('#container-search').offsetHeight -
      (document.querySelector('#kt_datatable thead').offsetHeight + 50);
  };

  const _initTable = function () {

    // begin first tab
    _table = _tableEl.DataTable({
      ajax: {
        url: `${window.location.origin}/service/search`,
        type: 'POST',
        headers: {
          'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
        },
      },
      autoWidth: true,
      buttons: [
        $.extend(true, {}, _tableButtonOptions, {
          extend: 'print',
          exportOptions: {
            columns: [
              function (idx, data, node) {
                return idx > 0 && idx < 11;
              },
            ],
          },
        }),
        $.extend(true, {}, _tableButtonOptions, {
          extend: 'excelHtml5',
          exportOptions: {
            columns: [
              function (idx, data, node) {
                return idx > 0 && idx < 12;
              },
            ],
          },
        }),
      ],
      columnDefs: [
        {
          targets: 0,
          className: 'select-checkbox',
          data: null,
          defaultContent: '',
          orderable: false,
          width: '10px',
        },
        {
          targets: 1,
          render: function (data, type, full, meta) {
            let dataString = data.toString();
            return `${dataString.substring(0, 4)}–${dataString.substring(4)}`;
          },
        },
        {
          targets: 3,
          render: function (data, type, full, meta) {
            return moment(data).format('YYYY/MM/DD a h:mm');
          },
        },
        {
          targets: 9,
          render: function (data, type, full, meta) {
            // noinspection NonAsciiCharacters
            const status = {
              '신청접수': { text: 'text-dark' },
              '처리완료': { text: 'text-blue' },
            };
            if (typeof status[data] === 'undefined') {
              return data;
            }
            return `<span class="${status[data].text}">${data}</span>`;
          },
        },
        {
          targets: -1,
          orderable: false,
          className: 'dtr-control',
          width: 1,
        },
      ],
      columns: [
        { data: 'chk' },
        { data: '번호' },
        { data: '접수자' },
        { data: '일자' },
        { data: '민원인' },
        { data: '연락처' },
        { data: '지번 주소' },
        { data: '도로명 주소' },
        { data: '접수' },
        { data: '진행' },
        { data: '대행' },
        { data: '상세' },
        { data: 'btn' },
      ],
      // createdRow: function (row, data, dataIndex) {
      //   if (data['진행'] === '처리완료') {
      //     $(row).addClass('tr-color');
      //   }
      // },
      deferRender: true,
      // read more: https://datatables.net/examples/basic_init/dom.html
      dom: `<'row'<tr>><'row'<'col-sm-12 col-md-3'ri><'col-sm-12 col-md-9 dataTables_pager'lp>>`,
      initComplete: function (settings, json) {
        let thisTable = this;
        let rowFilter = $('<tr class="filter"></tr>').appendTo($(_table.table().header()));

        this.api().columns().every(function () {
          let column = this;
          let input;

          switch (column.title()) {
            case '번호':
            case '접수자':
            case '민원인':
            case '연락처':
            case '지번 주소':
            case '도로명 주소': {
              input = $(`<input type="text" class="form-control form-control-sm form-filter datatable-input" data-col-index="${column.index()}"/>`);
              break;
            }

            case '일자': {
              input = $(`<div id="kt_datatable_daterange"></div>`);
              break;
            }

            case '접수내용': {
              // noinspection NonAsciiCharacters
              let type = {
                '미분류': { title: '미분류', state: 'success' },
                '계량기 동파': { title: '계량기 동파', state: 'success' },
                '단수': { title: '단수', state: 'success' },
                '도로 누수': { title: '도로 누수', state: 'success' },
                '보호통 누수 및 교체': { title: '보호통 누수 및 교체', state: 'success' },
                '수질': { title: '수질', state: 'success' },
                '신규 급수 신청': { title: '신규 급수 신청', state: 'success' },
                '앵글밸브 고장': { title: '앵글밸브 고장', state: 'success' },
                '저수압': { title: '저수압', state: 'success' },
                '기타': { title: '기타', state: 'success' },
              };
              input = $(`<select class="form-control form-filter datatable-input selectpicker" title="선택" data-col-index="${column.index()}" multiple data-selected-text-format="count > 1" data-width="fit"></select>`);
              column.data().unique().sort().each(function (d, j) {
                $(input).append('<option value="' + d + '">' + type[d].title + '</option>');
              });
              break;
            }

            case '진행상태': {
              // noinspection NonAsciiCharacters
              let status = {
                '미분류': { title: '미분류', state: 'label-light-primary' },
                '신청접수': { title: '신청접수', state: ' label-light-success' },
                '진행중': { title: '진행중', state: ' label-light-warning' },
                '처리보류': { title: '처리보류', state: ' label-light-danger' },
                '협조/이첩': { title: '협조/이첩', state: ' label-light-danger' },
                '처리완료': { title: '처리완료', state: ' label-light-danger' },
                '처리중단': { title: '처리중단', state: ' label-light-danger' },
              };
              input = $(`<select class="form-control form-filter datatable-input selectpicker" title="선택" data-col-index="${column.index()}" multiple data-max-options="1" data-width="fit"></select>`);
              column.data().unique().sort().each(function (d, j) {
                $(input).append('<option value="' + d + '">' + status[d].title + '</option>');
              });
              break;
            }

            default: {
              break;
            }
          }

          if (column.title() !== '' || column.title() !== '대행업체' || column.title() !== '민원상세') {
            $(input).appendTo($('<th>').appendTo(rowFilter));
          }
        });

        // hide search column for responsive table
        const hideSearchColumnResponsive = function () {
          thisTable.api().columns().every(function () {
            const column = this;
            if (column.responsiveHidden()) {
              $(rowFilter).find('th').eq(column.index()).show();
            } else {
              $(rowFilter).find('th').eq(column.index()).hide();
            }
          });
          thisTable.api().table().draw();
        };

        // init on datatable load
        hideSearchColumnResponsive();
        // recheck on window resize
        window.onresize = hideSearchColumnResponsive;
      },
      headerCallback: function (thead, data, start, end, display) {
        const theadSelect = $(thead.getElementsByTagName('th')[0]).html('<input type="checkbox">');
        theadSelect.children().on('click', function () {
          if ($(this).is(':checked')) {
            _table.rows({ search: 'applied' }).select();
          } else {
            _table.rows({ search: 'applied' }).deselect();
          }
        });
        thead.getElementsByTagName('th')[3].id = 'daterange';
      },
      language: {
        url: '/assets/media/json/datatables-net-i18n.json',
        select: {
          processing: '불러오는 중...',
          rows: {
            0: '표를 클릭하여 선택하세요',
            _: '%d 건의 민원이 선택되었습니다',
          },
        },
      },
      lengthMenu: [5, 10, 25, 50],
      order: [[9, 'asc'], [1, 'desc']],
      pageLength: 10,
      pagingType: 'full_numbers',
      processing: true,
      responsive: {
        details: {
          target: -1,
          type: 'column',
        },
      },
      select: {
        style: 'multi',
        selector: 'td:first-child',
      },
      serverSide: false,
    });
  };

  /**
   * Lazy initialize yadcf date range filter, finding filter_container_id properly
   * @private
   */
  function _onTableInitComplete() {
    _dateRangeFilter.init(_table, [
      {
        column_number: 3,
        datepicker_type: 'jquery-ui',
        filter_container_id: 'kt_datatable_daterange',
        filter_type: 'range_date',
        date_format: 'yyyy/mm/dd',
        filter_delay: 250,
        style_class: 'form-control form-control-sm',
        filter_reset_button_text: false,
      },
    ]);
    let selectpickers = _tableEl.find('.datatable-input.selectpicker');
    selectpickers.selectpicker('refresh');

    _tableEl.find('input').on('keyup', event => {
      if (event.key === 'Enter') _onClickTableSearch(event);
    });
  }

  function _initTableContextMenuModal() {
    _tableEditModal = new EditModal(_table);
  }

  function _initTableContextMenu() {
    _tableEl.contextMenu({
      selector: 'tbody > tr.selected',
      build: ($trigger, e) => {
        let sData = _table.rows({ selected: true }).data();
        let isSelected = sData.length > 0;
        let isFinished = sData.pluck('진행').toArray().includes('처리완료');
        let ids = sData.pluck('번호').toArray();
        return {
          callback: (key, options) => {
          },
          items: {
            'title': {
              name: () => {
                switch (sData.length) {
                  case 0: {
                    return '선택: <strong>없음</strong>';
                  }
                  case 1: {
                    const dataString = sData.pluck('번호')[0].toString();
                    return `선택: <strong>${dataString.substring(0, 4)}–${dataString.substring(4)}</strong>`;
                  }
                  default: {
                    return '선택: <strong>1 건 이상</strong>';
                  }
                }
              },
              isHtmlName: true,
              icon: 'fas fa-mouse-pointer text-primary',
              callback: () => false,
            },
            'sep1': '---------',
            'status': {
              name: '처리완료',
              icon: 'fas fa-check text-success',
              disabled: !isSelected,
              callback: (itemKey, opt, e) => {
                sweetalert.confirmServiceStatusDone
                  .fire()
                  .then(result => {
                    if (result.value) {
                      $.ajax({
                        ..._contextmenuAjaxDefault,
                        url: `${window.location.origin}/service/search?api=prof`,
                        data: { id: ids },
                        success: () => {
                          $.notify({
                            message: '선택한 민원이 처리완료되었습니다',
                          }, { type: 'success' });
                          _table.ajax.reload();
                        },
                      });
                    }
                  });
              },
            },
            'edit': {
              name: '편집',
              icon: 'fas fa-pen-alt text-warning',
              disabled: sData.length !== 1 || isFinished,
              callback: (itemKey, opt, e) => {
                _tableEditModal.showModal(sData);
              },
            },
            'delete': {
              name: '삭제',
              icon: 'fas fa-trash text-danger',
              disabled: !isSelected || isFinished,
              callback: (itemKey, opt, e) => {
                sweetalert.confirmServiceDelete
                  .fire()
                  .then(result => {
                    if (result.value) {
                      $.ajax({
                        ..._contextmenuAjaxDefault,
                        url: `${window.location.origin}/service/search?api=prod`,
                        data: { id: ids },
                        success: () => {
                          $.notify({
                            message: '선택한 민원이 삭제되었습니다',
                          }, { type: 'success' });
                          _table.ajax.reload();
                        },
                      });
                    }
                  });
              },
            },
          },
        };
      },
    });
  }

  function _onSelectTable(e, dt, type, indexes) {
    if (type === 'row') {
      let data = _table.rows(indexes).data();
      let pointArray = [data.pluck('x')[0], data.pluck('y')[0]];
      setMapMarker(pointArray);
    }
  }

  function _onClickMapToggle(event) {
    event.preventDefault();
    _isExpandMap = !_isExpandMap;
    _mapWrapper.height(_isExpandMap ? _expandMapHeight : _defaultMapHeight);
    _map.height(_isExpandMap ? _expandMapHeight : _defaultMapHeight);
  }

  function _onTransitionStart(event) {
    event.preventDefault();
    _tableSearchResetButton.addClass('disabled');
  }

  function _onTransitionEnd(event) {
    event.preventDefault();
    // Since kakao map zoom level change invokes transition events,
    // calling #setMapMarkerSet() here would prevent user from making further zoom level changes
    _tableSearchResetButton.removeClass('disabled');
  }

  function _onClickTableSearch(event) {
    event.preventDefault();

    _table.rows().deselect();

    let params = {};
    _tableEl.find('.datatable-input').each(function () {
      let i = $(this).data('col-index');
      if (params[i]) {
        params[i] += '|' + $(this).val();
      } else {
        // i === 8: 접수내용(apl_cde) search filters are set from dropdown(selectpicker)
        // and requires different formatting for smart search of datatables.net library to work properly
        // @link: https://datatables.net/reference/api/search()
        let pattern;
        if (i === 8) {
          pattern = ($(this).val() + '')
            // When using multiple select option in selectpicker, selected values are separated by commas,
            // and this should be replaced by | for datatables.net library to work.
            .replace(/,/g, '|')
            // Because of whitespace within some of the selected values such as "도로 누수", the search results include
            // invalid results such as "보호통 누수 및 교체". To ignore whitespaces within these values,
            // whitespaces should be replaced by . for datatables.net library to work.
            .replace(/\s/g, '.');
        } else {
          pattern = ($(this).val() + '')
            // Other search keywords are separated by whitespace, it should be replaced by | for search to work.
            .split(/\s/g).join('|');
        }
        params[i] = `(${pattern})`;
      }
    });
    $.each(params, (i, val) => {
      _table.column(i).search(val ? val : '', true, true, true);
    });
    _table.table().draw();

    let filterRows = _table.rows({ search: 'applied' }).data();

    _updateSearchLabel(filterRows.length);

    if (filterRows.length < 1) {
      $.notify({
        message: '지도에 표시할 검색결과가 없습니다',
      }, { type: 'danger' });
      _searchResultSet.clear();
      setMapMarkerSet(null);
    } else {
      _searchResultSet.clear();
      filterRows.each((d, j) => _searchResultSet.add([d['x'], d['y']]));
      setTimeout(() => setMapMarkerSet(_searchResultSet), 250);
    }
  }

  function _onClickTableSearchReset(event) {
    event.preventDefault();

    _table.rows().deselect();

    _dateRangeFilter.exResetAllFilters(_table, true);
    let input = _tableEl.find('.datatable-input');
    input.val('').find('.selectpicker').selectpicker('refresh');
    input.each(function () {
      _table.column($(this).data('col-index')).search('', false, false);
    });
    _table.table().draw();

    _mapWrapper.height(_defaultMapHeight);
    _map.height(_defaultMapHeight);

    _updateSearchLabel(0);

    _searchResultSet.clear();
    setMapMarkerSet(null);
  }

  function _updateSearchLabel(count) {
    if (count > 0) {
      _tableSearchButtonLabel.attr('hidden', false).html(`${count} 건`);
    } else {
      _tableSearchButtonLabel.attr('hidden', true).html('');
    }
  }

  const _initTableExportButton = function () {
    $('#kt_datatable_print').on('mousedown', function (e) {
      e.preventDefault();
      _table.button(0).trigger();
    });

    $('#kt_datatable_excel').on('mousedown', function (e) {
      e.preventDefault();
      _table.button(1).trigger();
    });
  };

  function _onErrorDt(e, settings, techNote, message) {
    console.warn(`[오류] ${message}`);
  }

  return {

    //main function to initiate the module
    init: function () {
      _searchResultSet = new Set();

      _tableEl = $('#kt_datatable');
      _tableControl = $('.ribbon-target');
      _tableSearchButton = _tableControl.find('#kt_datatable_search');
      _tableSearchButtonLabel = _tableSearchButton.find('.label');
      _tableSearchResetButton = _tableControl.find('#kt_datatable_clear');
      _mapToggle = _tableControl.find('#kt_datatable_map');
      _mapWrapper = $('#search_map_wrapper');
      _map = _mapWrapper.find('#search_map');

      _init();
      _initTable();
      _initTableContextMenuModal();
      _initTableContextMenu();
      _initTableExportButton();

      _table.on('init.dt', _onTableInitComplete);
      _table.on('select', _onSelectTable);
      _tableSearchButton.on('mousedown', _onClickTableSearch);
      _tableSearchResetButton.on('mousedown', _onClickTableSearchReset);
      _mapToggle.on('mousedown', _onClickMapToggle);
      _map.on('transitionstart', _onTransitionStart);
      _map.on('transitionend', _onTransitionEnd);
      _map.bind('mousewheel', () => false);

      _table.on('error.dt', _onErrorDt);
    },
  };

}();

jQuery(document).ready(function () {
  if (document.getElementById('card_search')) ServiceSearch.init();
});
