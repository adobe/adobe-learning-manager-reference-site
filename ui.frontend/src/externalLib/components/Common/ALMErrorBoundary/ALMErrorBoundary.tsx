import React from "react";
import { GetTranslation } from "../../../utils/translationService";
import styles from "./ALMErrorBoundary.module.css";

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
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.error) {
      // Error path
      return (
        <div>
          <h2 className={styles.errorMessage}>
            {GetTranslation("alm.error.message")}
            {this.state.error && this.state.error?.toString()}
          </h2>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}
