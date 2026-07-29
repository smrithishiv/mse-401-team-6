/**
 * Mock data backing the Agencies directory + Agency detail page. Generated
 * deterministically (seeded PRNG) so the dataset — and anything that tests
 * against it — is stable across runs, rather than hand-typing 61 records.
 *
 * The three highest-signal agencies (KW YMCA, Cambridge Food Bank, an
 * over-threshold newcomer-serving pantry in Elmira) are defined explicitly
 * so their numbers can be referenced predictably elsewhere (Overview's
 * "Allocation alerts: 3, 2 need review" ties directly to these three).
 */

function mulberry32(seed) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(88172645);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const CITIES = [
  { city: 'Kitchener', serviceArea: 'Kitchener-Waterloo' },
  { city: 'Waterloo', serviceArea: 'Kitchener-Waterloo' },
  { city: 'Cambridge', serviceArea: 'Cambridge' },
  { city: 'Elmira', serviceArea: 'Woolwich Township' },
  { city: 'St. Jacobs', serviceArea: 'Woolwich Township' },
  { city: 'Breslau', serviceArea: 'Woolwich Township' },
  { city: 'New Hamburg', serviceArea: 'Wilmot Township' },
  { city: 'Baden', serviceArea: 'Wilmot Township' },
  { city: 'Ayr', serviceArea: 'North Dumfries Township' },
  { city: 'St. Clements', serviceArea: 'Wellesley Township' },
  { city: 'Wellesley', serviceArea: 'Wellesley Township' },
];

const KW_NEIGHBOURHOODS = [
  'Forest Heights', 'Doon', 'Bridgeport', 'Stanley Park', 'Victoria Hills',
  'Beechwood', 'Laurelwood', 'Eastbridge', 'Lakeshore', 'Rosemount',
  'Southdale', 'Fairview', 'Idlewood', 'Mill Courtland', 'Pioneer Park',
  'Vista Hills', 'Chicopee', 'Centreville', 'Huron', 'Grand River South',
];

const AGENCY_TYPES = [
  'Food Bank', 'Community Centre', 'Emergency Relief Centre',
  'Family Resource Centre', 'Neighbourhood Pantry', 'Outreach Centre',
  'Community Kitchen', 'Shelter Services', 'Faith Community Pantry',
  'Seniors Support Centre', 'Youth Centre', 'Multicultural Centre',
];

const STATUS_LABEL = {
  normal: 'Normal',
  watch: 'Watch',
  'high-demand': 'High demand',
  critical: 'Critical',
};

function toId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildWeeklyDemand(base, trend) {
  const slopeByTrend = { rising: 1, stable: 0, falling: -1 };
  const slope = slopeByTrend[trend] ?? 0;
  const weeks = [];
  let value = base - slope * randInt(30, 70) * 1.5;
  for (let i = 0; i < 4; i += 1) {
    value += slope * randInt(15, 45) + randInt(-10, 10);
    weeks.push(Math.max(20, Math.round(value)));
  }
  weeks[3] = base; // most recent week matches the agency's stated current demand
  return weeks;
}

function buildAgency({
  id,
  name,
  city,
  serviceArea,
  currentDemand,
  forecastedDemand,
  status,
  reviewRequired,
  trend,
  confidence,
  allocationStatus,
  currentAllocation,
  recommendedAllocation,
  reasonFlagged,
  recommendedAction,
}) {
  const forecastDifferencePercent = Math.round(
    ((forecastedDemand - currentDemand) / currentDemand) * 100
  );

  return {
    id,
    name,
    serviceArea,
    city,
    currentDemand,
    forecastedDemand,
    forecastDifferencePercent,
    status,
    reviewRequired,
    trend,
    weeklyDemand: buildWeeklyDemand(currentDemand, trend),
    currentAllocation,
    recommendedAllocation,
    allocationStatus,
    confidence,
    reasonFlagged: reasonFlagged || null,
    recommendedAction: recommendedAction || 'No action needed',
    lastUpdated: '2026-07-01T06:00:00-04:00',
  };
}

const FEATURED_AGENCIES = [
  buildAgency({
    id: 'kw-ymca',
    name: 'KW YMCA',
    city: 'Kitchener',
    serviceArea: 'Kitchener-Waterloo',
    currentDemand: 920,
    forecastedDemand: 1132,
    status: 'high-demand',
    reviewRequired: true,
    trend: 'rising',
    confidence: 'high',
    allocationStatus: 'review',
    currentAllocation: 950,
    recommendedAllocation: 1150,
    reasonFlagged: '23% above expected demand',
    recommendedAction: 'Review allocation',
  }),
  buildAgency({
    id: 'cambridge-food-bank',
    name: 'Cambridge Food Bank',
    city: 'Cambridge',
    serviceArea: 'Cambridge',
    currentDemand: 640,
    forecastedDemand: 712,
    status: 'watch',
    reviewRequired: false,
    trend: 'rising',
    confidence: 'high',
    allocationStatus: 'on-track',
    currentAllocation: 700,
    recommendedAllocation: 720,
    reasonFlagged: '11% above expected demand',
    recommendedAction: 'Monitor next reporting cycle',
  }),
  buildAgency({
    id: 'elmira-newcomer-family-pantry',
    name: 'Elmira Newcomer Family Pantry',
    city: 'Elmira',
    serviceArea: 'Woolwich Township',
    currentDemand: 210,
    forecastedDemand: 289,
    status: 'critical',
    reviewRequired: true,
    trend: 'rising',
    confidence: 'low',
    allocationStatus: 'review',
    currentAllocation: 220,
    recommendedAllocation: 300,
    reasonFlagged: '38% above expected demand · low forecast confidence',
    recommendedAction: 'Confirm allocation manually',
  }),
  buildAgency({
    id: 'waterloo-community-centre',
    name: 'Waterloo Community Centre',
    city: 'Waterloo',
    serviceArea: 'Kitchener-Waterloo',
    currentDemand: 480,
    forecastedDemand: 472,
    status: 'normal',
    reviewRequired: false,
    trend: 'stable',
    confidence: 'high',
    allocationStatus: 'on-track',
    currentAllocation: 490,
    recommendedAllocation: 480,
    recommendedAction: 'No action needed',
  }),
];

const usedNames = new Set(FEATURED_AGENCIES.map((a) => a.name));
const usedIds = new Set(FEATURED_AGENCIES.map((a) => a.id));
const generatedAgencies = [];

while (FEATURED_AGENCIES.length + generatedAgencies.length < 61) {
  const { city, serviceArea } = pick(CITIES);
  const isKW = serviceArea === 'Kitchener-Waterloo';
  const areaLabel = isKW ? pick(KW_NEIGHBOURHOODS) : city;
  const type = pick(AGENCY_TYPES);
  const name = `${areaLabel} ${type}`;

  if (usedNames.has(name)) continue;
  usedNames.add(name);

  const id = toId(name);
  if (usedIds.has(id)) continue;
  usedIds.add(id);

  const currentDemand = randInt(120, 780);
  // The vast majority of agencies sit close to forecast — only the three
  // featured agencies above represent meaningful over/under-demand signals.
  const diffPct = randInt(-6, 6);
  const forecastedDemand = Math.max(60, Math.round(currentDemand * (1 + diffPct / 100)));
  const trend = diffPct >= 3 ? 'rising' : diffPct <= -3 ? 'falling' : 'stable';
  const allocationBuffer = randInt(-15, 25);

  generatedAgencies.push(
    buildAgency({
      id,
      name,
      city,
      serviceArea,
      currentDemand,
      forecastedDemand,
      status: 'normal',
      reviewRequired: false,
      trend,
      confidence: rand() > 0.15 ? 'high' : 'low',
      allocationStatus: 'on-track',
      currentAllocation: currentDemand + allocationBuffer,
      recommendedAllocation: forecastedDemand + Math.round(allocationBuffer / 2),
      recommendedAction: 'No action needed',
    })
  );
}

export const agencies = [...FEATURED_AGENCIES, ...generatedAgencies].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export const AGENCY_STATUS_LABELS = STATUS_LABEL;

export const AGENCY_CITIES = Array.from(new Set(agencies.map((a) => a.city))).sort();
export const AGENCY_SERVICE_AREAS = Array.from(new Set(agencies.map((a) => a.serviceArea))).sort();
