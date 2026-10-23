import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export default function Modal({ title, children, onClose, wide = false }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previouslyFocused = document.activeElement;
    element.showModal();
    return () => { element.close(); previouslyFocused?.focus(); };
  }, []);
  return <dialog ref={dialog} className={`modal ${wide ? 'modal-wide' : ''}`} onCancel={onClose} onClick={e => { if (e.target === dialog.current) onClose(); }}>
    <div className="modal-heading"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>
    {children}
  </dialog>;
}
