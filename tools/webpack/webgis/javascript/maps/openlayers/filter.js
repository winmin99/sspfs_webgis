const layerSelectFilter = new Set([
  'city_planning_road',
  'geo_line_as',
  'n3a_a0010000',
  'n3a_b0010000',
  'n3p_f0020000',
  'swl_hmpipe_ls',
  'viw_bml_badm_as',
  'viw_bml_hadm_as',
  'viw_swl_pipe_as',
  'viw_wtl_cap_ps',
  'viw_wtl_pipe_dir_ps',
  'viw_wtl_prme_ps',
  'viw_wtl_taper_ps',
  'viw_wtl_userlabel_as',
  'viw_wtl_userlabel_ps',
  'viw_wtl_wspipe_ls',
]);

const featureNameFilter = new Set([
  'id',
  'geom',
  'geometry',
  '시설물구분',
  '레이어',
  'layer',
  '방향각',
  '회전방향',
  'EDDATE',
]);

const featureDateFilter = new Set([
  '설치일자',
  '유지보수일자',
  '준공일자',
  '폐관일자',
  '폐전일자',
  '허가일자',
]);

const styleRotationFilter = new Set([
  'viw_wtl_cap_ps',
  'viw_wtl_prme_ps',
  'viw_wtl_taper_ps',
  'viw_wtl_pipe_dir_ps',
  '가정내오수관',
  '가정오수받이',
  '갑압변',
  '배기변',
  '상수맨홀',
  '스케일부스터',
  '역사이펀',
  '오수맨홀',
  '오수받이',
  '우수맨홀',
  '우수받이',
  '이토변',
  '제수변',
  '지수전',
  '집수맨홀',
  '차집맨홀',
  '토구',
  '펌프시설',
  '하수펌프장',
  '합류맨홀',
]);

const styleDirectionFilter = new Set([
  '오수관',
  '우수관',
  '차집관',
  '합류관',
]);

const unitFilter = new Map([
  ['구경', 'mm'],
  ['길이', 'm'],
  ['깊이', 'm'],
  ['심도', 'm'],
  ['연장', 'm'],
  ['펌프용량', 'kW'],
]);

const fileNameFilter = new Map([
  ['buld_mah', '건물'],
  ['lake', '호수'],
  ['road', '도로경계면'],
  ['viw_wtl_cap_ps', '상수관말'],
  ['viw_wtl_fire_ps', '소방시설'],
  ['viw_wtl_flow_ps', '유량계'],
  ['viw_wtl_manh_ps', '상수맨홀'],
  ['viw_wtl_meta_ps', '급수전'],
  ['viw_wtl_pipe_close_lm', '폐관'],
  ['viw_wtl_pipe_dir_ps', '물방향'],
  ['viw_wtl_pipe_lm', '상수관로'],
  ['viw_wtl_pipe_lm_filter', '상수관로_필터'],
  ['viw_wtl_pres_psMPoint', '가압장'],
  ['viw_wtl_prme_ps', '수압측정'],
  ['viw_wtl_puri_as', '정수장'],
  ['viw_wtl_serv_ps', '배수지'],
  ['viw_wtl_scvst_ps', '스케일부스터'],
  ['viw_wtl_sply_ls', '급수관'],
  ['viw_wtl_taper_ps', '편락관'],
  ['viw_wtl_userlabel_ps', '사용자주기'],
  ['viw_wtl_valv_block_ps', '경계변'],
  ['viw_wtl_valv_pres_ps', '감압변'],
  ['viw_wtl_valv_ps', '변류시설'],
  ['viw_wtt_wutl_ht', '보수공사'],
]);

export {
  layerSelectFilter,
  featureNameFilter,
  featureDateFilter,
  fileNameFilter,
  styleRotationFilter,
  styleDirectionFilter,
  unitFilter,
};
