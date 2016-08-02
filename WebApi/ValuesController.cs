/*!
 * Copyright (c) 2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

using System.Security.Claims;
using System.Threading;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Okta.Samples.OAuth.AspNet.Api.Controllers
{
    [EnableCors(origins: "*", headers: "Accept, Authorization", methods: "GET, OPTIONS")]
    public class ValuesController : ApiController
    {
        [HttpGet]
        [Route("unprotected")]
        public IHttpActionResult NotSecured()
        {
            return this.Ok("All good. You don't need to be authenticated to call this.");
        }


        //[OktaGroupAuthorize(Policy = GroupPolicy.Any)]
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
