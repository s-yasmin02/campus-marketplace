import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

async function testUpload() {
  try {
    const form = new FormData();
    // Using a simple file to upload
    form.append('images', fs.createReadStream('./package.json'));

    const res = await axios.post('http://localhost:5000/api/upload', form, {
      headers: form.getHeaders()
    });
    console.log('Upload success:', res.data);
  } catch (err) {
    console.error('Upload failed:', err.response ? err.response.data : err.message);
  }
}

testUpload();
