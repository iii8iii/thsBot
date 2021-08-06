import { Page } from 'playwright-firefox';

export const addzx = async (page: Page, id: string): Promise<void> => {
  try {
    const url = `http://t.10jqka.com.cn/newcircle/group/modifySelfStock/?op=add&stockcode=${id}`;

    const addzxjson = await page.evaluate(url => {
      return fetch(url).then(res => res.json());
    }, url);
    const { errorCode, errorMsg } = addzxjson;
    if (errorCode) {
      console.log(`FAIL TO ADD ${id} FOR:`, errorMsg);
    } else {
      console.log(`ADD ${id}`);
    }
  } catch (error) {
    console.log('ERROR OCCURED IN ADDZX');
  }
};
