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
import { GetPrimeEmitEventLinks } from "../../../utils/global";

interface ALMErrorBoundaryProps {}

interface ALMErrorBoundaryState {
  error: any;
  errorInfo: any;
}

export default class ALMErrorBoundary extends React.Component<
  ALMErrorBoundaryProps,
  ALMErrorBoundaryState
> {
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
  }

  render() {
    if (this.state.error) {
      // Error path
      return (
        <Provider theme={lightTheme} colorScheme={"light"}>
          <div className={styles.errorMessageContainer}>
            <h2 className={styles.errorMessage}>{GetTranslation("alm.error.message")}</h2>
            <Button
              variant="primary"
              onPress={() => {
                SendMessageToParent(
                  { type: PrimeEvent.ALM_RETRY_PAGE_RELOAD },
                  GetPrimeEmitEventLinks()
                );
              }}
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
