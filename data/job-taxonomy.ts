export type RoleTrack = {
  id: string;
  label: string;
  query: string;
  specialties: string[];
  relatedRoles: string[];
};

export const roleTracks: RoleTrack[] = [
  {
    id: "game-design",
    label: "游戏策划",
    query: "游戏策划",
    specialties: [
      "系统策划",
      "数值策划",
      "战斗策划",
      "关卡策划",
      "剧情文案",
      "商业化策划",
    ],
    relatedRoles: ["游戏产品经理"],
  },
  {
    id: "game-product",
    label: "游戏产品经理",
    query: "游戏产品经理",
    specialties: [
      "产品规划",
      "用户研究",
      "数据分析",
      "商业化",
      "增长",
    ],
    relatedRoles: ["游戏策划", "游戏运营"],
  },
  {
    id: "game-operations",
    label: "游戏运营",
    query: "游戏运营",
    specialties: [
      "版本运营",
      "用户运营",
      "社区运营",
      "活动运营",
      "海外运营",
    ],
    relatedRoles: ["游戏产品经理"],
  },
  {
    id: "game-development",
    label: "游戏开发",
    query: "游戏开发",
    specialties: [
      "客户端开发",
      "服务端开发",
      "引擎开发",
      "技术美术",
      "游戏AI",
    ],
    relatedRoles: ["技术美术"],
  },
  {
    id: "game-art",
    label: "游戏美术",
    query: "游戏美术",
    specialties: [
      "角色原画",
      "场景美术",
      "3D角色",
      "UI视觉",
      "技术美术",
    ],
    relatedRoles: ["技术美术"],
  },
];

export function findRoleTrack(value: string) {
  return (
    roleTracks.find(
      (track) => track.label === value || track.query === value,
    ) || roleTracks[0]
  );
}
