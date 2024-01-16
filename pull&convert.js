
const fs = require('fs');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const { promisify } = require('util');
const Jimp = require('jimp');

const drive = google.drive('v3');
const readFileAsync = promisify(fs.readFile);

// Authenticate with Google Drive API
async function authenticateGoogleDrive() {
  const auth = await authenticate({
    keyfilePath: '<PATH_TO_YOUR_SERVICE_ACCOUNT_KEY_FILE>',
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  google.options({ auth });
}

// Download image from Google Drive
async function downloadImage(fileId) {
  const response = await drive.files.get({
    fileId,
    alt: 'media',
  }, { responseType: 'arraybuffer' });

  return Buffer.from(response.data, 'binary');
}

// Convert image from JPG to PNG using Jimp
async function convertImageToPng(imageBuffer) {
  const image = await Jimp.read(imageBuffer);
  return image.getBufferAsync(Jimp.MIME_PNG);
}

// Save PNG image to the local file system
async function savePngToFile(pngBuffer, outputPath) {
  await fs.promises.writeFile(outputPath, pngBuffer);
  console.log(`Image saved to ${outputPath}`);
}
                    /*may not need this function*/

async function convertImagesInFolder(folderId) {
    let pageToken = null;
    do {
        const response = await drive.files.list({
        q: `'${folderId}' in parents and mimeType='image/jpeg'`,
        fields: 'files(id, name)',
        pageToken,
        });

        const files = response.data.files;
        pageToken = response.data.nextPageToken;

        for (const file of files) {
        const imageBuffer = await downloadImage(file.id);
        const pngBuffer = await convertImageToPng(imageBuffer);

        const outputPath = `${file.name.replace(/\.jpg$/, '')}.png`;
        await savePngToFile(pngBuffer, outputPath);
        }
    } while (pageToken);  
}

async function main() {
  
}
main();

