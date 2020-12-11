import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  DialogActions,
  Button,
  DialogContent,
  TextField,
  FormControlLabel,
  Checkbox,
  makeStyles,
  FormControl,
  InputLabel,
  Typography,
  Box,
  darken,
  Dialog,
} from '@material-ui/core';
import MapsPlayersTextField from './MapsPlayersTextField';
import MapsSizeSelect from './MapsSizeSelect';
import SizeIcon from '@material-ui/icons/AspectRatio';
import SuccessIcon from '@material-ui/icons/ThumbUp';
import api from '../../api/api';
import { retry } from 'rxjs/operators';
import { ApiError } from '../../api/types';
import { logEntry } from '../../util/logger';
import SelectSourceFolder from './SelectSourceFolder';
import fs from 'fs';
import path from 'path';
import MapsContext from './MapsContext';
import parseScenario from '../../util/parseScenario';
import { ScenarioLUA } from '../../util/types';
import { remote } from 'electron';
import { archiveDirectory } from '../../util/archive';

const useStyles = makeStyles((theme) => ({
  contentRoot: {
    display: 'flex',
    flexDirection: 'column',
    '& > div': {
      margin: theme.spacing(1, 0),
    },
  },
  sizeIcon: {
    position: 'absolute',
    bottom: 6,
    color: theme.palette.text.primary,
  },
  sizeSelect: {
    marginLeft: 32,
  },
  tokenBox: {
    marginTop: theme.spacing(0.5),
    backgroundColor: darken('#282C31', 0.35),
    borderRadius: 99,
    textAlign: 'center',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
  },
}));

interface Props {}

const validate = ({
  image,
  name,
  description,
  players,
  updateMap,
  mapToken,
  // officialMap,
  adminToken,
  author,
  version,
}: {
  image: string | null;
  name: string;
  description: string;
  players: string;
  updateMap: boolean;
  // officialMap: boolean;
  adminToken: string | null;
  mapToken: string | null;
  author: string;
  version: string;
}) => {
  if (updateMap && !mapToken?.length) {
    return false;
  }
  if (!adminToken?.length) {
    return false;
  }
  // if (officialMap && !adminToken?.length) {
  //   return false;
  // }
  return (
    image &&
    author?.length &&
    version?.length &&
    name?.length &&
    description?.length &&
    players.length
  );
};

const MapUpload: FunctionComponent<Props> = () => {
  const { sourceFolder, previewImage } = useContext(MapsContext);
  const classes = useStyles();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [version, setVersion] = useState('');
  const [players, setPlayers] = useState('');
  const [size, setSize] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [, setFileName] = useState<string | null>(null);
  const [mapToken, setMapToken] = useState<string>('');
  const [adminToken, setAdminToken] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  // const [officialMap, setOfficialMap] = useState(false);
  const [updateMap, setUpdateMap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disableAddButton, setDisableAddButton] = useState<boolean>(false);
  const [successToken, setSuccessToken] = useState<string | null>(null);
  const [, setScenarioLUA] = useState<ScenarioLUA | null>(null);

  const reset = useCallback(() => {
    setName('');
    setDescription('');
    setPlayers('');
    setSize(0);
    setFile(null);
    setFileName(null);
    setUploading(false);
    setError(null);
    setDisableAddButton(false);
    setMapToken('');
    // setOfficialMap(false);
    setUpdateMap(false);
    // setAdminToken('');
    // setAuthor('');
    setVersion('');
    setSuccessToken(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!sourceFolder) {
      return;
    }

    const formData = new FormData();
    const zipName = `${path
      .normalize(sourceFolder)
      .split(path.sep)
      .pop()!}.scd`;
    const tempPath = path.join(remote.app.getPath('temp'), 'LOUD-MAP', zipName);

    try {
      fs.mkdirSync(path.dirname(tempPath));
      fs.unlinkSync(tempPath);
    } catch (e) {
      console.log(e);
    }

    archiveDirectory(sourceFolder, tempPath)
      .then((result) => {
        if (
          !validate({
            image: previewImage,
            name,
            players,
            description,
            adminToken,
            mapToken,
            updateMap,
            // officialMap,
            author,
            version,
          })
        ) {
          return;
        }

        setUploading(true);

        const fileBuffer = Buffer.from(fs.readFileSync(result.filePath));
        const fileFile: File = new File(
          [fileBuffer],
          path.basename(result.filePath),
          { type: 'application/scd' }
        );

        const previewBuffer = Buffer.from(fs.readFileSync(previewImage!));
        const previewFile: File = new File(
          [previewBuffer],
          path.basename(previewImage!),
          { type: 'image/jpg' }
        );

        formData.append('author', author);
        formData.append('file', fileFile);
        formData.append('image', previewFile);
        formData.append('name', name);
        formData.append('description', description);
        formData.append('players', players);
        formData.append('version', version);
        formData.append('size', String(size));
        // if (officialMap) {
        formData.append('official', 'true');
        formData.append('adminToken', adminToken);
        // }
        if (updateMap) {
          formData.append('mapToken', mapToken);
        }

        api
          .post('maps', formData)
          .pipe(retry(0))
          .subscribe(
            (n) => {
              setSuccessToken(n.response.token);
            },
            (e) => {
              setUploading(false);
              setError(
                JSON.stringify(
                  (e.response as ApiError)?.message ?? 'unkown error'
                )
              );
              logEntry(
                JSON.stringify((e.response as ApiError)?.message),
                'error',
                ['log']
              );
            },
            () => {
              setUploading(false);
              try {
                fs.unlinkSync(result.filePath);
              } catch (e) {
                console.log(e);
              }
            }
          );
      })
      .catch((e) => {
        console.error(e);
      });
  };

  useEffect(() => {
    setDisableAddButton(
      !validate({
        image: previewImage,
        name,
        players,
        description,
        adminToken,
        mapToken,
        updateMap,
        // officialMap,
        author,
        version,
      })
    );
  }, [
    adminToken,
    author,
    description,
    file,
    mapToken,
    name,
    players,
    previewImage,
    updateMap,
    version,
  ]);

  const setScenarioInfoFromLUA = (info: ScenarioLUA) => {
    setVersion(info.map_version);
    if (info.description && !description?.length) {
      setDescription(info.description);
    }
    if (info.name && !name?.length) {
      setName(info.name);
    }
    if (info.size && size === 0) {
      setSize(info.size);
    }
    if (info.players && !players?.length) {
      setPlayers(String(info.players));
    }
  };

  const loadScenarioInfo = () => {
    if (!sourceFolder) {
      return;
    }
    fs.readdir(sourceFolder, (statErr, files) => {
      if (statErr) {
        console.error(statErr);
        return;
      }
      const scenarioFile = files.find((f) =>
        f.toLowerCase().endsWith('_scenario.lua')
      );
      if (!scenarioFile) {
        console.error('no scenario file found');
        return;
      }
      try {
        const scenarioInfo = parseScenario(
          path.join(sourceFolder, scenarioFile)
        );
        if (scenarioInfo) {
          setScenarioLUA(scenarioInfo);
          setScenarioInfoFromLUA(scenarioInfo);
        }
      } catch (e) {
        console.error(e);
      }
    });
  };

  const loadScenarioInfoRef = useRef(loadScenarioInfo);
  loadScenarioInfoRef.current = loadScenarioInfo;

  useEffect(() => {
    reset();
    setTimeout(() => {
      loadScenarioInfoRef.current();
    }, 100);
  }, [reset, sourceFolder]);

  return (
    <Box display="flex" flex="1" flexDirection="row">
      <Box display="flex" flex="0 0 400px" flexDirection="column">
        <SelectSourceFolder />
        {/* <PageHeader title="LOUD Map Thingajgicm" hideControls /> */}
        <form action="" onSubmit={handleSubmit}>
          <DialogContent classes={{ root: classes.contentRoot }}>
            <TextField
              disabled={uploading}
              label="Map name*"
              InputLabelProps={{ shrink: true }}
              placeholder="Enter the map name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <TextField
              multiline
              disabled={uploading}
              label="Description*"
              InputLabelProps={{ shrink: true }}
              placeholder="Enter a short description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
            <TextField
              multiline
              disabled={uploading}
              label="Author*"
              InputLabelProps={{ shrink: true }}
              placeholder="Enter your nickname"
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);
              }}
            />
            <MapsPlayersTextField
              id="add-players-textfield"
              label="Players*"
              disabled={uploading}
              onChange={setPlayers}
              value={players}
            />
            <div style={{ display: 'flex' }}>
              <FormControl>
                <InputLabel shrink id="add-size-select">
                  Size*
                </InputLabel>
                <MapsSizeSelect
                  id="add-size-select"
                  disabled={uploading}
                  classes={{ select: classes.sizeSelect }}
                  onChange={setSize}
                  value={size}
                  defaultValue={size}
                  disableAll
                />
                <SizeIcon className={classes.sizeIcon} />
              </FormControl>
              <TextField
                disabled
                label="Version*"
                InputLabelProps={{ shrink: true }}
                placeholder="1"
                value={version}
                onChange={(e) => {
                  setVersion(e.target.value);
                }}
              />
            </div>
            <Typography color="textPrimary" variant="caption">
              (if version is absent, add map_version to scenario.lua and press
              Scenario Parse button)
            </Typography>
            <br />
            {/* <FormControlLabel
                label="Official map (admin only)"
                control={
                  <Checkbox
                    disabled={uploading}
                    value={officialMap}
                    onChange={(_e, checked) => {
                      setOfficialMap(checked);
                    }}
                  />
                }
              />
              {officialMap ? ( */}
            <TextField
              disabled={uploading}
              label="Admin token*"
              InputLabelProps={{ shrink: true }}
              placeholder="Enter admin token"
              type="password"
              value={adminToken}
              onChange={(e) => {
                setAdminToken(e.target.value);
              }}
            />
            {/* ) : null} */}
            <FormControlLabel
              label="Update map"
              control={
                <Checkbox
                  disabled={uploading}
                  value={updateMap}
                  onChange={(_e, checked) => {
                    setUpdateMap(checked);
                  }}
                />
              }
            />
            {updateMap ? (
              <TextField
                multiline
                disabled={uploading}
                placeholder="Enter map token"
                value={mapToken}
                onChange={(e) => {
                  setMapToken(e.target.value);
                }}
              />
            ) : null}
            <Typography color="textPrimary" variant="caption">
              *required
            </Typography>
          </DialogContent>

          <DialogActions style={{ marginBottom: 8 }}>
            {successToken ? (
              <Button
                disabled={uploading}
                onClick={() => {
                  reset();
                }}
              >
                CLOSE
              </Button>
            ) : (
              <>
                <Button
                  disabled={uploading}
                  onClick={() => {
                    loadScenarioInfo();
                  }}
                >
                  SCENARIO PARSE
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  disabled={disableAddButton || uploading}
                >
                  UPLOAD
                </Button>
                <Button
                  disabled={uploading}
                  onClick={() => {
                    reset();
                  }}
                >
                  RESET
                </Button>
              </>
            )}
          </DialogActions>
        </form>
        <Dialog open={!!successToken?.length}>
          <DialogContent classes={{ root: classes.contentRoot }}>
            <div style={{ display: 'flex' }}>
              <SuccessIcon
                color="secondary"
                fontSize="large"
                style={{ alignSelf: 'flex-end' }}
              />
              <div style={{ marginLeft: 16 }}>
                <Typography variant="body1" color="textPrimary">
                  Below is your map token which you can use to update the map.
                </Typography>
                <Typography variant="h6" align="center" color="textPrimary">
                  DO NOT LOSE THIS!
                </Typography>
                <div className={classes.tokenBox}>
                  <Typography
                    style={{ fontWeight: 'bold' }}
                    color="textPrimary"
                  >
                    {successToken}
                  </Typography>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuccessToken(null)}>Close</Button>
          </DialogActions>
        </Dialog>
        {!successToken ? (
          <Dialog
            open={!successToken && !!(error?.length ?? false)}
            onClose={() => setError(null)}
          >
            <DialogContent>
              {error?.length ? (
                <Typography color="error" variant="body2">
                  Error: {error}
                </Typography>
              ) : null}
            </DialogContent>
          </Dialog>
        ) : null}
      </Box>
    </Box>
  );
};

export default MapUpload;
