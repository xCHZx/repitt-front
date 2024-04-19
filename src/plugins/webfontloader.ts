/**
 * plugins/webfontloader.js
 *
 * webfontloader documentation: https://github.com/typekit/webfontloader
 */

export async function loadFonts() {
  const webFontLoader = await import(/* webpackChunkName: "webfontloader" */'webfontloader')

  webFontLoader.load({
    google: {
      // families: ['Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap'],
      // families: ['Maven+Pro:wght@0,400;0,500;0,600;0,700;0,800;0,900&display=swap', 'Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap'],
      families: ['Inter:100,200,300,400,500,600,700,800,900&display=swap'],
    },
  })
}

export default function () {
  loadFonts()
}
