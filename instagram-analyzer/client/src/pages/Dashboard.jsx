import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import Layout from '../components/Layout.jsx';
import LoadingState, { ProfileSkeleton, MetricsSkeleton, ChartSkeleton, CardGridSkeleton } from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import useProfile from '../hooks/useProfile.js';
import useMedia from '../hooks/useMedia.js';
import useAnalysis from '../hooks/useAnalysis.js';

import ProfileCard from '../sections/ProfileCard.jsx';
import KeyMetrics from '../sections/KeyMetrics.jsx';
import PostTypeBreakdown from '../sections/PostTypeBreakdown.jsx';
import EngagementAnalytics from '../sections/EngagementAnalytics.jsx';
import VVIPNetwork from '../sections/VVIPNetwork.jsx';
import HashtagAnalysis from '../sections/HashtagAnalysis.jsx';
import BrandCollabs from '../sections/BrandCollabs.jsx';
import TopPosts from '../sections/TopPosts.jsx';
import IndustryBreakdown from '../sections/IndustryBreakdown.jsx';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'network', label: 'Network & VVIPs' },
  { id: 'content', label: 'Content & Tags' },
  { id: 'brands', label: 'Brand Collabs' },
];

export default function Dashboard() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useProfile(username);
  const { data: media, loading: mediaLoading, error: mediaError } = useMedia(username, 50);
  const { data: analysis, loading: analysisLoading, analyze } = useAnalysis();

  // Trigger AI analysis once we have media data
  useEffect(() => {
    if (media?.posts && !analysis && !analysisLoading) {
      analyze(username, media.posts);
    }
  }, [media?.posts, username]);

  const demoMode = profile?.demoMode || media?.demoMode || analysis?.demoMode;

  if (profileError) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto mt-16">
          <ErrorState
            error={profileError}
            onRetry={refetchProfile}
          />
          <button
            onClick={() => navigate('/')}
            className="mt-4 flex items-center gap-2 text-sm mx-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={14} /> Back to search
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout demoMode={demoMode}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={13} /> Home
        </button>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>@{username}</span>
      </div>

      {/* Profile + metrics (always visible) */}
      <div className="space-y-4 mb-6">
        {profileLoading ? (
          <><ProfileSkeleton /><MetricsSkeleton /></>
        ) : profile ? (
          <><ProfileCard profile={profile} /><KeyMetrics profile={profile} /></>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'tab-active' : ''}`}
            style={{ color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {mediaLoading ? <ChartSkeleton /> : media ? (
              <PostTypeBreakdown postTypes={media.postTypes} />
            ) : null}
            {mediaLoading ? <ChartSkeleton height="h-72" /> : media ? (
              <EngagementAnalytics trends={media.engagementTrends} postTypes={media.postTypes} />
            ) : null}
          </>
        )}

        {activeTab === 'engagement' && (
          <>
            {mediaLoading ? <ChartSkeleton height="h-72" /> : media ? (
              <EngagementAnalytics trends={media.engagementTrends} postTypes={media.postTypes} fullView />
            ) : null}
            {mediaLoading ? <ChartSkeleton /> : media ? (
              <TopPosts posts={media.topPosts} />
            ) : null}
          </>
        )}

        {activeTab === 'network' && (
          <>
            {analysisLoading ? <CardGridSkeleton count={6} /> : analysis ? (
              <VVIPNetwork following={analysis.vvipFollowing} followers={analysis.vvipFollowers} />
            ) : (
              <LoadingState message="Running AI network analysis..." />
            )}
          </>
        )}

        {activeTab === 'content' && (
          <>
            {mediaLoading ? <ChartSkeleton /> : media ? (
              <HashtagAnalysis hashtags={media.hashtags} />
            ) : null}
            {mediaLoading ? <ChartSkeleton /> : media ? (
              <TopPosts posts={media.topPosts} />
            ) : null}
          </>
        )}

        {activeTab === 'brands' && (
          <>
            {analysisLoading ? <CardGridSkeleton count={4} /> : analysis ? (
              <>
                <BrandCollabs brands={analysis.brands} />
                <IndustryBreakdown brands={analysis.brands} />
              </>
            ) : (
              <LoadingState message="Running AI brand analysis..." />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
