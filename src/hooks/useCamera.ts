import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CameraDevice,
  CameraError,
  CaptureOptions,
  CapturedPhoto,
  UseCameraOptions,
  UseCameraReturn,
} from '../types/camera.types';

/**
 * Traduce excepciones nativas de la API getUserMedia a errores tipados con mensajes en español.
 */
function mapCameraError(err: unknown): CameraError {
  if (err instanceof DOMException || (typeof err === 'object' && err !== null && 'name' in err)) {
    const errorName = (err as { name: string }).name;
    switch (errorName) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return {
          code: 'PERMISSION_DENIED',
          message:
            'Permiso de cámara denegado. Habilita el acceso en los permisos del navegador o del sistema.',
          originalError: err,
        };
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return {
          code: 'NO_CAMERA',
          message: 'No se encontró ninguna cámara de video disponible en el dispositivo.',
          originalError: err,
        };
      case 'NotReadableError':
      case 'TrackStartError':
        return {
          code: 'CAMERA_IN_USE',
          message:
            'La cámara está en uso por otra aplicación o no se pudo acceder al hardware.',
          originalError: err,
        };
      case 'OverconstrainedError':
        return {
          code: 'OVERCONSTRAINED',
          message:
            'La configuración solicitada de resolución o lente no es compatible con el dispositivo.',
          originalError: err,
        };
      default:
        break;
    }
  }

  const message =
    err instanceof Error ? err.message : 'Ocurrió un error inesperado al acceder a la cámara.';
  return {
    code: 'CAPTURE_FAILED',
    message,
    originalError: err,
  };
}

/**
 * Hook agnóstico para gestionar el ciclo de vida de la cámara, permisos, cambio de lentes y captura.
 */
export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    active = true,
    initialDeviceId,
    idealWidth = 1920,
    idealHeight = 1080,
    mirrorFrontCamera = true,
    onDeviceChange,
    onError,
  } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef<number>(0);

  // Mantenemos los callbacks en refs para evitar que re-renderizados del padre reinicien el stream
  const onDeviceChangeRef = useRef(onDeviceChange);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onDeviceChangeRef.current = onDeviceChange;
    onErrorRef.current = onError;
  }, [onDeviceChange, onError]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<CameraError | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(initialDeviceId ?? null);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(false);

  // Detiene de forma segura los tracks del hardware sin mutar estado React
  const stopPhysicalTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Detiene tracks del hardware y actualiza el estado de streaming
  const stopTracks = useCallback(() => {
    stopPhysicalTracks();
    setIsStreaming(false);
  }, [stopPhysicalTracks]);

  // Actualiza la lista de cámaras disponibles (videoinput)
  const refreshDevices = useCallback(async () => {
    if (!navigator?.mediaDevices?.enumerateDevices) return;
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => {
          const label = d.label || `Cámara ${index + 1}`;
          const lower = label.toLowerCase();
          let facingMode: CameraDevice['facingMode'] = 'unknown';
          if (lower.includes('front') || lower.includes('delantera') || lower.includes('frontal') || lower.includes('user')) {
            facingMode = 'user';
          } else if (
            lower.includes('back') ||
            lower.includes('rear') ||
            lower.includes('trasera') ||
            lower.includes('environment')
          ) {
            facingMode = 'environment';
          }
          return {
            deviceId: d.deviceId,
            label,
            facingMode,
          };
        });
      setDevices(videoDevices);
    } catch {
      // Ignorar fallos menores de enumeración
    }
  }, []);

  // Inicia la cámara garantizando resolución de condiciones de carrera
  const startCamera = useCallback(
    async (targetDeviceId?: string | null) => {
      // 1. Detener stream anterior completamente
      stopPhysicalTracks();
      setError(null);

      // 2. Verificar disponibilidad de la API (contexto seguro / soporte de navegador)
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        const err: CameraError = {
          code: 'API_NOT_AVAILABLE',
          message:
            'La cámara no está disponible en este navegador o contexto (requiere HTTPS o Chrome fuera de navegadores embebidos como Instagram/WhatsApp).',
        };
        setError(err);
        onErrorRef.current?.(err);
        return;
      }

      const requestId = ++requestIdRef.current;
      setIsLoading(true);

      const deviceToUse = targetDeviceId ?? currentDeviceId;

      // 3. Configurar constraints con 'ideal', nunca con 'exact'
      const primaryConstraints: MediaStreamConstraints = {
        audio: false,
        video: deviceToUse
          ? {
              deviceId: { ideal: deviceToUse },
              width: { ideal: idealWidth },
              height: { ideal: idealHeight },
            }
          : {
              facingMode: { ideal: 'environment' },
              width: { ideal: idealWidth },
              height: { ideal: idealHeight },
            },
      };

      let stream: MediaStream | null = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
      } catch (err) {
        // Fallback automático si falla por OverconstrainedError
        if (
          err instanceof DOMException &&
          err.name === 'OverconstrainedError' &&
          requestId === requestIdRef.current
        ) {
          try {
            const fallbackConstraints: MediaStreamConstraints = {
              audio: false,
              video: deviceToUse ? { deviceId: { ideal: deviceToUse } } : true,
            };
            stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          } catch (fallbackErr) {
            if (requestId !== requestIdRef.current) return;
            const mappedErr = mapCameraError(fallbackErr);
            setError(mappedErr);
            onErrorRef.current?.(mappedErr);
            setIsLoading(false);
            return;
          }
        } else {
          if (requestId !== requestIdRef.current) return;
          const mappedErr = mapCameraError(err);
          setError(mappedErr);
          onErrorRef.current?.(mappedErr);
          setIsLoading(false);
          return;
        }
      }

      // Si la petición ya no es la última (ej. StrictMode o cambio rápido de cámara), detener inmediatamente
      if (requestId !== requestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      // Guardar el stream en la ref (nunca en el state)
      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        const noCamErr: CameraError = {
          code: 'NO_CAMERA',
          message: 'No se detectó ningún canal de video en el dispositivo seleccionado.',
        };
        setError(noCamErr);
        onErrorRef.current?.(noCamErr);
        setIsLoading(false);
        return;
      }

      // Detectar cámara frontal por getSettings() o por el label del track
      const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};
      const actualDeviceId = settings.deviceId || deviceToUse || '';
      const trackLabel = (videoTrack.label || '').toLowerCase();
      const isFront =
        settings.facingMode === 'user' ||
        trackLabel.includes('front') ||
        trackLabel.includes('delantera') ||
        trackLabel.includes('user');

      setIsFrontCamera(isFront);
      if (actualDeviceId) {
        setCurrentDeviceId(actualDeviceId);
        onDeviceChangeRef.current?.(actualDeviceId);
      }

      // Escuchar desconexión o revocación del track
      videoTrack.onended = () => {
        if (streamRef.current === stream) {
          setIsStreaming(false);
          const endedErr: CameraError = {
            code: 'TRACK_ENDED',
            message: 'La cámara se ha desconectado o el permiso fue revocado.',
          };
          setError(endedErr);
          onErrorRef.current?.(endedErr);
        }
      };

      // Asignar al elemento <video>
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {
          // Captura silenciosa si el navegador bloquea autoplay temporalmente
        });
      }

      setIsStreaming(true);
      setIsLoading(false);

      // Enumerar cámaras DESPUÉS de haber obtenido el permiso para que los labels vengan poblados
      void refreshDevices();
    },
    [currentDeviceId, idealHeight, idealWidth, refreshDevices, stopPhysicalTracks]
  );

  // Efecto principal de ciclo de vida: montaje, cambio de active o deviceId
  useEffect(() => {
    if (!active) {
      stopPhysicalTracks();
      return;
    }

    let isCancelled = false;

    void (async () => {
      await startCamera(currentDeviceId);
      if (isCancelled) {
        stopPhysicalTracks();
      }
    })();

    return () => {
      isCancelled = true;
      stopTracks();
    };
  }, [active, currentDeviceId, startCamera, stopPhysicalTracks, stopTracks]);

  // Manejo de eventos de visibilidad de la pestaña y cierre de página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopTracks();
      } else if (document.visibilityState === 'visible' && active) {
        void startCamera(currentDeviceId);
      }
    };

    const handlePageHide = () => {
      stopTracks();
    };

    const handleDeviceChange = () => {
      void refreshDevices();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    navigator?.mediaDevices?.addEventListener('devicechange', handleDeviceChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      navigator?.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [active, currentDeviceId, refreshDevices, startCamera, stopTracks]);

  // Seleccionar un dispositivo específico
  const selectDevice = useCallback(
    async (deviceId: string) => {
      if (deviceId === currentDeviceId && isStreaming) return;
      setCurrentDeviceId(deviceId);
      await startCamera(deviceId);
    },
    [currentDeviceId, isStreaming, startCamera]
  );

  // Reintentar en caso de fallo
  const retry = useCallback(async () => {
    await startCamera(currentDeviceId);
  }, [currentDeviceId, startCamera]);

  // Capturar una foto a la resolución real del video
  const capture = useCallback(
    async (captureOpts?: CaptureOptions): Promise<CapturedPhoto> => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        const err: CameraError = {
          code: 'CAPTURE_FAILED',
          message: 'El visor de video no está listo para capturar. Espera a que cargue la imagen.',
        };
        throw err;
      }

      try {
        const canvas = document.createElement('canvas');
        let targetWidth = video.videoWidth;
        let targetHeight = video.videoHeight;

        // Escalar manteniendo proporción si se especifican límites máximos
        const maxWidth = captureOpts?.maxWidth;
        const maxHeight = captureOpts?.maxHeight;

        if (maxWidth && targetWidth > maxWidth) {
          targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
          targetWidth = maxWidth;
        }

        if (maxHeight && targetHeight > maxHeight) {
          targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
          targetHeight = maxHeight;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('No se pudo inicializar el contexto 2D del canvas.');
        }

        // La foto se dibuja SIEMPRE sin espejo para mantener la fidelidad real de la toma
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

        const mimeType = captureOpts?.mimeType || 'image/jpeg';
        const quality = captureOpts?.quality ?? 0.92;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b) resolve(b);
              else reject(new Error('No se pudo generar el archivo Blob desde el canvas.'));
            },
            mimeType,
            quality
          );
        });

        const previewUrl = URL.createObjectURL(blob);

        return {
          blob,
          previewUrl,
          width: targetWidth,
          height: targetHeight,
          mimeType,
          deviceId: currentDeviceId || '',
          capturedAt: new Date(),
        };
      } catch (err) {
        const captureErr: CameraError = {
          code: 'CAPTURE_FAILED',
          message: err instanceof Error ? err.message : 'Error inesperado durante la captura.',
          originalError: err,
        };
        throw captureErr;
      }
    },
    [currentDeviceId]
  );

  return {
    videoRef,
    isLoading,
    isStreaming,
    error,
    devices,
    currentDeviceId,
    isFrontCamera,
    isMirrored: isFrontCamera && mirrorFrontCamera,
    selectDevice,
    retry,
    capture,
    stopStream: stopTracks,
  };
}
