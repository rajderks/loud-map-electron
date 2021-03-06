import fs from 'fs';
import { mapSizeToValue } from '../containers/maps/utils';
import { ScenarioLUA } from './types';

const parseScenario = (source: string): ScenarioLUA => {
  const scenarioInfo = fs.readFileSync(source).toString();
  console.warn(scenarioInfo);
  const author = /author\s*=\s*"?([^"]*)/gim.exec(scenarioInfo)?.[1];
  const description = /description\s*=\s*"?([^"]*)/gim.exec(scenarioInfo)?.[1];
  const map_version = String(
    /map_version\s*=\s*["']*([^"'}{,]*),?\n?/gim.exec(scenarioInfo)?.[1]
  );
  const name = /name\s*=\s*"?([^"]*)/gim.exec(scenarioInfo)?.[1];
  const size = /size\s*=\s*"?{(\d*)/gim.exec(scenarioInfo)?.[1];

  const players = /armies.*{([a-zA-Z0-9|\s|\w|\S]*?)}/gim
    .exec(scenarioInfo)?.[1]
    ?.split(',')?.length;
  let preview = /preview\s*=\s*"?'?([^"']*,?)/gim.exec(scenarioInfo)?.[1] ?? '';

  // if (!author) {
  //   throw new Error(`author missing. ${author}`);
  // }

  // if (!description) {
  //   throw new Error(`description missing. ${description}`);
  // }

  // if (!map_version) {
  //   throw new Error(`map_version missing. ${map_version}`);
  // }

  // if (!name) {
  //   throw new Error(`name missing. ${name}`);
  // }

  // if (!size) {
  //   throw new Error(`size missing. ${size}`);
  // }
  const sizeValue = mapSizeToValue(Number.parseInt(size ?? '256'));
  if (!sizeValue) {
    throw new Error(`Invalid size. ${size}, ${sizeValue}`);
  }

  if (!players) {
    throw new Error(`Could not determine player amount ${players}`);
  }

  if (!map_version?.length) {
    throw new Error('Could not determine map_version');
  }

  const result: ScenarioLUA = {
    author,
    description,
    map_version,
    name,
    players,
    preview,
    size: sizeValue,
  };
  console.warn(result);
  return result;
};

export default parseScenario;
