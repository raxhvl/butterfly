export enum Simulation {
	ConsumeRLP = "consume-rlp",
	ConsumeEngine = "consume-engine",
}

export const config = {
	currentFork: "glamsterdam",
	animations: {
		// CountUp and ProgressBanner animation timings
		duration: 2, // seconds
		delay: 0.5, // seconds
	},
	api: {
		cache: {
			// Client-side cache duration (Cache-Control: max-age)
			// How long browsers should cache the response before revalidating
			maxAge: 300, // 5 minutes in seconds

			// CDN cache duration (Cache-Control: s-maxage)
			// How long CDNs (like Vercel Edge) should cache the response
			// Longer than maxAge since CDN can serve stale content while revalidating
			staleWhileRevalidate: 3600, // 1 hour in seconds
		},
	},
	hive: {
		// See: https://eest.ethereum.org/main/running_tests/hive/common_options/
		parallelism: 4,
		// Hive output directory structure: .hive/{eipNumber}/{simulation}
		outputDir: '.hive',
	},
};
