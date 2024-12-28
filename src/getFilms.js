const services = {
	// nextfilm: 'nextfilm',
	// tvfilms: 'tvfilms',
	tvfilmapi: 'tvfilmapi',
};

// Change this to use a different service
const service = services.tvfilmapi;

const url = {
	// nextfilm: 'https://nextfilm.uk/',
	// tvfilms: 'https://www.tv-films.co.uk/',
	tvfilmapi: ['https://www.tv-films.co.uk/api/shows/', 'https://www.tv-films.co.uk/api/shows2/'],
};

const request = {
	// nextfilm: (id) => ({
	//   url: `${url.nextfilm}?id=${id}`,
	//   headers: {
	//     'User-Agent': 'Request-Promise',
	//     Host: 'nextfilm.uk',
	//   },
	// }),
	// tvfilms: () => url.tvfilms,
	tvfilmapi: (id, backup) => (backup ? { url: url.tvfilmapi[1], json: true } : { url: url.tvfilmapi[0], json: true }),
};

const filmClass = {
	// nextfilm: '.listentry',
	tvfilms: '.Freeview',
};

const validate = {
	// nextfilm: (film, date) => {
	//   if (!film.imdb || film.imdb[0] !== 't' || film.imdb[1] !== 't')
	//     return false;
	//   if (!film.time || film.time.indexOf('-') < 0) return false;
	//   film.time = `${date} ${film.time.split('-')[0].replace(/ /g, '')}:00`;

	//   // Check it's still today
	//   const actualDateInMS = new Date(date).getTime();
	//   const actualTimeInMS = new Date(film.time).getTime();
	//   if (Math.abs(actualDateInMS - actualTimeInMS) > 48 * 60 * 60 * 1000)
	//     return false;

	//   // Check the year is a year
	//   if (!/^[12][0-9]{3}$/.test(film.year)) film.year = '????';

	//   film.imdb = film.imdb.slice(2);
	//   return film;
	// },
	// tvfilms: (film) => {
	//   if (!film.imdb || film.imdb[0] !== 't' || film.imdb[1] !== 't')
	//     return false;
	//   if (!film.time) return false;
	//   film.time = new Date(film.time)
	//     .toISOString()
	//     .replace(/[TZ]/g, ' ')
	//     .substr(0, 19);

	//   // Check the year is a year
	//   if (!/^[12][0-9]{3}$/.test(film.year)) film.year = '????';

	//   film.imdb = film.imdb.slice(2);
	//   return film;
	// },
	tvfilmapi: (film) => {
		if (!film.imdb || film.imdb[0] !== 't' || film.imdb[1] !== 't') return false;
		if (!film.time) return false;
		film.time = new Date(film.time).toISOString().replace(/[TZ]/g, ' ').substring(0, 19);

		// Check the year is a year
		if (!/^[12][0-9]{3}$/.test(film.year)) film.year = '????';

		film.imdb = film.imdb.slice(2);
		return film;
	},
};

const isHtml = {
	// nextfilm: true,
	// tvfilms: true,
	tvfilmapi: false,
};

const getFilm = {
	// nextfilm: (node, date) => {
	//   try {
	//     const film = {
	//       channel: $('.chanbox img', node).attr('title'),
	//       title: $('a.title', node).text(),
	//       year: $('i', node)[0].childNodes[0].data.substr(1, 4),
	//       time: $('span.time strong', node).text(),
	//       imdb: $('.imdb a.ib:contains(IMDb)', node).attr('href').split('/')[4],
	//     };
	//     return validate.nextfilm(film, date);
	//   } catch (e) {
	//     return false;
	//   }
	// },
	// tvfilms: (node) => {
	//   try {
	//     const film = {
	//       channel: $(node).attr('channel'),
	//       title: $(node).attr('title'),
	//       year: $(node).attr('year'),
	//       time: $(node).attr('showtime'),
	//       imdb: $('.imdbRatingPlugin', node).attr('data-title'),
	//     };
	//     return validate.tvfilms(film);
	//   } catch (e) {
	//     return false;
	//   }
	// },
};

let filmObj = {};

const processHtml = {
	// nextfilm: (html) => {
	//   return $(filmClass.nextfilm, html).map((x, y) => getFilm.nextfilm(y, date));
	// },
	// tvfilms: (html) => {
	//   return $(filmClass.tvfilms, html).map((x, y) => getFilm.tvfilms(y, date));
	// },
};

const processJson = {
	tvfilmapi: (json) => {
		if (!json || !json.shows || json.shows.length === 0) {
			// throw error
		}
		let channels = {};
		if (json.channels.forEach) {
			json.channels.forEach((channel) => {
				channels[channel.id] = channel.name;
			});
		} else {
			Object.keys(json.channels).forEach((c) => {
				channels[json.channels[c].id] = json.channels[c].name;
			});
		}
		let shows = [];
		if (json.shows.forEach) {
			shows = json.shows;
		} else {
			shows = Object.keys(json.shows).map((k) => {
				return { id: k, ...json.shows[k] };
			});
		}
		return shows
			.map((show) => {
				if (!json.films[show.f]) return false;
				const channelId = show.channel_id || show.c || show.cs[0];
				if (!show.link && (!channelId || !channels[channelId])) return false;
				const film = {
					channel: channelId ? channels[channelId] : show.link, // now includes iplayer shows
					title: json.films[show.f].title,
					year: json.films[show.f].year,
					time: show.time,
					imdb: json.films[show.f].imdb,
				};
				return validate.tvfilmapi(film);
			})
			.filter(Boolean);
	},
};

async function getFilms(id) {
	const { url, ...config } = request[service](id);
	const htmlOrJSON = await fetch(url, config)
		.catch(() => {
			// Try the backup url
			const { url2, ...config2 } = request[service](id, true);
			return fetch(url2, config2);
		})
		.then((x) => x.text());
	let films = isHtml[service] ? processHtml[service](htmlOrJSON) : processJson[service](JSON.parse(htmlOrJSON));
	films = Array.from(films);
	films = films
		.filter((x) => x)
		.forEach((film) => {
			if (!filmObj[film.imdb] || film.time > filmObj[film.imdb].time) {
				filmObj[film.imdb] = film;
			}
		});
}

const timeToRemoveFrom = () => {
	const now = new Date();
	now.setHours(now.getHours() - 4);
	return now
		.toISOString()
		.split('T')
		.reduce((date, time) => date + ' ' + time.substring(0, 5));
};

// This can be used to delete films on in the past,
// but for now let's not implement it and see how
// storage gets used
async function tidyFilms(env) {
	// const batch = admin.firestore().batch();
	// return admin
	//   .firestore()
	//   .collection(config.collections.films)
	//   .where('time', '<', timeToRemoveFrom())
	//   .get()
	//   .then((snapshot) => {
	//     snapshot.docs.forEach((doc) => {
	//       if (!doc.data().users || Object.keys(doc.data().users).length === 0) batch.delete(doc.ref);
	//     });
	//     return batch.commit();
	//   });
}

async function insertNewFilms(films, db) {
	const stmt = db.prepare(
		'INSERT INTO films (imdb, channel, time, title, year) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT(imdb) DO UPDATE SET channel=excluded.channel, time=excluded.time, title=excluded.title, year=excluded.year'
	);
	const batches = films.map((x) => stmt.bind(x.imdb, x.channel, x.time, x.title, x.year));
	console.log(`About to insert/update ${films.length} films...`);
	const result = await db.batch(batches);
}

let channels;
let altChannelNames;
async function populateLookup(db) {
	const stmtChannels = db.prepare('SELECT * FROM channels');
	const stmtAltChannels = db.prepare('SELECT * FROM altChannelNames');
	const stmtNonFilmChannels = db.prepare('SELECT * FROM nonFilmChannels');

	const batch = [stmtChannels, stmtAltChannels, stmtNonFilmChannels];
	const [resultChannels, resultAltChannelNames, resultNonFilmChannels] = await db.batch(batch);
	channels = {};
	resultChannels.results.forEach(({ name }) => (channels[name.toUpperCase()] = 1));
	channels.IPLAYER = 1;
	channels.MY5 = 1;
	altChannelNames = {};
	resultAltChannelNames.results.forEach(({ altName, name }) => (altChannelNames[altName] = name));
	resultNonFilmChannels.results.forEach(({ name }) => delete channels[name]);
}

const unknown = {};
function channelChecker(films) {
	return films
		.map((film) => {
			film.channel = altChannelNames[film.channel] || film.channel;
			if (channels[film.channel.toUpperCase()]) {
				channels[film.channel.toUpperCase()] = 2;
				return film;
			} else {
				unknown[film.channel] = true;
				return false;
			}
		})
		.filter(Boolean);
}

async function go(env) {
	const db = env.FILM_DB;
	filmObj = {};

	try {
		//await tidyFilms(env);
		await populateLookup(db);
		await getFilms(0);
		let films = Object.keys(filmObj).map((id) => filmObj[id]);
		films = channelChecker(films);
		//console.log(Object.keys(unknown));
		await insertNewFilms(films, db);
	} catch (err) {
		console.log(err);
	} finally {
		console.log('done');
	}
}
export { go };
