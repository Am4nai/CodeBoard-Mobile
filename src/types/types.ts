export type CameraModalProps = {
  onClose: () => void;
};

export enum Step {
  idle,
  preview,
  processing,
  review,
  error,
}
