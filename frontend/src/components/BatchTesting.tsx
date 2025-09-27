'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, TestTube, Microscope, FileText, Clock } from 'lucide-react';

interface TestResult {
  testId: string;
  testName: string;
  result: 'pass' | 'fail' | 'pending';
  date: string;
  laboratory: string;
  labAddress: string;
}

interface BatchTestingProps {
  tokenId: string;
  batchId: string;
  manufacturerName: string;
}

const BatchTesting: React.FC<BatchTestingProps> = ({ tokenId, batchId, manufacturerName }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      testId: 'PURITY-001',
      testName: 'Purity Analysis',
      result: 'pending',
      date: '',
      laboratory: '',
      labAddress: ''
    },
    {
      testId: 'POTENCY-001', 
      testName: 'Potency Testing',
      result: 'pending',
      date: '',
      laboratory: '',
      labAddress: ''
    },
    {
      testId: 'STERILITY-001',
      testName: 'Sterility Test',
      result: 'pending',
      date: '',
      laboratory: '',
      labAddress: ''
    },
    {
      testId: 'CONTAMINATION-001',
      testName: 'Contamination Screen',
      result: 'pending',
      date: '',
      laboratory: '',
      labAddress: ''
    }
  ]);

  const handleSubmitTestResult = async (testId: string, passed: boolean) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/laboratory/submit-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tokenId: tokenId,
          testId: testId,
          passed: passed,
          laboratory: 'PharmaLab Testing Center',
          labAddress: '0x742d35cc6639c0532feb32da7c1c0d7bb6de1f7f'
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update local state
        setTestResults(prev => prev.map(test => 
          test.testId === testId 
            ? {
                ...test,
                result: passed ? 'pass' : 'fail',
                date: new Date().toLocaleDateString(),
                laboratory: 'PharmaLab Testing Center',
                labAddress: '0x742d35cc6639c0532feb32da7c1c0d7bb6de1f7f'
              }
            : test
        ));

        alert(`Test result submitted successfully! Transaction: ${result.transactionHash}`);
      } else {
        throw new Error('Failed to submit test result');
      }
    } catch (error) {
      console.error('Error submitting test result:', error);
      alert('Error submitting test result. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (result: string) => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (result: string) => {
    switch (result) {
      case 'pass':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    }
  };

  const allTestsCompleted = testResults.every(test => test.result !== 'pending');
  const allTestsPassed = testResults.every(test => test.result === 'pass');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <TestTube className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Laboratory Testing Center</h1>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Batch Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">Token ID:</span>
              <p className="text-blue-900">{tokenId}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Batch ID:</span>
              <p className="text-blue-900">{batchId}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Manufacturer:</span>
              <p className="text-blue-900">{manufacturerName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      {allTestsCompleted && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          allTestsPassed 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-center">
            {allTestsPassed ? (
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
            )}
            <div>
              <h3 className={`text-lg font-semibold ${
                allTestsPassed ? 'text-green-800' : 'text-red-800'
              }`}>
                {allTestsPassed ? 'All Tests Passed ✓' : 'Some Tests Failed ✗'}
              </h3>
              <p className={`text-sm ${
                allTestsPassed ? 'text-green-700' : 'text-red-700'
              }`}>
                {allTestsPassed 
                  ? 'Batch approved for distribution'
                  : 'Batch requires review before distribution'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h3>
        
        {testResults.map((test) => (
          <div key={test.testId} className={`p-4 rounded-lg border-2 ${getStatusColor(test.result)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Microscope className="h-5 w-5 mr-3" />
                <div>
                  <h4 className="font-semibold">{test.testName}</h4>
                  <p className="text-sm opacity-75">Test ID: {test.testId}</p>
                  {test.date && (
                    <p className="text-sm opacity-75">Tested: {test.date}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.result)}
                
                {test.result === 'pending' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleSubmitTestResult(test.testId, true)}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                    >
                      Pass
                    </button>
                    <button
                      onClick={() => handleSubmitTestResult(test.testId, false)}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                    >
                      Fail
                    </button>
                  </div>
                )}
                
                {test.result !== 'pending' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {test.result}
                  </span>
                )}
              </div>
            </div>
            
            {test.laboratory && (
              <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Tested by: {test.laboratory} ({test.labAddress.slice(0, 8)}...)
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Laboratory Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Laboratory Information</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p><span className="font-medium">Name:</span> PharmaLab Testing Center</p>
          <p><span className="font-medium">License:</span> LAB-2025-001</p>
          <p><span className="font-medium">Certification:</span> ISO 17025:2017</p>
          <p><span className="font-medium">Wallet Address:</span> 0x742d35cc6639c0532feb32da7c1c0d7bb6de1f7f</p>
        </div>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span>Submitting test result to blockchain...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchTesting;