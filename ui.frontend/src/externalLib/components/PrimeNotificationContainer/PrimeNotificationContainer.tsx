import { useNotifications } from "../../hooks";
import { PrimeNotificationItem } from "./PrimeNotificationItem";

const PrimeNotificationContainer = () => {
    const { notifications, isLoading } = useNotifications();
    
    if (isLoading)
    return (
      <>
        <span>laoding notifications...</span>
      </>
    );

  return (
    <>
      <div
        style={{
          margin: "10px",
          padding: "10px",
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        <ul>
          {notifications?.map((entry) => (
            <PrimeNotificationItem
            message={entry.message}>
            </PrimeNotificationItem>
          ))}
        </ul>
      </div>
      
    </>
  );
};

export default PrimeNotificationContainer;
