/**
 * It returns a promise that resolves to an image element when the image has loaded
 * @param {string} imageSource - The URL of the image to load.
 * @returns A promise that resolves to an HTMLImageElement.
 */
export async function loadImage(imageSource: string): Promise<HTMLImageElement> {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = imageSource;
  });
}
