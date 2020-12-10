import fs from 'fs';
import path from 'path';
import parseLUA from '../../util/parseLUA';
import Jimp from 'jimp';
// import { stringify } from 'querystring';

interface MapMarker {
  type: 'Mass' | 'Hydrocarbon' | 'BlankMarker';
  position: string;
}

const IMAGE_SIZE = 1024.0;
// const MARKER_SIZE = 20.0;
// const MARKER_RATIO = MARKER_SIZE / IMAGE_SIZE;
const IMAGE_MASS = require('../../assets/mass.png');
const IMAGE_HYDRO = require('../../assets/hydro.png');
const IMAGE_ARMY = require('../../assets/army.png');

const commandMapPreview = async (
  source: string,
  previewPath: string,
  cb: (path: string) => void,
  destination: string = 'marked_preview.jpg'
) => {
  if (!source || !source?.length) {
    throw new Error('No source folder given');
  }

  const dirStat = fs.statSync(source);
  const dir = dirStat.isDirectory() ? source : path.dirname(source);
  const paths = {
    save: '',
    preview: previewPath,
    scenario: '',
  };
  const dirContent = fs.readdirSync(dir);

  dirContent.forEach((file) => {
    if (file.toLowerCase().endsWith('_save.lua')) {
      paths.save = path.join(dir, file);
    }
    if (file.toLowerCase().endsWith('scenario.lua')) {
      paths.scenario = path.join(dir, file);
    }
  });
  if (!paths.save.length) {
    throw new Error('no _save.lua found: ' + JSON.stringify(dirContent));
  }
  if (!paths.scenario.length) {
    throw new Error('no _scenario.lua found: ' + JSON.stringify(dirContent));
  }
  const [width, height]: number[] = fs
    .readFileSync(paths.scenario)
    .toString()
    .match(/size.*\{(.*)\}/)?.[1]
    .split(',')
    .map((x) => Number.parseInt(x.trim(), 10))!;
  if (!width || !height) {
    throw new Error(
      `Could not extract mapSize from scenario.lua: [${width}, ${height}]`
    );
  }

  const largest = width >= height ? width : height;

  const offsets = determineOffsets(width, height);

  // debug code
  // parseLUA(paths.save, path.join(dir, 'floep.json'));
  const saveJSON = JSON.parse(parseLUA(paths.save)!);

  const markers: Record<string, any> =
    saveJSON.MasterChain['_MASTERCHAIN_'].Markers;
  const markersFiltered = Object.entries(markers).reduce(
    (
      acc: {
        mass: MapMarker[];
        hydro: MapMarker[];
        army: MapMarker[];
      },
      marker: [string, MapMarker]
    ) => {
      const [key, val] = marker;
      if (val.type.toLowerCase() === 'mass') {
        acc.mass.push(val);
      } else if (val.type.toLowerCase() === 'hydrocarbon') {
        acc.hydro.push(val);
      } else if (
        val.type.toLowerCase() === 'blankmarker' &&
        key.toLowerCase().startsWith('army')
      ) {
        acc.army.push(val);
      }
      return acc;
    },
    { mass: [], hydro: [], army: [] }
  );
  console.warn('jimp', paths);

  const massJimp = await Jimp.read(IMAGE_MASS);
  const hydroJimp = await Jimp.read(IMAGE_HYDRO);
  const armyJimp = await Jimp.read(IMAGE_ARMY).then((image) => {
    image.scale(1.5);
    return image;
  });

  const imageBuffer = fs.readFileSync(paths.preview);
  console.warn('buffa', imageBuffer);
  // @ts-ignore
  Jimp.read(imageBuffer.buffer).then((image: Jimp) => {
    image.resize(IMAGE_SIZE, IMAGE_SIZE, (error) => {
      if (error) {
        throw error;
      }
      markersFiltered.mass.forEach((m) => {
        const coords = luaPositionToCoords(
          m.position,
          width,
          height,
          largest,
          offsets
        );
        composeImage(image, massJimp, coords);
      });
      markersFiltered.hydro.forEach((m) => {
        const coords = luaPositionToCoords(
          m.position,
          width,
          height,
          largest,
          offsets
        );
        composeImage(image, hydroJimp, coords);
      });
      markersFiltered.army.forEach((m) => {
        const coords = luaPositionToCoords(
          m.position,
          width,
          height,
          largest,
          offsets
        );
        composeImage(image, armyJimp, coords);
      });
      try {
        fs.unlinkSync(path.join('./', dir, destination));
      } catch (e) {
        // console.error(e);
      }
      image.getBufferAsync(image.getMIME()).then((imageBuffer) => {
        fs.writeFileSync(path.join(dir, destination), imageBuffer);
        cb(path.join(dir, destination));
      });
      console.log('Jobs done!');
    });
  });

  console.warn(Object.values(markersFiltered).map((x) => x.length));
};

const luaPositionToCoords = (
  position: string,
  width: number,
  height: number,
  largest: number,
  offsets: { x: number; y: number }
) => {
  const coords = position.split(',');

  return {
    x: (offsets.x + Number.parseFloat(coords[0]) / largest) * 1024,
    y: (offsets.y + Number.parseFloat(coords[2]) / largest) * 1024,
  };
};

const composeImage = (
  src: Jimp,
  dest: Jimp,
  coords: { x: number; y: number }
) =>
  src.composite(
    dest,
    coords.x - dest.getWidth() / 2,
    coords.y - dest.getHeight() / 2
  );

const determineOffsets = (width: number, height: number) => {
  let xOffset = 0;
  let yOffset = 0;

  if (width > height) {
    const factor = height / width;
    yOffset = 0.5 * factor;
  } else if (width < height) {
    const factor = width / height;
    xOffset = 0.5 * factor;
  }
  return { x: xOffset, y: yOffset };
};

export default commandMapPreview;
