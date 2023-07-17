-- auto-generated definition
CREATE TABLE wtt_file_et
(
  fle_idn serial
    CONSTRAINT wtt_file_et_pk
      PRIMARY KEY,
  fle_cde char(6) NOT NULL,
  fle_nam varchar NOT NULL,
  fle_exp varchar,
  fle_siz integer NOT NULL,
  fle_pat varchar NOT NULL,
  fle_ymd timestamp,
  reg_nam varchar,
  reg_cde char(6),
  eddate  timestamp
);

ALTER TABLE wtt_file_et
  OWNER TO postgres;

