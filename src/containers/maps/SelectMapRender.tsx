import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Button } from '@material-ui/core';
import MapsContext from './MapsContext';
import commandMapPreview from './util.preview';
import path from 'path';
import fs from 'fs';
import Jimp from 'jimp';

interface Props {}

const SelectMapRender: FunctionComponent<Props> = ({}) => {
  const { sourceFolder, previewImage, setPreviewImage } = useContext(
    MapsContext
  );
  const [base64, setBase64] = useState<string | null>(null);
  useEffect(() => {
    if (previewImage) {
      try {
        const buffer = fs.readFileSync(previewImage);
        Jimp.read(buffer.buffer)
          .then((x) => x.getBase64Async(x.getMIME()))
          .then((x) => {
            setBase64(x);
          });
      } catch (e) {
        console.error(e);
      }
    } else {
      setBase64(null);
    }
  }, [previewImage]);

  return (
    <>
      {base64 && <img src={base64} width="512" height="512" alt="preview" />}
      <form>
        <Button variant="contained" component="label" color="secondary">
          Select map render
          <input
            name="image"
            type="file"
            accept="image/jpg"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (!e.target.files?.[0]) {
                setPreviewImage(null);
                return;
              }
              try {
                commandMapPreview(
                  sourceFolder!,
                  e.target.files[0].path!,
                  (dest) => {
                    console.warn('DEST', dest);
                    setPreviewImage(dest);
                  }
                );
              } catch (e) {
                console.error(e);
              }
            }}
          />
        </Button>
      </form>
    </>
  );
};

export default SelectMapRender;
