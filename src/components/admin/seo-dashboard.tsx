'use client';

import { submitSitemapAction } from '@/actions/seo/submit-sitemap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  RefreshCw,
  Send,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SEOData {
  status: {
    lastSubmission?: string;
    submissionCount: number;
    successRate: number;
    searchEngines: Record<string, any>;
    sitemapGenerated: string;
    indexedPages: number;
    crawlErrors: number;
  };
  health: {
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
    recommendations: string[];
    score: number;
  };
  metrics: {
    submissionFrequency: number;
    averageResponseTime: number;
    lastWeekSubmissions: number;
    successTrend: 'improving' | 'stable' | 'declining';
    topPerformingPages: Array<{
      url: string;
      lastIndexed: string;
      indexStatus: 'indexed' | 'pending' | 'error';
    }>;
  };
  automation: {
    triggers: Array<{
      id: string;
      name: string;
      description: string;
      enabled: boolean;
      lastRun?: string;
      nextRun?: string;
      interval: number;
    }>;
    stats: {
      totalTriggers: number;
      activeTriggers: number;
      totalLogs: number;
      successRate: number;
      last24hActivity: number;
    };
  };
}

export default function SEODashboard() {
  const [data, setData] = useState<SEOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchSEOData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seo/status');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to load SEO data');
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error);
      toast.error('Error loading SEO data');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmission = async () => {
    try {
      setSubmitting(true);
      const result = await submitSitemapAction({ force: true });

      if (result.success) {
        toast.success('Sitemap submitted successfully!');
        await fetchSEOData(); // 刷新数据
      } else {
        toast.error(`Submission failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Manual submission error:', error);
      toast.error('Error submitting sitemap');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSEOData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading SEO data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center h-96 flex items-center justify-center">
        <p>Failed to load SEO data</p>
      </div>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your SEO performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSEOData} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button onClick={handleManualSubmission} disabled={submitting}>
            <Send
              className={`h-4 w-4 mr-2 ${submitting ? 'animate-pulse' : ''}`}
            />
            {submitting ? 'Submitting...' : 'Submit Sitemap'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              SEO Health Score
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor(data.health.score)}>
                {data.health.score}%
              </span>
            </div>
            <Badge className={getHealthColor(data.health.status)}>
              {data.health.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.status.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.status.submissionCount} total submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indexed Pages</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.status.indexedPages}</div>
            <p className="text-xs text-muted-foreground">
              {data.status.crawlErrors} crawl errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Triggers
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.automation.stats.activeTriggers}/
              {data.automation.stats.totalTriggers}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.automation.stats.last24hActivity} activities in 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search-engines">Search Engines</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="health">Health Check</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Pages</CardTitle>
                <CardDescription>Recently indexed pages</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {data.metrics.topPerformingPages.map((page, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate max-w-xs">
                            {page.url}
                          </span>
                        </div>
                        <Badge
                          variant={
                            page.indexStatus === 'indexed'
                              ? 'default'
                              : page.indexStatus === 'pending'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {page.indexStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Recent performance data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Submission Frequency</span>
                    <span className="text-sm font-medium">
                      {data.metrics.submissionFrequency}/day
                    </span>
                  </div>
                  <Progress
                    value={Math.min(data.metrics.submissionFrequency * 20, 100)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="text-sm font-medium">
                      {data.metrics.averageResponseTime}ms
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      (3000 - data.metrics.averageResponseTime) / 30,
                      100
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Success Trend</span>
                    <Badge
                      variant={
                        data.metrics.successTrend === 'improving'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {data.metrics.successTrend}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search-engines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Status</CardTitle>
              <CardDescription>
                Submission status for each search engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.status.searchEngines).map(
                  ([engine, status]: [string, any]) => (
                    <div
                      key={engine}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium capitalize">{engine}</p>
                          {status.lastSubmission && (
                            <p className="text-sm text-muted-foreground">
                              Last:{' '}
                              {new Date(status.lastSubmission).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            status.successCount > status.failCount
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {status.successCount}/
                          {status.successCount + status.failCount}
                        </Badge>
                        {status.lastError && (
                          <AlertCircle
                            className="h-4 w-4 text-red-500"
                            title={status.lastError}
                          />
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Triggers</CardTitle>
              <CardDescription>
                Active automation rules and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.automation.triggers.map((trigger) => (
                  <div
                    key={trigger.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{trigger.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {trigger.description}
                        </p>
                        {trigger.nextRun && (
                          <p className="text-xs text-muted-foreground">
                            Next run:{' '}
                            {new Date(trigger.nextRun).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={trigger.enabled ? 'default' : 'secondary'}
                      >
                        {trigger.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Issues</CardTitle>
                <CardDescription>
                  Detected issues that need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.health.issues.length > 0 ? (
                  <div className="space-y-2">
                    {data.health.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 p-2 rounded-lg bg-red-50"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <span className="text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 p-4 rounded-lg bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-700">
                      No issues detected
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Suggestions to improve SEO performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.health.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 p-2 rounded-lg bg-blue-50"
                    >
                      <BarChart3 className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
