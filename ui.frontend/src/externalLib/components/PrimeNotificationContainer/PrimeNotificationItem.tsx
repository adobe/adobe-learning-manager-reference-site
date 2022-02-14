import styles from "./PrimeNotificationItem.module.css";

const PrimeNotificationItem = (props: any) => {
    const message = props.message; 
    return (
        <div className={styles.notificationrow}>
            <div className={styles.notificationcell}>
                <div className={styles.notificationtext}>
                    {message}
                </div>
            </div>
        </div>
    );
};
export { PrimeNotificationItem}