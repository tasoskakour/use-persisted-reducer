import puppeteer from 'puppeteer';
import { getTextContent } from './utils';

const URL =
	'http://localhost:6006/iframe.html?id=use-persisted-reducer--local-storage-no-ttl-with-init-function';

test('Local storage with init function works OK', async () => {
	const browser = await puppeteer.launch();
	const tab1 = await browser.newPage();
	await tab1.goto(URL);

	expect(await getTextContent(tab1, '#counter')).toEqual('0');
	expect(await getTextContent(tab1, '#biggerCounter')).toEqual('-10');

	await tab1.click('#increase');

	const assess = async (
		page: puppeteer.Page,
		{ value }: { value: { counter: number; biggerCounter: number } }
	) => {
		expect(await getTextContent(page, '#counter')).toEqual(String(value.counter));
		expect(await getTextContent(page, '#biggerCounter')).toEqual(String(value.biggerCounter));
		expect(
			await page.evaluate(() =>
				window.localStorage.getItem('LocalStorageNoTTLWithInitFunction_test')
			)
		).toEqual(
			JSON.stringify({
				value: {
					counter: value.counter,
					biggerCounter: value.biggerCounter,
				},
			})
		);
	};

	await assess(tab1, {
		value: { counter: 1, biggerCounter: -9 },
	});

	// Open tab 2
	const tab2 = await browser.newPage();
	await tab2.goto(URL);
	await assess(tab2, {
		value: { counter: 1, biggerCounter: -9 },
	});

	// Change something on tab1 and see it reflected on tab2
	await tab1.click('#increase');
	await assess(tab1, {
		value: { counter: 2, biggerCounter: -8 },
	});
	await assess(tab2, {
		value: { counter: 2, biggerCounter: -8 },
	});
});
