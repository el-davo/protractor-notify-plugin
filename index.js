var notifier = require('node-notifier');
var interpolate = require('interpolate');

var NotifyPlugin = function () {
    this.passCount = 0;
    this.failCount = 0;
    this.browserName = '';
    this.defaults = {
        notifier: 'notificationcenter',
        success: {
            title: 'Success',
            message: 'All {passed} e2e test(s) have passed on {browser}',
            icon: __dirname + '/assets/pass.png'
        },
        fail: {
            title: 'Fail',
            message: '{failed} e2e test(s) have failed on {browser}',
            icon: __dirname + '/assets/fail.png'
        },
        subtitle: 'E2E',
        sound: false,
        wait: false,
        notifyOnErrorOnly: false
    }
};

NotifyPlugin.prototype.postTest = function (passed, info) {
    passed ? this.passCount++ : this.failCount++;
    var me = this;
    browser.getCapabilities().then(function (cap) {
        me.browserName = cap.caps_.browserName;
    });
    return;
};

NotifyPlugin.prototype.teardown = function () {

    var Notification = require('node-notifier/notifiers/' + (this.config.notifier || this.defaults.notifier));

    var notification = {
        message: '',
        title: '',
        sound: this.config.sound !== undefined ? this.config.sound : this.defaults.sound,
        subtitle: this.config.subtitle || this.defaults.subtitle,
        wait: this.config.wait || this.defaults.wait
    }

    if (this.failCount === 0) {
        var title = (this.config.success || {}).title || this.defaults.success.title;
        var message = (this.config.success || {}).message || this.defaults.success.message;
        notification.message = interpolate(message, {passed: this.passCount, failed: this.failCount, browser: this.browserName});
        notification.title = interpolate(title, {passed: this.passCount, failed: this.failCount, browser: this.browserName});
        notification.icon = (this.config.success || {}).icon || this.defaults.success.icon;
    } else {
        var title = (this.config.fail || {}).title || this.defaults.fail.title;
        var message = (this.config.fail || {}).message || this.defaults.fail.message;
        notification.message = interpolate(message, {passed: this.passCount, failed: this.failCount, browser: this.browserName});
        notification.title = interpolate(title, {passed: this.passCount, failed: this.failCount, browser: this.browserName});
        notification.icon = (this.config.fail || {}).icon || this.defaults.fail.icon;
    }

    if ((this.config.notifyOnErrorOnly === true || this.defaults.notifyOnErrorOnly)) {
        if (this.failCount > 0) {
            new Notification(this.config.options || {}).notify(notification);
        }
    } else {
        new Notification(this.config.options || {}).notify(notification);
    }

    return;
};

var notifyPlugin = new NotifyPlugin();

module.exports = notifyPlugin;
