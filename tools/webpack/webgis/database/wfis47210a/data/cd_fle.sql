CREATE TABLE private.cd_fle
(
    codeno   char(6)     NOT NULL
        CONSTRAINT cd_fle_pkey
            PRIMARY KEY,
    cname    varchar  NOT NULL,
    cname_sl varchar  DEFAULT NULL::bpchar,
    sack     char     DEFAULT NULL::bpchar,
    sbck     char     DEFAULT NULL::bpchar
);

INSERT INTO private.cd_fle VALUES ('FLE000', 'image/jpeg', 'jpg', '1', '1');
INSERT INTO private.cd_fle VALUES ('FLE001', 'image/png', 'png', '1', '1');
INSERT INTO private.cd_fle VALUES ('FLE100', 'application/pdf', 'pdf', '1', '1');
INSERT INTO private.cd_fle VALUES ('FLE200', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '1', '1');
INSERT INTO private.cd_fle VALUES ('FLE201', 'application/vnd.ms-excel', 'xls', '1', '1');
INSERT INTO private.cd_fle VALUES ('FLE999', 'application/octet-stream', null, '1', '1');
