CREATE TABLE wtl_pipe_lm
(
    id      SERIAL      NOT NULL,
    geom    GEOMETRY(LineString, 5187),
    ftr_cde CHAR(5)       DEFAULT NULL::BPCHAR,
    ftr_idn INTEGER     NOT NULL
        CONSTRAINT wtl_pipe_lm_uni
            UNIQUE,
    hjd_cde CHAR(10)    NOT NULL,
    bjd_cde CHAR(10)    NOT NULL,
    sht_num CHAR(10)    NOT NULL,
    mng_cde CHAR(6)     NOT NULL,
    ist_ymd CHAR(10)      DEFAULT NULL::BPCHAR,
    saa_cde CHAR(6)     NOT NULL,
    mop_cde CHAR(6)     NOT NULL,
    pip_dip INTEGER,
    pip_len NUMERIC(7, 2) DEFAULT NULL::NUMERIC,
    jht_cde CHAR(6)     NOT NULL,
    low_dep NUMERIC(3, 1) DEFAULT NULL::NUMERIC,
    hgh_dep NUMERIC(3, 1) DEFAULT NULL::NUMERIC,
    cnt_num CHAR(10)      DEFAULT NULL::BPCHAR,
    exp_cde CHAR(6)     NOT NULL,
    sys_chk CHAR        NOT NULL,
    pip_lbl VARCHAR(50)   DEFAULT NULL::CHARACTER VARYING,
    wsg_cde CHAR(6)     NOT NULL,
    wsb_cde CHAR(6)     NOT NULL,
    wbb_cde CHAR(6)     NOT NULL,
    layer   VARCHAR(20) NOT NULL,
    old_ymd CHAR(10)      DEFAULT NULL::BPCHAR,
    pip_stt VARCHAR(4)    DEFAULT NULL::BPCHAR,
    eddate  VARCHAR(10)   DEFAULT NULL::CHARACTER VARYING,
    CONSTRAINT wtl_pipe_lm_pkey
        PRIMARY KEY (id, ftr_idn)
);

ALTER TABLE wtl_pipe_lm
    OWNER TO postgres;

CREATE INDEX wtl_pipe_lm_bjd_cde_idx
    ON wtl_pipe_lm (bjd_cde);

CREATE INDEX wtl_pipe_lm_exp_cde_idx
    ON wtl_pipe_lm (exp_cde);

CREATE INDEX wtl_pipe_lm_ftr_cde_idx
    ON wtl_pipe_lm (ftr_cde);

CREATE INDEX wtl_pipe_lm_hjd_cde_idx
    ON wtl_pipe_lm (hjd_cde);

CREATE INDEX wtl_pipe_lm_jht_cde_idx
    ON wtl_pipe_lm (jht_cde);

CREATE INDEX wtl_pipe_lm_mng_cde_idx
    ON wtl_pipe_lm (mng_cde);

CREATE INDEX wtl_pipe_lm_mop_cde_idx
    ON wtl_pipe_lm (mop_cde);

CREATE INDEX wtl_pipe_lm_saa_cde_idx
    ON wtl_pipe_lm (saa_cde);

CREATE INDEX wtl_pipe_lm_wbb_cde_idx
    ON wtl_pipe_lm (wbb_cde);

CREATE INDEX wtl_pipe_lm_wsb_cde_idx
    ON wtl_pipe_lm (wsb_cde);

CREATE INDEX wtl_pipe_lm_wsg_cde_idx
    ON wtl_pipe_lm (wsg_cde);

CREATE VIEW viw_wtl_pipe_lm
            (id, geom, 시설물구분, 레이어, 관리번호, 급수구역, 구경, 연장, 관재질, 접합종류, 최저깊이, 최고깊이, 읍면동, 법정동, 급수분구, 급수블럭, 설치일자, 공사명, 관리기관,
             도엽번호, 관라벨, 폐관일자, 사용여부)
AS
SELECT pipe_tb.id,
       pipe_tb.geom,
       ftr_tb.cname               AS 시설물구분,
       btrim(pipe_tb.layer::TEXT) AS 레이어,
       pipe_tb.ftr_idn            AS 관리번호,
       wsg_tb.wsg_nam             AS 급수구역,
       pipe_tb.pip_dip            AS 구경,
       pipe_tb.pip_len            AS 연장,
       mop_tb.cname_sl            AS 관재질,
       jht_tb.cname               AS 접합종류,
       pipe_tb.low_dep            AS 최저깊이,
       pipe_tb.hgh_dep            AS 최고깊이,
       bjd_tb.hjd_nam             AS 읍면동,
       bjd_tb.bjd_nam             AS 법정동,
       wsb_tb.wsb_nam             AS 급수분구,
       wbb_tb.wbb_nam             AS 급수블럭,
       pipe_tb.ist_ymd            AS 설치일자,
       pipe_tb.cnt_num            AS 공사명,
       mng_tb.cname               AS 관리기관,
       pipe_tb.sht_num            AS 도엽번호,
       pipe_tb.pip_lbl            AS 관라벨,
       pipe_tb.old_ymd            AS 폐관일자,
       pipe_tb.pip_stt            AS 사용여부
FROM wtl_pipe_lm pipe_tb
         LEFT JOIN wtl_wtsa_as wsg_tb ON pipe_tb.wsg_cde = wsg_tb.wsg_cde
         LEFT JOIN wtl_wtssa_as wsb_tb ON pipe_tb.wsb_cde = wsb_tb.wsb_cde
         LEFT JOIN wtl_wtsba_as wbb_tb ON pipe_tb.wbb_cde = wbb_tb.wbb_cde
         LEFT JOIN bml_badm_as bjd_tb ON pipe_tb.bjd_cde = bjd_tb.bjd_cde
         LEFT JOIN private.cd_mng mng_tb ON pipe_tb.mng_cde = mng_tb.codeno
         LEFT JOIN private.cd_mop mop_tb ON pipe_tb.mop_cde = mop_tb.codeno AND mop_tb.tbl_nam = '관재질'::BPCHAR
         LEFT JOIN private.cd_jht jht_tb ON pipe_tb.jht_cde = jht_tb.codeno
         LEFT JOIN private.cd_ftr ftr_tb ON pipe_tb.ftr_cde = ftr_tb.codeno;

ALTER TABLE viw_wtl_pipe_lm
    OWNER TO postgres;
