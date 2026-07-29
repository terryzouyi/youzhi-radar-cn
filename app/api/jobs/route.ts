type NormalizedJob = {
  id: string;
  title: string;
  company: string;
  companyCode: string;
  color: string;
  meta: string;
  salary: string;
  source: string;
  sourceType: "官网直招";
  match: number;
  freshness: string;
  updatedAt: string;
  tags: string[];
  reasons: string[];
  summary: string;
  originalUrl: string;
  provider: "tencent" | "netease";
};

type SourceState = {
  id: "tencent" | "netease";
  name: string;
  status: "online" | "error";
  count: number;
  detail: string;
  url: string;
};

type TencentPost = {
  PostId: string;
  RecruitPostName: string;
  CountryName?: string;
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

const TENCENT_SEARCH = "https://careers.tencent.com/search.html";
const NETEASE_SEARCH = "https://hr.163.com/job-list.html";

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
  if (!value) return new Date().toISOString();
  if (typeof value === "number") return new Date(value).toISOString();
  const matched = value.match(/(\d{4})年(\d{2})月(\d{2})日/);
  if (!matched) return new Date().toISOString();
  return new Date(
    `${matched[1]}-${matched[2]}-${matched[3]}T00:00:00+08:00`,
  ).toISOString();
}

function freshness(iso: string) {
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
  query: string;
  keywords: string;
  cities: string;
}) {
  const haystack = `${input.title} ${input.body}`.toLowerCase();
  const targetTerms = cleanList(`${input.query} ${input.keywords}`);
  const cityTerms = cleanList(input.cities);
  const titleHit = targetTerms.some((term) =>
    input.title.toLowerCase().includes(term.toLowerCase()),
  );
  const hits = targetTerms.filter((term) =>
    haystack.includes(term.toLowerCase()),
  ).length;
  const cityHit = cityTerms.some((city) => input.city.includes(city));
  return Math.min(
    98,
    66 +
      (titleHit ? 12 : 0) +
      Math.min(12, hits * 3) +
      (cityHit ? 8 : 0),
  );
}

function recommendationReasons(input: {
  title: string;
  body: string;
  city: string;
  query: string;
  keywords: string;
  cities: string;
}) {
  const reasons: string[] = [];
  const haystack = `${input.title} ${input.body}`;
  if (
    cleanList(input.query).some((term) =>
      input.title.toLowerCase().includes(term.toLowerCase()),
    )
  ) {
    reasons.push("目标岗位命中");
  }
  if (
    cleanList(input.keywords).some((term) =>
      haystack.toLowerCase().includes(term.toLowerCase()),
    )
  ) {
    reasons.push("能力关键词命中");
  }
  if (cleanList(input.cities).some((city) => input.city.includes(city))) {
    reasons.push("意向城市命中");
  }
  reasons.push("厂商官网来源");
  return reasons.slice(0, 3);
}

async function fetchTencent(query: string, cities: string, keywords: string) {
  const params = new URLSearchParams({
    keyword: query,
    pageIndex: "1",
    pageSize: "30",
    language: "zh-cn",
    area: "cn",
  });
  const response = await fetch(
    `https://careers.tencent.com/tencentcareer/api/post/Query?${params}`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(9_000),
    },
  );
  if (!response.ok) throw new Error(`Tencent returned ${response.status}`);
  const payload = (await response.json()) as {
    Code?: number;
    Data?: { Count?: number; Posts?: TencentPost[] };
  };
  if (payload.Code !== 200) throw new Error("Tencent payload unavailable");

  const posts = payload.Data?.Posts ?? [];
  const jobs: NormalizedJob[] = posts.map((post) => {
    const updatedAt = toIsoDate(post.LastUpdateTime);
    const body = compactText(post.Responsibility);
    const city = post.LocationName || "中国";
    const scoreInput = {
      title: post.RecruitPostName,
      body,
      city,
      query,
      keywords,
      cities,
    };
    return {
      id: `tencent-${post.PostId}`,
      title: post.RecruitPostName,
      company: post.ProductName
        ? `腾讯 · ${post.ProductName}`
        : "腾讯",
      companyCode: "TX",
      color: "#2d6bff",
      meta: `${city} · ${post.RequireWorkYearsName || "经验不限"} · ${post.BGName || "腾讯"}`,
      salary: "薪资面议",
      source: "腾讯招聘",
      sourceType: "官网直招",
      match: scoreJob(scoreInput),
      freshness: freshness(updatedAt),
      updatedAt,
      tags: [
        post.CategoryName,
        post.BGName,
        post.ProductName,
      ].filter((item): item is string => Boolean(item)).slice(0, 3),
      reasons: recommendationReasons(scoreInput),
      summary: body.slice(0, 220) || "请前往腾讯招聘官网查看完整岗位职责。",
      originalUrl: (post.PostURL || `https://careers.tencent.com/jobdesc.html?postId=${post.PostId}`).replace(
        /^http:/,
        "https:",
      ),
      provider: "tencent",
    };
  });

  return {
    jobs,
    source: {
      id: "tencent",
      name: "腾讯招聘",
      status: "online",
      count: payload.Data?.Count ?? jobs.length,
      detail: `官网返回 ${payload.Data?.Count ?? jobs.length} 个相关岗位`,
      url: `${TENCENT_SEARCH}?keywords=${encodeURIComponent(query)}`,
    } satisfies SourceState,
  };
}

async function fetchNetease(query: string, cities: string, keywords: string) {
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
        pageSize: 30,
        sortType: 2,
        keyword: query,
      }),
      signal: AbortSignal.timeout(9_000),
    },
  );
  if (!response.ok) throw new Error(`NetEase returned ${response.status}`);
  const payload = (await response.json()) as {
    code?: number;
    data?: { total?: number; list?: NeteasePost[] };
  };
  if (payload.code !== 200) throw new Error("NetEase payload unavailable");

  const posts = payload.data?.list ?? [];
  const jobs: NormalizedJob[] = posts.map((post) => {
    const updatedAt = toIsoDate(post.updateTime);
    const body = compactText(
      [post.description, post.requirement].filter(Boolean).join(" "),
    );
    const city = post.workPlaceNameList?.join(" / ") || "中国";
    const scoreInput = {
      title: post.name,
      body,
      city,
      query,
      keywords,
      cities,
    };
    return {
      id: `netease-${post.id}`,
      title: post.name,
      company: post.productName || "网易",
      companyCode: "NE",
      color: "#d23b32",
      meta: `${city} · ${post.reqWorkYearsName || "经验不限"} · ${post.reqEducationName || "学历不限"}`,
      salary: "薪资面议",
      source: "网易招聘",
      sourceType: "官网直招",
      match: scoreJob(scoreInput),
      freshness: freshness(updatedAt),
      updatedAt,
      tags: [
        post.firstPostTypeName,
        post.firstDepName,
        post.productName,
      ].filter((item): item is string => Boolean(item)).slice(0, 3),
      reasons: recommendationReasons(scoreInput),
      summary: body.slice(0, 220) || "请前往网易招聘官网查看完整岗位职责。",
      originalUrl: `https://hr.163.com/job-detail.html?id=${post.id}`,
      provider: "netease",
    };
  });

  return {
    jobs,
    source: {
      id: "netease",
      name: "网易招聘",
      status: "online",
      count: payload.data?.total ?? jobs.length,
      detail: `官网返回 ${payload.data?.total ?? jobs.length} 个相关岗位`,
      url: `${NETEASE_SEARCH}?keyword=${encodeURIComponent(query)}`,
    } satisfies SourceState,
  };
}

function errorSource(
  id: "tencent" | "netease",
  query: string,
): SourceState {
  const isTencent = id === "tencent";
  return {
    id,
    name: isTencent ? "腾讯招聘" : "网易招聘",
    status: "error",
    count: 0,
    detail: "本次连接失败，可前往官网搜索",
    url: isTencent
      ? `${TENCENT_SEARCH}?keywords=${encodeURIComponent(query)}`
      : `${NETEASE_SEARCH}?keyword=${encodeURIComponent(query)}`,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawQuery = url.searchParams.get("q")?.trim() || "游戏策划";
  const query =
    rawQuery
      .replaceAll("/", "、")
      .split(/[、,，]/)
      .map((part) => part.trim())
      .find(Boolean) || "游戏策划";
  const cities = url.searchParams.get("cities")?.trim() || "";
  const keywords = url.searchParams.get("keywords")?.trim() || "";

  const results = await Promise.allSettled([
    fetchTencent(query, cities, keywords),
    fetchNetease(query, cities, keywords),
  ]);

  const sources: SourceState[] = [];
  const jobs: NormalizedJob[] = [];
  results.forEach((result, index) => {
    const id = index === 0 ? "tencent" : "netease";
    if (result.status === "fulfilled") {
      sources.push(result.value.source);
      jobs.push(...result.value.jobs);
    } else {
      sources.push(errorSource(id, query));
    }
  });

  jobs.sort((a, b) => {
    if (b.match !== a.match) return b.match - a.match;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return Response.json(
    {
      jobs,
      sources,
      fetchedAt: new Date().toISOString(),
      query,
      live: sources.some((source) => source.status === "online"),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    },
  );
}
