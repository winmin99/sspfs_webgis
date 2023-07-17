CREATE TABLE private.cd_lpy
(
    codeno   CHAR(6)     NOT NULL
        CONSTRAINT cd_lpy_pkey
            PRIMARY KEY,
    cname    VARCHAR(50) NOT NULL,
    cname_sl CHAR(10) DEFAULT NULL::BPCHAR,
    sack     CHAR     DEFAULT NULL::BPCHAR,
    sbck     CHAR     DEFAULT NULL::BPCHAR
);

ALTER TABLE private.cd_lpy
    OWNER TO postgres;

INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP000', '미분류', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP101', '직관', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP102', '엘보', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP103', '관체(이형관/정자관)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP104', 'T분기', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP105', '새들분기', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP106', '관체(이형관/신축관)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP107', '관체(이형관/기타)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP201', '클램프', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP202', '접합부(볼트)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP203', '접합부(고무박킹)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP301', '제수변', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP302', '밸브류(배기변)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP303', '밸브류(이토변)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP304', '밸브류(역지변)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP305', '밸브류(감압변)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP306', '밸브류(스리스밸브)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP307', '밸브류(소화전)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP308', '밸브류(지수전)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP401', '통내(관체)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP402', '통내(계량기)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP403', '통내(앵글밸브)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP404', '통내(에어밸브)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP405', '통내(이음부)', null, '1', '0');
INSERT INTO private.cd_lpy (codeno, cname, cname_sl, sack, sbck) VALUES ('LEP999', '기타', null, '1', '0');
