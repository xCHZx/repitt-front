export default [
  { heading: 'Empresa' },

  {
    title: 'Inicio',

    // to: { name: 'empresa-id', params: { id: '1' } },
    to: { name: 'empresa' },
    icon: { icon: 'tabler-home' },
  },
  {
    title: 'Información del Negocio',
    to: { name: 'empresa-informacion' },
    icon: { icon: 'tabler-building-store' },
  },
  {
    title: 'Métricas',
    to: { name: 'empresa-metricas' },
    icon: { icon: 'tabler-chart-histogram' },
  },
  {
    title: 'Planes',
    to: { name: 'empresa-planes' },
    icon: { icon: 'tabler-premium-rights' },
  },
  {
    title: 'Tarjetas de Lealtad',
    to: { name: 'empresa-tarjetas' },
    icon: { icon: 'tabler-cards' },
  },
  {
    title: 'Visitas',
    to: { name: 'empresa-visitas' },
    icon: { icon: 'tabler-walk' },
  },
  {
    title: 'Registrar Visita',
    to: { name: 'empresa-visitas-registrar' },
    icon: { icon: 'tabler-qrcode' },
  },
  {
    title: 'Canjear Recompensas',
    to: { name: 'empresa-recompensas' },
    icon: { icon: 'tabler-gift' },
  },

  // {
  //   title: 'PRUEBA COMPANY',
  //   icon: { icon: 'tabler-smart-home' },
  // },

  // {
  //   title: 'Mi Negocio',
  //   icon: { icon: 'tabler-smart-home' },
  //   children: [
  //     {
  //       title: 'Crear Negocio',
  //       to: { name: 'negocio-crear-negocio' },
  //       icon: { icon: 'tabler-file' },
  //     },
  //     {
  //       title: 'Cartilla',
  //       to: 'recompensas-crear-recompensas',
  //     },
  //   ],
  // },
]
