const routes = [
  {
    name: 'views-index-f835d4d896',
    exact: true,
    path: '/',
    component: '@/views/index.js',
    routes: []
  },
  {
    name: 'user-e7dd9caf3a',
    exact: true,
    path: '/footer/:id/user',
    component: '@/views/footer/[id]/user.js',
    routes: []
  },
  {
    name: '[id]-index-92936d890d',
    exact: true,
    path: '/footer/:id',
    component: '@/views/footer/[id]/index.js',
    routes: []
  },
  {
    name: 'footer-index-e9f7735dfd',
    exact: true,
    path: '/footer',
    component: '@/views/footer/index.js',
    routes: []
  },
  {
    name: 'head-b38f75d453',
    exact: true,
    path: '/admin/head',
    component: '@/views/admin/head.js',
    routes: []
  },
  {
    name: '[content$]-_layout-6a53e678e8',
    exact: false,
    path: '/footer/:content?',
    component: '@/views/footer/[content$]/_layout.js',
    routes: [
      {
        name: 'user-d0c6fdfa7c',
        exact: true,
        path: '/footer/:content?/user',
        component: '@/views/footer/[content$]/user.js',
        routes: []
      },
      {
        name: 'papa-_layout-270b11aa2f',
        exact: false,
        path: '/footer/:content?/papa',
        component: '@/views/footer/[content$]/papa/_layout.js',
        routes: [
          {
            name: 'zouzou-_layout-fe9f433e43',
            exact: false,
            path: '/footer/:content?/papa/zouzou',
            component: '@/views/footer/[content$]/papa/zouzou/_layout.js',
            routes: [
              {
                name: 'zouzou-index-9c01c29a0c',
                exact: true,
                path: '/footer/:content?/papa/zouzou',
                component: '@/views/footer/[content$]/papa/zouzou/index.js',
                routes: []
              },
              {
                name: 'hello-de94e1eebc',
                exact: true,
                path: '/footer/:content?/papa/zouzou/hello',
                component: '@/views/footer/[content$]/papa/zouzou/hello.js',
                routes: []
              }
            ]
          },
          {
            name: 'papa-index-06d051c259',
            exact: true,
            path: '/footer/:content?/papa',
            component: '@/views/footer/[content$]/papa/index.js',
            routes: []
          },
          {
            name: 'hello-6c6d32183c',
            exact: true,
            path: '/footer/:content?/papa/hello',
            component: '@/views/footer/[content$]/papa/hello.js',
            routes: []
          }
        ]
      },
      {
        name: 'hello-14e8ddd0a1',
        exact: true,
        path: '/footer/:content?/hello',
        component: '@/views/footer/[content$]/hello.js',
        routes: []
      }
    ],
    $root: true
  }
]
