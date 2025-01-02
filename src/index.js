import { go as getChannels } from './getFreeviewChannels';
import { go as getFilms } from './getFilms';
import { go as notify, sendLogs } from './notify';
import { startLogging, log, saveLogs } from './log';

export default {
	// Useful for testing without waiting for cron job
	// async fetch(request, env, ctx) {
	// 	startLogging();
	// 	try {
	// 		await notify(env);
	// 		await saveLogs(env);
	// 		await sendLogs(env);
	// 		return new Response(JSON.stringify({ success: true }));
	// 	} catch (err) {
	// 		log(err);
	// 		await saveLogs(env);
	// 		await sendLogs(env);
	// 		return new Response(err.message);
	// 	}
	// },
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.

	async scheduled(event, env, ctx) {
		startLogging();
		// Not ideal but you can have multiple cron jobs running on different schedules
		// and select the correct one based on cron string
		let isNotification = false;

		try {
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
					isNotification = true;
					await notify(env);
					break;
				default:
					log('No matching cron');
				// case "*/10 * * * *":
				// 	// Every ten minutes
				// 	await updateAPI2();
				// 	break;
				// case "*/45 * * * *":
				// 	// Every forty-five minutes
				// 	await updateAPI3();
				// 	break;
			}
		} catch (e) {
			log('Error occurred');
			log(e);
		}
		log('cron processed');
		await saveLogs(env);

		if (isNotification) {
			await sendLogs(env);
		}
	},
};
