var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var googleFinance = require('google-finance');
var _ = require('lodash');
var app     = express();
var port_number =(process.env.PORT || 8081);
app.all('*', function(req, res, next) {
     var origin = req.get('origin');
     res.header('Access-Control-Allow-Origin', origin);
     res.header("Access-Control-Allow-Headers", "X-Requested-With");
     res.header('Access-Control-Allow-Headers', 'Content-Type');
     next();
});

app.get('/getData', function(req, res){
  console.log(req.query.from);
  console.log(req.query.to);
  console.log(req.query.ticker);

  fromR = req.query.from;
  toR = req.query.to;
  tickerR = req.query.ticker;
  max = -1;
  min = -1;
  googleFinance.historical({
    symbol:tickerR,//+req.ticker
    from: fromR, //req.from
    to: toR //req.to
  }, function (err, quotes) {
      console.log(""+quotes[2].date);
      months = {'Jan':1, 'Feb':2, 'Mar': 3, 'Apr': 4,
      'May':5, 'Jun':6, 'Jul':7, 'Aug':8, 'Sep':9,'Oct':10,
      'Nov':11, 'Dec':12};
      x = [];
      y = [];
      max = -1;
      min = Number.MAX_SAFE_INTEGER;
      for(i = 0; i < quotes.length; i++){
        dateUnparsed = ""+quotes[i].date;
        dateSplit = dateUnparsed.split(" ");
        dateParsed = "" + _.get(months, dateSplit[1]) + "-"
          + dateSplit[2] + "-" + dateSplit[3];
        close = quotes[i].close;
        if (close > max) {
          max = close;
        }
        if (close < max) {
          min = close;
        }
        refined = {
          x: dateParsed,
          y: close
        };
        quotes[i] = refined;

        // x = _.concat(x,dateParsed);
        // y = _.concat(y,close);

      }

      res.send(quotes);
      // res.send({
      //   quotePairs:quotes,
      //   max: max,
      //   min:min
      // });

  });

})
app.get('/getBounds', function(req, res){
  console.log(req.query.from);
  console.log(req.query.to);
  console.log(req.query.ticker);

  fromR = req.query.from;
  toR = req.query.to;
  tickerR = req.query.ticker;
  max = -1;
  min = -1;
  googleFinance.historical({
    symbol:tickerR,//+req.ticker
    from: fromR, //req.from
    to: toR //req.to
  }, function (err, quotes) {
      console.log(""+quotes[2].date);
      months = {'Jan':1, 'Feb':2, 'Mar': 3, 'Apr': 4,
      'May':5, 'Jun':6, 'Jul':7, 'Aug':8, 'Sep':9,'Oct':10,
      'Nov':11, 'Dec':12};
      x = [];
      y = [];
      max = -1;
      min = Number.MAX_SAFE_INTEGER;
      for(i = 0; i < quotes.length; i++){
        dateUnparsed = ""+quotes[i].date;
        dateSplit = dateUnparsed.split(" ");
        dateParsed = "" + _.get(months, dateSplit[1]) + "-"
          + dateSplit[2] + "-" + dateSplit[3];
        close = quotes[i].close;
        if (close > max) {
          max = close;
        }
        if (close < min) {
          min = close;
        }
        refined = {
          x: dateParsed,
          y: close
        };
        quotes[i] = refined;

        // x = _.concat(x,dateParsed);
        // y = _.concat(y,close);

      }


      res.send({
        max: max,
        min:min
      });

  });

})

// app.get('/getNews', function(req, res){
//
//   fromR = req.query.from;
//   toR = req.query.to;
//   tickerR = req.query.;
//   max = -1;
//   min = -1;
//   googleFinance.historical({
//     symbol:tickerR,//+req.ticker
//     from: fromR, //req.from
//     to: toR //req.to
//   }, function (err, quotes) {
//       console.log(""+quotes[2].date);
//       months = {'Jan':1, 'Feb':2, 'Mar': 3, 'Apr': 4,
//       'May':5, 'Jun':6, 'Jul':7, 'Aug':8, 'Sep':9,'Oct':10,
//       'Nov':11, 'Dec':12};
//       x = [];
//       y = [];
//       max = -1;
//       min = Number.MAX_SAFE_INTEGER;
//       for(i = 0; i < quotes.length; i++){
//         dateUnparsed = ""+quotes[i].date;
//         dateSplit = dateUnparsed.split(" ");
//         dateParsed = "" + _.get(months, dateSplit[1]) + "-"
//           + dateSplit[2] + "-" + dateSplit[3];
//         close = quotes[i].close;
//         if (close > max) {
//           max = close;
//         }
//         if (close < min) {
//           min = close;
//         }
//         refined = {
//           x: dateParsed,
//           y: close
//         };
//         quotes[i] = refined;
//
//         // x = _.concat(x,dateParsed);
//         // y = _.concat(y,close);
//
//       }
//
//
//       res.send({
//         max: max,
//         min:min
//       });
//
//   });
//
// })


app.listen(port_number);

console.log('Magic happens on port 8081');

exports = module.exports = app;
