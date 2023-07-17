const defaultOptions = require('./index').default;

window.KTLayoutSearch = window.KTLayoutSearchInline = require('../javascript/maps/components/search');

const globalOptions = Object.assign(defaultOptions, {
  workspace: 'yeongcheon_a',
  workspaceLocale: '영천',
  role: 'wtl',
  center: {
    latitude: 35.9732633,
    longitude: 128.9386044,
  },
  rect: '128.663600,35.816669,129.182801,36.188639',
  table: {
    filter: false,
    vector: [
      'viw_wtl_puri_as',
      // 'viw_wtl_taper_ps',
      // 'viw_wtl_cap_ps',
      'viw_wtl_pipe_close_lm',
      'viw_wtl_pipe_lm',
      'viw_wtl_pipe_lm_filter',
      // 'viw_wtl_pipe_dir_ps',
      'viw_wtl_sply_ls',
      'viw_wtl_scvst_ps',
      'viw_wtl_manh_ps',
      'viw_wtl_meta_ps',
      'viw_wtl_flow_ps',
      'viw_wtl_fire_ps',
      'viw_wtl_valv_ps',
      'viw_wtl_valv_pres_ps',
      // 'viw_wtl_valv_block_ps',
      'viw_wtl_serv_ps',
      'viw_wtl_pres_ps',
      'viw_wtt_wutl_ht_re',
      'viw_wtl_userlabel_ps',
    ],
    image: [
      'n3a_a0010000',
      'n3a_b0010000',
    ],
    maintenance: 'viw_web_wutl_ht_img',
    photo: 'viw_wtt_st_image',
    repairPhoto: 'viw_wtt_subimge_et_re',
    repair: 'viw_wtt_wutl_ht_re',
  },
  kakao: {
    rest: '2f84e559976c9198df8ea702196b6550',
  },
});

window.webgis = globalOptions;
