CREATE TABLE wtl_meta_ps
(
    id      SERIAL   NOT NULL,
    geom    GEOMETRY(MultiPoint, 5187),
    ftr_cde CHAR(5)     DEFAULT NULL::BPCHAR,
    ftr_idn INTEGER  NOT NULL
        CONSTRAINT wtl_meta_ps_uni
            UNIQUE,
    hjd_cde CHAR(10) NOT NULL,
    bjd_cde CHAR(10) NOT NULL,
    sht_num CHAR(10) NOT NULL,
    ist_ymd CHAR(10)    DEFAULT NULL::BPCHAR,
    hom_num VARCHAR(30) DEFAULT NULL::CHARACTER VARYING,
    hom_nam VARCHAR(26) DEFAULT NULL::CHARACTER VARYING,
    hom_hjd CHAR(10) NOT NULL,
    hom_adr VARCHAR(57) DEFAULT NULL::CHARACTER VARYING,
    hom_cnt INTEGER,
    sbi_cde CHAR(6)  NOT NULL,
    met_num VARCHAR(14) DEFAULT NULL::CHARACTER VARYING,
    met_dip INTEGER,
    met_mof CHAR(6)  NOT NULL,
    prd_num VARCHAR(20) DEFAULT NULL::CHARACTER VARYING,
    pip_cde CHAR(5)     DEFAULT NULL::BPCHAR,
    pip_idn INTEGER,
    cnt_num CHAR(10)    DEFAULT NULL::BPCHAR,
    sys_chk CHAR     NOT NULL,
    wsg_cde CHAR(6)  NOT NULL,
    wsb_cde CHAR(6)  NOT NULL,
    wbb_cde CHAR(6)  NOT NULL,
    flw_dae VARCHAR(10) DEFAULT NULL::CHARACTER VARYING,
    ude_cut INTEGER,
    ude_wal INTEGER,
    dae_cut INTEGER,
    dae_wal INTEGER,
    eddate  VARCHAR(10) DEFAULT NULL::CHARACTER VARYING,
    soo_num VARCHAR(50) DEFAULT NULL::CHARACTER VARYING,
    CONSTRAINT wtl_meta_ps_pkey
        PRIMARY KEY (id, ftr_idn)
);

ALTER TABLE wtl_meta_ps
    OWNER TO postgres;

CREATE INDEX wtl_meta_ps_bjd_cde_idx
    ON wtl_meta_ps (bjd_cde);

CREATE INDEX wtl_meta_ps_ftr_cde_idx
    ON wtl_meta_ps (ftr_cde);

CREATE INDEX wtl_meta_ps_hjd_cde_idx
    ON wtl_meta_ps (hjd_cde);

CREATE INDEX wtl_meta_ps_hom_hjd_idx
    ON wtl_meta_ps (hom_hjd);

CREATE INDEX wtl_meta_ps_met_mof_idx
    ON wtl_meta_ps (met_mof);

CREATE INDEX wtl_meta_ps_pip_cde_idx
    ON wtl_meta_ps (pip_cde);

CREATE INDEX wtl_meta_ps_sbi_cde_idx
    ON wtl_meta_ps (sbi_cde);

CREATE INDEX wtl_meta_ps_wbb_cde_idx
    ON wtl_meta_ps (wbb_cde);

CREATE INDEX wtl_meta_ps_wsb_cde_idx
    ON wtl_meta_ps (wsb_cde);

CREATE INDEX wtl_meta_ps_wsg_cde_idx
    ON wtl_meta_ps (wsg_cde);

CREATE VIEW viw_wtl_meta_ps
            (id, geom, 레이어, 관리번호, 급수구역, 원관구경, 원관재질, 급수구경, 급수관재질, 연장, 접합종류, 최저깊이, 최고깊이, 수용가번호, 수용가성명, 수용가주소설명, 가구수, 업종,
             계량기기물번호, 계량기구경, 계량기형식, 급수공사시공업체, 읍면동, 법정동, 급수분구, 급수블럭, 설치일자, 공사명, 관리기관, 도엽번호, 관라벨)
AS
SELECT meta_tb.id,
       meta_tb.geom,
       '급수전'::TEXT            AS 레이어,
       sply_tb.ftr_idn        AS 관리번호,
       wsg_tb.wsg_nam         AS 급수구역,
       sply_tb.mpip_dip       AS 원관구경,
       parent_mop_tb.cname_sl AS 원관재질,
       sply_tb.pip_dip        AS 급수구경,
       mop_tb.cname_sl        AS 급수관재질,
       sply_tb.pip_len        AS 연장,
       jht_tb.cname           AS 접합종류,
       sply_tb.low_dep        AS 최저깊이,
       sply_tb.hgh_dep        AS 최고깊이,
       meta_tb.hom_num        AS 수용가번호,
       meta_tb.hom_nam        AS 수용가성명,
       meta_tb.hom_adr        AS 수용가주소설명,
       meta_tb.hom_cnt        AS 가구수,
       sbi_tb.cname           AS 업종,
       meta_tb.met_num        AS 계량기기물번호,
       meta_tb.met_dip        AS 계량기구경,
       mof_tb.cname           AS 계량기형식,
       meta_tb.prd_num        AS 급수공사시공업체,
       bjd_tb.hjd_nam         AS 읍면동,
       bjd_tb.bjd_nam         AS 법정동,
       wsb_tb.wsb_nam         AS 급수분구,
       wbb_tb.wbb_nam         AS 급수블럭,
       sply_tb.ist_ymd        AS 설치일자,
       sply_tb.cnt_num        AS 공사명,
       mng_tb.cname           AS 관리기관,
       sply_tb.sht_num        AS 도엽번호,
       sply_tb.pip_lbl        AS 관라벨
FROM wtl_meta_ps meta_tb
         LEFT JOIN wtl_sply_ls sply_tb ON meta_tb.ftr_idn = sply_tb.ftr_idn
         LEFT JOIN wtl_wtsa_as wsg_tb ON meta_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON meta_tb.wsb_cde = wsb_tb.wsb_cde
         LEFT JOIN wtl_wtsba_as wbb_tb ON meta_tb.wbb_cde = wbb_tb.wbb_cde
         LEFT JOIN bml_badm_as bjd_tb ON meta_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON sply_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_mop parent_mop_tb
                   ON sply_tb.mmop_cde = parent_mop_tb.codeno AND parent_mop_tb.tbl_nam = '관재질'::BPCHAR
         LEFT JOIN private.cd_mop mop_tb ON sply_tb.mop_cde = mop_tb.codeno AND mop_tb.tbl_nam = '관재질'::BPCHAR
         LEFT JOIN private.cd_jht jht_tb ON sply_tb.jht_cde = jht_tb.codeno
         LEFT JOIN private.cd_sbi sbi_tb ON meta_tb.sbi_cde = sbi_tb.codeno
         LEFT JOIN private.cd_mof mof_tb ON meta_tb.met_mof = mof_tb.codeno AND mof_tb.tbl_nam = '계량기형식'::BPCHAR;
