const puppeteer = require('puppeteer');
const ora = require('ora');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

function writeFileSync (name, data) {
    fs.writeFileSync(path.resolve(__dirname, name), `module.exports=[\n${data}]`);
}

const spinner = ora({
    color: 'yellow'
});


const target = 'https://github.com/#{route}';
let url = '';

async function getTrendingLangs (page) {
    url = target.replace('#{route}', 'trending');
    await page.goto(url);

    const langs = await page.evaluate(() => {
        const list = [...document.querySelectorAll('.select-menu-list .select-menu-item span')];
        const filters = ['today', 'this week', 'this month'];
        const res = [];

        list.forEach(el => {
            if (filters.includes(el.innerText)) {
                return;
            }

            res.push(`"${el.innerText}"\n`);
        });
        return res;
    });

    return langs;
}

process.on('unhandledRejection', (err) => {
    console.log('\n', chalk.red(`抓取数据失败，失败链接: ${url}\n`), err.message);
    process.exit(1);
});

(async () => {
    spinner.start(chalk.blue('开始抓取数据....'));

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const res = await getTrendingLangs(page);

    writeFileSync('langs.js', res);
    spinner.succeed(chalk.green('数据抓取完毕'));

    await browser.close();
})();