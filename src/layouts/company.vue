<script lang="ts" setup>
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import { useCompanyStore } from '@/stores/company'

const { injectSkinClasses } = useSkins()

injectSkinClasses()

const companyStore = useCompanyStore()
const router = useRouter()
const route = useRoute()

const isPastDue = computed(() => companyStore.isPastDue)

const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref<any>(null)

watch([isFallbackStateActive, refLoadingIndicator], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()
  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })

const bottomNavRoots = ['empresa', 'empresa-tarjetas', 'empresa-clientes', 'empresa-visitas']

const showBackButton = computed(() => !bottomNavRoots.includes(String(route.name)))

const pageTitle = computed(() => {
  const name = String(route.name)
  if (name === 'empresa') return ''
  if (name === 'empresa-tarjetas-crear') return 'Nueva Tarjeta'
  if (name.startsWith('empresa-tarjetas-id-tarjetas-de-usuario')) return 'Tarjeta de Cliente'
  if (name === 'empresa-tarjetas-id-editar') return 'Editar Tarjeta'
  if (name === 'empresa-tarjetas-id-visitas') return 'Visitas de Tarjeta'
  if (name.startsWith('empresa-tarjetas-id')) return 'Detalle de Tarjeta'
  if (name.startsWith('empresa-tarjetas')) return 'Tarjetas'
  if (name === 'empresa-clientes-customerid') return 'Perfil de Cliente'
  if (name.startsWith('empresa-clientes')) return 'Clientes'
  if (name.startsWith('empresa-planes')) return 'Plan'
  if (name.startsWith('empresa-metricas')) return 'Métricas'
  if (name === 'empresa-visitas-registrar') return 'Registrar Visita'
  if (name.startsWith('empresa-visitas')) return 'Visitas'
  if (name.startsWith('empresa-recompensas')) return 'Recompensas'
  if (name.startsWith('empresa-informacion')) return 'Información'
  if (name === 'empresa-editar') return 'Editar Negocio'
  return 'Repitt'
})

const isTabActive = (tab: string) => {
  const name = String(route.name)
  switch (tab) {
    case 'inicio': return name === 'empresa'
    case 'tarjetas': return name.startsWith('empresa-tarjetas')
    case 'registrar': return name === 'empresa-visitas-registrar'
    case 'clientes': return name.startsWith('empresa-clientes')
    case 'visitas': return name.startsWith('empresa-visitas') && name !== 'empresa-visitas-registrar'
    default: return false
  }
}

const businessInitial = computed(() =>
  String(companyStore.selectedCompany?.name || 'R').charAt(0).toUpperCase(),
)
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
            @click="router.go(-1)"
          >
            <VIcon icon="tabler-arrow-left" size="20" />
          </VBtn>
          <img
            v-else
            src="@/assets/images/logo-v2.png"
            alt="Repitt"
            class="topbar-logo"
            height="28"
          />
        </div>

        <div
          v-if="pageTitle"
          class="topbar-title"
        >
          {{ pageTitle }}
        </div>

        <div class="topbar-right">
          <VBtn
            icon
            variant="text"
            size="small"
            title="Vista de visitante"
            to="/visitante/"
          >
            <VIcon icon="tabler-user" size="20" />
          </VBtn>
          <NavbarThemeSwitcher />
        </div>
      </div>
    </header>

    <!-- Banner past_due -->
    <div
      v-if="isPastDue"
      class="company-pastdue-banner"
    >
      <VIcon
        icon="tabler-alert-triangle"
        size="16"
        class="flex-shrink-0"
      />
      <span>Problema con tu pago.</span>
      <RouterLink
        to="/empresa/planes"
        class="pastdue-link"
      >
        Actualizar tarjeta
      </RouterLink>
    </div>

    <!-- Main Content -->
    <main
      class="company-main"
      :class="{ 'company-main--with-banner': isPastDue }"
    >
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
          to="/empresa/"
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
          to="/empresa/tarjetas"
          class="nav-tab"
          :class="{ 'nav-tab--active': isTabActive('tarjetas') }"
        >
          <VIcon icon="tabler-cards" size="22" />
          <span>Tarjetas</span>
        </RouterLink>

        <!-- Center FAB: Registrar Visita -->
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
          <VIcon icon="tabler-walk" size="22" />
          <span>Visitas</span>
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
  margin-inline: auto;
  max-inline-size: 600px;
  padding-inline: 8px;
}

.topbar-left {
  min-inline-size: 48px;
}

.topbar-logo {
  display: block;
}

.topbar-title {
  flex: 1;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-inline-start: auto;
}

// ─── Past Due Banner ─────────────────────────────────────
.company-pastdue-banner {
  position: fixed;
  z-index: 199;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-warning));
  block-size: 36px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  gap: 6px;
  inset-block-start: 56px;
  inset-inline: 0;
}

.pastdue-link {
  color: white;
  font-weight: 700;
  text-decoration: underline;
}

// ─── Main Content ────────────────────────────────────────
.company-main {
  margin-inline: auto;
  max-inline-size: 600px;
  padding-block: 72px calc(80px + env(safe-area-inset-bottom, 0px));
  padding-inline: 16px;

  &--with-banner {
    padding-block-start: 108px; // 72px + 36px banner
  }
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
