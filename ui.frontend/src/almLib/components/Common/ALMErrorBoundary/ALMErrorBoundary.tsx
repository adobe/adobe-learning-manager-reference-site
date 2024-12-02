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
import React from "react";
import { GetTranslation } from "../../../utils/translationService";
import styles from "./ALMErrorBoundary.module.css";
import { Button, Provider, lightTheme } from "@adobe/react-spectrum";
import { SendMessageToParent } from "../../../utils/widgets/base/EventHandlingBase";
import { PrimeEvent } from "../../../utils/widgets/common";
import { getALMConfig, getALMUser, GetPrimeEmitEventLinks } from "../../../utils/global";
import { RestAdapter } from "../../../utils/restAdapter";

interface ALMErrorBoundaryProps {}

interface ALMErrorBoundaryState {
  error: any;
  errorInfo: any;
}

export default class ALMErrorBoundary extends React.Component<ALMErrorBoundaryProps, ALMErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error: any, errorInfo: any) {
    const errorObj = {
      error: error,
      errorInfo: errorInfo,
    };
    this.setState(errorObj);
    console.error("Error loading the Page : ", errorObj);
    this.retryHandler();
  }

  retryHandler = async (loadOldUI = false) => {
    try {
      const userResponse = await getALMUser();
      const { primeApiURL } = getALMConfig();
      const { id: accountId } = userResponse?.user?.account || {};
      const { id: userId } = userResponse?.user || {};

      await RestAdapter.ajax({
        url: `${primeApiURL}/loguierror?accountId=${accountId}&userId=${userId}&url=${window.location.href}`,
        method: "GET",
      });
    } catch (error) {
      console.error("Error logging UI error:", error);
    } finally {
      loadOldUI &&
        SendMessageToParent({ type: PrimeEvent.ALM_RETRY_PAGE_RELOAD }, GetPrimeEmitEventLinks());
    }
  };

  render() {
    if (this.state.error) {
      // Error path
      return (
        <Provider theme={lightTheme} colorScheme={"light"}>
          <div className={styles.errorMessageContainer}>
            <h2 className={styles.errorMessage}>{GetTranslation("alm.error.message")}</h2>
            <Button
              variant="primary"
              onPress={() => this.retryHandler(true)}
              data-automationid="error-reload-button"
            >
              {GetTranslation("alm.retry")}
            </Button>
          </div>
        </Provider>
      );
    }
    // Normally, just render children
    return <>{this.props.children}</>;
  }
}
