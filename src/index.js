import { go as getChannels } from './getFreeviewChannels';
import { go as getFilms } from './getFilms';

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.

	async scheduled(event, env, ctx) {
		// Not ideal but you can have multiple cron jobs running on different schedules
		// and select the correct one based on cron string
		switch (event.cron) {
			case '5 11 * * *':
				// at 11:45 every two days
				await getChannels(env);
				break;
			case '30 */8 * * *':
				// at half past every 8th hour
				await getFilms(env);
				break;
			default:
				console.log('No matching cron');
			// case "*/10 * * * *":
			// 	// Every ten minutes
			// 	await updateAPI2();
			// 	break;
			// case "*/45 * * * *":
			// 	// Every forty-five minutes
			// 	await updateAPI3();
			// 	break;
		}
		console.log('cron processed');
	},
};
