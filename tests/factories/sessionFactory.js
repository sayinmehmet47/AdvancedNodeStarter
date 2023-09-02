const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');

class SessionFactory {
  constructor(user) {
    this.user = user;
    this.session = this.createSession();
    this.sig = this.createSig();
  }

  createSession() {
    const sessionObject = {
      passport: {
        user: this.user._id.toString(),
      },
    };
    const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString(
      'base64'
    );
    return sessionString;
  }

  createSig() {
    const keygrip = new Keygrip([keys.cookieKey]);
    const sig = keygrip.sign('session=' + this.session);
    return sig;
  }
}

module.exports = SessionFactory;
