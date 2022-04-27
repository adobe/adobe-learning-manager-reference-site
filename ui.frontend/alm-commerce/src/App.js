import { BrowserRouter, Route, Routes, Redirect } from "react-router-dom";
import "./App.css";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import OrdersPage from "./components/OrdersPage";
import SignIn from "./components/SignInPage";
import { CommerceContextProviders } from "./contextProviders/CommerceContextProvider";
import { getALMConfig } from "./utils/global";
function App() {
  // eslint-disable-next-line no-restricted-globals
  let basePage = getALMConfig().commerceBasePath;
  // let checkoutPage = `${basePage}/checkout`;
  // let ordersPage = `${basePage}/orders`;
  // let cartPage = `${basePage}/cart`;
  //http://localhost:4502/content/learning/language-masters/en/commerce/cart.html/

  // if (process.env.NODE_ENV !== "production") {
  let checkoutPage = `/checkout`;
  let ordersPage = `/orders`;
  let cartPage = `/cart`;
  let signPage = `/singIn`;
  // }
  return (
    <BrowserRouter basename={basePage} basePage>
      <CommerceContextProviders>
        <div className="App">
          <Routes>
            <Route path={ordersPage} element={<OrdersPage></OrdersPage>} />
            <Route path={checkoutPage} element={<CheckoutPage></CheckoutPage>} />
            <Route path={cartPage} element={<CartPage></CartPage>} />
            <Route path="*"
              element={<SignIn></SignIn>}
            />
          </Routes>
        </div>
      </CommerceContextProviders>
    </BrowserRouter>
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