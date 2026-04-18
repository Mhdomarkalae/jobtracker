function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="panel relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 md:p-8 animate-modal-in">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="button-secondary h-11 w-11 rounded-full px-0 py-0 text-lg transition-transform hover:scale-110 active:scale-95"
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
