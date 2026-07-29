"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CompanyKind,
  companyCoverageStats,
  companyProfiles,
} from "../data/companies";
import {
  findRoleTrack,
  roleTracks,
} from "../data/job-taxonomy";
import { recruitmentSignals } from "../data/recruitment-signals";
import { isRecentJob } from "../lib/job-filtering.js";

type MatchTier = "priority" | "expanded" | "incomplete";

type Profile = {
  currentRole: string;
  years: string;
  targetRole: string;
  specialties: string[];
  cities: string;
  salary: string;
  keywords: string;
  strictYears: boolean;
  strictSalary: boolean;
  allowRemote: boolean;
};

type Job = {
  id: string | number;
  title: string;
  company: string;
  companyCode: string;
  color: string;
  city?: string;
  experience?: string;
  meta: string;
  salary: string;
  source: string;
  sourceType: "官网直招" | "招聘平台";
  match: number;
  freshness: string;
  tags: string[];
  reasons: string[];
  summary: string;
  originalUrl?: string;
  updatedAt?: string | null;
  provider?:
    | "tencent"
    | "netease"
    | "nowcoder"
    | "liepin"
    | "demo";
  coverageOrder?: number;
  coveredCompany?: string;
  matchTier?: MatchTier;
  grade?: "A" | "B" | "C";
  tierLabel?: "精准匹配" | "拓展机会" | "信息待确认";
  matchDimensions?: {
    role: string;
    conditions: string;
    data: string;
  };
};

type SourceState = {
  id: string;
  name: string;
  type?: "official" | "platform";
  status: "online" | "error" | "waiting" | "limited";
  count: number;
  detail: string;
  url: string;
};

type JobsResponse = {
  jobs: Job[];
  sources: SourceState[];
  fetchedAt: string;
  query: string;
  company?: string;
  live: boolean;
  tierCounts?: Record<MatchTier, number>;
  coverage?: {
    matchedJobs: number;
    matchedCompanies: number;
  };
};

const defaultProfile: Profile = {
  currentRole: "游戏产品经理",
  years: "3–5 年",
  targetRole: "游戏策划",
  specialties: ["系统策划", "商业化策划", "数值策划"],
  cities: "上海、杭州、深圳",
  salary: "25–35K",
  keywords: "全球化，长线运营",
  strictYears: false,
  strictSalary: false,
  allowRemote: true,
};

const demoJobs: Job[] = [
  {
    id: 1,
    title: "高级系统策划 — 全球化新品",
    company: "腾讯游戏",
    companyCode: "TX",
    color: "#2d6bff",
    meta: "深圳 · 3–5 年 · 本科",
    salary: "25–40K · 16薪",
    source: "腾讯招聘",
    sourceType: "官网直招",
    match: 96,
    freshness: "37 分钟前",
    tags: ["系统策划", "商业化", "全球化"],
    reasons: ["方向高度重合", "薪资在目标区间", "城市命中"],
    matchTier: "priority",
    grade: "A",
    tierLabel: "精准匹配",
    matchDimensions: {
      role: "主方向命中",
      conditions: "年限匹配 · 薪资达到预期",
      data: "关键信息完整",
    },
    summary:
      "负责全球化新品的核心系统、成长线与商业化体验设计，要求能独立完成从需求分析到版本验收的完整闭环。",
    provider: "demo",
  },
  {
    id: 2,
    title: "游戏产品经理（策略竞技）",
    company: "网易游戏",
    companyCode: "NE",
    color: "#d23b32",
    meta: "杭州 · 3–5 年 · 本科",
    salary: "28–42K",
    source: "网易人才",
    sourceType: "官网直招",
    match: 93,
    freshness: "今天 09:18",
    tags: ["产品规划", "策略竞技", "数据分析"],
    reasons: ["经历可迁移", "城市命中", "近期活跃"],
    matchTier: "expanded",
    grade: "C",
    tierLabel: "拓展机会",
    matchDimensions: {
      role: "可迁移方向",
      conditions: "年限匹配 · 薪资达到预期",
      data: "关键信息完整",
    },
    summary:
      "面向策略竞技品类，推进玩法与版本规划，并结合用户研究和数据分析持续优化核心循环。",
    provider: "demo",
  },
  {
    id: 3,
    title: "商业化策划 — 开放世界项目",
    company: "米哈游",
    companyCode: "MHY",
    color: "#6269dd",
    meta: "上海 · 3–5 年 · 本科",
    salary: "30–45K · 15薪",
    source: "米哈游招聘",
    sourceType: "官网直招",
    match: 91,
    freshness: "昨天",
    tags: ["商业化", "开放世界", "版本运营"],
    reasons: ["核心关键词命中", "薪资高于预期", "官网首发"],
    matchTier: "priority",
    grade: "A",
    tierLabel: "精准匹配",
    matchDimensions: {
      role: "主方向命中",
      conditions: "年限匹配 · 薪资达到预期",
      data: "关键信息完整",
    },
    summary:
      "负责开放世界项目商业化内容的规划与落地，协同系统、美术和运营团队完成版本目标。",
    provider: "demo",
  },
  {
    id: 4,
    title: "资深游戏策划（SLG）",
    company: "莉莉丝游戏",
    companyCode: "LLS",
    color: "#151515",
    meta: "上海 · 5–10 年 · 本科",
    salary: "35–50K",
    source: "BOSS 直聘",
    sourceType: "招聘平台",
    match: 86,
    freshness: "今天 08:42",
    tags: ["SLG", "数值设计", "系统策划"],
    reasons: ["技能高度匹配", "年限略高", "招聘方活跃"],
    matchTier: "expanded",
    grade: "C",
    tierLabel: "拓展机会",
    matchDimensions: {
      role: "主方向命中",
      conditions: "年限有差距 · 薪资达到预期",
      data: "关键信息完整",
    },
    summary:
      "参与 SLG 长线系统与数值生态设计，建立验证框架并持续优化付费与社交体验。",
    provider: "demo",
  },
  {
    id: 5,
    title: "中高级关卡策划",
    company: "叠纸游戏",
    companyCode: "PAP",
    color: "#b94c87",
    meta: "上海 · 3–5 年 · 本科",
    salary: "薪资面议",
    source: "牛客招聘",
    sourceType: "招聘平台",
    match: 82,
    freshness: "2 天前",
    tags: ["关卡设计", "UE5", "叙事体验"],
    reasons: ["城市命中", "关卡方向命中", "薪资需要确认"],
    matchTier: "incomplete",
    grade: "B",
    tierLabel: "信息待确认",
    matchDimensions: {
      role: "主方向命中",
      conditions: "年限匹配 · 薪资待确认",
      data: "薪资待确认",
    },
    summary:
      "负责关卡节奏、玩法空间和叙事体验设计，与程序、美术协作完成白盒到正式版本的落地。",
    provider: "demo",
  },
  {
    id: 6,
    title: "游戏产品策划 — UGC 平台",
    company: "心动网络",
    companyCode: "XD",
    color: "#f06060",
    meta: "上海 · 3–5 年 · 本科",
    salary: "22–35K",
    source: "猎聘",
    sourceType: "招聘平台",
    match: 79,
    freshness: "3 天前",
    tags: ["UGC", "社区产品", "内容生态"],
    reasons: ["产品能力可迁移", "城市命中", "薪资下沿偏低"],
    matchTier: "expanded",
    grade: "C",
    tierLabel: "拓展机会",
    matchDimensions: {
      role: "可迁移方向",
      conditions: "年限匹配 · 薪资低于预期",
      data: "关键信息完整",
    },
    summary:
      "围绕 UGC 创作与消费场景设计产品能力，推进创作者工具、内容分发和社区生态建设。",
    provider: "demo",
  },
];

const navItems = [
  ["⌁", "岗位雷达"],
  ["◎", "我的方向"],
  ["☆", "收藏夹"],
  ["▦", "厂商库"],
];

const filters = ["精准匹配", "拓展机会", "信息待确认", "全部结果"];
const filterTier: Record<string, MatchTier | null> = {
  精准匹配: "priority",
  拓展机会: "expanded",
  信息待确认: "incomplete",
  全部结果: null,
};
const companyKinds: Array<CompanyKind | "全部"> = [
  "全部",
  "头部综合",
  "核心厂商",
  "成长出海",
  "独立新锐",
  "互联网游戏业务",
];
const isGitHubPages =
  process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
const liveSiteUrl =
  "https://youzhi-radar-cn.sakurazou792501.chatgpt.site";

function normalizeStoredProfile(value: unknown): Profile {
  if (!value || typeof value !== "object") return defaultProfile;
  const stored = value as Partial<Profile>;
  const legacyTarget =
    typeof stored.targetRole === "string"
      ? stored.targetRole.split(/[\/、,，;；]/)[0].trim()
      : defaultProfile.targetRole;
  const role =
    roleTracks.find(
      (track) =>
        track.label === legacyTarget ||
        legacyTarget.includes(track.label) ||
        (legacyTarget === "产品经理" && track.label === "游戏产品经理"),
    ) || findRoleTrack(defaultProfile.targetRole);
  return {
    ...defaultProfile,
    ...stored,
    targetRole: role.label,
    specialties: Array.isArray(stored.specialties)
      ? stored.specialties.filter((item): item is string => typeof item === "string")
      : defaultProfile.specialties,
    strictYears: stored.strictYears === true,
    strictSalary: stored.strictSalary === true,
    allowRemote: stored.allowRemote !== false,
  };
}

function getJobTier(job: Job): MatchTier {
  if (job.matchTier) return job.matchTier;
  if (job.match >= 90) return "priority";
  if (job.match >= 80) return "incomplete";
  return "expanded";
}

function getJobGrade(job: Job) {
  return job.grade || (getJobTier(job) === "priority"
    ? "A"
    : getJobTier(job) === "incomplete"
      ? "B"
      : "C");
}

const initialOfficialSources: SourceState[] = [
  {
    id: "tencent",
    name: "腾讯招聘",
    type: "official",
    status: "waiting",
    count: 0,
    detail: "正在连接官网",
    url: "https://careers.tencent.com/zh-cn/",
  },
  {
    id: "netease",
    name: "网易招聘",
    type: "official",
    status: "waiting",
    count: 0,
    detail: "正在连接官网",
    url: "https://hr.163.com/job-list.html",
  },
  {
    id: "nowcoder",
    name: "牛客招聘",
    type: "platform",
    status: "waiting",
    count: 0,
    detail: "正在连接公开职位接口",
    url: "https://www.nowcoder.com/jobs/fulltime/center",
  },
  {
    id: "liepin",
    name: "猎聘",
    type: "platform",
    status: "waiting",
    count: 0,
    detail: "正在连接公开职位接口",
    url: "https://www.liepin.com/zhaopin/",
  },
];
const staticMirrorSources: SourceState[] = initialOfficialSources.map(
  (source) => ({
    ...source,
    status: "limited",
    detail: "静态镜像不请求实时职位",
  }),
);

export default function Home() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [savedProfile, setSavedProfile] = useState<Profile>(defaultProfile);
  const [activeNav, setActiveNav] = useState("岗位雷达");
  const [activeFilter, setActiveFilter] = useState("精准匹配");
  const [savedJobs, setSavedJobs] = useState<Array<string | number>>([3]);
  const [search, setSearch] = useState("");
  const [scanning, setScanning] = useState(!isGitHubPages);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [notice, setNotice] = useState("");
  const [jobResults, setJobResults] = useState<Job[]>(demoJobs);
  const [sourceStates, setSourceStates] = useState<SourceState[]>(
    isGitHubPages ? staticMirrorSources : initialOfficialSources,
  );
  const [dataMode, setDataMode] = useState<
    "loading" | "live" | "fallback"
  >(isGitHubPages ? "fallback" : "loading");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [coverage, setCoverage] = useState({
    matchedJobs: 0,
    matchedCompanies: 0,
  });
  const [companyFocus, setCompanyFocus] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [companyKind, setCompanyKind] = useState<CompanyKind | "全部">("全部");
  const [companyLimit, setCompanyLimit] = useState(24);
  const activeRoleTrack = findRoleTrack(profile.targetRole);

  const loadJobs = useCallback(
    async (
      currentProfile: Profile,
      announce = false,
      companyName = "",
    ) => {
      setScanning(true);
      if (announce) setNotice("");
      if (isGitHubPages) {
        setJobResults(demoJobs);
        setSourceStates(staticMirrorSources);
        setCoverage({ matchedJobs: 0, matchedCompanies: 0 });
        setCompanyFocus(companyName);
        setDataMode("fallback");
        setLastUpdated(null);
        if (announce) {
          setNotice("GitHub Pages 是静态镜像，请在实时版查询最新职位");
          window.setTimeout(() => setNotice(""), 4200);
        }
        setScanning(false);
        return;
      }
      const roleTrack = findRoleTrack(currentProfile.targetRole);
      const params = new URLSearchParams({
        q: roleTrack.query,
        related: roleTrack.relatedRoles.join("，"),
        currentRole: currentProfile.currentRole,
        cities: currentProfile.cities,
        years: currentProfile.years,
        salary: currentProfile.salary,
        keywords: [...currentProfile.specialties, currentProfile.keywords]
          .filter(Boolean)
          .join("，"),
        strictYears: String(currentProfile.strictYears),
        strictSalary: String(currentProfile.strictSalary),
        allowRemote: String(currentProfile.allowRemote),
      });
      if (companyName) params.set("company", companyName);
      try {
        const response = await fetch(`/api/jobs?${params}`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("职位服务暂不可用");
        const payload = (await response.json()) as JobsResponse;
        setSourceStates(payload.sources);
        setLastUpdated(payload.fetchedAt);
        setCompanyFocus(payload.company || "");
        setCoverage(
          payload.coverage || {
            matchedJobs: 0,
            matchedCompanies: 0,
          },
        );
        if (payload.live) {
          setJobResults(payload.jobs);
          setDataMode("live");
          if (announce) {
            const onlineCount = payload.sources.filter(
              (source) => source.status === "online",
            ).length;
            setNotice(
              payload.company
                ? `已为 ${payload.company} 查询 ${onlineCount} 个适用来源，找到 ${payload.jobs.length} 个职位`
                : `已从 ${onlineCount} 个实时来源获取 ${payload.jobs.length} 个职位`,
            );
          }
        } else {
          setJobResults(demoJobs);
          setDataMode("fallback");
          if (announce) {
            setNotice("实时来源本次未返回职位，暂时保留演示数据");
          }
        }
      } catch {
        setJobResults(demoJobs);
        setCompanyFocus("");
        setCoverage({ matchedJobs: 0, matchedCompanies: 0 });
        setSourceStates(
          initialOfficialSources.map((source) => ({
            ...source,
            status: "error",
            detail: "本次连接失败，可前往官网搜索",
          })),
        );
        setDataMode("fallback");
        setLastUpdated(new Date().toISOString());
        if (announce) {
            setNotice("实时来源暂时无法连接，已保留演示数据");
        }
      } finally {
        setScanning(false);
        if (announce) window.setTimeout(() => setNotice(""), 4200);
      }
    },
    [],
  );

  useEffect(() => {
    const storedProfile = window.localStorage.getItem("youzhi-profile");
    const storedSaved = window.localStorage.getItem("youzhi-saved");
    let initialProfile = defaultProfile;
    let parsedProfile: Profile | null = null;
    let parsedSavedJobs: Array<string | number> | null = null;
    if (storedProfile) {
      try {
        parsedProfile = normalizeStoredProfile(JSON.parse(storedProfile));
        initialProfile = parsedProfile;
      } catch {
        window.localStorage.removeItem("youzhi-profile");
      }
    }
    if (storedSaved) {
      try {
        parsedSavedJobs = JSON.parse(storedSaved) as Array<string | number>;
      } catch {
        window.localStorage.removeItem("youzhi-saved");
      }
    }
    window.queueMicrotask(() => {
      if (parsedProfile) {
        setProfile(parsedProfile);
        setSavedProfile(parsedProfile);
      }
      if (parsedSavedJobs) setSavedJobs(parsedSavedJobs);
      void loadJobs(initialProfile);
    });
  }, [loadJobs]);

  const displaySources = useMemo<SourceState[]>(() => {
    const query = encodeURIComponent(
      [companyFocus, savedProfile.targetRole].filter(Boolean).join(" "),
    );
    return [
      ...sourceStates,
      {
        id: "boss",
        name: "BOSS 直聘",
        type: "platform",
        status: "limited",
        count: 0,
        detail: "需安全验证，仅提供站外搜索",
        url: `https://www.zhipin.com/web/geek/job?query=${query}`,
      },
      {
        id: "zhaopin",
        name: "智联招聘",
        type: "platform",
        status: "limited",
        count: 0,
        detail: "触发安全验证，仅提供站外搜索",
        url: `https://www.zhaopin.com/sou/?kw=${query}`,
      },
      {
        id: "51job",
        name: "前程无忧",
        type: "platform",
        status: "limited",
        count: 0,
        detail: "依赖浏览器验证，仅提供站外搜索",
        url: `https://we.51job.com/pc/search?keyword=${query}`,
      },
    ];
  }, [companyFocus, savedProfile.targetRole, sourceStates]);

  const visibleCompanies = useMemo(() => {
    const keyword = companyQuery.trim().toLowerCase();
    return companyProfiles.filter((company) => {
      const passesKind =
        companyKind === "全部" || company.kind === companyKind;
      const passesQuery =
        !keyword ||
        [company.name, company.city, company.kind, ...company.aliases]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      return passesKind && passesQuery;
    });
  }, [companyKind, companyQuery]);

  const companySummary = useMemo(() => {
    const counts = new Map<string, number>();
    jobResults.forEach((job) => {
      const company = job.company.split(" · ")[0];
      counts.set(company, (counts.get(company) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [jobResults]);

  const onlineSourceCount = displaySources.filter(
    (source) => source.status === "online",
  ).length;
  const tierCounts = useMemo(
    () =>
      jobResults.reduce(
        (counts, job) => {
          counts[getJobTier(job)] += 1;
          return counts;
        },
        { priority: 0, expanded: 0, incomplete: 0 } as Record<
          MatchTier,
          number
        >,
      ),
    [jobResults],
  );
  const filterCounts: Record<string, number> = {
    精准匹配: tierCounts.priority,
    拓展机会: tierCounts.expanded,
    信息待确认: tierCounts.incomplete,
    全部结果: jobResults.length,
  };
  const referenceTime = lastUpdated
    ? new Date(lastUpdated).getTime()
    : undefined;
  const recentCount = jobResults.filter((job) => {
    return isRecentJob(job.updatedAt, referenceTime);
  }).length;

  const visibleJobs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return jobResults.filter((job) => {
      const passesSearch =
        !keyword ||
        [
          job.title,
          job.company,
          job.meta,
          job.salary,
          ...job.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      const selectedTier = filterTier[activeFilter];
      const passesFilter =
        selectedTier === null || getJobTier(job) === selectedTier;
      const passesSaved =
        activeNav !== "收藏夹" || savedJobs.includes(job.id);
      return passesSearch && passesFilter && passesSaved;
    });
  }, [
    activeFilter,
    activeNav,
    jobResults,
    savedJobs,
    search,
  ]);
  const isJobViewFiltered =
    activeFilter !== "全部结果" ||
    activeNav === "收藏夹" ||
    search.trim().length > 0;
  const resultTitle =
    activeNav === "收藏夹"
      ? "收藏职位"
      : activeFilter === "精准匹配"
        ? "优先投递的职位"
        : activeFilter === "拓展机会"
          ? "可以拓展的机会"
          : activeFilter === "信息待确认"
            ? "条件待确认的职位"
            : "全部相关职位";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSavedProfile(profile);
    window.localStorage.setItem("youzhi-profile", JSON.stringify(profile));
    setActiveNav("岗位雷达");
    setActiveFilter("精准匹配");
    setSearch("");
    if (isGitHubPages) {
      window.open(liveSiteUrl, "_blank", "noopener,noreferrer");
      return;
    }
    await loadJobs(profile, true);
  };

  const toggleSaved = (id: string | number) => {
    setSavedJobs((current) => {
      const next = current.includes(id)
        ? current.filter((jobId) => jobId !== id)
        : [...current, id];
      window.localStorage.setItem("youzhi-saved", JSON.stringify(next));
      return next;
    });
  };

  const handleNav = (label: string) => {
    setActiveNav(label);
    setActiveFilter(label === "收藏夹" ? "全部结果" : "精准匹配");
    const target =
      label === "我的方向"
        ? document.getElementById("profile-title")
        : label === "厂商库"
          ? document.getElementById("company-title")
          : document.getElementById("results-title");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const rerunScan = async () => {
    if (isGitHubPages) {
      window.open(liveSiteUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setSearch("");
    await loadJobs(savedProfile, true, companyFocus);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            Y
          </span>
          <span>
            <strong>游职雷达</strong>
            <small>JOB SIGNAL</small>
          </span>
        </div>

        <div className="scope-pill">
          <span className="live-dot" />
          互联网 / 游戏 · 中国
        </div>

        <nav className="main-nav" aria-label="主导航">
          <p>工作台</p>
          {navItems.map(([icon, label]) => (
            <button
              className={activeNav === label ? "active" : ""}
              key={label}
              onClick={() => handleNav(label)}
              type="button"
            >
              <span aria-hidden="true">{icon}</span>
              {label}
              {label === "收藏夹" && <em>{savedJobs.length}</em>}
              {label === "厂商库" && <em>{companyCoverageStats.total}</em>}
            </button>
          ))}
        </nav>

        <div className="source-mini">
          <div className="source-mini-head">
            <span>来源状态</span>
            <b>
              {onlineSourceCount} / {displaySources.length}
            </b>
          </div>
          <div
            className="signal-bars"
            aria-label={`${onlineSourceCount} 个数据源实时连接`}
          >
            {displaySources.map((source) => (
              <i
                className={source.status === "online" ? "on" : ""}
                key={source.id}
              />
            ))}
          </div>
          <small>
            {isGitHubPages
              ? "公开镜像 · 实时数据在安全版"
              : "手动刷新 · 服务端缓存 5 分钟"}
          </small>
        </div>

        <div className="sidebar-foot">
          <span className="avatar">Z</span>
          <span>
            <strong>我的求职空间</strong>
            <small>仅保存在当前设备</small>
          </span>
          <button aria-label="更多设置" type="button">
            ···
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">岗位雷达 / 今日扫描</span>
            <h1>把投递时间，留给更值得的机会。</h1>
          </div>
          <div className="top-actions">
            <span>
              <i
                className={
                  dataMode === "live" ? "live-dot" : "status-dot warning"
                }
              />{" "}
              {lastUpdated
                ? `最近更新 ${new Intl.DateTimeFormat("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(new Date(lastUpdated))}`
                : isGitHubPages
                  ? "GitHub Pages 静态镜像"
                  : "正在连接官网"}
            </span>
            <button
              className="secondary-button"
              disabled={!isGitHubPages && scanning}
              onClick={rerunScan}
              type="button"
            >
              {isGitHubPages
                ? "打开实时版 ↗"
                : scanning
                  ? "连接官网中…"
                  : "↻ 重新扫描"}
            </button>
          </div>
        </header>

        {isGitHubPages && (
          <aside className="static-mirror-banner">
            <div>
              <strong>公开静态镜像</strong>
              <span>
                这里展示产品界面与 Top100 厂商库，不会从招聘网站读取实时职位。
              </span>
            </div>
            <a href={liveSiteUrl} rel="noreferrer" target="_blank">
              前往实时版查询 →
            </a>
          </aside>
        )}

        <section className="profile-panel" aria-labelledby="profile-title">
          <div className="profile-intro">
            <span className="section-number">01</span>
            <div>
              <p className="kicker">你的目标画像</p>
              <h2 id="profile-title">先定义方向，再开始搜索。</h2>
              <p>
                只选一个主方向，专长用于排序；城市是明确边界，年限和薪资默认用于分层，不会悄悄删掉机会。
              </p>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <label>
              <span>当前职位</span>
              <input
                onChange={(event) =>
                  setProfile({ ...profile, currentRole: event.target.value })
                }
                value={profile.currentRole}
              />
            </label>
            <label>
              <span>工作年限</span>
              <select
                onChange={(event) =>
                  setProfile({ ...profile, years: event.target.value })
                }
                value={profile.years}
              >
                <option>1–3 年</option>
                <option>3–5 年</option>
                <option>5–10 年</option>
                <option>10 年以上</option>
              </select>
            </label>
            <label className="wide">
              <span>主方向（单选）</span>
              <select
                onChange={(event) => {
                  const nextTrack = findRoleTrack(event.target.value);
                  setProfile({
                    ...profile,
                    targetRole: nextTrack.label,
                    specialties: nextTrack.specialties.slice(0, 2),
                  });
                }}
                value={profile.targetRole}
              >
                {roleTracks.map((track) => (
                  <option key={track.id} value={track.label}>
                    {track.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="wide">
              <span>意向城市</span>
              <input
                onChange={(event) =>
                  setProfile({ ...profile, cities: event.target.value })
                }
                value={profile.cities}
              />
            </label>
            <label>
              <span>期望月薪</span>
              <input
                onChange={(event) =>
                  setProfile({ ...profile, salary: event.target.value })
                }
                value={profile.salary}
              />
            </label>
            <fieldset className="profile-fieldset">
              <legend>专长偏好（可多选，只影响排序）</legend>
              <div className="specialty-options">
                {activeRoleTrack.specialties.map((specialty) => {
                  const selected = profile.specialties.includes(specialty);
                  return (
                    <button
                      aria-pressed={selected}
                      className={selected ? "active" : ""}
                      key={specialty}
                      onClick={() =>
                        setProfile({
                          ...profile,
                          specialties: selected
                            ? profile.specialties.filter(
                                (item) => item !== specialty,
                              )
                            : [...profile.specialties, specialty],
                        })
                      }
                      type="button"
                    >
                      {selected ? "✓ " : "+ "}
                      {specialty}
                    </button>
                  );
                })}
              </div>
              <small>
                {`系统会自动把 ${
                  activeRoleTrack.relatedRoles.join("、") || "相邻岗位"
                } 放入拓展机会，不与主方向混在一起。`}
              </small>
            </fieldset>
            <label className="wide keyword-field">
              <span>补充关键词（项目、品类或能力）</span>
              <input
                placeholder="例如：全球化、SLG、长线运营"
                onChange={(event) =>
                  setProfile({ ...profile, keywords: event.target.value })
                }
                value={profile.keywords}
              />
            </label>
            <fieldset className="filter-preferences">
              <legend>匹配边界</legend>
              <button
                aria-pressed={profile.strictYears}
                className={profile.strictYears ? "active" : ""}
                onClick={() =>
                  setProfile({
                    ...profile,
                    strictYears: !profile.strictYears,
                  })
                }
                type="button"
              >
                {profile.strictYears ? "✓" : "○"} 年限严格
              </button>
              <button
                aria-pressed={profile.strictSalary}
                className={profile.strictSalary ? "active" : ""}
                onClick={() =>
                  setProfile({
                    ...profile,
                    strictSalary: !profile.strictSalary,
                  })
                }
                type="button"
              >
                {profile.strictSalary ? "✓" : "○"} 薪资严格
              </button>
              <button
                aria-pressed={profile.allowRemote}
                className={profile.allowRemote ? "active" : ""}
                onClick={() =>
                  setProfile({
                    ...profile,
                    allowRemote: !profile.allowRemote,
                  })
                }
                type="button"
              >
                {profile.allowRemote ? "✓" : "○"} 接受远程 / 全国
              </button>
            </fieldset>
            <button className="primary-button" disabled={scanning} type="submit">
              {isGitHubPages ? (
                "前往实时版匹配 →"
              ) : scanning ? (
                <>
                  <i className="spinner" /> 正在查询 4 个实时来源
                </>
              ) : (
                "保存并开始匹配 →"
              )}
            </button>
          </form>
        </section>

        <section className="metric-strip" aria-label="今日扫描摘要">
          <div>
            <strong>{visibleJobs.length}</strong>
            <span>{isJobViewFiltered ? "筛选后职位" : "已获取职位"}</span>
            <small>
              {isJobViewFiltered
                ? `原始匹配结果 ${jobResults.length} 条`
                : dataMode === "live"
                  ? "本次从官网读取并标准化"
                  : isGitHubPages
                    ? "静态镜像演示职位"
                    : "当前显示演示数据"}
            </small>
          </div>
          <div>
            <strong>{tierCounts.priority}</strong>
            <span>优先投递</span>
            <small>A 级 · 主方向与已知条件吻合</small>
          </div>
          <div>
            <strong>{onlineSourceCount}</strong>
            <span>实时来源</span>
            <small>
              {isGitHubPages
                ? "请前往实时版查询"
                : "官网与公开招聘平台"}
            </small>
          </div>
          <div>
            <strong>{recentCount}</strong>
            <span>近三天更新</span>
            <small>按官网更新时间计算</small>
          </div>
          <div className="metric-profile">
            <span>当前方向</span>
            <strong>{savedProfile.targetRole}</strong>
            <small>
              {savedProfile.cities} · {savedProfile.salary}
            </small>
          </div>
        </section>

        <section
          className="intelligence-panel"
          aria-labelledby="intelligence-title"
        >
          <div className="intelligence-head">
            <div className="intelligence-title">
              <span className="section-number">02</span>
              <div>
                <p className="kicker">招聘情报</p>
                <h2 id="intelligence-title">
                  职位之外，也追踪招聘批次和官方动态。
                </h2>
                <p>
                  官网职位是主数据；公众号、校招专题和官方内容用于补充提前批、专项招募、实习窗口与安全提醒。
                </p>
              </div>
            </div>
            <div className="channel-summary" aria-label="招聘渠道覆盖摘要">
              <div>
                <strong>{companyCoverageStats.official}</strong>
                <span>官网招聘入口</span>
              </div>
              <div>
                <strong>{companyCoverageStats.wechatKnown}</strong>
                <span>已收录招聘号</span>
              </div>
              <div>
                <strong>{companyCoverageStats.campus}</strong>
                <span>校招 / 实习专题</span>
              </div>
              <div>
                <strong>{recruitmentSignals.length}</strong>
                <span>当前精选情报</span>
              </div>
            </div>
          </div>

          <div className="intelligence-grid">
            {recruitmentSignals.map((signal) => (
              <article className="intelligence-card" key={signal.id}>
                <div className="intelligence-card-meta">
                  <span>{signal.channel}</span>
                  <time>{signal.dateLabel}</time>
                </div>
                <p>{signal.company}</p>
                <h3>{signal.title}</h3>
                <div>{signal.detail}</div>
                <button
                  onClick={() =>
                    window.open(
                      signal.url,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  type="button"
                >
                  查看原始来源 ↗
                </button>
              </article>
            ))}
          </div>

          <p className="intelligence-note">
            微信公众号没有稳定公开接口：已核验招聘号会显示名称，其余公司只提供站外检索词；请在微信内再次核对认证主体和发布时间。
          </p>
        </section>

        <section className="company-panel" aria-labelledby="company-title">
          <div className="company-panel-head">
            <div className="company-panel-title">
              <span className="section-number">03</span>
              <div>
                <p className="kicker">国内游戏厂商覆盖</p>
                <h2 id="company-title">100 家重点厂商，一张求职地图。</h2>
                <p>
                  综合行业影响力、活跃产品、细分赛道与招聘价值整理；这是求职覆盖清单，不等同于营收或财务排名。
                </p>
              </div>
            </div>
            <div className="company-coverage-metrics">
              <div>
                <strong>{companyCoverageStats.total}</strong>
                <span>覆盖厂商</span>
              </div>
              <div>
                <strong>{companyCoverageStats.official}</strong>
                <span>官网入口</span>
              </div>
              <div>
                <strong>{companyCoverageStats.internet}</strong>
                <span>互联网游戏业务</span>
              </div>
              <div>
                <strong>{coverage.matchedCompanies}</strong>
                <span>本次命中厂商</span>
              </div>
            </div>
          </div>

          <div className="company-toolbar">
            <div
              className="company-kind-tabs"
              role="tablist"
              aria-label="厂商类型"
            >
              {companyKinds.map((kind) => (
                <button
                  aria-selected={companyKind === kind}
                  className={companyKind === kind ? "active" : ""}
                  key={kind}
                  onClick={() => {
                    setCompanyKind(kind);
                    setCompanyLimit(24);
                  }}
                  role="tab"
                  type="button"
                >
                  {kind}
                </button>
              ))}
            </div>
            <label className="company-search">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="搜索厂商"
                onChange={(event) => {
                  setCompanyQuery(event.target.value);
                  setCompanyLimit(24);
                }}
                placeholder="搜索厂商或城市"
                value={companyQuery}
              />
            </label>
          </div>

          <div className="company-directory">
            {visibleCompanies.slice(0, companyLimit).map((company) => (
              <article className="company-directory-card" key={company.id}>
                <div className="company-directory-index">
                  C{String(company.order).padStart(2, "0")}
                </div>
                <div>
                  <h3>{company.name}</h3>
                  <p>
                    {company.kind} · {company.city}
                  </p>
                  <div className="company-channel-line">
                    {company.campusUrl && <span>校招专题</span>}
                    <span
                      className={
                        company.wechatMode === "verified"
                          ? "verified"
                          : company.wechatMode === "referenced"
                            ? "referenced"
                            : ""
                      }
                    >
                      {company.wechatMode === "verified"
                        ? "已核验招聘号"
                        : company.wechatMode === "referenced"
                          ? "招聘号线索"
                          : "公众号检索"}
                    </span>
                  </div>
                </div>
                <span
                  className={
                    company.careerMode === "official"
                      ? "company-mode official"
                      : "company-mode"
                  }
                >
                  {company.careerMode === "official"
                    ? "官网招聘"
                    : "平台检索"}
                </span>
                <div className="company-directory-actions">
                  <button
                    onClick={() => {
                      setActiveNav("岗位雷达");
                      setActiveFilter("精准匹配");
                      setSearch("");
                      if (isGitHubPages) {
                        window.open(
                          liveSiteUrl,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      } else {
                        void loadJobs(savedProfile, true, company.name);
                      }
                      document
                        .getElementById("results-title")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                    type="button"
                  >
                    {isGitHubPages ? "去实时版查询" : "实时查岗位"}
                  </button>
                  {company.campusUrl && (
                    <button
                      aria-label={`打开 ${company.name} 校招或实习专题`}
                      onClick={() =>
                        window.open(
                          company.campusUrl,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      type="button"
                    >
                      校招
                    </button>
                  )}
                  <button
                    aria-label={`检索 ${company.wechatName} 微信公众号文章`}
                    onClick={() => {
                      void navigator.clipboard?.writeText(
                        company.wechatName,
                      );
                      setNotice(
                        `已复制「${company.wechatName}」，请在微信内核对认证主体`,
                      );
                      window.setTimeout(() => setNotice(""), 3600);
                      window.open(
                        company.wechatSearchUrl,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    type="button"
                  >
                    公众号
                  </button>
                  <button
                    aria-label={`打开 ${company.name} 招聘入口`}
                    onClick={() =>
                      window.open(
                        company.careerUrl,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    type="button"
                  >
                    ↗
                  </button>
                </div>
              </article>
            ))}
          </div>

          {visibleCompanies.length > companyLimit && (
            <button
              className="company-more"
              onClick={() => setCompanyLimit((current) => current + 24)}
              type="button"
            >
              再显示 {Math.min(24, visibleCompanies.length - companyLimit)} 家
              厂商 ↓
            </button>
          )}
        </section>

        <div className="content-grid">
          <section className="results" aria-labelledby="results-title">
            <div className="results-head">
              <div>
                <span className="section-number">04</span>
                <div>
                  <p className="kicker">匹配结果</p>
                  <h2 id="results-title">{resultTitle}</h2>
                </div>
              </div>
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  aria-label="搜索职位、公司或技能"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜索职位、公司或技能"
                  value={search}
                />
              </label>
            </div>

            <div className={`data-status ${dataMode}`} role="status">
              <span aria-hidden="true">
                {dataMode === "live"
                  ? "●"
                  : dataMode === "loading"
                    ? "◌"
                    : "!"}
              </span>
              {dataMode === "live"
                ? `${companyFocus ? `聚焦 ${companyFocus} · ` : ""}实时数据 · ${onlineSourceCount} 个来源在线 · A 级 ${tierCounts.priority} 个、待确认 ${tierCounts.incomplete} 个、拓展 ${tierCounts.expanded} 个 · ${coverage.matchedJobs} 个命中 Top100 厂商`
                : isGitHubPages
                  ? "GitHub Pages 静态镜像 · 当前职位为明确标注的演示数据"
                : dataMode === "loading"
                  ? "正在连接实时来源并整理职位…"
                  : "实时来源暂不可用，当前职位均为演示数据"}
            </div>

            <div className="filter-row" role="tablist" aria-label="职位筛选">
              {filters.map((filter) => (
                <button
                  aria-selected={activeFilter === filter}
                  className={activeFilter === filter ? "active" : ""}
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  role="tab"
                  type="button"
                >
                  {filter}
                  <em>{filterCounts[filter]}</em>
                </button>
              ))}
              <button
                className="filter-control"
                onClick={() => {
                  setNotice(
                    "主方向和城市是硬边界；年限、薪资默认用于分层，开启严格模式后才会排除已知不符的职位",
                  );
                  window.setTimeout(() => setNotice(""), 3000);
                }}
                type="button"
              >
                ⓘ 分层说明
              </button>
            </div>

            <div className="job-list">
              {visibleJobs.length ? (
                visibleJobs.map((job) => (
                  <article className="job-card" key={job.id}>
                    <div
                      className="company-logo"
                      style={{ backgroundColor: job.color }}
                      aria-hidden="true"
                    >
                      {job.companyCode}
                    </div>
                    <div className="job-main">
                      <div className="job-title-line">
                        <div>
                          <h3>{job.title}</h3>
                          <p>
                            {job.company} <span>·</span> {job.meta}
                          </p>
                        </div>
                        <div className="salary">{job.salary}</div>
                      </div>
                      <div className="tag-row">
                        {job.coveredCompany && (
                          <span className="coverage-badge">
                            Top100 · {job.coveredCompany}
                          </span>
                        )}
                        {job.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                      <div className="dimension-row">
                        <span>
                          <strong>方向</strong>{" "}
                          {job.matchDimensions?.role || "相关方向"}
                        </span>
                        <span>
                          <strong>条件</strong>{" "}
                          {job.matchDimensions?.conditions || "需要进一步核对"}
                        </span>
                        <span>
                          <strong>数据</strong>{" "}
                          {job.matchDimensions?.data || "来源信息待确认"}
                        </span>
                      </div>
                      <div className="job-foot">
                        <div>
                          <span
                            className={
                              job.sourceType === "官网直招"
                                ? "source-badge official"
                                : "source-badge"
                            }
                          >
                            {job.sourceType === "官网直招" ? "◆" : "●"}{" "}
                            {job.source}
                          </span>
                          <small>{job.freshness}</small>
                        </div>
                        <div>
                          <button
                            aria-label={
                              savedJobs.includes(job.id)
                                ? `取消收藏 ${job.title}`
                                : `收藏 ${job.title}`
                            }
                            className={
                              savedJobs.includes(job.id)
                                ? "save-button saved"
                                : "save-button"
                            }
                            onClick={() => toggleSaved(job.id)}
                            type="button"
                          >
                            {savedJobs.includes(job.id) ? "★" : "☆"}
                          </button>
                          <button
                            className="detail-button"
                            onClick={() => setSelectedJob(job)}
                            type="button"
                          >
                            查看职位
                          </button>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`match-score ${getJobTier(job)}`}
                      aria-label={`${job.tierLabel || filters.find((filter) => filterTier[filter] === getJobTier(job))}，${getJobGrade(job)} 级`}
                    >
                      <strong>{getJobGrade(job)}</strong>
                      <span>{job.tierLabel || (
                        getJobTier(job) === "priority"
                          ? "精准匹配"
                          : getJobTier(job) === "incomplete"
                            ? "待确认"
                            : "拓展机会"
                      )}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <span>⌕</span>
                  <h3>
                    {companyFocus
                      ? `暂未找到 ${companyFocus} 的匹配职位`
                      : "没有找到符合条件的职位"}
                  </h3>
                  <p>
                    {companyFocus
                      ? "可以稍后重试，或使用厂商卡片右侧入口前往官网 / 平台继续搜索。"
                      : "换一个关键词，或回到全部职位继续浏览。"}
                  </p>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setSearch("");
                      setActiveFilter("全部结果");
                      if (companyFocus) {
                        void loadJobs(savedProfile, true);
                      }
                    }}
                    type="button"
                  >
                    {companyFocus ? "返回全部公司" : "清除筛选"}
                  </button>
                </div>
              )}
            </div>
          </section>

          <aside className="right-rail">
            <section className="rail-section">
              <div className="rail-head">
                <div>
                  <p className="kicker">扫描来源</p>
                  <h3>数据源状态</h3>
                </div>
                <span className="status-chip">
                  {dataMode === "live"
                    ? `${onlineSourceCount} 个来源实时`
                    : dataMode === "loading"
                      ? "正在连接"
                      : "演示回退"}
                </span>
              </div>
              <div className="source-list">
                {displaySources.map((source) => (
                  <div key={source.name}>
                    <i className={source.status} />
                    <span>
                      <strong>{source.name}</strong>
                      <small>{source.detail}</small>
                    </span>
                    <button
                      aria-label={`查看 ${source.name}`}
                      onClick={() =>
                        window.open(
                          source.url,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      type="button"
                    >
                      ↗
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="text-button"
                onClick={() => {
                  setNotice(
                    "已实时接入腾讯、网易、牛客、猎聘；BOSS、智联、前程无忧受平台验证限制",
                  );
                  window.setTimeout(() => setNotice(""), 3600);
                }}
                type="button"
              >
                查看当前来源说明 →
              </button>
            </section>

            <section className="rail-section">
              <div className="rail-head">
                <div>
                  <p className="kicker">目标厂商</p>
                  <h3>本次结果分布</h3>
                </div>
                <button
                  aria-label="添加目标厂商"
                  onClick={() => {
                    setNotice("目标厂商名单将在下一版支持自定义");
                    window.setTimeout(() => setNotice(""), 3000);
                  }}
                  type="button"
                >
                  ＋
                </button>
              </div>
              <div className="company-list">
                {companySummary.map(([company, count], index) => (
                  <button
                    key={company}
                    onClick={() => {
                      setActiveNav("岗位雷达");
                      setActiveFilter("全部结果");
                      setSearch(company);
                      document
                        .getElementById("results-title")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    type="button"
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{company}</strong>
                    <em>+{count}</em>
                  </button>
                ))}
              </div>
            </section>

            <section className="rail-note">
              <span>i</span>
              <div>
                <strong>
                  {dataMode === "live"
                    ? "已接入真实公开职位"
                    : isGitHubPages
                      ? "当前为公开静态镜像"
                    : dataMode === "loading"
                      ? "正在连接实时来源"
                      : "实时来源暂时不可用"}
                </strong>
                <p>
                  {dataMode === "live"
                    ? "腾讯、网易来自厂商官网；牛客、猎聘来自公开职位接口。BOSS、智联和前程无忧不会绕过验证码或读取登录态。"
                    : isGitHubPages
                      ? "静态镜像不访问招聘接口；请前往实时版查询最新职位。"
                    : "页面会明确保留演示标识，不把示例职位当作实时招聘信息。"}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>

      {notice && (
        <div className="toast" role="status">
          <span>✓</span> {notice}
        </div>
      )}

      {selectedJob && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setSelectedJob(null)}
          role="presentation"
        >
          <section
            aria-labelledby="job-modal-title"
            aria-modal="true"
            className="job-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="关闭职位详情"
              className="modal-close"
              onClick={() => setSelectedJob(null)}
              type="button"
            >
              ×
            </button>
            <div className="modal-kicker">
              <span
                className={
                  selectedJob.sourceType === "官网直招"
                    ? "source-badge official"
                    : "source-badge"
                }
              >
                {selectedJob.sourceType === "官网直招" ? "◆" : "●"}{" "}
                {selectedJob.source}
              </span>
              <span>{selectedJob.freshness}</span>
            </div>
            <div className="modal-company">
              <div
                className="company-logo"
                style={{ backgroundColor: selectedJob.color }}
              >
                {selectedJob.companyCode}
              </div>
              <span>{selectedJob.company}</span>
            </div>
            <h2 id="job-modal-title">{selectedJob.title}</h2>
            <p className="modal-meta">{selectedJob.meta}</p>
            <div className="modal-highlight">
              <div>
                <strong>{selectedJob.salary}</strong>
                <span>
                  {selectedJob.salary === "薪资面议"
                    ? "官网未公开具体薪资"
                    : "招聘方标注薪资"}
                </span>
              </div>
              <div>
                <strong>{getJobGrade(selectedJob)} 级</strong>
                <span>
                  {selectedJob.tierLabel ||
                    (getJobTier(selectedJob) === "priority"
                      ? "精准匹配"
                      : getJobTier(selectedJob) === "incomplete"
                        ? "信息待确认"
                        : "拓展机会")}
                </span>
              </div>
            </div>
            <div className="modal-section">
              <h3>判断维度</h3>
              <div className="modal-dimensions">
                <span>
                  <strong>方向</strong>
                  {selectedJob.matchDimensions?.role || "相关方向"}
                </span>
                <span>
                  <strong>条件</strong>
                  {selectedJob.matchDimensions?.conditions ||
                    "需要进一步核对"}
                </span>
                <span>
                  <strong>数据</strong>
                  {selectedJob.matchDimensions?.data || "来源信息待确认"}
                </span>
              </div>
            </div>
            <div className="modal-section">
              <h3>职位摘要</h3>
              <p>{selectedJob.summary}</p>
            </div>
            <div className="modal-section">
              <h3>为什么推荐</h3>
              <div className="modal-reasons">
                {selectedJob.reasons.map((reason) => (
                  <span key={reason}>✓ {reason}</span>
                ))}
              </div>
            </div>
            <div className="modal-disclaimer">
              {selectedJob.provider === "demo"
                ? "这是演示职位，不代表当前仍在招聘。请使用已接入的官网职位作为投递依据。"
                : `职位内容来自 ${selectedJob.source}，更新时间为 ${selectedJob.freshness}。投递条件与在招状态以原始页面为准。`}
            </div>
            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => toggleSaved(selectedJob.id)}
                type="button"
              >
                {savedJobs.includes(selectedJob.id) ? "★ 已收藏" : "☆ 收藏职位"}
              </button>
              <button
                className="primary-button"
                disabled={!selectedJob.originalUrl}
                onClick={() =>
                  selectedJob.originalUrl &&
                  window.open(
                    selectedJob.originalUrl,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                type="button"
              >
                {selectedJob.originalUrl
                  ? "前往原始职位 →"
                  : "演示职位无原始链接"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
