# auth-service

General purpose authentication and identity management

This service must handle: login, user registration, profile management

This service should handle: 2fa, oauth + openid and roles based on the app

The service must not be monolithic, it must strive to be as fragmented as possible

The service(s) must use certified libraries whenever possible and should avoid self-implementation wherever possible

The service(s) must be developed with the "Backend for frontend" architecture and should have tests

The service(s) must expose GraphQL endpoints wherever possible and REST should be available, both of them must be documented (GraphQL objects must have a description for each attribute; REST must have an OpenAPI specification)

The service(s) must use cookies with redis sessions

There should be only one service for writing and reading into the database

## How to add an OAuth2 Client

First list all clients just to be sure you're not adding another client with the same name:

```sh
GET http://localhost:4445/clients
```

Then add the client:

```sh
POST http://localhost:4445/clients
{
  "client_id": "oauth2-client",
  "client_name": "test1",
  "client_secret": "supersecret",
  "client_secret_expires_at": 0,
  "client_uri": "http://localhost:8001",
  "grant_types": [
    "authorization_code",
		"refresh_token" 
  ],
  "post_logout_redirect_uris": [
    "http://localhost:8001/logout/callback"
  ],
  "redirect_uris": [
    "http://localhost:8001/auth/callback"
  ],
  "response_types": [
    "code",
		"id_token"
  ],
  "scope": "openid offline"
}
```
