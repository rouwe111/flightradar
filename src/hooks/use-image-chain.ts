import { useLookup } from '@/hooks/use-lookup'

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.referrerPolicy = 'no-referrer'
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`No image at ${url}`))
    image.src = url
  })
}

/**
 * Tries each URL in turn. The image is only ever drawn, never read back, so
 * no CORS headers are needed.
 */
export function useImageChain(urls: Array<string>) {
  const key = urls.length ? `image:${urls.join('|')}` : null
  return useLookup<HTMLImageElement>(key, async () => {
    for (const url of urls) {
      try {
        return await loadImage(url)
      } catch {
        // Next one.
      }
    }
    return null
  }).data
}
