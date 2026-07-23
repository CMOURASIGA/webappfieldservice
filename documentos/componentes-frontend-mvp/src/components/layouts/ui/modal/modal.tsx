/* eslint-disable @typescript-eslint/no-explicit-any */
import { useModal } from "@/hooks/use-modal";
import React, { useEffect } from "react";
import { XMark } from "../icons/x-mark";

interface ModalProps {
  id: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ id, children }: ModalProps) => {
  const { activeModal, closeModal } = useModal();

  const isOpen = activeModal === id;

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 
    transition-opacity duration-300 ${
      isOpen
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none"
    }`}
      onClick={closeModal}
    >
      <div
        className={`bg-white px-2 py-2 lg:mx-10 rounded-lg shadow-lg max-w-full transform transition-transform duration-300 ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-5 opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeModal}
          className="text-gray-400 z-50 cursor-pointer absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
        >
          <XMark />
          <span className="sr-only">Fechar Modal</span>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
