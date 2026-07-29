import CompactFilterBar from './CompactFilterBar';

/**
 * Compact status/city/review/trend filters for the Agencies directory —
 * reuses CompactFilterBar's inline-select rendering rather than duplicating
 * it, since the interaction (a row of labelled selects) is identical.
 * @param {{ fields: Array, values: Object, onChange: (id: string, value: string) => void }} props
 */
export default function AgencyFilters({ fields, values, onChange }) {
  return <CompactFilterBar fields={fields} values={values} onChange={onChange} />;
}
