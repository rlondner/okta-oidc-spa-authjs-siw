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
      orgUrl: 'https://example.oktapreview.com',
      clientId: 'ViczvMucBWT14qg3lAM1',
      scope: ['openid', 'email', 'phone', 'address', 'groups', 'profile', 'groups', 'call-api'],
      redirectUri: 'http://localhost:8081',
      webApiUrl: 'https://localhost:44301',
      callApiWithAT : false
};

}));
