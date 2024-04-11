export default [
  {
    title: 'Home',
    to: { name: 'root' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Second page',
    to: { name: 'second-page' },
    icon: { icon: 'tabler-file' },
  },

  {
    title: 'Mi Negocio',
    icon: { icon: 'tabler-smart-home' },
    children: [
      {
        title: 'Crear Negocio',
        to: { name: 'negocio-crear-negocio' },
        icon: { icon: 'tabler-file' },
      },
    ],
  },
]
