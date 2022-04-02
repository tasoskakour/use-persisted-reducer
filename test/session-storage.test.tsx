import puppeteer from 'puppeteer';
import { getTextContent } from './utils';

const URL = 'http://localhost:6006/iframe.html?id=use-persisted-reducer--session-storage';

let browser: puppeteer.Browser;
afterAll((done) => {
	browser.close();

	done();
});

test('Session storage works OK', async () => {
	browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(URL);

	expect(await getTextContent(page, '#counter')).toEqual('0');
	expect(await getTextContent(page, '#biggerCounter')).toEqual('10');

	await page.click('#increase');

	const assess = async () => {
		expect(await getTextContent(page, '#counter')).toEqual('1');
		expect(await getTextContent(page, '#biggerCounter')).toEqual('11');
		expect(
			await page.evaluate(() => window.sessionStorage.getItem('SessionStorage_test'))
		).toEqual(
			JSON.stringify({
				value: {
					counter: 1,
					biggerCounter: 11,
				},
			})
		);
	};

	await assess();
	await page.reload();
	await assess();

	await browser.close();
});
