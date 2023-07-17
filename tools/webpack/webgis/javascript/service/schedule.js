const ServiceSchedule = function () {

  let _table;
  let _tableMemo;
  // let _time;
  let _modalTitle;
  let _tableButtonOpts;

  const _init = function () {
    _tableButtonOpts = {
      pageSize: 'A4',
      orientation: 'landscape',
      filename: moment().format('YYYYMMDD') + '_상수도 급수공사 대행업체 비상근무 편성',
      messageTop: moment().format('LL'),
      title: '상수도 급수공사 대행업체 비상근무 편성',
      exportOptions: {
        columns: ':visible',
      },
    };
  };

  const _initTable = function () {
    if (_table) return;

    _table = $('#kt_datatable_schedule').DataTable({
      responsive: true,

      language: {
        'url': '//cdn.datatables.net/plug-ins/1.10.21/i18n/Korean.json',
      },

      ajax: {
        url: `${window.location.origin}/service/schedule`,
        headers: {
          'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
        },
        data: {
          // parameters for custom backend script demo
          columnsDef: [
            '기간', '업체명', '비상근무기간', '대표자', '연락처(대표)', '현장소장', '연락처(현장)', '비고',
          ],
        },
      },
      deferRender: true,
      columns: [
        { data: '기간' },
        { data: '업체명' },
        { data: '비상근무기간' },
        { data: '대표자' },
        { data: '대표자_연락처' },
        { data: '현장소장' },
        { data: '현장소장_연락처' },
        { data: '비고' },
      ],
      columnDefs: [
        {
          // hide columns by index number
          targets: [0],
          visible: false,
        },
      ],
      initComplete: function () {
        // _time = _table.column(0).data()[0].slice();
      },

      processing: true,
      serverSide: false,
      autoWidth: true,
      searching: false,
      paging: false,
      info: false,
      order: [[2, 'asc']],
      buttons: [
        $.extend(true, {}, _tableButtonOpts, {
          extend: 'print',
        }),
        $.extend(true, {}, _tableButtonOpts, {
          extend: 'excelHtml5',
        }),
      ],
    });

    $('#export_print_schedule').on('click', function (e) {
      e.preventDefault();
      _table.button(0).trigger();
    });

    $('#export_excel_schedule').on('click', function (e) {
      e.preventDefault();
      _table.button(1).trigger();
    });
  };

  const _initTableMemo = function () {
    setTimeout(function () {
      $.ajax({
        url: `${window.location.origin}/service/schedule/memo`,
        headers: {
          'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
        },
        dataType: 'json',
        success: function (res) {
          _modalTitle.html(`상수도 급수공사 대행업체 비상근무 편성 (${res[0]['SCH_MONT']})`);
          _tableMemo.html(res[0]['SCH_MEMO']);
        },
        error: function () {
        },
      });
    }, 250);
  };

  return {

    //main function to initiate the module
    init: function () {
      const _modal = $('#serv_sche_modal');
      _modalTitle = _modal.find('.modal-title');
      _tableMemo = _modal.find('#kt_datatable_schedule_ext');

      _modal.on('shown.bs.modal', () => {
        _init();
        _initTable();
        _initTableMemo();
      });
    },

  };

}();

jQuery(document).ready(function () {
  ServiceSchedule.init();
});
