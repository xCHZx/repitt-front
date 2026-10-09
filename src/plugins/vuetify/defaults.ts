// Defaults con la guía de la landing (plan 2026-10-08, §1.3). Lo visual que no sale de aquí ni de
// las variables SCSS (src/assets/styles/variables/) vive en src/styles/vuetify.scss.
export default {
  // Sin ondas: hover y foco ya cambian color (guía §7.3)
  global: {
    ripple: false,
  },
  IconBtn: {
    icon: true,
    color: 'default',
    variant: 'text',
  },
  VAlert: {
    density: 'comfortable',
    VBtn: {
      color: undefined,
    },
  },
  VAvatar: {
    // ℹ️ Remove after next release
    variant: 'flat',
  },
  VBadge: {
    // set v-badge default color to primary
    color: 'primary',
  },
  VBtn: {
    // set v-btn default color to primary
    color: 'primary',

    // Botón plano de 48px con radio --r-control
    variant: 'flat',
    rounded: 'lg',
  },
  VCard: {
    // Superficie plana con borde --linea (vuetify.scss) y radio --r-superficie
    variant: 'flat',
    rounded: 'xl',
  },
  VChip: {
    label: true,
  },
  VDataTable: {
    VPagination: {
      showFirstLastPage: true,
      firstIcon: 'tabler-chevrons-left',
      lastIcon: 'tabler-chevrons-right',
    },
  },
  VDataTableServer: {
    VPagination: {
      showFirstLastPage: true,
      firstIcon: 'tabler-chevrons-left',
      lastIcon: 'tabler-chevrons-right',
    },
  },
  VExpansionPanel: {
    expandIcon: 'tabler-chevron-right',
    collapseIcon: 'tabler-chevron-right',
  },
  VExpansionPanelTitle: {
    expandIcon: 'tabler-chevron-right',
    collapseIcon: 'tabler-chevron-right',
  },
  VList: {
    color: 'primary',
    density: 'compact',
    VCheckboxBtn: {
      density: 'compact',
    },
    VListItem: {
      ripple: false,
      VAvatar: {
        size: 40,
      },
    },
  },
  VMenu: {
    offset: '2px',
    scrollStrategy: 'block',
  },
  VPagination: {
    density: 'comfortable',
    variant: 'tonal',
  },
  VTabs: {
    // set v-tabs default color to primary
    color: 'primary',
    density: 'comfortable',
    VSlideGroup: {
      showArrows: true,
    },
  },
  VTooltip: {
    // set v-tooltip default location to top
    location: 'top',
  },
  VCheckboxBtn: {
    color: 'primary',
  },
  VCheckbox: {
    // set v-checkbox default color to primary
    color: 'primary',
    density: 'comfortable',
    hideDetails: 'auto',
  },
  VRadioGroup: {
    color: 'primary',
    density: 'comfortable',
    hideDetails: 'auto',
  },
  VRadio: {
    density: 'comfortable',
    hideDetails: 'auto',
  },
  VSelect: {
    variant: 'outlined',
    color: 'primary',
    density: 'comfortable',
    hideDetails: 'auto',
    VChip: {
      label: true,
    },
  },
  VRangeSlider: {
    // set v-range-slider default color to primary
    color: 'primary',
    trackSize: 6,
    thumbSize: 22,
    density: 'comfortable',
    thumbLabel: true,
    hideDetails: 'auto',
  },
  VRating: {
    // set v-rating default color to primary
    color: 'warning',
  },
  VProgressLinear: {
    // Barra de 8px (guía §8.9); pista --linea y relleno --acento en vuetify.scss
    height: 8,
    roundedBar: true,
    rounded: true,
  },
  VSlider: {
    // set v-range-slider default color to primary
    color: 'primary',
    thumbLabel: true,
    hideDetails: 'auto',
    thumbSize: 22,
    trackSize: 6,
    elevation: 0,
  },
  VTextField: {
    variant: 'outlined',
    density: 'comfortable',
    color: 'primary',
    hideDetails: 'auto',
  },
  VAutocomplete: {
    variant: 'outlined',
    color: 'primary',
    density: 'comfortable',
    hideDetails: 'auto',
    menuProps: {
      contentClass: 'app-autocomplete__content v-autocomplete__content',
    },
    VChip: {
      label: true,
    },
  },
  VCombobox: {
    variant: 'outlined',
    density: 'comfortable',
    color: 'primary',
    hideDetails: 'auto',
    VChip: {
      label: true,
    },
  },
  VFileInput: {
    variant: 'outlined',
    density: 'comfortable',
    color: 'primary',
    hideDetails: 'auto',
  },
  VTextarea: {
    variant: 'outlined',
    density: 'comfortable',
    color: 'primary',
    hideDetails: 'auto',
  },
  VSnackbar: {
    // Aviso plano (D10): superficie y borde --linea en vuetify.scss
    variant: 'flat',
    VBtn: {
      density: 'comfortable',
    },
  },
  VDialog: {
    // Sin animación de entrada (guía §15, diálogos modales)
    transition: 'none',
  },
  VSwitch: {
    // set v-switch default color to primary
    inset: true,
    color: 'primary',
    hideDetails: 'auto',
    ripple: false,
  },
  VNavigationDrawer: {
    touchless: true,
  },
}
