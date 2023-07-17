CREATE TABLE wtt_wser_ma
(
    id      SERIAL                NOT NULL
        CONSTRAINT wtt_wser_ma_pkey
            PRIMARY KEY,
    geom    GEOMETRY(Point, 5187) NOT NULL,
    x       DOUBLE PRECISION      NOT NULL,
    y       DOUBLE PRECISION      NOT NULL,
    rcv_num INTEGER               NOT NULL,
    rcv_ymd TIMESTAMP             NOT NULL,
    rcv_nam VARCHAR               NOT NULL,
    apl_hjd CHAR(10)              NOT NULL,
    apl_adr VARCHAR,
    apl_exp VARCHAR,
    apl_cde CHAR(6)               NOT NULL,
    pip_dip VARCHAR,
    lep_cde CHAR(6) DEFAULT NULL::BPCHAR,
    apm_nam VARCHAR               NOT NULL,
    apm_adr VARCHAR               NOT NULL,
    apm_tel VARCHAR               NOT NULL,
    pro_cde CHAR(6)               NOT NULL,
    pro_exp VARCHAR,
    pro_ymd TIMESTAMP,
    pro_nam VARCHAR               NOT NULL,
    opr_nam VARCHAR,
    del_ymd TIMESTAMP,
    eddate  TIMESTAMP
);

ALTER TABLE wtt_wser_ma
    OWNER TO postgres;
