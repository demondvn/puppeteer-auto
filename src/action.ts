import puppeteer, { Page } from "puppeteer";
import { Subject } from "rxjs";
import { URL } from "url";
import fs from 'fs-extra'

const LINKS: string[] = []
const LOADED: string[] = []
const BLOCK:string[] = [
    'login',
    'register',
    'forgot-password',
    'reset-password',
    'logout',
    'start-of-content',
    'author='
]
const sub_next = new Subject();
export function clearData(data:string) {
    LINKS.length = 0;
    LOADED.length = 0; 
    fs.removeSync(data+'/loaded.txt');

}
export async function Action(link: string,data:string,browserPath:string,baseUrl:string) {
    // console.log(process.env.BROWSER);

    const url = new URL(link);
    const domain = url.origin;
    baseUrl = baseUrl || domain;

    const browser = await puppeteer.launch({
        executablePath: browserPath || process.env.BROWSER || undefined,
        headless: false,
        defaultViewport: null,
        userDataDir: data || process.env.USER_DATA_DIR || undefined,
        args: [
            "--ignore-certificate-errors",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--userDataDir=" + (data || process.env.USER_DATA_DIR)
        ]
    })
    const page = await browser.pages().then(pages => pages[0]);
    await page.goto(link, {
        //Allow ERR_CERT_AUTHORITY_INVALID 

    });
    await delay(10000);
    //Get all Link on page save to array
    LOADED.push(link);
    await loadData(data);
    await collectLink(page, baseUrl);
    //Auto scroll to end of page with delay on step
    Scroll(page);
    sub_next.subscribe(async (next) => {
        const link = LINKS.shift();
        if (link) {
            try {
                LOADED.push(link);
                await page.goto(link);
                await delay(5000);
                await collectLink(page, baseUrl);
                await Scroll(page);
            } catch (error) {
                sub_next.next(next);
                console.log(error);
            }

        }
        writeData(data,link || '');
        if(LINKS.length === 0) {
            console.log('Done');
            await browser.close();
            // process.exit(0);
        }
    })
}
//Write file Link and Loader to file
function writeData(path:string,link:string) {
    if(!fs.existsSync(path)) fs.mkdirSync(path);
    fs.appendFileSync(path+'/loaded.txt',link+'\n');
    
}
 function loadData(path:string) {   
    if(!fs.existsSync(path+'/loaded.txt')) return;
    const loaded = fs.readFileSync(path+'/loaded.txt','utf-8').split('\n');
    LOADED.push(...loaded);
}

async function collectLink(page: Page, domain: string) {
    const links = await page.$$eval('a', as => as.map(a => a.href));
    const baseUrl = new URL( page.url()).origin;

    links.forEach(i => {
        if(!i.startsWith('http')){
            i = baseUrl+i
            console.log('Fix link: ',i);
        }
        try {
                const url = new URL(i);
            if(url && BLOCK.some(b => url.toString().includes(b))) {
                console.log('Block: ',url.href);
                
            }else if (url && url.href.startsWith(domain) && !LOADED.includes(i) && !LINKS.includes(i)) {
                LINKS.push(i);
                console.log('Add link: ',i);
            }
        } catch (error) {
            console.log('Error: ',i,error);
        }
        
    })

    console.log('Link count: ', LINKS.length);
}
async function Scroll(page: Page) {
    console.log('Scrolling', page.url());
    // Import delay to page
    //check if not exist function delay in page
    if (!await page.evaluate(() => typeof delay === 'function')) {
        await page.exposeFunction('delay', delay);
        await page.exposeFunction('randomDelay', randomDelay);
    }

    // const fn_scroll = async () => {

    // }
    // await page.exposeFunction('fn_scroll', fn_scroll);
    const scroll = await page.evaluate(async () => {

        //@ts-ignore
        const stepHight = (window.innerHeight / 2) ;
        //@ts-ignore
        const step = (document.body.scrollHeight / stepHight) -2 ;
        for (let i = 0; i < step; i++) {
            console.log('Scrolling: ', i,'/',step);
            //@ts-ignore
            window.scrollTo(0, stepHight * i);
            await randomDelay();
        }
        return true
    },)
    sub_next.next(scroll);
}

//Random delay function  
async function randomDelay() {
    await delay(Math.random() * 5000);
    Math.random() > 0.8 ? await delay(20000) : await delay(500);
}
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}