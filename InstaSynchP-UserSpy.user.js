// ==UserScript==
// @name        InstaSynchP UserSpy
// @namespace   InstaSynchP
// @description Log user actions into the chat (login/off, video add)

// @version     1.0.6
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-UserSpy
// @license     MIT

// @include     http://*.instasynch.com/*
// @include     http://instasynch.com/*
// @include     http://*.instasync.com/*
// @include     http://instasync.com/*
// @grant       none
// @run-at      document-start

// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/InstaSynchP%20Library.js
// ==/UserScript==
function UserSpy(version) {
  "use strict";
  this.version = version;
  this.name = 'InstaSynchP UserSpy';
  this.settings = [{
    'label': 'Login/off',
    'id': 'login-off-log',
    'type': 'checkbox',
    'default': true,
    'section': ['Chat', 'UserSpy']
  }, {
    'label': 'Login/off greynames',
    'id': 'login-off-greynames-log',
    'type': 'checkbox',
    'default': true,
    'section': ['Chat', 'UserSpy']
  }, {
    'label': 'Rename',
    'id': 'rename-log',
    'type': 'checkbox',
    'default': true,
    'section': ['Chat', 'UserSpy']
  }, {
    'label': 'Add video',
    'id': 'add-video-log',
    'type': 'checkbox',
    'default': true,
    'section': ['Chat', 'UserSpy']
  }];
}

UserSpy.prototype.executeOnce = function () {
  "use strict";
  var th = this;
  events.on(th, 'RenameUser', function (ignore1, ignore2, user) {
    if (gmc.get('rename-log')) {
      addSystemMessage('{0} renamed to {1}'.format(user.ip, user.username));
    }
  });
};

UserSpy.prototype.postConnect = function () {
  "use strict";
  var th = this;
  //add events after we connected so it doesn't spam the chat for every user/video
  events.on(th, 'AddUser', th.userLoggedOn);
  events.on(th, 'RemoveUser', th.userLoggedOff);
  events.on(th, 'AddVideo', th.videoAdded);
};

UserSpy.prototype.videoAdded = function (video) {
  if (!gmc.get('add-video-log')) {
    return;
  }
  var url = urlParser.create({
      videoInfo: video.info,
      format: 'long'
    }),
    len = 240 + url.length,
    message = '{0}</a>'.format('{0} added <a target="_blank" href="{1}">{2}'.format(
      video.addedby,
      url,
      video.title).substr(0, len));
  addSystemMessage(message);
};

UserSpy.prototype.resetVariables = function () {
  "use strict";
  var th = this;
  //remove events when disconnecting/changing room and readd at postConnect
  events.unbind('AddUser', th.userLoggedOn);
  events.unbind('RemoveUser', th.userLoggedOff);
  events.unbind('RenameUser', th.userRenamed);
  events.unbind('AddVideo', th.videoAdded);
};

UserSpy.prototype.userLoggedOn = function (user) {
  "use strict";
  if (!user.loggedin && !gmc.get('login-off-greynames-log')) {
    return;
  }
  if (gmc.get('login-off-log')) {
    addSystemMessage('{0}({1}) logged on.'.format(user.username, user.ip));
  }
};

UserSpy.prototype.userLoggedOff = function (id, user) {
  "use strict";
  if (!user.loggedin && !gmc.get('login-off-greynames-log')) {
    return;
  }
  if (gmc.get('login-off-log')) {
    addSystemMessage('{0}({1}) logged off.'.format(user.username, user.ip));
  }
};

window.plugins = window.plugins || {};
window.plugins.userSpy = new UserSpy('1.0.6');
