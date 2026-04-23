import React, { useRef } from 'react';
import { X, Download } from 'lucide-react';
import ExecutiveSummary from './ExecutiveSummary.jsx';
import ScoreCard from './ScoreCard.jsx';
import ReachSection from './ReachSection.jsx';
import ConversionFunnel from './ConversionFunnel.jsx';
import ScenarioCards from './ScenarioCards.jsx';
import RiskFactors from './RiskFactors.jsx';
import Recommendations from './Recommendations.jsx';

const SCORE_META = [
  { key: 'engagement', name: 'Engagement',  weight: 0.25 },
  { key: 'audience',   name: 'Audience',    weight: 0.20 },
  { key: 'affluence',  name: 'Affluence',   weight: 0.15 },
  { key: 'affinity',   name: 'Affinity',    weight: 0.25 },
  { key: 'content',    name: 'Content',     weight: 0.15 },
];

export default function ROIReport({ report, onClose }) {
  const scrollRef = useRef(null);

  if (!report) return null;
  const { executiveSummary, scores, reach, conversion, risks, recommendations } = report;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="h-full overflow-y-auto" ref={scrollRef}>
        <div className="min-h-full flex flex-col">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>ROI Prediction Report</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{report.influencer?.username} × Lenskart · {new Date(report.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                <X size={13} /> Close
              </button>
            </div>
          </div>

          {/* Report body */}
          <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
            {/* 1. Executive Summary */}
            <ExecutiveSummary summary={executiveSummary} />

            {/* 2. Score cards */}
            <div>
              <h3 className="font-display font-semibold text-base mb-3" style={{ color: 'var(--text-primary)' }}>Score Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SCORE_META.map(({ key, name, weight }) => {
                  const s = scores?.[key];
                  if (!s) return null;
                  return (
                    <ScoreCard
                      key={key}
                      name={name}
                      score={s.overall}
                      grade={s.grade}
                      label={s.label}
                      breakdown={s.breakdown}
                      insights={s.insights}
                      weight={weight}
                    />
                  );
                })}
              </div>
            </div>

            {/* 3. Reach */}
            <ReachSection reach={reach} />

            {/* 4. Funnel */}
            <ConversionFunnel funnel={conversion?.funnel} conversionRates={conversion?.conversionRates} />

            {/* 5. Scenarios + financial summary */}
            <ScenarioCards conversion={conversion} />

            {/* 6. Risk factors */}
            <RiskFactors risks={risks} />

            {/* 7. Recommendations */}
            <Recommendations recommendations={recommendations} />

            {/* Footer */}
            <p className="text-center text-xs pb-6" style={{ color: 'var(--text-muted)' }}>
              Generated {new Date(report.generatedAt).toLocaleString('en-IN')} · Based on available Instagram data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
