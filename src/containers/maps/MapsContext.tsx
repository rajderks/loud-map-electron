import React from 'react';

export interface IMapsContext {
  sourceFolder: string | null;
  previewImage: string | null;
  setSourceFolder: (sourceFolder: string | null) => void;
  setPreviewImage: (previewImage: string | null) => void;
}

const MapsContext = React.createContext<IMapsContext>({
  sourceFolder: null,
  previewImage: null,
  setSourceFolder: () => {
    /* stub */
  },
  setPreviewImage: () => {
    /* stub */
  },
});

export default MapsContext;
