<!--
  Catálogo de estilo (solo desarrollo, plan 2026-10-08 §1.5): cada pieza de Vuetify/Vuexy tal como
  queda con la guía de la landing. Sirve para revisar a ojo y para las capturas de QA.
  Parámetros: ?tema=light|dark fija el tema; ?dialogo=1 abre el diálogo.
-->
<script setup lang="ts">
import { useConfigStore } from '@core/stores/config'
import { iconChoiceToFile } from '@/components/cards/cardIcons'
import { PRESET_COLORS } from '@/components/cards/cardMeta'
import StampCard from '@/components/stampCard/StampCard.vue'
import StampProgress from '@/components/visitor/StampProgress.vue'
import { progressLabel, stampCount } from '@/components/stampCard/stampCard'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const isDev = import.meta.env.DEV
const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()

if (!isDev)
  router.replace('/')

const temaQuery = route.query.tema
if (isDev && (temaQuery === 'light' || temaQuery === 'dark'))
  configStore.theme = temaQuery

const dialogo = ref(route.query.dialogo === '1')
const aviso = ref(true)
const avisoError = ref(true)
const pestana = ref('activas')
const periodo = ref('semana')
const casilla = ref(true)
const interruptor = ref(true)
const nombre = ref('Café Luna')
const premio = ref('')
const reglas = ref('Un sello por compra mayor a $50.')

const ejemplo = {
  negocio: 'Café Luna',
  tarjeta: 'Café gratis',
  premio: 'Un americano',
  sellos: 5,
  requeridos: 8,
}

// Tarjeta de sellos: el PNG que sube un ícono predefinido (trazo del color de la tarjeta),
// generado igual que al guardar, para ver la silueta blanca de D4.
const pngSimulado = ref<string | null>(null)

onMounted(async () => {
  if (!isDev)
    return
  try {
    pngSimulado.value = URL.createObjectURL(await iconChoiceToFile({ kind: 'preset', name: 'heart' }, PRESET_COLORS[1].hex))
  }
  catch {
    pngSimulado.value = null
  }
})

const tamanos = ['x-small', 'small', 'default', 'large'] as const

function alternarTema() {
  configStore.theme = configStore.theme === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <main
    v-if="isDev"
    class="catalogo"
  >
    <header class="catalogo__cabecera">
      <div>
        <h1 class="titulo-display">
          Catálogo de estilo
        </h1>
        <p class="note medida">
          Piezas de Vuetify con la guía de la landing. Solo en desarrollo.
        </p>
      </div>
      <VBtn
        variant="outlined"
        prepend-icon="tabler-sun-moon"
        @click="alternarTema"
      >
        Cambiar tema
      </VBtn>
    </header>

    <!-- Tipografía -->
    <section class="catalogo__seccion">
      <h2 class="section-label">
        Tipografía
      </h2>
      <div class="panel">
        <div class="text-h1">
          text-h1 · Cada visita cuenta
        </div>
        <div class="text-h3">
          text-h3 · Tus tarjetas
        </div>
        <div class="text-h5">
          text-h5 · Métricas
        </div>
        <div class="text-h6">
          text-h6 · Premio
        </div>
        <div class="text-subtitle-1">
          text-subtitle-1 · {{ ejemplo.negocio }}
        </div>
        <p class="text-body-1 medida">
          text-body-1 · Tus clientes juntan sellos en cada visita y canjean su premio sin tarjetas de cartón.
        </p>
        <p class="text-body-2">
          text-body-2 · {{ ejemplo.tarjeta }}
        </p>
        <p class="text-caption">
          text-caption · 8 de octubre de 2026
        </p>
        <p class="text-overline">
          text-overline · Etiqueta
        </p>
        <p class="text-medium-emphasis">
          text-medium-emphasis · texto secundario en --texto-2
        </p>
        <p class="lead medida">
          .lead · Tú o tus cajeros, desde cualquier teléfono.
        </p>
        <p class="note">
          .note · 30 días gratis desde que publicas tu primera tarjeta.
        </p>
        <div class="d-flex align-baseline gap-4 flex-wrap">
          <span class="cifra">{{ progressLabel(ejemplo.sellos, ejemplo.requeridos) }}</span>
          <span class="text-h4 cifra">128</span>
          <span class="font-weight-black">1,024 · font-weight-black</span>
        </div>
        <div class="section-label">
          <VIcon
            icon="tabler-gift"
            size="18"
          />
          .section-label con ícono
        </div>
      </div>
    </section>

    <!-- Botones -->
    <section class="catalogo__seccion">
      <h2 class="section-label">
        Botones
      </h2>
      <div class="panel">
        <div class="catalogo__fila">
          <VBtn>Primario (flat)</VBtn>
          <VBtn variant="tonal">
            Marco (tonal)
          </VBtn>
          <VBtn variant="outlined">
            Marco (outlined)
          </VBtn>
          <VBtn variant="text">
            Discreto (text)
          </VBtn>
          <VBtn
            variant="outlined"
            color="error"
          >
            Eliminar
          </VBtn>
          <VBtn
            variant="text"
            color="error"
          >
            Quitar
          </VBtn>
        </div>
        <div
          v-for="tamano in tamanos"
          :key="tamano"
          class="catalogo__fila"
        >
          <VBtn :size="tamano">
            {{ tamano }}
          </VBtn>
          <VBtn
            :size="tamano"
            variant="tonal"
            prepend-icon="tabler-qrcode"
          >
            Con ícono
          </VBtn>
          <VBtn
            :size="tamano"
            variant="text"
          >
            Discreto
          </VBtn>
          <VBtn
            :size="tamano"
            icon="tabler-dots-vertical"
            variant="text"
            color="default"
            aria-label="Más opciones"
          />
          <VBtn
            :size="tamano"
            icon="tabler-x"
            variant="tonal"
            aria-label="Cerrar"
          />
        </div>
        <div class="catalogo__fila">
          <VBtn disabled>
            Deshabilitado
          </VBtn>
          <VBtn
            variant="tonal"
            disabled
          >
            Marco deshabilitado
          </VBtn>
          <VBtn loading>
            Cargando
          </VBtn>
          <VBtn
            color="secondary"
            rounded="xl"
          >
            Secundario con rounded="xl"
          </VBtn>
        </div>
        <VBtn block>
          Bloque
        </VBtn>
      </div>
    </section>

    <!-- Campos -->
    <section class="catalogo__seccion">
      <h2 class="section-label">
        Campos
      </h2>
      <div class="panel">
        <VTextField
          v-model="nombre"
          label="Nombre del negocio"
        />
        <VTextField
          v-model="premio"
          label="Premio"
          :error-messages="['Escribe el premio.']"
        />
        <VTextField
          label="Código"
          model-value="ABCD2345"
          disabled
        />
        <VTextField
          label="Con pista"
          hint="Lo ven tus clientes en su tarjeta."
          persistent-hint
          prepend-inner-icon="tabler-mail"
        />
        <VSelect
          label="Tarjeta"
          :items="['Café gratis', 'Postre gratis']"
          model-value="Café gratis"
        />
        <VTextarea
          v-model="reglas"
          label="Reglas"
          rows="2"
        />
        <div class="catalogo__fila">
          <VCheckbox
            v-model="casilla"
            label="Acepto el aviso de privacidad"
          />
          <VSwitch
            v-model="interruptor"
            label="Tarjeta activa"
          />
        </div>
      </div>
    </section>

    <!-- Avisos -->
    <section class="catalogo__seccion">
      <h2 class="section-label">
        Avisos
      </h2>
      <div class="d-flex flex-column gap-3">
        <VAlert
          variant="tonal"
          color="info"
          icon="tabler-info-circle"
        >
          Tu negocio todavía no está publicado.
        </VAlert>
        <VAlert
          variant="tonal"
          color="warning"
          title="Reglas congeladas"
          icon="tabler-lock"
        >
          Ya hay clientes con esta tarjeta: las reglas no se pueden cambiar.
        </VAlert>
        <VAlert
          variant="tonal"
          type="error"
        >
          No pudimos guardar los cambios. Intenta otra vez.
        </VAlert>
        <div class="catalogo__aviso">
          <VSnackbar
            v-model="aviso"
            color="success"
            :timeout="-1"
            contained
            location="top"
          >
            Enlace copiado
          </VSnackbar>
          <VSnackbar
            v-model="avisoError"
            color="error"
            :timeout="-1"
            contained
            location="bottom"
          >
            No se pudo copiar
          </VSnackbar>
        </div>
      </div>
    </section>

    <!-- Chips y avatar -->
    <section class="catalogo__seccion">
      <h2 class="section-label">
        Chips y avatar
      </h2>
      <div class="panel">
        <div class="catalogo__fila">
          <VChip size="x-small">
            Borrador
          </VChip>
          <VChip
            size="small"
            color="success"
            variant="tonal"
          >
            Activa
          </VChip>
          <VChip
            color="primary"
            prepend-icon="tabler-clock"
          >
            Vence pronto
          </VChip>
          <VChip
            size="small"
            class="chip-premio"
          >
            Premio listo
          </VChip>
          <span class="chip-premio">A canjear</span>
        </div>
        <div class="catalogo__fila">
          <VAvatar
            variant="tonal"
            color="primary"
            size="48"
          >
            C
          </VAvatar>
          <VAvatar
            variant="tonal"
            size="40"
          >
            <VIcon icon="tabler-coffee" />
          </VAvatar>
          <span>{{ ejemplo.negocio }} · {{ stampCount(ejemplo.requeridos) }}</span>
        </div>
      </div>
    </section>

    <!-- Carga y progreso -->
    <section class="catalogo__seccion">
      <h2 class="section-label">
        Carga y progreso
      </h2>
      <div class="panel">
        <VSkeletonLoader type="list-item-avatar-two-line" />
        <VProgressLinear :model-value="62" />
        <VProgressLinear
          :model-value="40"
          :color="PRESET_COLORS[2].hex"
        />
        <VProgressLinear indeterminate />
        <div class="d-flex align-center gap-3">
          <VProgressCircular indeterminate />
          <span class="note">Indeterminados: con movimiento reducido quedan estáticos</span>
        </div>
        <span class="note">{{ progressLabel(ejemplo.sellos, ejemplo.requeridos) }} sellos</span>
      </div>
    </section>

    <!-- Selección -->
    <section class="catalogo__seccion">
      <h2 class="section-label">
        Pestañas y toggle
      </h2>
      <div class="panel">
        <VTabs
          v-model="pestana"
          density="compact"
        >
          <VTab value="activas">
            Activas
          </VTab>
          <VTab value="archivadas">
            Archivadas
          </VTab>
        </VTabs>
        <VBtnToggle
          v-model="periodo"
          mandatory
          variant="outlined"
          color="primary"
          density="compact"
          rounded="xl"
        >
          <VBtn value="semana">
            Semana
          </VBtn>
          <VBtn value="mes">
            Mes
          </VBtn>
          <VBtn value="anio">
            Año
          </VBtn>
        </VBtnToggle>
        <VBtnToggle
          v-model="periodo"
          mandatory
          density="compact"
          color="primary"
          class="w-100"
        >
          <VBtn
            value="semana"
            prepend-icon="tabler-keyboard"
            class="flex-1-1"
          >
            Código
          </VBtn>
          <VBtn
            value="mes"
            prepend-icon="tabler-phone"
            class="flex-1-1"
          >
            Teléfono
          </VBtn>
        </VBtnToggle>
      </div>
    </section>

    <!-- Superficies -->
    <section class="catalogo__seccion">
      <h2 class="section-label">
        Superficies
      </h2>
      <VCard>
        <VCardTitle>VCard por defecto</VCardTitle>
        <VCardSubtitle>{{ ejemplo.tarjeta }}</VCardSubtitle>
        <VCardText>
          Plana, borde --linea, radio --r-superficie. Premio: {{ ejemplo.premio }}.
        </VCardText>
        <VCardActions>
          <VBtn variant="text">
            Cancelar
          </VBtn>
          <VBtn
            variant="flat"
            @click="dialogo = true"
          >
            Abrir diálogo
          </VBtn>
        </VCardActions>
      </VCard>
      <VCard class="mt-4">
        <VList class="py-0">
          <VListItem
            title="Café Luna"
            subtitle="5 de 8 sellos"
            prepend-icon="tabler-coffee"
            link
          />
          <VDivider />
          <VListItem
            title="Panadería Sol"
            subtitle="2 de 10 sellos"
            prepend-icon="tabler-bread"
            link
          />
        </VList>
      </VCard>
    </section>

    <!-- Contextos -->
    <section class="catalogo__seccion">
      <h2 class="section-label">
        Contextos
      </h2>
      <div class="section--tono catalogo__banda">
        <h3 class="text-h4">
          Banda tonal
        </h3>
        <p class="note">
          .section--tono · el texto secundario y las líneas se ajustan.
        </p>
        <div class="panel">
          <span class="section-label">Panel dentro de la banda</span>
          <span>{{ ejemplo.premio }}</span>
        </div>
      </div>
      <div class="section--night catalogo__banda">
        <h3 class="text-h4">
          Contexto noche
        </h3>
        <p class="note">
          .section--night · oscuro en los dos temas, para el mostrador.
        </p>
        <span class="cifra">{{ progressLabel(6, 8) }}</span>
        <VBtn class="btn-inverso">
          Botón inverso
        </VBtn>
      </div>
      <div class="dots catalogo__banda catalogo__tapete">
        <span class="note">.dots · tapete de puntos (solo detrás de la tarjeta de sellos)</span>
      </div>
    </section>

    <!-- Tarjeta de sellos (fase 2A): estados, más de 12 sellos, íconos y los 10 colores -->
    <section class="catalogo__seccion">
      <h2 class="section-label">
        Tarjeta de sellos
      </h2>
      <p class="note">
        En curso ({{ progressLabel(ejemplo.sellos, ejemplo.requeridos) }}) con ícono predefinido Café y golpe de tinta en el último sello.
      </p>
      <div class="dots catalogo__tapete-tarjeta">
        <StampCard
          :business-name="ejemplo.negocio"
          :card-name="ejemplo.tarjeta"
          :reward="ejemplo.premio"
          :required-stamps="ejemplo.requeridos"
          :stamps="ejemplo.sellos"
          :color="PRESET_COLORS[0].hex"
          icon-name="coffee"
          :new-stamp="ejemplo.sellos"
        />
      </div>
      <div class="catalogo__tarjetas">
        <div class="catalogo__muestra">
          <p class="note">
            Completa ({{ progressLabel(8, 8) }}), sello nuevo que la completa: el anillo pulsa dos veces
          </p>
          <StampCard
            :business-name="ejemplo.negocio"
            :card-name="ejemplo.tarjeta"
            :reward="ejemplo.premio"
            :required-stamps="8"
            :stamps="8"
            status="completed"
            :color="PRESET_COLORS[0].hex"
            icon-name="coffee"
            :new-stamp="8"
            flat
          />
        </div>
        <div class="catalogo__muestra">
          <p class="note">
            Canjeada (estática)
          </p>
          <StampCard
            :business-name="ejemplo.negocio"
            :card-name="ejemplo.tarjeta"
            :reward="ejemplo.premio"
            :required-stamps="8"
            :stamps="8"
            status="redeemed"
            :color="PRESET_COLORS[0].hex"
            icon-name="coffee"
            flat
          />
        </div>
        <div class="catalogo__muestra">
          <p class="note">
            {{ stampCount(20) }}: barra de 8px
          </p>
          <StampCard
            :business-name="ejemplo.negocio"
            :reward="ejemplo.premio"
            :required-stamps="20"
            :stamps="13"
            :color="PRESET_COLORS[5].hex"
            flat
          />
        </div>
        <div class="catalogo__muestra">
          <p class="note">
            Ícono PNG de preset (silueta blanca, D4)
          </p>
          <StampCard
            :business-name="ejemplo.negocio"
            :card-name="ejemplo.tarjeta"
            :reward="ejemplo.premio"
            :required-stamps="10"
            :stamps="6"
            :color="PRESET_COLORS[1].hex"
            :icon-url="pngSimulado"
            icon-mode="blanco"
            flat
          />
        </div>
        <div class="catalogo__muestra">
          <p class="note">
            Ícono por URL no PNG (tonal, D4)
          </p>
          <StampCard
            :business-name="ejemplo.negocio"
            :card-name="ejemplo.tarjeta"
            :reward="ejemplo.premio"
            :required-stamps="5"
            :stamps="3"
            :color="PRESET_COLORS[6].hex"
            icon-url="/favicon.svg"
            flat
          />
        </div>
        <div class="catalogo__muestra">
          <p class="note">
            Sin ícono
          </p>
          <StampCard
            :business-name="ejemplo.negocio"
            :card-name="ejemplo.tarjeta"
            :reward="ejemplo.premio"
            :required-stamps="12"
            :stamps="7"
            :color="PRESET_COLORS[9].hex"
            flat
          />
        </div>
      </div>
      <h3 class="section-label">
        Los 10 colores
      </h3>
      <div class="catalogo__colores">
        <div
          v-for="c in PRESET_COLORS"
          :key="c.hex"
          class="catalogo__muestra"
        >
          <p class="note">
            {{ c.label }} · {{ c.hex }}
          </p>
          <StampCard
            :business-name="ejemplo.negocio"
            :card-name="ejemplo.tarjeta"
            :reward="ejemplo.premio"
            :required-stamps="ejemplo.requeridos"
            :stamps="ejemplo.sellos"
            :color="c.hex"
            icon-name="star"
            flat
          />
          <StampProgress
            :count="ejemplo.sellos"
            :required="ejemplo.requeridos"
            :color="c.hex"
            :icon-url="pngSimulado"
            icon-mode="blanco"
          />
        </div>
      </div>
    </section>

    <VDialog
      v-model="dialogo"
      max-width="480"
    >
      <VCard>
        <VCardTitle>¿Canjear el premio?</VCardTitle>
        <VCardText>
          {{ ejemplo.premio }} para {{ ejemplo.negocio }}. Esta acción no se puede deshacer.
        </VCardText>
        <VCardActions>
          <VBtn
            variant="text"
            @click="dialogo = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            variant="flat"
            @click="dialogo = false"
          >
            Canjear
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </main>
</template>

<style lang="scss" scoped>
.catalogo {
  display: grid;
  gap: var(--s-6);
  margin-inline: auto;
  max-inline-size: 960px;
  padding-block: var(--s-6);
  padding-inline: var(--margen);
}

.catalogo__cabecera {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--s-4);
}

.catalogo__seccion {
  display: grid;
  gap: var(--s-3);
}

.catalogo__fila {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3);
}

.catalogo__banda {
  display: grid;
  padding: var(--s-5);
  border-radius: var(--r-superficie);
  gap: var(--s-3);
  justify-items: start;
}

.catalogo__tapete {
  block-size: 96px;
}

.catalogo__aviso {
  position: relative;
  overflow: hidden;
  border: 1px dotted var(--linea);
  border-radius: var(--r-control);
  block-size: 160px;
}

.catalogo__tapete-tarjeta {
  padding: var(--s-5);
  border-radius: var(--r-superficie);
  max-inline-size: 640px;
}

.catalogo__tarjetas,
.catalogo__colores {
  display: grid;
  gap: var(--s-5);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
}

.catalogo__muestra {
  display: grid;
  align-content: start;
  gap: var(--s-2);
}
</style>
