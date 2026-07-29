/**
 * Mock data backing the At-risk Groups page, including a simplified
 * (non-geographically-precise) SVG polygon map of Waterloo Region.
 */

export const atRiskMetrics = {
  highRiskGroups: { value: 3, subtitle: '1 new signal' },
  highRiskAreas: { value: 4, subtitle: '↑ N. Kitchener' },
  avgRiskIndex: { value: 6.4, prevValue: 5.1 },
  cpiFoodIndex: { valuePct: 9.2, subtitle: 'June 2026 YoY' },
};

/**
 * Simplified, gapless grid layout (viewBox "0 0 480 420") — not
 * geographically precise, but visually reads as adjoining regions the way
 * the prototype's map does.
 */
export const riskRegions = [
  {
    id: 'wilmot',
    name: 'Wilmot',
    type: '',
    riskLevel: 'low',
    points: '20,130 90,130 90,360 20,360',
    labelPos: { x: 55, y: 245 },
    vertical: true,
  },
  {
    id: 'wellesley',
    name: 'Wellesley',
    type: 'Township',
    riskLevel: 'low',
    points: '90,20 280,20 280,130 90,130',
    labelPos: { x: 185, y: 70 },
  },
  {
    id: 'woolwich',
    name: 'Woolwich',
    type: 'Township',
    riskLevel: 'low',
    points: '280,20 460,20 460,130 280,130',
    labelPos: { x: 370, y: 70 },
  },
  {
    id: 'waterloo',
    name: 'Waterloo',
    type: 'City',
    riskLevel: 'medium',
    points: '90,130 280,130 280,230 90,230',
    labelPos: { x: 185, y: 175 },
  },
  {
    id: 'n-dumfries',
    name: 'N. Dumfries',
    type: 'Township',
    riskLevel: 'medium',
    points: '280,130 460,130 460,360 280,360',
    labelPos: { x: 370, y: 195 },
  },
  {
    id: 'n-kitchener',
    name: 'N. Kitchener',
    type: '',
    riskLevel: 'high',
    points: '90,230 280,230 280,300 90,300',
    labelPos: { x: 185, y: 268 },
  },
  {
    id: 's-kitchener',
    name: 'S. Kitchener',
    type: '',
    riskLevel: 'med-high',
    points: '90,300 280,300 280,360 90,360',
    labelPos: { x: 185, y: 333 },
  },
  {
    id: 'cambridge',
    name: 'Cambridge',
    type: 'City',
    riskLevel: 'med-high',
    points: '90,360 460,360 460,400 90,400',
    labelPos: { x: 275, y: 378 },
  },
];

export const riskLegend = [
  { level: 'low', label: 'Low' },
  { level: 'medium', label: 'Medium' },
  { level: 'med-high', label: 'Med-High' },
  { level: 'high', label: 'High' },
];

export const socioeconomicSignals = [
  {
    id: 'unemployment-rate',
    label: 'Unemployment Rate',
    value: '7.4%',
    description: 'Waterloo Region · June 2026',
    status: 'Elevated',
  },
  {
    id: 'rental-vacancy',
    label: 'Rental Vacancy Rate',
    value: '1.1%',
    description: 'Below 3% safe threshold',
    status: 'Critical',
  },
  {
    id: 'living-wage-gap',
    label: 'Living Wage Gap',
    value: '$5.40',
    description: '$23 living wage vs. $17.60 min wage',
    status: 'Elevated',
  },
  {
    id: 'social-assistance-cases',
    label: 'Social Assistance Cases',
    value: '38,420',
    description: '+14% YoY · Region of Waterloo',
    status: 'Critical',
  },
];

export const atRiskPopulationSignals = [
  { id: 'newcomer-families', label: 'Newcomer families', changePct: 78 },
  { id: 'single-parent', label: 'Single-parent HH', changePct: 61 },
  { id: 'seniors', label: 'Seniors (65+)', changePct: 44 },
  { id: 'youth', label: 'Youth (under 18)', changePct: 32 },
  { id: 'two-parent', label: 'Two-parent families', changePct: 18 },
];
