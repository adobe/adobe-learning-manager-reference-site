import { Route, Routes } from "react-router-dom";
import "./App.css";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import SignIn from "./components/SignInPage";
import { CommerceContextProviders } from "./contextProviders/CommerceContextProvider";
function App() {
  // eslint-disable-next-line no-restricted-globals
  const basePath = window.location.pathname;
  const checkoutPath = `${basePath}/checkout`;
  const cartPath = `${basePath}/cart`;
  return (
    <CommerceContextProviders>
      <div className="App">
        <Routes>
          <Route path={checkoutPath} element={<CheckoutPage></CheckoutPage>} />
          <Route path={cartPath} element={<CartPage></CartPage>} />
          <Route path={basePath} element={<SignIn></SignIn>} />
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