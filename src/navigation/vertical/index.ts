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
    title: 'Negocio',
    icon: { icon: 'tabler-building' },
    children: [
      {
        title: 'Crear',
        to: 'business-create-business',
      },
      {
        title: 'Mis negocios',
        to: 'business',
      },
      {
        title: 'Cartilla',
        to: 'recompensas-crear-recompensas'
      }
    ]
  }
]
