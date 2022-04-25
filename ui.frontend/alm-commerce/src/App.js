import SignIn from "./components/SignInPage";
import CheckoutPage from "./components/CheckoutPage";
import "./App.css";
import CartPage from "./components/CartPage";
import {
  Routes,
  Route
} from "react-router-dom";
import { CommerceContextProviders } from "./contextProviders/CommerceContextProvider"

function App() {
  return (
    <CommerceContextProviders>
      <div className="App">
        <Routes>
          <Route path="checkout" element={<CheckoutPage></CheckoutPage>} />
          <Route path="cart" element={<CartPage></CartPage>} />
          <Route path="/" element={<SignIn></SignIn>} />
        </Routes>
      </div >
    </CommerceContextProviders >
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