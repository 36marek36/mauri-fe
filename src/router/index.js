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
        background: 'none'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        background: 'none'
      }
    },
    {
      path: '/change-username',
      name: 'ChangeUsername',
      component: () => import('@/views/ChangeUsernameView.vue'),
      meta: {
        requiresAuth: true,
        background: 'none'
      }
    },
    {
      path: '/change-password',
      name: 'ChangePassword',
      component: () => import('../views/ChangePasswordView.vue'),
      meta: {
        requiresAuth: true,
        background: 'none'
      }
    },
    {
      path: '/players/create',
      name: 'newPlayer',
      component: () => import('../views/PlayerFormView.vue'),
      meta: {
        background: 'none'
      }
    },
    {
      path: '/players/edit/:id',
      name: 'editPlayer',
      component: () => import('../views/PlayerFormView.vue'),
      meta: {
        background: 'none'
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
        // hideHeader: true,
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
        // hideHeader: true,
        background: 'tennis'
      }
    },
    {
      path: '/tennis/league-rules',
      name: 'rules',
      component: () => import('../views/tennis/Rules.vue'),
      meta: {
        // hideHeader: true,
        background: 'tennis'
      }
    },
    {
      path: '/volleyball',
      name: 'VolleyballHome',
      component: () => import('../views/volley/VolleyHomeView.vue'),
      meta: {
        // hideFooter: true,
        background: 'volleyball'
      }
    },
    {
      path: '/volleyball/teams',
      name: 'VolleyballTeams',
      component: () => import('../views/volley/VolleyTeamsView.vue'),
      meta: {
        // hideFooter: true,
        background: 'volleyball'
      }
    },
    {
      path: '/volleyball/teams/:id',
      name: 'VolleyballTeamDetail',
      component: () => import('../views/volley/VolleyTeamDetailView.vue'),
      meta: {
        // hideFooter: true,
        background: 'volleyball'
      }
    },
    {
      path: '/volleyball/league-rules',
      name: 'volleyRules',
      component: () => import('../views/volley/VolleyRulesView.vue'),
      meta: {
        // hideFooter: true,
        background: 'volleyball'
      }
    },
    {
      path: '/volleyball/players/:id',
      name: 'volleyPlayerDetail',
      component: () => import('../views/volley/VolleyTeamCaptainDetailView.vue'),
      meta: {
        background: 'volleyball'
      }
    },
  ]
})

export default router
