import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
  },
  {
    path: '/tier',
    name: 'tier',
    component: () => import('@/views/ArchetypeTier.vue'),
  },
  {
    path: '/archetype-analysis',
    name: 'archetype-analysis',
    component: () => import('@/views/ArchetypeAnalysis.vue'),
  },
  {
    path: '/meta',
    name: 'meta',
    component: () => import('@/views/MetaOverview.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

const { start, finish } = useLoadingBar()
const { loadTierData } = useTierData()

router.beforeEach(async () => {
  start()
  await loadTierData()
})
router.afterEach(() => finish())

export default router
