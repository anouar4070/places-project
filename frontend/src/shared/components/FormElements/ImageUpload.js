import React, { useRef } from 'react';

import Button from './Button';
import './ImageUpload.css';

const ImageUpload = props => {
  const filePickerRef = useRef();

  const pickedHandler = event => {
    console.log(event.target);
  };

  const pickImageHandler = () => {
    // Programmatically triggers a click on the hidden file input to open the file picker dialog
    // click() is a native method available on HTML elements in the DOM.
    filePickerRef.current.click();
  };

  return (
    <div className="form-control">
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: 'none' }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && 'center'}`}>
        <div className="image-upload__preview">
          <img src="" alt="Preview" />
        </div>
        <Button type="button" onClick={pickImageHandler}>PICK IMAGE</Button>
      </div>
    </div>
  );
};

export default ImageUpload;
