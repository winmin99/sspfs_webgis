CREATE FUNCTION dj_yearly_counter() RETURNS integer
  LANGUAGE plpgsql
AS
$$
DECLARE
  last_year    CHAR(4);
  current_year INT;
  last_rcv_num INT;
  new_rcv_num     INT;
BEGIN
  last_rcv_num = rcv_num FROM wtt_wser_ma ORDER BY id DESC LIMIT 1;
  last_year = LEFT(CAST(last_rcv_num AS CHAR(4)), 4);
  current_year = EXTRACT(YEAR FROM CURRENT_DATE);

  IF current_year = 2021 OR last_year = CAST(current_year AS CHAR(4))
  THEN
    new_rcv_num = last_rcv_num + 1;
  ELSE
    new_rcv_num = CONCAT(current_year, '000001');
  END IF;

  RETURN CAST(new_rcv_num AS INT);
END;
$$;

ALTER FUNCTION dj_yearly_counter() OWNER TO postgres;
