/**
 * Tipos y contratos para el módulo de captura de cámara.
 */

export type CameraErrorCode =
  /** getUserMedia no está disponible (contexto inseguro HTTP, navegador in-app como WhatsApp/Instagram). */
  | 'API_NOT_AVAILABLE'
  /** El usuario denegó el permiso de la cámara o fue bloqueado por directiva. */
  | 'PERMISSION_DENIED'
  /** No se encontró ningún dispositivo de entrada de video. */
  | 'NO_CAMERA'
  /** La cámara está ocupada por otra app o no se pudo leer el hardware. */
  | 'CAMERA_IN_USE'
  /** Las restricciones solicitadas no son soportadas (tras intentar fallback). */
  | 'OVERCONSTRAINED'
  /** El track de video finalizó inesperadamente (desconexión o permiso revocado en caliente). */
  | 'TRACK_ENDED'
  /** Error al capturar el fotograma o generar el Blob. */
  | 'CAPTURE_FAILED';

export interface CameraError {
  code: CameraErrorCode;
  message: string;
  originalError?: unknown;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
  facingMode?: 'user' | 'environment' | 'unknown';
}

export interface CapturedPhoto {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  mimeType: string;
  deviceId: string;
  capturedAt: Date;
}

export interface CaptureOptions {
  /** MIME type de salida. Por defecto 'image/jpeg'. */
  mimeType?: string;
  /** Calidad de compresión (0 a 1). Por defecto 0.92. */
  quality?: number;
  /** Ancho máximo en píxeles. Si la imagen es mayor, se escala proporcionalmente. */
  maxWidth?: number;
  /** Alto máximo en píxeles. Si la imagen es mayor, se escala proporcionalmente. */
  maxHeight?: number;
}

export interface UseCameraOptions {
  /** Si la cámara debe estar activa transmitiendo video. Por defecto true. */
  active?: boolean;
  /** ID del dispositivo inicial deseado. Si no se pasa, solicita cámara trasera ('environment'). */
  initialDeviceId?: string;
  /** Ancho ideal para la restricción de video. Por defecto 1920. */
  idealWidth?: number;
  /** Alto ideal para la restricción de video. Por defecto 1080. */
  idealHeight?: number;
  /** Si debe espejar el visor cuando la cámara activa sea frontal. Por defecto true. */
  mirrorFrontCamera?: boolean;
  /** Callback opcional notificado cuando cambia el dispositivo en uso. */
  onDeviceChange?: (deviceId: string) => void;
  /** Callback opcional notificado cuando ocurre un error de cámara. */
  onError?: (error: CameraError) => void;
}

export interface UseCameraReturn {
  /** Ref que debe asociarse al elemento <video>. */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Si está en proceso de solicitar stream o enumerar dispositivos. */
  isLoading: boolean;
  /** Si el stream está activo y reproduciéndose en el visor. */
  isStreaming: boolean;
  /** Error actual si ocurrió alguno, null en caso contrario. */
  error: CameraError | null;
  /** Lista de dispositivos de video disponibles. */
  devices: CameraDevice[];
  /** ID del dispositivo en uso actualmente. */
  currentDeviceId: string | null;
  /** Indica si la cámara actual es frontal. */
  isFrontCamera: boolean;
  /** Indica si el visor debe verse en espejo según configuración y cámara activa. */
  isMirrored: boolean;
  /** Selecciona una cámara por su deviceId y reabre el stream. */
  selectDevice: (deviceId: string) => Promise<void>;
  /** Reintenta inicializar la cámara. */
  retry: () => Promise<void>;
  /** Captura una fotografía a la resolución nativa del stream. */
  capture: (options?: CaptureOptions) => Promise<CapturedPhoto>;
  /** Detiene de forma síncrona todos los tracks de la cámara activa. */
  stopStream: () => void;
}

export interface CameraCaptureProps {
  /** Si la cámara está activa. Si es false, apaga los tracks. Por defecto true. */
  active?: boolean;
  /** ID de la cámara inicial. */
  initialDeviceId?: string;
  /** Invocado cuando el usuario confirma o toma una captura. */
  onCapture: (photo: CapturedPhoto) => void;
  /** Callback opcional al cambiar de dispositivo. */
  onDeviceChange?: (deviceId: string) => void;
  /** Callback opcional de error. */
  onError?: (error: CameraError) => void;
  /** Muestra pantalla de previsualización ("Usar" / "Repetir") antes de llamar onCapture. Por defecto true. */
  requireConfirmation?: boolean;
  /** Configuración de formato, calidad y dimensiones de la captura. */
  captureOptions?: CaptureOptions;
  /** Si se debe espejar el visor en cámara frontal. Por defecto true. */
  mirrorFrontCamera?: boolean;
  /** Clases CSS adicionales para el contenedor principal. */
  className?: string;
}
