import { ReactNode, useState } from "react"
import { Button, Modal } from "@mantine/core"

type ModalButtonProps = {
  buttonLabel: string,
  children?: ReactNode[] | string,
  modalTitle?: string,
  opened?: boolean,
  openModal?: () => void;
  closeModal?: () => void;
}

const ModalButton = ({ children, buttonLabel, modalTitle, closeModal, opened, openModal}: ModalButtonProps) => {
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
      <Button onClick={handleModalOpen} >{buttonLabel}</Button>
    </>
  );
}

export default ModalButton