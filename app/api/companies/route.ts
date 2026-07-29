import {
  companyCoverageStats,
  companyProfiles,
} from "../../../data/companies";

export async function GET() {
  return Response.json(
    {
      companies: companyProfiles,
      stats: companyCoverageStats,
      methodology:
        "求职覆盖清单，综合行业影响力、活跃产品、代表性细分赛道与招聘价值整理，不等同于财务或营收排名。每家公司附官网或平台入口、公众号检索词，并在可核验时补充校招专题和招聘号名称。",
      updatedAt: "2026-07-29",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
