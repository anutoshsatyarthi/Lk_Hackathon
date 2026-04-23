import React, { useState } from 'react';
import { X, ChevronDown, Info } from 'lucide-react';

const FORMATS = ['Reel', 'Carousel', 'Image', 'Story'];

const BRANDS = [
  { value: 'vincent_chase', label: 'Lenskart Air (VC)', tier: 'standard', aov: 2500, margin: 35, productCategory: 'eyewear' },
  { value: 'hustlr',        label: 'Hustlr',           tier: 'standard', aov: 2500, margin: 35, productCategory: 'eyewear' },
  { value: 'john_jacobs',   label: 'John Jacobs (JJ)', tier: 'premium',  aov: 5500, margin: 45, productCategory: 'eyewear' },
  { value: 'le_petit',      label: 'Le Petit',         tier: 'premium',  aov: 4500, margin: 45, productCategory: 'eyewear' },
  { value: 'meller',        label: 'Meller',           tier: 'premium',  aov: 4500, margin: 42, productCategory: 'sunglasses' },
  { value: 'fossil',        label: 'Fossil',           tier: 'premium',  aov: 7000, margin: 45, productCategory: 'sunglasses' },
  { value: 'beachclub',     label: 'BeachClub',        tier: 'premium',  aov: 3800, margin: 40, productCategory: 'sunglasses' },
];
const DURATIONS = [
  { value: '1week', label: '1 Week' },
  { value: '2weeks', label: '2 Weeks' },
  { value: '1month', label: '1 Month' },
];
const INTEGRATIONS = [
  {
    value: 'deep',
    label: 'Hero of the content',
    emoji: '⭐',
    tip: 'The product is the main story — e.g. a full skit, challenge, or transformation built around the glasses.',
    reach: 'Highest reach & trust',
    reachColor: 'var(--accent-green)',
    example: '"I wore Lenskart glasses for 30 days" or "Which frame fits your personality?"',
  },
  {
    value: 'moderate',
    label: 'Featured in content',
    emoji: '👓',
    tip: 'Product appears naturally as part of the post with a clear CTA — most common collab format.',
    reach: 'Balanced reach & cost',
    reachColor: 'var(--accent-orange)',
    example: '"Wearing my new John Jacobs frames while…" + link in bio',
  },
  {
    value: 'light',
    label: 'Quick mention / tag',
    emoji: '💬',
    tip: 'A brief shoutout or product tag — lowest effort, but audience engagement is much lower.',
    reach: 'Lower reach, lower cost',
    reachColor: 'var(--text-muted)',
    example: 'Tagged in a story or mentioned at the end of an unrelated post',
  },
];

function Segment({ options, value, onChange, keyField = 'value', labelField = 'label' }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((opt) => {
        const v = typeof opt === 'string' ? opt : opt[keyField];
        const l = typeof opt === 'string' ? opt : opt[labelField];
        const active = value === v.toLowerCase();
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v.toLowerCase())}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: active ? 'var(--accent-orange)' : 'var(--bg-elevated)',
              color: active ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${active ? 'var(--accent-orange)' : 'var(--border)'}`,
            }}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
        {hint && <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, prefix, min = 0, step = 1 }) {
  return (
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-sm" style={{ color: 'var(--text-muted)' }}>{prefix}</span>}
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full rounded-lg px-3 py-2 text-sm"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          paddingLeft: prefix ? '2rem' : '0.75rem',
          outline: 'none',
        }}
      />
    </div>
  );
}

export default function ROICampaignForm({ influencer, onSubmit, onClose, loading }) {
  const defaultBrand = BRANDS[0];
  const [form, setForm] = useState({
    fee: 500000,
    numPosts: 2,
    contentFormat: 'reel',
    brand: defaultBrand.value,
    productCategory: defaultBrand.productCategory,
    aov: defaultBrand.aov,
    profitMargin: defaultBrand.margin,
    duration: '2weeks',
    integrationLevel: 'moderate',
    hasDiscountCode: true,
    discountPercent: 15,
    hasVirtualTryOn: true,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleBrandChange = (brandValue) => {
    const b = BRANDS.find(x => x.value === brandValue);
    if (b) setForm(f => ({ ...f, brand: b.value, productCategory: b.productCategory, aov: b.aov, profitMargin: b.margin }));
  };

  const selectedBrand = BRANDS.find(b => b.value === form.brand) || defaultBrand;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, profitMargin: form.profitMargin / 100 });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="h-full overflow-y-auto w-full max-w-md flex flex-col"
        style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Predict ROI for Lenskart</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>@{influencer?.username || influencer}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-5">
          <Field label="Influencer Fee (INR)" hint="Total campaign fee">
            <NumberInput value={form.fee} onChange={v => set('fee', v)} prefix="₹" min={1000} step={1} />
          </Field>

          <Field label="Number of Posts">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => set('numPosts', Math.max(1, form.numPosts - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center font-bold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>−</button>
              <span className="font-mono font-medium text-lg w-6 text-center" style={{ color: 'var(--text-primary)' }}>{form.numPosts}</span>
              <button type="button" onClick={() => set('numPosts', Math.min(20, form.numPosts + 1))} className="w-8 h-8 rounded-lg flex items-center justify-center font-bold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>+</button>
            </div>
          </Field>

          <Field label="Content Format">
            <Segment options={FORMATS} value={form.contentFormat} onChange={v => set('contentFormat', v)} />
          </Field>

          <Field label="Brand" hint="Which Lenskart brand to promote?">
            <div className="relative">
              <select
                value={form.brand}
                onChange={e => handleBrandChange(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm appearance-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
              >
                {BRANDS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: selectedBrand.tier === 'premium' ? 'rgba(139,92,246,0.15)' : 'rgba(107,114,128,0.15)', color: selectedBrand.tier === 'premium' ? 'var(--accent-purple)' : 'var(--text-muted)' }}>
                {selectedBrand.tier === 'premium' ? 'Premium' : 'Standard'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(237,137,54,0.12)', color: 'var(--accent-orange)' }}>
                ATV ₹{selectedBrand.aov.toLocaleString('en-IN')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--accent-green)' }}>
                {selectedBrand.margin}% margin
              </span>
            </div>
          </Field>

          <Field label="Campaign Duration">
            <Segment options={DURATIONS} value={form.duration} onChange={v => set('duration', v)} />
          </Field>

          <div>
            <label className="block text-xs font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>
              How will Lenskart appear in the content?
            </label>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              This is the single biggest factor in how many people actually click and buy. Deeper = better ROI.
            </p>
            <div className="space-y-2">
              {INTEGRATIONS.map(opt => {
                const active = form.integrationLevel === opt.value;
                return (
                  <label key={opt.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl transition-all" style={{ background: active ? 'rgba(237,137,54,0.08)' : 'var(--bg-elevated)', border: `1px solid ${active ? 'var(--accent-orange)' : 'var(--border)'}` }}>
                    <input type="radio" name="integration" value={opt.value} checked={active} onChange={e => set('integrationLevel', e.target.value)} className="mt-0.5 flex-shrink-0" style={{ accentColor: 'var(--accent-orange)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: '1rem' }}>{opt.emoji}</span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{opt.label}</span>
                        <span className="text-xs font-medium" style={{ color: opt.reachColor }}>{opt.reach}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{opt.tip}</p>
                      <p className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)' }}>e.g. {opt.example}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Conversion Boosters</p>
            <label className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Include Discount Code</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tracked coupon increases conversions +25-30%</p>
              </div>
              <button type="button" onClick={() => set('hasDiscountCode', !form.hasDiscountCode)} className="w-10 h-5 rounded-full transition-all flex-shrink-0 relative" style={{ background: form.hasDiscountCode ? 'var(--accent-orange)' : 'var(--border)' }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm" style={{ left: form.hasDiscountCode ? '1.25rem' : '0.125rem' }} />
              </button>
            </label>
            {form.hasDiscountCode && (
              <Field label="Discount %">
                <NumberInput value={form.discountPercent} onChange={v => set('discountPercent', v)} min={5} max={50} step={5} />
              </Field>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 pt-4 pb-2 -mx-6 px-6" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ background: loading ? 'var(--bg-elevated)' : 'var(--accent-orange)', color: loading ? 'var(--text-muted)' : '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Generating Report...' : 'Generate ROI Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
