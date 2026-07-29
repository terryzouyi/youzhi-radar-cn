export type CompanyKind =
  | "头部综合"
  | "核心厂商"
  | "成长出海"
  | "独立新锐"
  | "互联网游戏业务";

export type CompanyProfile = {
  id: string;
  order: number;
  name: string;
  aliases: string[];
  kind: CompanyKind;
  city: string;
  careerUrl: string;
  careerMode: "official" | "platform";
  campusUrl?: string;
  wechatName: string;
  wechatMode: "verified" | "referenced" | "search";
  wechatSearchUrl: string;
};

type CompanySeed = [
  id: string,
  name: string,
  kind: CompanyKind,
  city: string,
  aliases?: string[],
];

const seeds: CompanySeed[] = [
  ["tencent", "腾讯游戏", "头部综合", "深圳", ["腾讯", "IEG", "天美", "光子"]],
  ["netease", "网易游戏", "头部综合", "广州 / 杭州", ["网易", "雷火"]],
  ["mihoyo", "米哈游", "头部综合", "上海", ["miHoYo"]],
  ["37games", "三七互娱", "头部综合", "广州", ["37游戏", "三七游戏"]],
  ["lilith", "莉莉丝游戏", "头部综合", "上海", ["莉莉丝"]],
  ["papergames", "叠纸游戏", "头部综合", "上海", ["叠纸"]],
  ["century-huatong", "世纪华通", "头部综合", "上海", ["世纪华通集团"]],
  ["youzu", "游族网络", "头部综合", "上海", ["游族游戏"]],
  ["kuro", "库洛游戏", "头部综合", "广州", ["库洛科技"]],
  ["lingxi", "灵犀互娱", "头部综合", "广州", ["阿里灵犀", "灵犀游戏"]],
  ["moonton", "沐瞳科技", "头部综合", "上海", ["沐瞳游戏", "MOONTON"]],
  ["hypergryph", "鹰角网络", "头部综合", "上海", ["鹰角游戏"]],
  ["boke", "波克城市", "核心厂商", "上海", ["波克科技", "波克游戏"]],
  ["bluepoch", "深蓝互动", "核心厂商", "广州", ["深蓝网络"]],
  ["shiyue", "诗悦网络", "核心厂商", "广州", ["诗悦游戏"]],
  ["perfectworld", "完美世界游戏", "头部综合", "北京", ["完美世界"]],
  ["kingnet", "恺英网络", "核心厂商", "上海", ["恺英游戏"]],
  ["xd", "心动网络", "核心厂商", "上海", ["心动游戏", "TapTap"]],
  ["zhongxu", "中旭未来（贪玩游戏）", "核心厂商", "广州", ["中旭未来", "贪玩游戏"]],
  ["sunborn", "散爆网络", "核心厂商", "上海", ["散爆游戏"]],
  ["gbits", "吉比特", "核心厂商", "厦门", ["厦门吉比特"]],
  ["leiting", "雷霆游戏", "核心厂商", "厦门", ["雷霆网络"]],
  ["shengqu", "盛趣游戏", "核心厂商", "上海", ["盛大游戏"]],
  ["century-games", "点点互动", "核心厂商", "北京", ["点点游戏", "Century Games"]],
  ["giant", "巨人网络", "核心厂商", "上海", ["巨人游戏"]],
  ["kingsoft-game", "金山世游", "核心厂商", "北京", ["金山游戏"]],
  ["seasun", "西山居", "核心厂商", "珠海 / 成都", ["金山西山居"]],
  ["cmge", "中手游", "核心厂商", "深圳", ["CMGE"]],
  ["archosaur", "祖龙娱乐", "核心厂商", "北京", ["祖龙游戏"]],
  ["idreamsky", "创梦天地", "核心厂商", "深圳", ["乐逗游戏"]],
  ["hero", "英雄游戏", "核心厂商", "北京", ["英雄互娱"]],
  ["ourpalm", "掌趣科技", "核心厂商", "北京", ["掌趣游戏"]],
  ["zlong", "紫龙游戏", "核心厂商", "北京", ["紫龙互娱"]],
  ["duoyi", "多益网络", "核心厂商", "广州", ["多益游戏"]],
  ["happyelements", "乐元素", "核心厂商", "北京", ["Happy Elements"]],
  ["friendtimes", "友谊时光", "核心厂商", "苏州", ["好玩友"]],
  ["dianhun", "电魂网络", "核心厂商", "杭州", ["电魂游戏"]],
  ["yoka", "游卡网络", "核心厂商", "杭州", ["游卡桌游"]],
  ["jj", "竞技世界", "核心厂商", "北京", ["JJ比赛"]],
  ["netdragon", "网龙", "核心厂商", "福州", ["网龙网络"]],
  ["kunlun", "昆仑万维", "成长出海", "北京", ["昆仑游戏"]],
  ["q1", "冰川网络", "核心厂商", "深圳", ["冰川游戏"]],
  ["zqgame", "中青宝", "核心厂商", "深圳", ["中青宝网"]],
  ["feiyu", "飞鱼科技", "成长出海", "厦门", ["飞鱼游戏"]],
  ["kaisa", "凯撒文化", "成长出海", "深圳", ["凯撒游戏"]],
  ["7road", "第七大道", "核心厂商", "深圳", ["第七大道游戏"]],
  ["tiancity", "世纪天成", "核心厂商", "上海", ["天成游戏"]],
  ["pixelsoft", "像素软件", "独立新锐", "北京", ["像素游戏"]],
  ["yongshi", "勇仕网络", "成长出海", "厦门", ["勇仕游戏"]],
  ["pandada", "炎魂网络", "成长出海", "杭州", ["炎魂游戏"]],
  ["dianchu", "点触科技", "成长出海", "厦门", ["点触游戏"]],
  ["ewan", "益世界", "成长出海", "广州", ["益玩游戏"]],
  ["qcplay", "青瓷游戏", "成长出海", "厦门", ["青瓷数码"]],
  ["tuyoo", "途游游戏", "成长出海", "北京", ["在线途游"]],
  ["longtugame", "龙图游戏", "成长出海", "北京", ["龙图网络"]],
  ["linekong", "蓝港互动", "成长出海", "北京", ["蓝港游戏"]],
  ["snail", "蜗牛游戏", "核心厂商", "苏州", ["蜗牛数字"]],
  ["alpha-game", "奥飞游戏", "成长出海", "广州", ["奥飞娱乐"]],
  ["rastar", "星辉娱乐", "成长出海", "广州", ["星辉游戏"]],
  ["baotong", "宝通科技", "成长出海", "无锡", ["易幻网络"]],
  ["shengtian", "盛天网络", "成长出海", "武汉", ["盛天游戏"]],
  ["bianfeng", "浙数文化（边锋网络）", "核心厂商", "杭州", ["浙数文化", "边锋网络", "边锋游戏"]],
  ["yaoji", "姚记科技", "成长出海", "上海", ["姚记游戏"]],
  ["elex", "智明星通", "成长出海", "北京", ["ELEX"]],
  ["gaea", "盖娅互娱", "成长出海", "北京", ["盖娅游戏"]],
  ["eyougame", "易娱网络", "成长出海", "广州", ["易娱游戏"]],
  ["yostar", "悠星网络", "成长出海", "上海", ["悠星游戏", "Yostar"]],
  ["dragonest", "龙渊网络", "成长出海", "成都", ["龙渊游戏"]],
  ["coconut-island", "椰岛游戏", "独立新锐", "上海", ["椰岛工作室"]],
  ["pathea", "帕斯亚科技", "独立新锐", "重庆", ["帕斯亚游戏"]],
  ["microfun", "柠檬微趣", "成长出海", "北京", ["Microfun"]],
  ["hortor", "豪腾嘉科", "成长出海", "北京", ["豪腾游戏", "Hortor"]],
  ["dreamgame", "大梦龙途", "成长出海", "北京", ["龙途游戏"]],
  ["habby", "海彼网络", "成长出海", "上海", ["海彼游戏", "Habby"]],
  ["mechanist", "麦吉太文", "成长出海", "厦门", ["麦吉太文游戏"]],
  ["funplus", "FunPlus 趣加", "成长出海", "北京 / 上海", ["FunPlus", "趣加游戏"]],
  ["manjuu", "蛮啾网络", "独立新锐", "上海", ["蛮啾游戏"]],
  ["game-science", "游戏科学", "独立新锐", "深圳 / 杭州", ["黑神话", "Game Science"]],
  ["s-game", "灵游坊", "独立新锐", "北京", ["S-GAME"]],
  ["chillyroom", "凉屋游戏", "独立新锐", "深圳", ["凉屋科技"]],
  ["nekcom", "铃空游戏", "独立新锐", "武汉", ["铃空网络", "NEKCOM"]],
  ["4399", "4399 游戏", "核心厂商", "广州", ["四三九九", "4399游戏"]],
  ["sky-moons", "天马时空", "成长出海", "北京", ["天马时空游戏"]],
  ["bytedance-game", "字节跳动游戏", "互联网游戏业务", "北京 / 上海", ["朝夕光年", "Nuverse"]],
  ["bilibili-game", "哔哩哔哩游戏", "互联网游戏业务", "上海", ["B站游戏", "bilibili游戏"]],
  ["kuaishou-game", "快手游戏", "互联网游戏业务", "北京 / 杭州", ["快手互娱", "弹指宇宙"]],
  ["changyou", "搜狐畅游", "互联网游戏业务", "北京", ["畅游游戏", "畅游"]],
  ["baidu-game", "百度游戏", "互联网游戏业务", "北京", ["百度多酷"]],
  ["xiaomi-game", "小米互娱", "互联网游戏业务", "北京", ["小米游戏"]],
  ["huawei-game", "华为游戏", "互联网游戏业务", "深圳", ["华为游戏中心"]],
  ["oppo-game", "OPPO 游戏", "互联网游戏业务", "深圳", ["OPPO游戏中心"]],
  ["vivo-game", "vivo 游戏", "互联网游戏业务", "东莞 / 深圳", ["vivo游戏中心"]],
  ["360-game", "360 游戏", "互联网游戏业务", "北京", ["三六零游戏"]],
  ["iqiyi-game", "爱奇艺游戏", "互联网游戏业务", "北京", ["爱奇艺游戏中心"]],
  ["huya-game", "虎牙游戏", "互联网游戏业务", "广州", ["虎牙直播"]],
  ["douyu-game", "斗鱼游戏", "互联网游戏业务", "武汉", ["斗鱼直播"]],
  ["tianxiang", "天象互动", "成长出海", "成都", ["天象游戏"]],
  ["digitalsky", "数字天空", "成长出海", "成都", ["成都数字天空"]],
  ["fingerfun", "指尖悦动", "成长出海", "广州", ["指尖游戏"]],
  ["ourgame", "掌游天下", "成长出海", "北京", ["掌游游戏"]],
];

const officialCareerUrls: Record<string, string> = {
  tencent: "https://hr.tencent.com/zh-cn/",
  netease: "https://hr.163.com/job-list.html",
  mihoyo: "https://jobs.mihoyo.com/position",
  "37games": "https://zhaopin.37.com/",
  lilith: "https://jobs.lilith.com/",
  papergames: "https://career.papegames.com/",
  kuro: "https://app.mokahr.com/social-recruitment/kuro/46886",
  moonton: "https://job.moonton.com/",
  hypergryph: "https://jobs.hypergryph.com/",
  perfectworld: "https://jobs.games.wanmei.com/",
  xd: "https://www.xd.com/cn/career/",
  gbits: "https://www.g-bits.com/recruit",
  shengqu: "https://hr.shengqugames.com/",
  giant: "https://zhaopin.ztgame.com/",
  seasun: "https://app.mokahr.com/social-recruitment/xishanju/",
  cmge: "https://www.cmge.com/join.html",
  hero: "https://www.hero.com/join.html",
  duoyi: "https://hr.duoyi.com/",
  happyelements: "https://www.happyelements.com/jobs",
  yostar: "https://www.yostar.cn/#/join",
  "game-science": "https://www.gamesci.com.cn/join/",
  "bytedance-game": "https://jobs.bytedance.com/experienced/position",
  "bilibili-game": "https://jobs.bilibili.com/",
  "kuaishou-game": "https://zhaopin.kuaishou.cn/",
  "xiaomi-game": "https://hr.xiaomi.com/",
  "huawei-game": "https://career.huawei.com/",
  "baidu-game": "https://talent.baidu.com/jobs/social-list",
  "360-game": "https://hr.360.cn/",
};

const campusCareerUrls: Record<string, string> = {
  tencent: "https://join.qq.com/",
  netease: "https://campus.163.com/",
  mihoyo: "https://join.mihoyo.com/",
  "37games":
    "https://zhaopin.37.com/index.php?a=index&c=recruit&m=Home",
  lilith: "https://jobs.lilith.com/",
  papergames: "https://career.papegames.com/campus",
  hypergryph: "https://career.hypergryph.com/",
  perfectworld: "https://jobs.games.wanmei.com/school.html",
  "bytedance-game":
    "https://jobs.bytedance.com/campus/page-6272Gc",
};

const wechatRecruitmentAccounts: Record<
  string,
  {
    name: string;
    mode: "verified" | "referenced";
  }
> = {
  tencent: { name: "腾讯招聘", mode: "verified" },
  netease: { name: "网易游戏综合招聘", mode: "referenced" },
  mihoyo: { name: "米哈游招聘", mode: "verified" },
  "37games": { name: "三七互娱招聘", mode: "verified" },
  papergames: { name: "叠纸游戏招聘", mode: "referenced" },
  kuro: { name: "库洛游戏招聘", mode: "referenced" },
  hypergryph: { name: "鹰角网络招聘", mode: "verified" },
  perfectworld: { name: "完美世界招聘", mode: "verified" },
  "bytedance-game": { name: "字节跳动招聘", mode: "verified" },
};

function platformSearchUrl(name: string) {
  return `https://www.nowcoder.com/jobs/fulltime/center?query=${encodeURIComponent(name)}`;
}

function wechatSearchUrl(query: string) {
  return `https://weixin.sogou.com/weixin?type=2&query=${encodeURIComponent(query)}`;
}

export const companyProfiles: CompanyProfile[] = seeds.map(
  ([id, name, kind, city, aliases = []], index) => {
    const wechat = wechatRecruitmentAccounts[id];
    const wechatName = wechat?.name || `${name} 招聘`;
    return {
      id,
      order: index + 1,
      name,
      aliases: [name, ...aliases],
      kind,
      city,
      careerUrl: officialCareerUrls[id] || platformSearchUrl(name),
      careerMode: officialCareerUrls[id] ? "official" : "platform",
      campusUrl: campusCareerUrls[id],
      wechatName,
      wechatMode: wechat?.mode || "search",
      wechatSearchUrl: wechatSearchUrl(wechatName),
    };
  },
);

function normalizeCompanyName(value: string) {
  return value
    .toLowerCase()
    .replaceAll(/\s+/g, "")
    .replaceAll(/[（）()·\-—]/g, "");
}

export function findCoveredCompany(value: string) {
  const normalized = normalizeCompanyName(value);
  if (normalized.length < 2) return undefined;
  return companyProfiles.find((company) =>
    company.aliases.some((alias) => {
      const normalizedAlias = normalizeCompanyName(alias);
      return (
        normalized.includes(normalizedAlias) ||
        normalizedAlias.includes(normalized)
      );
    }),
  );
}

export const companyCoverageStats = {
  total: companyProfiles.length,
  official: companyProfiles.filter(
    (company) => company.careerMode === "official",
  ).length,
  internet: companyProfiles.filter(
    (company) => company.kind === "互联网游戏业务",
  ).length,
  campus: companyProfiles.filter((company) => company.campusUrl).length,
  wechatKnown: companyProfiles.filter(
    (company) => company.wechatMode !== "search",
  ).length,
  wechatVerified: companyProfiles.filter(
    (company) => company.wechatMode === "verified",
  ).length,
};
