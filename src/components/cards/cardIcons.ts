// Stamp icon choices for a card (guide §4.A.5): predefined icons are rasterized to PNG before
// uploading; custom files must be PNG/JPEG/WebP ≤ 2 MiB.

export const ICON_ACCEPT = 'image/png,image/jpeg,image/webp'
export const ICON_MAX_BYTES = 2 * 1024 * 1024
const ICON_SIZE = 256

export const PRESET_ICONS = [
  { name: 'star', label: 'Estrella', icon: 'tabler-star', body: '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>' },
  { name: 'heart', label: 'Corazón', icon: 'tabler-heart', body: '<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.566"/>' },
  { name: 'crown', label: 'Corona', icon: 'tabler-crown', body: '<path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z"/>' },
  { name: 'trophy', label: 'Trofeo', icon: 'tabler-trophy', body: '<path d="M8 21l8 0"/><path d="M12 17l0 4"/><path d="M7 4l10 0"/><path d="M17 4v8a5 5 0 0 1 -10 0v-8"/><path d="M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>' },
  { name: 'gift', label: 'Regalo', icon: 'tabler-gift', body: '<path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"/><path d="M12 8l0 13"/><path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5"/>' },
  { name: 'bolt', label: 'Rayo', icon: 'tabler-bolt', body: '<path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"/>' },
  { name: 'flame', label: 'Llama', icon: 'tabler-flame', body: '<path d="M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z"/>' },
  { name: 'diamond', label: 'Diamante', icon: 'tabler-diamond', body: '<path d="M6 5h12l3 5l-8.5 9.5a.7 .7 0 0 1 -1 0l-8.5 -9.5l3 -5"/>' },
  { name: 'coffee', label: 'Café', icon: 'tabler-coffee', body: '<path d="M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1"/><path d="M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2"/><path d="M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2"/><path d="M3 10h14v5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -6 -6v-5z"/><path d="M16.746 16.726a3 3 0 1 0 .252 -5.555"/>' },
  { name: 'pizza', label: 'Pizza', icon: 'tabler-pizza', body: '<path d="M12 21.5c-3.04 0 -5.952 -1.657 -7.75 -4.5h15.5c-1.798 2.843 -4.71 4.5 -7.75 4.5z"/><path d="M12 3l9 17.1h-18z"/><path d="M9 12l1.5 1.5"/><path d="M13.5 10l1.5 1.5"/>' },
  { name: 'mood-smile', label: 'Sonrisa', icon: 'tabler-mood-smile', body: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 10l.01 0"/><path d="M15 10l.01 0"/><path d="M9.5 15a3.5 3.5 0 0 0 5 0"/>' },
  { name: 'thumb-up', label: 'Me gusta', icon: 'tabler-thumb-up', body: '<path d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3"/>' },
] as const

export type PresetIconName = typeof PRESET_ICONS[number]['name']

/** A pending icon change: a predefined icon (rasterized at upload time) or a validated file. */
export type IconChoice =
  | { kind: 'preset'; name: PresetIconName }
  | { kind: 'file'; file: File; previewUrl: string }

export function presetLabel(name: PresetIconName): string {
  return PRESET_ICONS.find(i => i.name === name)?.label ?? ''
}

function presetSvg(name: PresetIconName, color: string, size: number): string {
  const body = PRESET_ICONS.find(i => i.name === name)?.body ?? ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
}

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function iconChoicePreview(choice: IconChoice | null, color: string): string | null {
  if (!choice)
    return null

  return choice.kind === 'file' ? choice.previewUrl : svgDataUrl(presetSvg(choice.name, color, 24))
}

/** Client-side check for a custom icon. Returns an error text or null. */
export function validateIconFile(file: File): string | null {
  if (!ICON_ACCEPT.split(',').includes(file.type))
    return 'Usa una imagen PNG, JPG o WebP.'
  if (file.size > ICON_MAX_BYTES)
    return 'La imagen pesa más de 2 MB.'

  return null
}

function rasterize(svg: string, size: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')

      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas 2D no disponible'))

        return
      }
      ctx.drawImage(img, 0, 0, size, size)
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo generar el PNG')), 'image/png')
    }
    img.onerror = () => reject(new Error('No se pudo cargar el ícono'))
    img.src = svgDataUrl(svg)
  })
}

/** File to send to `POST …/cards/{cardId}/icon` (field `file`). */
export async function iconChoiceToFile(choice: IconChoice, color: string): Promise<File> {
  if (choice.kind === 'file')
    return choice.file

  const blob = await rasterize(presetSvg(choice.name, color, ICON_SIZE), ICON_SIZE)

  return new File([blob], `${choice.name}.png`, { type: 'image/png' })
}
