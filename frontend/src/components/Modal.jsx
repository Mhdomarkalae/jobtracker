function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-slate-900/40 transition-opacity duration-200"
        onClick={onClose}
      />
      <div className="panel relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 md:p-6 animate-modal-in">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#e2e4e9] pb-4 dark:border-[#1e2029]">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="button-secondary h-8 w-8 shrink-0 rounded-md p-0 text-base leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
