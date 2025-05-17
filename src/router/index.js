import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/players',
      name: 'players',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/PlayersView.vue'),
    },
    {
      path: '/teams',
      name: 'teams',
      component: () => import('../views/TeamsView.vue'),
    },
           {
      path: '/players/:id',
      name: 'playerDetail',
      component: () => import('../views/PlayerDetailView.vue'),
    },
            {
      path: '/players/create',
      name: 'newPlayer',
      component: () => import('../views/PlayerFormView.vue'),
    },
     {
      path: '/seasons',
      name: 'seasons',
      component: () => import('../views/SeasonsView.vue'),
    },
      {
      path: '/seasons/:id',
      name: 'seasonDetail',
      component: () => import('../views/SeasonDetailView.vue'),
    },
    {
      path: '/leagues',
      name: 'leagues',
      component: () => import('../views/LeaguesView.vue'),
    },
     {
      path: '/leagues/:id',
      name: 'leagueDetail',
      component: () => import('../views/LeagueDetailView.vue'),
    },
  ],
})

export default router
