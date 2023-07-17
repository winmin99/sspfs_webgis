CREATE TABLE wtl_pres_ps
(
  id      serial   NOT NULL,
  geom    geometry(MultiPoint, 5187),
  ftr_cde char(5)       DEFAULT NULL::bpchar,
  ftr_idn integer  NOT NULL
    CONSTRAINT wtl_pres_ps_uni
      UNIQUE,
  hjd_cde char(10) NOT NULL,
  bjd_cde char(10) NOT NULL,
  sht_num char(10) NOT NULL,
  mng_cde char(6)  NOT NULL,
  fns_ymd char(10)      DEFAULT NULL::bpchar,
  prs_nam varchar(50)   DEFAULT NULL::character varying,
  prs_ara numeric(8, 2) DEFAULT NULL::numeric,
  sag_cde char(6)  NOT NULL,
  prs_alt numeric(7, 2) DEFAULT NULL::numeric,
  prs_vol numeric(6, 2) DEFAULT NULL::numeric,
  prs_iol numeric(6, 2) DEFAULT NULL::numeric,
  prs_are varchar(50)   DEFAULT NULL::character varying,
  prs_sah integer,
  cnt_num char(10)      DEFAULT NULL::bpchar,
  sys_chk char     NOT NULL,
  wsg_cde char(6)  NOT NULL,
  wsb_cde char(6)  NOT NULL,
  wbb_cde char(6)  NOT NULL,
  eddate  varchar(10)   DEFAULT NULL::character varying,
  prd_nam varchar(20)   DEFAULT NULL::character varying,
  ceo_tel varchar(20)   DEFAULT NULL::character varying,
  pm_tel  varchar(20)   DEFAULT NULL::character varying,
  CONSTRAINT wtl_pres_ps_pkey
    PRIMARY KEY (id, ftr_idn)
);

ALTER TABLE wtl_pres_ps
  OWNER TO postgres;

CREATE INDEX wtl_pres_ps_bjd_cde_idx
  ON wtl_pres_ps (bjd_cde);

CREATE INDEX wtl_pres_ps_ftr_cde_idx
  ON wtl_pres_ps (ftr_cde);

CREATE INDEX wtl_pres_ps_hjd_cde_idx
  ON wtl_pres_ps (hjd_cde);

CREATE INDEX wtl_pres_ps_mng_cde_idx
  ON wtl_pres_ps (mng_cde);

CREATE INDEX wtl_pres_ps_sag_cde_idx
  ON wtl_pres_ps (sag_cde);

CREATE INDEX wtl_pres_ps_wbb_cde_idx
  ON wtl_pres_ps (wbb_cde);

CREATE INDEX wtl_pres_ps_wsb_cde_idx
  ON wtl_pres_ps (wsb_cde);

CREATE INDEX wtl_pres_ps_wsg_cde_idx
  ON wtl_pres_ps (wsg_cde);

CREATE OR REPLACE VIEW viw_wtl_pres_ps
      (id, geom, 레이어, 관리번호, 급수구역, 가압장명, 부지면적, 관리방법, 가압장표고, 설정압력, 유입압력, 가압구역, 가압수혜가구, 읍면동, 법정동, 급수분구, 급수블럭, 준공일자, 공사번호,
       관리기관, 도엽번호, 관리업체, 연락처1, 연락처2)
AS
SELECT pres_tb.id,
       pres_tb.geom,
       '가압장'::text     AS "레이어",
       pres_tb.ftr_idn AS "관리번호",
       wsg_tb.wsg_nam  AS "급수구역",
       pres_tb.prs_nam AS "가압장명",
       pres_tb.prs_ara AS "부지면적",
       sag_tb.cname    AS "관리방법",
       pres_tb.prs_alt AS "가압장표고",
       pres_tb.prs_vol AS "설정압력",
       pres_tb.prs_iol AS "유입압력",
       pres_tb.prs_are AS "가압구역",
       pres_tb.prs_sah AS "가압수혜가구",
       bjd_tb.hjd_nam  AS "읍면동",
       bjd_tb.bjd_nam  AS "법정동",
       wsb_tb.wsb_nam  AS "급수분구",
       wbb_tb.wbb_nam  AS "급수블럭",
       pres_tb.fns_ymd AS "준공일자",
       pres_tb.cnt_num AS "공사번호",
       mng_tb.cname    AS "관리기관",
       pres_tb.sht_num AS "도엽번호",
       pres_tb.prd_nam AS "관리업체",
       pres_tb.ceo_tel AS "연락처1",
       pres_tb.pm_tel  AS "연락처2"
FROM wtl_pres_ps pres_tb
       LEFT JOIN wtl_wtsa_as wsg_tb ON pres_tb.wsg_cde = wsg_tb.wsg_cde
       LEFT JOIN wtl_wtssa_as wsb_tb ON pres_tb.wsb_cde = wsb_tb.wsb_cde
       LEFT JOIN wtl_wtsba_as wbb_tb ON pres_tb.wbb_cde = wbb_tb.wbb_cde
       LEFT JOIN bml_badm_as bjd_tb ON pres_tb.bjd_cde = bjd_tb.bjd_cde
       LEFT JOIN private.cd_mng mng_tb ON pres_tb.mng_cde = mng_tb.codeno
       LEFT JOIN private.cd_sag sag_tb ON pres_tb.sag_cde = sag_tb.codeno;
