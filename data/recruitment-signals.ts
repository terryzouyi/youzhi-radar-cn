export type RecruitmentSignal = {
  id: string;
  company: string;
  title: string;
  detail: string;
  channel: "招聘官网" | "官方公众号" | "官网 + 公众号";
  dateLabel: string;
  url: string;
};

export const recruitmentSignals: RecruitmentSignal[] = [
  {
    id: "hypergryph-2027-campus",
    company: "鹰角网络",
    title: "2027 秋季校园招聘提前批已启动",
    detail:
      "官网招聘实况已发布提前批入口，适合应届生优先核对岗位、批次和投递节奏。",
    channel: "官方公众号",
    dateLabel: "2026-07-20",
    url: "https://mp.weixin.qq.com/s/dz_oOenwVsnpc2BPUbqQvw",
  },
  {
    id: "hypergryph-planning-program",
    company: "鹰角网络",
    title: "策划专项「引力波计划」开放",
    detail:
      "面向游戏策划方向的专项招募，官网标注为直通面试机会，建议尽早核对要求。",
    channel: "官方公众号",
    dateLabel: "2026-07-20",
    url: "https://mp.weixin.qq.com/s/_m1zTK4H4RUJ5DIkTmf3Ew",
  },
  {
    id: "mihoyo-year-round-internship",
    company: "米哈游",
    title: "实习生岗位全年可投",
    detail:
      "校园招聘官网说明实习生项目全年开放；具体岗位数量和投递限制以官网当日页面为准。",
    channel: "招聘官网",
    dateLabel: "持续更新",
    url: "https://join.mihoyo.com/",
  },
  {
    id: "lilith-three-recruitment-tracks",
    company: "莉莉丝游戏",
    title: "社招、校招、实习三类入口已统一",
    detail:
      "招聘官网同时提供社会招聘、校园招聘与实习招聘，并覆盖上海、北京、成都等工作地点。",
    channel: "招聘官网",
    dateLabel: "持续更新",
    url: "https://jobs.lilith.com/",
  },
  {
    id: "37games-wechat-progress",
    company: "三七互娱",
    title: "公众号可投递并查询校招进度",
    detail:
      "官网说明可在「三七互娱招聘」公众号进入移动投递入口、查询应聘进度并获取宣讲动态。",
    channel: "官网 + 公众号",
    dateLabel: "官方说明",
    url: "https://zhaopin.37.com/index.php?a=recruit&c=recruit&m=Home&recruit=3",
  },
  {
    id: "perfectworld-no-fee-warning",
    company: "完美世界游戏",
    title: "官方提醒：实习、内推和面试指导均不收费",
    detail:
      "校招官网明确提示未与第三方开展收费实习、收费内推或收费笔面试指导合作。",
    channel: "招聘官网",
    dateLabel: "安全提醒",
    url: "https://jobs.games.wanmei.com/school.html",
  },
];
