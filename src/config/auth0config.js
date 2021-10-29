export const auth0config = { 
  domain: 'a-social-app.auth0.com',
  clientId: CLIENTID
};

export const auth0authorize = {
  scope: 'openid profile email offline_access',
  audience: 'https://a-social-api',
}