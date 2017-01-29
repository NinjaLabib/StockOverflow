var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var googleFinance = require('google-finance');
var _ = require('lodash');
var async = require('async');
var await = require('await')
 app     = express();
const months = {'Jan':1, 'Feb':2, 'Mar': 3, 'Apr': 4,
 'May':5, 'Jun':6, 'Jul':7, 'Aug':8, 'Sep':9,'Oct':10,
 'Nov':11, 'Dec':12};
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
      // months = {'Jan':1, 'Feb':2, 'Mar': 3, 'Apr': 4,
      // 'May':5, 'Jun':6, 'Jul':7, 'Aug':8, 'Sep':9,'Oct':10,
      // 'Nov':11, 'Dec':12};
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
        quotes:quotes,
        max: max,
        min:min
      });

      // res.send({
      //   max: max,
      //   min:min
      // });

  });

})
function filterNews(options, callback) {
  request(options,
    function(err, res3, body) {
      console.log(body);
      clean = JSON.parse(body);
      callback(err, JSON.parse(body));
    }
  );
}

function numDays(month, year){
  if (month == 0 || month == 3 || month == 5 || month == 7 || month == 8 ||
  month == 10 || month == 12) {
    return 31;
  }
  if(month == 2){
    if(year%4 == 0){
      return 29;
    }
    return 28;
  }
  return 30;
}
app.get('/getNews', function(req, res){
  startYear = parseInt(req.query.start.substring(0,4));
  startMonth = parseInt(req.query.start.substring(4,6));
  endYear = parseInt(req.query.end.substring(0,4));
  endMonth = parseInt(req.query.end.substring(4,6));
  monthsNum = (endYear - startYear)*12 + endMonth - startMonth;
  company = req.query.company;

  options = [];

    if(startMonth < 10){
      startMonth = "0" + startMonth;
    }
    if(endMonth < 10){
      endMonth = "0" + endMonth;
    }
    begin =  parseInt(""+startYear+""+startMonth+"01");
    end = parseInt(""+endYear+""+endMonth+"01");

    req = {
        url: "https://api.nytimes.com/svc/search/v2/articlesearch.json",
        qs: {
          'api-key': "b572113326ca44698852b86b199fe673",
          'q': company,
          'begin_date':begin,
          'end_date': end,
          'fl': "web_url,snippet,lead_paragraph,pub_date,headline",
          'page':1,
          'fq': "document_type:article",
          'facet_filter': "true"
        }
      }
    options = _.concat(options,req);



  async.map(options, filterNews, function (err, results){
    if (err) return console.log(err);
    articlePerMonth = {};
    size = 0;
      clean = results[0];

      clean = clean.response;
      if(clean){
        clean = clean.docs;
        for(j = 0; j < clean.length;j++){
          art = clean[j];
          dateUnparsed = ""+art.pub_date;
          dateSplit = dateUnparsed.substring(0,10);
          dateParts = dateSplit.split("-");
          yearMonth = dateParts[0]+dateParts[1];
          if(!_.find(articlePerMonth, yearMonth)){
            articlePerMonth[yearMonth] = art;
            size++;
          }
          if(size >= monthsNum){
            j = results.length;
          }

      }
    }
    res.send(articlePerMonth);
  });
// app.get('/getNews', function(req, res){
//   startYear = parseInt(req.query.start.substring(0,4));
//   startMonth = parseInt(req.query.start.substring(4,6));
//   endYear = parseInt(req.query.end.substring(0,4));
//   endMonth = parseInt(req.query.end.substring(4,6));
//   monthsNum = (endYear - startYear)*12 + endMonth - startMonth;
//   company = req.query.company;
//
//   options = [];
//   for(n = 0; n < monthsNum; n++){
//     currentMonth = startMonth + n;
//     currentYear = startYear;
//     if(currentMonth > 12) {
//       addedYears = currentMonth % 12;
//       currentYear = currentYear + addedYears;
//       currentMonth = currentMonth - 12*addedYears;
//     }
//     if(currentMonth < 10){
//       currentMonth = "0"+currentMonth;
//     }
//     begin =  parseInt(""+currentYear+""+currentMonth+"01");
//     end = parseInt(""+currentYear+""+currentMonth+""+numDays(currentMonth,currentYear));
//
//     req = {
//         url: "https://api.nytimes.com/svc/search/v2/articlesearch.json",
//         qs: {
//           'api-key': "b572113326ca44698852b86b199fe673",
//           'q': company,
//           'begin_date':begin,
//           'end_date': end,
//           'fl': "web_url,snippet,lead_paragraph,pub_date",
//           'page':1,
//           'fq': "document_type:article",
//           'facet_filter': "true"
//         }
//       }
//       // req = {
//       //     url: "https://api.nytimes.com/svc/search/v2/articlesearch.json",
//       //     qs: {
//       //       'api-key': "b572113326ca44698852b86b199fe673",
//       //       'q': 'GOOGLE',
//       //       'begin_date': "20150201",
//       //       'end_date': "20150401",
//       //       'page':1,
//       //       'facet_filter': "true"
//       //
//       //     }
//       //   }
//     options = _.concat(options,req);
//
//
//   }
//   async.map(options, filterNews, function (err, results){
//     if (err) return console.log(err);
//     for(j = 0; j < results.length;j++){
//       clean = results[j];
//
//       clean = clean.response;
//       if(clean){
//         clean = clean.docs;
//         clean = clean[0];
//         dateUnparsed = ""+clean.pub_date;
//         dateSplit = dateUnparsed.substring(0,10);
//         clean = {
//           url: clean.web_url,
//           snip: clean.snippet,
//           lead_para: clean.lead_paragraph,
//           date: dateSplit
//         }
//         console.log(clean);
//         results[j] = clean;
//       }
//     }
//     res.send(results);
//   });

//   var filterNews = function(n, callback) {
//     currentMonth = startMonth + n;
//     currentYear = startYear;
//     if(currentMonth > 12) {
//       addedYears = currentMonth % 12;
//       currentYear = currentYear + addedYears;
//       currentMonth = currentMonth - 12*addedYears;
//     }
//     await(request.get({
//     url: "https://api.nytimes.com/svc/search/v2/articlesearch.json",
//     qs: {
//       'api-key': "b572113326ca44698852b86b199fe673",
//       'q': company,
//       'begin_date': ""+currentYear+""+currentMonth+"01",
//       'end_date': ""+currentYear+""+currentMonth+"31"
//     },
//   }), function(err, response, body) {
//     body = JSON.parse(body);
//     callback(null,{
//       filtered: body.response,
//       called: currentMonth
//     })
//   })
//
// };
//
// async.times(months, function(n, next) {
//     await(filterNews(n, function(err, news) {
//         next(err, news);
//     }));
// }, function(err, filteredNews) {
//     res.send(filteredNews);
// });
//
//

})


app.listen(port_number);

console.log('Magic happens on port 8081');

exports = module.exports = app;
