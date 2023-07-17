CREATE VIEW viw_wtt_sch_address (id, 업체명, 기간, 비상근무기간_시작, 비상근무기간_종료, 대표자, 대표자_연락처, 현장소장, 현장소장_연락처, 비고) AS
SELECT sch_tb.ID        AS id,
       sch_tb.PRD_NAM   AS 업체명,
       memo_tb.SCH_MONT AS 기간,
       sch_tb.WORK_DAY1 AS 비상근무기간_시작,
       sch_tb.WORK_DAY2 AS 비상근무기간_종료,
       sch_tb.CEO_NAM   AS 대표자,
       sch_tb.CEO_TEL   AS 대표자_연락처,
       sch_tb.PM_NAM    AS 현장소장,
       sch_tb.PM_TEL    AS 현장소장_연락처,
       sch_tb.NOTE      AS 비고
FROM wtt_sch_address AS sch_tb,
     wtt_sch_memo AS memo_tb
