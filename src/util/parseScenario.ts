import fs from 'fs';
import { mapSizeToValue } from '../containers/maps/utils';
import parseLUA from './parseLUA';
import { ScenarioLUA } from './types';

const parseScenario = (source: string): ScenarioLUA => {
  const scenarioInfo = fs.readFileSync(source).toString();
  console.warn(scenarioInfo);
  const author = /author\s*=\s*"?([^"]*)/gim.exec(scenarioInfo)?.[1] ?? null;
  const description =
    /description\s*=\s*"?([^"]*)/gim.exec(scenarioInfo)?.[1] ?? null;
  const map_version =
    /map_version\s*=\s*"?([^"}{,]*),?\n?/gim.exec(scenarioInfo)?.[1] ?? null;
  const name = /name\s*=\s*"?([^"]*)/gim.exec(scenarioInfo)?.[1] ?? null;
  const size = /size\s*=\s*"?{(\d*)/gim.exec(scenarioInfo)?.[1] ?? null;

  if (!author) {
    throw new Error(`author missing. ${author}`);
  }

  if (!description) {
    throw new Error(`author missing. ${description}`);
  }

  if (!map_version) {
    throw new Error(`map_version missing. ${map_version}`);
  }

  if (!name) {
    throw new Error(`name missing. ${name}`);
  }

  if (!size) {
    throw new Error(`size missing. ${size}`);
  }
  const sizeValue = mapSizeToValue(Number.parseInt(size));
  if (!sizeValue) {
    throw new Error(`Invalid size. ${size}, ${sizeValue}`);
  }

  const result: ScenarioLUA = {
    author,
    description,
    map_version,
    name,
    size: sizeValue,
  };
  console.warn(result);
  return result;
};

export default parseScenario;
