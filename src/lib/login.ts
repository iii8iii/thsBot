import { Page, errors } from 'playwright-firefox';
import { getDistance } from './utils/getDistance';

const fillUserInfo = async (page: Page, id: string, psw: string) => {
  try {
    await page.waitForSelector('text=密码登录');
    await page.click('text=密码登录');
    await page.type('id:light=uname', id, { delay: 105 });
    await page.type('id:light=passwd', psw, { delay: 105 });
  } catch (err) {
    if (err instanceof errors.TimeoutError) {
      await page.reload();
      await fillUserInfo(page, id, psw);
    } else {
      console.error('ERROR OCCURED INF FUNCTION fillUserInfo');
    }
  }
};

const getSliderDistance = async (page: Page): Promise<number> => {
  try {
    await page.waitForTimeout(2000);
    const bg = await page.$eval('id:light=slicaptcha-img', el => {
      let url = 'https:' + el.getAttribute('src') || '';
      let width = parseFloat(el.style.width);
      return { url, width };
    });

    const slider = await page.$eval('id:light=slicaptcha-block', el => {
      let url = 'https:' + el.getAttribute('src') || '';
      let width = parseFloat(el.style.width);
      let top = parseFloat(el.style.top) - 30;
      return { url, width, top };
    });

    if (
      bg &&
      bg.url &&
      bg.width &&
      slider &&
      slider.url &&
      slider.width &&
      slider.top
    ) {
      const distance = await getDistance(bg, slider);
      return distance;
    } else {
      return await getSliderDistance(page);
    }
  } catch (err) {
    console.error('ERROR OCCURED IN FUNCTION getSliderDistance');
    return 0;
  }
};

const slide = async (page: Page, distance: number) => {
  try {
    const slider = await page.waitForSelector('#slider');
    let { x, y } = (await slider.boundingBox()) || { x: 0, y: 0 };
    x = x + Math.random() * 12;
    y = y + Math.random() * 12;

    await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 5) });
    await page.mouse.down();
    await page.mouse.move(x + distance, y, {
      steps: Math.floor(Math.random() * 5),
    });
    await page.mouse.up();
  } catch (err) {
    console.error('ERROR OCCURED IN SLIDE FUNTION');
  }
};

export const login = async (
  page: Page,
  id: string,
  password: string
): Promise<boolean> => {
  try {
    const url = 'http://upass.10jqka.com.cn/login';
    await page.goto(url);

    await fillUserInfo(page, id, password);
    await page.click('.enable_submit_btn');
    let slideDone = false;
    do {
      const distance = await getSliderDistance(page);
      await slide(page, distance);
      await page.waitForTimeout(1000);
      slideDone = !(await page.isVisible('#slider'));
    } while (!slideDone);
    //need to check if login successfully
    return true;
  } catch (err) {
    if (err instanceof errors.TimeoutError) {
      await page.reload();
      return await login(page, id, password);
    } else {
      console.error('ERROR OCCURED IN LOGIN FUNCTION');
      return false;
    }
  }
};
