const defaultOptions = require('./index').default;

window.KTLayoutSearch = window.KTLayoutSearchInline = require('../javascript/maps/components/search');

const globalOptions = Object.assign(defaultOptions, {
    workspace: 'bonghwa_a',
    workspaceLocale: '봉화',
    role: 'wtl',
    center: {
        latitude: 36.893127,
        longitude: 128.732589,
    },
    rect: '128.372325,36.686060,128.787714,37.073914',
    table: {
        filter: true,
        spi: [
            // 'viw_spi_ps',
        ],
        vector: [
          'view_manage_a',
          'view_manage_b',
          'view_manage_d',
          'view_manage_e',
          'view_manage_f',
          // 'view_manage_line',
        ],
        image: [
            'n3a_a0010000',
            'n3a_b0010000',
        ],
        maintenance: 'view_manage_a',
        photo: new Map([
          ['소교량', 'view_manage_a'],
          ['세천', 'view_manage_b'],
          // ['취입보', 'view_manage_c'],
          ['낙차공', 'view_manage_d'],
          ['농로', 'view_manage_e'],
          ['마을진입로', 'view_manage_f'],
        ]),
        repairPhoto: 'view_manage_a',
        repair: 'viw_wtt_wutl_ht',
    },
    kakao: {
        rest: '6f9d4d0e21c06821096587024beeb8a7',
    },
});

window.webgis = globalOptions;
