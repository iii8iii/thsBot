import { Page } from 'playwright-firefox';

export const delzx = async (page: Page, id: string, marketid: string) => {
  try {
    const url = `http://t.10jqka.com.cn/newcircle/group/modifySelfStock/?op=del&stockcode=${marketid}`;

    const addzxjson = await page.evaluate(url => {
      return fetch(url).then(res => res.json());
    }, url);
    const { errorCode, errorMsg } = addzxjson;
    if (errorCode) {
      console.log(`FAIL TO DEL ${id} FOR:`, errorMsg);
    } else {
      console.log(`DEL ${id}`);
    }
  } catch (error) {
    console.log('ERROR OCCURED IN DELZX');
  }
};
