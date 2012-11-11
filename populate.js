var util   = require('util')
  , fs     = require('fs')

  , _      = require('lodash')
  , redis  = require('redis')

  // globals
  , db

  // settings
  , Config =
    {
      host: 'nodejitsudb2786432197.redis.irstack.com',
      port: 6379,
      pass: 'nodejitsudb2786432197.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4',
      file: '/usr/share/dict/web2'
    }
  ;

db = redis.createClient(Config.port, Config.host);

db.auth(Config.pass, function()
{
  console.log("Connected!");

  main();
});

db.on("error", function(err)
{
    console.log("Error " + err);
});


function main()
{
  var Z = 0;

  db.flushdb();

  var s = fs.ReadStream(Config.file);

  s.on('data', function(d)
  {
   var words, limit, i=0;

    s.pause();

    words = d.toString().split('\n');

    limit = words.length;

    _.forEach(words, function(w)
    {
      if (w.length < 3) return limit--;
      if (w.toLowerCase() != w) return limit--;

      processWord(w, function(err, result)
      {
        i++;

Z++;
console.log([Z, i, limit]);

        if (i >= limit)
        {
          console.log(['Processed '+limit+' words.', err]);
          s.resume();

// if (Z > 5000)
// {
// console.log('interupting');
// db.quit();
// process.exit(0);
// }

        }
      });

    });

  });

  s.on('end', function()
  {
    console.log('done');
    db.quit();
  });

}

function processWord(word, callback)
{

  var measurements = sliceAndDice(word);

  db.incr('global.wordId', function(err, id)
  {
    var i, multi;

    if (err) return db.emit('error', err);

    multi = db.multi();

    // set the word
    multi.set(id, word);

    for (i=0; i<measurements.length; i++)
    {
      multi.sadd(measurements[i], id);
    }

    multi.exec(function(err, replies)
    {
        callback(err, replies);
    });
  });
}

function sliceAndDice(word)
{
  var i
    , collection = {}
    , result = []
    ;

  for (i=0; i<word.length; i++)
  {
    if (!(word[i] in collection)) collection[word[i]] = 0;
    collection[word[i]]++;
  }

  for (char in collection)
  {
    result.push(char + collection[char]);
  }

  return result;
}
