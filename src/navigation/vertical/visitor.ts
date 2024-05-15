export default [
  { heading: 'Visitante' },
  {
    title: 'Inicio',
    to: { name: 'visitante' },
    icon: { icon: 'tabler-home' },
  },
  {
    title: 'Mi Perfil',
    to: { name: 'visitante-perfil' },
    icon: { icon: 'tabler-id' },
  },
  {
    title: 'Planes',
    to: { name: 'visitante-planes' },
    icon: { icon: 'tabler-premium-rights' },
  },
  {
    title: 'Historial de Visitas',
    to: { name: 'visitante-visitas' },
    icon: { icon: 'tabler-walk' },
  },
  {
    title: 'Mis Tarjetas',
    to: { name: 'visitante-tarjetas' },
    icon: { icon: 'tabler-cards' },
  },
  {
    title: 'Mi Código de Usuario',
    to: { name: 'visitante-perfil-qr' },
    icon: { icon: 'tabler-qrcode' },
  },

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
