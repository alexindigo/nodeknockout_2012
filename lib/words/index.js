var path       = require('path')
  , util       = require('util')
  , fs         = require('fs')

  , _          = require('lodash')

  // globals
  , db
  , weightList =
    {
      'mine_closed' : 0,
      'mine_open'   : 0,
      'neutral'     : 2,
      'their_open'  : 3,
      'their_closed': 1
    }

  // settings
  , Config     =
    {
      // host: 'nodejitsudb2786432197.redis.irstack.com',
      // port: 6379,
      // pass: 'nodejitsudb2786432197.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4',
      file: path.join(__dirname, 'dict.txt')
    }
  ;

function init()
{
  fs.readFile(Config.file, 'utf8', function(err, data)
  {
    if (err)
    {
      console.log(['Couldnt find dictionary file ', Config.file]);
      process.exit(1);
    }

    db = _.map(data.split('\n'), initialMapping);
    console.log(['Loaded '+Config.file]);
  });
}

module.exports = function(letters, callback)
{
  var chars, result, weights = [];

  // do init
  if (typeof letters == 'undefined')
  {
    init();
    return;
  }

  chars = sliceAndDice(_.pluck(letters, 'letter'));

  result = _.filter(db, _.partial(filterWords, chars));

  _.forEach(letters, function(o)
  {
    weights.push({letter: o.letter, weight: weightList[o.type]});
  });

  callback(null, _.sortBy(result, _.partial(sortWords, weights)));
};


function filterWords(letters, word)
{
  var c;

  if (word.word.length < 3) return false;

  for (c in word.chars)
  {
    if (!(c in letters)) return false;
    if (word.chars[c] > letters[c]) return false;
  }

  return true;
}

function sortWords(weights, word, key, collection)
{
  var i
    , index
    , result = 0
    , points = 0
    ;

  word = _.toArray(word.word);

  for (i=0; i<weights.length; i++)
  {
    if ((index = word.indexOf(weights[i].letter)) != -1)
    {
      // remove letter
      word.splice(index, 1);
      // and update weights
      result += weights[i].weight;
      points += weights[i].weight ? weights[i].weight - 1 : 0;
    }
  }
  // save weights
  collection[key].points = points;
  return result * -1;
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

  return collection;
}

function initialMapping(word)
{
  word = word.toLowerCase();

  return {word: word, chars: sliceAndDice(word)};
}

/*

{ pos: 0,
      letter: 'f',
      canvas: [Canvas 128x128],
      type: 'mine_open',
      color: [Object],
      counts: [Object] },
    { pos: 1,
      letter: 's',
      canvas: [Canvas 128x128],
      type: 'their_open',
      color: [Object],
      counts: [Object] },

*/
