
import React from 'react';
import { useParams } from 'react-router-dom';
import SystemValidationDashboard from '@/components/SystemValidationDashboard';

const SystemValidation = () => {
  const { meetingId } = useParams();

  if (!meetingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Missing Meeting ID
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Please provide a meeting ID to run system validation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <SystemValidationDashboard meetingId={meetingId} />
    </div>
  );
};

export default SystemValidation;
