CREATE VIEW viw_wtt_file_et(관리번호, 파일명, 유형, 크기, 수정일자, 등록일자, 파일상세, 등록자, 등록유형) AS
SELECT file_tb.fle_idn AS "관리번호",
       file_tb.fle_nam AS "파일명",
       fle_tb.cname_sl AS "유형",
       file_tb.fle_siz AS "크기",
       file_tb.fle_ymd AS "수정일자",
       file_tb.eddate  AS "등록일자",
       file_tb.fle_exp AS "파일상세",
       file_tb.reg_nam AS "등록자",
       file_tb.reg_cde AS "등록유형"
FROM wtt_file_et file_tb
       LEFT JOIN private.cd_fle fle_tb ON file_tb.fle_cde = fle_tb.codeno;

ALTER TABLE viw_wtt_file_et
  OWNER TO postgres;

