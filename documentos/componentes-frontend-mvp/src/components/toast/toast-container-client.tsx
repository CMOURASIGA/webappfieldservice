"use client";
import { ToastContainer } from "react-toastify";

export default function ToastContainerClient() {
  return (
    <ToastContainer
      hideProgressBar={true}
      pauseOnFocusLoss
      autoClose={3000}
      theme="dark"
    />
  );
}
