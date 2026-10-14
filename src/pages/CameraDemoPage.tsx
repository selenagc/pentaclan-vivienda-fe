import { useState } from 'react';
import { CameraCapture } from '../components/camera/CameraCapture';
import { Button } from '../components/ui/Button';
import type { CameraError, CapturedPhoto } from '../types/camera.types';

/**
 * Página de demostración y pruebas para el componente <CameraCapture />.
 * Permite verificar el ciclo de vida, apagado de tracks y simular el upload al backend.
 */
const CameraDemoPage = () => {
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [requireConfirmation, setRequireConfirmation] = useState<boolean>(true);
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [lastError, setLastError] = useState<CameraError | null>(null);

  // Estado para la simulación de subida (responsabilidad exclusiva del padre)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string>('');

  const handleCapture = (photo: CapturedPhoto) => {
    // Si ya había una foto previa, liberamos su URL
    if (capturedPhoto?.previewUrl) {
      URL.revokeObjectURL(capturedPhoto.previewUrl);
    }
    setCapturedPhoto(photo);
    setUploadStatus('idle');
    setUploadProgressMsg('');
  };

  const handleClearPhoto = () => {
    if (capturedPhoto?.previewUrl) {
      URL.revokeObjectURL(capturedPhoto.previewUrl);
    }
    setCapturedPhoto(null);
    setUploadStatus('idle');
    setUploadProgressMsg('');
  };

  // Simulación mock de envío de la foto capturada al backend (S3 / API)
  const handleMockUpload = async () => {
    if (!capturedPhoto) return;

    setUploadStatus('uploading');
    setUploadProgressMsg('Generando FormData y calculando firma...');

    try {
      // 1. Crear el objeto FormData que normalmente recibiría el backend
      const formData = new FormData();
      formData.append('photo', capturedPhoto.blob, `foto_${Date.now()}.jpg`);
      formData.append('capturedAt', capturedPhoto.capturedAt.toISOString());
      formData.append('deviceId', capturedPhoto.deviceId);
      formData.append('width', String(capturedPhoto.width));
      formData.append('height', String(capturedPhoto.height));

      // 2. Simulación de latencia de red
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUploadProgressMsg('Subiendo bytes al almacenamiento simulado (S3)...');

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUploadStatus('success');
      setUploadProgressMsg('¡Fotografía enviada y procesada correctamente (Mock 200 OK)!');
    } catch {
      setUploadStatus('error');
      setUploadProgressMsg('Fallo en la subida simulada.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demostración de Cámara Web / Móvil</h1>
        <p className="mt-1 text-sm text-gray-500">
          Componente reutilizable de captura sin input file. Diseñado para Chrome en Android y escritorio.
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

      {/* Resultado de la Captura y Simulación de Subida */}
      {capturedPhoto && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Fotografía Capturada</h2>
              <p className="text-xs text-gray-500">
                La foto ha sido entregada al padre como Blob con metadatos completos.
              </p>
            </div>
            <Button variant="outline" fullWidth={false} onClick={handleClearPhoto}>
              Limpiar
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Vista previa de la foto */}
            <div className="flex items-center justify-center overflow-hidden rounded-xl bg-neutral-900 p-2">
              <img
                src={capturedPhoto.previewUrl}
                alt="Foto entregada al padre"
                className="max-h-72 w-full object-contain rounded-lg"
              />
            </div>

            {/* Metadatos y simulación de upload */}
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

              {/* Simulación de subida */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold text-gray-700">Simulación de Envío al Backend</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  El componente no sabe nada de endpoints ni S3. El padre gestiona el upload:
                </p>

                <div className="mt-3">
                  <Button
                    variant="primary"
                    isLoading={uploadStatus === 'uploading'}
                    disabled={uploadStatus === 'success'}
                    onClick={() => void handleMockUpload()}
                  >
                    {uploadStatus === 'success' ? 'Subido con éxito' : 'Simular envío al Backend (Mock)'}
                  </Button>
                </div>

                {uploadProgressMsg && (
                  <div
                    className={`mt-2.5 rounded-lg p-2.5 text-xs ${
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraDemoPage;
