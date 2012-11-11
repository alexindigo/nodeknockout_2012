var Canvas   = require('canvas')
  , rgb2hsl  = require('color-convert').rgb2hsl
  , Image    = Canvas.Image

  , _        = require('lodash')

  , offsetX  = 0
  , offsetY  = 320
  , stepX    = 128
  , stepY    = 128
  , perLine  = 5
  , shift    = 300

  , types    = // code ((R-G) + (B-G)) + shift
    {
      210: 'mine_closed',
      250: 'mine_open',
      290: 'neutral',
      370: 'their_open',
      450: 'their_closed'
    }
  , letterMatches =
    {
      a: function(counts, type, data)
          {
            if (!around(counts.count, 1165, 45)) return false;
            if (counts.left - counts.right > 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 1190,
              mine_open   : 1153,
              neutral     : 1123,
              their_open  : 1141,
              their_closed: 1172
            }, 5);
          },

      b: function(counts, type, data)
          {
            if (!around(counts.count, 1465, 65)) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 1522,
              mine_open   : 1475,
              neutral     : 1412,
              their_open  : 1458,
              their_closed: 1497
            }, 5);
          },

      c: function(counts, type, data)
          {
            if (!around(counts.count, 1100, 60)) return false;
            if (counts.left - counts.right < 100) return false;

            return matchByType(type, counts.left,
            {
              mine_closed : 700,
              mine_open   : 679,
              neutral     : 670,
              their_open  : 676,
              their_closed: 690
            }, 5);
          },

      d: function(counts, type, data)
          {
            if (!around(counts.count, 1430, 70)) return false;
            if (counts.left - counts.right < 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 1480,
              mine_open   : 1453,
              neutral     : 1368,
              their_open  : 1433,
              their_closed: 1467
            }, 5);
          },

      e: function(counts, type, data)
          {
            if (!around(counts.count, 1100, 60)) return false;
            if (counts.left - counts.right < 100) return false;

            return matchByType(type, counts.left,
            {
              mine_closed : 729,
              mine_open   : 728,
              neutral     : 682,
              their_open  : 722,
              their_closed: 729
            }, 5);
          },

      f: function(counts, type, data)
          {
            if (!around(counts.count, 900, 70)) return false;
            if (counts.left - counts.right < 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 923,
              mine_open   : 915,
              neutral     : 835,
              their_open  : 906,
              their_closed: 921
            }, 5);
          },

      g: function(counts, type, data)
          {
            if (!around(counts.count, 1380, 50)) return false;
            if (counts.left - counts.right > 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 1426,
              mine_open   : 1376,
              neutral     : 1341,
              their_open  : 1367,
              their_closed: 1404
            }, 5);
          },

      h: function(counts, type, data)
          {
            if (!around(counts.count, 1313, 50)) return false;
            if (counts.left - counts.right > 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 1357,
              mine_open   : 1328,
              neutral     : 1269,
              their_open  : 1314,
              their_closed: 1353
            }, 5);
          },

      i: function(counts, type, data)
          {
            return counts.count < 600;
          },

      j: function(counts, type, data)
          {
            if (counts.count > 1100) return false;

            if (counts.right - counts.left > 100) return true;

            return false;
          },

      k: function(counts, type, data)
          {
            if (!around(counts.count, 1190, 60)) return false;
            if (counts.left - counts.right > 100) return false;

            return matchByType(type, counts.left,
            {
              mine_closed : 647,
              mine_open   : 634,
              neutral     : 588,
              their_open  : 631,
              their_closed: 642
            }, 5);
          },

      l: function(counts, type, data)
          {
            if (counts.count > 800) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 770,
              mine_open   : 770,
              neutral     : 720,
              their_open  : 770,
              their_closed: 770
            }, 10);
          },

      m: function(counts, type, data)
          {
            return around(counts.count, 1725, 65);
          },

      n: function(counts, type, data)
          {
            if (!around(counts.count, 1515, 50)) return false;
            if (counts.left - counts.right > 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 1558,
              mine_open   : 1537,
              neutral     : 1477,
              their_open  : 1518,
              their_closed: 1549
            }, 5);
          },

      o: function(counts, type, data)
          {
            if (!around(counts.count, 1493, 50)) return false;
            if (counts.left - counts.right > 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 1539,
              mine_open   : 1488,
              neutral     : 1448,
              their_open  : 1480,
              their_closed: 1513
            }, 5);
          },

      p: function(counts, type, data)
          {
            if (!around(counts.count, 1150, 55)) return false;
            if (counts.left - counts.right < 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 1181,
              mine_open   : 1166,
              neutral     : 1101,
              their_open  : 1151,
              their_closed: 1168
            }, 5);
          },

      q: function(counts, type, data)
          {
            if (counts.count < 1500) return false;

            if (counts.right - counts.left > 100) return true;

            return false;
          },

      r: function(counts, type, data)
          {
            if (!around(counts.count, 1342, 60)) return false;
            if (counts.left - counts.right > 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 1396,
              mine_open   : 1369,
              neutral     : 1291,
              their_open  : 1357,
              their_closed: 1385
            }, 5);
          },

      s: function(counts, type, data)
          {
            if (!around(counts.count, 1080, 45)) return false;
            if (counts.left - counts.right > 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 1123,
              mine_open   : 1068,
              neutral     : 1041,
              their_open  : 1062,
              their_closed: 0
            }, 5);
          },

      t: function(counts, type, data)
          {
            if (counts.count > 900) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 892,
              mine_open   : 890,
              neutral     : 843,
              their_open  : 875,
              their_closed: 890
            }, 3);
          },

      u: function(counts, type, data)
          {
            if (!around(counts.count, 1235, 70)) return false;
            if (counts.left - counts.right > 100) return false;

            return matchByType(type, counts.left,
            {
              mine_closed : 630,
              mine_open   : 615,
              neutral     : 607,
              their_open  : 613,
              their_closed: 625
            }, 5);
          },

      v: function(counts, type, data)
          {
            if (!around(counts.count, 1067, 45)) return false;
            if (counts.left - counts.right > 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 1106,
              mine_open   : 1062,
              neutral     : 1031,
              their_open  : 1052,
              their_closed: 1083
            }, 5);
          },

      w: function(counts, type, data)
          {
            return counts.count > 1790;
          },

      x: function(counts, type, data)
          {
            if (!around(counts.count, 1100, 25)) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 0, // test
              mine_open   : 1120,
              neutral     : 1077,
              their_open  : 1105,
              their_closed: 0 // test
            }, 5);

          },
      y: function(counts, type, data)
          {
            if (counts.count > 900) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 888, // test
              mine_open   : 864,
              neutral     : 838,
              their_open  : 859,
              their_closed: 875
            }, 3);
          },
      z: function(counts, type, data)
          {
            if (!around(counts.count, 1140, 30)) return false;
            if (counts.left - counts.right > 100) return false;

            return matchByType(type, counts.count,
            {
              mine_closed : 0,
              mine_open   : 1169,
              neutral     : 1117,
              their_open  : 1160,
              their_closed: 0
            }, 5);
          }
    }
  ;

module.exports = function(filename, callback)
{
  var canvas
    , context
    , image   = new Image()
    , letters = []
    ;

    try
    {
      image.src = filename;

      canvas  = new Canvas(image.width, image.height);
      context = canvas.getContext('2d')
      context.drawImage(image, 0, 0, image.width, image.height);
    }
    catch (e)
    {
      return callback(e);
    }

    offsetY = image.height - image.width;

    processPositions(context, letters, function(err, letters)
    {
      callback(err, letters);
    });
}

function processPositions(context, letters, callback)
{
  if (letters.length < 25)
  {
    process.nextTick(function()
    {
      letters.push(getLetterByPosition(context, letters.length));
      processPositions(context, letters, callback);
    });
  }
  else
  {
    callback(null, letters);
  }
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
    , counts
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
  counts = countDots(imageData);

  _.find(letterMatches, function(func, l)
  {
    if (func(counts, type, imageData))
    {
      letter = l;
    }
  });


  cellContext.putImageData(imageData, 0, 0);

  return {pos: pos, letter: letter, canvas: cellContext.canvas, type: type, color: color, counts: counts};
}

function countDots(imageData)
{
  var count = 0
    , left  = 0
    , right = 0
    , halfWidth = Math.floor(imageData.width/2)
    , hsl
  ;

  for (i=0, len=imageData.data.length; i<len; i+=4)
  {
    hsl = rgb2hsl(imageData.data[i], imageData.data[i+1], imageData.data[i+2]);

    if (hsl[2] < 30)
    {
      count++;

      // compare halfs
      if (Math.floor(i/4/halfWidth) % 2)
      {
        right++;
      }
      else
      {
        left++;
      }
    }
  }

  return {count: count, left: left, right: right};
}

function matchByType(type, value, rules, pres)
{
  return around(value, rules[type], pres);
}

function around(value, num, pres)
{
  pres = pres || 10;
  return num-pres < value && value < num+pres;
}
