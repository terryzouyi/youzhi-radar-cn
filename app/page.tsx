"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Profile = {
  currentRole: string;
  years: string;
  targetRole: string;
  cities: string;
  salary: string;
  keywords: string;
};

type Job = {
  id: number;
  title: string;
  company: string;
  companyCode: string;
  color: string;
  meta: string;
  salary: string;
  source: string;
  sourceType: "官网直招" | "招聘平台";
  match: number;
  freshness: string;
  tags: string[];
  reasons: string[];
  summary: string;
};

const defaultProfile: Profile = {
  currentRole: "游戏产品经理",
  years: "3–5 年",
  targetRole: "游戏策划 / 产品经理",
  cities: "上海、杭州、深圳",
  salary: "25–35K",
  keywords: "系统策划，商业化，数值设计",
};

const jobs: Job[] = [
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
    summary:
      "负责全球化新品的核心系统、成长线与商业化体验设计，要求能独立完成从需求分析到版本验收的完整闭环。",
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
    summary:
      "面向策略竞技品类，推进玩法与版本规划，并结合用户研究和数据分析持续优化核心循环。",
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
    summary:
      "负责开放世界项目商业化内容的规划与落地，协同系统、美术和运营团队完成版本目标。",
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
    summary:
      "参与 SLG 长线系统与数值生态设计，建立验证框架并持续优化付费与社交体验。",
  },
  {
    id: 5,
    title: "中高级关卡策划",
    company: "叠纸游戏",
    companyCode: "PAP",
    color: "#b94c87",
    meta: "上海 · 3–5 年 · 本科",
    salary: "25–35K · 14薪",
    source: "牛客招聘",
    sourceType: "招聘平台",
    match: 82,
    freshness: "2 天前",
    tags: ["关卡设计", "UE5", "叙事体验"],
    reasons: ["城市命中", "薪资吻合", "方向部分重合"],
    summary:
      "负责关卡节奏、玩法空间和叙事体验设计，与程序、美术协作完成白盒到正式版本的落地。",
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
    summary:
      "围绕 UGC 创作与消费场景设计产品能力，推进创作者工具、内容分发和社区生态建设。",
  },
];

const sources = [
  { name: "厂商招聘官网", detail: "7 家已连接", status: "online" },
  { name: "BOSS 直聘", detail: "刚刚同步", status: "online" },
  { name: "牛客招聘", detail: "8 分钟前", status: "online" },
  { name: "猎聘", detail: "12 分钟前", status: "online" },
  { name: "拉勾招聘", detail: "等待同步", status: "waiting" },
];

const companies = [
  ["腾讯游戏", "14"],
  ["网易游戏", "11"],
  ["米哈游", "7"],
  ["莉莉丝游戏", "5"],
  ["叠纸游戏", "4"],
];

const navItems = [
  ["⌁", "岗位雷达"],
  ["◎", "我的方向"],
  ["☆", "收藏夹"],
  ["▦", "厂商库"],
];

const filters = ["全部职位", "高匹配", "官网直招", "近三天"];

export default function Home() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [savedProfile, setSavedProfile] = useState<Profile>(defaultProfile);
  const [activeNav, setActiveNav] = useState("岗位雷达");
  const [activeFilter, setActiveFilter] = useState("全部职位");
  const [savedJobs, setSavedJobs] = useState<number[]>([3]);
  const [search, setSearch] = useState("");
  const [scanning, setScanning] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const storedProfile = window.localStorage.getItem("youzhi-profile");
    const storedSaved = window.localStorage.getItem("youzhi-saved");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile) as Profile;
        setProfile(parsed);
        setSavedProfile(parsed);
      } catch {
        window.localStorage.removeItem("youzhi-profile");
      }
    }
    if (storedSaved) {
      try {
        setSavedJobs(JSON.parse(storedSaved) as number[]);
      } catch {
        window.localStorage.removeItem("youzhi-saved");
      }
    }
  }, []);

  const visibleJobs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return jobs.filter((job) => {
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
      const passesFilter =
        activeFilter === "全部职位" ||
        (activeFilter === "高匹配" && job.match >= 90) ||
        (activeFilter === "官网直招" && job.sourceType === "官网直招") ||
        (activeFilter === "近三天" && job.id !== 6);
      const passesSaved =
        activeNav !== "收藏夹" || savedJobs.includes(job.id);
      return passesSearch && passesFilter && passesSaved;
    });
  }, [activeFilter, activeNav, savedJobs, search]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setScanning(true);
    setNotice("");
    window.setTimeout(() => {
      setSavedProfile(profile);
      window.localStorage.setItem("youzhi-profile", JSON.stringify(profile));
      setScanning(false);
      setNotice("画像已保存，示例职位已按新方向重新排序");
      window.setTimeout(() => setNotice(""), 3600);
    }, 1300);
  };

  const toggleSaved = (id: number) => {
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
    if (label !== "收藏夹") setActiveFilter("全部职位");
    const target =
      label === "我的方向"
        ? document.getElementById("profile-title")
        : label === "厂商库"
          ? document.querySelector(".right-rail")
          : document.getElementById("results-title");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const rerunScan = () => {
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      setNotice("12 个来源扫描完成，发现 18 个新增示例职位");
      window.setTimeout(() => setNotice(""), 3600);
    }, 1500);
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
              {label === "厂商库" && <em>42</em>}
            </button>
          ))}
        </nav>

        <div className="source-mini">
          <div className="source-mini-head">
            <span>来源状态</span>
            <b>12 / 15</b>
          </div>
          <div className="signal-bars" aria-label="12 个数据源在线">
            {Array.from({ length: 15 }).map((_, index) => (
              <i className={index < 12 ? "on" : ""} key={index} />
            ))}
          </div>
          <small>下一轮自动扫描 · 43 分钟后</small>
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
              <i className="live-dot" /> 最近更新 10:32
            </span>
            <button
              className="secondary-button"
              disabled={scanning}
              onClick={rerunScan}
              type="button"
            >
              {scanning ? "扫描中…" : "↻ 重新扫描"}
            </button>
          </div>
        </header>

        <section className="profile-panel" aria-labelledby="profile-title">
          <div className="profile-intro">
            <span className="section-number">01</span>
            <div>
              <p className="kicker">你的目标画像</p>
              <h2 id="profile-title">先定义方向，再开始搜索。</h2>
              <p>
                我们会用这些信息合并同岗、过滤噪音，并给出每个职位的匹配理由。
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
              <span>目标方向</span>
              <input
                onChange={(event) =>
                  setProfile({ ...profile, targetRole: event.target.value })
                }
                value={profile.targetRole}
              />
            </label>
            <label>
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
            <label className="wide keyword-field">
              <span>能力关键词</span>
              <input
                onChange={(event) =>
                  setProfile({ ...profile, keywords: event.target.value })
                }
                value={profile.keywords}
              />
            </label>
            <button className="primary-button" disabled={scanning} type="submit">
              {scanning ? (
                <>
                  <i className="spinner" /> 正在扫描 12 个来源
                </>
              ) : (
                "保存并开始匹配 →"
              )}
            </button>
          </form>
        </section>

        <section className="metric-strip" aria-label="今日扫描摘要">
          <div>
            <strong>286</strong>
            <span>有效职位</span>
            <small>已合并 73 个重复项</small>
          </div>
          <div>
            <strong>47</strong>
            <span>高匹配</span>
            <small>匹配度 85% 以上</small>
          </div>
          <div>
            <strong>19</strong>
            <span>厂商直招</span>
            <small>优先于第三方来源</small>
          </div>
          <div>
            <strong>18</strong>
            <span>今日新增</span>
            <small>近 24 小时首次出现</small>
          </div>
          <div className="metric-profile">
            <span>当前方向</span>
            <strong>{savedProfile.targetRole}</strong>
            <small>
              {savedProfile.cities} · {savedProfile.salary}
            </small>
          </div>
        </section>

        <div className="content-grid">
          <section className="results" aria-labelledby="results-title">
            <div className="results-head">
              <div>
                <span className="section-number">02</span>
                <div>
                  <p className="kicker">匹配结果</p>
                  <h2 id="results-title">
                    {activeNav === "收藏夹" ? "收藏职位" : "值得优先看的职位"}
                  </h2>
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
                </button>
              ))}
              <button
                className="filter-control"
                onClick={() => {
                  setNotice("高级筛选会在真实数据源接入阶段开放");
                  window.setTimeout(() => setNotice(""), 3000);
                }}
                type="button"
              >
                ☷ 更多筛选
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
                        {job.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                      <div className="reason-row">
                        <strong>匹配理由</strong>
                        {job.reasons.map((reason) => (
                          <span key={reason}>✓ {reason}</span>
                        ))}
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
                    <div className="match-score">
                      <strong>{job.match}</strong>
                      <span>% 匹配</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <span>⌕</span>
                  <h3>没有找到符合条件的职位</h3>
                  <p>换一个关键词，或回到全部职位继续浏览。</p>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setSearch("");
                      setActiveFilter("全部职位");
                    }}
                    type="button"
                  >
                    清除筛选
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
                <span className="status-chip">演示连接</span>
              </div>
              <div className="source-list">
                {sources.map((source) => (
                  <div key={source.name}>
                    <i className={source.status} />
                    <span>
                      <strong>{source.name}</strong>
                      <small>{source.detail}</small>
                    </span>
                    <button
                      aria-label={`查看 ${source.name}`}
                      onClick={() => {
                        setNotice(`${source.name}：${source.detail}`);
                        window.setTimeout(() => setNotice(""), 2600);
                      }}
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
                  setNotice("正式版将在这里管理接口授权、抓取频率与来源优先级");
                  window.setTimeout(() => setNotice(""), 3600);
                }}
                type="button"
              >
                管理全部 15 个来源 →
              </button>
            </section>

            <section className="rail-section">
              <div className="rail-head">
                <div>
                  <p className="kicker">目标厂商</p>
                  <h3>今天有新机会</h3>
                </div>
                <button
                  aria-label="添加目标厂商"
                  onClick={() => {
                    setNotice("输入厂商名称的功能将在数据接入阶段开放");
                    window.setTimeout(() => setNotice(""), 3000);
                  }}
                  type="button"
                >
                  ＋
                </button>
              </div>
              <div className="company-list">
                {companies.map(([company, count], index) => (
                  <button
                    key={company}
                    onClick={() => {
                      setActiveNav("岗位雷达");
                      setActiveFilter("全部职位");
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
                <strong>这是可操作的产品原型</strong>
                <p>
                  当前职位为示例数据。正式版将通过合规接口、公开招聘页与厂商官网更新，并保留原始链接与抓取时间。
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
              <span className="source-badge official">
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
                <span>招聘方标注薪资</span>
              </div>
              <div>
                <strong>{selectedJob.match}%</strong>
                <span>与你的方向匹配</span>
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
              正式版会在这里显示原始职位链接、发布时间、重复来源和更新记录。
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
                onClick={() => {
                  setNotice("已加入投递计划（原型）");
                  setSelectedJob(null);
                  window.setTimeout(() => setNotice(""), 3000);
                }}
                type="button"
              >
                加入投递计划 →
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
