import { api } from '../lib/axios';
import type { DataEnvelope } from '../types/api.types';
import type {
  DiagnosticPhoto,
  DiagnosticRecord,
  EvaluationQuestion,
  SocialDiagnosticInput,
  TechnicalDiagnosticInput,
  UploadPhotoPayload,
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

  /**
   * Sube una fotografía directamente a AWS S3 y la asocia al diagnóstico de la postulación.
   */
  async uploadPhoto(applicationId: string, payload: UploadPhotoPayload): Promise<DiagnosticPhoto> {
    const formData = new FormData();
    formData.append('image', payload.file, `photo_${Date.now()}.jpg`);
    formData.append('category', payload.category);
    formData.append('photoType', payload.photoType);

    if (payload.capturedAt) {
      const isoDate =
        payload.capturedAt instanceof Date
          ? payload.capturedAt.toISOString()
          : new Date(payload.capturedAt).toISOString();
      formData.append('capturedAt', isoDate);
    }
    if (payload.captureLatitude !== undefined && payload.captureLatitude !== null) {
      formData.append('captureLatitude', String(payload.captureLatitude));
    }
    if (payload.captureLongitude !== undefined && payload.captureLongitude !== null) {
      formData.append('captureLongitude', String(payload.captureLongitude));
    }
    if (payload.description) {
      formData.append('description', payload.description);
    }

    const { data } = await api.post<DataEnvelope<DiagnosticPhoto>>(
      `/applications/${applicationId}/diagnostic/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data.data;
  },

  /**
   * Obtiene la lista de fotografías del diagnóstico con URLs prefirmadas de lectura de S3.
   */
  async listPhotos(applicationId: string, category?: 'technical' | 'social'): Promise<DiagnosticPhoto[]> {
    const { data } = await api.get<DataEnvelope<DiagnosticPhoto[]>>(
      `/applications/${applicationId}/diagnostic/photos`,
      { params: category ? { category } : undefined },
    );
    return data.data;
  },

  /**
   * Elimina una fotografía del registro en PostgreSQL y del bucket S3.
   */
  async deletePhoto(applicationId: string, photoId: number): Promise<void> {
    await api.delete(`/applications/${applicationId}/diagnostic/photos/${photoId}`);
  },
};
