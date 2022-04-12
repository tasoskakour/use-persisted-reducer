/* eslint-disable unicorn/prefer-object-from-entries, unicorn/no-array-reduce  */
export type ItemWithExpiry = {
	value: any;
	expiresAt?: string;
};

export type IStorage = {
	provider: Storage;
	set: (value: any, allowList?: string[], denyList?: string[]) => void;
	get: (fallbackValue?: any) => { value: any; isExpired: boolean };
};

const allowOrDenyValues = (values: any, allowList?: string[], denyList?: string[]) => {
	const action =
		allowList && allowList.length > 0
			? 'ALLOW'
			: denyList && denyList.length > 0
			? 'DENY'
			: 'NOP';

	if (action === 'NOP') return values;

	return Object.fromEntries(values).reduce(
		(accumulator: any, [key, value]: [string, any]) => ({
			...accumulator,
			...((action === 'ALLOW' && allowList?.includes(key)) ||
			(action === 'DENY' && !denyList?.includes(key))
				? { [key]: value }
				: {}),
		}),
		{}
	);
};

const createStorage = (key: string, provider: Storage, ttl?: number): IStorage => ({
	provider,
	set: (value: any, allowList?: string[], denyList?: string[]) => {
		const item: ItemWithExpiry = {
			value: allowOrDenyValues(value, allowList, denyList),
		};
		if (ttl) {
			item.expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
		}
		provider.setItem(key, JSON.stringify(item));
	},
	get: () => {
		const item = provider.getItem(key);
		if (!item) return { value: null, isExpired: false };

		try {
			const parsed = JSON.parse(item) as ItemWithExpiry;
			const { expiresAt, value } = parsed || {};
			if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
				return { value, isExpired: true };
			}

			return { value, isExpired: false };
		} catch (error) {
			console.error(error);
			return { value: null, isExpired: false };
		}
	},
});

export default createStorage;
