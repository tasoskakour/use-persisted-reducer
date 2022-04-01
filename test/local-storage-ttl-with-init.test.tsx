/* eslint-disable no-await-in-loop, no-restricted-syntax */
import puppeteer from 'puppeteer';
import { getTextContent, mockDate } from './utils';

const URL =
	'http://localhost:6006/iframe.html?id=use-persisted-reducer--local-storage-with-ttl-with-init-function';

test('Local storage with init with TTL works OK', async () => {
	const browser = await puppeteer.launch();
	await mockDate(browser, new Date(2022, 3, 30, 16, 0, 0, 0));

	// Open tab 1
	const tab1 = await browser.newPage();

	await tab1.goto(URL);

	expect(await getTextContent(tab1, '#counter')).toEqual('0');
	expect(await getTextContent(tab1, '#biggerCounter')).toEqual('-10');

	await tab1.click('#increase');

	const assess = async (
		page: puppeteer.Page,
		{
			value,
			expiresAt,
			__ignoreLocalStorage,
		}: {
			value: { counter: number; biggerCounter: number };
			expiresAt: string;
			__ignoreLocalStorage?: boolean;
		}
	) => {
		expect(await getTextContent(page, '#counter')).toEqual(String(value.counter));
		expect(await getTextContent(page, '#biggerCounter')).toEqual(String(value.biggerCounter));
		if (!__ignoreLocalStorage) {
			expect(
				await page.evaluate(() =>
					window.localStorage.getItem('LocalStorageWithTTLWithInitFunction_test')
				)
			).toEqual(
				JSON.stringify({
					value: {
						counter: value.counter,
						biggerCounter: value.biggerCounter,
					},
					expiresAt,
				})
			);
		}
	};

	await assess(tab1, {
		value: { counter: 1, biggerCounter: -9 },
		expiresAt: new Date(2022, 3, 30, 16, 0, 10, 0).toISOString(),
	});

	// Open tab 2
	const tab2 = await browser.newPage();
	// Forward 15 seconds (ttl is 10 seconds)
	await mockDate(browser, new Date(2022, 3, 30, 16, 0, 15, 0));

	await tab2.goto(URL);
	await assess(tab2, {
		value: { counter: 0, biggerCounter: -10 },
		expiresAt: new Date(2022, 3, 30, 16, 0, 25, 0).toISOString(),
		__ignoreLocalStorage: true,
	});
});
