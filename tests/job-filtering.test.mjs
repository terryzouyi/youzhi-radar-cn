import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateProfile,
  isRecentJob,
  matchesCities,
  matchesExperience,
  matchesIndustryScope,
  matchesProfile,
  matchesSalary,
  matchesTargetRole,
  parseExperienceRange,
  parseSalaryRange,
  splitTerms,
} from "../lib/job-filtering.js";

const baseJob = {
  title: "高级系统策划",
  summary: "负责游戏成长系统与商业化设计",
  tags: ["系统策划", "游戏"],
  city: "上海市",
  experience: "3-5年",
  salary: "30-45K · 15薪",
};

test("preserves multiple target roles with OR semantics", () => {
  assert.deepEqual(splitTerms("游戏策划 / 产品经理，制作人"), [
    "游戏策划",
    "产品经理",
    "制作人",
  ]);
  assert.equal(
    matchesTargetRole(
      { ...baseJob, title: "游戏产品经理" },
      "游戏策划 / 产品经理",
    ),
    true,
  );
});

test("removes unrelated roles from a broad game-planner search", () => {
  assert.equal(matchesTargetRole(baseJob, "游戏策划"), true);
  assert.equal(
    matchesTargetRole(
      { ...baseJob, title: "Unity 客户端开发工程师" },
      "游戏策划",
    ),
    false,
  );
  assert.equal(
    matchesTargetRole(
      { ...baseJob, title: "版本营销策划" },
      "游戏策划",
    ),
    false,
  );
  assert.equal(
    matchesTargetRole(
      { ...baseJob, title: "资深运营策划" },
      "游戏策划",
    ),
    false,
  );
});

test("matches mainstream role aliases without broadening to a whole family", () => {
  assert.equal(
    matchesTargetRole(
      { ...baseJob, title: "休闲游戏玩法策划" },
      "系统策划、玩法策划、功能策划、资源策划",
    ),
    true,
  );
  assert.equal(
    matchesTargetRole(
      { ...baseJob, title: "Unity客户端开发工程师" },
      "游戏客户端开发、客户端开发、Unity客户端、UE客户端",
    ),
    true,
  );
  assert.equal(
    matchesTargetRole(
      { ...baseJob, title: "资深角色模型设计师" },
      "3D角色、角色模型、角色建模、角色制作",
    ),
    true,
  );
  assert.equal(
    matchesTargetRole(
      { ...baseJob, title: "高级服务端开发工程师" },
      "系统策划、玩法策划、功能策划、资源策划",
    ),
    false,
  );
});

test("uses cities as a strict OR filter while preserving remote roles", () => {
  assert.equal(matchesCities(baseJob, "上海、杭州、深圳"), true);
  assert.equal(matchesCities(baseJob, "北京、成都"), false);
  assert.equal(
    matchesCities({ ...baseJob, city: "全国远程" }, "北京、成都"),
    true,
  );
  assert.equal(
    matchesCities({ ...baseJob, city: "全国远程" }, "北京、成都", false),
    false,
  );
});

test("filters incompatible known experience and keeps unknown experience", () => {
  assert.deepEqual(parseExperienceRange("三至五年"), { min: 3, max: 5 });
  assert.equal(matchesExperience(baseJob, "3–5 年"), true);
  assert.equal(
    matchesExperience({ ...baseJob, experience: "10年以上" }, "3–5 年"),
    false,
  );
  assert.equal(
    matchesExperience({ ...baseJob, experience: "经验未知" }, "3–5 年"),
    true,
  );
});

test("filters salary below expectation and keeps higher or unknown salary", () => {
  assert.deepEqual(parseSalaryRange("25–35K"), { min: 25, max: 35 });
  assert.equal(matchesSalary(baseJob, "25–35K"), true);
  assert.equal(
    matchesSalary({ ...baseJob, salary: "10-20K" }, "25–35K"),
    false,
  );
  assert.equal(
    matchesSalary({ ...baseJob, salary: "40-60K" }, "25–35K"),
    true,
  );
  assert.equal(
    matchesSalary({ ...baseJob, salary: "薪资面议" }, "25–35K"),
    true,
  );
});

test("applies the complete profile and excludes unknown update dates from recent", () => {
  assert.equal(
    matchesProfile(baseJob, {
      targetRole: "游戏策划 / 产品经理",
      cities: "上海、杭州",
      years: "3–5 年",
      salary: "25–35K",
    }),
    true,
  );
  assert.equal(
    matchesProfile(baseJob, {
      targetRole: "游戏策划",
      cities: "北京",
      years: "3–5 年",
      salary: "25–35K",
    }),
    false,
  );

  const reference = "2026-07-29T12:00:00.000Z";
  assert.equal(isRecentJob(null, reference), false);
  assert.equal(isRecentJob("2026-07-28T12:00:00.000Z", reference), true);
  assert.equal(isRecentJob("2026-07-20T12:00:00.000Z", reference), false);
  assert.equal(isRecentJob("2026-07-30T12:00:00.000Z", reference), false);
});

test("classifies a complete primary-role match as priority A", () => {
  assert.deepEqual(
    evaluateProfile(
      { ...baseJob, updatedAt: "2026-07-29T00:00:00.000Z" },
      {
        targetRole: "游戏策划",
        relatedRoles: "游戏产品经理",
        cities: "上海、杭州",
        years: "3–5 年",
        salary: "25–35K",
      },
    ),
    {
      eligible: true,
      tier: "priority",
      grade: "A",
      tierLabel: "精准匹配",
      dimensions: {
        role: "主方向命中",
        conditions: "年限匹配 · 薪资达到预期",
        data: "关键信息完整",
      },
    },
  );
});

test("keeps missing salary visible in the incomplete tier", () => {
  const result = evaluateProfile(
    { ...baseJob, salary: "薪资面议" },
    {
      targetRole: "游戏策划",
      cities: "上海",
      years: "3–5 年",
      salary: "25–35K",
    },
  );
  assert.equal(result.eligible, true);
  assert.equal(result.tier, "incomplete");
  assert.equal(result.grade, "B");
  assert.match(result.dimensions.data, /薪资.*待确认/);
});

test("separates related roles and soft condition mismatches as expanded", () => {
  const related = evaluateProfile(
    { ...baseJob, title: "游戏产品经理" },
    {
      targetRole: "游戏策划",
      relatedRoles: ["游戏产品经理"],
      cities: "上海",
      years: "3–5 年",
      salary: "25–35K",
    },
  );
  assert.equal(related.eligible, true);
  assert.equal(related.tier, "expanded");
  assert.equal(related.dimensions.role, "可迁移方向");

  const softMismatch = evaluateProfile(
    { ...baseJob, experience: "10年以上", salary: "10-20K" },
    {
      targetRole: "游戏策划",
      cities: "上海",
      years: "3–5 年",
      salary: "25–35K",
    },
  );
  assert.equal(softMismatch.eligible, true);
  assert.equal(softMismatch.tier, "expanded");
  assert.match(softMismatch.dimensions.conditions, /年限有差距/);
  assert.match(softMismatch.dimensions.conditions, /薪资低于预期/);
});

test("strict modes reject known mismatches but not unknown source fields", () => {
  assert.equal(
    evaluateProfile(
      { ...baseJob, experience: "10年以上", salary: "10-20K" },
      {
        targetRole: "游戏策划",
        cities: "上海",
        years: "3–5 年",
        salary: "25–35K",
        strictYears: true,
        strictSalary: true,
      },
    ).eligible,
    false,
  );
  assert.equal(
    evaluateProfile(
      { ...baseJob, experience: "经验未知", salary: "薪资面议" },
      {
        targetRole: "游戏策划",
        cities: "上海",
        years: "3–5 年",
        salary: "25–35K",
        strictYears: true,
        strictSalary: true,
      },
    ).eligible,
    true,
  );
});

test("removes clearly unrelated third-party employer contexts", () => {
  assert.equal(
    matchesIndustryScope({
      ...baseJob,
      company: "上海某餐饮管理有限公司",
      summary: "连锁门店运营",
      tags: ["餐饮服务"],
    }),
    false,
  );
  assert.equal(
    matchesIndustryScope({
      ...baseJob,
      company: "某互联网科技公司",
      summary: "游戏内容与用户体验",
      tags: ["软件服务"],
    }),
    true,
  );
});
