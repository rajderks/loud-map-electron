import { Button } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import commandMapPreview from './util.preview';
import SelectMapRender from './SelectMapRender';

interface Props {}

const MapsPreview: FunctionComponent<Props> = ({}) => {
  return (
    <div>
      <SelectMapRender />
    </div>
  );
};

export default MapsPreview;
