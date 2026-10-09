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
            color="default"
            class="topbar-btn"
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
            color="default"
            class="topbar-btn"
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

    <!-- Bottom Navigation: two halves around the FAB, so it stays centered while long labels take the room they need -->
    <nav class="visitor-bottom-nav">
      <div class="bottom-nav-inner">
        <div class="nav-group">
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
        </div>

        <!-- Center FAB: QR -->
        <RouterLink
          to="/visitante/perfil/qr"
          class="nav-fab"
          :class="{ 'nav-fab--active': isTabActive('qr') }"
        >
          <span class="nav-fab-btn">
            <VIcon
              icon="tabler-qrcode"
              size="26"
            />
          </span>
          <span>Mi QR</span>
        </RouterLink>

        <div class="nav-group">
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
      </div>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.visitor-layout {
  background-color: var(--fondo);
  min-block-size: 100vh;
}

// ─── Top Bar (guía §8.11): --cabecera-fondo + desenfoque + borde --linea ───
.visitor-topbar {
  position: fixed;
  z-index: 200;
  backdrop-filter: blur(12px);
  background: var(--cabecera-fondo);
  block-size: var(--cabecera-alto);
  border-block-end: 1px solid var(--linea);
  inset-block-start: 0;
  inset-inline: 0;
}

.visitor-topbar-inner {
  display: flex;
  align-items: center;
  block-size: 100%;
  margin-inline: auto;
  max-inline-size: 600px;
  padding-inline: var(--s-2);
}

.topbar-left {
  min-inline-size: var(--s-7);
}

.topbar-logo {
  display: block;
  block-size: auto;
  inline-size: 80px;
}

.topbar-title {
  flex: 1;
  color: var(--texto);
  font-size: var(--t-body);
  font-weight: 700;
  text-align: center;
}

.topbar-right {
  display: flex;
  align-items: center;
  margin-inline-start: auto;
}

// Botones de ícono de la barra: --texto, hover --enlace (sin velo)
.topbar-btn {
  transition: color 160ms var(--ease-out);

  &:hover {
    color: var(--enlace);
  }
}

// ─── Main Content ────────────────────────────────────────
.visitor-main {
  margin-inline: auto;
  max-inline-size: 600px;
  padding-block: calc(var(--cabecera-alto) + var(--s-4)) calc(var(--s-8) + var(--s-4) + env(safe-area-inset-bottom, 0px));
  padding-inline: var(--s-4);
}

// ─── Bottom Navigation: sin sombra, solo el borde --linea ───
.visitor-bottom-nav {
  position: fixed;
  z-index: 200;
  backdrop-filter: blur(12px);
  background: var(--cabecera-fondo);
  block-size: calc(var(--s-8) + env(safe-area-inset-bottom, 0px));
  border-block-start: 1px solid var(--linea);
  inset-block-end: 0;
  inset-inline: 0;
  padding-block-end: env(safe-area-inset-bottom, 0);
}

.bottom-nav-inner {
  display: flex;
  align-items: stretch;
  block-size: var(--s-8);
  margin-inline: auto;
  max-inline-size: 600px;
}

// Dos mitades iguales alrededor del FAB: el FAB queda centrado y cada pestaña toma el ancho de su etiqueta
.nav-group {
  display: flex;
  flex: 1 1 0;
  min-inline-size: 0;
}

// Etiquetas en --t-small y sin letter-spacing: «Actividad» + «Perfil» caben en media barra a 320px.
.nav-tab,
.nav-fab {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--texto-2);
  font-size: var(--t-small);
  font-weight: 600;
  gap: var(--s-1);
  line-height: var(--lh-small);
  text-decoration: none;
  transition: color 160ms var(--ease-out);
  white-space: nowrap;
}

.nav-tab {
  flex: 1 1 auto;
  justify-content: center;
  padding-block: var(--s-2);
}

// FAB: violeta plano, hover --violeta-tinta. Sobresale de la barra por su tamaño (el contenido
// va abajo y desborda hacia arriba), sin transform, sin sombra y sin animación.
.nav-fab {
  flex: none;
  justify-content: flex-end;
  padding-block-end: var(--s-2);
  padding-inline: var(--s-1);
}

.nav-tab:hover,
.nav-fab:hover {
  color: var(--texto);
}

.nav-tab--active,
.nav-fab--active {
  &,
  &:hover {
    color: var(--enlace);
    font-weight: 700;
  }
}

.nav-fab-btn {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--violeta);
  block-size: var(--s-7);
  color: var(--papel);
  inline-size: var(--s-7);
  transition: background-color 160ms var(--ease-out);
}

.nav-fab:hover .nav-fab-btn {
  background-color: var(--violeta-tinta);
}
</style>
