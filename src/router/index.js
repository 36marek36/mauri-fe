import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        background: 'none',
        hideHeader: true,
        hideNavbar: true,
        hideFooter: true
      }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: {
        background: 'tennis'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        background: 'tennis'
      }
    },
    {
      path: '/change-username',
      name: 'ChangeUsername',
      component: () => import('@/views/ChangeUsernameView.vue'),
      meta: {
        requiresAuth: true,
        background: 'tennis'
      }
    },
    {
      path: '/change-password',
      name: 'ChangePassword',
      component: () => import('../views/ChangePasswordView.vue'),
      meta: {
        requiresAuth: true,
        background: 'tennis'
      }
    },
    {
      path: '/tennis',
      name: 'TennisHome',
      component: () => import('../views/tennis/TennisHomeView.vue'),
      meta: {
        background: 'tennis'
      }
    },
    {
      path: '/tennis/participants',
      name: 'participants',
      component: () => import('../views/tennis/ParticipantsView.vue'),
      meta: {
        hideHeader: true,
        background: 'tennis'
      }
    },
    {
      path: '/tennis/players/:id',
      name: 'playerDetail',
      component: () => import('../views/tennis/PlayerDetailView.vue'),
      meta: {
        background: 'tennis'
      }
    },
    {
      path: '/tennis/teams/:id',
      name: 'teamDetail',
      component: () => import('../views/tennis/TeamDetailView.vue'),
      meta: {
        background: 'tennis'
      }
    },
    {
      path: '/tennis/players/create',
      name: 'newPlayer',
      component: () => import('../views/tennis/PlayerFormView.vue'),
      meta: {
        background: 'tennis'
      }
    },
    {
      path: '/tennis/players/edit/:id',
      name: 'editPlayer',
      component: () => import('../views/tennis/PlayerFormView.vue'),
      meta: {
        background: 'tennis'
      }
    },
    {
      path: '/tennis/seasons',
      name: 'seasons',
      component: () => import('../views/tennis/SeasonsView.vue'),
      meta: {
        background: 'tennis'
      }
    },
    {
      path: '/tennis/seasons/:id',
      name: 'seasonDetail',
      component: () => import('../views/tennis/SeasonDetailView.vue'),
      meta: {
        background: 'tennis'
      }
    },
    {
      path: '/tennis/leagues/:id',
      name: 'leagueDetail',
      component: () => import('../views/tennis/LeagueDetailView.vue'),
      meta: {
        background: 'tennis'
      }
    },
    {
      path: '/tennis/aboutus',
      name: 'aboutus',
      component: () => import('../views/tennis/AboutUs.vue'),
      meta: {
        hideHeader: true,
        background: 'tennis'
      }
    },
    {
      path: '/tennis/league-rules',
      name: 'rules',
      component: () => import('../views/tennis/Rules.vue'),
      meta: {
        hideHeader: true,
        background: 'tennis'
      }
    }
  ],
})

export default router
