<script lang="ts" setup>
import EmailVerificationBanner from '@/components/visitor/EmailVerificationBanner.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import { useSessionStore } from '@/stores/session'

// Visitor / "Mi cuenta" layout: every signed-in user (visitors, owners and cashiers) can use it.
// There is no global role: the business shortcut shows when the user has memberships (§3).

const { injectSkinClasses } = useSkins()

const session = useSessionStore()

injectSkinClasses()

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

const bottomNavRoots = ['/visitante', '/visitante/tarjetas', '/visitante/visitas', '/visitante/perfil', '/visitante/perfil/qr']

const showBackButton = computed(() => !bottomNavRoots.includes(path.value))

const TITLES: [prefix: string, title: string][] = [
  ['/visitante/tarjetas', 'Mis tarjetas'],
  ['/visitante/visitas', 'Actividad'],
  ['/visitante/perfil/qr', 'Mi QR'],
  ['/visitante/perfil/privacidad', 'Privacidad y datos'],
  ['/visitante/perfil/telefono', 'Cambiar teléfono'],
  ['/visitante/perfil', 'Mi cuenta'],
  ['/visitante/negocios', 'Negocio'],
]

const pageTitle = computed(() => {
  if (path.value === '/visitante')
    return ''

  return TITLES.find(([prefix]) => path.value.startsWith(prefix))?.[1] ?? 'Repitt'
})

const TAB_MATCHERS: Record<string, (p: string) => boolean> = {
  inicio: p => p === '/visitante',
  tarjetas: p => p.startsWith('/visitante/tarjetas'),
  qr: p => p === '/visitante/perfil/qr',
  actividad: p => p.startsWith('/visitante/visitas'),
  perfil: p => p.startsWith('/visitante/perfil') && p !== '/visitante/perfil/qr',
}

const isTabActive = (tab: string) => !!TAB_MATCHERS[tab]?.(path.value)

const goBack = () => {
  if (window.history.state?.back)
    router.back()
  else
    router.replace(path.value.startsWith('/visitante/perfil') ? '/visitante/perfil' : '/visitante')
}
</script>

<template>
  <div class="visitor-layout">
    <AppLoadingIndicator ref="refLoadingIndicator" />

    <!-- Top Bar -->
    <header class="visitor-topbar">
      <div class="visitor-topbar-inner">
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
            height="24"
          >
        </div>

        <div
          v-if="pageTitle"
          class="topbar-title"
        >
          {{ pageTitle }}
        </div>

        <div class="topbar-right">
          <VBtn
            v-if="session.hasMemberships"
            icon
            variant="text"
            size="small"
            title="Ir a mi negocio"
            aria-label="Ir a mi negocio"
            to="/empresa"
          >
            <VIcon
              icon="tabler-building-store"
              size="20"
            />
          </VBtn>
          <NavbarThemeSwitcher />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="visitor-main">
      <EmailVerificationBanner
        v-if="session.isAuthenticated"
        class="mb-4"
      />
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
    <nav class="visitor-bottom-nav">
      <div class="bottom-nav-inner">
        <RouterLink
          to="/visitante"
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
          to="/visitante/tarjetas"
          class="nav-tab"
          :class="{ 'nav-tab--active': isTabActive('tarjetas') }"
        >
          <VIcon
            icon="tabler-cards"
            size="22"
          />
          <span>Tarjetas</span>
        </RouterLink>

        <!-- Center FAB: QR -->
        <RouterLink
          to="/visitante/perfil/qr"
          class="nav-fab"
        >
          <div
            class="nav-fab-btn"
            :class="{ 'nav-fab-btn--active': isTabActive('qr') }"
          >
            <VIcon
              icon="tabler-qrcode"
              color="white"
              size="26"
            />
          </div>
          <span class="nav-fab-label">Mi QR</span>
        </RouterLink>

        <RouterLink
          to="/visitante/visitas"
          class="nav-tab"
          :class="{ 'nav-tab--active': isTabActive('actividad') }"
        >
          <VIcon
            icon="tabler-activity"
            size="22"
          />
          <span>Actividad</span>
        </RouterLink>

        <RouterLink
          to="/visitante/perfil"
          class="nav-tab"
          :class="{ 'nav-tab--active': isTabActive('perfil') }"
        >
          <VIcon
            icon="tabler-user"
            size="22"
          />
          <span>Perfil</span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<style lang="scss">
// Global font override
* {
  font-family: 'Plus Jakarta Sans', sans-serif !important;
}

.visitor-layout {
  min-block-size: 100vh;
  background-color: rgb(var(--v-theme-background));
}

// ─── Top Bar ────────────────────────────────────────────
.visitor-topbar {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  block-size: 56px;
  background: rgba(var(--v-theme-surface), 0.92);
  border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(12px);
  z-index: 200;
}

.visitor-topbar-inner {
  display: flex;
  align-items: center;
  block-size: 100%;
  padding-inline: 8px;
  max-inline-size: 600px;
  margin-inline: auto;
}

.topbar-left {
  min-inline-size: 48px;
}

.topbar-logo {
  display: block;
  block-size: auto;
  inline-size: 80px;
}

.topbar-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
  color: rgb(var(--v-theme-on-surface));
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-inline-start: auto;
}

// ─── Main Content ────────────────────────────────────────
.visitor-main {
  padding-block-start: 72px;
  padding-block-end: calc(80px + env(safe-area-inset-bottom, 0px));
  padding-inline: 16px;
  max-inline-size: 600px;
  margin-inline: auto;
}

// ─── Bottom Navigation ───────────────────────────────────
.visitor-bottom-nav {
  position: fixed;
  inset-block-end: 0;
  inset-inline: 0;
  block-size: calc(64px + env(safe-area-inset-bottom, 0px));
  padding-block-end: env(safe-area-inset-bottom, 0px);
  background: rgba(var(--v-theme-surface), 0.96);
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);
  z-index: 200;
  backdrop-filter: blur(12px);
}

.bottom-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  block-size: 64px;
  padding-inline: 4px;
  max-inline-size: 600px;
  margin-inline: auto;
}

.nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: rgba(var(--v-theme-on-surface), 0.38);
  text-decoration: none;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: color 0.2s ease;
  padding-block: 8px;

  &--active {
    color: rgb(var(--v-theme-primary));
  }
}

.nav-fab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  text-decoration: none;
  padding-block-end: 6px;
}

.nav-fab-btn {
  inline-size: 54px;
  block-size: 54px;
  border-radius: 50%;
  background: linear-gradient(
    145deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-primary-darken-1)) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-14px);
  box-shadow: 0 4px 18px rgba(var(--v-global-theme-primary), 0.45);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &--active {
    transform: translateY(-18px);
    box-shadow: 0 6px 24px rgba(var(--v-global-theme-primary), 0.6);
  }
}

.nav-fab-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: rgb(var(--v-theme-primary));
  margin-block-start: -2px;
}
</style>
