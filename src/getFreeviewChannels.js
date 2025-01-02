import { log } from './log';

async function getChannels() {
	const formData = new FormData();
	formData.append('postcode', 'WA12 0DE');
	formData.append('address', '6');
	formData.append('op', 'Check');
	log('Calling freeview url channel checker...');
	const html = await fetch('https://www.freeview.co.uk/help/coverage-checker-results', {
		method: 'POST',
		body: formData,
	}).then((resp) => resp.text());
	log(`Start of response: ${html.substring(0, 100)}`);
	const regexp = /fv-channel-list__channel-name"[^>]*>([^<]+)</g;
	const channels = [];
	for (let match of html.matchAll(regexp)) {
		let [, nameRaw] = match;
		if (nameRaw.indexOf('*') > -1) continue;
		const name = nameRaw.replace(/\n/g, '').trim();
		const id = name.replace(/ /g, '-').toLowerCase();
		channels.push({ name, id });
	}
	return channels;
}

async function writeChannels(channels, env) {
	const db = env.FILM_DB;
	const stmt = db.prepare('INSERT INTO channels (id, name) VALUES (?1, ?2) ON CONFLICT(id) DO UPDATE SET name=excluded.name');

	const batches = channels.map((x) => stmt.bind(x.id, x.name));
	await db.batch(batches);
}

async function go(env) {
	const channels = await getChannels();
	log(`Found ${channels.length} channels`);
	if (channels && channels.length > 0) await writeChannels(channels, env);
}

export { go };
