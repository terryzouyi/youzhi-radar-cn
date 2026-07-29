export type SpecialtyGroup = {
  id: string;
  label: string;
  options: string[];
};

export type RoleTrack = {
  id: string;
  family: string;
  label: string;
  query: string;
  matchTerms: string[];
  specialtyGroups: SpecialtyGroup[];
  relatedRoleIds: string[];
};

type RoleDefinition = Omit<RoleTrack, "specialtyGroups"> & {
  focus: string[];
  skills?: string[];
};

const defineRole = ({
  focus,
  skills = [],
  ...role
}: RoleDefinition): RoleTrack => ({
  ...role,
  specialtyGroups: [
    { id: "focus", label: "岗位分工", options: focus },
    ...(skills.length
      ? [{ id: "skills", label: "方法 / 技术栈", options: skills }]
      : []),
  ],
});

export const roleFamilies = [
  "游戏策划",
  "产品与项目",
  "技术研发",
  "美术与音频",
  "运营与发行",
  "市场与商务",
  "质量与洞察",
] as const;

const sharedSpecialtyGroups: SpecialtyGroup[] = [
  {
    id: "genre",
    label: "游戏品类",
    options: [
      "MMORPG",
      "SLG",
      "FPS / TPS",
      "MOBA",
      "二次元 / 卡牌",
      "开放世界",
      "动作 / ARPG",
      "休闲 / 社交",
      "模拟经营",
      "棋牌",
    ],
  },
  {
    id: "platform",
    label: "平台与项目经验",
    options: [
      "移动游戏",
      "PC游戏",
      "主机游戏",
      "小游戏",
      "跨端项目",
      "全球化 / 出海",
      "长线运营",
      "新项目 / 从0到1",
    ],
  },
];

export const roleTracks: RoleTrack[] = [
  defineRole({
    id: "system-design",
    family: "游戏策划",
    label: "系统策划",
    query: "系统策划",
    matchTerms: ["系统策划", "玩法策划", "功能策划", "资源策划"],
    focus: [
      "核心系统",
      "成长养成",
      "经济循环",
      "商业化系统",
      "社交系统",
      "活动系统",
    ],
    skills: ["需求文档", "原型设计", "配置表", "数据验证", "跨部门推进"],
    relatedRoleIds: ["numerical-design", "combat-design"],
  }),
  defineRole({
    id: "numerical-design",
    family: "游戏策划",
    label: "数值策划",
    query: "数值策划",
    matchTerms: ["数值策划", "数值设计", "经济数值"],
    focus: ["战斗数值", "经济数值", "养成数值", "掉落概率", "商业化数值"],
    skills: ["Excel建模", "概率统计", "数值模拟", "数据分析", "平衡性验证"],
    relatedRoleIds: ["system-design", "game-data"],
  }),
  defineRole({
    id: "combat-design",
    family: "游戏策划",
    label: "战斗策划",
    query: "战斗策划",
    matchTerms: ["战斗策划", "技能策划", "职业策划", "英雄设计"],
    focus: ["角色技能", "职业体系", "Boss设计", "战斗机制", "操作手感"],
    skills: ["战斗原型", "技能配置", "行为树", "动作协同", "平衡性测试"],
    relatedRoleIds: ["system-design", "level-design"],
  }),
  defineRole({
    id: "level-design",
    family: "游戏策划",
    label: "关卡策划",
    query: "关卡策划",
    matchTerms: ["关卡策划", "关卡设计", "关卡TD", "副本策划"],
    focus: ["关卡流程", "副本设计", "任务设计", "开放世界", "演出表现"],
    skills: ["白盒搭建", "Unity", "Unreal Engine", "关卡脚本", "节奏验证"],
    relatedRoleIds: ["combat-design", "narrative-design"],
  }),
  defineRole({
    id: "narrative-design",
    family: "游戏策划",
    label: "叙事 / 文案策划",
    query: "文案策划",
    matchTerms: ["文案策划", "叙事策划", "剧情策划", "世界观策划", "游戏编剧"],
    focus: ["世界观", "主线剧情", "角色塑造", "任务文本", "剧情演出"],
    skills: ["剧本写作", "分支叙事", "叙事工具", "文本配置", "IP改编"],
    relatedRoleIds: ["level-design", "content-marketing"],
  }),
  defineRole({
    id: "technical-design",
    family: "游戏策划",
    label: "技术策划",
    query: "技术策划",
    matchTerms: ["技术策划", "工具策划", "AI策划", "游戏工具策划"],
    focus: ["编辑器工具", "流程自动化", "AI玩法", "配置管线", "技术预研"],
    skills: ["脚本编程", "Unity", "Unreal Engine", "数据管线", "Prompt工程"],
    relatedRoleIds: ["system-design", "game-ai"],
  }),

  defineRole({
    id: "game-product",
    family: "产品与项目",
    label: "游戏产品经理",
    query: "游戏产品经理",
    matchTerms: ["游戏产品经理", "游戏产品策划", "游戏产品负责人", "产品负责人"],
    focus: ["产品规划", "用户需求", "版本路线图", "商业化", "平台产品"],
    skills: ["用户研究", "竞品分析", "数据分析", "需求管理", "跨团队协作"],
    relatedRoleIds: ["game-producer", "game-operations"],
  }),
  defineRole({
    id: "game-producer",
    family: "产品与项目",
    label: "游戏制作人 / 主策划",
    query: "游戏制作人",
    matchTerms: ["游戏制作人", "制作人", "主策划", "产品负责人"],
    focus: ["产品愿景", "核心玩法", "团队搭建", "研发管理", "品质把控"],
    skills: ["立项评审", "资源配置", "风险管理", "团队管理", "发行协同"],
    relatedRoleIds: ["game-product", "project-management"],
  }),
  defineRole({
    id: "project-management",
    family: "产品与项目",
    label: "游戏项目管理",
    query: "游戏项目管理",
    matchTerms: ["游戏项目管理", "游戏项目经理", "游戏项目管理负责人", "游戏制片"],
    focus: ["研发计划", "版本管理", "外包管理", "资源协调", "项目PMO"],
    skills: ["敏捷开发", "里程碑管理", "风险管理", "Jira", "跨团队推进"],
    relatedRoleIds: ["game-producer", "game-product"],
  }),

  defineRole({
    id: "client-development",
    family: "技术研发",
    label: "游戏客户端开发",
    query: "游戏客户端开发",
    matchTerms: ["游戏客户端开发", "客户端开发", "Unity客户端", "UE客户端"],
    focus: ["玩法系统", "UI系统", "战斗开发", "网络同步", "性能优化"],
    skills: ["C++", "C#", "Unity", "Unreal Engine", "Lua"],
    relatedRoleIds: ["engine-graphics", "server-development"],
  }),
  defineRole({
    id: "server-development",
    family: "技术研发",
    label: "游戏服务端开发",
    query: "游戏服务端开发",
    matchTerms: ["游戏服务端开发", "游戏服务器开发", "游戏后台开发", "游戏后端开发"],
    focus: ["业务服务", "分布式架构", "实时对战", "数据存储", "稳定性"],
    skills: ["C++", "Go", "Java", "Python", "Redis / MySQL"],
    relatedRoleIds: ["client-development", "game-devops"],
  }),
  defineRole({
    id: "engine-graphics",
    family: "技术研发",
    label: "游戏引擎 / 图形开发",
    query: "游戏引擎开发",
    matchTerms: ["游戏引擎开发", "引擎开发", "图形开发", "渲染开发", "物理引擎"],
    focus: ["渲染管线", "引擎架构", "物理模拟", "工具链", "跨平台"],
    skills: ["C++", "图形学", "DirectX / Vulkan", "Unreal Engine", "性能分析"],
    relatedRoleIds: ["client-development", "technical-art"],
  }),
  defineRole({
    id: "game-ai",
    family: "技术研发",
    label: "游戏AI / 算法",
    query: "游戏AI",
    matchTerms: ["游戏AI", "AI Agent开发", "智能NPC", "游戏算法"],
    focus: ["智能NPC", "行为决策", "生成式AI", "强化学习", "内容审核"],
    skills: ["Python", "C++", "机器学习", "大模型", "Agent框架"],
    relatedRoleIds: ["engine-graphics", "technical-design"],
  }),
  defineRole({
    id: "technical-art",
    family: "技术研发",
    label: "技术美术（TA）",
    query: "技术美术",
    matchTerms: ["技术美术", "TA工程师", "Technical Artist"],
    focus: ["渲染效果", "美术管线", "性能优化", "工具开发", "Shader"],
    skills: ["Unreal Engine", "Unity", "HLSL / GLSL", "Python", "DCC工具"],
    relatedRoleIds: ["engine-graphics", "game-vfx"],
  }),
  defineRole({
    id: "game-devops",
    family: "技术研发",
    label: "游戏运维 / SRE",
    query: "游戏运维",
    matchTerms: ["游戏运维", "游戏SRE", "游戏DevOps", "服务器运维"],
    focus: ["发布运维", "在线稳定性", "监控告警", "容量规划", "安全响应"],
    skills: ["Linux", "Kubernetes", "云服务", "CI / CD", "可观测性"],
    relatedRoleIds: ["server-development", "test-development"],
  }),

  defineRole({
    id: "concept-art",
    family: "美术与音频",
    label: "原画 / 概念设计",
    query: "游戏原画",
    matchTerms: ["游戏原画", "概念设计师", "角色原画", "场景原画"],
    focus: ["角色概念", "场景概念", "世界观视觉", "道具设计", "宣传插画"],
    skills: ["造型设计", "色彩构成", "氛围图", "Photoshop", "AIGC辅助"],
    relatedRoleIds: ["character-3d", "environment-3d"],
  }),
  defineRole({
    id: "character-3d",
    family: "美术与音频",
    label: "3D角色美术",
    query: "3D角色",
    matchTerms: ["3D角色", "角色模型", "角色建模", "角色制作"],
    focus: ["角色建模", "数字雕刻", "材质贴图", "毛发制作", "角色整合"],
    skills: ["Maya", "ZBrush", "Substance", "Marvelous Designer", "引擎整合"],
    relatedRoleIds: ["concept-art", "animation-design"],
  }),
  defineRole({
    id: "environment-3d",
    family: "美术与音频",
    label: "3D场景美术",
    query: "3D场景",
    matchTerms: ["3D场景", "场景模型", "场景建模", "场景编辑", "地编设计"],
    focus: ["场景建模", "地形编辑", "植被生态", "灯光氛围", "关卡美术"],
    skills: ["Maya / 3ds Max", "Substance", "Unreal Engine", "Houdini", "模块化场景"],
    relatedRoleIds: ["concept-art", "technical-art"],
  }),
  defineRole({
    id: "animation-design",
    family: "美术与音频",
    label: "动画 / 动作设计",
    query: "游戏动作设计",
    matchTerms: ["游戏动作设计", "动作设计师", "角色动画", "过场动画"],
    focus: ["角色动作", "战斗动画", "表情动画", "过场动画", "动作捕捉"],
    skills: ["Maya", "MotionBuilder", "动画原理", "镜头语言", "引擎状态机"],
    relatedRoleIds: ["character-3d", "game-vfx"],
  }),
  defineRole({
    id: "game-vfx",
    family: "美术与音频",
    label: "游戏特效",
    query: "游戏特效",
    matchTerms: ["游戏特效", "特效设计师", "游戏动效"],
    focus: ["技能特效", "环境特效", "UI动效", "过场特效", "风格化特效"],
    skills: ["Niagara", "Unity VFX", "Houdini", "Shader", "序列帧"],
    relatedRoleIds: ["animation-design", "technical-art"],
  }),
  defineRole({
    id: "game-ui-ux",
    family: "美术与音频",
    label: "游戏UI / UX设计",
    query: "游戏UI设计",
    matchTerms: ["游戏UI", "UI视觉设计", "GUI设计", "游戏体验设计"],
    focus: ["界面视觉", "交互设计", "HUD", "信息架构", "界面动效"],
    skills: ["Figma", "动效原型", "设计系统", "可用性测试", "引擎还原"],
    relatedRoleIds: ["ux-research", "game-vfx"],
  }),
  defineRole({
    id: "game-audio",
    family: "美术与音频",
    label: "游戏音频设计",
    query: "游戏音频",
    matchTerms: ["游戏音频", "音频策划", "音效设计", "游戏音乐", "技术音频"],
    focus: ["音效设计", "互动音乐", "语音制作", "技术音频", "音频导演"],
    skills: ["Wwise", "FMOD", "DAW", "声音采集", "引擎集成"],
    relatedRoleIds: ["animation-design", "technical-art"],
  }),

  defineRole({
    id: "game-operations",
    family: "运营与发行",
    label: "游戏运营",
    query: "游戏运营",
    matchTerms: ["游戏运营", "产品运营", "运营策划"],
    focus: ["产品运营", "版本规划", "活动运营", "商业化运营", "内容生态"],
    skills: ["运营方案", "数据复盘", "用户分层", "跨团队推进", "风险预案"],
    relatedRoleIds: ["live-operations", "community-operations"],
  }),
  defineRole({
    id: "community-operations",
    family: "运营与发行",
    label: "用户 / 社区运营",
    query: "游戏社区运营",
    matchTerms: ["游戏社区运营", "用户运营", "社区运营", "私域运营", "社媒运营"],
    focus: ["核心用户", "社区内容", "创作者生态", "客服舆情", "私域运营"],
    skills: ["用户分层", "社群运营", "内容策划", "舆情监控", "用户访谈"],
    relatedRoleIds: ["game-operations", "content-marketing"],
  }),
  defineRole({
    id: "live-operations",
    family: "运营与发行",
    label: "版本 / 活动运营",
    query: "游戏版本运营",
    matchTerms: ["版本运营", "活动运营", "活跃运营", "商业化运营"],
    focus: ["版本节奏", "线上活动", "付费活动", "召回促活", "生命周期"],
    skills: ["活动配置", "指标拆解", "A/B测试", "数据复盘", "项目推进"],
    relatedRoleIds: ["game-operations", "game-data"],
  }),
  defineRole({
    id: "overseas-operations",
    family: "运营与发行",
    label: "海外运营 / 本地化",
    query: "海外游戏运营",
    matchTerms: ["海外游戏运营", "海外运营", "本地化运营", "全球发行运营"],
    focus: ["区域运营", "本地化", "海外社媒", "海外社区", "文化适配"],
    skills: ["英语", "小语种", "区域研究", "本地化管理", "跨时区协作"],
    relatedRoleIds: ["game-publishing", "community-operations"],
  }),
  defineRole({
    id: "game-publishing",
    family: "运营与发行",
    label: "游戏发行",
    query: "游戏发行",
    matchTerms: ["游戏发行", "发行运营", "渠道运营", "平台运营"],
    focus: ["发行策略", "渠道发行", "平台合作", "上线管理", "区域发行"],
    skills: ["发行计划", "渠道关系", "上线流程", "市场协同", "数据复盘"],
    relatedRoleIds: ["game-operations", "game-marketing"],
  }),
  defineRole({
    id: "esports-operations",
    family: "运营与发行",
    label: "电竞 / 赛事运营",
    query: "电竞运营",
    matchTerms: ["电竞运营", "赛事运营", "电竞赛事", "赛事策划"],
    focus: ["赛事策划", "联盟运营", "俱乐部合作", "内容直播", "线下执行"],
    skills: ["赛制设计", "项目执行", "版权合作", "直播协同", "供应商管理"],
    relatedRoleIds: ["game-operations", "game-marketing"],
  }),

  defineRole({
    id: "game-marketing",
    family: "市场与商务",
    label: "游戏市场营销",
    query: "游戏市场营销",
    matchTerms: ["游戏市场营销", "游戏营销策划", "整合营销", "游戏品牌经理"],
    focus: ["上市营销", "品牌策略", "整合营销", "IP营销", "区域市场"],
    skills: ["传播策略", "媒介规划", "Campaign", "市场研究", "预算管理"],
    relatedRoleIds: ["content-marketing", "game-publishing"],
  }),
  defineRole({
    id: "content-marketing",
    family: "市场与商务",
    label: "游戏内容营销",
    query: "游戏内容营销",
    matchTerms: ["游戏内容营销", "内容营销策划", "新媒体运营", "品牌内容营销"],
    focus: ["内容策划", "短视频", "直播内容", "达人合作", "社交传播"],
    skills: ["选题策划", "内容制作", "平台运营", "热点洞察", "效果复盘"],
    relatedRoleIds: ["game-marketing", "community-operations"],
  }),
  defineRole({
    id: "user-acquisition",
    family: "市场与商务",
    label: "游戏投放 / 买量",
    query: "游戏投放",
    matchTerms: ["游戏投放", "广告投放", "投放优化", "用户增长", "买量"],
    focus: ["效果广告", "素材策略", "渠道投放", "海外买量", "增长实验"],
    skills: ["ROI分析", "归因分析", "广告平台", "素材测试", "预算优化"],
    relatedRoleIds: ["game-marketing", "game-data"],
  }),
  defineRole({
    id: "game-business",
    family: "市场与商务",
    label: "游戏商务 / BD",
    query: "游戏商务",
    matchTerms: ["游戏商务", "商务拓展", "渠道商务", "异业合作", "游戏BD"],
    focus: ["渠道合作", "IP合作", "异业合作", "研发商合作", "商业谈判"],
    skills: ["商务谈判", "合同推进", "伙伴管理", "行业分析", "资源整合"],
    relatedRoleIds: ["game-publishing", "game-marketing"],
  }),

  defineRole({
    id: "game-qa",
    family: "质量与洞察",
    label: "游戏测试 / QA",
    query: "游戏测试",
    matchTerms: ["游戏测试", "游戏QA", "功能测试", "质量保证"],
    focus: ["功能测试", "兼容性测试", "性能测试", "体验测试", "版本验收"],
    skills: ["测试用例", "缺陷管理", "专项测试", "抓包分析", "质量度量"],
    relatedRoleIds: ["test-development", "game-operations"],
  }),
  defineRole({
    id: "test-development",
    family: "质量与洞察",
    label: "游戏测试开发",
    query: "游戏测试开发",
    matchTerms: ["游戏测试开发", "测试开发工程师", "自动化测试"],
    focus: ["自动化测试", "性能工具", "质量平台", "客户端测试", "服务端测试"],
    skills: ["Python", "C++", "自动化框架", "CI / CD", "性能分析"],
    relatedRoleIds: ["game-qa", "client-development"],
  }),
  defineRole({
    id: "game-data",
    family: "质量与洞察",
    label: "游戏数据分析",
    query: "游戏数据分析",
    matchTerms: ["游戏数据分析", "游戏分析师", "游戏商业分析", "数据分析师"],
    focus: ["用户分析", "留存付费", "版本分析", "商业化分析", "市场分析"],
    skills: ["SQL", "Python", "统计分析", "指标体系", "数据可视化"],
    relatedRoleIds: ["ux-research", "numerical-design"],
  }),
  defineRole({
    id: "ux-research",
    family: "质量与洞察",
    label: "游戏用户研究",
    query: "游戏用户研究",
    matchTerms: ["游戏用户研究", "游戏体验研究", "市场与用户研究", "用户体验研究"],
    focus: ["可用性研究", "玩家洞察", "概念测试", "竞品研究", "市场研究"],
    skills: ["用户访谈", "问卷设计", "焦点小组", "统计分析", "研究报告"],
    relatedRoleIds: ["game-data", "game-product"],
  }),
];

const legacyRoleMap: Record<string, string> = {
  游戏策划: "system-design",
  游戏开发: "client-development",
  游戏美术: "concept-art",
  游戏运营: "game-operations",
  游戏产品经理: "game-product",
};

export function findRoleTrack(value: string) {
  const legacyRoleId = legacyRoleMap[value];
  return (
    roleTracks.find(
      (track) =>
        track.id === value ||
        track.id === legacyRoleId ||
        track.label === value ||
        track.query === value ||
        track.matchTerms.includes(value),
    ) || roleTracks[0]
  );
}

export function getRelatedRoleTracks(track: RoleTrack) {
  return track.relatedRoleIds
    .map((id) => roleTracks.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is RoleTrack => Boolean(candidate));
}

export function getSpecialtyGroups(track: RoleTrack) {
  return [...track.specialtyGroups, ...sharedSpecialtyGroups];
}

export function defaultSpecialtiesFor(track: RoleTrack) {
  const projectDefault =
    track.family === "市场与商务"
      ? "全球化 / 出海"
      : ["产品与项目", "技术研发", "美术与音频"].includes(track.family)
        ? "新项目 / 从0到1"
        : "长线运营";
  return [
    ...track.specialtyGroups[0].options.slice(0, 2),
    projectDefault,
  ];
}
