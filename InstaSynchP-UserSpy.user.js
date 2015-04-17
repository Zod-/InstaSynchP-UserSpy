// ==UserScript==
// @name        InstaSynchP UserSpy
// @namespace   InstaSynchP
// @description Log user actions into the chat (login/off, video add)

// @version     1.0.9
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-UserSpy
// @license     MIT

// @include     *://instasync.com/r/*
// @include     *://*.instasync.com/r/*
// @grant       none
// @run-at      document-start

// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/InstaSynchP%20Library.js?version=37716
// ==/UserScript==
function UserSpy(version) {
  'use strict';
  this.version = version;
  this.name = 'InstaSynchP UserSpy';
  this.settings = [{
    label: 'Login/off',
    id: 'login-off-log',
    type: 'checkbox',
    'default': true,
    section: ['Chat', 'UserSpy']
  }, {
    label: 'Login/off greynames',
    id: 'login-off-greynames-log',
    type: 'checkbox',
    'default': true,
    section: ['Chat', 'UserSpy']
  }, {
    label: 'Rename',
    id: 'rename-log',
    type: 'checkbox',
    'default': true,
    section: ['Chat', 'UserSpy']
  }, {
    label: 'Add video',
    id: 'add-video-log',
    type: 'checkbox',
    'default': true,
    section: ['Chat', 'UserSpy']
  }];
}

UserSpy.prototype.getAddVideoMessage = function (video) {
  'use strict';
  //user added <a href="url">title</a>
  return ''.concat(
    video.addedby,
    ' added ',
    '<a target="_blank" href="',
    urlParser.create({
      videoInfo: video.info,
      format: 'long'
    }),
    '">',
    video.title.substr(0, 240),
    '</a>'
  );
};

UserSpy.prototype.getRenameMessage = function (user) {
  'use strict';
  //ip renamed to username
  return ''.concat(
    user.ip,
    ' renamed to ',
    user.username
  );
};

UserSpy.prototype.getLogOnMessage = function (user) {
  'use strict';
  //user(ip) logged on
  return ''.concat(
    user.username,
    '(',
    user.ip,
    ') logged on'
  );
};

UserSpy.prototype.getLogOffMessage = function (user) {
  'use strict';
  //user(ip) logged off
  return ''.concat(
    user.username,
    '(',
    user.ip,
    ') logged off'
  );
};

UserSpy.prototype.executeOnce = function () {
  'use strict';
  var _this = this;
  events.on(_this, 'RenameUser', function (ignore1, ignore2, user) {
    if (gmc.get('rename-log')) {
      addSystemMessage(_this.getRenameMessage(user));
    }
  });
};

UserSpy.prototype.postConnect = function () {
  'use strict';
  var _this = this;
  //add events after we connected so it doesn't spam the chat for every user/video
  events.on(_this, 'AddUser', _this.userLoggedOn);
  events.on(_this, 'RemoveUser', _this.userLoggedOff);
  events.on(_this, 'AddVideo', _this.videoAdded);
};

UserSpy.prototype.videoAdded = function (video) {
  'use strict';
  var _this = this;
  if (gmc.get('add-video-log')) {
    addSystemMessage(_this.getAddVideoMessage(video));
  }
};

UserSpy.prototype.resetVariables = function () {
  'use strict';
  var _this = this;
  //remove events when disconnecting/changing room and readd at postConnect
  events.unbind('AddUser', _this.userLoggedOn);
  events.unbind('RemoveUser', _this.userLoggedOff);
  events.unbind('AddVideo', _this.videoAdded);
};

UserSpy.prototype.isUserLogged = function (user) {
  'use strict';
  return gmc.get('login-off-log') &&
    (user.loggedin || gmc.get('login-off-greynames-log'));
};

UserSpy.prototype.userLoggedOn = function (user) {
  'use strict';
  var _this = this;
  if (_this.isUserLogged(user)) {
    addSystemMessage(_this.getLogOnMessage(user));
  }
};

UserSpy.prototype.userLoggedOff = function (ignore, user) {
  'use strict';
  var _this = this;
  if (_this.isUserLogged(user)) {
    addSystemMessage(_this.getLogOffMessage(user));
  }
};

window.plugins = window.plugins || {};
window.plugins.userSpy = new UserSpy('1.0.9');
