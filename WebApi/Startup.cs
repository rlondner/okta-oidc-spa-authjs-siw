using Microsoft.Owin;
using Owin;
using System.Web.Configuration;
using Microsoft.Owin.Security.OAuth;
using Microsoft.Owin.Security.Jwt;
using System.IdentityModel.Tokens;

[assembly: OwinStartup(typeof(Okta.Samples.OAuth.AspNet.Api.Startup))]

namespace Okta.Samples.OAuth.AspNet.Api
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var clientID = WebConfigurationManager.AppSettings["okta:ClientId"];
            var oauthIssuer = WebConfigurationManager.AppSettings["okta:OAuth_Issuer"];
            var oidcIssuer = WebConfigurationManager.AppSettings["okta:OIDC_Issuer"];
            var IDorAccess = WebConfigurationManager.AppSettings["okta:IDorAccessToken"];

            var issuer = oidcIssuer;

            if(IDorAccess == "access")
            {
                issuer = oauthIssuer;
            }

            TokenValidationParameters tvps = new TokenValidationParameters
            {
                ValidAudience = clientID,
                ValidateAudience = true,
                ValidIssuer = issuer,
                ValidateIssuer = true
            };

            app.UseOAuthBearerAuthentication(new OAuthBearerAuthenticationOptions
            {
                //the OIDC_Issuer value is the Okta org url so we use it to retrieve the metadata
                AccessTokenFormat = new JwtFormat(tvps,
                new OpenIdConnectCachingSecurityTokenProvider(oidcIssuer + "/.well-known/openid-configuration"))
        });
        }
    }
}
