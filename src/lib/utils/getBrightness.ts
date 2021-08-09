import jimp from 'jimp';

export function getBrightness(source: jimp): number {
  try {
    let avgR = 0;
    let avgG = 0;
    let avgB = 0;
    source.scan(0, 0, source.bitmap.width, source.bitmap.height, function(
      x,
      y,
      idx
    ) {
      avgR += this.bitmap.data[idx + 0];
      avgG += this.bitmap.data[idx + 1];
      avgB += this.bitmap.data[idx + 2];
      if (x === source.bitmap.width - 1 && y === source.bitmap.height - 1) {
        // image scan finished, do your stuff
      }
    });
    let pixels = source.bitmap.width * source.bitmap.height;
    avgR = avgR / pixels;
    avgG = avgG / pixels;
    avgB = avgB / pixels;
    return Math.floor((avgR + avgG + avgB) / 3);
  } catch (error) {
    console.log('error:', error);
    return 0;
  }
}
