import postgresql from '../middlewares/postgresql';
import mysql from '../middlewares/mysql';
import moment from 'moment';

moment.locale('ko');

export default {
  search(req, res, next) {
    postgresql.executeQuery(
      `SELECT *
       FROM viw_search_tb
       WHERE (fac_nam LIKE $1 OR cname LIKE $1 OR ftr_idn=$2) 
         AND (role_name = $3)
       ORDER BY cname, (CASE WHEN fac_nam IS NULL OR fac_nam = '' THEN 1 ELSE 0 END), fac_nam ASC;`,
      [`%${req.query['query']}%`, req.query['query'], '상수'], // TODO: '상수' Role 처리
    ).then(result => {
      res.status(200).json(result);
    }).catch(next);
  },

  section(req, res, next) {
    const table = req.query['table'];
    const column = req.query['column'];
    const section = req.query['section'];

    if (table && !section) {
      postgresql.executeQuery(
        `SELECT '${table}' AS "table", '${column}' AS "column", ${column} AS "section" FROM ${table} ORDER BY ${column} ASC;`,
        [],
      ).then(result => {
        res.status(200).json(result);
      }).catch(next);
    }

    if (table && section) {
      postgresql.executeQuery(
        `SELECT st_asgeojson(${table}.geom) AS coordinate FROM ${table} WHERE ${column}='${section}';`,
        [],
      ).then(result => {
        res.status(200).json(result);
      }).catch(next);
    }
  },

  info(req, res, next) {
    postgresql.executeQuery(`SELECT * FROM ${req.query['table']} WHERE 관리번호=$1;`,
      [req.query['id']],
    ).then(result => {
      res.status(200).json(result);
    }).catch(next);
  },

  infoCheck(req, res, next) {
    mysql.executeQuery(`SELECT 
       (SELECT EXISTS(SELECT 관리번호)
        FROM ${req.query['table_image']} AS t1
        WHERE t1.관리번호 = ${req.query['id']}
          AND t1.시설물구분 = "${req.query['layer']}"
        LIMIT 1) AS 'photo',
       (SELECT EXISTS(SELECT 관리번호)
        FROM ${req.query['table_history']} AS t2
        WHERE t2.관리번호 = ${req.query['id']}
          AND t2.시설물구분 = "${req.query['layer']}"
        LIMIT 1) AS 'history'`,
    [],
    ).then(result => {
      res.status(200).json(result);
    }).catch(next);
  },

  infoPhoto(req, res, next) {
    mysql.executeQuery(`SELECT * FROM ${req.query['table']} WHERE 시설물구분="${req.query['layer']}" AND 관리번호=${req.query['id']} ORDER BY 사진일련번호 ASC;`,
      [],
    ).then(result => {
      res.status(200).json(result);
    }).catch(next);
  },

  infoHistory(req, res, next) {
    mysql.executeQuery(`SELECT * FROM ${req.query['table']} WHERE 시설물구분="${req.query['layer']}" AND 관리번호=${req.query['id']} ORDER BY 유지보수일련번호 DESC;`,
      [],
    ).then(result => {
      res.status(200).json(result);
    }).catch(next);
  },
};
