import service from "express"
import expressSession from "express-session"
import passport from "passport"
import cors from "cors"

import { Issuer, Strategy, TokenSet, UserinfoResponse } from "openid-client"

const openIDProviderURL = "http://localhost:4444"

const main = async () => {
  const openIdProvider = await Issuer.discover(openIDProviderURL)
  const openIdClient = new openIdProvider.Client({
    client_id: "node-consumer-service",
    client_secret: "supersecret",
    redirect_uris: ["http://localhost:8001/auth/login/callback"],
    post_logout_redirect_uris: ["http://localhost:8001/auth/logout/callback"],
    token_endpoint_auth_method: "client_secret_basic",
  })

  const app = service()

  app.use(cors() as any)
  app.use(service.json())

  // Sessions
  app.use(
    expressSession({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
    }) as any,
  )

  // Passport
  app.use(passport.initialize() as any)
  app.use(passport.session())

  passport.use(
    "oidc",
    new Strategy(
      { client: openIdClient },
      (tokenSet: TokenSet, userinfo: UserinfoResponse, done: (err: string | null, user?: any) => void) => {
        console.log("token info")
        console.log(tokenSet)
        console.log(tokenSet.claims())
        console.log(userinfo)
        const idToken = tokenSet.id_token
        // remove sid from user info, we have no need of that here
        const { sid, ...user } = userinfo
        return done(null, {...user, idToken})
      },
    ),
  )

  passport.serializeUser((user, done) => {
    console.log("serializeUser")
    console.log(user)

    done(null, user)
  })

  passport.deserializeUser((user, done) => {
    console.log("deserializeUser")
    console.log(user)

    done(null, user as any)
  })

  // Start login flow
  app.get("/auth/login", (req, res, next) => {
    console.log("auth/login")
    passport.authenticate("oidc")(req, res, next)
  })

  app.get("/auth/login/callback", (req, res, next) => {
    console.log("auth/login/callback")
    passport.authenticate("oidc", { successRedirect: "/auth/am-i-auth" }, (...args) => console.log(args))(req, res, next)
  })

  app.get("/auth/logout", (req, res, next) => {
    // wow, much safe url, very safe...
    const logoutUrl = new URL(openIDProviderURL)
    const searchParams = new URLSearchParams()
    //@ts-ignore: express merda
    const idToken = req.user?.idToken;
    searchParams.set("id_token_hint", idToken)
    logoutUrl.search = searchParams.toString()
    res.redirect(logoutUrl.toString())
  })

  app.get("/auth/logout/callback", (req, res, next) => {
    req.logout()
    res.send({ message: "You've been logged out, you're gay now" })
  })

  app.get("/auth/am-i-auth", (req, res) => {
    console.log(req.isAuthenticated())
    console.log(req.user)
    const { user } = req

    res.send({ user })
  })

  app.listen(8001)
  console.log("Server listening at: http://localhost:8001")
}

main()