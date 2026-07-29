import {
  CompanyProfile,
  findCoveredCompany,
} from "../../../data/companies";
import {
  evaluateProfile,
  matchesCities,
  matchesExperience,
  matchesIndustryScope,
  matchesSalary,
  matchesTargetRole,
  parseExperienceRange,
  parseSalaryRange,
  splitTerms,
} from "../../../lib/job-filtering.js";

type NormalizedJob = {
  id: string;
  title: string;
  company: string;
  companyCode: string;
  color: string;
  city: string;
  experience: string;
  meta: string;
  salary: string;
  source: string;
  sourceType: "官网直招" | "招聘平台";
  match: number;
  freshness: string;
  updatedAt: string | null;
  tags: string[];
  reasons: string[];
  summary: string;
  originalUrl: string;
  provider: "tencent" | "netease" | "nowcoder" | "liepin";
  matchTier?: "priority" | "expanded" | "incomplete";
  grade?: "A" | "B" | "C";
  tierLabel?: "精准匹配" | "拓展机会" | "信息待确认";
  matchDimensions?: {
    role: string;
    conditions: string;
    data: string;
  };
  coverageOrder?: number;
  coveredCompany?: string;
};

type MatchTier = "priority" | "expanded" | "incomplete";
type RankedJob = NormalizedJob & {
  matchTier: MatchTier;
  grade: "A" | "B" | "C";
  tierLabel: "精准匹配" | "拓展机会" | "信息待确认";
  matchDimensions: {
    role: string;
    conditions: string;
    data: string;
  };
};

type SearchProfile = {
  currentRole: string;
  targetRole: string;
  relatedRoles: string;
  cities: string;
  years: string;
  salary: string;
  keywords: string;
  strictYears: boolean;
  strictSalary: boolean;
  allowRemote: boolean;
};

type SourceState = {
  id: "tencent" | "netease" | "nowcoder" | "liepin";
  name: string;
  type: "official" | "platform";
  status: "online" | "error" | "limited";
  count: number;
  detail: string;
  url: string;
};

type TencentPost = {
  PostId: string;
  RecruitPostName: string;
  LocationName?: string;
  BGName?: string;
  ProductName?: string;
  CategoryName?: string;
  Responsibility?: string;
  LastUpdateTime?: string;
  PostURL?: string;
  RequireWorkYearsName?: string;
};

type NeteasePost = {
  id: number;
  name: string;
  requirement?: string;
  description?: string;
  reqEducationName?: string;
  reqWorkYearsName?: string;
  firstDepName?: string;
  firstPostTypeName?: string;
  updateTime?: number;
  productName?: string;
  workPlaceNameList?: string[];
};

type NowcoderPost = {
  id: number;
  jobName: string;
  jobCity?: string;
  refreshTime?: number;
  updateTime?: number;
  eduLevel?: number;
  salaryType?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryMonth?: number;
  salaryShow?: string;
  recruitType?: number;
  careerJobName?: string;
  ext?: string;
  redirectExternalUrl?: string;
  recommendInternCompany?: {
    companyName?: string;
    companyShortName?: string;
    industryTagNameList?: string[];
    personScales?: string;
  };
  user?: {
    identity?: Array<{ companyName?: string }>;
  };
};

type LiepinJobCard = {
  comp?: {
    compName?: string;
    compIndustry?: string;
    compScale?: string;
    compStage?: string;
  };
  job?: {
    title?: string;
    jobId?: string;
    dq?: string;
    salary?: string;
    refreshTime?: string;
    requireWorkYears?: string;
    requireEduLevel?: string;
    link?: string;
    labels?: string[];
  };
};

const TENCENT_SEARCH = "https://careers.tencent.com/search.html";
const NETEASE_SEARCH = "https://hr.163.com/job-list.html";
const NOWCODER_SEARCH = "https://www.nowcoder.com/jobs/fulltime/center";
const LIEPIN_SEARCH = "https://www.liepin.com/zhaopin/";
const REQUEST_TIMEOUT = 9_000;

function compactText(value = "") {
  return value.replace(/\r?\n+/g, " ").replace(/\s+/g, " ").trim();
}

function cleanList(value: string) {
  return value
    .replaceAll("/", " ")
    .split(/[\s、,，]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
}

function toIsoDate(value?: string | number) {
  if (!value) return null;
  if (typeof value === "number") {
    const milliseconds = value < 1_000_000_000_000 ? value * 1000 : value;
    const parsed = new Date(milliseconds);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const chineseDate = value.match(/(\d{4})年(\d{2})月(\d{2})日/);
  if (chineseDate) {
    return new Date(
      `${chineseDate[1]}-${chineseDate[2]}-${chineseDate[3]}T00:00:00+08:00`,
    ).toISOString();
  }

  const compactDate = value.match(
    /^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?$/,
  );
  if (compactDate) {
    const [, year, month, day, hour = "00", minute = "00", second = "00"] =
      compactDate;
    return new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`,
    ).toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString();
}

function freshness(iso: string | null) {
  if (!iso) return "更新时间待确认";
  const elapsed = Date.now() - new Date(iso).getTime();
  const days = Math.max(0, Math.floor(elapsed / 86_400_000));
  if (days === 0) return "今天更新";
  if (days === 1) return "昨天更新";
  if (days < 30) return `${days} 天前更新`;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(iso));
}

function scoreJob(input: {
  title: string;
  body: string;
  city: string;
  experience: string;
  salary: string;
  profile: SearchProfile;
}) {
  const haystack = `${input.title} ${input.body}`.toLowerCase();
  const keywordTerms = cleanList(input.profile.keywords);
  const titleHit = matchesTargetRole(
    {
      title: input.title,
      summary: input.body,
      city: input.city,
      experience: input.experience,
      salary: input.salary,
    },
    input.profile.targetRole,
  );
  const hits = keywordTerms.filter((term) =>
    haystack.includes(term.toLowerCase()),
  ).length;
  const filterableJob = {
    title: input.title,
    summary: input.body,
    city: input.city,
    experience: input.experience,
    salary: input.salary,
  };
  const hasCities = splitTerms(input.profile.cities).length > 0;
  const cityHit =
    hasCities &&
    matchesCities(
      filterableJob,
      input.profile.cities,
      input.profile.allowRemote,
    );
  const experienceKnown = Boolean(parseExperienceRange(input.experience));
  const experienceHit =
    experienceKnown && matchesExperience(filterableJob, input.profile.years);
  const salaryKnown = Boolean(parseSalaryRange(input.salary));
  const salaryHit =
    salaryKnown && matchesSalary(filterableJob, input.profile.salary);
  const currentRoleHit = cleanList(input.profile.currentRole).some((term) =>
    haystack.includes(term.toLowerCase()),
  );
  return Math.min(
    98,
    58 +
      (titleHit ? 17 : 0) +
      Math.min(9, hits * 3) +
      (cityHit ? 8 : 0) +
      (experienceHit ? 5 : 0) +
      (salaryHit ? 5 : 0) +
      (currentRoleHit ? 3 : 0),
  );
}

function recommendationReasons(
  input: {
    title: string;
    body: string;
    city: string;
    experience: string;
    salary: string;
    profile: SearchProfile;
  },
  sourceReason: string,
) {
  const reasons: string[] = [];
  const haystack = `${input.title} ${input.body}`;
  const filterableJob = {
    title: input.title,
    summary: input.body,
    city: input.city,
    experience: input.experience,
    salary: input.salary,
  };
  if (matchesTargetRole(filterableJob, input.profile.targetRole)) {
    reasons.push("目标岗位命中");
  }
  if (
    cleanList(input.profile.keywords).some((term) =>
      haystack.toLowerCase().includes(term.toLowerCase()),
    )
  ) {
    reasons.push("能力关键词命中");
  }
  if (
    splitTerms(input.profile.cities).length &&
    matchesCities(
      filterableJob,
      input.profile.cities,
      input.profile.allowRemote,
    )
  ) {
    reasons.push("意向城市命中");
  }
  if (
    parseExperienceRange(input.experience) &&
    matchesExperience(filterableJob, input.profile.years)
  ) {
    reasons.push("工作年限匹配");
  }
  if (
    parseSalaryRange(input.salary) &&
    matchesSalary(filterableJob, input.profile.salary)
  ) {
    reasons.push("薪资达到预期");
  }
  return [...reasons.slice(0, 3), sourceReason];
}

function addCoverage(job: NormalizedJob) {
  const covered = findCoveredCompany(job.company);
  return covered
    ? {
        ...job,
        coverageOrder: covered.order,
        coveredCompany: covered.name,
      }
    : job;
}

async function fetchTencent(query: string, profile: SearchProfile) {
  const params = new URLSearchParams({
    keyword: query,
    pageIndex: "1",
    pageSize: "25",
    language: "zh-cn",
    area: "cn",
  });
  const response = await fetch(
    `https://careers.tencent.com/tencentcareer/api/post/Query?${params}`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    },
  );
  if (!response.ok) throw new Error(`Tencent returned ${response.status}`);
  const payload = (await response.json()) as {
    Code?: number;
    Data?: { Count?: number; Posts?: TencentPost[] };
  };
  if (payload.Code !== 200) throw new Error("Tencent payload unavailable");

  const posts = payload.Data?.Posts ?? [];
  const jobs = posts.map((post) => {
    const updatedAt = toIsoDate(post.LastUpdateTime);
    const body = compactText(post.Responsibility);
    const city = post.LocationName || "中国";
    const experience = post.RequireWorkYearsName || "经验不限";
    const salary = "薪资面议";
    const scoreInput = {
      title: post.RecruitPostName,
      body,
      city,
      experience,
      salary,
      profile,
    };
    return addCoverage({
      id: `tencent-${post.PostId}`,
      title: post.RecruitPostName,
      company: post.ProductName ? `腾讯 · ${post.ProductName}` : "腾讯",
      companyCode: "TX",
      color: "#2d6bff",
      city,
      experience,
      meta: `${city} · ${experience} · ${post.BGName || "腾讯"}`,
      salary,
      source: "腾讯招聘",
      sourceType: "官网直招",
      match: scoreJob(scoreInput),
      freshness: freshness(updatedAt),
      updatedAt,
      tags: [post.CategoryName, post.BGName, post.ProductName]
        .filter((item): item is string => Boolean(item))
        .slice(0, 3),
      reasons: recommendationReasons(scoreInput, "厂商官网来源"),
      summary: body.slice(0, 220) || "请前往腾讯招聘官网查看完整岗位职责。",
      originalUrl: (
        post.PostURL ||
        `https://careers.tencent.com/jobdesc.html?postId=${post.PostId}`
      ).replace(/^http:/, "https:"),
      provider: "tencent",
    });
  });

  return {
    jobs,
    source: {
      id: "tencent",
      name: "腾讯招聘",
      type: "official",
      status: "online",
      count: payload.Data?.Count ?? jobs.length,
      detail: `官网返回 ${payload.Data?.Count ?? jobs.length} 个相关岗位`,
      url: `${TENCENT_SEARCH}?keywords=${encodeURIComponent(query)}`,
    } satisfies SourceState,
  };
}

async function fetchNetease(query: string, profile: SearchProfile) {
  const response = await fetch(
    "https://hr.163.com/api/hr163/position/queryPage",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPage: 1,
        pageSize: 25,
        sortType: 2,
        keyword: query,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    },
  );
  if (!response.ok) throw new Error(`NetEase returned ${response.status}`);
  const payload = (await response.json()) as {
    code?: number;
    data?: { total?: number; list?: NeteasePost[] };
  };
  if (payload.code !== 200) throw new Error("NetEase payload unavailable");

  const posts = payload.data?.list ?? [];
  const jobs = posts.map((post) => {
    const updatedAt = toIsoDate(post.updateTime);
    const body = compactText(
      [post.description, post.requirement].filter(Boolean).join(" "),
    );
    const city = post.workPlaceNameList?.join(" / ") || "中国";
    const experience = post.reqWorkYearsName || "经验不限";
    const salary = "薪资面议";
    const scoreInput = {
      title: post.name,
      body,
      city,
      experience,
      salary,
      profile,
    };
    return addCoverage({
      id: `netease-${post.id}`,
      title: post.name,
      company: post.productName || "网易",
      companyCode: "NE",
      color: "#d23b32",
      city,
      experience,
      meta: `${city} · ${experience} · ${post.reqEducationName || "学历不限"}`,
      salary,
      source: "网易招聘",
      sourceType: "官网直招",
      match: scoreJob(scoreInput),
      freshness: freshness(updatedAt),
      updatedAt,
      tags: [post.firstPostTypeName, post.firstDepName, post.productName]
        .filter((item): item is string => Boolean(item))
        .slice(0, 3),
      reasons: recommendationReasons(scoreInput, "厂商官网来源"),
      summary: body.slice(0, 220) || "请前往网易招聘官网查看完整岗位职责。",
      originalUrl: `https://hr.163.com/job-detail.html?id=${post.id}`,
      provider: "netease",
    });
  });

  return {
    jobs,
    source: {
      id: "netease",
      name: "网易招聘",
      type: "official",
      status: "online",
      count: payload.data?.total ?? jobs.length,
      detail: `官网返回 ${payload.data?.total ?? jobs.length} 个相关岗位`,
      url: `${NETEASE_SEARCH}?keyword=${encodeURIComponent(query)}`,
    } satisfies SourceState,
  };
}

function parseNowcoderExt(value?: string) {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value) as {
      infos?: string;
      requirements?: string;
      jobStrength?: string;
    };
    return compactText(
      [parsed.infos, parsed.requirements, parsed.jobStrength]
        .filter(Boolean)
        .join(" "),
    );
  } catch {
    return compactText(value);
  }
}

function nowcoderSalary(post: NowcoderPost) {
  if (post.salaryShow) return post.salaryShow;
  if (post.salaryType === 1 && post.salaryMin && post.salaryMax) {
    const month = post.salaryMonth && post.salaryMonth > 12
      ? ` · ${post.salaryMonth}薪`
      : "";
    return `${post.salaryMin / 10}-${post.salaryMax / 10}K${month}`;
  }
  return "薪资面议";
}

async function fetchNowcoder(
  query: string,
  profile: SearchProfile,
  searchQuery = query,
) {
  const body = new URLSearchParams({
    recruitType: "3",
    query: searchQuery,
    page: "1",
    pageSize: "20",
    careerJobId: "-1",
    order: "-1",
    latest: "false",
  });
  const response = await fetch(
    "https://www.nowcoder.com/np-api/u/job/search",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "YouzhiRadar/1.0 (+job-search aggregation)",
      },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    },
  );
  if (!response.ok) throw new Error(`Nowcoder returned ${response.status}`);
  const payload = (await response.json()) as {
    code?: number;
    data?: {
      totalCount?: number;
      datas?: NowcoderPost[];
    };
  };
  if (payload.code !== 0) throw new Error("Nowcoder payload unavailable");

  const posts = payload.data?.datas ?? [];
  const education: Record<number, string> = {
    3000: "中专",
    4000: "大专",
    5000: "本科",
    6000: "硕士",
    7000: "博士",
  };
  const jobs = posts.map((post) => {
    const company =
      post.recommendInternCompany?.companyShortName ||
      post.recommendInternCompany?.companyName ||
      post.user?.identity?.[0]?.companyName ||
      "牛客招聘企业";
    const updatedAt = toIsoDate(post.refreshTime || post.updateTime);
    const summary = parseNowcoderExt(post.ext);
    const city = post.jobCity || "中国";
    const experience = "经验未知";
    const salary = nowcoderSalary(post);
    const scoreInput = {
      title: post.jobName,
      body: summary,
      city,
      experience,
      salary,
      profile,
    };
    return addCoverage({
      id: `nowcoder-${post.id}`,
      title: post.jobName,
      company,
      companyCode: "NK",
      color: "#f05a47",
      city,
      experience,
      meta: `${city} · ${experience} · ${education[post.eduLevel || 0] || "学历不限"}`,
      salary,
      source: "牛客招聘",
      sourceType: "招聘平台",
      match: scoreJob(scoreInput),
      freshness: freshness(updatedAt),
      updatedAt,
      tags: [
        post.careerJobName,
        post.recommendInternCompany?.industryTagNameList?.[0],
        "社招",
      ]
        .filter((item): item is string => Boolean(item))
        .slice(0, 3),
      reasons: recommendationReasons(scoreInput, "牛客公开职位"),
      summary:
        summary.slice(0, 220) || "请前往牛客招聘查看完整岗位职责。",
      originalUrl:
        post.redirectExternalUrl ||
        `https://www.nowcoder.com/jobs/detail/${post.id}`,
      provider: "nowcoder",
    });
  });

  return {
    jobs,
    source: {
      id: "nowcoder",
      name: "牛客招聘",
      type: "platform",
      status: "online",
      count: payload.data?.totalCount ?? jobs.length,
      detail: `公开接口返回 ${payload.data?.totalCount ?? jobs.length} 个职位`,
      url: `${NOWCODER_SEARCH}?query=${encodeURIComponent(searchQuery)}`,
    } satisfies SourceState,
  };
}

async function fetchLiepin(
  query: string,
  profile: SearchProfile,
  searchQuery = query,
) {
  const traceId = crypto.randomUUID().replaceAll("-", "");
  const searchUrl = `${LIEPIN_SEARCH}?key=${encodeURIComponent(searchQuery)}`;
  const response = await fetch(
    "https://api-c.liepin.com/api/com.liepin.searchfront4c.pc-search-job",
    {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
        "User-Agent": "Mozilla/5.0 YouzhiRadar/1.0",
        "X-Client-Type": "web",
        "X-Fscp-Bi-Stat": JSON.stringify({ location: searchUrl }),
        "X-Fscp-Std-Info": JSON.stringify({ client_id: "40108" }),
        "X-Fscp-Trace-Id": traceId,
        "X-Fscp-Version": "1.1",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        data: {
          mainSearchPcConditionForm: {
            city: "",
            dq: "",
            pubTime: "",
            currentPage: 0,
            pageSize: 30,
            key: searchQuery,
          },
          passThroughForm: {
            scene: "input",
            skId: "",
            fkId: "",
            ckId: traceId,
          },
        },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    },
  );
  if (!response.ok) throw new Error(`Liepin returned ${response.status}`);
  const payload = (await response.json()) as {
    flag?: number;
    data?: {
      pagination?: { totalCounts?: number };
      data?: { jobCardList?: LiepinJobCard[] };
    };
  };
  if (payload.flag !== 1) throw new Error("Liepin payload unavailable");

  const cards = (payload.data?.data?.jobCardList ?? []).slice(0, 30);
  const jobs = cards
    .filter((card) => card.job?.title && card.job.jobId)
    .map((card) => {
      const job = card.job!;
      const company = card.comp?.compName || "猎聘企业";
      const updatedAt = toIsoDate(job.refreshTime);
      const city = job.dq || "中国";
      const summary = compactText(
        [
          card.comp?.compIndustry,
          card.comp?.compScale,
          card.comp?.compStage,
          ...(job.labels || []),
        ]
          .filter(Boolean)
          .join(" · "),
      );
      const scoreInput = {
        title: job.title!,
        body: summary,
        city,
        experience: job.requireWorkYears || "经验未知",
        salary: job.salary || "薪资面议",
        profile,
      };
      const experience = job.requireWorkYears || "经验未知";
      const salary = job.salary || "薪资面议";
      return addCoverage({
        id: `liepin-${job.jobId}`,
        title: job.title!,
        company,
        companyCode: "LP",
        color: "#f39a31",
        city,
        experience,
        meta: `${city} · ${experience} · ${job.requireEduLevel || "学历不限"}`,
        salary,
        source: "猎聘",
        sourceType: "招聘平台",
        match: scoreJob(scoreInput),
        freshness: freshness(updatedAt),
        updatedAt,
        tags: [
          card.comp?.compIndustry,
          card.comp?.compScale,
          card.comp?.compStage,
        ]
          .filter((item): item is string => Boolean(item))
          .slice(0, 3),
        reasons: recommendationReasons(scoreInput, "猎聘公开职位"),
        summary:
          summary.slice(0, 220) || "请前往猎聘查看完整岗位信息。",
        originalUrl:
          job.link || `https://www.liepin.com/a/${job.jobId}.shtml`,
        provider: "liepin",
      });
    });

  return {
    jobs,
    source: {
      id: "liepin",
      name: "猎聘",
      type: "platform",
      status: "online",
      count: payload.data?.pagination?.totalCounts ?? jobs.length,
      detail: `公开接口返回 ${payload.data?.pagination?.totalCounts ?? jobs.length} 个相关职位`,
      url: searchUrl,
    } satisfies SourceState,
  };
}

function errorSource(
  id: SourceState["id"],
  query: string,
): SourceState {
  const definitions = {
    tencent: {
      name: "腾讯招聘",
      type: "official" as const,
      url: `${TENCENT_SEARCH}?keywords=${encodeURIComponent(query)}`,
    },
    netease: {
      name: "网易招聘",
      type: "official" as const,
      url: `${NETEASE_SEARCH}?keyword=${encodeURIComponent(query)}`,
    },
    nowcoder: {
      name: "牛客招聘",
      type: "platform" as const,
      url: `${NOWCODER_SEARCH}?query=${encodeURIComponent(query)}`,
    },
    liepin: {
      name: "猎聘",
      type: "platform" as const,
      url: `${LIEPIN_SEARCH}?key=${encodeURIComponent(query)}`,
    },
  };
  return {
    id,
    ...definitions[id],
    status: "error",
    count: 0,
    detail: "本次连接失败，可前往原站搜索",
  };
}

function skippedOfficialSource(
  id: "tencent" | "netease",
  company: CompanyProfile,
  query: string,
): SourceState {
  const definitions = {
    tencent: {
      name: "腾讯招聘",
      url: `${TENCENT_SEARCH}?keywords=${encodeURIComponent(query)}`,
    },
    netease: {
      name: "网易招聘",
      url: `${NETEASE_SEARCH}?keyword=${encodeURIComponent(query)}`,
    },
  };
  return {
    id,
    ...definitions[id],
    type: "official",
    status: "limited",
    count: 0,
    detail: `本次聚焦 ${company.name}，该官网不适用`,
  };
}

function dedupeJobs(jobs: NormalizedJob[]) {
  const seen = new Map<string, NormalizedJob>();
  jobs.forEach((job) => {
    const key = `${job.company}-${job.title}`
      .toLowerCase()
      .replaceAll(/\s+/g, "")
      .replaceAll(/[（）()·\-—]/g, "");
    const existing = seen.get(key);
    if (!existing || existing.sourceType === "招聘平台") {
      seen.set(key, job);
    }
  });
  return [...seen.values()];
}

async function fetchAcrossRoles(
  roles: string[],
  fetchRole: (role: string) => Promise<{
    jobs: NormalizedJob[];
    source: SourceState;
  }>,
) {
  const results = await Promise.allSettled(roles.map(fetchRole));
  const succeeded = results
    .filter(
      (
        result,
      ): result is PromiseFulfilledResult<{
        jobs: NormalizedJob[];
        source: SourceState;
      }> => result.status === "fulfilled",
    )
    .map((result) => result.value);
  if (!succeeded.length) {
    const failed = results.find(
      (result): result is PromiseRejectedResult =>
        result.status === "rejected",
    );
    throw failed?.reason || new Error("Source unavailable");
  }

  const jobs = dedupeJobs(succeeded.flatMap((result) => result.jobs));
  const source = succeeded[0].source;
  return {
    jobs,
    source:
      roles.length === 1
        ? source
        : {
            ...source,
            count: jobs.length,
            detail: `已查询 ${succeeded.length}/${roles.length} 个目标方向，本页合并 ${jobs.length} 个职位`,
          },
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawQuery =
    url.searchParams.get("q")?.trim().slice(0, 80) || "游戏策划";
  const legacyRoles = splitTerms(rawQuery);
  const primaryRole = legacyRoles[0] || "游戏策划";
  const relatedParam =
    url.searchParams.get("related")?.trim().slice(0, 240) || "";
  const relatedRoles = [
    ...legacyRoles.slice(1),
    ...splitTerms(relatedParam),
  ].filter(
    (role, index, roles) =>
      role !== primaryRole && roles.indexOf(role) === index,
  );
  const roleQueries = [primaryRole, ...relatedRoles].slice(0, 3);
  const query = primaryRole;
  const primaryMatchTerms = splitTerms(
    url.searchParams.get("matchTerms")?.trim().slice(0, 320) || "",
  );
  const relatedMatchTerms = splitTerms(
    url.searchParams.get("relatedMatchTerms")?.trim().slice(0, 480) || "",
  );
  const cities = url.searchParams.get("cities")?.trim().slice(0, 100) || "";
  const years = url.searchParams.get("years")?.trim().slice(0, 40) || "";
  const salary = url.searchParams.get("salary")?.trim().slice(0, 40) || "";
  const currentRole =
    url.searchParams.get("currentRole")?.trim().slice(0, 80) || "";
  const keywords =
    url.searchParams.get("keywords")?.trim().slice(0, 120) || "";
  const strictYears = url.searchParams.get("strictYears") === "true";
  const strictSalary = url.searchParams.get("strictSalary") === "true";
  const allowRemote = url.searchParams.get("allowRemote") !== "false";
  const profile: SearchProfile = {
    currentRole,
    targetRole: (primaryMatchTerms.length
      ? primaryMatchTerms
      : [primaryRole]
    ).join("、"),
    relatedRoles: (relatedMatchTerms.length
      ? relatedMatchTerms
      : relatedRoles
    ).join("、"),
    cities,
    years,
    salary,
    keywords,
    strictYears,
    strictSalary,
    allowRemote,
  };
  const requestedCompany =
    url.searchParams.get("company")?.trim().slice(0, 80) || "";
  const selectedCompany = requestedCompany
    ? findCoveredCompany(requestedCompany)
    : undefined;

  const results = await Promise.allSettled([
    selectedCompany && selectedCompany.id !== "tencent"
      ? Promise.resolve({
          jobs: [] as NormalizedJob[],
          source: skippedOfficialSource("tencent", selectedCompany, query),
        })
      : fetchAcrossRoles(roleQueries, (role) =>
          fetchTencent(role, profile),
        ),
    selectedCompany && selectedCompany.id !== "netease"
      ? Promise.resolve({
          jobs: [] as NormalizedJob[],
          source: skippedOfficialSource("netease", selectedCompany, query),
        })
      : fetchAcrossRoles(roleQueries, (role) =>
          fetchNetease(role, profile),
        ),
    fetchAcrossRoles(roleQueries, (role) =>
      fetchNowcoder(
        role,
        profile,
        selectedCompany ? `${selectedCompany.name} ${role}` : role,
      ),
    ),
    fetchAcrossRoles(roleQueries, (role) =>
      fetchLiepin(
        role,
        profile,
        selectedCompany ? `${selectedCompany.name} ${role}` : role,
      ),
    ),
  ]);

  const sourceIds: SourceState["id"][] = [
    "tencent",
    "netease",
    "nowcoder",
    "liepin",
  ];
  const sources: SourceState[] = [];
  const collectedJobs: NormalizedJob[] = [];

  results.forEach((result, index) => {
    const id = sourceIds[index];
    if (result.status === "fulfilled") {
      sources.push(result.value.source);
      collectedJobs.push(...result.value.jobs);
    } else {
      sources.push(errorSource(id, query));
    }
  });

  const collectedUniqueJobs = dedupeJobs(collectedJobs);
  const jobs: RankedJob[] = collectedUniqueJobs.flatMap((job): RankedJob[] => {
    const companyMatches =
      !selectedCompany ||
      job.coveredCompany === selectedCompany.name ||
      findCoveredCompany(job.company)?.id === selectedCompany.id;
    const industryMatches =
      job.sourceType === "官网直招" || matchesIndustryScope(job);
    if (!companyMatches || !industryMatches) return [];

    const evaluation = evaluateProfile(job, profile);
    if (!evaluation.eligible) return [];
    return [
      {
        ...job,
        matchTier: evaluation.tier as MatchTier,
        grade: evaluation.grade as RankedJob["grade"],
        tierLabel: evaluation.tierLabel as RankedJob["tierLabel"],
        matchDimensions: evaluation.dimensions,
      },
    ];
  });
  const tierOrder: Record<MatchTier, number> = {
    priority: 0,
    incomplete: 1,
    expanded: 2,
  };
  jobs.sort((a, b) => {
    const tierDifference =
      tierOrder[a.matchTier] - tierOrder[b.matchTier];
    if (tierDifference) return tierDifference;
    if (b.match !== a.match) return b.match - a.match;
    if (a.sourceType !== b.sourceType) {
      return a.sourceType === "官网直招" ? -1 : 1;
    }
    return (
      new Date(b.updatedAt || 0).getTime() -
      new Date(a.updatedAt || 0).getTime()
    );
  });
  const tierCounts = jobs.reduce<Record<MatchTier, number>>(
    (counts, job) => {
      counts[job.matchTier] += 1;
      return counts;
    },
    { priority: 0, expanded: 0, incomplete: 0 },
  );

  return Response.json(
    {
      jobs,
      sources,
      fetchedAt: new Date().toISOString(),
      query,
      filters: {
        roles: [primaryRole],
        relatedRoles,
        primaryMatchTerms,
        relatedMatchTerms,
        cities: splitTerms(cities),
        years,
        salary,
        keywords: splitTerms(keywords),
        strictYears,
        strictSalary,
        allowRemote,
      },
      tierCounts,
      filtering: {
        collectedJobs: collectedUniqueJobs.length,
        matchedJobs: jobs.length,
      },
      company: selectedCompany?.name,
      live: sources.some((source) => source.status === "online"),
      coverage: {
        matchedJobs: jobs.filter((job) => job.coverageOrder).length,
        matchedCompanies: new Set(
          jobs.map((job) => job.coveredCompany).filter(Boolean),
        ).size,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    },
  );
}
