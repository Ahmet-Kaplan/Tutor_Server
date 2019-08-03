var User = require('../models/User')

/**
 * Helper function that, given a single users's
 * availability, adds when they are free to the
 * aggAvailabilities object
 * @param {*} availability
 */
function aggregateAvailabilities (availability, aggAvailabilities) {
  // for (const day in availability) {
  Object.keys(availability).map(day => {
    Object.keys(availability[day]).map(time => {
      // create headers based on the user's availability object
      if (!aggAvailabilities.daysOfWeek) {
        aggAvailabilities.daysOfWeek = Object.keys(availability)
        aggAvailabilities.daysOfWeek.shift() // gets rid of $init enum param
      }
      if (!aggAvailabilities.timesOfDay) {
        aggAvailabilities.timesOfDay = Object.keys(availability[day])
        aggAvailabilities.timesOfDay.shift() // gets rid of $init enum param
      }
      // gets corresponding day and time index inorder to store in aggAvailabilities table
      let dayIndex = aggAvailabilities.daysOfWeek.indexOf(day)
      let timeIndex = aggAvailabilities.timesOfDay.indexOf(time)

      if (availability[day][time]) {
        aggAvailabilities.table[dayIndex][timeIndex]++
      }
    })
  })
  return aggAvailabilities
}

/**
 * Helper function that finds the minimum and maxmimum number of
 * volunteers who signed up that week
 * @param {*} aggAvailabilities
 */
function findMinAndMax (aggAvailabilities) {
  let flatTable = aggAvailabilities.table.flat()
  aggAvailabilities.min = Math.min.apply(Math, flatTable)
  aggAvailabilities.max = Math.max.apply(Math, flatTable)
  return aggAvailabilities
}

module.exports = {
  /**
   * Gets all users who are volunteers, and who are certified in the
   * subject passed in, and aggregates their availability tables into
   * aggAvailabilities.table
   * @param {*} options
   * @param {*} callback
   */
  getVolunteersAvailability: function (options, callback) {
    var certifiedSubjectQuery = options.certifiedSubject + '.passed'
    User.find({ isVolunteer: true, hasSchedule: true, [certifiedSubjectQuery]: true, availability: { $exists: true } }, function (err, users) {
      // defining and resetting variables
      var aggAvailabilities = {}
      aggAvailabilities.table = Array(7).fill(0).map(() => Array(24).fill(0))
      aggAvailabilities.min = null
      aggAvailabilities.max = 0

      if (err) {
        return callback(null, err)
      } else {
        aggAvailabilities = users.reduce(function (aggAvailabilities, user) {
          return aggregateAvailabilities(user.availability, aggAvailabilities)
        }, aggAvailabilities)
        aggAvailabilities = findMinAndMax(aggAvailabilities)
        return callback(aggAvailabilities, null)
      }
    })
  },

  /**
   * Gets all users who are volunteers
   * @param {*} callback
   */
  getVolunteers: function (callback) {
    User.find({ isVolunteer: true }, function (err, users) {
      if (err) {
        return callback(null, err)
      } else {
        return callback(users, null)
      }
    })
  }
}