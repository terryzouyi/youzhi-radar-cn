import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the job radar product", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>游职雷达｜互联网与游戏行业求职搜索<\/title>/i);
  assert.match(html, /把投递时间，留给更值得的机会。/);
  assert.match(html, /先定义方向，再开始搜索。/);
  assert.match(html, /值得优先看的职位/);
  assert.match(html, /100 家重点厂商，一张求职地图。/);
  assert.match(html, /腾讯游戏/);
  assert.match(html, /正在连接实时来源/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("removes the disposable starter preview", async () => {
  const [page, route, companyRoute, companies, layout, packageJson] =
    await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/jobs/route.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../app/api/companies/route.ts", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../data/companies.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    ]);

  assert.match(page, /游职雷达/);
  assert.match(page, /window\.localStorage/);
  assert.match(page, /\/api\/jobs/);
  assert.match(page, /originalUrl/);
  assert.match(page, /aria-modal="true"/);
  assert.match(route, /careers\.tencent\.com/);
  assert.match(route, /hr\.163\.com/);
  assert.match(route, /np-api\/u\/job\/search/);
  assert.match(route, /searchfront4c\.pc-search-job/);
  assert.match(route, /requestedCompany/);
  assert.match(route, /matchesTargetRole/);
  assert.match(route, /Cache-Control/);
  assert.match(companyRoute, /companyCoverageStats/);
  assert.match(companies, /字节跳动游戏/);
  assert.match(companies, /哔哩哔哩游戏/);
  const seedBlock = companies.match(/const seeds:[\s\S]+?\n\];/);
  assert.ok(seedBlock);
  assert.equal((seedBlock[0].match(/^\s+\["/gm) || []).length, 100);
  assert.match(layout, /lang="zh-CN"/);
  assert.match(layout, /互联网与游戏行业求职搜索/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
});
