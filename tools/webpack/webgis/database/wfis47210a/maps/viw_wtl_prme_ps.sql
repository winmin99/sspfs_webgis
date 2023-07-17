CREATE TABLE public.wtl_prme_ps
(
  id     serial                     NOT NULL,
  geom   geometry(MULTIPOINT, 5187) NULL,
  주기명    VARCHAR                    NULL,
  방향각    int8                       NULL,
  eddate varchar(10) DEFAULT NULL::character varying,
  CONSTRAINT wtl_prme_ps_pkey PRIMARY KEY (id)
);

CREATE OR REPLACE VIEW public.viw_wtl_prme_ps
AS
SELECT *
FROM public.wtl_prme_ps;
