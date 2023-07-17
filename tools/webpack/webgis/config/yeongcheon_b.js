const defaultOptions = require('./index').default;

window.KTLayoutSearch = window.KTLayoutSearchInline = require('../javascript/maps/components/search');

const globalOptions = Object.assign(defaultOptions, {
  workspace: 'yeongcheon_b',
  workspaceLocale: '영천',
  role: 'swl',
  center: {
    latitude: 35.9732633,
    longitude: 128.9386044,
  },
  rect: '128.663600,35.816669,129.182801,36.188639',
  table: {
    filter: true,
    vector: [
      'viw_swl_pipe_as',
      'viw_swl_clay_ps',
      'viw_swl_dran_ps',
      'viw_swl_spew_ps',
      'viw_swl_rsph_ps',
      'viw_swl_vent_ps',
      'viw_swl_pipe_lm',
      'viw_swl_pipe_lm_filter',
      'viw_swl_side_ls',
      'viw_swl_conn_ls',
      'viw_swl_pump_ps',
      'viw_swl_spot_ps',
      'viw_swl_manh_ps',
      'viw_wtl_userlabel_ps',
    ],
    image: [
      'n3a_a0010000',
      'n3a_b0010000',
    ],
    maintenance: 'viw_web_wutl_ht_img',
    photo: 'viw_web_bs_img_et',
    repairPhoto: 'viw_swt_subimge_et_re',
    repair: 'viw_swt_repair_work_st',
  },
  kakao: {
    rest: '2f84e559976c9198df8ea702196b6550',
  },
});

window.webgis = globalOptions;
