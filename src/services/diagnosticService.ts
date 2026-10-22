import { api } from '../lib/axios';
import type { DataEnvelope } from '../types/api.types';
import type {
  DiagnosticRecord,
  EvaluationQuestion,
  SocialDiagnosticInput,
  TechnicalDiagnosticInput,
} from '../types/diagnostic.types';

export const diagnosticService = {
  async getByApplicationId(applicationId: string): Promise<DiagnosticRecord | null> {
    const { data } = await api.get<DataEnvelope<DiagnosticRecord | null>>(
      `/applications/${applicationId}/diagnostic`,
    );
    return data.data;
  },

  async saveTechnical(
    applicationId: string,
    input: TechnicalDiagnosticInput,
  ): Promise<DiagnosticRecord> {
    const { data } = await api.put<DataEnvelope<DiagnosticRecord>>(
      `/applications/${applicationId}/diagnostic/technical`,
      input,
    );
    return data.data;
  },

  async saveSocial(
    applicationId: string,
    input: SocialDiagnosticInput,
  ): Promise<DiagnosticRecord> {
    const { data } = await api.put<DataEnvelope<DiagnosticRecord>>(
      `/applications/${applicationId}/diagnostic/social`,
      input,
    );
    return data.data;
  },

  async getEvaluationQuestions(): Promise<EvaluationQuestion[]> {
    const { data } = await api.get<DataEnvelope<EvaluationQuestion[]>>('/evaluation-questions');
    return data.data;
  },
};
