import React, { useEffect } from "react";
import { useCartPage } from "../../hooks/CartPage/useCartPage";
import ProductList from "./productList";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../contextProviders/CartContextProvider";

const CartPage = (props) => {
  let navigate = useNavigate();
  const { cartItems,
    hasItems,
    isCartUpdating,
    shouldShowLoadingIndicator, totalQuantity, prices = {} } = useCartContext();

  const totalPrice = prices["grand_total"]?.value || 0;

  const proceedToCheckout = () => {
    navigate(`/checkout`);
  }
  return (
    <div>
      <div>hasItems : {hasItems}</div>
      <div>isCartUpdating : {isCartUpdating}</div>
      <div>shouldShowLoadingIndicator : {shouldShowLoadingIndicator}</div>
      <ProductList cartItems={cartItems} />
      <div>
        {totalQuantity} , {totalPrice}
      </div>


      <button onClick={proceedToCheckout}>Procees to Checkout</button>
    </div>
  )
};

export default CartPage;



/**
 * 
 // console.log(GET_CART_DETAILS);

  const talonProps = useCartPage();

  //   if (loading) return "Loading...";
  //   if (error) return `Error! ${error.message}`;
  //   const talonProps = useCartPage({
  //     operations: getCartDetailsQuery,
  //   });

  const {
    cartItems,
    hasItems,
    isCartUpdating,
    fetchCartDetails,
    onAddToWishlistSuccess,
    setIsCartUpdating,
    shouldShowLoadingIndicator,
    wishlistSuccessProps,
  } = talonProps;

  const classes = useStyle(defaultClasses, props.classes);
  const [, { addToast }] = useToasts();

  useEffect(() => {
    if (wishlistSuccessProps) {
      addToast({ ...wishlistSuccessProps, icon: CheckIcon });
    }
  }, [addToast, wishlistSuccessProps]);

  if (shouldShowLoadingIndicator) {
    return fullPageLoadingIndicator;
  }

  const productListing = hasItems ? (
    <ProductListing
      onAddToWishlistSuccess={onAddToWishlistSuccess}
      setIsCartUpdating={setIsCartUpdating}
      fetchCartDetails={fetchCartDetails}
    />
  ) : (
    <h3>
      <FormattedMessage
        id={"cartPage.emptyCart"}
        defaultMessage={"There are no items in your cart."}
      />
    </h3>
  );

  const priceAdjustments = hasItems ? (
    <PriceAdjustments setIsCartUpdating={setIsCartUpdating} />
  ) : null;

  const priceSummary = hasItems ? (
    <PriceSummary isUpdating={isCartUpdating} />
  ) : null;

  return (
    <div className={classes.root}>
      <div className={classes.heading_container}>
        <h1 className={classes.heading}>
          <FormattedMessage id={"cartPage.heading"} defaultMessage={"Cart"} />
        </h1>
        <div className={classes.stockStatusMessageContainer}>
          <StockStatusMessage cartItems={cartItems} />
        </div>
      </div>
      <div className={classes.body}>
        <div className={classes.items_container}>{productListing}</div>
        <div className={classes.price_adjustments_container}>
          {priceAdjustments}
        </div>
        <div className={classes.summary_container}>
          <div className={classes.summary_contents}>{priceSummary}</div>
        </div>
      </div>
    </div>
  );
 */