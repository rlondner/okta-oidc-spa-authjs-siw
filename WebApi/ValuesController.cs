using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Okta.Samples.OAuth.AspNet.Api.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ValuesController : ApiController
    {
        [HttpGet]
        [Route("unprotected")]
        public IHttpActionResult NotSecured()
        {
            return this.Ok("All good. You don't need to be authenticated to call this.");
        }


        [OktaGroupAuthorize(Policy = GroupPolicy.Any)]
        [HttpGet]
        [Route("protected")]
        public IHttpActionResult Secured()
        {
            string login = string.Empty;
            if (Thread.CurrentPrincipal != null)
            {
                ClaimsPrincipal principal = Thread.CurrentPrincipal as ClaimsPrincipal;// HttpContext.Current.User as ClaimsPrincipal;
                //login = principal.Claims.Where(c => c.Type == "preferred_username").First().Value;
            }
            return this.Ok(string.Format("All good. You only get this message if you are authenticated (as {0}) AND you belong to either the Marketing or Finance group(s).", login));
        }
    }
}
