(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.OktaConfig = factory();
  }
}(this, function () {

    return {
      orgUrl: 'https://oidcdemos.oktapreview.com',
      clientId: 'guHLNDnxiATk0zYXUcHZ',
      scope: ['openid', 'email', 'profile', 'phone', 'groups'],
      redirectUri: 'http://localhost:8080'
    };

}));
