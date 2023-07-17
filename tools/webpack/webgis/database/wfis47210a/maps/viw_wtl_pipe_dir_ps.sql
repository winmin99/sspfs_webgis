CREATE TABLE public.wtl_pipe_dir_ps
(
  id   serial                     NOT NULL,
  geom geometry(MULTIPOINT, 5187) NULL,
  방향각  int8                       NULL,
  CONSTRAINT wtl_pipe_dir_ps_pkey PRIMARY KEY (id)
);

CREATE OR REPLACE VIEW public.viw_wtl_pipe_dir_ps
AS
SELECT *
FROM public.wtl_pipe_dir_ps;
