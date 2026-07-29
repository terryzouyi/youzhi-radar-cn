import { companyCoverageStats } from "../../../data/companies";
import { recruitmentSignals } from "../../../data/recruitment-signals";

export async function GET() {
  return Response.json(
    {
      signals: recruitmentSignals,
      channels: {
        officialCareerSites: companyCoverageStats.official,
        knownWechatAccounts: companyCoverageStats.wechatKnown,
        verifiedWechatAccounts: companyCoverageStats.wechatVerified,
        campusAndInternshipPages: companyCoverageStats.campus,
      },
      methodology:
        "官网职位作为主数据；招聘公众号、校招专题与官方内容仅补充批次、专项、实习窗口和安全提醒。微信公众号不做自动抓取，账号和文章需在微信内复核认证主体与发布时间。",
      updatedAt: "2026-07-29",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
