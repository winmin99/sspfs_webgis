import { default as wtl } from './wtl';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import postgresql from '../middlewares/postgresql';
import sharp from 'sharp'

export default function (router, passport) {
  const uploadDir = 'upload'; //변수에 파일이 저장될 디렉터리(upload)를 지정.
  console.log(uploadDir, 'goat');
  if (!fs.existsSync(uploadDir)) { //fs.existsSync(uploadDir) → upload 폴더가 존재하는지 확인.
    fs.mkdirSync(uploadDir, { recursive: true }); //존재하지 않으면 fs.mkdirSync(uploadDir, { recursive: true });를 사용하여 생성.
  } //recursive: true 옵션은 중첩된 폴더도 자동 생성해줌.

  // ✅ 한국 날짜(YYYYMMDD)만 반환하는 함수
  const getKSTDateTime = () => {
    const now = new Date(); // 현재 시간을 가져옴(UTC 기준).
    now.setHours(now.getHours() + 9); // 한국 시간(KST) 기준으로 변경. UTC+9 (KST)
    return now.toISOString().replace(/[-T:]/g, "").split(".")[0].slice(0, 14); // YYYYMMDD_HHMMSS
  };

  //multer를 사용하여 파일을 업로드하고, 저장 위치와 파일명을 설정함.
  const upload = multer({
    storage: multer.diskStorage({ //multer.diskStorage({})를 사용하여 파일 저장 방식 설정.
      destination(req, file, cb) {
        cb(null, uploadDir); //업로드된 파일을 저장할 폴더 지정 (upload 폴더).
      },
      filename(req, file, cb) {
        const ext = path.extname(file.originalname); //확장자를 path.extname(file.originalname)로 가져옴.
        const formattedDate = getKSTDateTime(); // ✅ getKSTDateTime()을 호출하여 날짜 기반 파일명을 생성.
        cb(null, `${formattedDate}${ext}`); // ✅ 최종 파일명: YYYYMMDD_HHMMSS.확장자 (예: 20250325_123456.jpg).
      },
    }),
    // limits: { fileSize: 15 * 1024 * 1024 }, // 15MB 제한
  });

  //upload.single("photo") → photo라는 이름의 파일을 하나만 업로드하도록 설정.
  router.post("/img", upload.single("photo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" }); //파일이 없으면 에러 응답을 보냄.
      }

      const { comment, fac_uid, layer } = req.body; //요청(req.body)에서 코멘트, 시설 ID(fac_uid), 레이어(layer) 정보를 가져옴.

      if (!fac_uid || !layer) {
        return res.status(400).json({ error: "시설물 정보가 필요합니다." });//시설 정보가 없으면 에러 반환.
      }

      const originalPath = req.file.path; // multer가 업로드한 파일의 원본 경로 (예: upload/20250325_123456.jpg).

      //압축된 파일 저장 경로(예: upload/도로_1234_20250325_123456.jpg).
      const compressedPath = path.join(uploadDir, `${layer}_${fac_uid}_${req.file.filename}`);

      console.log(`📌 원본 경로: ${originalPath}, 압축 경로: ${compressedPath}`);

      // ✅ 파일을 Buffer로 읽어서 sharp으로 변환 후 새 파일로 저장
      const data = await fs.promises.readFile(originalPath); // 파일을 Buffer로 읽기
      await sharp(data)
        .resize({ width: 912 }) // 가로 최대 912px, 가로가 912px보다 작다면 원본 크기 유지.
        .withMetadata() // EXIF 메타데이터 유지
        .jpeg({ quality: 80 }) // JPEG 품질 80%
        .toFile(compressedPath); // 새로운 파일로 저장

      // ✅ 원본 파일 삭제 (sharp이 파일을 다 사용한 후 실행)
      setTimeout(async () => {
        try {
          await fs.promises.unlink(originalPath); //originalPath(원본 이미지 파일)를 삭제.
          console.log(`✅ 원본 파일 삭제 완료: ${originalPath}`);
        } catch (unlinkError) { //삭제 실패 시 에러 메시지를 출력.
          console.error("🚨 원본 파일 삭제 실패:", unlinkError);
        }
      }, 1000); // sharp이 파일을 다 사용하기 전에 삭제하려고 하면 에러가 발생할 수 있어서 약간의 딜레이 추가.

      // ✅ DB에 저장될 경로, 파일 경로에서 파일명만 추출 (예: 도로_1234_20250325_123456.jpg), 슬래시(/)를 붙여 웹에서 접근할 수 있는 URL 형식으로 변경.
      const imageUrl = `/${path.basename(compressedPath)}`;

      console.log(`📌 저장되는 데이터: ${imageUrl}, ${comment}, ${fac_uid}, ${layer}`);

      // ✅ DB에 저장, test_photo 테이블에 이미지 경로, 코멘트, 시설 ID, 레이어 정보를 저장, img_url 컬럼이 jsonb 타입이므로 [imageUrl]을 JSON.stringify()로 감싸서 저장.
      await postgresql.executeQuery(
        `INSERT INTO test_photo (img_url, comment, fac_uid, layer) VALUES ($1, $2, $3, $4)`,
        [JSON.stringify([imageUrl]), comment, fac_uid, layer]
      );

      res.json({ url: imageUrl, comment }); //업로드된 이미지의 URL과 코멘트를 JSON 형식으로 클라이언트에게 반환.
    } catch (error) {
      console.error("Error uploading image:", error); // try-catch 블록을 사용하여 에러 발생 시 서버가 멈추지 않도록 예외 처리.
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  //클라이언트(프론트엔드)가 이미지 목록을 요청할 때 사용, GET 방식이므로, 데이터를 가져오는 요청임.
  router.get('/images', async (req, res) => { //비동기(async) 함수로 정의됨, 내부에서 await을 사용하여 비동기 데이터베이스 조회를 수행.
    try {
      //클라이언트가 쿼리 스트링(Query String)으로 보낸 데이터를 가져옴,ex: GET /images?fac_uid=1234,fac_uid=1234가 req.query.fac_uid로 저장됨.
      const { fac_uid } = req.query; //구조분해할당 = const fac_uid = req.query.fac_uid;
      if (!fac_uid) { //fac_uid 값이 없으면 에러(400 Bad Request)를 반환.
        return res.status(400).json({ error: 'fac_uid가 필요합니다.' });
      }

      // language=PostgreSQL
      const result = await postgresql.executeQuery( //await을 사용했으므로, 실행이 끝날 때까지 기다림.
        `SELECT id, JSONB_ARRAY_ELEMENTS(img_url) AS img_url, comment
         FROM sspfs47920.public.test_photo
        WHERE fac_uid = $1`,
        [fac_uid],
      );//img_url 컬럼이 JSONB 배열 형태이므로, JSONB_ARRAY_ELEMENTS()를 사용하여 배열 안의 개별 URL을 추출함.

      // 결과가 없을 때 처리
      if (!result.rows || result.rows.length === 0) {
        return res.json({ images: [] });
      } //데이터베이스에서 조회된 이미지가 없으면 빈 배열 반환, 클라이언트(프론트엔드)가 **"이미지가 없음"**을 알 수 있도록 함.

      //데이터베이스에서 가져온 여러 개의 행을 배열 형태로 변환.
      const images = result.rows.map((row) => ({
        url: row.img_url,
        comment: row.comment || ""
      }));
      console.log(images,"tanos");

      res.json({ images });
    } catch (error) {
      console.error('Error loading images:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // 프론트에서 POST /update_comment 요청을 보내면 이 코드가 실행됨.
  router.post("/update_comment", async (req, res) => {
    try {
      const { filename, comment } = req.body; //구조 분해 할당. (ex: { filename: "image123.jpg", comment: "새로운 코멘트" })
      console.log(filename, comment,"service");
      // comment가 null, 빈 문자열(""), 숫자(0)일 때는 업데이트할 수도 있기 때문에 → undefined인지 정확히 체크.
      if (!filename || comment === undefined) return res.status(400).json({ error: "잘못된 요청입니다." });
      // 만약 comment === undefined라면, 프론트에서 아예 값을 안 보낸 경우일 가능성이 큼.

      const updateQuery = `UPDATE test_photo SET comment = $1 WHERE img_url::jsonb @> $2`; // JSON 배열에 특정 파일명이 포함된 행을 찾음
      await postgresql.executeQuery(updateQuery, [comment, JSON.stringify([`/${filename}`])]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  //:filename → 삭제할 이미지 파일명을 URL 파라미터로 받음. async 함수 → DB 작업이 비동기이므로 await을 사용할 수 있도록 함.
  router.delete('/deleteimg/:filename', async (req, res) => {
    try {
      //req.params → URL에서 :filename 값을 가져옴.
      let { filename } = req.params;

      console.log('🚀 [DELETE 요청] filename:', filename);

      //filename이 없으면, 잘못된 요청이므로 400 Bad Request 응답을 보냄.
      if (!filename) {
        console.log('❌ No filename provided!');
        return res.status(400).json({ error: 'No filename provided' });
      }

      filename = filename.replace(/^\/+/, ''); // 앞쪽의 '/' 제거
      //현재 디렉토리(__dirname)의 upload 폴더에서 해당 파일의 절대 경로를 만듦.
      const filePath = path.resolve(__dirname, 'upload', filename);
      console.log('📂 [파일 경로] filePath:', filePath);

      // fs.existsSync(filePath) → 파일이 존재하는지 확인.
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); //파일이 존재하면 fs.unlinkSync(filePath)를 사용해 파일 삭제.
        console.log('✅ [파일 삭제 성공]:', filename);
      } else {
        console.log('❌ [파일 없음] filePath:', filePath);
        return res.status(404).json({ error: 'File not found' });
      }

      // PostgreSQL에서 해당 파일 URL을 포함한 행 삭제
      const deleteQuery = `
            DELETE FROM test_photo
            WHERE img_url::jsonb @> $1
        `; //,img_url은 jsonb 타입이므로, @> 연산자를 사용하여 특정 값을 포함하는지 확인함.

      const dbResponse = await postgresql.executeQuery(deleteQuery, [JSON.stringify([`/${filename}`])]);
      console.log('✅ [DB 삭제 성공]:', dbResponse.rowCount, 'rows affected');

      res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
      console.error('🔥 [삭제 중 오류 발생]:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  const user = {
    id: 'admin',
    password: 'qhdghk12',
    displayName: 'Bonghwa', // Add display name for testing
  };
  router.get('/', checkAuth, function (req, res) {
    if (!req.isAuthenticated()) {
      return res.render('index', {
        title: `홈 | ${process.env.ROLE_KO}도 조회시스템`,
        company_ko: process.env.COMPANY_KO,
        company_en: process.env.COMPANY_EN,
        role_ko: process.env.ROLE_KO,
        role_en: process.env.ROLE_EN,
        KAKAO_API_KEY: process.env.KAKAO_API_KEY,
        workspace: process.env.WORKSPACE,
      });
    } else {
      // Store the intended redirect path in the session
      req.session.redirectTo = req.originalUrl;
      return res.redirect('/login');
    }
  });

  router.post('/login', bodyParser.urlencoded({ extended: false }), (req, res) => {
    const id = req.body.user_id;
    const password = req.body.user_pwd;

    if (id === user.id && password === user.password) {
      // Manually set user in the session
      req.session.user = user;

      // Redirect to home page after successful login
      return res.redirect('/');
    } else {
      // Redirect to '/login' if login fails
      return res.redirect('/login');
    }
  });

  // Welcome page
  router.get('/welcome', checkAuth, function (req, res) {
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="http://localhost:3000/">Bonghwa Web Inquiry System</a>
    `);
  });

  router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      res.redirect('/login');
    });
  });

  // router.get('/auth/signin', passportRoute.index);
  // router.post('/auth/signin', function (req, res, next) {
  //   return passportRoute.login(req, res, next, passport);
  // });
  // router.post('/auth/signup', function (req, res, next) {
  //   return passportRoute.signUp(req, res, next, passport);
  // });
  // router.get('/auth/signout', passportRoute.signOut);

  router.get('/api/wtl/search', checkAuth, wtl.search, onError);
  router.get('/api/wtl/section', checkAuth, wtl.section, onError);
  router.get('/api/wtl/info', checkAuth, wtl.info, onError);
  router.get('/api/wtl/info/check', checkAuth, wtl.infoCheck, onError);
  router.get('/api/wtl/info/photo', checkAuth, wtl.infoPhoto, onError);
  router.get('/api/wtl/info/history', checkAuth, wtl.infoHistory, onError);

  function onError(err, req, res, next) {
    console.error(err.stack);
    console.error(`[REQUEST QUERY]: ${JSON.stringify(req.query, null, 2)}`);
    console.error(`[REQUEST BODY]: ${JSON.stringify(req.body, null, 2)}`);
    res.status(400).json(err.stack.match('[\n]*.*'));
  }

  function checkAuth(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      // Store the intended redirect path in the session
      req.session.redirectTo = req.originalUrl;
      return res.redirect('/login');
    }
  }
}
