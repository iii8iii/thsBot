import jimp from 'jimp';

export async function getBrightness(src: string): Promise<number> {
  try {
    const p = new Promise((resolve, reject) => {
      jimp.read(src, function(err, img) {
        if (err) {
          reject(err);
        }
        let avgR = 0;
        let avgG = 0;
        let avgB = 0;
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(
          x,
          y,
          idx
        ) {
          avgR += this.bitmap.data[idx + 0];
          avgG += this.bitmap.data[idx + 1];
          avgB += this.bitmap.data[idx + 2];
          if (x === img.bitmap.width - 1 && y === img.bitmap.height - 1) {
            // image scan finished, do your stuff
          }
        });
        let pixels = img.bitmap.width * img.bitmap.height;
        avgR = avgR / pixels;
        avgG = avgG / pixels;
        avgB = avgB / pixels;

        let brightness: number = Math.floor((avgR + avgG + avgB) / 3);
        resolve(brightness);
      });
    });

    return (await p) as number;
  } catch (error) {
    console.log('error:', error);
    return 0;
  }
}
