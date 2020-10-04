import { Box } from '@material-ui/core';
import React, { useContext } from 'react';
import MapsPreview from './MapsPreview';
import MapsContext from './MapsContext';
import MapUpload from './MapUpload';
import SelectSourceFolder from './SelectSourceFolder';

const Maps = () => {
  const { previewImage, sourceFolder } = useContext(MapsContext);
  console.warn(sourceFolder);
  console.warn(previewImage);
  return (
    <Box display="flex" flex="1" flexDirection="row">
      {(sourceFolder?.length ?? 0) > 0 ? (
        <>
          <Box display="flex" flex="0 0 400px" flexDirection="column">
            <MapUpload />
          </Box>
          <Box display="flex" flex="1" flexDirection="column">
            <MapsPreview />
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          flex="1 1 100%"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <SelectSourceFolder />
        </Box>
      )}
    </Box>
  );
};

export default Maps;
