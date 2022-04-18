import { createContext, useEffect, useContext, useState, useMemo } from "react";

import { useCartPage } from "../hooks/CartPage/useCartPage";

const CartContext = createContext(undefined);
const Provider = (props) => {
    const { children } = props;
    // const [contextValue, setContextValue] = useState({});
    const { cartItems,
        hasItems,
        isCartUpdating,
        shouldShowLoadingIndicator, totalQuantity, prices = {} } = useCartPage();


    const contextValue = useMemo(() => {
        return {
            cartItems,
            hasItems,
            isCartUpdating,
            shouldShowLoadingIndicator, totalQuantity, prices
        };
    }, [cartItems,
        hasItems,
        isCartUpdating,
        shouldShowLoadingIndicator, totalQuantity, prices]);

    return (
        <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
    );
};

const useCartContext = () => useContext(CartContext);

export { Provider as CartContextProvider, useCartContext };
