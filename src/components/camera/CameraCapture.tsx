import { useEffect, useState } from 'react';
import { useCamera } from '../../hooks/useCamera';
import type { CameraCaptureProps, CapturedPhoto } from '../../types/camera.types';
import { Button } from '../ui/Button';

/**
 * Componente visual reutilizable para toma de fotografías mediante cámara física (getUserMedia).
 * Diseñado específicamente para Chrome en Android y escritorio.
 */
export const CameraCapture = ({
  active = true,
  initialDeviceId,
  onCapture,
  onDeviceChange,
  onError,
  requireConfirmation = true,
  captureOptions,
  mirrorFrontCamera = true,
  className = '',
}: CameraCaptureProps) => {
  const {
    videoRef,
    isLoading,
    isStreaming,
    error,
    devices,
    currentDeviceId,
    isFrontCamera,
    isMirrored,
    selectDevice,
    retry,
    capture,
  } = useCamera({
    active,
    initialDeviceId,
    mirrorFrontCamera,
    onDeviceChange,
    onError,
  });

  const [pendingPhoto, setPendingPhoto] = useState<CapturedPhoto | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Liberar el Object URL pendiente si se descarta o si se desmonta el componente
  useEffect(() => {
    return () => {
      if (pendingPhoto?.previewUrl) {
        URL.revokeObjectURL(pendingPhoto.previewUrl);
      }
    };
  }, [pendingPhoto]);

  // Manejo del disparo de foto
  const handleTriggerCapture = async () => {
    if (!isStreaming || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await capture(captureOptions);

      if (requireConfirmation) {
        setPendingPhoto(photo);
      } else {
        onCapture(photo);
      }
    } catch {
      // El error ya es propagado o reportado por el hook
    } finally {
      setIsCapturing(false);
    }
  };

  // El usuario acepta la foto en pantalla de confirmación
  const handleConfirmPhoto = () => {
    if (!pendingPhoto) return;
    onCapture(pendingPhoto);
    setPendingPhoto(null);
  };

  // El usuario decide repetir la foto
  const handleRetakePhoto = () => {
    if (pendingPhoto) {
      URL.revokeObjectURL(pendingPhoto.previewUrl);
      setPendingPhoto(null);
    }
  };

  // Alternar rápidamente entre cámara frontal y trasera
  const handleToggleFacingMode = async () => {
    if (devices.length < 2) return;
    const targetFacing = isFrontCamera ? 'environment' : 'user';
    const oppositeDevice = devices.find((d) => d.facingMode === targetFacing);
    if (oppositeDevice) {
      await selectDevice(oppositeDevice.deviceId);
    } else {
      // Si no tienen label identificado, pasar al siguiente en la lista
      const currentIndex = devices.findIndex((d) => d.deviceId === currentDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      await selectDevice(devices[nextIndex].deviceId);
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-between overflow-hidden rounded-2xl bg-neutral-950 text-white shadow-xl ${className}`}
      style={{ minHeight: '380px' }}
    >
      {/* 1. Barra Superior: Selector de dispositivo / lentes múltiples */}
      <div className="z-10 flex w-full items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-xs font-medium tracking-wide uppercase text-neutral-300">
            {pendingPhoto ? 'Revisión de foto' : isStreaming ? 'En vivo' : 'Iniciando'}
          </span>
        </div>

        {!pendingPhoto && devices.length > 1 && (
          <div className="max-w-[200px] sm:max-w-xs">
            <select
              aria-label="Seleccionar cámara"
              value={currentDeviceId || ''}
              disabled={isLoading || !isStreaming}
              onChange={(e) => void selectDevice(e.target.value)}
              className="w-full truncate rounded-lg border border-neutral-700 bg-neutral-900/90 px-2.5 py-1 text-xs text-neutral-200 outline-none backdrop-blur transition hover:border-neutral-500 focus:border-brand-primary disabled:opacity-50"
            >
              {devices.map((device, idx) => (
                <option key={device.deviceId} value={device.deviceId} className="bg-neutral-900 text-neutral-200">
                  {device.label || `Lente / Cámara ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Área Central: Visor en Vivo o Previsualización de Foto Capturada */}
      <div className="relative flex h-full w-full flex-1 items-center justify-center overflow-hidden bg-black">
        {/* Visor de Video: object-contain para no recortar la captura real */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`h-full max-h-[70vh] w-full object-contain transition-transform duration-150 ${
            pendingPhoto ? 'hidden' : 'block'
          } ${isMirrored ? '-scale-x-100' : ''}`}
        />

        {/* Imagen Capturada (Pantalla de Confirmación) */}
        {pendingPhoto && (
          <div className="relative flex h-full max-h-[70vh] w-full items-center justify-center">
            <img
              src={pendingPhoto.previewUrl}
              alt="Foto capturada"
              className="h-full max-h-[70vh] w-full object-contain"
            />
            <div className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-mono text-neutral-300 backdrop-blur">
              {pendingPhoto.width} × {pendingPhoto.height} px
            </div>
          </div>
        )}

        {/* Indicador de Carga */}
        {isLoading && !pendingPhoto && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/75 backdrop-blur-xs">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand-primary border-t-transparent" />
            <p className="text-sm font-medium text-neutral-300">Conectando con la cámara...</p>
          </div>
        )}

        {/* Visualización de Errores con Opción de Reintento */}
        {error && !isLoading && !pendingPhoto && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-neutral-950/95">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 18h.007v.008H12V18z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Error al acceder a la cámara</h3>
            <p className="mt-1.5 max-w-sm text-xs text-neutral-400 leading-relaxed">{error.message}</p>
            <div className="mt-5">
              <Button variant="primary" fullWidth={false} onClick={() => void retry()}>
                Reintentar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Barra Inferior: Controles de Captura o Acciones de Confirmación */}
      <div className="z-10 flex w-full items-center justify-around bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 sm:p-5">
        {pendingPhoto ? (
          // Controles de Confirmación: Repetir vs Usar
          <div className="flex w-full max-w-md items-center justify-between gap-4">
            <Button
              variant="outline"
              fullWidth
              onClick={handleRetakePhoto}
              className="!text-white !border-neutral-600 hover:!border-neutral-400 hover:!bg-white/10"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              }
            >
              Repetir
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirmPhoto}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              }
            >
              Usar foto
            </Button>
          </div>
        ) : (
          // Controles de Cámara en Vivo: Botón de disparo y cambio frontal/trasero
          <div className="flex w-full items-center justify-center gap-6">
            {/* Botón secundario para alternar lente si hay varias */}
            {devices.length > 1 && (
              <button
                type="button"
                onClick={() => void handleToggleFacingMode()}
                title="Cambiar lente / cámara"
                aria-label="Cambiar lente o cámara frontal/trasera"
                disabled={isLoading || !isStreaming}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-800/80 text-white transition hover:bg-neutral-700 active:scale-95 disabled:opacity-40"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            )}

            {/* Botón de Disparo Principal */}
            <button
              type="button"
              onClick={() => void handleTriggerCapture()}
              disabled={isLoading || !isStreaming || isCapturing}
              aria-label="Tomar foto"
              className="group relative flex h-18 w-18 items-center justify-center rounded-full border-4 border-white bg-transparent transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="block h-14 w-14 rounded-full bg-white transition group-hover:scale-95 group-active:scale-90 group-hover:bg-neutral-200" />
            </button>

            {/* Espaciador simétrico cuando hay botón de alternar */}
            {devices.length > 1 && <div className="h-11 w-11" />}
          </div>
        )}
      </div>
    </div>
  );
};
