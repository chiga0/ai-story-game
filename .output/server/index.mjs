globalThis.__nitro_main__ = import.meta.url;
import { N as NodeResponse, s as serve } from "./_libs/srvx.mjs";
import { H as HTTPError, d as defineHandler, t as toEventHandler, a as defineLazyEventHandler, b as H3Core } from "./_libs/h3.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "./_libs/rou3.mjs";
function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key2, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key2, value);
  }
});
const assets = {
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": '"f1e-ESBTjHetHyiokkO0tT/irBbMO8Y"',
    "mtime": "2026-03-17T11:06:36.387Z",
    "size": 3870,
    "path": "../public/favicon.ico"
  },
  "/logo192.png": {
    "type": "image/png",
    "etag": '"14e3-f08taHgqf6/O2oRVTsq5tImHdQA"',
    "mtime": "2026-03-17T11:06:36.387Z",
    "size": 5347,
    "path": "../public/logo192.png"
  },
  "/logo512.png": {
    "type": "image/png",
    "etag": '"25c0-RpFfnQJpTtSb/HqVNJR2hBA9w/4"',
    "mtime": "2026-03-17T11:06:36.387Z",
    "size": 9664,
    "path": "../public/logo512.png"
  },
  "/manifest.json": {
    "type": "application/json",
    "etag": '"1f2-Oqn/x1R1hBTtEjA8nFhpBeFJJNg"',
    "mtime": "2026-03-17T11:06:36.386Z",
    "size": 498,
    "path": "../public/manifest.json"
  },
  "/assets/about-c9XIayqg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b6-uOoUWPqoDlI4mvfCO05mGk8bj2Y"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 694,
    "path": "../public/assets/about-c9XIayqg.js"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"43-BEzmj4PuhUNHX+oW9uOnPSihxtU"',
    "mtime": "2026-03-17T11:06:36.387Z",
    "size": 67,
    "path": "../public/robots.txt"
  },
  "/assets/button-DYwNVjXU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8f32-tDYanuYnnbEB1PRbYJy+r68ZPJk"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 36658,
    "path": "../public/assets/button-DYwNVjXU.js"
  },
  "/assets/geist-latin-ext-wght-normal-DMtmJ5ZE.woff2": {
    "type": "font/woff2",
    "etag": '"3bcc-oSFlPnDlb7fAcQTPv6sqm6NgXXU"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 15308,
    "path": "../public/assets/geist-latin-ext-wght-normal-DMtmJ5ZE.woff2"
  },
  "/assets/geist-cyrillic-wght-normal-CHSlOQsW.woff2": {
    "type": "font/woff2",
    "etag": '"3964-jfUkxTfHRj1cpO33jEsDk2lkrvM"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 14692,
    "path": "../public/assets/geist-cyrillic-wght-normal-CHSlOQsW.woff2"
  },
  "/assets/geist-latin-wght-normal-Dm3htQBi.woff2": {
    "type": "font/woff2",
    "etag": '"6ef0-pZqr0k2V92t+lxQ/ogxqTIOgDGM"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 28400,
    "path": "../public/assets/geist-latin-wght-normal-Dm3htQBi.woff2"
  },
  "/assets/index-DTQIyEi2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1047-dcDYlaUFfDrNWw8J+pdzWco+kQk"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 4167,
    "path": "../public/assets/index-DTQIyEi2.js"
  },
  "/assets/save-manager-Bq0Nvi6c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"43d-6/u+GeERbXo0eU93+WrFaXn6/RI"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 1085,
    "path": "../public/assets/save-manager-Bq0Nvi6c.js"
  },
  "/assets/play._scriptId-BzbE6Lc9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2842-81tmPkq8Awr2tGKbWeRuMZlpH8s"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 10306,
    "path": "../public/assets/play._scriptId-BzbE6Lc9.js"
  },
  "/assets/saves.index-BCcD_d3V.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9bf-SVuo2XEkCLff6m2fIbuC3FIluMU"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 2495,
    "path": "../public/assets/saves.index-BCcD_d3V.js"
  },
  "/assets/scripts-BSpq94PP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"20a9-W29rQdzZF3e9rXpe5QAbCFuPm5A"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 8361,
    "path": "../public/assets/scripts-BSpq94PP.js"
  },
  "/assets/scripts._id-Cr2lfp29.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b76-B1i/RspgKbcNsIebU+gVDe6TXmw"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 2934,
    "path": "../public/assets/scripts._id-Cr2lfp29.js"
  },
  "/assets/scripts.index-fL94EfeS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"865-Bjkxi/3ZkTxTr6YcgslL6zsfzRA"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 2149,
    "path": "../public/assets/scripts.index-fL94EfeS.js"
  },
  "/assets/styles-ZVIQ3u1x.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"edb1-QIOpW2qNQksDke3XS2RyhhYa11w"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 60849,
    "path": "../public/assets/styles-ZVIQ3u1x.css"
  },
  "/assets/main-C2VW4VA2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"50702-eMvVIYjYJe+1PhhCgj8SuF26Nvw"',
    "mtime": "2026-03-17T11:06:36.193Z",
    "size": 329474,
    "path": "../public/assets/main-C2VW4VA2.js"
  },
  "/scripts/mystery-castle.json": {
    "type": "application/json",
    "etag": '"40b6-YCsm0Mc2JjU9bAX3McZL5pMuxC8"',
    "mtime": "2026-03-17T11:06:36.386Z",
    "size": 16566,
    "path": "../public/scripts/mystery-castle.json"
  }
};
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
  gzip: ".gz",
  br: ".br",
  zstd: ".zst"
};
const _StRJxj = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) {
    return;
  }
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
  let asset;
  const encodingHeader = event.req.headers.get("accept-encoding") || "";
  const encodings = [...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete("Cache-Control");
      throw new HTTPError({ status: 404 });
    }
    return;
  }
  if (encodings.length > 1) {
    event.res.headers.append("Vary", "Accept-Encoding");
  }
  const ifNotMatch = event.req.headers.get("if-none-match") === asset.etag;
  if (ifNotMatch) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  const ifModifiedSinceH = event.req.headers.get("if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  if (asset.type) {
    event.res.headers.set("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.headers.has("ETag")) {
    event.res.headers.set("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.headers.has("Last-Modified")) {
    event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.res.headers.has("Content-Encoding")) {
    event.res.headers.set("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.res.headers.has("Content-Length")) {
    event.res.headers.set("Content-Length", asset.size.toString());
  }
  return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_WDhvxz = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_WDhvxz };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_StRJxj)
].filter(Boolean);
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function createNitroApp() {
  const hooks = void 0;
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({
          error,
          context: errorCtx
        });
      }
    }
  };
  const h3App = createH3App({ onError(error, event) {
    return errorHandler(error, event);
  } });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  const app = {
    fetch: appHandler,
    h3: h3App,
    hooks,
    captureError
  };
  return app;
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~middleware"].push(...globalMiddleware);
  {
    h3App["~getMiddleware"] = (event, route) => {
      const pathname = event.url.pathname;
      const method = event.req.method;
      const middleware = [];
      {
        const routeRules = getRouteRules(method, pathname);
        event.context.routeRules = routeRules?.routeRules;
        if (routeRules?.routeRuleMiddleware.length) {
          middleware.push(...routeRules.routeRuleMiddleware);
        }
      }
      middleware.push(...h3App["~middleware"]);
      if (route?.data?.middleware?.length) {
        middleware.push(...route.data.middleware);
      }
      return middleware;
    };
  }
  return h3App;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  for (const rule of Object.values(routeRules)) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
  process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
  process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
  port,
  hostname: host,
  tls: cert && key ? {
    cert,
    key
  } : void 0,
  fetch: nitroApp.fetch
});
trapUnhandledErrors();
const nodeServer = {};
export {
  nodeServer as default
};
