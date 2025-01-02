let logs = [];

async function trimLogs(env) {
	const db = env.FILM_DB;
	await db.prepare("DELETE FROM logs WHERE timestamp < DATETIME('now', '-7 day')").run();
}

function log(message) {
	logs.push(message);
}

function startLogging() {
	logs = [];
}

async function saveLogs(env) {
	if (logs.length === 0) return;
	const db = env.FILM_DB;
	const stmt = db.prepare('INSERT INTO logs (message) VALUES (?1)'); //.bind(message);
	const batches = logs.map((message) => stmt.bind(message));
	const result = await db.batch(batches);
}

async function getLogs(env) {
	const db = env.FILM_DB;
	const { results } = await db
		.prepare("SELECT message, timestamp FROM logs WHERE timestamp > DATETIME('now', '-10 minutes') ORDER BY timestamp DESC")
		.run();
	if (results && results.length) {
		return results;
	}
	return [{ message: 'No logs found.', timestamp: new Date() }];
}

export { log, getLogs, startLogging, saveLogs };
