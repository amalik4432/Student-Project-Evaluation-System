import { Modal, Button } from "react-bootstrap";

const ConfirmDialog = ({
  show,
  title,
  body,
  confirmLabel = "Confirm",
  variant = "primary",
  loading = false,
  onCancel,
  onConfirm,
}) => (
  <Modal show={show} onHide={onCancel} centered>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{body}</Modal.Body>
    <Modal.Footer>
      <Button variant="light" onClick={onCancel} disabled={loading}>
        Cancel
      </Button>
      <Button variant={variant} onClick={onConfirm} disabled={loading}>
        {loading ? "Please wait…" : confirmLabel}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmDialog;
