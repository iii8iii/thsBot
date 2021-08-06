import { Page } from 'playwright-firefox';
import { zxdata } from '../types';

export const getzx = async (page: Page): Promise<zxdata[]> => {
  try {
    const getzxjson = await page.evaluate(() => {
      return fetch(
        'http://t.10jqka.com.cn/newcircle/group/getSelfStockWithMarket/'
      ).then(res => res.json());
    });

    const { errorCode, errorMsg, result } = getzxjson;
    if (errorCode) {
      console.log('ERROR OCCURED IN GETZX:', errorMsg);
      return [];
    } else {
      return result;
    }
  } catch (error) {
    console.log('ERROR OCCURED IN GETZX');
    return [];
  }
};
