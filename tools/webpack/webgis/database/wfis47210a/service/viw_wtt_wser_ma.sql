CREATE VIEW viw_wtt_wser_ma (id, x, y, 번호, 일자, 접수자, 읍면동, 법정동, 접수, 누수, 관경, 상세, 민원인, 주소, 연락처, 진행, 대행, 삭제, 수정) AS
SELECT wser_tb.id,
       wser_tb.x,
       wser_tb.y,
       wser_tb.rcv_num AS "번호",
       wser_tb.rcv_ymd AS "일자",
       wser_tb.rcv_nam AS "접수자",
       bjd_tb.hjd_nam  AS "읍면동",
       bjd_tb.bjd_nam  AS "법정동",
       apy_tb.cname    AS "접수",
       lpy_tb.cname    AS "누수",
       wser_tb.pip_dip AS "관경",
       wser_tb.apl_exp AS "상세",
       wser_tb.apm_nam AS "민원인",
       wser_tb.apm_adr AS "주소",
       wser_tb.apm_tel AS "연락처",
       pro_tb.cname    AS "진행",
       wser_tb.opr_nam AS "대행",
       wser_tb.del_ymd AS "삭제",
       wser_tb.eddate  AS "수정"
FROM wtt_wser_ma wser_tb
         LEFT JOIN private.cd_apy apy_tb ON wser_tb.apl_cde = apy_tb.codeno
         LEFT JOIN private.cd_lpy lpy_tb ON wser_tb.lep_cde = lpy_tb.codeno
         LEFT JOIN private.cd_pro pro_tb ON wser_tb.pro_cde = pro_tb.codeno
         LEFT JOIN bml_badm_as bjd_tb ON wser_tb.apl_cde = bjd_tb.bjd_cde;

ALTER TABLE viw_wtt_wser_ma
    OWNER TO postgres;
