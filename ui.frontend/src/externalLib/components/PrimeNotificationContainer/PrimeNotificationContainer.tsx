import { useNotification } from "../../hooks";

const PrimeNotificationContainer = () => {
    const { notifications } = useNotification();
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
        Notifications come here !!!
        {notifications?.length}
        {notifications?.map((entry) => (
          entry.message
        ))}
      </div>
      
    </>
  );
};

export default PrimeNotificationContainer;
