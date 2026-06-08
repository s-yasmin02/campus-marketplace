import fs from 'fs';
import { FormData } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';

async function testUpload() {
  try {
    const form = new FormData();
    form.append('images', await fileFromPath('./package.json'));

    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: form
    });
    
    if (!res.ok) {
      const errText = await res.text();
      console.error('Upload failed with status', res.status, errText);
    } else {
      const data = await res.json();
      console.log('Upload success:', data);
    }
  } catch (err) {
    console.error('Upload failed:', err.message);
  }
}

testUpload();
