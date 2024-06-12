import { ReactNode, forwardRef } from "react";
import ReactDOM from "react-dom";
import "./Modal.scss";

interface ModalProps {
  children: ReactNode;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  const { children } = props;
  return ReactDOM.createPortal(
    <div ref={ref}>
      <div className="modal">{children}</div>
    </div>,
    document.getElementById("rootModal")!
  );
});
