CREATE TABLE private.cd_apy
(
    codeno   CHAR(6)     NOT NULL
        CONSTRAINT cd_apy_pkey
            PRIMARY KEY,
    cname    VARCHAR(50) NOT NULL,
    cname_sl CHAR(10) DEFAULT NULL::BPCHAR,
    sack     CHAR     DEFAULT NULL::BPCHAR,
    sbck     CHAR     DEFAULT NULL::BPCHAR
);

ALTER TABLE private.cd_apy
    OWNER TO postgres;

INSERT INTO private.cd_apy (codeno, cname, cname_sl, sack, sbck) VALUES ('APY000', '미분류', null, '1', '0');
INSERT INTO private.cd_apy (codeno, cname, cname_sl, sack, sbck) VALUES ('APY001', '계량기 동파', null, '1', '0');
INSERT INTO private.cd_apy (codeno, cname, cname_sl, sack, sbck) VALUES ('APY002', '단수', null, '1', '0');
INSERT INTO private.cd_apy (codeno, cname, cname_sl, sack, sbck) VALUES ('APY003', '도로 누수', null, '1', '0');
INSERT INTO private.cd_apy (codeno, cname, cname_sl, sack, sbck) VALUES ('APY004', '보호통 누수 및 교체', null, '1', '0');
INSERT INTO private.cd_apy (codeno, cname, cname_sl, sack, sbck) VALUES ('APY005', '수질', null, '1', '0');
INSERT INTO private.cd_apy (codeno, cname, cname_sl, sack, sbck) VALUES ('APY006', '신규 급수 신청', null, '1', '0');
INSERT INTO private.cd_apy (codeno, cname, cname_sl, sack, sbck) VALUES ('APY007', '앵글밸브 고장', null, '1', '0');
INSERT INTO private.cd_apy (codeno, cname, cname_sl, sack, sbck) VALUES ('APY008', '저수압', null, '1', '0');
INSERT INTO private.cd_apy (codeno, cname, cname_sl, sack, sbck) VALUES ('APY999', '기타', null, '1', '0');
