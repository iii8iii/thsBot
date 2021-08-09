import { getBrightness } from './getBrightness';
import jimp from 'jimp';

export async function getDistance(
  bg: { url: string; width: number },
  slider: { url: string; width: number; top: number }
): Promise<number> {
  try {
    const bgImg = (await jimp.read(bg.url)).resize(bg.width, jimp.AUTO);
    const sliderImg = (await jimp.read(slider.url)).resize(
      slider.width,
      jimp.AUTO
    );
    let result = [];
    for (let x = slider.width; x < bg.width - slider.width; x += 0.75) {
      const bgImgCp = await jimp.read(
        await bgImg.getBufferAsync(jimp.MIME_PNG)
      );
      const img = bgImgCp.blit(sliderImg, x, slider.top);
      const brightness = getBrightness(img);
      result.push({ x, brightness });
    }

    result.sort((a, b) => a.brightness - b.brightness);
    const len = result.filter((v, _, arr) => v.brightness === arr[0].brightness)
      .length;
    return result[Math.round(len / 2)].x;
  } catch (error) {
    console.error('ERROR OCURRED IN GETDISTANCE');
    return 0;
  }
}
