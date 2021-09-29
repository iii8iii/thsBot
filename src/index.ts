import { BrowserContext, Page } from 'playwright-firefox';
import { WechatBot } from '@iii8iii/wechatbot';
import { difference } from 'lodash';
import { zxItem } from './types';
import { login } from './lib/login';
import { getzx } from './lib/getzx';
import { addzx } from './lib/addzx';
import { delzx } from './lib/delzx';

export class thsBot {
  private ctx: BrowserContext;
  private page: Page | undefined;
  private isLogining: boolean;
  private logined: boolean;
  public id: string;
  private password: string;
  private zx: zxItem[] = [];
  private bot?: WechatBot;
  constructor(
    ctx: BrowserContext,
    id: string,
    password: string,
    bot?: WechatBot
  ) {
    this.isLogining = false;
    this.logined = false;
    this.id = id;
    this.password = password;
    this.ctx = ctx;
    this.bot = bot;
  }

  private async ready() {
    let ps = this.ctx.pages();
    this.page = this.page
      ? this.page
      : ps.length
        ? ps[0]
        : await this.ctx.newPage();
    if (!this.logined) {
      if (!this.isLogining) {
        await this.login();
      }
    }
    const toBeReady = new Promise<void>(resolve => {
      if (this.logined) {
        resolve();
      }
    });
    await toBeReady;
    // sendMsg('ths ready');
  }

  private async login(): Promise<void> {
    try {
      this.isLogining = true;
      this.logined = await login(this.page as Page, this.id, this.password);
      this.isLogining = false;
      // sendMsg('ths login');
      await this.page?.goto('http://t.10jqka.com.cn');
    } catch (error) {
      this.isLogining = false;
      console.log('ERROR OCCURED IN THS LOGIN');
    }
  }

  private async getzxCodes(): Promise<string[]> {
    try {
      const zxObjArr: zxItem[] = this.zx.length
        ? this.zx
        : await getzx(this.page as Page);
      this.zx = zxObjArr;
      let zxCodes: string[] = [];
      zxObjArr.forEach((item: { code: string; }) => {
        zxCodes.push(item.code);
      });
      return zxCodes;
    } catch (error) {
      console.log('ERROR OCCURED IN THS GETZX');
      return [];
    }
  }
  private async addzx(codes: string[]): Promise<void> {
    try {
      for (let i = 0; i < codes.length; i++) {
        await addzx(this.page as Page, codes[i]);
      }
    } catch (error) {
      console.log('ERROR OCCURED IN THS ADDZX');
    }
  }
  private async delzx(codes?: string[]): Promise<void> {
    try {
      if (codes) {
        const zxObjArr: zxItem[] = this.zx.length
          ? this.zx
          : await getzx(this.page as Page);
        for (let i = 0; i < codes.length; i++) {
          const code = codes[i];
          const mkidObjArr = zxObjArr.filter(item => item.code === code);
          const mkidObj = mkidObjArr[0];
          const marketid = mkidObj ? `${mkidObj.code}_${mkidObj.marketid}` : '';
          if (marketid) {
            await delzx(this.page as Page, code, marketid);
          }
        }
      } else {
        codes = await this.getzxCodes();
        await this.delzx(codes);
      }
    } catch (error) {
      console.log('ERROR OCCURED IN THS DELZX');
    }
  }

  async update(stocks: string[], Delimiter?: string): Promise<void> {
    try {
      if (this.isLogining) {
        return;
      }

      await this.ready();

      const zx = await this.getzxCodes();
      console.log('zx', zx);

      const toAdd = difference(stocks, zx);
      let toDel = difference(zx, stocks);

      if (Delimiter) {
        const i = zx.findIndex((v => v === Delimiter));
        console.log('i:', i);

        if (i >= 0) {
          toDel = difference(toDel, zx.slice(0, i + 1));
        }
      }

      console.log('xxx:', stocks, 'ta:', toAdd, 'td:', toDel, 'de:', Delimiter);

      if (toDel.length) {
        await this.delzx(toDel);
      }

      if (toAdd.length) {
        await this.addzx(toAdd);
      }

      this.zx = await getzx(this.page as Page);
      this.bot?.sendMsg(`Ths updated\nZX:${this.zx.length}`);
    } catch (err) {
      console.log('ERROR OCURRED IN UPDATE', err);
    }
  }
}
