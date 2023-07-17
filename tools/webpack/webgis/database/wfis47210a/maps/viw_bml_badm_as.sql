CREATE VIEW viw_bml_badm_as(id, geom, 행정동, 법정동) AS
SELECT bml_badm_as.id,
       bml_badm_as.geom,
       bml_badm_as.hjd_nam,
       bml_badm_as.bjd_nam
FROM bml_badm_as;

ALTER TABLE viw_bml_badm_as
    OWNER TO postgres;
