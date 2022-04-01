import puppeeteer from 'puppeteer';

export const getTextContent = (page: puppeeteer.Page, selector: string) =>
	page.$eval(selector, (element) => element.textContent);

let activated = false;
export const mockDate = async (browser: puppeeteer.Browser, date: Date) => {
	const callback = async (target: any) => {
		const targetPage = (await target.page()) as puppeeteer.Page;
		const clientAttached = await targetPage.target().createCDPSession();
		await clientAttached.send('Runtime.evaluate', {
			expression: `Date.now = function() { return ${date.getTime()}; }`,
		});
	};

	if (activated) {
		browser.off('targetchanged', callback);
	}

	activated = true;
	return browser.on('targetchanged', callback);
};
