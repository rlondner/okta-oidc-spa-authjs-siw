
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web.Configuration;
using System.Web.Http;
using System.IdentityModel.Tokens;

namespace Okta.Samples.OAuth.AspNet.Api
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Enable CORS
            config.EnableCors(); // if you only include this line, then you MUST include an EnableCors attribute in your controller (see ValuesController)
            //Otherwise, you can configure CORS globally, as is done in the next 2 following lines
            //var enableCorsAttribute = new System.Web.Http.Cors.EnableCorsAttribute("*", "Accept, Authorization", "GET, OPTIONS");
            //config.EnableCors(enableCorsAttribute);

            // Configure Web API to use only bearer token authentication.
            // Must reference OWIN libraries for the following 2 lines to work
            config.SuppressDefaultHostAuthentication();
            config.Filters.Add(new HostAuthenticationFilter(Microsoft.Owin.Security.OAuth.OAuthDefaults.AuthenticationType));

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }


   }
}