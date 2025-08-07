import { ReactNode, useState } from "react"
import { Button, Modal } from "@mantine/core"

type ModalButtonProps = {
  buttonLabel: string;
  buttonTitle?: string;
  children?: ReactNode;
  modalTitle?: string;
  opened?: boolean;
  openModal?: () => void;
  closeModal?: () => void;
};

const ModalButton = ({ children, buttonLabel, buttonTitle, modalTitle, closeModal, opened, openModal }: ModalButtonProps) => {
  const [isModalOpen, setIsModalOpen] =  useState<boolean>(false)

  const handleModalOpen = openModal ? openModal : () => setIsModalOpen(true);
  const handleModalClose = closeModal ? closeModal : () => setIsModalOpen(false)
  return (
    <>
      <Modal
        opened={ opened || isModalOpen }
        onClose={handleModalClose}
        title={modalTitle}
      >
        {children}
      </Modal>
      <Button title={buttonTitle} onClick={handleModalOpen} color="gray.6">{buttonLabel}</Button>
    </>
  );
}

export default ModalButton