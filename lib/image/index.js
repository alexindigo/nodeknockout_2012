var Canvas     = require('canvas')
  , Image      = Canvas.Image

  , offsetX    = 0
  , offsetY    = 320
  , stepX      = 128
  , stepY      = 128
  , perLine    = 5
  ;

module.exports = function(filename)
{
  var width   = 640
    , height  = 960
    , canvas  = new Canvas(width, height)
    , context = canvas.getContext('2d')
    , image   = new Image()
    , letters = []
    , cellContext
    ;

    image.src = filename;

    context.drawImage(image, 0, 0, width, height);

    for (var i=0; i<25; i++)
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
    ;

  // calculate position in pixels
  x0 = (pos % perLine) * stepX;
  y0 = Math.floor(pos / perLine) * stepY;

  imageData = context.getImageData(offsetX + x0, offsetY + y0, stepX, stepY)

  cellContext.putImageData(imageData, 0, 0);

  return cellContext;
}
