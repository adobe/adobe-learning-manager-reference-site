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

const ALMVC_CONNECTOR_ID = '20025';

export function isALMVC(vcConnectorId: string) {
  // String() guards against numeric values in API payloads despite the TS type
  return String(vcConnectorId) === ALMVC_CONNECTOR_ID;
}

export function getVcProviderFromLocation(location: string) {
  if (!location) {
    return undefined;
  }
  try {
    return new URL(location).searchParams.get('vcProvider') || undefined;
  } catch (e) {
    const match = /[?&]vcProvider=([^&]+)/.exec(location);
    return match ? decodeURIComponent(match[1]) : undefined;
  }
}

export function resolveVcConnectorId(vcConnectorId: string | undefined, location: string) {
  if (vcConnectorId != null && vcConnectorId !== '') {
    // String() guards against numeric values in API payloads despite the TS type
    return String(vcConnectorId);
  }
  return getVcProviderFromLocation(location);
}

export function buildRecordingLaunchUrl(
  recordingUrl: string,
  vcConnectorId: string,
  serverApiEndpoint: string
) {
  if (!recordingUrl) {
    return recordingUrl;
  }
  const base = serverApiEndpoint.replace(/\/$/, '');
  return (
    base +
    '/ctr/app/launchrecording?recordingUrl=' +
    encodeURIComponent(recordingUrl) +
    '&vcProvider=' +
    vcConnectorId
  );
}
