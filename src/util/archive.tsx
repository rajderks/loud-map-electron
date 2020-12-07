import fs from 'fs';
import archiver from 'archiver';
import walk from './walk';

const archiveDirectory = (source: string, dest: string) => new Promise<{ filePath: string}>((res) => {
	try {
		fs.unlinkSync(dest);
	} catch(e) {
		console.log(e);
	}

	const output = fs.createWriteStream(dest);
	const archive = archiver('zip');

	output.on('close', () => {
		console.log(`Bytes written: ${archive.pointer()}`);
		console.log(`Archive can be found at ${dest}`);
		res({ filePath: dest })
	});

	archive.on('error', (err) => {
		try {
			fs.unlinkSync(dest);
		} catch(e) {
			console.log(e);
		}
		throw err;
	});

	archive.pipe(output);

	walk(source, (err, files) => {
		if(err) {
			throw err;
		}
		if(!files) {
			throw new Error('No files to walk through: ' + source);
		}
		for(let file of files) {
			const filePath = file.replace(source, '');
			if(file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png')) {
				continue;
			}
			const buffer = fs.createReadStream(file);
			archive.append(buffer, { name: filePath});
		}
		
		archive.finalize();
	});
})

export { archiveDirectory }