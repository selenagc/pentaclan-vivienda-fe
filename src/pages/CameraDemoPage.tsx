import { useEffect, useState } from 'react';
import axios from 'axios';
import { CameraCapture } from '../components/camera/CameraCapture';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { diagnosticService } from '../services/diagnosticService';
import { applicationService } from '../services/applicationService';
import { authStorage } from '../lib/authStorage';
import type { CameraError, CapturedPhoto } from '../types/camera.types';
import type { DiagnosticPhoto } from '../types/diagnostic.types';
import { DIAGNOSTIC_PHOTO_TYPE_OPTIONS } from '../constants/diagnosticPhotos';

const CATEGORY_OPTIONS = [
  { value: 'technical', label: 'Diagnóstico Técnico (Estructura, ambientes, fallas)' },
  { value: 'social', label: 'Diagnóstico Social (Hogar, familia)' },
];

/**
 * Página de demostración y pruebas para el componente <CameraCapture />.
 * Permite verificar el ciclo de vida, apagado de tracks y probar tanto la simulación
 * como la SUBIDA REAL a AWS S3 a través del backend.
 */
const CameraDemoPage = () => {
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [requireConfirmation, setRequireConfirmation] = useState<boolean>(true);
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [lastError, setLastError] = useState<CameraError | null>(null);

  // Modo de subida: 'mock' o 'real_s3'
  const [uploadMode, setUploadMode] = useState<'mock' | 'real_s3'>('real_s3');
  const [applicationIdInput, setApplicationIdInput] = useState<string>('');
  const [category, setCategory] = useState<'technical' | 'social'>('technical');
  const [photoType, setPhotoType] = useState<string>('Fachada Principal');
  const [photoDescription, setPhotoDescription] = useState<string>('');

  // Lista de postulaciones existentes cargadas desde el backend si hay sesión
  const [availableApplications, setAvailableApplications] = useState<Array<{ value: string; label: string }>>([]);
  const isLoggedIn = !!authStorage.getAccessToken();

  // Estado para la subida
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string>('');
  const [realUploadedPhoto, setRealUploadedPhoto] = useState<DiagnosticPhoto | null>(null);

  // Cargar aplicaciones de la base de datos si el usuario tiene sesión activa
  useEffect(() => {
    const token = authStorage.getAccessToken();
    if (token) {
      applicationService
        .list({ limit: 25 })
        .then((res) => {
          const apps = (res.data || []).map((app) => {
            const name = app.person
              ? `${app.person.givenNames} ${app.person.paternalSurname}`
              : 'Titular';
            return {
              value: app.id,
              label: `${name} (${app.status}) - ID: ${app.id.slice(0, 8)}...`,
            };
          });
          setAvailableApplications(apps);
          if (apps.length > 0) {
            setApplicationIdInput((prev) => prev || apps[0].value);
          }
        })
        .catch(() => {
          // Si no tiene permisos de listar o falla la petición
        });
    }
  }, []);

  const handleCapture = (photo: CapturedPhoto) => {
    if (capturedPhoto?.previewUrl) {
      URL.revokeObjectURL(capturedPhoto.previewUrl);
    }
    setCapturedPhoto(photo);
    setUploadStatus('idle');
    setUploadProgressMsg('');
    setRealUploadedPhoto(null);
  };

  const handleClearPhoto = () => {
    if (capturedPhoto?.previewUrl) {
      URL.revokeObjectURL(capturedPhoto.previewUrl);
    }
    setCapturedPhoto(null);
    setUploadStatus('idle');
    setUploadProgressMsg('');
    setRealUploadedPhoto(null);
  };

  // Simulación mock de subida
  const handleMockUpload = async () => {
    if (!capturedPhoto) return;

    setUploadStatus('uploading');
    setUploadProgressMsg('Generando FormData y calculando firma...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUploadProgressMsg('Subiendo bytes al almacenamiento simulado...');
      await new Promise((resolve) => setTimeout(resolve, 900));
      setUploadStatus('success');
      setUploadProgressMsg('¡Fotografía enviada y procesada correctamente (Simulación Mock 200 OK)!');
    } catch {
      setUploadStatus('error');
      setUploadProgressMsg('Fallo en la subida simulada.');
    }
  };

  // Subida REAL a AWS S3 mediante el backend (POST /applications/:id/diagnostic/photos)
  const handleRealS3Upload = async () => {
    if (!capturedPhoto) return;

    const targetAppId = applicationIdInput.trim();
    if (!targetAppId) {
      setUploadStatus('error');
      setUploadProgressMsg('Ingresa o selecciona un Application ID válido (UUID) para asociar la fotografía en AWS S3.');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgressMsg('Enviando archivo multipart/form-data al backend para subir a AWS S3...');

    try {
      const result = await diagnosticService.uploadPhoto(targetAppId, {
        file: capturedPhoto.blob,
        category,
        photoType,
        description: photoDescription.trim() || undefined,
        capturedAt: capturedPhoto.capturedAt,
      });

      setRealUploadedPhoto(result);
      setUploadStatus('success');
      setUploadProgressMsg('¡Fotografía subida con éxito a AWS S3 y registrada en PostgreSQL!');
    } catch (err: unknown) {
      setUploadStatus('error');
      let msg = 'Error al comunicarse con el backend/S3.';
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          msg = `Error 404: La postulación con ID "${targetAppId}" no existe en la base de datos de PostgreSQL. Asegúrate de usar el UUID de una postulación registrada.`;
        } else if (err.response?.status === 401) {
          msg = 'Error 401 (No autorizado): Debes tener sesión iniciada para subir a AWS S3. Ve a /login primero con tu usuario.';
        } else if (err.response?.status === 403) {
          msg = 'Error 403: Tu rol de usuario no tiene permisos para subir fotos diagnósticas a esta postulación.';
        } else if (err.response?.data?.message) {
          msg = String(err.response.data.message);
        } else {
          msg = err.message;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setUploadProgressMsg(msg);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demostración de Cámara Web / Móvil y AWS S3</h1>
        <p className="mt-1 text-sm text-gray-500">
          Componente reutilizable de captura sin input file. Conexión directa a AWS S3 mediante el backend.
        </p>
      </div>

      {/* Panel de Control de Ciclo de Vida */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Verificación de Ciclo de Vida y Pruebas
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Usa estos controles para comprobar que los tracks se detienen y la luz indicadora del hardware se apaga.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant={isMounted ? 'danger' : 'primary'}
            fullWidth={false}
            onClick={() => setIsMounted((prev) => !prev)}
          >
            {isMounted ? 'Desmontar Componente' : 'Montar Componente'}
          </Button>

          <Button
            variant="outline"
            fullWidth={false}
            disabled={!isMounted}
            onClick={() => setIsActive((prev) => !prev)}
          >
            {isActive ? 'Pausar (active: false)' : 'Reanudar (active: true)'}
          </Button>

          <Button
            variant="outline"
            fullWidth={false}
            onClick={() => setRequireConfirmation((prev) => !prev)}
          >
            {requireConfirmation ? 'Confirmación: Activada' : 'Confirmación: Directa (Sin revisión)'}
          </Button>
        </div>

        {/* Indicadores de estado de los controles */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isMounted ? 'bg-emerald-500' : 'bg-red-500'}`} />
            Montado: <strong>{isMounted ? 'Sí' : 'No'}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            Prop Active: <strong>{isActive ? 'true' : 'false'}</strong>
          </span>
        </div>
      </div>

      {/* Visor de Cámara */}
      {isMounted ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black">
          <CameraCapture
            active={isActive}
            requireConfirmation={requireConfirmation}
            onCapture={handleCapture}
            onError={setLastError}
            className="w-full"
          />
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm font-medium text-gray-700">El componente está desmontado</p>
          <p className="text-xs text-gray-500">
            Todos los tracks del stream han sido liberados por completo.
          </p>
        </div>
      )}

      {/* Reporte de Errores Notificados al Padre */}
      {lastError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          <p className="font-semibold">Último error reportado al callback onError:</p>
          <p className="mt-0.5">
            <strong>Código:</strong> {lastError.code}
          </p>
          <p>
            <strong>Mensaje:</strong> {lastError.message}
          </p>
        </div>
      )}

      {/* Resultado de la Captura y Envío a S3 */}
      {capturedPhoto && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Fotografía Capturada</h2>
              <p className="text-xs text-gray-500">
                La foto ha sido generada por el hook como Blob con metadatos y está lista para enviarse a S3.
              </p>
            </div>
            <Button variant="outline" fullWidth={false} onClick={handleClearPhoto}>
              Limpiar
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Vista previa de la foto */}
            <div className="flex flex-col items-center justify-center overflow-hidden rounded-xl bg-neutral-900 p-2">
              <img
                src={realUploadedPhoto?.url || capturedPhoto.previewUrl}
                alt="Foto capturada"
                className="max-h-72 w-full object-contain rounded-lg"
              />
              {realUploadedPhoto && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Visualizando URL prefirmada desde AWS S3
                </span>
              )}
            </div>

            {/* Metadatos y panel de subida */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-xs">
                <div className="flex justify-between border-b border-gray-200 pb-1.5">
                  <span className="text-gray-500">Resolución real:</span>
                  <span className="font-mono font-medium text-gray-800">
                    {capturedPhoto.width} × {capturedPhoto.height} px
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1.5">
                  <span className="text-gray-500">Peso en memoria:</span>
                  <span className="font-mono font-medium text-gray-800">
                    {(capturedPhoto.blob.size / 1024).toFixed(1)} KB (
                    {(capturedPhoto.blob.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1.5">
                  <span className="text-gray-500">Formato MIME:</span>
                  <span className="font-mono font-medium text-gray-800">{capturedPhoto.mimeType}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1.5">
                  <span className="text-gray-500">Dispositivo ID:</span>
                  <span className="max-w-[180px] truncate font-mono text-gray-800" title={capturedPhoto.deviceId}>
                    {capturedPhoto.deviceId || 'Por defecto'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Momento de captura:</span>
                  <span className="font-medium text-gray-800">
                    {capturedPhoto.capturedAt.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Selector de Modo: Real S3 vs Mock */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Destino de la Subida</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadMode('real_s3')}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                        uploadMode === 'real_s3'
                          ? 'bg-brand-primary text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      AWS S3 Real
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('mock')}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                        uploadMode === 'mock'
                          ? 'bg-brand-primary text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Mock (Simulado)
                    </button>
                  </div>
                </div>

                {uploadMode === 'real_s3' ? (
                  <div className="space-y-3">
                    {!isLoggedIn && (
                      <div className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 border border-amber-200">
                        ⚠️ <strong>Sesión no detectada:</strong> El endpoint de fotos requiere autenticación. Si la subida falla con 401, inicia sesión primero en <a href="/login" className="underline font-semibold">/login</a>.
                      </div>
                    )}

                    {availableApplications.length > 0 ? (
                      <Select
                        label="Seleccionar Postulación (Existente en Base de Datos)"
                        value={applicationIdInput}
                        onChange={(e) => setApplicationIdInput(e.target.value)}
                        options={availableApplications}
                      />
                    ) : (
                      <Input
                        label="Application ID (UUID de la postulación)"
                        value={applicationIdInput}
                        onChange={(e) => setApplicationIdInput(e.target.value)}
                        placeholder="Ej. d290f1ee-6c54-4b01-90e6-d701748f0851"
                      />
                    )}

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Select
                        label="Categoría"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as 'technical' | 'social')}
                        options={CATEGORY_OPTIONS}
                      />
                      <Select
                        label="Tipo de Foto"
                        value={photoType}
                        onChange={(e) => setPhotoType(e.target.value)}
                        options={DIAGNOSTIC_PHOTO_TYPE_OPTIONS}
                      />
                    </div>

                    <Input
                      label="Descripción (Opcional)"
                      value={photoDescription}
                      onChange={(e) => setPhotoDescription(e.target.value)}
                      placeholder="Ej. Inspección de fachada principal"
                    />

                    <div className="pt-1">
                      <Button
                        variant="primary"
                        isLoading={uploadStatus === 'uploading'}
                        disabled={uploadStatus === 'success'}
                        onClick={() => void handleRealS3Upload()}
                      >
                        {uploadStatus === 'success' ? 'Subido a AWS S3' : 'Subir a AWS S3 (Real)'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">
                      Simula la latencia y la respuesta sin conectar con un bucket ni endpoint real:
                    </p>
                    <Button
                      variant="primary"
                      isLoading={uploadStatus === 'uploading'}
                      disabled={uploadStatus === 'success'}
                      onClick={() => void handleMockUpload()}
                    >
                      {uploadStatus === 'success' ? 'Subido con éxito (Mock)' : 'Simular envío al Backend (Mock)'}
                    </Button>
                  </div>
                )}

                {/* Mensajes de resultado */}
                {uploadProgressMsg && (
                  <div
                    className={`mt-3 rounded-lg p-2.5 text-xs ${
                      uploadStatus === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : uploadStatus === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {uploadProgressMsg}
                  </div>
                )}

                {/* Datos de la foto subida a S3 */}
                {realUploadedPhoto && (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-950 space-y-1">
                    <p className="font-semibold text-emerald-900">Detalles de la imagen en S3:</p>
                    <p className="truncate font-mono text-[11px]">
                      <strong>S3 Key:</strong> {realUploadedPhoto.s3Key}
                    </p>
                    <p className="truncate font-mono text-[11px]">
                      <strong>URL S3:</strong>{' '}
                      <a
                        href={realUploadedPhoto.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-primary underline hover:text-brand-primary-dark"
                      >
                        Abrir URL firmada en nueva pestaña ↗
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraDemoPage;
