requirejs.config({
    "baseUrl": "js",
    "paths": {
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min",
        //"okta-auth-sdk": "//ok1static.oktacdn.com/assets/js/sdk/okta-auth-js/1.0.2/okta-auth-js-1.0.2.min",
        "okta-auth-sdk": "./OktaAuth.min",
        "okta-config": "config"
    }
});

define(["jquery", "okta-auth-sdk", "okta-config"], function ($, OktaAuth, OktaConfig) {

    console.log('Okta Configuration: %o', OktaConfig);
    console.log(OktaAuth);
    var client = new OktaAuth({
        url: OktaConfig.orgUrl,
        clientId: OktaConfig.clientId,
        redirectUri: OktaConfig.redirectUri
    });

    var idTokenKey = 'idToken';
    var accessTokenKey = 'accessToken';

    var resetDisplay = function () {
        //console.log("resetDisplay");
        $('div.error').remove();
        $('#claims').empty();
        $('#api-resources').empty();
    };

    var showSignIn = function () {
        //console.log('showing sign-in form');
        $('#sign-in-form').show();
        $('#authenticated-buttons').hide();

    };

    var hideSignIn = function () {
        //console.log('hiding sign-in form');
        $('#sign-in-form').hide();
        $('#authenticated-buttons').show();
    };

    var renderUI = function () {
        //console.log("rendering UI");
        client.session.exists().done(function (result) {
            if (result == true) {
                hideSignIn();
            }
            else {
                showSignIn();
                resetDisplay();
            }
        });
    };

    var displayClaims = function (claims) {
        $('#claims').append('<pre><code class="json">' +
          JSON.stringify(claims, null, '  ') + '</code></pre>');
        $('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
        });
    };

    var displayError = function (msg) {
        $('div.error').remove();
        $('div.login-box').append('<div class="error"><p>' + msg + '</p></div>');
    }

    var callUnsecureWebApi = function () {
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: OktaConfig.webApiUrl + "/unprotected",
            success: function (data) {
                console.log(data);
                $('#claims').empty();
                $('#claims').text(data);
            }
        });
    }

    var callSecureWebApi = function () {
        resetDisplay();
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: OktaConfig.webApiUrl + "/protected",
            //headers: {
            //    Authorization: 'Bearer ' + id_token
            //},
            beforeSend: function (xhr) {
                var token = localStorage.getItem(idTokenKey);
                if (OktaConfig.callApiWithAT) {
                    console.log("using the Access Token to call the Resource Server")
                    token = localStorage.getItem(accessTokenKey);
                }
                //test with invalid token
                //token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlU1UjhjSGJHdzQ0NVFicTh6Vk8xUGNDcFhMOHlHNkljb3ZWYTNsYUNveE0ifQ.eyJ2ZXIiOjEsImp0aSI6IkFULjlZRkpfbjdWS3ZLaGNHVG9Lc2F0OVcyX2wtUzAxT0ltZGlCc1pLb0l0dWsiLCJpc3MiOiJodHRwczovL29pZGNkZW1vcy5va3RhcHJldmlldy5jb20vYXMvb3JzNmRyN2t4OE5FbUVPejQwaDciLCJhdWQiOiJ3TWxvMGw5VDNiZW5jTUsyZXhZOSIsInN1YiI6IjAwdTZkcjdqYnZZRTB5ZDlmMGg3IiwiaWF0IjoxNDY5MTYyMzM2LCJleHAiOjE0NjkxNjU5MzYsImNpZCI6IndNbG8wbDlUM2JlbmNNSzJleFk5IiwidWlkIjoiMDB1NmRyN2pidllFMHlkOWYwaDciLCJzY3AiOlsib3BlbmlkIiwiZW1haWwiLCJwcm9maWxlIiwiYWRkcmVzcyIsInBob25lIiwiZ3JvdXBzIiwib2ZmbGluZV9hY2Nlc3MiXSwiY3VzdG9tLXVzZXJuYW1lIjoiYm9iLWFwcHVzZXJAbWFpbGluYXRvci5jb20ifQ.bHcVHHr6lSwldc1gCW7YC3m4Iig4_2iK-QYBIv7TnYTQAnDlbjRhzxlUiA88ph-pNXPvyz80434-9IB3-1Bq2a19EPyXdBytjOos7dJY2LvUSKa-MprD7W94DsdyczgNHh8SmoiGCeelv8y2apE90ph_O3VjwyGjVvCteY_PIRYPtDsXFOhOTxmndjzmkVJeBxs2Rm8Ve7PDR0Kx11N0NgIxYVsyC7PmW-TjNIhdRZDZx20q7FnXSi6lGVvNrLIEA2DaqhpuHFr5_8vhYVsleDIbpsq3RqrT2whOARAo-NZ3PFko1TNUp3iwoQZHBtRFvTEKhDjWqpL8P3t0haoViQ"
                console.log("callSecureWebApi with Token: " + token);
                if (token) {
                    xhr.setRequestHeader("Authorization", "Bearer " + token);
                }
            },
        }).done(function (data) {
            $('#claims').empty();
            $('#claims').text(data);
        }).fail(function (jqXHR, textStatus) {
            console.log('error while calling protected web api: ' + textStatus);
            var msg = 'Unable to fetch protected resource';
            msg += '<br>' + 'You must be signed in AND have the proper permissions to access the protected API endpoint, '
            msg += '<br>' +  'specifically be part of the Marketing or Finance group (see groups scope value)'
            msg += '<br>' + jqXHR.status + ' ' + jqXHR.responseText;
            if (jqXHR.status === 401) {
                msg += '<br>Your token may be expired'
            }
            $('#claims').empty();
            displayError(msg);
        });
    };

    $(document).ready(function () {

        renderUI();

        $('#btn-sign-in').click(function () {
            resetDisplay();
            client.signIn({
                username: $('#username').val(),
                password: $('#password').val()
            }).then(function (tx) {
                switch (tx.status) {
                    case 'SUCCESS':
                        client.token.getWithoutPrompt({
                            //client.idToken.authorize({
                            //responseType: 'id_token',
                            responseType: ['id_token', 'token'],
                            //responseType: ['id_token'],
                            scopes: OktaConfig.scope,
                            sessionToken: tx.sessionToken
                        })
                          .then(function (res) {
                              console.log('Authorize response: ', res);
                              //console.log('id_token: %s', res[0].idToken);
                              //console.log('access_token: %s', res[1].accessToken);
                              if (Array.isArray(res)) {
                                  displayClaims(res[0].claims);
                                  localStorage.setItem(idTokenKey, res[0].idToken);
                                  if (res.length == 2) {
                                      localStorage.setItem(accessTokenKey, res[1].accessToken);
                                  }
                              }
                              else {
                                  displayClaims(res.claims);
                                  localStorage.setItem(idTokenKey, res.idToken)
                              }
                              renderUI();
                          })
                          .fail(function (err) {
                              console.log(err);
                              displayError(err.message);
                          })
                        break;
                    default:
                        throw 'We cannot handle the ' + tx.status + ' status';
                }

            }).fail(function (err) {
                console.log(err);
                var message = err.errorCauses.length > 0 ? err.errorCauses[0].errorSummary : err.message;
                displayError(message);
            });
        });

        $('#btn-signout').click(function () {
            client.session.exists().done(function (result) {
                if (result == true) {
                    client.session.close().done(function (result) {
                        console.log(result);
                        renderUI();
                    })
                }
            });
        });

        $('#btn-refresh').click(function () {
            resetDisplay();
            var idToken = localStorage.getItem(idTokenKey);
            if (!idToken) {
                return displayError('You must first sign-in before you can renew your ID token!');
            }
            client.idToken.refresh({
                scopes: OktaConfig.scope
            })
              .then(function (res) {
                  console.log('id_token: %s', idToken);
                  displayClaims(res.claims);
                  localStorage.setItem(idTokenKey, res.idToken);
              })
              .fail(function (err) {
                  console.log(err);
                  displayError(err.message);
                  localStorage.setItem(idTokenKey, null);
              })
        });

        $('#btn-api-request').click(function () {
            callSecureWebApi();
        });
    });
});
