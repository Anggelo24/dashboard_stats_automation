import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import '../style/confirmation-modal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const iconMap = {
    warning: <AlertTriangle size={24} />,
    danger: <AlertCircle size={24} />,
    info: <Info size={24} />
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-content modal-${type}`}>
          <div className="modal-icon">{iconMap[type]}</div>
          <h2 className="modal-title">{title}</h2>
          <p className="modal-message">{message}</p>
          <div className="modal-actions">
            <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
              {cancelText}
            </button>
            <button className={`modal-btn modal-btn-confirm modal-btn-${type}`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
