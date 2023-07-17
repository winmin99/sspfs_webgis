import postgresql from '../middlewares/postgresql';
import moment from 'moment';
import path from 'path';
import formidable from 'formidable';
import { rm } from 'fs';

moment.locale('ko');

const defaultFormidableOptions = {
  allowEmptyFiles: false,
  keepExtensions: false,
  multiples: true,
  uploadDir: path.join(__dirname, 'upload'),
};

export default {
  dataStorageGet(req, res, next) {
    res.render('data-storage', {
      _csrfToken: req.csrfToken(),
      title: '자료실 | 상수도 조회시스템',
      company_ko: process.env.COMPANY_KO,
      company_en: process.env.COMPANY_EN,
      role_ko: process.env.ROLE_KO,
      role_en: process.env.ROLE_EN,
      KAKAO_API_KEY: process.env.KAKAO_API_KEY,
    });
  },

  dataStorageListGet(req, res, next) {
    postgresql.executeQuery(
      `SELECT *
       FROM viw_wtt_file_et;`,
      [],
    ).then(dataStorageListSelect).then(result => {
      res.status(200).json(result);
    }).catch(next);
  },

  dataStorageDeletePost(req, res, next) {
    const ids = req.body['id[]'].toString();
    postgresql.executeQuery(
      `DELETE
       FROM wtt_file_et
       WHERE fle_idn IN (${ids})
       RETURNING fle_pat AS PATH;`,
      [],
    ).then(response => {
      res.status(200).json(response);
      return response;
    }).then(result => {
      (result.rows).forEach(row => {
        const localFile = path.join(defaultFormidableOptions['uploadDir'], row['path']);
        rm(localFile, { force: true }, err => next(err));
      });
    }).catch(next);
  },

  dataStorageDownloadGet(req, res, next) {
    postgresql.executeQuery(`SELECT fle_nam AS name, fle_pat AS path, fle_tb.cname_sl AS ext
                             FROM wtt_file_et file_tb
                                      LEFT JOIN private.cd_fle fle_tb ON file_tb.fle_cde = fle_tb.codeno
                             WHERE fle_idn = $1;`,
      [req.query['id']],
    ).then(response => {
      const row = response['rows'][0];
      const localFile = path.join(defaultFormidableOptions['uploadDir'], row['path']);
      const downloadFile = row['name'] + '.' + row['ext'];
      res.download(localFile, downloadFile, err => {
        next(err);
      });
    }).catch(next);
  },

  // Example of providing files for only certain client with correct uid
  // #mayViewFilesFrom(): Some function that checks authorization
  //
  // app.get('/user/:uid/photos/:file', function (req, res) {
  //   var uid = req.params.uid
  //   var file = req.params.file
  //
  //   req.user.mayViewFilesFrom(uid, function (yes) {
  //     if (yes) {
  //       res.sendFile('/uploads/' + uid + '/' + file)
  //     } else {
  //       res.status(403).send("Sorry! You can't see that.")
  //     }
  //   })
  // })

  dataStorageUploadPost(req, res, next) {
    const form = formidable(defaultFormidableOptions);

    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err);
        return;
      }
      res.json({ fields, files });

      // console.table(fields);
      // console.log(files);

      postgresql.executeQuery(
        `INSERT INTO wtt_file_et (fle_idn, fle_cde, fle_nam, fle_exp, fle_siz, fle_pat, fle_ymd, eddate, reg_nam,
                                  reg_cde)
         VALUES (DEFAULT, (SELECT codeno FROM private.cd_fle WHERE cname = $1), $2, $3, $4, $5, $6,
                 CURRENT_TIMESTAMP, $7, $8);`,
        [
          fields['type'],
          fields['name'].replace(/\.(jpe?g|png|pdf|xlsx?)$/, ''),
          fields['fle_exp'] !== '' ? fields['fle_exp'] : null,
          files['file']['size'],
          files['file']['newFilename'],
          fields['lastModified'],
          fields['reg_nam'] !== '' ? fields['reg_nam'] : null,
          fields['reg_cde'] !== '' ? fields['reg_cde'] : null,
        ],
      ).catch(next);
    });

    form.on('error', next);
  },
};

function dataStorageListSelect(response) {
  let records = {
    iTotalRecords: response.rowCount,
    iTotalDisplayRecords: 10,
    sEcho: 0,
    aaData: response.rows,
  };
  (records.aaData).forEach(record => {
    record['등록일자'] = moment(record['등록일자']).format('YYYY/MM/DD HH:mm');
    // record['수정일자'] = moment(record['수정일자']).format('YYYY/MM/DD HH:mm');
    // record['파일상세'] = record['파일상세'] == null ? '' : record['파일상세'];
    record['btn'] = null;
  });
  return records;
}
