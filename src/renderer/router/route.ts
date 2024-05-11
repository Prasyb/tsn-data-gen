import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/menu',
      name: 'menu',
      component: () => import('../layouts/LayoutClassic.vue'),
      children: [
        {
          path: '/menu/login',
          name: 'login',
          component: () => import('../views/Login.vue')
        },
        {
          path: '/menu/graph',
          name: 'graph',
          component: () => import('../views/Graph.vue')
        },
        {
          path: '/menu/form',
          name: 'form',
          component: () => import('../views/Form.vue')
        }
      ]
    }
  ]
})

export default router
