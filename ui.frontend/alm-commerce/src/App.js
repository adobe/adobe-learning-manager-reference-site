/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { lightTheme, Provider } from "@adobe/react-spectrum";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import OrdersPage from "./components/OrdersPage";
import SignIn from "./components/SignInPage";
import { CommerceContextProviders } from "./contextProviders/CommerceContextProvider";
import { CART_PATH, CHECKOUT_PATH, ORDER_PATH } from "./utils/constants";
import { getALMConfig } from "./utils/global";
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
              <Route
                path={CHECKOUT_PATH}
                element={<CheckoutPage></CheckoutPage>}
              />
              <Route path={CART_PATH} element={<CartPage></CartPage>} />

              <Route path="/" element={<SignIn></SignIn>} />
            </Routes>
          </div>
        </Provider>
      </CommerceContextProviders>
    </BrowserRouter>
  );
}
export default App;
