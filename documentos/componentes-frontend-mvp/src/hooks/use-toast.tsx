import Swal, { SweetAlertIcon } from "sweetalert2";

interface ToastOptions {
  text: string;
  icon?: SweetAlertIcon;
  timer?: number;
  showConfirmButton?: boolean;
  width?: number | string;
}

export function toastSuccess(text: string, options?: Partial<ToastOptions>) {
  return Swal.fire({
    text,
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
    width: 500,
    ...options,
  });
}

export function toastError(text: string, options?: Partial<ToastOptions>) {
  return Swal.fire({
    text,
    icon: "error",
    timer: 1500,
    showConfirmButton: false,
    width: 500,
    ...options,
  });
}

export function toastWarning(text: string, options?: Partial<ToastOptions>) {
  return Swal.fire({
    text,
    icon: "warning",
    timer: 1500,
    showConfirmButton: false,
    width: 500,
    ...options,
  });
}

export function toastInfo(text: string, options?: Partial<ToastOptions>) {
  return Swal.fire({
    text,
    icon: "info",
    timer: 1500,
    showConfirmButton: false,
    width: 500,
    ...options,
  });
}
