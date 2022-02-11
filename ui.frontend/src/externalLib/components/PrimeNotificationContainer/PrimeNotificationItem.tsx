const PrimeNotificationItem = (props: any) => {
    const message = props.message; 
    return (
        <>
        <li >
            {message}
        </li>
        </>
    );
};
export { PrimeNotificationItem}