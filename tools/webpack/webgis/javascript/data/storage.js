'use strict';

import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import Form from '@uppy/form';
import ImageEditor from '@uppy/image-editor';
import XHRUpload from '@uppy/xhr-upload';
import koreanLocale from '../plugins/uppy-locale';

// Class definition
const DataStorage = function () {

  let _tableEl;
  let _table;
  let _tableControl;
  let _tableSearchButton;
  let _tableSearchResetButton;
  let _tableRowDeleteButton;
  let _tableCustomDataType;

  let _uppy;
  let _uppyCoreOptions;
  let _uppyDashboardOptions;
  let _uppyFormOptions;
  let _uppyImageEditorOptions;
  let _uppyXHRUploadOptions;

  // let _form;
  let _dateRangeFilter = yadcf;

  let _tableAjaxDefault;

  $.fn.dataTable.Api.register('column().title()', function () {
    return $(this.header()).text().trim();
  });

  // Private functions
  const _init = function () {
    moment.locale('ko');

    _tableCustomDataType = {
      '': { title: '미분류', state: 'secondary' },
      'jpg': { title: 'jpg', state: 'secondary' },
      'png': { title: 'png', state: 'secondary' },
      'pdf': { title: 'pdf', state: 'danger' },
      'xlsx': { title: 'xlsx', state: 'success' },
    };

    // https://uppy.io/docs/uppy/
    _uppyCoreOptions = {
      // If multiple Uppy instances are being used, for instance, on two different pages, an id should be specified.
      id: 'uppyStorageCore',
      allowMultipleUploads: true,
      autoProceed: false,
      debug: false,
      locale: koreanLocale,
      // meta: {
      //   // todo: 모든 파일에 전역으로 설정되는 메타값 지정
      // },
      restrictions: {
        maxFileSize: 11000000,
        minFileSize: 1,
        maxNumberOfFiles: 10,
        minNumberOfFiles: 1,
        allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.xlsx'],
      },
    };

    // https://uppy.io/docs/dashboard/
    // tools/node_modules/@uppy/locales/lib/en_US.js
    _uppyDashboardOptions = {
      id: 'uppyStorageDashboard',
      target: '.uppy-storage-dashboard',
      // todo: 완료 누를 시 form 초기화
      doneButtonHandler: _onClickDone,
      height: 550, // todo: 400 이상에서만 note 나옴
      width: 800, // todo: 400 이상에서만 note 나옴
      hideProgressAfterFinish: false,
      inline: true,
      metaFields: [
        // If you’d like to force a certain meta field data to be entered before the upload, you can do so using onBeforeUpload.
        { id: 'reg_nam', name: '등록자', placeholder: '등록자의 이름을 입력하세요' },
        { id: 'fle_exp', name: '상세정보', placeholder: '파일의 상세정보를 입력하세요' },
        // { id: 'reg_cde', name: '등록유형', placeholder: '파일의 등록유형을 입력하세요(선택)' },
      ],
      note: '최대 10 개의 이미지, PDF, Excel 을 한번에 업로드 할 수 있습니다. (파일당 최대 10 MB)',
      proudlyDisplayPoweredByUppy: false,
      replaceTargetContent: false,
      showProgressDetails: true,
      waitForThumbnailsBeforeUpload: true,
    };

    _uppyFormOptions = {
      id: 'uppyStorageForm',
      target: '#data_storage_form',
      addResultToForm: false,
      getMetaFromForm: true,
      multipleResults: true,
      submitOnSuccess: false, // When set to true, the page refreshes after successful upload
      triggerUploadOnSubmit: false,
    };

    _uppyImageEditorOptions = {
      id: 'uppyStorageImageEditor',
      actions: {
        revert: true,
        rotate: true,
        flip: true,
        zoomIn: true,
        zoomOut: true,
        cropSquare: true,
        cropWidescreen: true,
        cropWidescreenVertical: true,
      },
      cropperOptions: {
        viewMode: 1,
        background: false,
        autoCropArea: 1,
        responsive: true,
      },
      quality: 1,
    };

    _uppyXHRUploadOptions = {
      id: 'uppyStorageXHRUpload',
      endpoint: `${window.location.origin}/data/storage/upload`,
      method: 'POST',
      headers: (file) => {
        return {
          'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
          'expires': file.meta.expires,
        };
      },
      limit: 10,
      formData: true,
      bundle: false,
      metaFields: null, // send all metadata fields
    };

    _tableAjaxDefault = {
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
  };

  const _initTable = function () {

    _table = _tableEl.DataTable({
      ajax: {
        url: `${window.location.origin}/data/storage/list`,
        type: 'GET',
        headers: {
          'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
        },
      },
      autoWidth: true,
      columnDefs: [
        {
          targets: 1,
          render: $.fn.dataTable.render.ellipsisWithAnchor(20),
        },
        {
          targets: 2,
          render: function (data, type, full, meta) {
            return `<span class="text-${_tableCustomDataType[data].state}">${data}</span>`;
          },
        },
        {
          targets: 3,
          render: function (data, type, full, meta) {
            return (~~((data + 0) / 1024)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
          },
        },
        {
          targets: 4,
          render: function (data, type, full, meta) {
            return moment(data).format('YYYY/MM/DD a h:mm');
          },
        },
        {
          targets: 6,
          render: function (data, type, full, meta) {
            return data === '없음' ? '' : data;
          },
        },
        {
          targets: -1,
          orderable: false,
          className: 'dtr-control',
        },
      ],
      columns: [
        { data: '관리번호' },
        { data: '파일명' },
        { data: '유형' },
        { data: '크기' },
        { data: '등록일자' },
        { data: '등록자' },
        { data: '파일상세' },
        { data: 'btn' },
      ],
      deferRender: true,
      dom: `<'row'<tr>><'row'<'col-sm-12 col-md-6'ri><'col-sm-12 col-md-6 dataTables_pager'p>>`,
      initComplete: function (settings, json) {
        let thisTable = this;
        let rowFilter = $('<tr class="filter"></tr>').appendTo($(_table.table().header()));

        this.api().columns().every(function () {
          let column = this;
          let input;

          switch (column.title()) {
            case '#':
            case '파일명': {
              input = $(`<input type="text" class="form-control form-control-sm form-filter datatable-input" data-col-index="${column.index()}"/>`);
              break;
            }

            case '등록일자': {
              input = $(`<div id="kt_datatable_daterange-storage"></div>`);
              break;
            }

            case '유형': {
              input = $(`<select class="form-control form-filter datatable-input selectpicker" title="선택" data-col-index="${column.index()}" multiple data-selected-text-format="count > 1" data-width="fit"></select>`);
              column.data().unique().sort().each(function (d, j) {
                $(input).append(`<option value="${d}">${_tableCustomDataType[d].title}</option>`);
              });
              break;
            }

            case '등록자': {
              input = $(`<select class="form-control form-filter datatable-input selectpicker" title="선택" data-col-index="${column.index()}" multiple data-max-options="1" data-width="fit"></select>`);
              column.data().unique().sort().each(function (d, j) {
                if (d !== null) {
                  $(input).append('<option value="' + d + '">' + d + '</option>');
                }
              });
              break;
            }

            default: {
              break;
            }
          }

          if (column.title() !== '' || column.title() !== '파일상세') {
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

        // this.api().rows().every(function () {
        // });
      },
      language: {
        url: '/assets/media/json/datatables-net-i18n.json',
        select: {
          processing: '불러오는 중...',
          rows: {
            0: '',
            _: '%d 개 항목 선택함 (Ctrl 및 Shift 로 다중선택)',
          },
        },
      },
      order: [[0, 'desc']],
      pageLength: 14,
      pagingType: 'full_numbers',
      processing: true,
      responsive: {
        details: {
          target: -1,
          type: 'column',
        },
      },
      select: {
        style: 'os',
        // selector: 'td:first-child',
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
        column_number: 4,
        datepicker_type: 'jquery-ui',
        filter_container_id: 'kt_datatable_daterange-storage',
        filter_type: 'range_date',
        date_format: 'yyyy/mm/dd',
        filter_delay: 250,
        style_class: 'form-control form-control-sm',
        filter_reset_button_text: false,
      },
    ]);
    let selectpickers = _tableEl.find('.datatable-input.selectpicker');
    selectpickers.selectpicker('refresh');
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
        let pattern;
        if (i === 2) {
          pattern = ($(this).val() + '')
            .replace(/,/g, '|')
            .replace(/\s/g, '.');
        } else {
          pattern = ($(this).val() + '')
            .split(/\s/g).join('|');
        }
        params[i] = `(${pattern})`;
      }
    });
    $.each(params, (i, val) => {
      _table.column(i).search(val ? val : '', true, true, true);
    });
    _table.table().draw();
  }

  // todo: remove redundancy with service search
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
  }

  function _onClickTableRowDeleteButton(event) {
    event.preventDefault();
    let selectRow = _table.rows({ selected: true }).data();
    let count = selectRow.length;
    if (count < 1) return;
    let selectRowIds = [];
    for (let i = 0; i < count; i++) {
      selectRowIds.push(selectRow[i]['관리번호']);
    }
    $.ajax({
      ..._tableAjaxDefault,
      url: `${window.location.origin}/data/storage/list/delete`,
      data: { 'id[]': selectRowIds },
      success: () => {
        $.notify({
          message: '선택한 자료가 삭제되었습니다',
        }, { type: 'success' });
        _table.ajax.reload();
      },
    });
  }

  const _initForm = function () {

  };

  const _initUppy = function () {
    _uppy = new Uppy(_uppyCoreOptions)
      .use(Dashboard, _uppyDashboardOptions)
      .use(Form, _uppyFormOptions)
      .use(ImageEditor, {
        ..._uppyImageEditorOptions,
        target: Dashboard,
      })
      .use(XHRUpload, _uppyXHRUploadOptions);
  };

  function _onFileAdded(file) {
    _uppy.setFileMeta(file.id, {
      size: file['size'],
      lastModified: moment(file['data']['lastModified']).format(),
    });
  }

  function _onComplete(result) {
    _table.ajax.reload();
    // console.table(result.successful);
    // console.table(result.failed);
  }

  function _onUploadSuccess(file, response) {
    // console.log(response.status);
    console.log(response.body);
    // do something with file and response
  }

  function _onUploadError(file, error, response) {
    // todo: send the debug information to a server, choose to log errors only, etc
    console.log('error with file:', file.id);
    console.log('error message:', error);
  }

  function _onClickDone() {
    _uppy.reset();
    // _form.resetForm();
  }

  function _onFormReset() {
    // todo: reset the datetimepicker to current datetime
  }

  return {
    // public functions
    init: function () {
      _tableEl = $('#kt_datatable_storage');
      _tableControl = $('#kt_datatable_storage_control');
      _tableSearchButton = _tableControl.find('#kt_datatable_storage_search');
      _tableSearchResetButton = _tableControl.find('#kt_datatable_storage_clear');
      _tableRowDeleteButton = _tableControl.find('#kt_datatable_storage_delete');

      _init();
      _initTable();
      _initForm();
      _initUppy();

      _table.on('init.dt', _onTableInitComplete);
      // _table.on('select', _onSelectTable);
      _tableSearchButton.on('mousedown', _onClickTableSearch);
      _tableSearchResetButton.on('mousedown', _onClickTableSearchReset);
      _tableRowDeleteButton.on('mousedown', _onClickTableRowDeleteButton);

      // https://uppy.io/docs/uppy/#Events
      _uppy.on('file-added', _onFileAdded);
      _uppy.on('complete', _onComplete);
      _uppy.on('upload-success', _onUploadSuccess);
      _uppy.on('upload-error', _onUploadError);

      // _form.on('reset', _onFormReset);
    },
  };
}();

jQuery(document).ready(function () {
  DataStorage.init();
});
