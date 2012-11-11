var path   = require('path')
  , util   = require('util')
  , fs     = require('fs')

  , _      = require('lodash')
  , app    = require('tako')()
  , Form   = require('formidable')

  , image  = require('./lib/image')
  , words  = require('./lib/words')

  // globals
  , db

  // settings
  , Config =
    {
      port : 8000,
      path : 'static',
      index: 'index.html'
    }
  ;

// {{{ prepare environment

// process config settings
Config.host = process.env.host || process.env.npm_package_config_host;

Config.port = process.env.port || process.env.npm_package_config_port || Config.port;

Config.path = process.env.path || process.env.npm_package_config_path || Config.path;
if (Config.path[0] != '/') Config.path = path.join(__dirname, Config.path);

Config.index = process.env.index || process.env.npm_package_config_index || Config.index;
if (Config.index[0] != '/') Config.index = path.join(Config.path, Config.index);

// {{{ define routing

// pages
app.route('/process', function(req, res)
{
  // just to make it safe
  req.qs = req.qs || {};

  req.on('error', function(err)
  {
    console.log(['error', err, req.url, req.method, req.qs, req.params]);
    res.end({status: 'error', data: (err.message ? err.message : err ) });
  });

  if (req.method == 'POST')
  {
    processFile(req, res);
  }
  else
  {
    methodNotAllowed(res);
  }
});

// static files + landing page
app.route('/').files(Config.index);
app.route('*').files(Config.path);

// }}}


// {{{ start server
app.httpServer.listen(Config.port, Config.host);
console.log('Listening on '+(Config.host ? Config.host : '')+':'+Config.port);

// init words
words();
// }}}


// {{{ Main thing

function processFile(req, res)
{
  var form = new Form.IncomingForm();

  form.parse(req);

  form.on('file', function(name, file)
  {
    image(file.path, function(err, letters)
    {
      if (err) return requestError(res, err);

      // get words
      words(letters, function(err, result)
      {
        var letterPrefix = {};

        res.writeHead(200,
        {
          'Content-Type': 'text/html'
        });

        res.write('<!doctype html><html><head><meta charset="utf-8"><title>letter•jit•su</title><link rel="stylesheet" href="/s/main.css">');
        res.write('<style>');

        _.chain(letters).each(function(tile)
        {
          var className;

          if (!(tile.letter in letterPrefix)) letterPrefix[tile.letter] = '';

          className = '.letter_'+tile.letter;
          res.write(letterPrefix[tile.letter] + className);
          res.write('{');
          res.write('background-image: url("'+tile.canvas.toDataURL()+'");');
          res.write('}\n');

          // update prefix
          letterPrefix[tile.letter] += className + ' ~ ';

          // res.write('<div style="background-color: rgb('+tile.color[0]+','+tile.color[1]+','+tile.color[2]+');">');
          // res.write('<p>'+tile.pos+'. '+tile.type+', '+tile.counts.count+' = '+tile.counts.left+' + '+tile.counts.right+'</p>');

          // res.write((tile.letter ? '<h1 style="float: left; font-size: 72px; margin: 20px 10px 10px 10px;">'+tile.letter.toUpperCase()+'</h1>' : ''));
          // res.write('<img src="'+tile.canvas.toDataURL()+'"></div><br><br>\n');
        });

        res.write('</style>');
        res.write('<body>\n');

        _.forEach(_.head(result, 100), function(o)
        {
          var used, i, current;

          res.write('<div class="word">');

          for (i=0; i<o.word.length; i++)
          {
            res.write('<span class="letter letter_'+o.word[i]+'">'+o.word[i]+'</span>');
          }

          res.write('</div>\n');
        });

        res.end('</body></html>');


      });

    });
  });


}

// }}}


// {{{ Santa's little helpers

// generic error hanlder
function requestError(res, err)
{
  res.end({status: 'error', data: (err.message ? err.message : err ) });
}

// generic resourse not found error
function fileNotFound(res)
{
  res.statusCode = 404;
  res.end('Resource Not Found.');
}

// generic method not allowed error
function methodNotAllowed(res)
{
  res.statusCode = 405;
  res.end('Method Not Allowed.');
}

// }}}
