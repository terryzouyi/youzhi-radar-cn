const NON_GAME_PLANNER_TITLE =
  /(市场|营销|品牌|广告|投放|推广|媒介|公关|运营|商业分析).*策划|策划.*(市场|营销|品牌|广告|投放|推广|媒介|公关|运营)/;
const REMOTE_OR_NATIONWIDE = /(远程|全国|不限地点|地点不限)/;
const DIGITAL_GAME_CONTEXT =
  /(游戏|电竞|互联网|软件|计算机|网络|数字|科技|动漫|文娱|娱乐|人工智能|信息技术)/;
const CLEARLY_UNRELATED_INDUSTRY =
  /(餐饮|酒店|房地产|建筑|装修|物业|医疗|制药|银行|保险|物流|仓储|零售|商超|家政)/;

/**
 * @typedef {Object} FilterableJob
 * @property {string} title
 * @property {string} [summary]
 * @property {string[]} [tags]
 * @property {string} [city]
 * @property {string} [experience]
 * @property {string} [salary]
 * @property {string | null} [updatedAt]
 */

/**
 * @typedef {Object} JobProfile
 * @property {string} [targetRole]
 * @property {string | string[]} [relatedRoles]
 * @property {string} [cities]
 * @property {string} [years]
 * @property {string} [salary]
 * @property {boolean} [strictYears]
 * @property {boolean} [strictSalary]
 * @property {boolean} [allowRemote]
 */

export function splitTerms(value = "") {
  return value
    .replaceAll("|", "、")
    .split(/[\s]*[\/、,，;；\n]+[\s]*/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
}

function normalizeText(value = "") {
  return value.toLowerCase().replace(/\s+/g, "");
}

function matchesOneRole(job, role) {
  const title = normalizeText(job.title);
  const tags = normalizeText((job.tags || []).join(" "));
  const normalizedRole = normalizeText(role);
  if (!normalizedRole) return true;

  if (title.includes(normalizedRole)) return true;

  const withoutGamePrefix = normalizedRole.replace(/^游戏/, "");
  if (normalizedRole.includes("产品经理")) {
    return title.includes("产品经理") || title.includes("产品策划");
  }

  if (normalizedRole.includes("策划")) {
    const plannerTerm =
      withoutGamePrefix === "策划" ? "策划" : withoutGamePrefix;
    if (!title.includes(plannerTerm)) return false;
    if (
      withoutGamePrefix === "策划" &&
      NON_GAME_PLANNER_TITLE.test(title) &&
      !NON_GAME_PLANNER_TITLE.test(normalizedRole)
    ) {
      return false;
    }
    return true;
  }

  return (
    (withoutGamePrefix.length >= 2 && title.includes(withoutGamePrefix)) ||
    tags.includes(normalizedRole)
  );
}

/**
 * Multiple target roles use OR semantics.
 * @param {FilterableJob} job
 * @param {string} targetRole
 */
export function matchesTargetRole(job, targetRole) {
  const roles = splitTerms(targetRole);
  if (!roles.length) return true;
  return roles.some((role) => matchesOneRole(job, role));
}

/**
 * Multiple cities use OR semantics. Nationwide and remote jobs are configurable.
 * @param {FilterableJob} job
 * @param {string} cities
 * @param {boolean} [allowRemote]
 */
export function matchesCities(job, cities, allowRemote = true) {
  const cityTerms = splitTerms(cities);
  if (!cityTerms.length) return true;
  const jobCity = normalizeText(job.city);
  if (!jobCity) return false;
  if (REMOTE_OR_NATIONWIDE.test(jobCity)) {
    return (
      allowRemote ||
      cityTerms.some((city) => REMOTE_OR_NATIONWIDE.test(normalizeText(city)))
    );
  }
  return cityTerms.some((city) => jobCity.includes(normalizeText(city)));
}

function normalizeChineseNumbers(value) {
  const digits = {
    零: "0",
    一: "1",
    二: "2",
    两: "2",
    三: "3",
    四: "4",
    五: "5",
    六: "6",
    七: "7",
    八: "8",
    九: "9",
  };
  return value
    .replace(/十(?=年|以|[-–—至到])/g, "10")
    .replace(/[零一二两三四五六七八九]/g, (character) => digits[character]);
}

/**
 * @returns {{min: number, max: number} | null}
 */
export function parseExperienceRange(value = "") {
  const normalized = normalizeChineseNumbers(value)
    .replace(/\s+/g, "")
    .replace(/工作经验|经验/g, "");
  if (!normalized || /未知|未注明/.test(normalized)) return null;
  if (/不限|无要求|应届/.test(normalized)) {
    return { min: 0, max: Number.POSITIVE_INFINITY };
  }

  const range = normalized.match(
    /(\d+(?:\.\d+)?)年?[-–—至到](\d+(?:\.\d+)?)年?/,
  );
  if (range) {
    return { min: Number(range[1]), max: Number(range[2]) };
  }

  const atLeast = normalized.match(/(\d+(?:\.\d+)?)年?(?:以上|及以上|\+)/);
  if (atLeast) {
    return { min: Number(atLeast[1]), max: Number.POSITIVE_INFINITY };
  }

  const atMost = normalized.match(/(\d+(?:\.\d+)?)年?(?:以内|以下)/);
  if (atMost) {
    return { min: 0, max: Number(atMost[1]) };
  }

  const exact = normalized.match(/(\d+(?:\.\d+)?)年/);
  if (exact) {
    const years = Number(exact[1]);
    return { min: years, max: years };
  }
  return null;
}

/**
 * Unknown job experience remains eligible instead of creating a false negative.
 * @param {FilterableJob} job
 * @param {string} candidateYears
 */
export function matchesExperience(job, candidateYears) {
  const candidate = parseExperienceRange(candidateYears);
  const required = parseExperienceRange(job.experience);
  if (!candidate || !required) return true;
  return candidate.max >= required.min && required.max >= candidate.min;
}

/**
 * Parses monthly salary ranges expressed in K.
 * @returns {{min: number, max: number} | null}
 */
export function parseSalaryRange(value = "") {
  const normalized = value.replace(/\s+/g, "");
  if (!normalized || /面议|未知|未注明/.test(normalized)) return null;

  const range = normalized.match(
    /(\d+(?:\.\d+)?)[-–—至到](\d+(?:\.\d+)?)k/i,
  );
  if (range) {
    return { min: Number(range[1]), max: Number(range[2]) };
  }

  const atLeast = normalized.match(/(\d+(?:\.\d+)?)k(?:以上|\+)/i);
  if (atLeast) {
    return { min: Number(atLeast[1]), max: Number.POSITIVE_INFINITY };
  }

  const exact = normalized.match(/(\d+(?:\.\d+)?)k/i);
  if (exact) {
    const salary = Number(exact[1]);
    return { min: salary, max: salary };
  }
  return null;
}

/**
 * A role paying above the desired range is still eligible. Unknown salary is kept.
 * @param {FilterableJob} job
 * @param {string} desiredSalary
 */
export function matchesSalary(job, desiredSalary) {
  const desired = parseSalaryRange(desiredSalary);
  const offered = parseSalaryRange(job.salary);
  if (!desired || !offered) return true;
  return offered.max >= desired.min;
}

/**
 * Third-party listings occasionally contain titles that look relevant while
 * the employer is clearly outside the intended internet/game scope.
 * @param {FilterableJob & {company?: string}} job
 */
export function matchesIndustryScope(job) {
  const employerContext = normalizeText(
    [
      job.company || "",
      job.summary || "",
      ...(job.tags || []),
    ].join(" "),
  );
  if (!CLEARLY_UNRELATED_INDUSTRY.test(employerContext)) return true;
  return DIGITAL_GAME_CONTEXT.test(employerContext);
}

function describeConditions({
  experienceKnown,
  experienceHit,
  salaryKnown,
  salaryHit,
}) {
  const experience = experienceKnown
    ? experienceHit
      ? "年限匹配"
      : "年限有差距"
    : "年限待确认";
  const salary = salaryKnown
    ? salaryHit
      ? "薪资达到预期"
      : "薪资低于预期"
    : "薪资待确认";
  return `${experience} · ${salary}`;
}

/**
 * Classifies an eligible role without turning every preference into a hard
 * filter. City and role remain hard boundaries; known experience and salary
 * mismatches are soft unless strict mode is enabled.
 * @param {FilterableJob} job
 * @param {JobProfile} profile
 */
export function evaluateProfile(job, profile) {
  const relatedRoles = Array.isArray(profile.relatedRoles)
    ? profile.relatedRoles.join("、")
    : profile.relatedRoles || "";
  const primaryMatched = matchesTargetRole(job, profile.targetRole || "");
  const relatedMatched =
    !primaryMatched &&
    Boolean(splitTerms(relatedRoles).length) &&
    matchesTargetRole(job, relatedRoles);
  const roleEligible = primaryMatched || relatedMatched;
  const cityEligible = matchesCities(
    job,
    profile.cities || "",
    profile.allowRemote !== false,
  );

  const desiredExperience = parseExperienceRange(profile.years || "");
  const requiredExperience = parseExperienceRange(job.experience || "");
  const desiredSalary = parseSalaryRange(profile.salary || "");
  const offeredSalary = parseSalaryRange(job.salary || "");
  const experienceKnown = !desiredExperience || Boolean(requiredExperience);
  const salaryKnown = !desiredSalary || Boolean(offeredSalary);
  const experienceHit = matchesExperience(job, profile.years || "");
  const salaryHit = matchesSalary(job, profile.salary || "");
  const experienceMismatch =
    Boolean(desiredExperience && requiredExperience) && !experienceHit;
  const salaryMismatch =
    Boolean(desiredSalary && offeredSalary) && !salaryHit;
  const strictMismatch =
    (profile.strictYears === true && experienceMismatch) ||
    (profile.strictSalary === true && salaryMismatch);
  const eligible = roleEligible && cityEligible && !strictMismatch;
  const conditions = describeConditions({
    experienceKnown,
    experienceHit,
    salaryKnown,
    salaryHit,
  });
  const missingFields = [
    !experienceKnown ? "年限" : "",
    !salaryKnown ? "薪资" : "",
    !job.updatedAt ? "更新时间" : "",
  ].filter(Boolean);

  if (relatedMatched || experienceMismatch || salaryMismatch) {
    return {
      eligible,
      tier: "expanded",
      grade: "C",
      tierLabel: "拓展机会",
      dimensions: {
        role: relatedMatched ? "可迁移方向" : "主方向命中",
        conditions,
        data: missingFields.length
          ? `${missingFields.join("、")}待确认`
          : "关键信息完整",
      },
    };
  }

  if (!experienceKnown || !salaryKnown) {
    return {
      eligible,
      tier: "incomplete",
      grade: "B",
      tierLabel: "信息待确认",
      dimensions: {
        role: primaryMatched ? "主方向命中" : "方向未命中",
        conditions,
        data: `${missingFields.join("、")}待确认`,
      },
    };
  }

  return {
    eligible,
    tier: "priority",
    grade: "A",
    tierLabel: "精准匹配",
    dimensions: {
      role: primaryMatched ? "主方向命中" : "方向未命中",
      conditions,
      data: job.updatedAt ? "关键信息完整" : "更新时间待确认",
    },
  };
}

/**
 * @param {FilterableJob} job
 * @param {JobProfile} profile
 */
export function matchesProfile(job, profile) {
  return evaluateProfile(job, profile).eligible;
}

export function isRecentJob(updatedAt, referenceTime, days = 3) {
  if (!updatedAt || !referenceTime) return false;
  const updated = new Date(updatedAt).getTime();
  const reference = new Date(referenceTime).getTime();
  if (!Number.isFinite(updated) || !Number.isFinite(reference)) return false;
  const elapsed = reference - updated;
  return elapsed >= 0 && elapsed < days * 24 * 60 * 60 * 1000;
}
