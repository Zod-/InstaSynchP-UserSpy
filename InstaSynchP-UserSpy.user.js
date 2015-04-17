// ==UserScript==
// @name        InstaSynchP UserSpy
// @namespace   InstaSynchP
// @description Log user actions into the chat (login/off, video add)

// @version     1.0.8
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
    ')',
    'logged on'
  );
};

UserSpy.prototype.getLogOffMessage = function (user) {
  'use strict';
  //user(ip) logged off
  return ''.concat(
    user.username,
    '(',
    user.ip,
    ')',
    'logged off'
  );
};

UserSpy.prototype.executeOnce = function () {
  "use strict";
  var _this = this;
  events.on(_this, 'RenameUser', function (ignore1, ignore2, user) {
    if (gmc.get('rename-log')) {
      addSystemMessage(_this.getRenameMessage(user));
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
  'use strict';
  var _this = this;
  if (!gmc.get('add-video-log')) {
    return;
  }

  addSystemMessage(_this.getAddVideoMessage(video));
};

UserSpy.prototype.resetVariables = function () {
  "use strict";
  var th = this;
  //remove events when disconnecting/changing room and readd at postConnect
  events.unbind('AddUser', th.userLoggedOn);
  events.unbind('RemoveUser', th.userLoggedOff);
  events.unbind('AddVideo', th.videoAdded);
};

UserSpy.prototype.userLoggedOn = function (user) {
  "use strict";
  var _this = this;
  if (!user.loggedin && !gmc.get('login-off-greynames-log')) {
    return;
  }
  if (gmc.get('login-off-log')) {
    addSystemMessage(_this.getLogOnMessage(user));
  }
};

UserSpy.prototype.userLoggedOff = function (id, user) {
  "use strict";
  var _this = this;
  if (!user.loggedin && !gmc.get('login-off-greynames-log')) {
    return;
  }
  if (gmc.get('login-off-log')) {
    addSystemMessage(_this.getLogOffMessage(user));
  }
};

window.plugins = window.plugins || {};
window.plugins.userSpy = new UserSpy('1.0.8');
