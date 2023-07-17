CREATE VIEW viw_bml_hadm_as(id, geom, 행정동) AS
SELECT bml_hadm_as.id,
       bml_hadm_as.geom,
       bml_hadm_as.hjd_nam
FROM bml_hadm_as;

ALTER TABLE viw_bml_hadm_as
    OWNER TO postgres;
