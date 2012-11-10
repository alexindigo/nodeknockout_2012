var Canvas  = require('canvas')
  , rgb2hsl = require('color-convert').rgb2hsl
  , Image   = Canvas.Image

  , _      = require('lodash')

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
  , letterMatches =
    {
      i: function(count, type, data)
          {
            return count < 600;
          },
      l: function(count, type, data)
          {
            return around(count, 770, 20);
          },
      t: function(count, type, data)
          {
            if (count > 900) return false;
            if (type == 'mine_closed' && around(count, 892, 3))
            {
              return true;
            }
            else if (type == 'mine_open' && around(count, 890))
            {
              return true;
            }
            else if (type == 'neutral' && around(count, 843, 3))
            {
              return true;
            }
            else if (type == 'their_open' && around(count, 880))
            {
              return true;
            }
            else if (type == 'their_closed' && around(count, 890, 3))
            {
              return true;
            }

            return false;
          },
      w: function(count, type, data)
          {
            return count > 1800;
          },
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

    offsetY = image.height - image.width;

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
    , count
    , letter
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

  // count dark dots
  count = countDots(imageData);

  _.find(letterMatches, function(func, l)
  {
    if (func(count, type, imageData))
    {
      letter = l;
    }
  });


  cellContext.putImageData(imageData, 0, 0);

  return {pos: pos, letter: letter, canvas: cellContext.canvas, type: type, color: color, count: count};
}

function countDots(imageData)
{
  var count = 0
    , hsl
  ;

  for (i=0, len=imageData.data.length; i<len; i+=4)
  {
    hsl = rgb2hsl(imageData.data[i], imageData.data[i+1], imageData.data[i+2]);

    if (hsl[2] < 30)
    {
      count++;
    }
  }

  return count;
}

function around(value, num, pres)
{
  pres = pres || 10;
  return num-pres < value && value < num+pres;
}
