export default {
  index(req, res, next) {
    res.render('index', {
      _csrfToken: req.csrfToken(),
      title: `홈 | ${process.env.ROLE_KO}도 조회시스템`,
      company_ko: process.env.COMPANY_KO,
      company_en: process.env.COMPANY_EN,
      role_ko: process.env.ROLE_KO,
      role_en: process.env.ROLE_EN,
      KAKAO_API_KEY: process.env.KAKAO_API_KEY,
      workspace: process.env.WORKSPACE,
    });
  },
};
