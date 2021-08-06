import jimp from 'jimp';
import fsex from 'fs-extra';
import path from 'path';
import { getBrightness } from './getBrightness';
/**
 * get Absolute file path
 * @param {string} filePath
 * @returns
 */
const joinPath = (filePath: string) => path.join(__dirname, filePath);

export interface sliderObj {
  url: string;
  width: number;
  top?: number;
}

export interface briObj {
  bri: number;
  x: number;
}
/**
 *
 * @param {string,background picture information with url property} bg
 * @param {strin, slider picture information with url property} slider
 * @param {strin} y
 * @returns
 */
const blit = async (
  bg: sliderObj,
  slider: sliderObj,
  y: number
): Promise<string[]> => {
  try {
    (await jimp.read(bg.url))
      .resize(bg.width, jimp.AUTO)
      .write(joinPath('tmp/bg.png'));

    (await jimp.read(slider.url))
      .resize(slider.width, jimp.AUTO)
      .write(joinPath('tmp/slider.png'));
    let result = [];
    for (let x = slider.width; x < bg.width - slider.width; x += 1.75) {
      const image = await jimp.read(joinPath('tmp/bg.png'));
      const parrot = await jimp.read(joinPath('tmp/slider.png'));
      const fileName = joinPath(`tmp/${x}.png`);
      image.blit(parrot, x, y).write(fileName);
      result.push(fileName);
    }
    return result;
  } catch (err) {
    console.error('blit:', err);
    return [];
  }
};

/**
 * 使用背景图和滑块图在一定的范围内按一定的滑动间距合成一组新图片
 * 新图片以其滑动的距离命名并存入数组
 * 请出每个新图片亮度形成新的数组
 * 将新数组从小到大排序
 * 获取最小亮度在数组中的序号
 * 找到图片数组中对应序号的文件名（滑动距离）
 * 按这个距离滑动
 * @param {*} arg
 * @returns
 */
export const sliderHelper = async (arg: {
  bg: sliderObj;
  slider: sliderObj;
  y: number;
}) => {
  try {
    const { bg, slider, y } = arg;
    const fileArr = await blit(bg, slider, y);

    let briArr: briObj[] | undefined = [];

    //drop last image,because bug of jimp
    for (let i = 0; i < fileArr.length - 1; i++) {
      const item = fileArr[i];
      const xarr = item.match(/\d+(\.\d+)?/g);
      const x = xarr ? Number(xarr[0]) : 0;
      const bri = await getBrightness(item);
      briArr.push({
        bri,
        x,
      });
    }

    briArr.sort((a: briObj, b: briObj) => a.bri - b.bri);
    const len = briArr.filter((v, _, arr) => v.bri === arr[0].bri).length;
    const result = briArr[Math.round(len / 2)].x;

    await fsex.remove(joinPath('tmp'));

    return result;
  } catch (err) {
    console.error('sliderHelper:', err);
    return 0;
  }
};
