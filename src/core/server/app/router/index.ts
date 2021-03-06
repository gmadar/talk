import express, { Router } from "express";

import { LanguageCode } from "coral-common/helpers/i18n/locales";
import { AppOptions } from "coral-server/app";

import playground from "coral-server/app/middleware/playground";
import { RouterOptions } from "coral-server/app/router/types";
import logger from "coral-server/logger";

import { createAPIRouter } from "./api";
import { mountClientRoutes } from "./client";

export function createRouter(app: AppOptions, options: RouterOptions) {
  // Create a router.
  const router = express.Router();

  // Attach the API router.

  // NOTE: disabled cookie support due to ITP/First Party Cookie bugs
  // router.use("/api", cookies(), createAPIRouter(app, options));
  router.use("/api", createAPIRouter(app, options));

  // Attach the GraphiQL if enabled.
  if (app.config.get("enable_graphiql")) {
    attachGraphiQL(router, app);
  }

  if (!options.disableClientRoutes) {
    mountClientRoutes(router, {
      defaultLocale: app.config.get("default_locale") as LanguageCode,
      // When mounting client routes, we need to provide a staticURI even when
      // not provided to the default current domain relative "/".
      staticURI: app.config.get("static_uri") || "/",
      tenantCache: app.tenantCache,
      mongo: app.mongo,
    });
  } else {
    logger.warn("client routes are disabled");
  }

  return router;
}

/**
 * attachGraphiQL will attach the GraphiQL routes to the router.
 *
 * @param router the router to attach the GraphiQL routes to
 * @param app the application to read the configuration from
 */
function attachGraphiQL(router: Router, app: AppOptions) {
  if (app.config.get("env") === "production") {
    logger.warn(
      "it is not recommended to have enable_graphiql enabled while in production mode as it requires introspection queries to be enabled"
    );
  }

  // GraphiQL
  router.get(
    "/graphiql",
    playground({
      endpoint: "/api/graphql",
      subscriptionEndpoint: "/api/graphql/live",
    })
  );
}
