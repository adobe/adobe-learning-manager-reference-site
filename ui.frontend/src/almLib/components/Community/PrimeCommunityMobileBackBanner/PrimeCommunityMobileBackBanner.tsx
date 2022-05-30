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
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityMobileBackBanner.module.css";
import ChevronLeft from "@spectrum-icons/workflow/ChevronLeft";

const PrimeCommunityMobileBackBanner = (props: any) => {
    const { formatMessage } = useIntl();
    return (
        <>
            <div className={styles.primeCommunityTopRow}>
                <div className={styles.primeCommunityTopBack} onClick={() => window.history.back()}>
                    <div className={styles.primeCommunityChevronLeftSvg}>
                        <ChevronLeft></ChevronLeft>
                    </div>
                    <button className={styles.primeCommunityBackButton}>
                        {formatMessage({id: "alm.community.back.label", defaultMessage: "Back",})}    
                    </button>
                </div>
            </div>
        </>
    );
};
export default PrimeCommunityMobileBackBanner;