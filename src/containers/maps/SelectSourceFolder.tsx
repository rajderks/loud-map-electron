import React, { FunctionComponent, useContext } from 'react';
import { Button } from '@material-ui/core';
import MapsContext from './MapsContext';
import path from 'path';

interface Props {}

const SelectSourceFolder: FunctionComponent<Props> = ({}) => {
  const { setSourceFolder } = useContext(MapsContext);
  return (
    <form>
      <Button variant="contained" component="label" color="secondary">
        Select working directory
        <input
          name="image"
          type="file"
          accept=".scmap"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (!e.target.files?.[0]) {
              setSourceFolder(null);
              return;
            }
            setSourceFolder(path.dirname(e.target.files[0].path!));
          }}
        />
      </Button>
    </form>
  );
};

export default SelectSourceFolder;
