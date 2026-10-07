<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import EntitlementBanner from '@/components/business/EntitlementBanner.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import { useBusinessStore } from '@/stores/business'

// Business area shell (guide §3): active business, role-based bottom nav, entitlement banner.

const { injectSkinClasses } = useSkins()

injectSkinClasses()

const business = useBusinessStore()
const router = useRouter()
const route = useRoute()

const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref<any>(null)

watch([isFallbackStateActive, refLoadingIndicator], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()
  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })

const path = computed(() => route.path.replace(/\/+$/, '') || '/')

const OWNER_ROOTS = ['/empresa', '/empresa/tarjetas', '/empresa/clientes', '/empresa/visitas']
const CASHIER_ROOTS = ['/empresa', '/empresa/recompensas']

const showBackButton = computed(() =>
  !(business.isCashier ? CASHIER_ROOTS : OWNER_ROOTS).includes(path.value))

const PAGE_TITLES: [RegExp, string][] = [
  [/^\/empresa$/, ''],
  [/^\/empresa\/tarjetas\/crear$/, 'Nueva tarjeta'],
  [/^\/empresa\/tarjetas\/[^/]+\/tarjetas-de-usuario/, 'Tarjeta de cliente'],
  [/^\/empresa\/tarjetas\/[^/]+\/editar$/, 'Editar tarjeta'],
  [/^\/empresa\/tarjetas\/[^/]+\/visitas$/, 'Movimientos de la tarjeta'],
  [/^\/empresa\/tarjetas\/[^/]+$/, 'Detalle de tarjeta'],
  [/^\/empresa\/tarjetas$/, 'Tarjetas'],
  [/^\/empresa\/clientes\/[^/]+$/, 'Cliente'],
  [/^\/empresa\/clientes$/, 'Clientes'],
  [/^\/empresa\/ciclos\/[^/]+/, 'Detalle de ciclo'],
  [/^\/empresa\/planes/, 'Plan'],
  [/^\/empresa\/metricas/, 'Métricas'],
  [/^\/empresa\/visitas\/registrar$/, 'Registrar visita'],
  [/^\/empresa\/visitas/, 'Movimientos'],
  [/^\/empresa\/recompensas/, 'Recompensas'],
  [/^\/empresa\/cajeros/, 'Cajeros'],
  [/^\/empresa\/informacion/, 'Mi negocio'],
  [/^\/empresa\/editar$/, 'Editar negocio'],
  [/^\/empresa\/crear$/, 'Nuevo negocio'],
]

const pageTitle = computed(() => PAGE_TITLES.find(([re]) => re.test(path.value))?.[1] ?? 'Repitt')

const canSwitchBusiness = computed(() => business.businesses.length > 1)

const TAB_MATCHERS: Record<string, (p: string) => boolean> = {
  inicio: p => p === '/empresa',
  tarjetas: p => p.startsWith('/empresa/tarjetas'),
  registrar: p => p === '/empresa/visitas/registrar',
  clientes: p => p.startsWith('/empresa/clientes'),
  visitas: p => p.startsWith('/empresa/visitas') && p !== '/empresa/visitas/registrar',
  recompensas: p => p.startsWith('/empresa/recompensas'),
}

const isTabActive = (tab: string) => !!TAB_MATCHERS[tab]?.(path.value)

const goBack = () => {
  if (window.history.length > 1)
    router.back()
  else
    router.push('/empresa')
}
</script>

<template>
  <div class="company-layout">
    <AppLoadingIndicator ref="refLoadingIndicator" />

    <!-- Top Bar -->
    <header class="company-topbar">
      <div class="company-topbar-inner">
        <div class="topbar-left">
          <VBtn
            v-if="showBackButton"
            icon
            variant="text"
            size="small"
            aria-label="Regresar"
            @click="goBack"
          >
            <VIcon
              icon="tabler-arrow-left"
              size="20"
            />
          </VBtn>
          <img
            v-else
            src="@images/logo-v2.png"
            alt="Repitt"
            class="topbar-logo"
            height="28"
          >
        </div>

        <!-- Page title on sub-pages; active business (switcher when there are several) on root tabs -->
        <div
          v-if="showBackButton"
          class="topbar-title"
        >
          {{ pageTitle }}
        </div>

        <component
          :is="canSwitchBusiness ? RouterLink : 'div'"
          v-else-if="business.active"
          v-bind="canSwitchBusiness ? { to: '/empresa/seleccionar' } : {}"
          class="topbar-business"
          :class="{ 'topbar-business--link': canSwitchBusiness }"
        >
          <span class="topbar-business__name">{{ business.active.name }}</span>
          <VChip
            v-if="business.isCashier"
            size="x-small"
            color="secondary"
            variant="tonal"
            class="flex-shrink-0"
          >
            Cajero
          </VChip>
          <VIcon
            v-if="canSwitchBusiness"
            icon="tabler-selector"
            size="16"
            class="flex-shrink-0"
          />
        </component>

        <div class="topbar-right">
          <VBtn
            icon
            variant="text"
            size="small"
            title="Mi cartera"
            aria-label="Mi cartera"
            to="/visitante"
          >
            <VIcon
              icon="tabler-wallet"
              size="20"
            />
          </VBtn>
          <VBtn
            icon
            variant="text"
            size="small"
            title="Mi cuenta"
            aria-label="Mi cuenta"
            to="/visitante/perfil"
          >
            <VIcon
              icon="tabler-user-circle"
              size="20"
            />
          </VBtn>
          <NavbarThemeSwitcher />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="company-main">
      <EntitlementBanner class="mb-4" />

      <RouterView v-slot="{ Component }">
        <Suspense
          :timeout="0"
          @fallback="isFallbackStateActive = true"
          @resolve="isFallbackStateActive = false"
        >
          <Component :is="Component" />
        </Suspense>
      </RouterView>
    </main>

    <!-- Bottom Navigation -->
    <nav class="company-bottom-nav">
      <div class="bottom-nav-inner">
        <RouterLink
          to="/empresa"
          class="nav-tab"
          :class="{ 'nav-tab--active': isTabActive('inicio') }"
        >
          <VIcon
            :icon="isTabActive('inicio') ? 'tabler-home-filled' : 'tabler-home'"
            size="22"
          />
          <span>Inicio</span>
        </RouterLink>

        <RouterLink
          v-if="business.isOwner"
          to="/empresa/tarjetas"
          class="nav-tab"
          :class="{ 'nav-tab--active': isTabActive('tarjetas') }"
        >
          <VIcon
            icon="tabler-cards"
            size="22"
          />
          <span>Tarjetas</span>
        </RouterLink>

        <!-- Center FAB: Registrar -->
        <RouterLink
          to="/empresa/visitas/registrar"
          class="nav-fab"
        >
          <div
            class="nav-fab-btn"
            :class="{ 'nav-fab-btn--active': isTabActive('registrar') }"
          >
            <VIcon
              icon="tabler-qrcode"
              color="white"
              size="26"
            />
          </div>
          <span class="nav-fab-label">Registrar</span>
        </RouterLink>

        <template v-if="business.isOwner">
          <RouterLink
            to="/empresa/clientes"
            class="nav-tab"
            :class="{ 'nav-tab--active': isTabActive('clientes') }"
          >
            <VIcon
              :icon="isTabActive('clientes') ? 'tabler-users-group' : 'tabler-users'"
              size="22"
            />
            <span>Clientes</span>
          </RouterLink>

          <RouterLink
            to="/empresa/visitas"
            class="nav-tab"
            :class="{ 'nav-tab--active': isTabActive('visitas') }"
          >
            <VIcon
              icon="tabler-list-details"
              size="22"
            />
            <span>Movimientos</span>
          </RouterLink>
        </template>

        <RouterLink
          v-else
          to="/empresa/recompensas"
          class="nav-tab"
          :class="{ 'nav-tab--active': isTabActive('recompensas') }"
        >
          <VIcon
            icon="tabler-gift"
            size="22"
          />
          <span>Recompensas</span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<style lang="scss">
.company-layout {
  background-color: rgb(var(--v-theme-background));
  min-block-size: 100vh;
}

// ─── Top Bar ────────────────────────────────────────────
.company-topbar {
  position: fixed;
  z-index: 200;
  backdrop-filter: blur(12px);
  background: rgba(var(--v-theme-surface), 0.92);
  block-size: 56px;
  border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  inset-block-start: 0;
  inset-inline: 0;
}

.company-topbar-inner {
  display: flex;
  align-items: center;
  block-size: 100%;
  gap: 4px;
  margin-inline: auto;
  max-inline-size: 600px;
  padding-inline: 8px;
}

.topbar-left {
  flex-shrink: 0;
  min-inline-size: 40px;
}

.topbar-logo {
  display: block;
}

.topbar-title {
  overflow: hidden;
  flex: 1;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-business {
  display: flex;
  overflow: hidden;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-on-surface));
  gap: 4px;
  min-inline-size: 0;
  text-decoration: none;

  &--link {
    border-radius: 8px;
    padding-block: 4px;
    padding-inline: 6px;

    &:hover {
      background: rgba(var(--v-theme-on-surface), 0.04);
    }
  }
}

.topbar-business__name {
  overflow: hidden;
  font-size: 0.95rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-right {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0;
  margin-inline-start: auto;
}

// ─── Main Content ────────────────────────────────────────
.company-main {
  margin-inline: auto;
  max-inline-size: 600px;
  padding-block: 72px calc(80px + env(safe-area-inset-bottom, 0px));
  padding-inline: 16px;
}

// ─── Bottom Navigation ───────────────────────────────────
.company-bottom-nav {
  position: fixed;
  z-index: 200;
  backdrop-filter: blur(12px);
  background: rgba(var(--v-theme-surface), 0.96);
  block-size: calc(64px + env(safe-area-inset-bottom, 0px));
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  box-shadow: 0 -4px 24px rgba(0 0 0 / 8%);
  inset-block-end: 0;
  inset-inline: 0;
  padding-block-end: env(safe-area-inset-bottom, 0);
}

.bottom-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  block-size: 64px;
  margin-inline: auto;
  max-inline-size: 600px;
  padding-inline: 4px;
}

.nav-tab {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.38);
  font-size: 10px;
  font-weight: 600;
  gap: 3px;
  letter-spacing: 0.3px;
  padding-block: 8px;
  text-decoration: none;
  transition: color 0.2s ease;

  &--active {
    color: rgb(var(--v-theme-primary));
  }
}

.nav-fab {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  padding-block-end: 6px;
  text-decoration: none;
}

.nav-fab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background:
    linear-gradient(
      145deg,
      rgb(var(--v-theme-primary)) 0%,
      rgb(var(--v-theme-primary-darken-1)) 100%
    );
  block-size: 54px;
  box-shadow: 0 4px 18px rgba(var(--v-global-theme-primary), 0.45);
  inline-size: 54px;
  transform: translateY(-14px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &--active {
    box-shadow: 0 6px 24px rgba(var(--v-global-theme-primary), 0.6);
    transform: translateY(-18px);
  }
}

.nav-fab-label {
  color: rgb(var(--v-theme-primary));
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin-block-start: -2px;
}
</style>
