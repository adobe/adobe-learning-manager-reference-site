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
/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */

import { getALMConfig } from "../../../utils/global";
import { JsonApiParse } from "../../../utils/jsonAPIAdapter";
import { RestAdapter } from "../../../utils/restAdapter";
import banner_de from "../../../assets/images/masthead/banner_de.png";
import banner_en from "../../../assets/images/masthead/banner_en.png";
import banner_es from "../../../assets/images/masthead/banner_es.png";
import banner_fr from "../../../assets/images/masthead/banner_fr.png";
import banner_id from "../../../assets/images/masthead/banner_id.png";
import banner_it from "../../../assets/images/masthead/banner_it.png";
import banner_ja from "../../../assets/images/masthead/banner_ja.png";
import banner_ko from "../../../assets/images/masthead/banner_ko.png";
import banner_nb from "../../../assets/images/masthead/banner_nb.png";
import banner_nl from "../../../assets/images/masthead/banner_nl.png";
import banner_pl from "../../../assets/images/masthead/banner_pl.png";
import banner_pt from "../../../assets/images/masthead/banner_pt.png";
import banner_ru from "../../../assets/images/masthead/banner_ru.png";
import banner_sv from "../../../assets/images/masthead/banner_sv.png";
import banner_tr from "../../../assets/images/masthead/banner_tr.png";
import banner_zh from "../../../assets/images/masthead/banner_zh.png";

const mastheadImageMap = {
  "de-DE": banner_de,
  "en-US": banner_en,
  "es-ES": banner_es,
  "fr-FR": banner_fr,
  "id-ID": banner_id,
  "it-IT": banner_it,
  "ja-JP": banner_ja,
  "ko-KR": banner_ko,
  "nb-NO": banner_nb,
  "nl-NL": banner_nl,
  "pl-PL": banner_pl,
  "pt-BR": banner_pt,
  "ru-RU": banner_ru,
  "sv-SE": banner_sv,
  "tr-TR": banner_tr,
  "zh-CN": banner_zh,
};
export function useMasthead() {
  const baseApiUrl = getALMConfig().primeApiURL;
  const getAnnouncements = async () => {
    const response = await RestAdapter.get({
      url: `${baseApiUrl}announcements`,
      params: { sort: "-liveDate" },
    });
    return response;
  };

  return {
    getAnnouncements,
    mastheadImageMap,
  };
}
