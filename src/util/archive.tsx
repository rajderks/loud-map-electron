import fs from 'fs';
import archiver from 'archiver';
import walk from './walk';
import path from 'path';

const archiveDirectory = (source: string, dest: string, preview: string) =>
  new Promise<{ filePath: string }>((res) => {
    try {
      fs.unlinkSync(dest);
    } catch (e) {
      console.log(e);
    }

    const output = fs.createWriteStream(dest);
    const archive = archiver('zip');
    const dirName = path.normalize(source).split(path.sep).pop()!;

    output.on('close', () => {
      console.log(`Bytes written: ${archive.pointer()}`);
      console.log(`Archive can be found at ${dest}`);
      res({ filePath: dest });
    });

    archive.on('error', (err) => {
      try {
        fs.unlinkSync(dest);
      } catch (e) {
        console.log(e);
      }
      throw err;
    });

    archive.pipe(output);

    walk(source, (err, files) => {
      if (err) {
        throw err;
      }
      if (!files) {
        throw new Error('No files to walk through: ' + source);
      }
      for (let file of files) {
        const filePath = file.replace(source, '');

        if (
          !file.endsWith(
            preview.length > 0 ? preview : 'this-is-a-dirty-fix.asdf'
          ) &&
          (file.endsWith('.jpeg') ||
            file.endsWith('.jpg') ||
            file.endsWith('.png'))
        ) {
          continue;
        }
        const buffer = fs.createReadStream(file);
        console.warn(dirName, filePath);
        archive.append(buffer, { name: path.join(dirName, filePath) });
      }

      archive.finalize();
    });
  });

export { archiveDirectory };
