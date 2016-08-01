using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Security.Claims;
using System.Threading;
using System.Web.Http.Controllers;

namespace Okta.Samples.OpenIDConnect.AspNet.Api.Controllers
{
    public class OktaGroupAuthorizeAttribute : System.Web.Http.AuthorizeAttribute
    {
        public bool ByPassAuthorization { get; set; }
        public string Groups { get; set; }

        public GroupPolicy Policy { get; set; }


        protected override bool IsAuthorized(HttpActionContext actionContext)
        {
            bool isAuthorized = base.IsAuthorized(actionContext);
            if (isAuthorized)
            {
                if (Thread.CurrentPrincipal != null)
                {
                    if (!string.IsNullOrEmpty(Groups))
                    {
                        List<string> lstGroupNames = Groups.Split(',').ToList<string>();
                        ClaimsPrincipal principal = Thread.CurrentPrincipal as ClaimsPrincipal;// HttpContext.Current.User as ClaimsPrincipal;
                        IEnumerable<Claim> groupsClaimEnum = principal.Claims.Where(c => c.Type == "groups");
                        List<Claim> groupsClaim = null;
                        if (groupsClaimEnum != null)
                        {
                            groupsClaim = groupsClaimEnum.ToList();

                        }
                        try
                        {
                            if (groupsClaim != null && groupsClaim.Count > 0)
                            {
                                int iFoundGroups = 0;
                                foreach (string strGoupName in lstGroupNames)
                                {
                                    if (groupsClaim.Find(g => g.Value == strGoupName) != null)
                                    {
                                        ++iFoundGroups;
                                    }
                                    if (iFoundGroups > 0 && Policy == GroupPolicy.Any)
                                        break;
                                }

                                switch (Policy)
                                {
                                    case GroupPolicy.Any:
                                        if (iFoundGroups > 0) isAuthorized = true;
                                        else isAuthorized = false;
                                        break;
                                    case GroupPolicy.All:
                                    default:
                                        if (iFoundGroups == lstGroupNames.Count) isAuthorized = true;
                                        else isAuthorized = false;
                                        break;
                                }
                            }
                            else
                            {
                                isAuthorized = false;
                            }
                        }
                        catch (Exception ex)
                        {
                        }

                    }
                    else
                    {
                        //we specified no group on the method or class, so we'll assume the user is authorized
                        isAuthorized = true;
                    }

                }
                else
                {
                    isAuthorized = false;
                }
            }

            return isAuthorized;
        }

        protected override void HandleUnauthorizedRequest(HttpActionContext actionContext)
        {
            var tokenHasExpired = false;
            base.HandleUnauthorizedRequest(actionContext);

            var owinContext = actionContext.Request.GetOwinContext();
            if (owinContext != null)
            {
                tokenHasExpired = owinContext.Environment.ContainsKey("oauth.token_expired");
            }
            if (tokenHasExpired)
            {
                actionContext.Response = new AuthenticationFailureMessage("unauthorized", actionContext.Request,
                    new
                    {
                        error = "invalid_token",
                        error_message = "The Token has expired"
                    });
            }
            else
            {
                actionContext.Response = new AuthenticationFailureMessage("unauthorized", actionContext.Request,
                    new
                    {
                        error = "invalid_request",
                        error_message = "The Token is invalid"
                    });
            }
        }

    }

    public class AuthenticationFailureMessage : HttpResponseMessage
    {
        public AuthenticationFailureMessage(string reasonPhrase, HttpRequestMessage request, object responseMessage)
            : base(HttpStatusCode.Unauthorized)
        {
            MediaTypeFormatter jsonFormatter = new JsonMediaTypeFormatter();

            Content = new ObjectContent<object>(responseMessage, jsonFormatter);
            RequestMessage = request;
            ReasonPhrase = reasonPhrase;
        }
    }


    public enum GroupPolicy
    {
        Any,
        All
    }
}