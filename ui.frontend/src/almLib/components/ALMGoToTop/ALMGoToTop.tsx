/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './ALMGoToTop.module.css';
import { getWindowObject } from '../../utils/global';
import { debounce } from '../../utils/catalog';
import { LEFT_ARROW_SVG } from '../../utils/inline_svg';

const scrollThreshold = 300;

const ALMGoToTop = () => {
  const [showGoToTopButton, setShowGoToTopButton] = useState(false);

  const toggleVisible = useCallback(() => {
    const showButton = document.documentElement.scrollTop > scrollThreshold;
    setShowGoToTopButton(showButton);
  }, []);

  useEffect(() => {
    const almWindowObject = getWindowObject();
    const debouncedScroll = debounce(toggleVisible, 100);
    almWindowObject.addEventListener('scroll', debouncedScroll);
    return () => {
      almWindowObject.removeEventListener('scroll', debouncedScroll);
    };
  }, [toggleVisible]);

  const scrollToTop = useCallback(() => {
    getWindowObject().scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const classes = useMemo(() => {
    return showGoToTopButton
      ? `${styles.goToTopButton} ${styles.show} fixedButton`
      : `${styles.goToTopButton} fixedButton`;
  }, [showGoToTopButton]);

  return (
    <button onClick={scrollToTop} className={classes}>
      {LEFT_ARROW_SVG()}
    </button>
  );
};

export default ALMGoToTop;
