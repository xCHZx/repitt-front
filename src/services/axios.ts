import axios from 'axios';
import type { App } from 'vue';

interface AxiosOptions {
  baseUrl?: string
  token?: string
}

// Función para realizar solicitudes autenticadas utilizando el token JWT
const authAxios = axios.create({
    baseURL: 'http://127.0.0.1:8000/',
});

// Interceptar cada solicitud para incluir el token JWT en el encabezado
authAxios.interceptors.request.use(config => {
    // Obtener el token guardado en localStorage
    const token = localStorage.getItem('token');
    if (token) {
        // Incluir el token en el encabezado de la solicitud
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default {
  install: (app: App, options: AxiosOptions) => {
    app.config.globalProperties.$axios = axios.create({
      baseURL: options.baseUrl,
      headers: {
        Authorization: options.token ? `Bearer ${options.token}` : '',
      },
    })
  },
}

export { authAxios };
