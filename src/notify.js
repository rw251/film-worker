const SENDER = 'Film alert <films@rw251.com>';
const DOMAIN = 'mg.rw251.com';

const constructEmail = (to, subject, text, html) => {
	const form = new FormData();
	form.append('from', SENDER);
	form.append('to', to);
	form.append('subject', subject);
	form.append('text', text);
	form.append('html', html);
	return form;
};

async function sendEmail(apiKey, message) {
	const authKey = btoa(`api:${apiKey}`);
	return fetch(`https://api.mailgun.net/v3/${DOMAIN}/messages`, {
		headers: {
			Authorization: `Basic ${authKey}`,
		},
		method: 'POST',
		body: message,
	}).then((x) => x.text());
}

function createEmails(notifications) {
	return Object.keys(notifications).map((email) => {
		const message = constructEmail(
			email,
			'Time to set the video..',
			`${notifications[email].films.map((x) => `${x.title} - ${x.channel} - ${x.time}`).join(', ')}`,
			`<p><ul>${notifications[email].films.map((x) => `<li>${x.title} is on ${x.channel} at ${x.time}</li>`).join('')}</ul></p>`
		);
		return message;
	});
}

async function sendEmails(apiKey, notifications) {
	const emails = createEmails(notifications);
	if (emails && emails.length) {
		const emailPromises = emails.map((email) => sendEmail(apiKey, email));
		console.log(`Sending ${emailPromises.length} emails`);
		const x = await Promise.all(emailPromises);
		console.log(x);
	}
}

async function getNotifications(apiKey, db) {
	const { success, results } = await db
		.prepare(
			`
    SELECT u.email, u.name, f.title, f.channel, f.time FROM users u 
    INNER JOIN filmUserLkup l ON l.user_id = u.user_id
    INNER JOIN films f ON f.imdb = l.imdb
    WHERE time IS NOT NULL AND time > datetime('now') AND u.email IS NOT NULL;`
		)
		.run();
	const notifications = {};
	if (results && results.length) {
		results.forEach(({ email, title, channel, time, name }) => {
			if (!notifications[email]) notifications[email] = { name, films: [] };
			notifications[email].films.push({ title, channel, time });
		});
	}
	await sendEmails(apiKey, notifications);
}

async function go(env) {
	const db = env.FILM_DB;
	await getNotifications(env.MAILGUN_API_KEY, db);
}

export { go };
