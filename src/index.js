import { go as getChannels } from './getFreeviewChannels';
import { go as getFilms } from './getFilms';
import { go as notify } from './notify';

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.

	async scheduled(event, env, ctx) {
		// Not ideal but you can have multiple cron jobs running on different schedules
		// and select the correct one based on cron string
		switch (event.cron) {
			case '5 11 * * *':
				// at 11:05 every day
				await getChannels(env);
				break;
			case '30 */8 * * *':
				// at half past every 8th hour
				await getFilms(env);
				break;
			case '2 10 * * *':
				// at 10:02 every day
				await notify(env);
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
