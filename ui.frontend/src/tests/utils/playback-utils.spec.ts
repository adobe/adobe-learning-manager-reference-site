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
jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(),
  getALMObject: jest.fn(),
  getAuthKey: jest.fn(),
  GetPrimeEmitEventLinks: jest.fn(),
  getWindowObject: jest.fn(),
  redirectToLoginAndAbort: jest.fn(),
  sendEvent: jest.fn(),
}));

jest.mock('@utils/translationService', () => ({
  getLocale: jest.fn(),
  GetTranslation: jest.fn((key: string) => key),
}));

jest.mock('@utils/widgets/base/EventHandlingBase', () => ({
  PrimeDispatchEvent: jest.fn(),
  SendMessageToParent: jest.fn(),
}));

jest.mock('@utils/widgets/common', () => ({
  PrimeEvent: { PLAYER_LAUNCH: 'PLAYER_LAUNCH', PLAYER_CLOSE: 'PLAYER_CLOSE' },
}));

jest.mock('@utils/mobileAppUtils/appUtils', () => ({
  isOfflineModeInApp: jest.fn(),
  launchOfflinePlayer: jest.fn(),
  isLoadedInsideApp: jest.fn(),
}));

jest.mock('@utils/mobileAppUtils/downloadUtils', () => ({
  generateAllOverviewLinksForLO: jest.fn(() => []),
  getOfflineSyncUrls: jest.fn(() => []),
}));

import * as globalUtils from '@utils/global';
import * as translationService from '@utils/translationService';
import * as appUtils from '@utils/mobileAppUtils/appUtils';
import { LaunchPlayer, GetPlayerURl } from '@utils/playback-utils';

const mockGetALMConfig = globalUtils.getALMConfig as jest.MockedFunction<typeof globalUtils.getALMConfig>;
const mockGetALMObject = globalUtils.getALMObject as jest.MockedFunction<typeof globalUtils.getALMObject>;
const mockGetAuthKey = globalUtils.getAuthKey as jest.MockedFunction<typeof globalUtils.getAuthKey>;
const mockGetWindowObject = globalUtils.getWindowObject as jest.MockedFunction<typeof globalUtils.getWindowObject>;
const mockRedirectToLoginAndAbort = globalUtils.redirectToLoginAndAbort as jest.MockedFunction<typeof globalUtils.redirectToLoginAndAbort>;
const mockSendEvent = globalUtils.sendEvent as jest.MockedFunction<typeof globalUtils.sendEvent>;
const mockGetLocale = translationService.getLocale as jest.MockedFunction<typeof translationService.getLocale>;
const mockIsOfflineModeInApp = appUtils.isOfflineModeInApp as jest.MockedFunction<typeof appUtils.isOfflineModeInApp>;
const mockIsLoadedInsideApp = appUtils.isLoadedInsideApp as jest.MockedFunction<typeof appUtils.isLoadedInsideApp>;

function setupDefaultMocks() {
  mockGetALMConfig.mockReturnValue({
    almBaseURL: 'https://learningmanager.adobe.com',
    primeApiURL: 'https://learningmanager.adobe.com/primeapi/v2',
    pageLocale: 'en-US',
    csrfToken: '',
  } as any);
  mockGetALMObject.mockReturnValue({
    isPrimeUserLoggedIn: jest.fn(() => true),
    getAccessToken: jest.fn(() => 'access-token'),
    playerLaunchTimeStamp: 0,
  } as any);
  mockGetAuthKey.mockReturnValue('access_token=test-token');
  mockGetWindowObject.mockReturnValue({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    sendAuthInHeaders: false,
  } as any);
  mockRedirectToLoginAndAbort.mockReturnValue(false);
  mockGetLocale.mockReturnValue('');
  mockIsOfflineModeInApp.mockReturnValue(false);
  mockIsLoadedInsideApp.mockReturnValue(false);

  // Reset download utils mocks (cleared by resetMocks: true)
  const downloadUtils = require('@utils/mobileAppUtils/downloadUtils');
  (downloadUtils.generateAllOverviewLinksForLO as jest.Mock).mockReturnValue([]);
  (downloadUtils.getOfflineSyncUrls as jest.Mock).mockReturnValue([]);
  const appUtilsMod = require('@utils/mobileAppUtils/appUtils');
  (appUtilsMod.launchOfflinePlayer as jest.Mock).mockImplementation(() => {});
}

describe('GetPlayerURl', () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  it('GetPlayerURl_basicCall_includesLoIdAndRequiredParams', () => {
    const url = GetPlayerURl('course:123', '', '', false, '', '', false);
    expect(url).toContain('lo_id=course:123');
    expect(url).toContain('trapfocus=true');
    expect(url).toContain('is_native=true');
    expect(url).toContain('/app/player?');
  });

  it('GetPlayerURl_withModuleId_appendsModuleIdParam', () => {
    const url = GetPlayerURl('course:123', 'module:456', '', false, '', '', false);
    expect(url).toContain('module_id=module:456');
  });

  it('GetPlayerURl_withInstanceId_appendsInstanceIdParam', () => {
    const url = GetPlayerURl('course:123', '', 'instance:789', false, '', '', false);
    expect(url).toContain('instance_id=instance:789');
  });

  it('GetPlayerURl_multiEnrolled_appendsIsMultienrolledParam', () => {
    const url = GetPlayerURl('course:123', '', 'instance:789', true, '', '', false);
    expect(url).toContain('is_multienrolled=true');
  });

  it('GetPlayerURl_notMultiEnrolled_doesNotAppendIsMultienrolledParam', () => {
    const url = GetPlayerURl('course:123', '', 'instance:789', false, '', '', false);
    expect(url).not.toContain('is_multienrolled');
  });

  it('GetPlayerURl_withNoteIdAndPosition_appendsNoteParams', () => {
    const url = GetPlayerURl('course:123', '', '', false, 'note-1' as any, '100' as any, false);
    expect(url).toContain('note_id=note-1');
    expect(url).toContain('note_position=100');
  });

  it('GetPlayerURl_withLocale_appendsLocaleParam', () => {
    mockGetLocale.mockReturnValue('fr-FR');
    const url = GetPlayerURl('course:123', '', '', false, '', '', false);
    expect(url).toContain('locale=fr-FR');
  });

  it('GetPlayerURl_insideApp_appendsIsInsideAppParam', () => {
    mockIsLoadedInsideApp.mockReturnValue(true);
    const url = GetPlayerURl('course:123', '', '', false, '', '', false);
    expect(url).toContain('isInsideApp=true');
  });

  it('GetPlayerURl_notInsideApp_doesNotAppendIsInsideAppParam', () => {
    mockIsLoadedInsideApp.mockReturnValue(false);
    const url = GetPlayerURl('course:123', '', '', false, '', '', false);
    expect(url).not.toContain('isInsideApp=true');
  });

  it('GetPlayerURl_sendAuthInHeaders_appendsSendAuthParam', () => {
    mockGetWindowObject.mockReturnValue({ sendAuthInHeaders: true } as any);
    const url = GetPlayerURl('course:123', '', '', false, '', '', false);
    expect(url).toContain('send_auth_in_headers=true');
    expect(url).not.toContain('access_token=');
  });

  it('GetPlayerURl_doesNotSendAuthInHeaders_appendsAuthKey', () => {
    mockGetWindowObject.mockReturnValue({ sendAuthInHeaders: false } as any);
    mockGetAuthKey.mockReturnValue('access_token=my-token');
    const url = GetPlayerURl('course:123', '', '', false, '', '', false);
    expect(url).toContain('access_token=my-token');
  });

  it('GetPlayerURl_baseUrlWithHttpPrefix_parsesHostnameFromUrl', () => {
    mockGetALMConfig.mockReturnValue({
      almBaseURL: 'https://custom.learningmanager.com',
      pageLocale: '',
      csrfToken: '',
    } as any);
    const url = GetPlayerURl('course:123', '', '', false, '', '', false);
    expect(url).toContain('hostname=custom.learningmanager.com');
  });

  it('GetPlayerURl_resetRequired_appendsResetAttemptTrue', () => {
    const url = GetPlayerURl('course:123', '', '', false, '', '', true);
    expect(url).toContain('reset_attempt=true');
  });
});

describe('LaunchPlayer', () => {
  beforeEach(() => {
    setupDefaultMocks();
    document.body.innerHTML = '';
    // jsdom does not implement CSS.supports — stub it so overlay height logic doesn't throw.
    Object.defineProperty(global, 'CSS', {
      value: { supports: jest.fn(() => false) },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('LaunchPlayer_redirectToLoginAndAbortReturnsTrue_doesNotCreateOverlay', () => {
    mockRedirectToLoginAndAbort.mockReturnValue(true);

    LaunchPlayer({ trainingId: 'course:123', instanceId: '', lo: {} });

    expect(document.getElementById('primePlayerOverlay')).toBeNull();
  });

  it('LaunchPlayer_normalMode_sendsALMPlayerLaunchEvent', () => {
    LaunchPlayer({ trainingId: 'course:123', instanceId: '' });

    expect(mockSendEvent).toHaveBeenCalled();
  });

  it('LaunchPlayer_normalMode_createsOverlayAndIframe', () => {
    LaunchPlayer({ trainingId: 'course:123', instanceId: '' });

    const overlay = document.getElementById('primePlayerOverlay');
    expect(overlay).not.toBeNull();

    const iframe = document.getElementById('pplayer_iframe');
    expect(iframe).not.toBeNull();
    expect((iframe as HTMLIFrameElement).src).toContain('lo_id=course:123');
  });

  it('LaunchPlayer_normalMode_registersMessageEventListener', () => {
    const mockWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      sendAuthInHeaders: false,
    };
    mockGetWindowObject.mockReturnValue(mockWindow as any);

    LaunchPlayer({ trainingId: 'course:123', instanceId: '' });

    expect(mockWindow.addEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
      false
    );
  });

  it('LaunchPlayer_offlineMode_callsLaunchOfflinePlayer', () => {
    mockIsOfflineModeInApp.mockReturnValue(true);
    const mockALMObject = {
      isPrimeUserLoggedIn: jest.fn(() => true),
      playerLaunchTimeStamp: 0,
    };
    mockGetALMObject.mockReturnValue(mockALMObject as any);

    const { launchOfflinePlayer } = require('@utils/mobileAppUtils/appUtils');

    LaunchPlayer({ trainingId: 'course:123', instanceId: 'inst:1', lo: { id: 'course:123' } });

    expect(launchOfflinePlayer).toHaveBeenCalledWith(
      expect.objectContaining({ offlinePlayerUrl: expect.any(String) })
    );
  });

  it('LaunchPlayer_offlineMode_doesNotCreateOverlay', () => {
    mockIsOfflineModeInApp.mockReturnValue(true);
    mockGetALMObject.mockReturnValue({ playerLaunchTimeStamp: 0 } as any);

    LaunchPlayer({ trainingId: 'course:123', instanceId: '' });

    expect(document.getElementById('primePlayerOverlay')).toBeNull();
  });

  it('LaunchPlayer_playerCloseMessage_removesOverlayAndCallsCallback', () => {
    let capturedHandler: ((e: MessageEvent) => void) | null = null;
    const mockWindow = {
      addEventListener: jest.fn((event: string, handler: (e: MessageEvent) => void) => {
        if (event === 'message') capturedHandler = handler;
      }),
      removeEventListener: jest.fn(),
      sendAuthInHeaders: false,
    };
    mockGetWindowObject.mockReturnValue(mockWindow as any);

    const callBackFn = jest.fn();
    LaunchPlayer({ trainingId: 'course:123', instanceId: '', callBackFn });

    expect(capturedHandler).not.toBeNull();
    capturedHandler!({ data: 'status:close' } as MessageEvent);

    expect(callBackFn).toHaveBeenCalledTimes(1);
    expect(mockWindow.removeEventListener).toHaveBeenCalledWith('message', capturedHandler);
  });
});
