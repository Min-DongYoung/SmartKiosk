import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalButton {
  text: string;
  class?: string;
  onClick: () => void;
}

interface ModalContextType {
  showModal: (title: string, content: ReactNode, buttons?: ModalButton[]) => void;
  hideModal: () => void;
  confirm: (title: string, message: string, onConfirm: () => void) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{ 
    isOpen: boolean;
    title: string;
    content: ReactNode;
    buttons: ModalButton[];
  }>({ isOpen: false, title: '', content: null, buttons: [] });

  const showModal = (title: string, content: ReactNode, buttons: ModalButton[] = []) => {
    setModalState({
      isOpen: true,
      title,
      content,
      buttons,
    });
  };

  const hideModal = () => {
    setModalState({ isOpen: false, title: '', content: null, buttons: [] });
  };

  const confirm = (title: string, message: string, onConfirm: () => void) => {
    showModal(
      title,
      <p>{message}</p>,
      [
        { text: '취소', class: 'btn-secondary', onClick: hideModal },
        { text: '확인', class: 'btn-danger', onClick: () => { onConfirm(); hideModal(); } },
      ]
    );
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal, confirm }}>
      {children}
      {modalState.isOpen && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <span className="modal-close" onClick={hideModal}>&times;</span>
            <h2>{modalState.title}</h2>
            <div>{modalState.content}</div>
            <div className="d-flex justify-content-between mt-3">
              {modalState.buttons.map((button, index) => (
                <button
                  key={index}
                  className={`btn ${button.class || 'btn-primary'}`}
                  onClick={button.onClick}
                >
                  {button.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
