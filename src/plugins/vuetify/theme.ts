import type { ThemeDefinition } from 'vuetify'

// Colores de la guía de la landing (repitt-web/docs/diseno/guia-de-estilo.md §2, plan 2026-10-08 §1.2).
// Vuetify no acepta var(): van los mismos hex que src/styles/tokens.css. Si cambias uno aquí,
// cambia el token (y al revés). Texto sobre --premio y --canje en --tinta: el blanco no pasa AA (§9.3).

/** --violeta */
export const staticPrimaryColor = '#6C3CE1'

/** --violeta-tinta */
export const staticPrimaryDarkenColor = '#5328B8'

const tinta = '#2F2B3D'

export const themes: Record<string, ThemeDefinition> = {
  light: {
    dark: false,
    colors: {
      'primary': staticPrimaryColor,
      'on-primary': '#fff',
      'primary-darken-1': staticPrimaryDarkenColor,
      'secondary': '#6D6880', // --tinta-suave
      'on-secondary': '#fff',
      'secondary-darken-1': '#5F5A74', // --banda-texto-2
      'success': '#28C76F', // --canje: solo «premio listo», sin uso genérico nuevo
      'on-success': tinta,
      'success-darken-1': '#24B364',
      'info': staticPrimaryDarkenColor, // --enlace
      'on-info': '#fff',
      'info-darken-1': staticPrimaryDarkenColor,
      'warning': '#FF9F43', // --premio: solo premios
      'on-warning': tinta,
      'warning-darken-1': '#E68F3C',
      'error': '#B42318', // --error
      'on-error': '#fff',
      'error-darken-1': '#B42318',
      'background': '#F7F6FE', // --fondo
      'on-background': tinta, // --texto
      'surface': '#FFFFFF', // --superficie
      'on-surface': tinta,
      'grey-50': '#FAFAFA',
      'grey-100': '#F5F5F5',
      'grey-200': '#EEEEEE',
      'grey-300': '#E0E0E0',
      'grey-400': '#BDBDBD',
      'grey-500': '#9E9E9E',
      'grey-600': '#757575',
      'grey-700': '#616161',
      'grey-800': '#424242',
      'grey-900': '#212121',
      'grey-light': '#FAFAFA',
      'perfect-scrollbar-thumb': '#DBDADE',
      'skin-bordered-background': '#FFFFFF',
      'skin-bordered-surface': '#FFFFFF',
      'expansion-panel-text-custom-bg': '#FAFAFA',
    },

    variables: {
      'code-color': '#d400ff',
      'overlay-scrim-background': '#1D1733', // --velo: rgb(29 23 51 / 40%)
      'overlay-scrim-opacity': 0.4,
      'tooltip-background': tinta,
      'hover-opacity': 0.06,
      'focus-opacity': 0.1,
      'selected-opacity': 0.08,
      'activated-opacity': 0.16,
      'pressed-opacity': 0.14,
      'dragged-opacity': 0.1,
      'disabled-opacity': 0.4,
      'border-color': tinta, // --linea: rgb(47 43 61 / 12%)
      'border-opacity': 0.12,
      'table-header-color': '#EAEAEC',
      'high-emphasis-opacity': 1, // el texto va en --texto sólido
      'medium-emphasis-opacity': 0.7,
      'switch-opacity': 0.2,
      'switch-disabled-track-opacity': 0.3,
      'switch-disabled-thumb-opacity': 0.4,
      'switch-checked-disabled-opacity': 0.3,
      'track-bg': '#F1F0F2',

      // Sombras: ninguna (la única de la guía es la de la tarjeta de sellos)
      'shadow-key-umbra-color': tinta,
      'shadow-xs-opacity': 0,
      'shadow-sm-opacity': 0,
      'shadow-md-opacity': 0,
      'shadow-lg-opacity': 0,
      'shadow-xl-opacity': 0,
    },
  },
  dark: {
    dark: true,
    colors: {
      'primary': staticPrimaryColor,
      'on-primary': '#fff',
      'primary-darken-1': staticPrimaryDarkenColor,
      'secondary': '#ABA7C2', // --texto-2 oscuro
      'on-secondary': tinta,
      'secondary-darken-1': '#ABA7C2',
      'success': '#28C76F',
      'on-success': tinta,
      'success-darken-1': '#24B364',
      'info': '#A58BFF', // --enlace oscuro
      'on-info': tinta,
      'info-darken-1': '#A58BFF',
      'warning': '#FF9F43',
      'on-warning': tinta,
      'warning-darken-1': '#E68F3C',
      'error': '#FF8A80', // --error oscuro
      'on-error': tinta,
      'error-darken-1': '#FF8A80',
      'background': '#25293C', // --fondo oscuro
      'on-background': '#E1DEF5', // --texto oscuro
      'surface': '#2F3349', // --superficie oscuro
      'on-surface': '#E1DEF5',
      'grey-50': '#26293A',
      'grey-100': '#2F3349',
      'grey-200': '#26293A',
      'grey-300': '#4A5072',
      'grey-400': '#5E6692',
      'grey-500': '#7983BB',
      'grey-600': '#AAB3DE',
      'grey-700': '#B6BEE3',
      'grey-800': '#CFD3EC',
      'grey-900': '#E7E9F6',
      'grey-light': '#353A52',
      'perfect-scrollbar-thumb': '#4A5072',
      'skin-bordered-background': '#2F3349',
      'skin-bordered-surface': '#2F3349',
    },
    variables: {
      'code-color': '#d400ff',
      'overlay-scrim-background': '#1D1733', // --velo (igual en los dos temas)
      'overlay-scrim-opacity': 0.4,
      'tooltip-background': '#F7F4FF',
      'hover-opacity': 0.06,
      'focus-opacity': 0.1,
      'selected-opacity': 0.08,
      'activated-opacity': 0.16,
      'pressed-opacity': 0.14,
      'dragged-opacity': 0.1,
      'disabled-opacity': 0.4,
      'border-color': '#E1DEF5', // --linea oscuro: rgb(225 222 245 / 14%)
      'border-opacity': 0.14,
      'table-header-color': '#535876',
      'high-emphasis-opacity': 1,
      'medium-emphasis-opacity': 0.7,
      'switch-opacity': 0.4,
      'switch-disabled-track-opacity': 0.4,
      'switch-disabled-thumb-opacity': 0.8,
      'switch-checked-disabled-opacity': 0.3,
      'track-bg': '#3A3F57',

      // Sombras: ninguna
      'shadow-key-umbra-color': '#131120',
      'shadow-xs-opacity': 0,
      'shadow-sm-opacity': 0,
      'shadow-md-opacity': 0,
      'shadow-lg-opacity': 0,
      'shadow-xl-opacity': 0,
    },
  },
}

export default themes
