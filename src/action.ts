import puppeteer, { Page } from "puppeteer";
import { Subject } from "rxjs";
import { URL } from "url";

const LINKS:string[] = []
const sub_next = new Subject();
export async function Action(link: string) {

    const url = new URL(link);
    const domain = url.hostname;

    const browser = await puppeteer.launch({
        executablePath: process.env.BROWSER || undefined,
        headless: false,
        defaultViewport: null,
        userDataDir: process.env.USER_DATA_DIR || undefined,
        args: [
            "--ignore-certificate-errors"
        ]
    })
    const page = await browser.pages().then(pages => pages[0]);
    await page.goto(link,{
        //Allow ERR_CERT_AUTHORITY_INVALID 

    });
    await page.waitForNetworkIdle();
    //Get all Link on page save to array
    LINKS.push(link);
    await collectLink(page, domain);
    //Auto scroll to end of page with delay on step
    Scroll(page);
    sub_next.subscribe(async (next) => {
            const link = LINKS.shift();
            if (link) {
                await page.goto(link);
                await page.waitForNetworkIdle({
                    timeout: 10000,
                    idleTime: 5000
                
                });
                await collectLink(page, domain);
                await Scroll(page);
            }
    })
}
async function collectLink(page: Page, domain: string) {
    const links = await page.$$eval('a', as => as.map(a => a.href));
    links.forEach(i => {
        const url = new URL(i);
        if (url.hostname === domain && !LINKS.includes(i)) {
            LINKS.push(i);
        }
    })
    
    console.log('Link count: ', LINKS.length);
}
async function Scroll(page: Page) {
    console.log('Scrolling',page.url());
    // Import delay to page
    //check if not exist function delay in page
    if (!await page.evaluate(() => typeof delay === 'function')) {
        await page.exposeFunction('delay', delay);
        await page.exposeFunction('randomDelay', randomDelay);
    }
    
    // const fn_scroll = async () => {
        
    // }
    // await page.exposeFunction('fn_scroll', fn_scroll);
    const scroll=await page.evaluate(async () => {
        
        //@ts-ignore
        const stepHight = window.innerHeight / 2;
        //@ts-ignore
        const step = document.body.scrollHeight / stepHight;
        for (let i = 0; i < step; i++) {
            //@ts-ignore
            window.scrollTo(0, stepHight * i);
            await randomDelay();
        }
        return true
    })
    sub_next.next(scroll);
}

//Random delay function  
async function randomDelay() {
    await Math.random() * 10000 * 10;
    Math.random() > 0.9 ? await delay(20000) : await delay(500);
}
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}