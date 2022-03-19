export type ItemWithExpiry = {
	value: any;
	expiresAt?: string;
};

const createStorage = (key: string, provider: Storage, ttl?: number) => ({
	set: (value: any) => {
		const item: ItemWithExpiry = {
			value,
		};
		if (ttl) {
			item.expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
		}
		provider.setItem(key, JSON.stringify(item));
	},
	get: (fallbackValue: any) => {
		const item = provider.getItem(key);
		if (!item) return fallbackValue; // Item not in storage

		try {
			const parsed = JSON.parse(item) as ItemWithExpiry;
			const { expiresAt, value } = parsed || {};
			if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
				// expired, remove from store
				console.log('EXPIRED');
				provider.removeItem(key);
				return fallbackValue;
			}

			return value;
		} catch (error) {
			console.error(error);
			return fallbackValue;
		}
	},
});

export default createStorage;
