import React, { FunctionComponent } from 'react';
import SelectMapRender from './SelectMapRender';

interface Props {}

const MapsPreview: FunctionComponent<Props> = () => {
  return (
    <div>
      <SelectMapRender />
    </div>
  );
};

export default MapsPreview;
