import { useState } from 'react';

interface CountryOption {
  code: string;
  dial: string;
  label: string;
}

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'INTL', dial: '', label: 'Intl (+Any)' },
  { code: 'US', dial: '+1', label: 'US / CA (+1)' },
  { code: 'GB', dial: '+44', label: 'UK (+44)' },
  { code: 'AE', dial: '+971', label: 'UAE (+971)' },
  { code: 'DE', dial: '+49', label: 'DE (+49)' },
  { code: 'FR', dial: '+33', label: 'FR (+33)' },
  { code: 'CH', dial: '+41', label: 'CH (+41)' },
  { code: 'AU', dial: '+61', label: 'AU (+61)' },
  { code: 'SG', dial: '+65', label: 'SG (+65)' },
  { code: 'JP', dial: '+81', label: 'JP (+81)' },
];

interface InternationalPhoneInputProps {
  id: string;
  value: string;
  onChange: (fullPhone: string) => void;
  required?: boolean;
}

export function InternationalPhoneInput({
  id,
  value,
  onChange,
  required = true,
}: InternationalPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('INTL');

  const activeCountry =
    COUNTRY_OPTIONS.find((c) => c.code === selectedCountry) ?? COUNTRY_OPTIONS[0];

  const handleCountryChange = (nextCode: string) => {
    const prevDial = activeCountry.dial;
    const nextOption = COUNTRY_OPTIONS.find((c) => c.code === nextCode) ?? COUNTRY_OPTIONS[0];
    setSelectedCountry(nextCode);

    const stripped = prevDial && value.startsWith(prevDial)
      ? value.slice(prevDial.length).trimStart()
      : value.replace(/^\+\d{1,4}\s*/, '');

    if (nextOption.dial) {
      onChange(stripped ? `${nextOption.dial} ${stripped}` : `${nextOption.dial} `);
    } else {
      onChange(stripped);
    }
  };

  return (
    <div className="flex items-stretch gap-2">
      <select
        aria-label="Country calling code"
        value={selectedCountry}
        onChange={(e) => handleCountryChange(e.target.value)}
        className="px-2.5 py-2.5 text-xs bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] font-mono shrink-0 focus:outline-none focus:border-[#141416] cursor-pointer"
      >
        {COUNTRY_OPTIONS.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={activeCountry.dial ? `${activeCountry.dial} 555 234 5678` : '+1 555 234 5678'}
        className="w-full min-w-0 px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-black/12 rounded-lg text-[#141416] placeholder:text-[#787A80] focus:outline-none focus:border-[#141416]"
      />
    </div>
  );
}
