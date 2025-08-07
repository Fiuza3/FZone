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
    'surface-variant': '#51a8ffff',
    primary: '#4db6e6', // Azul bebê mais escuro
    'primary-darken-1': '#ee0000ff',
    'primary-lighten-4': '#e1f5fe',
    secondary: '#81c7d4',
    accent: '#4db6e6',
    error: '#f44336',
    info: '#f44336',
    'info-lighten-4': '#ffebee',
    success: '#388e3c',
    'success-lighten-4': '#f5e8e8ff',
    warning: '#f57c00',
    'warning-lighten-4': '#fff3e0',
    'on-background': '#000000',
    'on-surface': '#000000',
    'on-primary': '#000000',
    'on-secondary': '#000000',
    'on-error': '#ffffff',
    'on-info': '#ffffff',
    'on-success': '#ffffff',
    'on-warning': '#ffffff',
    'tooltip': '#f44336',
    'on-tooltip': '#ffffff',
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