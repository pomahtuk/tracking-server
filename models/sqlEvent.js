/*jslint node: true, indent: 2*/

'use strict';

module.exports = function (sequelize, DataTypes) {

  // trackingEventsCache.push({
  //   type: eventType,
  //   browser: visitorBrowser,
  //   device: visitorDevice,
  //   os: visitorOs,
  //   lang: request.headers['accept-language'].split(';')[0].split(',')[0],
  //   ip: request.info.remoteAddress,
  //   referrer: request.info.referrer,
  //   timestamp: new Date()
  // });

  var Event = sequelize.define('Event', {
    visiorIdentity: { type: DataTypes.STRING, allowNull: false, references: 'Visitors', referencesKey: 'identity' },
    type          : { type: DataTypes.STRING, allowNull: false },
    expId         : { type: DataTypes.STRING, allowNull: false },
    expVariant    : { type: DataTypes.STRING, allowNull: false },
    apiKey        : { type: DataTypes.STRING, allowNull: false },
    browser       : { type: DataTypes.STRING, allowNull: false },
    device        : { type: DataTypes.STRING, allowNull: false },
    os            : { type: DataTypes.STRING, allowNull: false },
    lang          : { type: DataTypes.STRING, allowNull: false },
    ip            : { type: DataTypes.STRING, allowNull: false },
    referrer      : { type: DataTypes.STRING, allowNull: false },
    timestamp     : { type: DataTypes.DATE, allowNull: false }
  }, {
    classMethods: {
      associate: function (models) {
        Event.belongsTo(models.Visitor);
      }
    }
  });

  return Event;
};
