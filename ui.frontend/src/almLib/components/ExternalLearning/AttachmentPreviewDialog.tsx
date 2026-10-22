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
import { useEffect, useState } from 'react';
import { Content, Dialog, DialogContainer, Divider, Heading } from '@adobe/react-spectrum';
import { ALMLoader } from '../Common/ALMLoader';
import { GetTranslation } from '../../utils/translationService';
import { isSafeUrl } from './externalLearningDetailUtils';
import { isImageAttachment, isPdfAttachment } from './externalLearningConstants';
import styles from './PrimeExternalLearningDetailContainer.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  url: string;
  fileName: string;
}

// Direct URL approach: the browser loads the asset natively via <img> / <object>.
// JS fetch is intentionally avoided here — it would trigger a CORS preflight that
// the asset host typically isn't configured to allow with credentials, even when
// the same URL loads fine in a top-level navigation. <object> with an explicit
// type attribute invokes the browser's PDF plugin and avoids the iframe script
// execution surface that sandbox="allow-scripts" used to expose.
// Only images and PDFs are previewable here — doc/docx have no native renderer
// and are surfaced as download-only by the caller (no View action).
const AttachmentPreviewDialog = ({ open, onClose, url, fileName }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);

  const isImage = isImageAttachment(fileName);
  const isPdf = isPdfAttachment(fileName);
  const isSupported = isImage || isPdf;
  const safe = !!url && isSafeUrl(url);

  // Reset loading + error state every time the dialog opens for a new URL.
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setHasLoadError(false);
    }
  }, [open, url]);

  return (
    <DialogContainer onDismiss={onClose} isDismissable>
      {open && (
        <Dialog UNSAFE_className={styles.previewDialog}>
          <Heading>{fileName}</Heading>
          <Divider />
          <Content UNSAFE_className={styles.previewContent}>
            {(!safe || !isSupported) && (
              <p className={styles.previewError}>
                {GetTranslation('alm.text.externalLearning.downloadError')}
              </p>
            )}
            {safe && isSupported && hasLoadError && (
              <p className={styles.previewError}>
                {GetTranslation('alm.text.externalLearning.downloadError')}
              </p>
            )}
            {safe && isSupported && !hasLoadError && (
              <>
                {isLoading && isImage && <ALMLoader classes={styles.previewLoader} />}
                {isImage && (
                  <img
                    src={url}
                    className={`${styles.previewImage}${isLoading ? ` ${styles.hidden}` : ''}`}
                    alt={fileName}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setHasLoadError(true);
                    }}
                  />
                )}
                {isPdf && (
                  // <object>'s onLoad isn't reliable across browsers for the PDF
                  // plugin, so we don't gate visibility on it — the plugin shows
                  // its own loading state inside the embedded viewer.
                  <object
                    data={url}
                    type="application/pdf"
                    className={styles.previewIframe}
                    aria-label={fileName}
                  >
                    <p className={styles.previewError}>
                      {GetTranslation('alm.text.externalLearning.downloadError')}
                    </p>
                  </object>
                )}
              </>
            )}
          </Content>
        </Dialog>
      )}
    </DialogContainer>
  );
};

export default AttachmentPreviewDialog;
