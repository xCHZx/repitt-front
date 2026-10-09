<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import EntitlementBanner from '@/components/business/EntitlementBanner.vue'
import EmailVerificationBanner from '@/components/visitor/EmailVerificationBanner.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'

// Business area shell (guide §3): active business, role-based bottom nav, entitlement and email-verification (§2.11) banners.

const { injectSkinClasses } = useSkins()

injectSkinClasses()

const business = useBusinessStore()
const session = useSessionStore()
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

// §3.3: the active business was dropped (refreshActive got a 404: no longer a member, or it no
// longer exists) → back to the selector instead of repeating 404s on this page.
watch(() => business.loaded && !business.active && route.meta.needsBusiness !== false, dropped => {
  if (dropped)
    router.replace('/empresa/seleccionar')
})

const path = computed(() => route.path.replace(/\/+$/, '') || '/')

const OWNER_ROOTS = ['/empresa', '/empresa/tarjetas', '/empresa/clientes', '/empresa/visitas']
const CASHIER_ROOTS = ['/empresa', '/empresa/recompensas']

const showBackButton = computed(() =>
  !(business.isCashier ? CASHIER_ROOTS : OWNER_ROOTS).includes(path.value))

const PAGE_TITLES: [RegExp, string][] = [
  [/^\/empresa$/, ''],
  [/^\/empresa\/tarjetas\/crear$/, 'Nueva tarjeta'],
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
            color="default"
            class="topbar-btn"
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
            color="default"
            class="topbar-btn"
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
      <EmailVerificationBanner
        v-if="session.isAuthenticated"
        class="mb-4"
      />
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

    <!-- Bottom Navigation: two halves around the FAB, so it stays centered while long labels take the room they need -->
    <nav class="company-bottom-nav">
      <div class="bottom-nav-inner">
        <div class="nav-group">
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
        </div>

        <!-- Center FAB: Registrar -->
        <RouterLink
          to="/empresa/visitas/registrar"
          class="nav-fab"
          :class="{ 'nav-fab--active': isTabActive('registrar') }"
        >
          <span class="nav-fab-btn">
            <VIcon
              icon="tabler-qrcode"
              size="26"
            />
          </span>
          <span>Registrar</span>
        </RouterLink>

        <div class="nav-group">
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
      </div>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.company-layout {
  background-color: var(--fondo);
  min-block-size: 100vh;
}

// ─── Top Bar (guía §8.11): --cabecera-fondo + desenfoque + borde --linea ───
.company-topbar {
  position: fixed;
  z-index: 200;
  backdrop-filter: blur(12px);
  background: var(--cabecera-fondo);
  block-size: var(--cabecera-alto);
  border-block-end: 1px solid var(--linea);
  inset-block-start: 0;
  inset-inline: 0;
}

.company-topbar-inner {
  display: flex;
  align-items: center;
  block-size: 100%;
  gap: var(--s-1);
  margin-inline: auto;
  max-inline-size: 600px;
  padding-inline: var(--s-2);
}

.topbar-left {
  flex-shrink: 0;
  min-inline-size: var(--objetivo-tactil);
}

.topbar-logo {
  display: block;
}

.topbar-title {
  overflow: hidden;
  flex: 1;
  color: var(--texto);
  font-size: var(--t-body);
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
  color: var(--texto);
  gap: var(--s-1);
  min-inline-size: 0;
  text-decoration: none;
  transition: color 160ms var(--ease-out);

  &--link {
    border-radius: var(--r-control);
    padding-block: var(--s-1);
    padding-inline: var(--s-2);

    &:hover {
      color: var(--enlace);
    }
  }
}

.topbar-business__name {
  overflow: hidden;
  font-size: var(--t-body);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-right {
  display: flex;
  flex-shrink: 0;
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
.company-main {
  margin-inline: auto;
  max-inline-size: 600px;
  padding-block: calc(var(--cabecera-alto) + var(--s-4)) calc(var(--s-8) + var(--s-4) + env(safe-area-inset-bottom, 0px));
  padding-inline: var(--s-4);
}

// ─── Bottom Navigation: sin sombra, solo el borde --linea ───
.company-bottom-nav {
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

// Etiquetas en --t-small y sin letter-spacing. Excepción documentada: «Clientes» + «Movimientos»
// (dueño) no caben con aire a 14px en media barra por debajo de 390px. Ahí bajan a 12px y, por debajo
// de 340px (320px de ancho), a 11px: el tamaño más cercano a --t-small que cabe con aire.
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

  @media (max-width: 389.98px) {
    font-size: 0.75rem;
  }

  @media (max-width: 339.98px) {
    font-size: 0.6875rem;
  }
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
