var path   = require('path')
  , util   = require('util')
  , fs     = require('fs')

  , _      = require('lodash')
  , app    = require('tako')()

  // globals

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

// api
app.route('/api/:action').json(function(req, res)
{
  // just to make it safe
  req.qs = req.qs || {};

  req.on('error', function(err)
  {
    console.log(['error', err, req.url, req.method, req.qs, req.params]);
    res.end({status: 'error', data: (err.message ? err.message : err ) });
  });

  switch (req.params.action)
  {
    case 'upload':
      if (req.method == 'POST')
      {
      }
      else
      {
        methodNotAllowed(res);
      }
      break;

    default:
      return fileNotFound(res);
  }
});

// static files + landing page
app.route('/').files(Config.index);
app.route('*').files(Config.path);

// }}}


// {{{ start server

app.httpServer.listen(Config.port, Config.host);

console.log('Listening on '+(Config.host ? Config.host : '')+':'+Config.port);

// }}}

// {{{ Main thing


// }}}


// {{{ Santa's little helpers

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
