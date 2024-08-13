//TODO:r we need to load this only once
//load typekit font asynchronously
(function (d) {
  var scrId = 'primetypekit';
  if (d.getElementById(scrId)) {
    return;
  }
  var config = {
      kitId: 'mfr7zpj',
      scriptTimeout: 3000,
    },
    h = d.documentElement,
    t = setTimeout(function () {
      h.className = h.className.replace(/\bwf-loading\b/g, '') + ' wf-inactive';
    }, config.scriptTimeout),
    tk = d.createElement('script'),
    f = false,
    s = d.getElementsByTagName('script')[0],
    a;
  h.className += ' wf-loading';
  tk.src = '//use.typekit.net/' + config.kitId + '.js';
  tk.async = true;
  tk.id = scrId;
  tk.onload = tk.onreadystatechange = function () {
    a = this.readyState;
    if (f || (a && a != 'complete' && a != 'loaded')) return;
    f = true;
    clearTimeout(t);
    try {
      Typekit.load(config);
    } catch (e) {}
  };
  s.parentNode.insertBefore(tk, s);
})(document);
