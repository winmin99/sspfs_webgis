CREATE VIEW viw_search_tb(role_name, cname, ftr_idn, fac_nam, hjd_nam, bjd_nam, coordinate) AS
SELECT '상수'::TEXT                 AS role_name,
       cd_ftr.cname,
       pres_tb.ftr_idn,
       pres_tb.prs_nam            AS fac_nam,
       bml_badm_as.hjd_nam,
       bml_badm_as.bjd_nam,
       st_asgeojson(pres_tb.geom) AS coordinate
FROM wtl_pres_ps pres_tb
         LEFT JOIN bml_badm_as ON pres_tb.bjd_cde = bml_badm_as.bjd_cde
         LEFT JOIN private.cd_ftr ON pres_tb.ftr_cde = cd_ftr.codeno
UNION ALL
SELECT '상수'::TEXT                 AS role_name,
       cd_ftr.cname,
       puri_tb.ftr_idn,
       puri_tb.pur_nam            AS fac_nam,
       bml_badm_as.hjd_nam,
       bml_badm_as.bjd_nam,
       st_asgeojson(puri_tb.geom) AS coordinate
FROM wtl_puri_as puri_tb
         LEFT JOIN bml_badm_as ON puri_tb.bjd_cde = bml_badm_as.bjd_cde
         LEFT JOIN private.cd_ftr ON puri_tb.ftr_cde = cd_ftr.codeno
UNION ALL
SELECT '상수'::TEXT                 AS role_name,
       cd_ftr.cname,
       serv_tb.ftr_idn,
       serv_tb.srv_nam            AS fac_nam,
       bml_badm_as.hjd_nam,
       bml_badm_as.bjd_nam,
       st_asgeojson(serv_tb.geom) AS coordinate
FROM wtl_serv_ps serv_tb
         LEFT JOIN bml_badm_as ON serv_tb.bjd_cde = bml_badm_as.bjd_cde
         LEFT JOIN private.cd_ftr ON serv_tb.ftr_cde = cd_ftr.codeno
UNION ALL
SELECT '상수'::TEXT                 AS role_name,
       btrim(flow_tb.layer::TEXT) AS cname,
       flow_tb.ftr_idn,
       flow_tb.flw_nam            AS fac_nam,
       bml_badm_as.hjd_nam,
       bml_badm_as.bjd_nam,
       st_asgeojson(flow_tb.geom) AS coordinate
FROM wtl_flow_ps flow_tb
         LEFT JOIN bml_badm_as ON flow_tb.bjd_cde = bml_badm_as.bjd_cde
         LEFT JOIN private.cd_ftr ON flow_tb.ftr_cde = cd_ftr.codeno
WHERE flow_tb.flw_nam IS NOT NULL
UNION ALL
SELECT '상수'::TEXT                  AS role_name,
       '사용자주기'::TEXT               AS cname,
       NULL::INTEGER               AS ftr_idn,
       label_tb."주기명"              AS fac_nam,
       NULL::CHARACTER VARYING     AS hjd_nam,
       NULL::CHARACTER VARYING     AS bjd_nam,
       st_asgeojson(label_tb.geom) AS coordinate
FROM wtl_userlabel_ps label_tb;

ALTER TABLE viw_search_tb
    OWNER TO postgres;

