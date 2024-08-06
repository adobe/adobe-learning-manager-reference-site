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
(d => {
  var scrId = "primetypekit";
  if (d.getElementById(scrId)) {
    return;
  }
  var config = {
      kitId: "mfr7zpj",
      scriptTimeout: 3000,
    },
    h = d.documentElement,
    t = setTimeout(function () {
      h.className = h.className.replace(/\bwf-loading\b/g, "") + " wf-inactive";
    }, config.scriptTimeout),
    tk = d.createElement("script"),
    f = false,
    s = d.getElementsByTagName("script")[0],
    a;
  h.className += " wf-loading";
  tk.src = "//use.typekit.net/" + config.kitId + ".js";
  tk.async = true;
  tk.id = scrId;
  tk.onload = (tk as any).onreadystatechange = function () {
    a = this.readyState;
    if (f || (a && a !== "complete" && a !== "loaded")) return;
    f = true;
    clearTimeout(t);
    try {
      const Typekit = (window as any)["Typekit"];
      Typekit.load(config);
    } catch (e) {}
  };
  s.parentNode?.insertBefore(tk, s);
})(document);

export {};
