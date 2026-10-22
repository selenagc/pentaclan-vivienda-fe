import { useState } from 'react';
import Alert from '@mui/material/Alert';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { CameraCapture } from '../camera/CameraCapture';
import { diagnosticService } from '../../services/diagnosticService';
import type { CapturedPhoto } from '../../types/camera.types';
import type { DiagnosticPhoto } from '../../types/diagnostic.types';

import { DIAGNOSTIC_PHOTO_TYPE_OPTIONS, SOCIAL_PHOTO_TYPE_OPTIONS } from '../../constants/diagnosticPhotos';

interface DiagnosticPhotosManagerProps {
  applicationId: string;
  category?: 'technical' | 'social';
  initialPhotos?: DiagnosticPhoto[];
  canEdit?: boolean;
  onPhotosChange?: (photos: DiagnosticPhoto[]) => void;
}

/**
 * Gestor integral de fotografías diagnósticas en campo.
 * Conecta la captura en vivo mediante getUserMedia con la subida directa a AWS S3.
 */
export const DiagnosticPhotosManager = ({
  applicationId,
  category = 'technical',
  initialPhotos = [],
  canEdit = true,
  onPhotosChange,
}: DiagnosticPhotosManagerProps) => {
  const photoTypeOptions = category === 'social' ? SOCIAL_PHOTO_TYPE_OPTIONS : DIAGNOSTIC_PHOTO_TYPE_OPTIONS;

  // La ficha trae las fotos de ambos módulos: cada gestor muestra solo las de su categoría.
  const [photos, setPhotos] = useState<DiagnosticPhoto[]>(() =>
    initialPhotos.filter((p) => (p.category ?? 'technical') === category),
  );
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [selectedPhotoType, setSelectedPhotoType] = useState<string>(photoTypeOptions[0].value);
  const [description, setDescription] = useState<string>('');

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<DiagnosticPhoto | null>(null);

  // Manejo de la captura confirmada desde <CameraCapture />
  const handlePhotoCaptured = async (captured: CapturedPhoto) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    // Intentar capturar coordenadas de geolocalización de forma opcional y silenciosa
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 4000,
            enableHighAccuracy: true,
          });
        });
        latitude = Number(position.coords.latitude.toFixed(7));
        longitude = Number(position.coords.longitude.toFixed(7));
      } catch {
        // La geolocalización es opcional en campo si el satélite no tiene cobertura
      }
    }

    try {
      // Subir el archivo capturado directamente a AWS S3 a través del backend
      const uploadedPhoto = await diagnosticService.uploadPhoto(applicationId, {
        file: captured.blob,
        category,
        photoType: selectedPhotoType,
        description: description.trim() || undefined,
        capturedAt: captured.capturedAt,
        captureLatitude: latitude,
        captureLongitude: longitude,
      });

      const updatedPhotos = [...photos, uploadedPhoto];
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);

      setUploadSuccess(`Fotografía "${selectedPhotoType}" subida exitosamente.`);
      setDescription('');
      setIsCameraModalOpen(false);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : 'Fallo al subir la fotografía. Inténtalo nuevamente.';
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Eliminar fotografía de PostgreSQL y AWS S3
  const handleDeletePhoto = async (photoId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta fotografía?')) return;

    setDeletingPhotoId(photoId);
    setUploadError(null);
    try {
      await diagnosticService.deletePhoto(applicationId, photoId);
      const updatedPhotos = photos.filter((p) => p.id !== photoId);
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : 'No se pudo eliminar la fotografía.';
      setUploadError(errMsg);
    } finally {
      setDeletingPhotoId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mensajes de estado */}
      {uploadSuccess && (
        <Alert severity="success" onClose={() => setUploadSuccess(null)}>
          {uploadSuccess}
        </Alert>
      )}
      {uploadError && (
        <Alert severity="error" onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      {/* Botón de acción para abrir la cámara */}
      {canEdit && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/75 p-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-800">Captura de Fotografía en Vivo</h4>
            <p className="text-xs text-gray-500">
              Toma fotografías directas con la cámara del dispositivo y súbelas al almacenamiento seguro.
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth={false}
            onClick={() => {
              setUploadError(null);
              setIsCameraModalOpen(true);
            }}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                />
              </svg>
            }
          >
            Tomar Fotografía con Cámara
          </Button>
        </div>
      )}

      {/* Galería de Fotografías subidas a AWS S3 */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 py-10 px-4 text-center">
          <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.2}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <p className="mt-2 text-sm font-medium text-gray-700">Sin fotografías de inspección</p>
          <p className="text-xs text-gray-500">
            {canEdit
              ? 'Utiliza el botón superior para capturar la primera fotografía con la cámara.'
              : 'No se registraron fotografías para este diagnóstico.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id ?? index}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs transition hover:shadow-md"
            >
              {/* Imagen con miniatura de S3 */}
              <div
                className="relative h-44 w-full cursor-pointer overflow-hidden bg-neutral-900"
                onClick={() => setExpandedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.photoType}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
                  {photo.photoType}
                </span>

                {photo.fileSizeBytes && (
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-neutral-300 backdrop-blur font-mono">
                    {(photo.fileSizeBytes / 1024).toFixed(0)} KB
                  </span>
                )}
              </div>

              {/* Información y acciones */}
              <div className="flex flex-1 flex-col justify-between p-3 text-xs">
                <div>
                  {photo.description && (
                    <p className="font-medium text-gray-800 line-clamp-2">{photo.description}</p>
                  )}
                  {photo.capturedAt && (
                    <p className="mt-1 text-[11px] text-gray-500">
                      📅 {new Date(photo.capturedAt).toLocaleDateString()} {new Date(photo.capturedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
                  <button
                    type="button"
                    onClick={() => setExpandedPhoto(photo)}
                    className="text-xs font-medium text-brand-primary hover:underline"
                  >
                    Ver ampliada
                  </button>

                  {canEdit && photo.id && (
                    <button
                      type="button"
                      disabled={deletingPhotoId === photo.id}
                      onClick={() => void handleDeletePhoto(photo.id!)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
                    >
                      {deletingPhotoId === photo.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Captura de Fotografía con la Cámara */}
      <Modal
        open={isCameraModalOpen}
        onClose={() => {
          if (!isUploading) setIsCameraModalOpen(false);
        }}
        title="Tomar Fotografía con Cámara"
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Tipo de Fotografía"
              value={selectedPhotoType}
              onChange={(e) => setSelectedPhotoType(e.target.value)}
              options={photoTypeOptions}
              disabled={isUploading}
            />

            <Input
              label="Descripción u Observación (Opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                category === 'social'
                  ? 'Ej. Grupo familiar completo frente a la vivienda'
                  : 'Ej. Falla en muro norte o ambiente a intervenir'
              }
              disabled={isUploading}
            />
          </div>

          {/* Componente CameraCapture */}
          <div className="relative overflow-hidden rounded-xl bg-black">
            {isUploading && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 p-6 text-center text-white backdrop-blur-xs">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
                <p className="mt-4 text-sm font-semibold">Subiendo fotografía...</p>
                <p className="mt-1 text-xs text-neutral-400">
                  Transfiriendo archivo y vinculando a la postulación.
                </p>
              </div>
            )}

            <CameraCapture
              active={isCameraModalOpen && !isUploading}
              requireConfirmation={true}
              onCapture={(captured) => void handlePhotoCaptured(captured)}
              className="w-full"
            />
          </div>

          <p className="text-center text-[11px] text-gray-500">
            Asegúrate de que la toma tenga buena iluminación antes de presionar &quot;Usar foto&quot;.
          </p>
        </div>
      </Modal>

      {/* Modal de Fotografía Ampliada */}
      {expandedPhoto && (
        <Modal
          open={!!expandedPhoto}
          onClose={() => setExpandedPhoto(null)}
          title={expandedPhoto.photoType}
          size="lg"
        >
          <div className="space-y-3">
            <div className="flex max-h-[70vh] items-center justify-center overflow-hidden rounded-xl bg-black">
              <img
                src={expandedPhoto.url}
                alt={expandedPhoto.photoType}
                className="max-h-[65vh] w-full object-contain"
              />
            </div>

            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
              {expandedPhoto.description && (
                <p>
                  <strong>Descripción:</strong> {expandedPhoto.description}
                </p>
              )}
              {expandedPhoto.capturedAt && (
                <p>
                  <strong>Fecha de Captura:</strong>{' '}
                  {new Date(expandedPhoto.capturedAt).toLocaleString()}
                </p>
              )}
              {expandedPhoto.s3Key && (
                <p className="truncate font-mono text-[11px] text-gray-500">
                  <strong>Archivo:</strong> {expandedPhoto.s3Key}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
