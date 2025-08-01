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
      component: () => import('../views/PlayersView.vue'),
    },
    {
      path: '/teams',
      name: 'teams',
      component: () => import('../views/TeamsView.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
    },
    {
      path: '/participants',
      name: 'participants',
      component: () => import('../views/ParticipantsView.vue')
    },
    {
      path: '/players/:id',
      name: 'playerDetail',
      component: () => import('../views/PlayerDetailView.vue'),
    },
    {
      path: '/teams/:id',
      name: 'teamDetail',
      component: () => import('../views/TeamDetailView.vue'),
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
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/change-password',
      name: 'ChangePassword',
      component: () => import('../views/ChangePassword.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

export default router
