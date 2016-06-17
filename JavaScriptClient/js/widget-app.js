requirejs.config({
    "baseUrl": "js",
    "paths": {
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min",
        //"okta-auth-sdk": "//ok1static.oktacdn.com/assets/js/sdk/okta-auth-js/1.0.2/okta-auth-js-1.0.2.min",
        "okta-auth-sdk": "OktaAuth.min",
        "okta-config": "config",
        "okta-signin": "//oidcdemos.oktapreview.com/js/sdk/okta-signin-widget/1.3.3/js/okta-sign-in-1.3.3.min"
    }
});

define(["jquery", "okta-signin", "okta-auth-sdk", "okta-config"], function ($, OktaSignIn, OktaAuth, OktaConfig) {

    // Set initial config options for widget
    var oktaSignIn = new OktaSignIn({
        baseUrl: OktaConfig.orgUrl,
        clientId: OktaConfig.clientId,
        logo: '/images/acme_logo.png',

        features: {
            securityImage: false,
            rememberMe: true,
            smsRecovery: true,
            selfServiceUnlock: true,
            multiOptionalFactorEnroll: true
        },

        helpLinks: {
            help: 'http://example.com/custom/help/page',

            // Override default recovery flows with custom links
            // forgotPassword: 'http://example.com/custom/forgot/pass/page',
            // unlock: 'http://example.com/custom/unlock/page',

            // Add additional links to widget
            custom: [
              { text: 'custom link text 1', href: 'http://example.com/custom/link1' },
              { text: 'custom link text 2', href: 'http://example.com/custom/link2' }
            ]
        },

        // See dictionary of labels
        labels: {
            "primaryauth.title": "Acme Partner Login",
            "primaryauth.username": "Partner ID",
            "primaryauth.username.tooltip": "Enter your @example.com username",
            "primaryauth.password": "Password",
            "primaryauth.password.tooltip": "Super secret password"
        }
    });

    // Call this method to render widget at document footer
    // or after all DOM content has loaded (e.g jQuery ready)
    oktaSignIn.renderEl(
      {
          // Options - in this case, only el is necessary, but can override anything
          // in the config here as well
          el: '#widget',
          authParams: {
              //scope: [
              //  'openid',
              //  'email',
              //  'profile'
              //]
              scope: OktaConfig.scope
          }
      },
      // Success function - called at terminal states like authStatus SUCCESS or
      // when the recovery emails are sent (forgot password and unlock)
      function (res) {
          if (res.status === 'SUCCESS') {
              console.log('User %s successfully authenticated %o', res.claims.email, res);
              showAuthUI(true);
              $('#claims').append('<pre><code class="json">' +
                JSON.stringify(res.claims, null, '  ') + '</code></pre>');
              $('pre code').each(function (i, block) {
                  hljs.highlightBlock(block);
              });

          }

          else if (res.status === 'FORGOT_PASSWORD_EMAIL_SENT') {
              // res.username - value user entered in the forgot password form
              console.log('User %s sent recovery code via email to reset password', res.username);
          }

          else if (res.status === 'UNLOCK_ACCOUNT_EMAIL_SENT') {
              // res.username - value user entered in the unlock account form
              console.log('User %s sent recovery code via email to unlock account', res.username);
          }
      },

      // Error function - called when the widget experiences an unrecoverable error
      function (err) {
          // err is an Error object (ConfigError, UnsupportedBrowserError, etc)
          console.log('Unexpected error authenticating user: %o', err);
          //showAuthUI(false);
      }
    );


    var idTokenKey = 'idToken';
    var sessionTokenKey = 'sessionToken';
    var userLoginKey = 'userLogin';


    var renderOktaWidget = function () {
        oktaSessionsMe(function (authenticated) {
            console.log('Is user authenticated? ' + authenticated);
            showAuthUI(authenticated);
            if (!authenticated) {
                oktaSignIn.renderEl(
                    { el: '#widget' },
                    function (res) {
                        if (res.status === 'SUCCESS') {
                            console.log(res);
                            var id_token = res.id_token || res.idToken;
                            console.log('id token: ' + id_token);
                            sessionStorage.setItem(idTokenKey, id_token);
                            sessionStorage.setItem(userLoginKey, res.claims.preferred_username);
                            showAuthUI(true);
                        }
                    },
                    function (err) { console.log('Unexpected error authenticating user: %o', err); }
                );
            }
            else {
                var userLogin = sessionStorage.getItem(userLoginKey);
                if (userLogin) {
                    console.log('user Login is ' + userLogin);
                }
            }
        });
    };

    var showAuthUI = function (isAuthenticated) {
        if (isAuthenticated) {
            console.log("hiding widget");
            $("#apicall-buttons").show();
            $('#widget').hide();
        }
        else {
            console.log("showing widget");
            $("#apicall-buttons").hide();
            $('#widget').show();
        }
    };

    var callSessionsMe = function () {
        oktaSessionsMe(function (authenticated) {
            console.log('Is user authenticated? ' + authenticated);
            return authenticated;
        });
    };

    var oktaSessionsMe = function (callBack) {
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: OktaConfig.orgUrl + "/api/v1/sessions/me",
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                console.log('setting success to true');
                console.log("My session: ");
                console.log(data);
                sessionStorage.setItem(sessionTokenKey, JSON.stringify(data));
                return callBack(true);
                //$('#logged-in-res').text(data);
            },
            error: function (textStatus, errorThrown) {
                console.log('setting success to false');
                //$('#logged-in-res').text("You must be logged in to call this API");
                return callBack(false);
            },
            async: true
        });
    };

    var closeSession = function (callback) {
        $.ajax({
            type: "DELETE",
            dataType: 'json',
            url: OktaConfig.orgUrl + "/api/v1/sessions/me",
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                console.log('success deleting session');
                console.log(data);
                console.log('removing session from sessionStorage');
                sessionStorage.removeItem(sessionTokenKey);
                console.log('removed session from sessionStorage');
                console.log('removing user Login from sessionStorage');
                sessionStorage.removeItem(userLoginKey);
                console.log('removed user Login from sessionStorage');
                console.log('removing id Token from sessionStorage');
                sessionStorage.removeItem(idTokenKey);
                console.log('removed id Token from sessionStorage');
                $('#logged-in-res').text('');
                return callback(true);
            },
            error: function (textStatus, errorThrown) {
                console.log('error deleting session: ' + JSON.stringify(textStatus));
                console.log(errorThrown);
                return callback(false);
            },
            async: true
        });
    };

    $('#btnSignOut').click(function () {
        console.log('signing out');
        oktaSessionsMe(function (authenticated) {
            if (authenticated) {
                var sessionToken;
                var sessionTokenString = sessionStorage.getItem(sessionTokenKey);
                if (sessionTokenString) {
                    sessionToken = JSON.parse(sessionTokenString);
                    console.log(sessionToken);
                    var sessionId = sessionToken.id;
                    console.log('closing session ' + sessionId);
                    closeSession(function (success) {
                        console.log('Is session closed? ' + success);
                        if (success)
                            renderOktaWidget();
                    })
                }
            }
        });

    });

    $('#btnRenewIDToken').click(function () {
        oktaSignIn.idToken.refresh(null, function (res) {
            console.log('New ID token: ', res);
            //$('#claims').
            $('#claims').html('<pre><code class="json">' +
  JSON.stringify(res.claims, null, '  ') + '</code></pre>');
            $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });
            return res;
        });
    });

    renderOktaWidget();


});
