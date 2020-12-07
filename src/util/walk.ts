import fs from 'fs';
import path from 'path';

const walk = (
	dir: string,
	done: (err: Error | null, results?: string[]) => void
) => {
	var results: string[] = [];
	fs.readdir(dir, (err, list) => {
		if (err) {
			return done(err);
		}
		var pending = list.length;
		if (!pending) {
			return done(null, results);
		}
		list.forEach((file) => {
			file = path.resolve(dir, file);
			fs.stat(file, (_err, stat) => {
				if (stat && stat.isDirectory()) {
					walk(file, (_err, res) => {
						results = results.concat(res!);
						if (!--pending) done(null, results);
					});
				} else {
					results.push(file);
					if (!--pending) done(null, results);
				}
			});
		});
	});
};

export default walk;