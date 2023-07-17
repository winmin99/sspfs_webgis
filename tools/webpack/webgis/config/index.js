require('../javascript/plugins/bootstrap-notify');
require('../javascript/plugins/datatables-net');
require('../javascript/plugins/bootstrap-select');

window.KTLayoutSearch = window.KTLayoutSearchInline = function () {
};

export default {
  host: ((window.location.origin).toString()),
  geoserverHost: ((window.location.origin).toString()).replace(/3000/gi, '8000'),
};
