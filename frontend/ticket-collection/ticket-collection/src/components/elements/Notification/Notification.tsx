import React, { useEffect } from "react";
import "./Notification.css";

interface NotificationProps {
  message: string;
  type: "error" | "success";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const formattedMessage = (rawMessage: string) => {
  if (
    rawMessage.includes(" Detail: Key (passport_id)") &&
    rawMessage.includes("already exists.")
  )
    return "Person with this passport ID already exists.";
  if (rawMessage.includes("still referenced from table")) {
    let refEntity = rawMessage.split(" ").pop()?.replace(/"/g, "")?.replace(/\.$/, "");
    return `This entity is connected with ${refEntity} entity`;
  }

  return rawMessage;
};

export const Notification = (props: NotificationProps) => {
  const { message, type, isVisible, onClose, duration = 5000 } = props;

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const clientMessage = formattedMessage(message);

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-message">{clientMessage}</span>
        <button className="notification-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};
