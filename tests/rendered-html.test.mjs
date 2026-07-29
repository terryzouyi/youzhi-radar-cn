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
  assert.match(html, /优先投递的职位/);
  assert.match(html, /精准匹配/);
  assert.match(html, /拓展机会/);
  assert.match(html, /信息待确认/);
  assert.match(html, /100 家重点厂商，一张求职地图。/);
  assert.match(html, /职位之外，也追踪招聘批次和官方动态。/);
  assert.match(html, /2027 秋季校园招聘提前批已启动/);
  assert.match(html, /公众号没有稳定公开接口/);
  assert.match(html, /腾讯游戏/);
  assert.match(html, /正在连接实时来源/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("removes the disposable starter preview", async () => {
  const [
    page,
    route,
    companyRoute,
    intelligenceRoute,
    companies,
    signals,
    taxonomy,
    layout,
    packageJson,
    nextConfig,
    pagesTsconfig,
    pagesWorkflow,
    pagesBuild,
  ] =
    await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/jobs/route.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../app/api/companies/route.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/api/intelligence/route.ts", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../data/companies.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../data/recruitment-signals.ts", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../data/job-taxonomy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../tsconfig.pages.json", import.meta.url), "utf8"),
    readFile(
      new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../scripts/build-pages.mjs", import.meta.url), "utf8"),
    ]);

  assert.match(page, /游职雷达/);
  assert.match(page, /window\.localStorage/);
  assert.match(page, /\/api\/jobs/);
  assert.match(page, /originalUrl/);
  assert.match(page, /aria-modal="true"/);
  assert.match(page, /GitHub Pages 是静态镜像/);
  assert.match(route, /careers\.tencent\.com/);
  assert.match(route, /hr\.163\.com/);
  assert.match(route, /np-api\/u\/job\/search/);
  assert.match(route, /searchfront4c\.pc-search-job/);
  assert.match(route, /requestedCompany/);
  assert.match(route, /matchesTargetRole/);
  assert.match(route, /evaluateProfile/);
  assert.match(route, /currentRole/);
  assert.match(route, /years/);
  assert.match(route, /salary/);
  assert.match(route, /fetchAcrossRoles/);
  assert.match(route, /tierCounts/);
  assert.match(route, /Cache-Control/);
  assert.match(page, /isRecentJob/);
  assert.match(page, /筛选后职位/);
  assert.match(page, /年限、薪资默认用于分层/);
  assert.match(page, /主方向（按职业族分组）/);
  assert.match(page, /专长偏好（按能力维度分类，可多选）/);
  assert.match(page, /年限严格/);
  assert.match(page, /matchDimensions/);
  assert.doesNotMatch(page, /% 匹配/);
  assert.match(companyRoute, /companyCoverageStats/);
  assert.match(intelligenceRoute, /recruitmentSignals/);
  assert.match(intelligenceRoute, /verifiedWechatAccounts/);
  assert.match(companies, /字节跳动游戏/);
  assert.match(companies, /哔哩哔哩游戏/);
  assert.match(companies, /腾讯招聘/);
  assert.match(companies, /鹰角网络招聘/);
  assert.match(signals, /mp\.weixin\.qq\.com/);
  assert.match(signals, /收费内推/);
  assert.match(taxonomy, /游戏引擎 \/ 图形开发/);
  assert.match(taxonomy, /海外运营 \/ 本地化/);
  assert.match(taxonomy, /游戏测试开发/);
  assert.match(taxonomy, /平台与项目经验/);
  assert.equal((taxonomy.match(/defineRole\(\{/g) || []).length, 36);
  const seedBlock = companies.match(/const seeds:[\s\S]+?\n\];/);
  assert.ok(seedBlock);
  assert.equal((seedBlock[0].match(/^\s+\["/gm) || []).length, 100);
  assert.match(layout, /lang="zh-CN"/);
  assert.match(layout, /互联网与游戏行业求职搜索/);
  assert.match(nextConfig, /output: "export"/);
  assert.match(nextConfig, /basePath/);
  assert.match(nextConfig, /tsconfig\.pages\.json/);
  assert.match(pagesTsconfig, /"app\/api"/);
  assert.match(pagesWorkflow, /actions\/deploy-pages@v4/);
  assert.match(pagesWorkflow, /pnpm run build:pages/);
  assert.match(pagesBuild, /parkedApiDirectory/);
  assert.match(packageJson, /build:pages/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
});
