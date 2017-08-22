var User = require('../models/User');

module.exports = {
  initAvailability: function(options, callback){
    var userid = options.userid;
    var availability = {
      Sunday: { '12a': false, '1a': false, '2a': false, '3a': false, '4a': false,
      '5a': false, '6a': false, '7a': false, '8a': false, '9a': false,
      '10a': false, '11a': false, '12p': false, '1p': false, '2p': false,
      '3p': false, '4p': false, '5p': false, '6p': false, '7p': false,
      '8p': false, '9p': false, '10p': false, '11p': false},
      Monday: { '12a': false, '1a': false, '2a': false, '3a': false, '4a': false,
      '5a': false, '6a': false, '7a': false, '8a': false, '9a': false,
      '10a': false, '11a': false, '12p': false, '1p': false, '2p': false,
      '3p': false, '4p': false, '5p': false, '6p': false, '7p': false,
      '8p': false, '9p': false, '10p': false, '11p': false},
      Tuesday: { '12a': false, '1a': false, '2a': false, '3a': false, '4a': false,
      '5a': false, '6a': false, '7a': false, '8a': false, '9a': false,
      '10a': false, '11a': false, '12p': false, '1p': false, '2p': false,
      '3p': false, '4p': false, '5p': false, '6p': false, '7p': false,
      '8p': false, '9p': false, '10p': false, '11p': false},
      Wednesday: { '12a': false, '1a': false, '2a': false, '3a': false, '4a': false,
      '5a': false, '6a': false, '7a': false, '8a': false, '9a': false,
      '10a': false, '11a': false, '12p': false, '1p': false, '2p': false,
      '3p': false, '4p': false, '5p': false, '6p': false, '7p': false,
      '8p': false, '9p': false, '10p': false, '11p': false},
      Thursday: { '12a': false, '1a': false, '2a': false, '3a': false, '4a': false,
      '5a': false, '6a': false, '7a': false, '8a': false, '9a': false,
      '10a': false, '11a': false, '12p': false, '1p': false, '2p': false,
      '3p': false, '4p': false, '5p': false, '6p': false, '7p': false,
      '8p': false, '9p': false, '10p': false, '11p': false},
      Friday: { '12a': false, '1a': false, '2a': false, '3a': false, '4a': false,
      '5a': false, '6a': false, '7a': false, '8a': false, '9a': false,
      '10a': false, '11a': false, '12p': false, '1p': false, '2p': false,
      '3p': false, '4p': false, '5p': false, '6p': false, '7p': false,
      '8p': false, '9p': false, '10p': false, '11p': false},
      Saturday: { '12a': false, '1a': false, '2a': false, '3a': false, '4a': false,
      '5a': false, '6a': false, '7a': false, '8a': false, '9a': false,
      '10a': false, '11a': false, '12p': false, '1p': false, '2p': false,
      '3p': false, '4p': false, '5p': false, '6p': false, '7p': false,
      '8p': false, '9p': false, '10p': false, '11p': false}
    };
    User.findOne({_id: userid}, function(err, user){
      if (err){
        return callback(err);
      }
      if (!user) {
        return callback(new Error('No account with that id found.'));
      }
      user.availability = availability;
      user.save(function(err, user){
        if (err){
          callback(err, null)
        } else {
          callback(null, availability)
        }
      });
    });
  },
  getAvailability: function(options, callback){
    var userid = options.userid;
    User.findOne({_id: userid}, function(err, user){
      if (err){
        return callback(err);
      }
      if (!user) {
        return callback(new Error('No account with that id found.'));
      }
      callback(null, user.availability);
    });
  },
  updateAvailability: function(options, callback){
    console.log('reached controller');
    var userid = options.userid;
    var availability = options.availability;
    console.log(availability);
    User.findOne({_id: userid}, function(err, user){
      if (err){
        console.log(err);
        return callback(err);
      }
      if (!user) {
        console.log(err);
        return callback(new Error('No account with that id found.'));
      }
      user.availability = availability;
      console.log(user.availability);
      user.save(function(err, user){
        if (err){
          console.log(err);
          callback(err, null)
        } else {
          console.log('did not get error');
          callback(null, availability)
        }
      });
    });
  }
};
