import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Tema Claro - Branco e Azul Bebê
const lightTheme = {
  dark: false,
  colors: {
    background: '#ffffff',
    surface: '#f8f9fa',
    'surface-variant': '#e3f2fd',
    primary: '#81d4fa', // Azul bebê
    'primary-darken-1': '#4fc3f7',
    secondary: '#b3e5fc',
    accent: '#81d4fa',
    error: '#f44336',
    info: '#2196f3',
    success: '#4caf50',
    warning: '#ff9800',
    'on-background': '#000000',
    'on-surface': '#000000',
    'on-primary': '#000000',
    'on-secondary': '#000000',
  }
}

// Tema Escuro - Verde Claro e Preto
const darkTheme = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#1e1e1e',
    'surface-variant': '#2a2a2a',
    primary: '#81c784', // Verde claro
    'primary-darken-1': '#66bb6a',
    secondary: '#a5d6a7',
    accent: '#81c784',
    error: '#f44336',
    info: '#2196f3',
    success: '#4caf50',
    warning: '#ff9800',
    'on-background': '#ffffff',
    'on-surface': '#ffffff',
    'on-primary': '#ffffff',
    'on-secondary': '#000000',
  }
}

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme,
      darkTheme,
    },
  },
})