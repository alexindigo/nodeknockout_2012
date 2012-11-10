var Canvas  = require('canvas')
  , Image   = Canvas.Image

  , offsetX = 0
  , offsetY = 320
  , stepX   = 128
  , stepY   = 128
  , perLine = 5
  , shift   = 300

  , types   = // code ((R-G) + (B-G)) + shift
    {
      210: 'mine_closed',
      250: 'mine_open',
      290: 'neutral',
      370: 'their_open',
      450: 'their_closed'
    }
  ;

module.exports = function(filename)
{
  var canvas
    , context
    , image   = new Image()
    , letters = []
    , cellContext
    , i
    ;

    image.src = filename;

    canvas  = new Canvas(image.width, image.height);
    context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, image.width, image.height);

    for (i=0; i<25; i++)
    {
      letters.push(getLetterByPosition(context, i));
    }
//    cellContext = getLetterByPosition(context, 1);

    return letters;
//    return cellContext.canvas.createPNGStream();
}

function getLetterByPosition(context, pos)
{
  var cellCanvas = new Canvas(stepX, stepY)
    , cellContext = cellCanvas.getContext('2d')
    , imageData
    , x0
    , y0
    , sample
    , code
    , color
    , type
    , sum
    , i
    , t
    ;

  // calculate position in pixels
  x0 = (pos % perLine) * stepX;
  y0 = Math.floor(pos / perLine) * stepY;

  imageData = context.getImageData(offsetX + x0, offsetY + y0, stepX, stepY);
  sample = context.getImageData(offsetX + x0 + 2, offsetY + y0 +2 , 1, 1);

  color = [sample.data[0], sample.data[1], sample.data[2]];
  code = (sample.data[0] - sample.data[1]) + (sample.data[2] - sample.data[1]);

  // find type
  for (t in types)
  {
    if (code + shift > t) type = types[t];
  }

  // normalize
  for (i=0, len=imageData.data.length; i<len; i+=4)
  {
    sum = imageData.data[i] + imageData.data[i+1] + imageData.data[i+2];
    if (sum > 150)
    {
      imageData.data[i]   = 255;
      imageData.data[i+1] = 255;
      imageData.data[i+2] = 255;
    }
    else
    {
      imageData.data[i]   = 0;
      imageData.data[i+1] = 0;
      imageData.data[i+2] = 0;
    }
  }

  cellContext.putImageData(imageData, 0, 0);

  return {canvas: cellContext.canvas, type: type, color: color};
}
