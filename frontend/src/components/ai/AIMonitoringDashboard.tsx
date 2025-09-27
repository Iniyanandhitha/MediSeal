'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, AlertTriangle, TrendingUp, Shield, Zap, Eye } from 'lucide-react';

interface AIInsights {
  currentAnalysis: {
    packagesMonitored: number;
    anomaliesDetected: number;
    highRiskPackages: number;
    predictionsGenerated: number;
  };
  recentAlerts: Array<{
    type: string;
    severity: string;
    timestamp: string;
    tokenId: string;
  }>;
  systemMetrics: {
    averageProcessingTime: string;
    predictionAccuracy: string;
    falsePositiveRate: string;
    uptime: string;
  };
  optimizationSuggestions: string[];
}

export default function AIMonitoringDashboard() {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAIInsights();
    const interval = setInterval(fetchAIInsights, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAIInsights = async () => {
    try {
      const response = await fetch('http://localhost:3004/api/ai/insights');
      if (!response.ok) {
        throw new Error('Failed to fetch AI insights');
      }
      const data = await response.json();
      setInsights(data.insights);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI insights');
      console.error('Error fetching AI insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAlertType = (type: string) => {
    return type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 animate-pulse text-blue-600" />
          <span className="text-lg font-medium">Loading AI Insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>AI Service Unavailable: {error}</span>
          </div>
          <Button 
            onClick={fetchAIInsights} 
            variant="outline" 
            className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
          >
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 pb-4">AI Monitoring Dashboard</h1>
            <p className="text-gray-600">Real-time intelligent supply chain analysis</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          AI Active
        </Badge>
      </div>

      {/* Current Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Packages Monitored</p>
                <p className="text-2xl font-bold text-gray-900">{insights.currentAnalysis.packagesMonitored.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anomalies Detected</p>
                <p className="text-2xl font-bold text-orange-600">{insights.currentAnalysis.anomaliesDetected}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Packages</p>
                <p className="text-2xl font-bold text-red-600">{insights.currentAnalysis.highRiskPackages}</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Predictions Generated</p>
                <p className="text-2xl font-bold text-green-600">{insights.currentAnalysis.predictionsGenerated.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Recent AI Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.recentAlerts.length > 0 ? (
                insights.recentAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="text-sm font-medium">{formatAlertType(alert.type)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Token #{alert.tokenId} • {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent alerts</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span>AI Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Processing Time</span>
                <span className="font-semibold text-green-600">{insights.systemMetrics.averageProcessingTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prediction Accuracy</span>
                <span className="font-semibold text-blue-600">{insights.systemMetrics.predictionAccuracy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">False Positive Rate</span>
                <span className="font-semibold text-orange-600">{insights.systemMetrics.falsePositiveRate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Uptime</span>
                <span className="font-semibold text-green-600">{insights.systemMetrics.uptime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>AI Optimization Suggestions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.optimizationSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg bg-purple-50 border-purple-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-purple-800">{suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button 
          onClick={() => window.open('http://localhost:3004', '_blank')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Brain className="w-4 h-4 mr-2" />
          Open AI Service Console
        </Button>
        <Button 
          onClick={fetchAIInsights}
          variant="outline"
        >
          Refresh Insights
        </Button>
      </div>
    </div>
  );
}