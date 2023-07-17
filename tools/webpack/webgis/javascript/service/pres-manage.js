const ServicePresManage = function () {

  let _table;
  let _tableButtonOpts;

  const _init = function () {
    _tableButtonOpts = {
      pageSize: 'A4',
      orientation: 'landscape',
      filename: moment().format('YYYYMMDD') + '_가압장 관리업체 현황',
      messageTop: moment().format('llll'),
      title: '가압장 관리업체 현황',
    };
  };

  const _initTable = function () {
    if (_table) return;

    _table = $('#kt_datatable_pres').DataTable({
      responsive: true,

      language: {
        'url': '//cdn.datatables.net/plug-ins/1.10.21/i18n/Korean.json',
      },

      ajax: {
        url: `${window.location.origin}/service/presmanage`,
        headers: {
          'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
        },
        data: {
          // parameters for custom backend script demo
          columnsDef: [
            '가압장명', '관리업체', '연락처(대표)', '연락처(현장소장)',
          ],
        },
      },
      deferRender: true,
      columns: [
        { data: '가압장명' },
        { data: '관리업체' },
        { data: '연락처(대표)' },
        { data: '연락처(현장소장)' },
      ],

      processing: true,
      serverSide: false,
      autoWidth: true,
      paging: true,
      pageLength: 15,
      pagingType: 'full_numbers',
      info: false,
      order: [[0, 'asc']],
      buttons: [
        $.extend(true, {}, _tableButtonOpts, {
          extend: 'excelHtml5',
        }),
      ],
      fixedHeader: {
        header: true,
        footer: true,
      },
      lengthChange: false,
    });

    $('#export_excel_pres').on('click', function (e) {
      e.preventDefault();
      _table.button(0).trigger();
    });
  };

  return {

    //main function to initiate the module
    init: function () {
      const _modal = $('#serv_pres_modal');

      _modal.on('shown.bs.modal', () => {
        _init();
        _initTable();
      });
    },

  };

}();

jQuery(document).ready(function () {
  ServicePresManage.init();
});
