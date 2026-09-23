const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const checkSource = html.match(/<script>\s*(\(\(\) => \{[\s\S]*?fetch\(versionUrl,[\s\S]*?\}\)\(\);)\s*<\/script>/)?.[1];
assert.ok(checkSource, "the early build-version check is present");

async function runVersionCheck({ currentBuild, latestBuild, href }) {
  const replacements = [];
  const historyUrls = [];
  const location = {
    href,
    replace(url) { replacements.push(url); }
  };
  const context = {
    URL,
    Date,
    document: {
      baseURI: href,
      documentElement: { dataset: { build: currentBuild } }
    },
    fetch: async (url, options) => {
      assert.equal(options.cache, "no-store");
      assert.ok(new URL(url).searchParams.has("t"), "version request has a unique cache buster");
      return { ok: true, json: async () => ({ build: latestBuild }) };
    },
    history: {
      state: { test: true },
      replaceState(_state, _title, url) { historyUrls.push(url); }
    },
    location
  };
  vm.runInNewContext(checkSource, context);
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  return { replacements, historyUrls };
}

(async () => {
  const build = "20260922-01";

  let result = await runVersionCheck({
    currentBuild: build,
    latestBuild: build,
    href: "https://example.test/engineering-portfolio/#home"
  });
  assert.deepEqual(result.replacements, [], "a fresh visit does not reload");

  result = await runVersionCheck({
    currentBuild: "older-build",
    latestBuild: build,
    href: "https://example.test/engineering-portfolio/?source=test#page=10"
  });
  assert.equal(result.replacements.length, 1, "a stale page reloads once");
  const replacement = new URL(result.replacements[0]);
  assert.equal(replacement.pathname, "/engineering-portfolio/");
  assert.equal(replacement.searchParams.get("source"), "test");
  assert.equal(replacement.searchParams.get("build"), build);
  assert.equal(replacement.hash, "#page=10");

  result = await runVersionCheck({
    currentBuild: "older-build",
    latestBuild: build,
    href: `https://example.test/engineering-portfolio/?build=${build}#home`
  });
  assert.deepEqual(result.replacements, [], "the build query prevents a reload loop");

  result = await runVersionCheck({
    currentBuild: build,
    latestBuild: build,
    href: `https://example.test/engineering-portfolio/?source=test&build=${build}#page=10`
  });
  assert.deepEqual(result.historyUrls, ["/engineering-portfolio/?source=test#page=10"], "a successful reload removes only the temporary build query");

  console.log("PASS: fresh visit, stale reload, loop guard, query preservation, hash preservation, and URL cleanup.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
