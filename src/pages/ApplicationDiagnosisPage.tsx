import { useState, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import { useApplicationOutlet } from '../components/applications/applicationOutlet';
import { useAuth } from '../hooks/useAuth';
import { diagnosticService } from '../services/diagnosticService';
import { SocialDiagnosisForm } from '../components/diagnostics/SocialDiagnosisForm';
import { TechnicalDiagnosisForm } from '../components/diagnostics/TechnicalDiagnosisForm';
import type { DiagnosticRecord } from '../types/diagnostic.types';

interface ApplicationDiagnosisPageProps {
  kind: 'social' | 'technical';
}

export const ApplicationDiagnosisPage = ({ kind }: ApplicationDiagnosisPageProps) => {
  const { application } = useApplicationOutlet();
  const { user } = useAuth();

  const [diagnosticRecord, setDiagnosticRecord] = useState<DiagnosticRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchRecord = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await diagnosticService.getByApplicationId(application.id);
      setDiagnosticRecord(data);
    } catch (err: any) {
      setFetchError(err?.response?.data?.message || err?.message || 'Error al cargar la ficha de diagnóstico.');
    } finally {
      setIsLoading(false);
    }
  }, [application.id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  // Roles y permisos
  const isRejected = application.status === 'rejected';
  const role = user?.role;

  const canEdit = !isRejected && (
    role === 'admin' ||
    (kind === 'social' && role === 'social_lead') ||
    (kind === 'technical' && role === 'technical_lead')
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <svg className="h-5 w-5 animate-spin text-brand-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando ficha de diagnóstico...
        </div>
      </div>
    );
  }

  if (fetchError) {
    return <Alert severity="error">{fetchError}</Alert>;
  }

  return (
    <div className="space-y-4">
      {isRejected && (
        <Alert severity="warning">
          Esta postulación se encuentra rechazada. La ficha de diagnóstico se muestra en modo solo lectura.
        </Alert>
      )}

      {kind === 'social' ? (
        <SocialDiagnosisForm
          applicationId={application.id}
          defaultFormNo={diagnosticRecord?.formNo ?? application.formNo ?? null}
          applicant={application.person}
          initialRecord={diagnosticRecord}
          canEdit={canEdit}
          onSaveSuccess={(updated) => setDiagnosticRecord(updated)}
        />
      ) : (
        <TechnicalDiagnosisForm
          applicationId={application.id}
          defaultFormNo={diagnosticRecord?.formNo ?? application.formNo ?? null}
          initialRecord={diagnosticRecord}
          canEdit={canEdit}
          onSaveSuccess={(updated) => setDiagnosticRecord(updated)}
        />
      )}
    </div>
  );
};

export default ApplicationDiagnosisPage;
