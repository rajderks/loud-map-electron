import React, { FunctionComponent, useState } from 'react';
import MapsContext, { IMapsContext } from './MapsContext';

const MapsContextProvider: FunctionComponent = ({ children }) => {
  const [sourceFolder, setSourceFolder] = useState<
    IMapsContext['sourceFolder']
  >(null);
  const [previewImage, setPreviewImage] = useState<
    IMapsContext['previewImage']
  >(null);

  const contextValue: IMapsContext = {
    sourceFolder,
    setSourceFolder,
    previewImage,
    setPreviewImage,
  };
  return (
    <MapsContext.Provider value={contextValue}>{children}</MapsContext.Provider>
  );
};

export default MapsContextProvider;
