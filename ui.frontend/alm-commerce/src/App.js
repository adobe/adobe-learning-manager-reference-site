import { Route, Routes } from "react-router-dom";
import "./App.css";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import OrdersPage from "./components/OrdersPage";
import SignIn from "./components/SignInPage";
import { CommerceContextProviders } from "./contextProviders/CommerceContextProvider";
function App() {
  // eslint-disable-next-line no-restricted-globals
  let basePage = window.location.pathname;
  let checkoutPage = `${basePage}/checkout`;
  let ordersPage = `${basePage}/orders`;
  let cartPage = `${basePage}/cart`;


  if (process.env.NODE_ENV !== "production") {
    basePage = "/";
    checkoutPage = `/checkout`;
    ordersPage = `/orders`;
    cartPage = `/cart`;
  }
  return (
    <CommerceContextProviders>
      <div className="App">
        <Routes>
          <Route path={ordersPage} element={<OrdersPage></OrdersPage>} />
          <Route path={checkoutPage} element={<CheckoutPage></CheckoutPage>} />
          <Route path={cartPage} element={<CartPage></CartPage>} />
          <Route path={basePage} element={<SignIn></SignIn>} />
        </Routes>
      </div>
    </CommerceContextProviders>
  );
}
export default App;
/**
  return (
    <div className="App">
      <header className="App-header">}
 }
{
  isUserSignedIn && (
    <HeadProvider>
      <CartPage></CartPage>
    </HeadProvider>
    // <HeadProvider>
    //   <CheckoutPage />
    // </HeadProvider>
  )
}
      </header >
    </div >
  );
 */