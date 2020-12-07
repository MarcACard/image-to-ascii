const fs = require('fs');
const sharp = require('sharp')

function loadImage(imagePath) {
  return sharp(imagePath).resize(200).raw().toBuffer({ resolveWithObject: true });
}

function getPixelMatrix(image){
  const data = image.data;
  const imageHeight = image.info.height;
  const imageWidth = image.info.width;
  let pixelMatrix = [];

  for (let y = 0; y < imageHeight; y += 1) {
    let yRow = [];
    for (let x = 0; x < imageWidth; x += 1) {
      let indexOffset = (y * imageWidth + x) * 3
      let rgb = [
        data[indexOffset],     // Red
        data[indexOffset + 1], // Green
        data[indexOffset + 2] // Blue
      ]
      //console.log(rgb);
      yRow.push(rgb);
    }
    pixelMatrix.push(yRow);
  }

  return pixelMatrix;
}

function getLuminosityMatrix(pixelMatrix, algorithm = 'average') {
  return pixelMatrix.map(pixelRow => {
    return pixelRow.map(pixel => {
      if (algorithm == 'average') {
        return Math.round((pixel[0] + pixel[1] + pixel[2]) / 3);
      } else if (algorithm == 'luminance') {
        // Determine brightness of RBG Pixel: https://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
        return Math.round((0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]))
      } else {
        console.log("What are you doing here?")
      }
    })
  })
}

function getAsciiMatrix(luminosityMatrix) {
  return luminosityMatrix.map((row) => {
    return row.map((pixel) => {
      return asciiConversion(pixel);
    });
  });
}

function asciiConversion(brightness) {
  return ASCII[Math.round(brightness / MAX_VALUE * (ASCII.length - 1))] + ASCII[Math.round(brightness / MAX_VALUE * (ASCII.length - 1))];
}

function printResults(asciiMatrix) {
  asciiMatrix.map((row) => {
    console.log(row.join(''));
  });
}

async function main(algorithm) {
  const image = await loadImage('self-portrait-claude-monet.jpg');
  const pixelMatrix = getPixelMatrix(image);
  const luminosityMatrix = getLuminosityMatrix(pixelMatrix, algorithm);
  const asciiMatrix = getAsciiMatrix(luminosityMatrix);
  printResults(asciiMatrix);
}

const ASCII = "`^\",:;Il!i~+_-?][}{1)(|\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const MAX_VALUE = 255;
const ALGORITHM = process.argv.slice(2);

main(ALGORITHM);

