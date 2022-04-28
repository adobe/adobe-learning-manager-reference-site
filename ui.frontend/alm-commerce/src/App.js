import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import OrdersPage from "./components/OrdersPage";
import SignIn from "./components/SignInPage";
import { CommerceContextProviders } from "./contextProviders/CommerceContextProvider";
import { getALMConfig } from "./utils/global";
import { lightTheme, Provider } from '@adobe/react-spectrum';
import { CART_PATH, CHECKOUT_PATH, ORDER_PATH } from "./utils/constants"
function App() {
  // eslint-disable-next-line no-restricted-globals
  let basePage = getALMConfig().commerceBasePath;
  return (
    <BrowserRouter basename={basePage} basePage>
      <CommerceContextProviders>
        <Provider theme={lightTheme} colorScheme={"light"}>
          <div className="AppContainer">
            <Routes>
              <Route path={ORDER_PATH} element={<OrdersPage></OrdersPage>} />
              <Route path={CHECKOUT_PATH} element={<CheckoutPage></CheckoutPage>} />
              <Route path={CART_PATH} element={<CartPage></CartPage>} />
              <Route path="*"
                element={<SignIn></SignIn>}
              />
            </Routes>
          </div>
        </Provider>
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