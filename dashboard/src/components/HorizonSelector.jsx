import SegmentedToggle from './SegmentedToggle';

/**
 * Thin wrapper around SegmentedToggle for choosing a supported strategic
 * forecast horizon. Options come from the service (getStrategicHorizonOptions)
 * rather than being hardcoded here, so the frontend never assumes a horizon
 * the backend doesn't actually support.
 *
 * @param {{ options: number[], value: number, onChange: (years: number) => void }} props
 */
export default function HorizonSelector({ options, value, onChange }) {
  return (
    <SegmentedToggle
      options={options.map((years) => ({ value: String(years), label: `${years}y` }))}
      value={String(value)}
      onChange={(v) => onChange(Number(v))}
      ariaLabel="Strategic forecast horizon"
    />
  );
}
