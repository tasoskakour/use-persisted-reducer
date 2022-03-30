export type ItemWithExpiry = {
	value: any;
	expiresAt?: string;
};

export type IStorage = {
	provider: Storage;
	set: (value: any) => void;
	get: (fallbackValue?: any) => { value: any; isExpired: boolean };
};

const createStorage = (key: string, provider: Storage, ttl?: number): IStorage => ({
	provider,
	set: (value: any) => {
		const item: ItemWithExpiry = {
			value,
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
