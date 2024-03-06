const b = {
  pageFormChanged: !1,
  tabChangeWarningTxt: "",
  tabChangeDiscardTxt: "",
  tabChangeWarning: !1,
  tabChangeDiscard: !1,
  requestsRunning: 0,
  indicatorCompleted: !1,
  registeredHooks: new Array(),
  new_tpl_add_id: 0,
  dataLogTimer: 0,
  options: {
    useLoadIndicator: !1,
    useComboBox: !1
  },
  getThemePath: function() {
    var e = document.querySelector('meta[name="theme-path"]').getAttribute("content");
    return e;
  },
  setOption: function(e, t) {
    b.options[e] = t;
  },
  setOptions: function(e) {
    $.extend(b.options, e);
  },
  reportError: function(e) {
  },
  registerHook: function(e, t) {
    b.registeredHooks[e] || (b.registeredHooks[e] = new Array());
    var n = b.registeredHooks[e].length;
    b.registeredHooks[e][n] = t;
  },
  callHook: function(e, t) {
    if (b.registeredHooks[e])
      for (var n = 0; n < b.registeredHooks[e].length; n++) {
        var r = b.registeredHooks[e][n];
        r(e, t);
      }
  },
  resetFormChanged: function() {
    b.pageFormChanged = !1;
  },
  fadeInIndicator: function(e, t) {
    e.classList.remove("hidden", "opacity-0"), t && setTimeout(t, 300);
  },
  fadeOutIndicator: function(e, t) {
    e.classList.add("opacity-0"), setTimeout(function() {
      e.classList.add("hidden"), t && t();
    }, 300);
  },
  showLoadIndicator: function() {
    if (document.body.style.cursor = "wait", b.options.useLoadIndicator == !0 && (b.requestsRunning += 1, b.requestsRunning < 2)) {
      var e = document.querySelector("#ajaxloader");
      e == null && (e = document.createElement("div"), e.id = "ajaxloader", e.classList.add("hidden", "transition-all", "opacity-0", "duration-300"), e.classList.add("fixed", "shadow-xl", "w-96", "h-48", "bg-white", "bg-center", "bg-no-repeat", "border", "border-gray-300", "rounded-lg", "p-4", "text-center", "z-50", "top-1/2", "left-1/2", "transform", "-translate-x-1/2", "-translate-y-1/2"), e.style.backgroundImage = 'url("' + b.getThemePath() + '/images/ajax-loader.gif")', document.body.appendChild(e));
      var t = document.querySelector("#content");
      if (t === null)
        return;
      const n = this.fadeOutIndicator;
      this.fadeInIndicator(e, function() {
        b.indicatorCompleted = !0, b.requestsRunning < 1 && n(e);
      });
    }
  },
  hideLoadIndicator: function() {
    if (document.body.style.cursor = "", b.requestsRunning -= 1, b.requestsRunning < 1 && (b.requestsRunning = 0, b.indicatorCompleted == !0)) {
      const e = document.querySelector("#ajaxloader");
      this.fadeOutIndicator(e);
    }
  },
  onAfterSideNavLoaded: function() {
    b.options.useComboBox == !0 && $("#sidebar").find("select:not(.chosen-select)").select2({
      placeholder: "",
      selectOnBlur: !0,
      allowClear: !0
    });
  },
  onAfterContentLoad: function(e, t) {
    t ? t = "&" + t : t = "", b.options.useComboBox == !0 && $("#pageContent").find("select:not(.chosen-select)").select2({
      placeholder: "",
      selectOnBlur: !0,
      allowClear: !0,
      formatResult: function(n, r, i, o) {
        return n.id && $(n.element).parent().hasClass("flags") ? '<span class="flags flag-' + n.id.toLowerCase() + '">' + o(n.text) + "</span>" : n.id && $(n.element).parent().hasClass("active-switch") ? '<span class="active active-' + n.id.toLowerCase() + '">' + o(n.text) + "</span>" : o(n.text);
      },
      formatSelection: function(n, r, i) {
        return n.id && $(n.element).parent().hasClass("flags") ? '<span class="flags flag-' + n.id.toLowerCase() + '">' + i(n.text) + "</span>" : n.id && $(n.element).parent().hasClass("active-switch") ? '<span class="active active-' + n.id.toLowerCase() + '">' + i(n.text) + "</span>" : i(n.text);
      }
    }).on("change", function(n) {
      $("#pageForm .table #Filter").length > 0 && !$(this).hasClass("disableChangeEvent") && $("#pageForm .table #Filter").trigger("click");
    }), $('input[data-input-element="date"]').datetimepicker({
      language: "en",
      // TODO
      todayHighlight: !0,
      todayBtn: "linked",
      bootcssVer: 3,
      fontAwesome: !0,
      autoclose: !0,
      minView: "month"
    }), $('input[data-input-element="datetime"]').datetimepicker({
      language: "en",
      // TODO
      todayHighlight: !0,
      todayBtn: "linked",
      bootcssVer: 3,
      fontAwesome: !0,
      autoclose: !0
    }), $("input[autofocus]").focus(), $('input[type="password"]').each(function() {
      $(this).prop("readonly", !0).tooltip({ title: "Click to set", placement: "left" });
    }), $('input[type="password"]').on("click focus", function() {
      $(this).prop("readonly", !1), $(this).tooltip("destroy");
    }), b.callHook("onAfterContentLoad", { url: e, data: t });
  },
  submitForm: function(e, t, n) {
    var r = arguments[3];
    n || (n = !1), (!n || window.confirm(n)) && $.ajax({
      type: "POST",
      url: t,
      data: $("#" + e).serialize(),
      dataType: "html",
      beforeSend: function() {
        b.showLoadIndicator();
      },
      success: function(i, o, s) {
        if (r && alert(r), s.responseText.indexOf("HEADER_REDIRECT:") > -1) {
          var c = s.responseText.split(":");
          b.loadContent(c[1]);
        } else
          s.responseText.indexOf("LOGIN_REDIRECT:") > -1 ? document.location.href = "./index.php" : ($("#pageContent").html(s.responseText), b.onAfterContentLoad(t, $("#" + e).serialize()), b.pageFormChanged = !1);
        clearTimeout(b.dataLogTimer), b.dataLogNotification(), b.hideLoadIndicator();
      },
      error: function(i, o, s) {
        console.log(i), b.hideLoadIndicator(), i.responseText.split(":"), b.reportError("Ajax Request was not successful. 111");
      }
    });
  },
  submitUploadForm: function(e, t) {
    var n = function(i) {
      var o, s = i.contentWindow.document.body.innerHTML;
      try {
        o = JSON.parse(s);
      } catch {
        o = s;
      }
      var c = $("<div></div>").html(o), v = "", _ = c.find("#OKMsg").html();
      _ && (v = '<div id="OKMsg">' + _ + "</div>");
      var C = c.find("#errorMsg").html();
      C && (v = v + '<div id="errorMsg">' + C + "</div>");
      var F = c.find('input[name="_csrf_key"]').val(), j = c.find('input[name="_csrf_id"]').val();
      return v = v + '<input type="hidden" name="_csrf_id" value="' + j + '" /><input type="hidden" name="_csrf_key" value="' + F + '" />', v;
    }, r = "ajaxUploader-iframe-" + Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3);
    $("body").append('<iframe width="0" height="0" style="display:none;" name="' + r + '" id="' + r + '"/>'), $("#" + r).on("load", function() {
      var i = n(this);
      $("#errorMsg").remove(), $("#OKMsg").remove(), $('input[name="_csrf_key"]').remove(), $('input[name="_csrf_id"]').remove(), $('input[name="id"]').before(i), $(this).remove();
    }), $('input[type="file"]').closest("form").attr({ target: r, action: t }).submit();
  },
  capp: function(e, t) {
    $.ajax({
      type: "GET",
      url: "capp.php",
      data: "mod=" + e + (t != null ? "&redirect=" + t : ""),
      dataType: "html",
      beforeSend: function() {
        b.showLoadIndicator();
      },
      success: function(n, r, i) {
        if (i.responseText != "") {
          if (i.responseText.indexOf("HEADER_REDIRECT:") > -1) {
            var o = i.responseText.split(":");
            b.loadContent(o[1]);
          } else if (i.responseText.indexOf("URL_REDIRECT:") > -1) {
            var s = i.responseText.substr(i.responseText.indexOf("URL_REDIRECT:") + 13);
            document.location.href = s;
          }
        }
        b.loadMenus(), b.hideLoadIndicator();
      },
      error: function() {
        b.hideLoadIndicator(), b.reportError("Ajax Request was not successful." + e);
      }
    });
  },
  loadContent: function(e) {
    var t = arguments[1];
    $.ajax({
      type: "GET",
      url: e,
      data: t || null,
      dataType: "html",
      beforeSend: function() {
        b.showLoadIndicator();
      },
      success: function(n, r, i) {
        if (i.responseText.indexOf("HEADER_REDIRECT:") > -1) {
          var o = i.responseText.split(":");
          b.loadContent(o[1]);
        } else if (i.responseText.indexOf("URL_REDIRECT:") > -1) {
          var s = i.responseText.substr(i.responseText.indexOf("URL_REDIRECT:") + 13);
          document.location.href = s;
        } else
          $("#pageContent").html(i.responseText), b.onAfterContentLoad(e, t || null), b.pageFormChanged = !1;
        clearTimeout(b.dataLogTimer), b.dataLogNotification(), b.hideLoadIndicator();
      },
      error: function() {
        b.hideLoadIndicator(), b.reportError("Ajax Request was not successful. 113");
      }
    });
  },
  loadContentRefresh: function(e) {
    $("#refreshinterval").val() > 0 && ($.ajax({
      type: "GET",
      url: e,
      data: "refresh=" + document.getElementById("refreshinterval").value,
      dataType: "html",
      beforeSend: function() {
        b.showLoadIndicator();
      },
      success: function(t, n, r) {
        b.hideLoadIndicator(), $("#pageContent").html(r.responseText), b.onAfterContentLoad(e, "refresh=" + document.getElementById("refreshinterval").value), b.pageFormChanged = !1;
      },
      error: function() {
        b.hideLoadIndicator(), b.reportError("Ajax Request was not successful." + e);
      }
    }), setTimeout("ISPConfig.loadContentRefresh('" + e + "&refresh=" + document.getElementById("refreshinterval").value + "')", document.getElementById("refreshinterval").value * 1e3 * 60));
  },
  loadInitContent: function() {
    var e = $("#pageContent").attr("data-startpage");
    e || (e = "dashboard/dashboard.php"), $.ajax({
      type: "GET",
      url: e,
      data: "",
      dataType: "html",
      beforeSend: function() {
        b.showLoadIndicator();
      },
      success: function(t, n, r) {
        if (r.responseText.indexOf("HEADER_REDIRECT:") > -1) {
          var i = r.responseText.split(":");
          b.loadContent(i[1]);
        } else
          $("#pageContent").html(r.responseText), b.onAfterContentLoad("dashboard/dashboard.php", ""), b.pageFormChanged = !1;
        b.hideLoadIndicator();
      },
      error: function() {
        b.hideLoadIndicator(), b.reportError("Ajax Request was not successful. 114");
      }
    }), b.loadMenus(), b.keepalive(), b.dataLogNotification(), setTimeout(function() {
      try {
        $("form#pageForm").find('input[name="username"]').focus();
      } catch {
      }
    }, 1e3);
  },
  loadMenus: function() {
    $.ajax({
      type: "GET",
      url: "nav.php",
      data: "nav=side",
      dataType: "html",
      beforeSend: function() {
        b.showLoadIndicator();
      },
      success: function(e, t, n) {
        b.hideLoadIndicator(), $("#sidebar").html(n.responseText), b.onAfterSideNavLoaded(), b.loadPushyMenu();
      },
      error: function() {
        b.hideLoadIndicator(), b.reportError("Ajax Request was not successful. 115");
      }
    }), $.ajax({
      type: "GET",
      url: "nav.php",
      data: "nav=top",
      dataType: "html",
      beforeSend: function() {
        b.showLoadIndicator();
      },
      success: function(e, t, n) {
        b.hideLoadIndicator(), $("#topnav-container").html(n.responseText), b.loadPushyMenu();
      },
      error: function(e) {
        b.hideLoadIndicator(), b.reportError("Ajax Request was not successful. 116");
      }
    });
  },
  changeTab: function(e, t, n) {
    if (b.requestsRunning > 0)
      return console.log("tab change interrupted, request still running."), !1;
    document.pageForm.next_tab.value = e;
    var r = $("form#pageForm").find('[name="id"]'), i = null;
    if (r.length > 0 && (i = r.val()), b.tabChangeDiscard == "y" && !n)
      if ((r.length < 1 || i) && (b.pageFormChanged == !1 || window.confirm(b.tabChangeDiscardTxt))) {
        var o = e;
        i ? b.loadContent(t, { next_tab: o, id: i }) : b.loadContent(t, { next_tab: o });
      } else
        return !1;
    else if (i && b.tabChangeWarning == "y" && b.pageFormChanged == !0)
      if (window.confirm(b.tabChangeWarningTxt))
        b.submitForm("pageForm", t);
      else {
        var o = e;
        i ? b.loadContent(t, { next_tab: o, id: i }) : b.loadContent(t, { next_tab: o });
      }
    else
      b.submitForm("pageForm", t);
  },
  confirm_action: function(e, t) {
    window.confirm(t) && b.loadContent(e);
  },
  loadContentInto: function(e, t) {
    $.ajax({
      type: "GET",
      url: t,
      dataType: "html",
      beforeSend: function() {
      },
      success: function(n, r, i) {
        $("#" + e).html(i.responseText);
      },
      error: function() {
        b.reportError("Ajax Request was not successful. 118");
      }
    });
  },
  loadOptionInto: function(e, t, n) {
    $.ajax({
      type: "GET",
      url: t,
      dataType: "html",
      beforeSend: function() {
      },
      success: function(r, i, o) {
        var s = o.responseText, c = s.split("#");
        el = document.getElementById(e), el.innerHTML = "";
        for (var v = 0; v < c.length; ++v) {
          var _ = document.createElement("option");
          _.appendChild(document.createTextNode(c[v])), _.value = c[v], el.appendChild(_);
        }
        typeof n < "u" && n(e, t);
      },
      error: function() {
        b.reportError("Ajax Request was not successful. 119");
      }
    });
  },
  keepalive: function() {
    $.ajax({
      type: "GET",
      url: "keepalive.php",
      dataType: "html",
      success: function(e, t, n) {
        setTimeout(function() {
          b.keepalive();
        }, 1e6);
      },
      error: function() {
        b.reportError("Session expired. Please login again.");
      }
    });
  },
  dataLogNotification: function() {
    console.log(b.options), $.ajax({
      type: "GET",
      url: "datalogstatus.php",
      dataType: "json",
      success: function(e, t, n) {
        var r = [];
        $.each(e.entries, function(i, o) {
          r.push("<li><strong>" + o.text + ":</strong> " + o.count + "</li>");
        }), e.count > 0 ? ($(".modal-body").html(r.join("")), $(".notification_text").text(e.count), $(".notification").css("display", ""), b.dataLogTimer = setTimeout(function() {
          b.dataLogNotification();
        }, 2e3)) : ($(".notification").css("display", "none"), $(".modal-body").html(""), $("#datalogModal").modal("hide"), b.dataLogTimer = setTimeout(function() {
          b.dataLogNotification();
        }, 5e3));
      },
      error: function() {
        b.reportError("Notification not loading, aborting."), $(".notification").css("display", "none");
      }
    });
  },
  addAdditionalTemplate: function() {
    var e = $("#template_additional").val(), t = $("#tpl_add_select").val().split("|", 2), n = t[0], r = t[1];
    if (n > 0) {
      var i = e.split("/");
      b.new_tpl_add_id += 1;
      var o = $('<a href="#"><span class="glyphicon glyphicon-remove-circle" aria-hidden="true"></span></a>').attr("class", "btn btn-danger btn-xs").click(function(s) {
        s.preventDefault(), b.delAdditionalTemplate($(this).parent().attr("rel"));
      });
      i[i.length] = "n" + b.new_tpl_add_id + ":" + n, $("<li>" + r + "</li>").attr("rel", "n" + b.new_tpl_add_id).append(o).appendTo("#template_additional_list ul"), $("#template_additional").val(i.join("/"));
    } else
      alert("no additional template selcted");
  },
  delAdditionalTemplate: function(e) {
    var t = $("#template_additional").val();
    if (e) {
      var n = $("#template_additional_list ul").find('li[rel="' + e + '"]').eq(0), r = n.text();
      n.remove();
      for (var i = t.split("/"), o = new Array(), s = 0; s < i.length; s++) {
        var c = i[s].split(":", 2);
        c.length == 2 && c[0] == e || (o[o.length] = i[s]);
      }
      $("#template_additional").val(o.join("/"));
    } else if (t != "") {
      var v = document.getElementById("tpl_add_select").value.split("|", 2), _ = v[0], r = v[1];
      $("#template_additional_list ul").find("li:not([rel])").each(function() {
        var ae = $(this).text();
        return ae == r ? ($(this).remove(), !1) : this;
      });
      var o = t, C = new RegExp("(^|/)" + _ + "(/|$)");
      o = o.replace(C, ""), o = o.replace("//", "/"), $("#template_additional").val(o);
    } else
      alert("no additional template selcted");
  }
};
window.ISPConfig = b;
window.dispatchEvent(new Event("ispconfig:loaded"));
$(document).on("change", function(e) {
  var t = e.target.localName;
  $("#pageForm .table #Filter").length > 0 && t == "select" && !$(e.target).hasClass("disableChangeEvent") && (e.preventDefault(), $("#pageForm .table #Filter").trigger("click")), (t == "select" || t == "input" || t == "textarea") && $(e.target).hasClass("no-page-form-change") == !1 && (b.pageFormChanged = !0);
});
var ke = $("html, body");
$(document).on("click", "a[data-load-content],button[data-load-content]", function(e) {
  if (e.preventDefault(), b.requestsRunning > 0) {
    console.log("preventing click because there is still a request running.");
    return;
  }
  ke.on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function() {
    ke.stop();
  }), ke.animate({ scrollTop: 0 }, 1e3, function() {
    ke.off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function() {
      ke.stop();
    });
  });
  var t = $(this).attr("data-load-content");
  if (!t)
    return this;
  b.loadContent(t);
});
$(document).on("click", "a[data-capp],button[data-capp]", function(e) {
  if (e.preventDefault(), b.requestsRunning > 0) {
    console.log("preventing click because there is still a request running.");
    return;
  }
  ke.on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function() {
    ke.stop();
  }), ke.animate({ scrollTop: 0 }, 1e3, function() {
    ke.off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function() {
      ke.stop();
    });
  });
  var t = $(this).attr("data-capp");
  if (!t)
    return this;
  b.capp(t);
});
$(document).on("click", "a[data-submit-form],button[data-submit-form]", function(e) {
  if (e.preventDefault(), b.requestsRunning > 0) {
    console.log("preventing click because there is still a request running.");
    return;
  }
  ke.on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function() {
    ke.stop();
  }), ke.animate({ scrollTop: 0 }, 1e3, function() {
    ke.off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function() {
      ke.stop();
    });
  });
  var t = $(this), n = t.attr("data-form-action"), r = t.attr("data-submit-form");
  t.attr("data-form-upload") == "true" ? b.submitUploadForm(r, n) : b.submitForm(r, n);
});
$(document).bind("keypress", function(e) {
  e.which == "13" && $("#pageForm .table #Filter").length > 0 && $(e.target).hasClass("ui-autocomplete-input") == !1 && (e.preventDefault(), $("#pageForm .table #Filter").trigger("click")), e.which == "13" && $(".tab-content button.formbutton-success").length > 0 && e.target.localName != "textarea" && $(e.target).is(":input") && (e.preventDefault(), $(".tab-content button.formbutton-success").not("[disabled='disabled']").trigger("click"));
});
$(document).on("click", "th[data-column]", function(e) {
  var t = $(this), n = t.attr("data-column");
  if (!n)
    return this;
  if ($("#pageForm .table #Filter").length > 0 && t.attr("data-sortable") != "false") {
    var r = $("#Filter"), i = r.attr("data-form-action"), o = r.attr("data-submit-form"), s = t.attr("data-ordered"), c = "?";
    i.indexOf("?") >= 0 && (c = "&"), i = i + c + "orderby=" + n, b.submitForm(o, i), $(document).ajaxComplete(function() {
      var v = $('#pageForm .table th[data-column="' + n + '"]');
      v.parent().children("th[data-column]").removeAttr("data-ordered"), s && s == "asc" ? v.attr("data-ordered", "desc") : v.attr("data-ordered", "asc");
    });
  }
});
$(document).on("click", ".addPlaceholder", function() {
  var e = $(this).text(), t = $(this).siblings(":input");
  t.insertAtCaret(e);
});
$(document).on("click", ".addPlaceholderContent", function() {
  var e = $(this).find(".addPlaceholderContent").text(), t = $(this).siblings(":input");
  t.insertAtCaret(e);
});
$(document).on("click", "[data-check-fields] > input[type='checkbox']", function() {
  if ($(this).is(":checked"))
    for (var e = $(this).parent().attr("data-check-fields"), t = e.split(/,/), n = 0; n < t.length; n++) {
      var r = t[n];
      $('input[type="checkbox"][name="' + r + '"]').prop("checked", !0);
    }
});
$(document).on("click", "[data-uncheck-fields] > input[type='checkbox']", function() {
  if ($(this).is(":checked") == !1)
    for (var e = $(this).parent().attr("data-uncheck-fields"), t = e.split(/,/), n = 0; n < t.length; n++) {
      var r = t[n];
      $('input[type="checkbox"][name="' + r + '"]').prop("checked", !1);
    }
});
$(document).ready(function() {
  $.fn.extend({
    insertAtCaret: function(e) {
      return this.each(function(t) {
        if (document.selection)
          this.focus(), sel = document.selection.createRange(), sel.text = e, this.focus();
        else if (this.selectionStart || this.selectionStart == "0") {
          var n = this.selectionStart, r = this.selectionEnd, i = this.scrollTop;
          this.value = this.value.substring(0, n) + e + this.value.substring(r, this.value.length), this.focus(), this.selectionStart = n + e.length, this.selectionEnd = n + e.length, this.scrollTop = i;
        } else
          this.value += e, this.focus();
      });
    }
  }), $(".progress .progress-bar").css("width", function() {
    return $(this).attr("aria-valuenow") + "%";
  }), $("#searchform").submit(function(e) {
    e.preventDefault();
  }), $("#pageForm").submit(function(e) {
    $("#pageForm .table #Filter").length > 0 && e.preventDefault();
  }), $.fn.setCursorPosition = function(e) {
    var t = $(this).get(0);
    if (t.setSelectionRange)
      t.setSelectionRange(e, e);
    else if (t.createTextRange) {
      var n = t.createTextRange();
      n.collapse(!0), e < 0 && (e = $(this).val().length + e), n.moveEnd("character", e), n.moveStart("character", e), n.select();
    }
  }, $.fn.getCursorPosition = function() {
    var e = 0, t = $(this).get(0);
    if (typeof t.selectionStart == "number")
      e = t.selectionDirection == "backward" ? t.selectionStart : t.selectionEnd;
    else if (document.selection) {
      this.focus();
      var n = document.selection.createRange();
      n.moveStart("character", -t.value.length), e = n.text.length;
    }
    return e;
  };
});
ISPConfig.loadPushyMenu = function() {
  var e = $("#main-navigation"), t = $("#sidebar"), n = $("nav.pushy");
  n.html(""), $("<ul />").appendTo(n);
  var r = !1;
  $(e).find("a").each(function() {
    var i = $(this), o = i.hasClass("active") ? ' class="active"' : "", s = o != "", c = i.attr("data-capp");
    c && (o += ' data-capp="' + c + '"'), c = i.attr("data-load-content"), c && (o += ' data-load-content="' + c + '"');
    var v = $('<li><a href="' + i.attr("href") + '"' + o + '><i class="icon ' + i.data("icon-class") + '"></i>' + i.text() + "</a></li>");
    s != "" && (r = v), n.find("ul").append(v);
  }), r || (r = n), $('<ul class="subnavi" />').appendTo(r), $(t).find("a").each(function() {
    var i = $(this), o = "", s = i.attr("data-capp");
    s && (o += ' data-capp="' + s + '"'), s = i.attr("data-load-content"), s && (o += ' data-load-content="' + s + '"'), s = i.hasClass("subnav-header"), s && (o += ' class="subnav-header"'), n.find("ul.subnavi").append($('<li><a href="' + i.attr("href") + '"' + o + ">" + i.text() + "</a></li>"));
  });
};
var xr = !1, wr = !1, jt = [], Er = -1;
function Bo(e) {
  Ho(e);
}
function Ho(e) {
  jt.includes(e) || jt.push(e), qo();
}
function Ci(e) {
  let t = jt.indexOf(e);
  t !== -1 && t > Er && jt.splice(t, 1);
}
function qo() {
  !wr && !xr && (xr = !0, queueMicrotask(Wo));
}
function Wo() {
  xr = !1, wr = !0;
  for (let e = 0; e < jt.length; e++)
    jt[e](), Er = e;
  jt.length = 0, Er = -1, wr = !1;
}
var en, Bt, tn, Ti, Or = !0;
function Uo(e) {
  Or = !1, e(), Or = !0;
}
function Vo(e) {
  en = e.reactive, tn = e.release, Bt = (t) => e.effect(t, { scheduler: (n) => {
    Or ? Bo(n) : n();
  } }), Ti = e.raw;
}
function fi(e) {
  Bt = e;
}
function zo(e) {
  let t = () => {
  };
  return [(r) => {
    let i = Bt(r);
    return e._x_effects || (e._x_effects = /* @__PURE__ */ new Set(), e._x_runEffects = () => {
      e._x_effects.forEach((o) => o());
    }), e._x_effects.add(i), t = () => {
      i !== void 0 && (e._x_effects.delete(i), tn(i));
    }, i;
  }, () => {
    t();
  }];
}
function Si(e, t) {
  let n = !0, r, i = Bt(() => {
    let o = e();
    JSON.stringify(o), n ? r = o : queueMicrotask(() => {
      t(o, r), r = o;
    }), n = !1;
  });
  return () => tn(i);
}
function gn(e, t, n = {}) {
  e.dispatchEvent(
    new CustomEvent(t, {
      detail: n,
      bubbles: !0,
      // Allows events to pass the shadow DOM barrier.
      composed: !0,
      cancelable: !0
    })
  );
}
function Ot(e, t) {
  if (typeof ShadowRoot == "function" && e instanceof ShadowRoot) {
    Array.from(e.children).forEach((i) => Ot(i, t));
    return;
  }
  let n = !1;
  if (t(e, () => n = !0), n)
    return;
  let r = e.firstElementChild;
  for (; r; )
    Ot(r, t), r = r.nextElementSibling;
}
function Ge(e, ...t) {
  console.warn(`Alpine Warning: ${e}`, ...t);
}
var di = !1;
function Ko() {
  di && Ge("Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems."), di = !0, document.body || Ge("Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?"), gn(document, "alpine:init"), gn(document, "alpine:initializing"), zr(), Jo((t) => lt(t, Ot)), Wr((t) => qr(t)), ki((t, n) => {
    Jr(t, n).forEach((r) => r());
  });
  let e = (t) => !zn(t.parentElement, !0);
  Array.from(document.querySelectorAll(Mi().join(","))).filter(e).forEach((t) => {
    lt(t);
  }), gn(document, "alpine:initialized");
}
var Hr = [], Ai = [];
function $i() {
  return Hr.map((e) => e());
}
function Mi() {
  return Hr.concat(Ai).map((e) => e());
}
function Ii(e) {
  Hr.push(e);
}
function Li(e) {
  Ai.push(e);
}
function zn(e, t = !1) {
  return bn(e, (n) => {
    if ((t ? Mi() : $i()).some((i) => n.matches(i)))
      return !0;
  });
}
function bn(e, t) {
  if (e) {
    if (t(e))
      return e;
    if (e._x_teleportBack && (e = e._x_teleportBack), !!e.parentElement)
      return bn(e.parentElement, t);
  }
}
function Yo(e) {
  return $i().some((t) => e.matches(t));
}
var Ri = [];
function Go(e) {
  Ri.push(e);
}
function lt(e, t = Ot, n = () => {
}) {
  la(() => {
    t(e, (r, i) => {
      if (r._x_inited) {
        r._x_ignore && i();
        return;
      }
      n(r, i), Ri.forEach((o) => o(r, i)), Jr(r, r.attributes).forEach((o) => o()), r._x_ignore ? i() : r._x_inited = !0;
    });
  });
}
function qr(e, t = Ot) {
  t(e, (n) => {
    Ni(n), Xo(n), delete n._x_inited;
  });
}
var Pi = [], Di = [], ji = [];
function Jo(e) {
  ji.push(e);
}
function Wr(e, t) {
  typeof t == "function" ? (e._x_cleanups || (e._x_cleanups = []), e._x_cleanups.push(t)) : (t = e, Di.push(t));
}
function ki(e) {
  Pi.push(e);
}
function Fi(e, t, n) {
  e._x_attributeCleanups || (e._x_attributeCleanups = {}), e._x_attributeCleanups[t] || (e._x_attributeCleanups[t] = []), e._x_attributeCleanups[t].push(n);
}
function Ni(e, t) {
  e._x_attributeCleanups && Object.entries(e._x_attributeCleanups).forEach(([n, r]) => {
    (t === void 0 || t.includes(n)) && (r.forEach((i) => i()), delete e._x_attributeCleanups[n]);
  });
}
function Xo(e) {
  if (e._x_cleanups)
    for (; e._x_cleanups.length; )
      e._x_cleanups.pop()();
}
var Ur = new MutationObserver(Yr), Vr = !1;
function zr() {
  Ur.observe(document, { subtree: !0, childList: !0, attributes: !0, attributeOldValue: !0 }), Vr = !0;
}
function Bi() {
  Zo(), Ur.disconnect(), Vr = !1;
}
var dn = [];
function Zo() {
  let e = Ur.takeRecords();
  dn.push(() => e.length > 0 && Yr(e));
  let t = dn.length;
  queueMicrotask(() => {
    if (dn.length === t)
      for (; dn.length > 0; )
        dn.shift()();
  });
}
function $e(e) {
  if (!Vr)
    return e();
  Bi();
  let t = e();
  return zr(), t;
}
var Kr = !1, Wn = [];
function Qo() {
  Kr = !0;
}
function ea() {
  Kr = !1, Yr(Wn), Wn = [];
}
function Yr(e) {
  if (Kr) {
    Wn = Wn.concat(e);
    return;
  }
  let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (let o = 0; o < e.length; o++)
    if (!e[o].target._x_ignoreMutationObserver && (e[o].type === "childList" && (e[o].addedNodes.forEach((s) => s.nodeType === 1 && t.add(s)), e[o].removedNodes.forEach((s) => s.nodeType === 1 && n.add(s))), e[o].type === "attributes")) {
      let s = e[o].target, c = e[o].attributeName, v = e[o].oldValue, _ = () => {
        r.has(s) || r.set(s, []), r.get(s).push({ name: c, value: s.getAttribute(c) });
      }, C = () => {
        i.has(s) || i.set(s, []), i.get(s).push(c);
      };
      s.hasAttribute(c) && v === null ? _() : s.hasAttribute(c) ? (C(), _()) : C();
    }
  i.forEach((o, s) => {
    Ni(s, o);
  }), r.forEach((o, s) => {
    Pi.forEach((c) => c(s, o));
  });
  for (let o of n)
    t.has(o) || (Di.forEach((s) => s(o)), qr(o));
  t.forEach((o) => {
    o._x_ignoreSelf = !0, o._x_ignore = !0;
  });
  for (let o of t)
    o.isConnected && (delete o._x_ignoreSelf, delete o._x_ignore, ji.forEach((s) => s(o)), o._x_ignore = !0, o._x_ignoreSelf = !0);
  t.forEach((o) => {
    delete o._x_ignoreSelf, delete o._x_ignore;
  }), t = null, n = null, r = null, i = null;
}
function Hi(e) {
  return xn(Zt(e));
}
function _n(e, t, n) {
  return e._x_dataStack = [t, ...Zt(n || e)], () => {
    e._x_dataStack = e._x_dataStack.filter((r) => r !== t);
  };
}
function Zt(e) {
  return e._x_dataStack ? e._x_dataStack : typeof ShadowRoot == "function" && e instanceof ShadowRoot ? Zt(e.host) : e.parentNode ? Zt(e.parentNode) : [];
}
function xn(e) {
  return new Proxy({ objects: e }, ta);
}
var ta = {
  ownKeys({ objects: e }) {
    return Array.from(
      new Set(e.flatMap((t) => Object.keys(t)))
    );
  },
  has({ objects: e }, t) {
    return t == Symbol.unscopables ? !1 : e.some(
      (n) => Reflect.has(n, t)
    );
  },
  get({ objects: e }, t, n) {
    return t == "toJSON" ? na : Reflect.get(
      e.find(
        (r) => Reflect.has(r, t)
      ) || {},
      t,
      n
    );
  },
  set({ objects: e }, t, n, r) {
    const i = e.find(
      (s) => Reflect.has(s, t)
    ) || e[e.length - 1], o = Object.getOwnPropertyDescriptor(i, t);
    return o != null && o.set && (o != null && o.get) ? Reflect.set(i, t, n, r) : Reflect.set(i, t, n);
  }
};
function na() {
  return Reflect.ownKeys(this).reduce((t, n) => (t[n] = Reflect.get(this, n), t), {});
}
function qi(e) {
  let t = (r) => typeof r == "object" && !Array.isArray(r) && r !== null, n = (r, i = "") => {
    Object.entries(Object.getOwnPropertyDescriptors(r)).forEach(([o, { value: s, enumerable: c }]) => {
      if (c === !1 || s === void 0 || typeof s == "object" && s !== null && s.__v_skip)
        return;
      let v = i === "" ? o : `${i}.${o}`;
      typeof s == "object" && s !== null && s._x_interceptor ? r[o] = s.initialize(e, v, o) : t(s) && s !== r && !(s instanceof Element) && n(s, v);
    });
  };
  return n(e);
}
function Wi(e, t = () => {
}) {
  let n = {
    initialValue: void 0,
    _x_interceptor: !0,
    initialize(r, i, o) {
      return e(this.initialValue, () => ra(r, i), (s) => Cr(r, i, s), i, o);
    }
  };
  return t(n), (r) => {
    if (typeof r == "object" && r !== null && r._x_interceptor) {
      let i = n.initialize.bind(n);
      n.initialize = (o, s, c) => {
        let v = r.initialize(o, s, c);
        return n.initialValue = v, i(o, s, c);
      };
    } else
      n.initialValue = r;
    return n;
  };
}
function ra(e, t) {
  return t.split(".").reduce((n, r) => n[r], e);
}
function Cr(e, t, n) {
  if (typeof t == "string" && (t = t.split(".")), t.length === 1)
    e[t[0]] = n;
  else {
    if (t.length === 0)
      throw error;
    return e[t[0]] || (e[t[0]] = {}), Cr(e[t[0]], t.slice(1), n);
  }
}
var Ui = {};
function Xe(e, t) {
  Ui[e] = t;
}
function Tr(e, t) {
  return Object.entries(Ui).forEach(([n, r]) => {
    let i = null;
    function o() {
      if (i)
        return i;
      {
        let [s, c] = Ji(t);
        return i = { interceptor: Wi, ...s }, Wr(t, c), i;
      }
    }
    Object.defineProperty(e, `$${n}`, {
      get() {
        return r(t, o());
      },
      enumerable: !1
    });
  }), e;
}
function ia(e, t, n, ...r) {
  try {
    return n(...r);
  } catch (i) {
    yn(i, e, t);
  }
}
function yn(e, t, n = void 0) {
  e = Object.assign(
    e ?? { message: "No error message given." },
    { el: t, expression: n }
  ), console.warn(`Alpine Expression Error: ${e.message}

${n ? 'Expression: "' + n + `"

` : ""}`, t), setTimeout(() => {
    throw e;
  }, 0);
}
var Hn = !0;
function Vi(e) {
  let t = Hn;
  Hn = !1;
  let n = e();
  return Hn = t, n;
}
function kt(e, t, n = {}) {
  let r;
  return Fe(e, t)((i) => r = i, n), r;
}
function Fe(...e) {
  return zi(...e);
}
var zi = Ki;
function oa(e) {
  zi = e;
}
function Ki(e, t) {
  let n = {};
  Tr(n, e);
  let r = [n, ...Zt(e)], i = typeof t == "function" ? aa(r, t) : ua(r, t, e);
  return ia.bind(null, e, t, i);
}
function aa(e, t) {
  return (n = () => {
  }, { scope: r = {}, params: i = [] } = {}) => {
    let o = t.apply(xn([r, ...e]), i);
    Un(n, o);
  };
}
var mr = {};
function sa(e, t) {
  if (mr[e])
    return mr[e];
  let n = Object.getPrototypeOf(async function() {
  }).constructor, r = /^[\n\s]*if.*\(.*\)/.test(e.trim()) || /^(let|const)\s/.test(e.trim()) ? `(async()=>{ ${e} })()` : e, o = (() => {
    try {
      let s = new n(
        ["__self", "scope"],
        `with (scope) { __self.result = ${r} }; __self.finished = true; return __self.result;`
      );
      return Object.defineProperty(s, "name", {
        value: `[Alpine] ${e}`
      }), s;
    } catch (s) {
      return yn(s, t, e), Promise.resolve();
    }
  })();
  return mr[e] = o, o;
}
function ua(e, t, n) {
  let r = sa(t, n);
  return (i = () => {
  }, { scope: o = {}, params: s = [] } = {}) => {
    r.result = void 0, r.finished = !1;
    let c = xn([o, ...e]);
    if (typeof r == "function") {
      let v = r(r, c).catch((_) => yn(_, n, t));
      r.finished ? (Un(i, r.result, c, s, n), r.result = void 0) : v.then((_) => {
        Un(i, _, c, s, n);
      }).catch((_) => yn(_, n, t)).finally(() => r.result = void 0);
    }
  };
}
function Un(e, t, n, r, i) {
  if (Hn && typeof t == "function") {
    let o = t.apply(n, r);
    o instanceof Promise ? o.then((s) => Un(e, s, n, r)).catch((s) => yn(s, i, t)) : e(o);
  } else
    typeof t == "object" && t instanceof Promise ? t.then((o) => e(o)) : e(t);
}
var Gr = "x-";
function nn(e = "") {
  return Gr + e;
}
function ca(e) {
  Gr = e;
}
var Sr = {};
function Oe(e, t) {
  return Sr[e] = t, {
    before(n) {
      if (!Sr[n]) {
        console.warn(String.raw`Cannot find directive \`${n}\`. \`${e}\` will use the default order of execution`);
        return;
      }
      const r = Dt.indexOf(n);
      Dt.splice(r >= 0 ? r : Dt.indexOf("DEFAULT"), 0, e);
    }
  };
}
function Jr(e, t, n) {
  if (t = Array.from(t), e._x_virtualDirectives) {
    let o = Object.entries(e._x_virtualDirectives).map(([c, v]) => ({ name: c, value: v })), s = Yi(o);
    o = o.map((c) => s.find((v) => v.name === c.name) ? {
      name: `x-bind:${c.name}`,
      value: `"${c.value}"`
    } : c), t = t.concat(o);
  }
  let r = {};
  return t.map(Qi((o, s) => r[o] = s)).filter(to).map(da(r, n)).sort(pa).map((o) => fa(e, o));
}
function Yi(e) {
  return Array.from(e).map(Qi()).filter((t) => !to(t));
}
var Ar = !1, hn = /* @__PURE__ */ new Map(), Gi = Symbol();
function la(e) {
  Ar = !0;
  let t = Symbol();
  Gi = t, hn.set(t, []);
  let n = () => {
    for (; hn.get(t).length; )
      hn.get(t).shift()();
    hn.delete(t);
  }, r = () => {
    Ar = !1, n();
  };
  e(n), r();
}
function Ji(e) {
  let t = [], n = (c) => t.push(c), [r, i] = zo(e);
  return t.push(i), [{
    Alpine: wn,
    effect: r,
    cleanup: n,
    evaluateLater: Fe.bind(Fe, e),
    evaluate: kt.bind(kt, e)
  }, () => t.forEach((c) => c())];
}
function fa(e, t) {
  let n = () => {
  }, r = Sr[t.type] || n, [i, o] = Ji(e);
  Fi(e, t.original, o);
  let s = () => {
    e._x_ignore || e._x_ignoreSelf || (r.inline && r.inline(e, t, i), r = r.bind(r, e, t, i), Ar ? hn.get(Gi).push(r) : r());
  };
  return s.runCleanups = o, s;
}
var Xi = (e, t) => ({ name: n, value: r }) => (n.startsWith(e) && (n = n.replace(e, t)), { name: n, value: r }), Zi = (e) => e;
function Qi(e = () => {
}) {
  return ({ name: t, value: n }) => {
    let { name: r, value: i } = eo.reduce((o, s) => s(o), { name: t, value: n });
    return r !== t && e(r, t), { name: r, value: i };
  };
}
var eo = [];
function Xr(e) {
  eo.push(e);
}
function to({ name: e }) {
  return no().test(e);
}
var no = () => new RegExp(`^${Gr}([^:^.]+)\\b`);
function da(e, t) {
  return ({ name: n, value: r }) => {
    let i = n.match(no()), o = n.match(/:([a-zA-Z0-9\-_:]+)/), s = n.match(/\.[^.\]]+(?=[^\]]*$)/g) || [], c = t || e[n] || n;
    return {
      type: i ? i[1] : null,
      value: o ? o[1] : null,
      modifiers: s.map((v) => v.replace(".", "")),
      expression: r,
      original: c
    };
  };
}
var $r = "DEFAULT", Dt = [
  "ignore",
  "ref",
  "data",
  "id",
  "anchor",
  "bind",
  "init",
  "for",
  "model",
  "modelable",
  "transition",
  "show",
  "if",
  $r,
  "teleport"
];
function pa(e, t) {
  let n = Dt.indexOf(e.type) === -1 ? $r : e.type, r = Dt.indexOf(t.type) === -1 ? $r : t.type;
  return Dt.indexOf(n) - Dt.indexOf(r);
}
var Mr = [], Zr = !1;
function Qr(e = () => {
}) {
  return queueMicrotask(() => {
    Zr || setTimeout(() => {
      Ir();
    });
  }), new Promise((t) => {
    Mr.push(() => {
      e(), t();
    });
  });
}
function Ir() {
  for (Zr = !1; Mr.length; )
    Mr.shift()();
}
function va() {
  Zr = !0;
}
function ei(e, t) {
  return Array.isArray(t) ? pi(e, t.join(" ")) : typeof t == "object" && t !== null ? ha(e, t) : typeof t == "function" ? ei(e, t()) : pi(e, t);
}
function pi(e, t) {
  let n = (i) => i.split(" ").filter((o) => !e.classList.contains(o)).filter(Boolean), r = (i) => (e.classList.add(...i), () => {
    e.classList.remove(...i);
  });
  return t = t === !0 ? t = "" : t || "", r(n(t));
}
function ha(e, t) {
  let n = (c) => c.split(" ").filter(Boolean), r = Object.entries(t).flatMap(([c, v]) => v ? n(c) : !1).filter(Boolean), i = Object.entries(t).flatMap(([c, v]) => v ? !1 : n(c)).filter(Boolean), o = [], s = [];
  return i.forEach((c) => {
    e.classList.contains(c) && (e.classList.remove(c), s.push(c));
  }), r.forEach((c) => {
    e.classList.contains(c) || (e.classList.add(c), o.push(c));
  }), () => {
    s.forEach((c) => e.classList.add(c)), o.forEach((c) => e.classList.remove(c));
  };
}
function Kn(e, t) {
  return typeof t == "object" && t !== null ? ga(e, t) : ma(e, t);
}
function ga(e, t) {
  let n = {};
  return Object.entries(t).forEach(([r, i]) => {
    n[r] = e.style[r], r.startsWith("--") || (r = ya(r)), e.style.setProperty(r, i);
  }), setTimeout(() => {
    e.style.length === 0 && e.removeAttribute("style");
  }), () => {
    Kn(e, n);
  };
}
function ma(e, t) {
  let n = e.getAttribute("style", t);
  return e.setAttribute("style", t), () => {
    e.setAttribute("style", n || "");
  };
}
function ya(e) {
  return e.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function Lr(e, t = () => {
}) {
  let n = !1;
  return function() {
    n ? t.apply(this, arguments) : (n = !0, e.apply(this, arguments));
  };
}
Oe("transition", (e, { value: t, modifiers: n, expression: r }, { evaluate: i }) => {
  typeof r == "function" && (r = i(r)), r !== !1 && (!r || typeof r == "boolean" ? _a(e, n, t) : ba(e, r, t));
});
function ba(e, t, n) {
  ro(e, ei, ""), {
    enter: (i) => {
      e._x_transition.enter.during = i;
    },
    "enter-start": (i) => {
      e._x_transition.enter.start = i;
    },
    "enter-end": (i) => {
      e._x_transition.enter.end = i;
    },
    leave: (i) => {
      e._x_transition.leave.during = i;
    },
    "leave-start": (i) => {
      e._x_transition.leave.start = i;
    },
    "leave-end": (i) => {
      e._x_transition.leave.end = i;
    }
  }[n](t);
}
function _a(e, t, n) {
  ro(e, Kn);
  let r = !t.includes("in") && !t.includes("out") && !n, i = r || t.includes("in") || ["enter"].includes(n), o = r || t.includes("out") || ["leave"].includes(n);
  t.includes("in") && !r && (t = t.filter((te, ie) => ie < t.indexOf("out"))), t.includes("out") && !r && (t = t.filter((te, ie) => ie > t.indexOf("out")));
  let s = !t.includes("opacity") && !t.includes("scale"), c = s || t.includes("opacity"), v = s || t.includes("scale"), _ = c ? 0 : 1, C = v ? pn(t, "scale", 95) / 100 : 1, F = pn(t, "delay", 0) / 1e3, j = pn(t, "origin", "center"), ae = "opacity, transform", Ne = pn(t, "duration", 150) / 1e3, Ze = pn(t, "duration", 75) / 1e3, R = "cubic-bezier(0.4, 0.0, 0.2, 1)";
  i && (e._x_transition.enter.during = {
    transformOrigin: j,
    transitionDelay: `${F}s`,
    transitionProperty: ae,
    transitionDuration: `${Ne}s`,
    transitionTimingFunction: R
  }, e._x_transition.enter.start = {
    opacity: _,
    transform: `scale(${C})`
  }, e._x_transition.enter.end = {
    opacity: 1,
    transform: "scale(1)"
  }), o && (e._x_transition.leave.during = {
    transformOrigin: j,
    transitionDelay: `${F}s`,
    transitionProperty: ae,
    transitionDuration: `${Ze}s`,
    transitionTimingFunction: R
  }, e._x_transition.leave.start = {
    opacity: 1,
    transform: "scale(1)"
  }, e._x_transition.leave.end = {
    opacity: _,
    transform: `scale(${C})`
  });
}
function ro(e, t, n = {}) {
  e._x_transition || (e._x_transition = {
    enter: { during: n, start: n, end: n },
    leave: { during: n, start: n, end: n },
    in(r = () => {
    }, i = () => {
    }) {
      Rr(e, t, {
        during: this.enter.during,
        start: this.enter.start,
        end: this.enter.end
      }, r, i);
    },
    out(r = () => {
    }, i = () => {
    }) {
      Rr(e, t, {
        during: this.leave.during,
        start: this.leave.start,
        end: this.leave.end
      }, r, i);
    }
  });
}
window.Element.prototype._x_toggleAndCascadeWithTransitions = function(e, t, n, r) {
  const i = document.visibilityState === "visible" ? requestAnimationFrame : setTimeout;
  let o = () => i(n);
  if (t) {
    e._x_transition && (e._x_transition.enter || e._x_transition.leave) ? e._x_transition.enter && (Object.entries(e._x_transition.enter.during).length || Object.entries(e._x_transition.enter.start).length || Object.entries(e._x_transition.enter.end).length) ? e._x_transition.in(n) : o() : e._x_transition ? e._x_transition.in(n) : o();
    return;
  }
  e._x_hidePromise = e._x_transition ? new Promise((s, c) => {
    e._x_transition.out(() => {
    }, () => s(r)), e._x_transitioning && e._x_transitioning.beforeCancel(() => c({ isFromCancelledTransition: !0 }));
  }) : Promise.resolve(r), queueMicrotask(() => {
    let s = io(e);
    s ? (s._x_hideChildren || (s._x_hideChildren = []), s._x_hideChildren.push(e)) : i(() => {
      let c = (v) => {
        let _ = Promise.all([
          v._x_hidePromise,
          ...(v._x_hideChildren || []).map(c)
        ]).then(([C]) => C());
        return delete v._x_hidePromise, delete v._x_hideChildren, _;
      };
      c(e).catch((v) => {
        if (!v.isFromCancelledTransition)
          throw v;
      });
    });
  });
};
function io(e) {
  let t = e.parentNode;
  if (t)
    return t._x_hidePromise ? t : io(t);
}
function Rr(e, t, { during: n, start: r, end: i } = {}, o = () => {
}, s = () => {
}) {
  if (e._x_transitioning && e._x_transitioning.cancel(), Object.keys(n).length === 0 && Object.keys(r).length === 0 && Object.keys(i).length === 0) {
    o(), s();
    return;
  }
  let c, v, _;
  xa(e, {
    start() {
      c = t(e, r);
    },
    during() {
      v = t(e, n);
    },
    before: o,
    end() {
      c(), _ = t(e, i);
    },
    after: s,
    cleanup() {
      v(), _();
    }
  });
}
function xa(e, t) {
  let n, r, i, o = Lr(() => {
    $e(() => {
      n = !0, r || t.before(), i || (t.end(), Ir()), t.after(), e.isConnected && t.cleanup(), delete e._x_transitioning;
    });
  });
  e._x_transitioning = {
    beforeCancels: [],
    beforeCancel(s) {
      this.beforeCancels.push(s);
    },
    cancel: Lr(function() {
      for (; this.beforeCancels.length; )
        this.beforeCancels.shift()();
      o();
    }),
    finish: o
  }, $e(() => {
    t.start(), t.during();
  }), va(), requestAnimationFrame(() => {
    if (n)
      return;
    let s = Number(getComputedStyle(e).transitionDuration.replace(/,.*/, "").replace("s", "")) * 1e3, c = Number(getComputedStyle(e).transitionDelay.replace(/,.*/, "").replace("s", "")) * 1e3;
    s === 0 && (s = Number(getComputedStyle(e).animationDuration.replace("s", "")) * 1e3), $e(() => {
      t.before();
    }), r = !0, requestAnimationFrame(() => {
      n || ($e(() => {
        t.end();
      }), Ir(), setTimeout(e._x_transitioning.finish, s + c), i = !0);
    });
  });
}
function pn(e, t, n) {
  if (e.indexOf(t) === -1)
    return n;
  const r = e[e.indexOf(t) + 1];
  if (!r || t === "scale" && isNaN(r))
    return n;
  if (t === "duration" || t === "delay") {
    let i = r.match(/([0-9]+)ms/);
    if (i)
      return i[1];
  }
  return t === "origin" && ["top", "right", "left", "center", "bottom"].includes(e[e.indexOf(t) + 2]) ? [r, e[e.indexOf(t) + 2]].join(" ") : r;
}
var Ct = !1;
function Ht(e, t = () => {
}) {
  return (...n) => Ct ? t(...n) : e(...n);
}
function wa(e) {
  return (...t) => Ct && e(...t);
}
var oo = [];
function Yn(e) {
  oo.push(e);
}
function Ea(e, t) {
  oo.forEach((n) => n(e, t)), Ct = !0, ao(() => {
    lt(t, (n, r) => {
      r(n, () => {
      });
    });
  }), Ct = !1;
}
var Pr = !1;
function Oa(e, t) {
  t._x_dataStack || (t._x_dataStack = e._x_dataStack), Ct = !0, Pr = !0, ao(() => {
    Ca(t);
  }), Ct = !1, Pr = !1;
}
function Ca(e) {
  let t = !1;
  lt(e, (r, i) => {
    Ot(r, (o, s) => {
      if (t && Yo(o))
        return s();
      t = !0, i(o, s);
    });
  });
}
function ao(e) {
  let t = Bt;
  fi((n, r) => {
    let i = t(n);
    return tn(i), () => {
    };
  }), e(), fi(t);
}
function so(e, t, n, r = []) {
  switch (e._x_bindings || (e._x_bindings = en({})), e._x_bindings[t] = n, t = r.includes("camel") ? Ra(t) : t, t) {
    case "value":
      Ta(e, n);
      break;
    case "style":
      Aa(e, n);
      break;
    case "class":
      Sa(e, n);
      break;
    case "selected":
    case "checked":
      $a(e, t, n);
      break;
    default:
      uo(e, t, n);
      break;
  }
}
function Ta(e, t) {
  if (e.type === "radio")
    e.attributes.value === void 0 && (e.value = t), window.fromModel && (typeof t == "boolean" ? e.checked = qn(e.value) === t : e.checked = vi(e.value, t));
  else if (e.type === "checkbox")
    Number.isInteger(t) ? e.value = t : !Array.isArray(t) && typeof t != "boolean" && ![null, void 0].includes(t) ? e.value = String(t) : Array.isArray(t) ? e.checked = t.some((n) => vi(n, e.value)) : e.checked = !!t;
  else if (e.tagName === "SELECT")
    La(e, t);
  else {
    if (e.value === t)
      return;
    e.value = t === void 0 ? "" : t;
  }
}
function Sa(e, t) {
  e._x_undoAddedClasses && e._x_undoAddedClasses(), e._x_undoAddedClasses = ei(e, t);
}
function Aa(e, t) {
  e._x_undoAddedStyles && e._x_undoAddedStyles(), e._x_undoAddedStyles = Kn(e, t);
}
function $a(e, t, n) {
  uo(e, t, n), Ia(e, t, n);
}
function uo(e, t, n) {
  [null, void 0, !1].includes(n) && Pa(t) ? e.removeAttribute(t) : (co(t) && (n = t), Ma(e, t, n));
}
function Ma(e, t, n) {
  e.getAttribute(t) != n && e.setAttribute(t, n);
}
function Ia(e, t, n) {
  e[t] !== n && (e[t] = n);
}
function La(e, t) {
  const n = [].concat(t).map((r) => r + "");
  Array.from(e.options).forEach((r) => {
    r.selected = n.includes(r.value);
  });
}
function Ra(e) {
  return e.toLowerCase().replace(/-(\w)/g, (t, n) => n.toUpperCase());
}
function vi(e, t) {
  return e == t;
}
function qn(e) {
  return [1, "1", "true", "on", "yes", !0].includes(e) ? !0 : [0, "0", "false", "off", "no", !1].includes(e) ? !1 : e ? !!e : null;
}
function co(e) {
  return [
    "disabled",
    "checked",
    "required",
    "readonly",
    "hidden",
    "open",
    "selected",
    "autofocus",
    "itemscope",
    "multiple",
    "novalidate",
    "allowfullscreen",
    "allowpaymentrequest",
    "formnovalidate",
    "autoplay",
    "controls",
    "loop",
    "muted",
    "playsinline",
    "default",
    "ismap",
    "reversed",
    "async",
    "defer",
    "nomodule"
  ].includes(e);
}
function Pa(e) {
  return !["aria-pressed", "aria-checked", "aria-expanded", "aria-selected"].includes(e);
}
function Da(e, t, n) {
  return e._x_bindings && e._x_bindings[t] !== void 0 ? e._x_bindings[t] : lo(e, t, n);
}
function ja(e, t, n, r = !0) {
  if (e._x_bindings && e._x_bindings[t] !== void 0)
    return e._x_bindings[t];
  if (e._x_inlineBindings && e._x_inlineBindings[t] !== void 0) {
    let i = e._x_inlineBindings[t];
    return i.extract = r, Vi(() => kt(e, i.expression));
  }
  return lo(e, t, n);
}
function lo(e, t, n) {
  let r = e.getAttribute(t);
  return r === null ? typeof n == "function" ? n() : n : r === "" ? !0 : co(t) ? !![t, "true"].includes(r) : r;
}
function fo(e, t) {
  var n;
  return function() {
    var r = this, i = arguments, o = function() {
      n = null, e.apply(r, i);
    };
    clearTimeout(n), n = setTimeout(o, t);
  };
}
function po(e, t) {
  let n;
  return function() {
    let r = this, i = arguments;
    n || (e.apply(r, i), n = !0, setTimeout(() => n = !1, t));
  };
}
function vo({ get: e, set: t }, { get: n, set: r }) {
  let i = !0, o, s = Bt(() => {
    let c = e(), v = n();
    if (i)
      r(yr(c)), i = !1;
    else {
      let _ = JSON.stringify(c), C = JSON.stringify(v);
      _ !== o ? r(yr(c)) : _ !== C && t(yr(v));
    }
    o = JSON.stringify(e()), JSON.stringify(n());
  });
  return () => {
    tn(s);
  };
}
function yr(e) {
  return typeof e == "object" ? JSON.parse(JSON.stringify(e)) : e;
}
function ka(e) {
  (Array.isArray(e) ? e : [e]).forEach((n) => n(wn));
}
var Pt = {}, hi = !1;
function Fa(e, t) {
  if (hi || (Pt = en(Pt), hi = !0), t === void 0)
    return Pt[e];
  Pt[e] = t, typeof t == "object" && t !== null && t.hasOwnProperty("init") && typeof t.init == "function" && Pt[e].init(), qi(Pt[e]);
}
function Na() {
  return Pt;
}
var ho = {};
function Ba(e, t) {
  let n = typeof t != "function" ? () => t : t;
  return e instanceof Element ? go(e, n()) : (ho[e] = n, () => {
  });
}
function Ha(e) {
  return Object.entries(ho).forEach(([t, n]) => {
    Object.defineProperty(e, t, {
      get() {
        return (...r) => n(...r);
      }
    });
  }), e;
}
function go(e, t, n) {
  let r = [];
  for (; r.length; )
    r.pop()();
  let i = Object.entries(t).map(([s, c]) => ({ name: s, value: c })), o = Yi(i);
  return i = i.map((s) => o.find((c) => c.name === s.name) ? {
    name: `x-bind:${s.name}`,
    value: `"${s.value}"`
  } : s), Jr(e, i, n).map((s) => {
    r.push(s.runCleanups), s();
  }), () => {
    for (; r.length; )
      r.pop()();
  };
}
var mo = {};
function qa(e, t) {
  mo[e] = t;
}
function Wa(e, t) {
  return Object.entries(mo).forEach(([n, r]) => {
    Object.defineProperty(e, n, {
      get() {
        return (...i) => r.bind(t)(...i);
      },
      enumerable: !1
    });
  }), e;
}
var Ua = {
  get reactive() {
    return en;
  },
  get release() {
    return tn;
  },
  get effect() {
    return Bt;
  },
  get raw() {
    return Ti;
  },
  version: "3.13.6",
  flushAndStopDeferringMutations: ea,
  dontAutoEvaluateFunctions: Vi,
  disableEffectScheduling: Uo,
  startObservingMutations: zr,
  stopObservingMutations: Bi,
  setReactivityEngine: Vo,
  onAttributeRemoved: Fi,
  onAttributesAdded: ki,
  closestDataStack: Zt,
  skipDuringClone: Ht,
  onlyDuringClone: wa,
  addRootSelector: Ii,
  addInitSelector: Li,
  interceptClone: Yn,
  addScopeToNode: _n,
  deferMutations: Qo,
  mapAttributes: Xr,
  evaluateLater: Fe,
  interceptInit: Go,
  setEvaluator: oa,
  mergeProxies: xn,
  extractProp: ja,
  findClosest: bn,
  onElRemoved: Wr,
  closestRoot: zn,
  destroyTree: qr,
  interceptor: Wi,
  // INTERNAL: not public API and is subject to change without major release.
  transition: Rr,
  // INTERNAL
  setStyles: Kn,
  // INTERNAL
  mutateDom: $e,
  directive: Oe,
  entangle: vo,
  throttle: po,
  debounce: fo,
  evaluate: kt,
  initTree: lt,
  nextTick: Qr,
  prefixed: nn,
  prefix: ca,
  plugin: ka,
  magic: Xe,
  store: Fa,
  start: Ko,
  clone: Oa,
  // INTERNAL
  cloneNode: Ea,
  // INTERNAL
  bound: Da,
  $data: Hi,
  watch: Si,
  walk: Ot,
  data: qa,
  bind: Ba
}, wn = Ua;
function Va(e, t) {
  const n = /* @__PURE__ */ Object.create(null), r = e.split(",");
  for (let i = 0; i < r.length; i++)
    n[r[i]] = !0;
  return t ? (i) => !!n[i.toLowerCase()] : (i) => !!n[i];
}
var za = Object.freeze({}), Ka = Object.prototype.hasOwnProperty, Gn = (e, t) => Ka.call(e, t), Ft = Array.isArray, mn = (e) => yo(e) === "[object Map]", Ya = (e) => typeof e == "string", ti = (e) => typeof e == "symbol", Jn = (e) => e !== null && typeof e == "object", Ga = Object.prototype.toString, yo = (e) => Ga.call(e), bo = (e) => yo(e).slice(8, -1), ni = (e) => Ya(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Ja = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Xa = Ja((e) => e.charAt(0).toUpperCase() + e.slice(1)), _o = (e, t) => e !== t && (e === e || t === t), Dr = /* @__PURE__ */ new WeakMap(), vn = [], it, Nt = Symbol("iterate"), jr = Symbol("Map key iterate");
function Za(e) {
  return e && e._isEffect === !0;
}
function Qa(e, t = za) {
  Za(e) && (e = e.raw);
  const n = ns(e, t);
  return t.lazy || n(), n;
}
function es(e) {
  e.active && (xo(e), e.options.onStop && e.options.onStop(), e.active = !1);
}
var ts = 0;
function ns(e, t) {
  const n = function() {
    if (!n.active)
      return e();
    if (!vn.includes(n)) {
      xo(n);
      try {
        return is(), vn.push(n), it = n, e();
      } finally {
        vn.pop(), wo(), it = vn[vn.length - 1];
      }
    }
  };
  return n.id = ts++, n.allowRecurse = !!t.allowRecurse, n._isEffect = !0, n.active = !0, n.raw = e, n.deps = [], n.options = t, n;
}
function xo(e) {
  const { deps: t } = e;
  if (t.length) {
    for (let n = 0; n < t.length; n++)
      t[n].delete(e);
    t.length = 0;
  }
}
var Qt = !0, ri = [];
function rs() {
  ri.push(Qt), Qt = !1;
}
function is() {
  ri.push(Qt), Qt = !0;
}
function wo() {
  const e = ri.pop();
  Qt = e === void 0 ? !0 : e;
}
function Je(e, t, n) {
  if (!Qt || it === void 0)
    return;
  let r = Dr.get(e);
  r || Dr.set(e, r = /* @__PURE__ */ new Map());
  let i = r.get(n);
  i || r.set(n, i = /* @__PURE__ */ new Set()), i.has(it) || (i.add(it), it.deps.push(i), it.options.onTrack && it.options.onTrack({
    effect: it,
    target: e,
    type: t,
    key: n
  }));
}
function Tt(e, t, n, r, i, o) {
  const s = Dr.get(e);
  if (!s)
    return;
  const c = /* @__PURE__ */ new Set(), v = (C) => {
    C && C.forEach((F) => {
      (F !== it || F.allowRecurse) && c.add(F);
    });
  };
  if (t === "clear")
    s.forEach(v);
  else if (n === "length" && Ft(e))
    s.forEach((C, F) => {
      (F === "length" || F >= r) && v(C);
    });
  else
    switch (n !== void 0 && v(s.get(n)), t) {
      case "add":
        Ft(e) ? ni(n) && v(s.get("length")) : (v(s.get(Nt)), mn(e) && v(s.get(jr)));
        break;
      case "delete":
        Ft(e) || (v(s.get(Nt)), mn(e) && v(s.get(jr)));
        break;
      case "set":
        mn(e) && v(s.get(Nt));
        break;
    }
  const _ = (C) => {
    C.options.onTrigger && C.options.onTrigger({
      effect: C,
      target: e,
      key: n,
      type: t,
      newValue: r,
      oldValue: i,
      oldTarget: o
    }), C.options.scheduler ? C.options.scheduler(C) : C();
  };
  c.forEach(_);
}
var os = /* @__PURE__ */ Va("__proto__,__v_isRef,__isVue"), Eo = new Set(Object.getOwnPropertyNames(Symbol).map((e) => Symbol[e]).filter(ti)), as = /* @__PURE__ */ Oo(), ss = /* @__PURE__ */ Oo(!0), gi = /* @__PURE__ */ us();
function us() {
  const e = {};
  return ["includes", "indexOf", "lastIndexOf"].forEach((t) => {
    e[t] = function(...n) {
      const r = ve(this);
      for (let o = 0, s = this.length; o < s; o++)
        Je(r, "get", o + "");
      const i = r[t](...n);
      return i === -1 || i === !1 ? r[t](...n.map(ve)) : i;
    };
  }), ["push", "pop", "shift", "unshift", "splice"].forEach((t) => {
    e[t] = function(...n) {
      rs();
      const r = ve(this)[t].apply(this, n);
      return wo(), r;
    };
  }), e;
}
function Oo(e = !1, t = !1) {
  return function(r, i, o) {
    if (i === "__v_isReactive")
      return !e;
    if (i === "__v_isReadonly")
      return e;
    if (i === "__v_raw" && o === (e ? t ? Os : Ao : t ? Es : So).get(r))
      return r;
    const s = Ft(r);
    if (!e && s && Gn(gi, i))
      return Reflect.get(gi, i, o);
    const c = Reflect.get(r, i, o);
    return (ti(i) ? Eo.has(i) : os(i)) || (e || Je(r, "get", i), t) ? c : kr(c) ? !s || !ni(i) ? c.value : c : Jn(c) ? e ? $o(c) : si(c) : c;
  };
}
var cs = /* @__PURE__ */ ls();
function ls(e = !1) {
  return function(n, r, i, o) {
    let s = n[r];
    if (!e && (i = ve(i), s = ve(s), !Ft(n) && kr(s) && !kr(i)))
      return s.value = i, !0;
    const c = Ft(n) && ni(r) ? Number(r) < n.length : Gn(n, r), v = Reflect.set(n, r, i, o);
    return n === ve(o) && (c ? _o(i, s) && Tt(n, "set", r, i, s) : Tt(n, "add", r, i)), v;
  };
}
function fs(e, t) {
  const n = Gn(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
  return i && n && Tt(e, "delete", t, void 0, r), i;
}
function ds(e, t) {
  const n = Reflect.has(e, t);
  return (!ti(t) || !Eo.has(t)) && Je(e, "has", t), n;
}
function ps(e) {
  return Je(e, "iterate", Ft(e) ? "length" : Nt), Reflect.ownKeys(e);
}
var vs = {
  get: as,
  set: cs,
  deleteProperty: fs,
  has: ds,
  ownKeys: ps
}, hs = {
  get: ss,
  set(e, t) {
    return console.warn(`Set operation on key "${String(t)}" failed: target is readonly.`, e), !0;
  },
  deleteProperty(e, t) {
    return console.warn(`Delete operation on key "${String(t)}" failed: target is readonly.`, e), !0;
  }
}, ii = (e) => Jn(e) ? si(e) : e, oi = (e) => Jn(e) ? $o(e) : e, ai = (e) => e, Xn = (e) => Reflect.getPrototypeOf(e);
function jn(e, t, n = !1, r = !1) {
  e = e.__v_raw;
  const i = ve(e), o = ve(t);
  t !== o && !n && Je(i, "get", t), !n && Je(i, "get", o);
  const { has: s } = Xn(i), c = r ? ai : n ? oi : ii;
  if (s.call(i, t))
    return c(e.get(t));
  if (s.call(i, o))
    return c(e.get(o));
  e !== i && e.get(t);
}
function kn(e, t = !1) {
  const n = this.__v_raw, r = ve(n), i = ve(e);
  return e !== i && !t && Je(r, "has", e), !t && Je(r, "has", i), e === i ? n.has(e) : n.has(e) || n.has(i);
}
function Fn(e, t = !1) {
  return e = e.__v_raw, !t && Je(ve(e), "iterate", Nt), Reflect.get(e, "size", e);
}
function mi(e) {
  e = ve(e);
  const t = ve(this);
  return Xn(t).has.call(t, e) || (t.add(e), Tt(t, "add", e, e)), this;
}
function yi(e, t) {
  t = ve(t);
  const n = ve(this), { has: r, get: i } = Xn(n);
  let o = r.call(n, e);
  o ? To(n, r, e) : (e = ve(e), o = r.call(n, e));
  const s = i.call(n, e);
  return n.set(e, t), o ? _o(t, s) && Tt(n, "set", e, t, s) : Tt(n, "add", e, t), this;
}
function bi(e) {
  const t = ve(this), { has: n, get: r } = Xn(t);
  let i = n.call(t, e);
  i ? To(t, n, e) : (e = ve(e), i = n.call(t, e));
  const o = r ? r.call(t, e) : void 0, s = t.delete(e);
  return i && Tt(t, "delete", e, void 0, o), s;
}
function _i() {
  const e = ve(this), t = e.size !== 0, n = mn(e) ? new Map(e) : new Set(e), r = e.clear();
  return t && Tt(e, "clear", void 0, void 0, n), r;
}
function Nn(e, t) {
  return function(r, i) {
    const o = this, s = o.__v_raw, c = ve(s), v = t ? ai : e ? oi : ii;
    return !e && Je(c, "iterate", Nt), s.forEach((_, C) => r.call(i, v(_), v(C), o));
  };
}
function Bn(e, t, n) {
  return function(...r) {
    const i = this.__v_raw, o = ve(i), s = mn(o), c = e === "entries" || e === Symbol.iterator && s, v = e === "keys" && s, _ = i[e](...r), C = n ? ai : t ? oi : ii;
    return !t && Je(o, "iterate", v ? jr : Nt), {
      // iterator protocol
      next() {
        const { value: F, done: j } = _.next();
        return j ? { value: F, done: j } : {
          value: c ? [C(F[0]), C(F[1])] : C(F),
          done: j
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function Et(e) {
  return function(...t) {
    {
      const n = t[0] ? `on key "${t[0]}" ` : "";
      console.warn(`${Xa(e)} operation ${n}failed: target is readonly.`, ve(this));
    }
    return e === "delete" ? !1 : this;
  };
}
function gs() {
  const e = {
    get(o) {
      return jn(this, o);
    },
    get size() {
      return Fn(this);
    },
    has: kn,
    add: mi,
    set: yi,
    delete: bi,
    clear: _i,
    forEach: Nn(!1, !1)
  }, t = {
    get(o) {
      return jn(this, o, !1, !0);
    },
    get size() {
      return Fn(this);
    },
    has: kn,
    add: mi,
    set: yi,
    delete: bi,
    clear: _i,
    forEach: Nn(!1, !0)
  }, n = {
    get(o) {
      return jn(this, o, !0);
    },
    get size() {
      return Fn(this, !0);
    },
    has(o) {
      return kn.call(this, o, !0);
    },
    add: Et(
      "add"
      /* ADD */
    ),
    set: Et(
      "set"
      /* SET */
    ),
    delete: Et(
      "delete"
      /* DELETE */
    ),
    clear: Et(
      "clear"
      /* CLEAR */
    ),
    forEach: Nn(!0, !1)
  }, r = {
    get(o) {
      return jn(this, o, !0, !0);
    },
    get size() {
      return Fn(this, !0);
    },
    has(o) {
      return kn.call(this, o, !0);
    },
    add: Et(
      "add"
      /* ADD */
    ),
    set: Et(
      "set"
      /* SET */
    ),
    delete: Et(
      "delete"
      /* DELETE */
    ),
    clear: Et(
      "clear"
      /* CLEAR */
    ),
    forEach: Nn(!0, !0)
  };
  return ["keys", "values", "entries", Symbol.iterator].forEach((o) => {
    e[o] = Bn(o, !1, !1), n[o] = Bn(o, !0, !1), t[o] = Bn(o, !1, !0), r[o] = Bn(o, !0, !0);
  }), [
    e,
    n,
    t,
    r
  ];
}
var [ms, ys, bs, _s] = /* @__PURE__ */ gs();
function Co(e, t) {
  const n = t ? e ? _s : bs : e ? ys : ms;
  return (r, i, o) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_raw" ? r : Reflect.get(Gn(n, i) && i in r ? n : r, i, o);
}
var xs = {
  get: /* @__PURE__ */ Co(!1, !1)
}, ws = {
  get: /* @__PURE__ */ Co(!0, !1)
};
function To(e, t, n) {
  const r = ve(n);
  if (r !== n && t.call(e, r)) {
    const i = bo(e);
    console.warn(`Reactive ${i} contains both the raw and reactive versions of the same object${i === "Map" ? " as keys" : ""}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
  }
}
var So = /* @__PURE__ */ new WeakMap(), Es = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), Os = /* @__PURE__ */ new WeakMap();
function Cs(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function Ts(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Cs(bo(e));
}
function si(e) {
  return e && e.__v_isReadonly ? e : Mo(e, !1, vs, xs, So);
}
function $o(e) {
  return Mo(e, !0, hs, ws, Ao);
}
function Mo(e, t, n, r, i) {
  if (!Jn(e))
    return console.warn(`value cannot be made reactive: ${String(e)}`), e;
  if (e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const o = i.get(e);
  if (o)
    return o;
  const s = Ts(e);
  if (s === 0)
    return e;
  const c = new Proxy(e, s === 2 ? r : n);
  return i.set(e, c), c;
}
function ve(e) {
  return e && ve(e.__v_raw) || e;
}
function kr(e) {
  return !!(e && e.__v_isRef === !0);
}
Xe("nextTick", () => Qr);
Xe("dispatch", (e) => gn.bind(gn, e));
Xe("watch", (e, { evaluateLater: t, cleanup: n }) => (r, i) => {
  let o = t(r), c = Si(() => {
    let v;
    return o((_) => v = _), v;
  }, i);
  n(c);
});
Xe("store", Na);
Xe("data", (e) => Hi(e));
Xe("root", (e) => zn(e));
Xe("refs", (e) => (e._x_refs_proxy || (e._x_refs_proxy = xn(Ss(e))), e._x_refs_proxy));
function Ss(e) {
  let t = [];
  return bn(e, (n) => {
    n._x_refs && t.push(n._x_refs);
  }), t;
}
var br = {};
function Io(e) {
  return br[e] || (br[e] = 0), ++br[e];
}
function As(e, t) {
  return bn(e, (n) => {
    if (n._x_ids && n._x_ids[t])
      return !0;
  });
}
function $s(e, t) {
  e._x_ids || (e._x_ids = {}), e._x_ids[t] || (e._x_ids[t] = Io(t));
}
Xe("id", (e, { cleanup: t }) => (n, r = null) => {
  let i = `${n}${r ? `-${r}` : ""}`;
  return Ms(e, i, t, () => {
    let o = As(e, n), s = o ? o._x_ids[n] : Io(n);
    return r ? `${n}-${s}-${r}` : `${n}-${s}`;
  });
});
Yn((e, t) => {
  e._x_id && (t._x_id = e._x_id);
});
function Ms(e, t, n, r) {
  if (e._x_id || (e._x_id = {}), e._x_id[t])
    return e._x_id[t];
  let i = r();
  return e._x_id[t] = i, n(() => {
    delete e._x_id[t];
  }), i;
}
Xe("el", (e) => e);
Lo("Focus", "focus", "focus");
Lo("Persist", "persist", "persist");
function Lo(e, t, n) {
  Xe(t, (r) => Ge(`You can't use [$${t}] without first installing the "${e}" plugin here: https://alpinejs.dev/plugins/${n}`, r));
}
Oe("modelable", (e, { expression: t }, { effect: n, evaluateLater: r, cleanup: i }) => {
  let o = r(t), s = () => {
    let C;
    return o((F) => C = F), C;
  }, c = r(`${t} = __placeholder`), v = (C) => c(() => {
  }, { scope: { __placeholder: C } }), _ = s();
  v(_), queueMicrotask(() => {
    if (!e._x_model)
      return;
    e._x_removeModelListeners.default();
    let C = e._x_model.get, F = e._x_model.set, j = vo(
      {
        get() {
          return C();
        },
        set(ae) {
          F(ae);
        }
      },
      {
        get() {
          return s();
        },
        set(ae) {
          v(ae);
        }
      }
    );
    i(j);
  });
});
Oe("teleport", (e, { modifiers: t, expression: n }, { cleanup: r }) => {
  e.tagName.toLowerCase() !== "template" && Ge("x-teleport can only be used on a <template> tag", e);
  let i = xi(n), o = e.content.cloneNode(!0).firstElementChild;
  e._x_teleport = o, o._x_teleportBack = e, e.setAttribute("data-teleport-template", !0), o.setAttribute("data-teleport-target", !0), e._x_forwardEvents && e._x_forwardEvents.forEach((c) => {
    o.addEventListener(c, (v) => {
      v.stopPropagation(), e.dispatchEvent(new v.constructor(v.type, v));
    });
  }), _n(o, {}, e);
  let s = (c, v, _) => {
    _.includes("prepend") ? v.parentNode.insertBefore(c, v) : _.includes("append") ? v.parentNode.insertBefore(c, v.nextSibling) : v.appendChild(c);
  };
  $e(() => {
    s(o, i, t), lt(o), o._x_ignore = !0;
  }), e._x_teleportPutBack = () => {
    let c = xi(n);
    $e(() => {
      s(e._x_teleport, c, t);
    });
  }, r(() => o.remove());
});
var Is = document.createElement("div");
function xi(e) {
  let t = Ht(() => document.querySelector(e), () => Is)();
  return t || Ge(`Cannot find x-teleport element for selector: "${e}"`), t;
}
var Ro = () => {
};
Ro.inline = (e, { modifiers: t }, { cleanup: n }) => {
  t.includes("self") ? e._x_ignoreSelf = !0 : e._x_ignore = !0, n(() => {
    t.includes("self") ? delete e._x_ignoreSelf : delete e._x_ignore;
  });
};
Oe("ignore", Ro);
Oe("effect", Ht((e, { expression: t }, { effect: n }) => {
  n(Fe(e, t));
}));
function Fr(e, t, n, r) {
  let i = e, o = (v) => r(v), s = {}, c = (v, _) => (C) => _(v, C);
  if (n.includes("dot") && (t = Ls(t)), n.includes("camel") && (t = Rs(t)), n.includes("passive") && (s.passive = !0), n.includes("capture") && (s.capture = !0), n.includes("window") && (i = window), n.includes("document") && (i = document), n.includes("debounce")) {
    let v = n[n.indexOf("debounce") + 1] || "invalid-wait", _ = Vn(v.split("ms")[0]) ? Number(v.split("ms")[0]) : 250;
    o = fo(o, _);
  }
  if (n.includes("throttle")) {
    let v = n[n.indexOf("throttle") + 1] || "invalid-wait", _ = Vn(v.split("ms")[0]) ? Number(v.split("ms")[0]) : 250;
    o = po(o, _);
  }
  return n.includes("prevent") && (o = c(o, (v, _) => {
    _.preventDefault(), v(_);
  })), n.includes("stop") && (o = c(o, (v, _) => {
    _.stopPropagation(), v(_);
  })), n.includes("self") && (o = c(o, (v, _) => {
    _.target === e && v(_);
  })), (n.includes("away") || n.includes("outside")) && (i = document, o = c(o, (v, _) => {
    e.contains(_.target) || _.target.isConnected !== !1 && (e.offsetWidth < 1 && e.offsetHeight < 1 || e._x_isShown !== !1 && v(_));
  })), n.includes("once") && (o = c(o, (v, _) => {
    v(_), i.removeEventListener(t, o, s);
  })), o = c(o, (v, _) => {
    Ds(t) && js(_, n) || v(_);
  }), i.addEventListener(t, o, s), () => {
    i.removeEventListener(t, o, s);
  };
}
function Ls(e) {
  return e.replace(/-/g, ".");
}
function Rs(e) {
  return e.toLowerCase().replace(/-(\w)/g, (t, n) => n.toUpperCase());
}
function Vn(e) {
  return !Array.isArray(e) && !isNaN(e);
}
function Ps(e) {
  return [" ", "_"].includes(
    e
  ) ? e : e.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]/, "-").toLowerCase();
}
function Ds(e) {
  return ["keydown", "keyup"].includes(e);
}
function js(e, t) {
  let n = t.filter((o) => !["window", "document", "prevent", "stop", "once", "capture"].includes(o));
  if (n.includes("debounce")) {
    let o = n.indexOf("debounce");
    n.splice(o, Vn((n[o + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
  }
  if (n.includes("throttle")) {
    let o = n.indexOf("throttle");
    n.splice(o, Vn((n[o + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
  }
  if (n.length === 0 || n.length === 1 && wi(e.key).includes(n[0]))
    return !1;
  const i = ["ctrl", "shift", "alt", "meta", "cmd", "super"].filter((o) => n.includes(o));
  return n = n.filter((o) => !i.includes(o)), !(i.length > 0 && i.filter((s) => ((s === "cmd" || s === "super") && (s = "meta"), e[`${s}Key`])).length === i.length && wi(e.key).includes(n[0]));
}
function wi(e) {
  if (!e)
    return [];
  e = Ps(e);
  let t = {
    ctrl: "control",
    slash: "/",
    space: " ",
    spacebar: " ",
    cmd: "meta",
    esc: "escape",
    up: "arrow-up",
    down: "arrow-down",
    left: "arrow-left",
    right: "arrow-right",
    period: ".",
    equal: "=",
    minus: "-",
    underscore: "_"
  };
  return t[e] = e, Object.keys(t).map((n) => {
    if (t[n] === e)
      return n;
  }).filter((n) => n);
}
Oe("model", (e, { modifiers: t, expression: n }, { effect: r, cleanup: i }) => {
  let o = e;
  t.includes("parent") && (o = e.parentNode);
  let s = Fe(o, n), c;
  typeof n == "string" ? c = Fe(o, `${n} = __placeholder`) : typeof n == "function" && typeof n() == "string" ? c = Fe(o, `${n()} = __placeholder`) : c = () => {
  };
  let v = () => {
    let j;
    return s((ae) => j = ae), Ei(j) ? j.get() : j;
  }, _ = (j) => {
    let ae;
    s((Ne) => ae = Ne), Ei(ae) ? ae.set(j) : c(() => {
    }, {
      scope: { __placeholder: j }
    });
  };
  typeof n == "string" && e.type === "radio" && $e(() => {
    e.hasAttribute("name") || e.setAttribute("name", n);
  });
  var C = e.tagName.toLowerCase() === "select" || ["checkbox", "radio"].includes(e.type) || t.includes("lazy") ? "change" : "input";
  let F = Ct ? () => {
  } : Fr(e, C, t, (j) => {
    _(ks(e, t, j, v()));
  });
  if (t.includes("fill") && ([void 0, null, ""].includes(v()) || e.type === "checkbox" && Array.isArray(v())) && e.dispatchEvent(new Event(C, {})), e._x_removeModelListeners || (e._x_removeModelListeners = {}), e._x_removeModelListeners.default = F, i(() => e._x_removeModelListeners.default()), e.form) {
    let j = Fr(e.form, "reset", [], (ae) => {
      Qr(() => e._x_model && e._x_model.set(e.value));
    });
    i(() => j());
  }
  e._x_model = {
    get() {
      return v();
    },
    set(j) {
      _(j);
    }
  }, e._x_forceModelUpdate = (j) => {
    j === void 0 && typeof n == "string" && n.match(/\./) && (j = ""), window.fromModel = !0, $e(() => so(e, "value", j)), delete window.fromModel;
  }, r(() => {
    let j = v();
    t.includes("unintrusive") && document.activeElement.isSameNode(e) || e._x_forceModelUpdate(j);
  });
});
function ks(e, t, n, r) {
  return $e(() => {
    if (n instanceof CustomEvent && n.detail !== void 0)
      return n.detail !== null && n.detail !== void 0 ? n.detail : n.target.value;
    if (e.type === "checkbox")
      if (Array.isArray(r)) {
        let i = null;
        return t.includes("number") ? i = _r(n.target.value) : t.includes("boolean") ? i = qn(n.target.value) : i = n.target.value, n.target.checked ? r.concat([i]) : r.filter((o) => !Fs(o, i));
      } else
        return n.target.checked;
    else
      return e.tagName.toLowerCase() === "select" && e.multiple ? t.includes("number") ? Array.from(n.target.selectedOptions).map((i) => {
        let o = i.value || i.text;
        return _r(o);
      }) : t.includes("boolean") ? Array.from(n.target.selectedOptions).map((i) => {
        let o = i.value || i.text;
        return qn(o);
      }) : Array.from(n.target.selectedOptions).map((i) => i.value || i.text) : t.includes("number") ? _r(n.target.value) : t.includes("boolean") ? qn(n.target.value) : t.includes("trim") ? n.target.value.trim() : n.target.value;
  });
}
function _r(e) {
  let t = e ? parseFloat(e) : null;
  return Ns(t) ? t : e;
}
function Fs(e, t) {
  return e == t;
}
function Ns(e) {
  return !Array.isArray(e) && !isNaN(e);
}
function Ei(e) {
  return e !== null && typeof e == "object" && typeof e.get == "function" && typeof e.set == "function";
}
Oe("cloak", (e) => queueMicrotask(() => $e(() => e.removeAttribute(nn("cloak")))));
Li(() => `[${nn("init")}]`);
Oe("init", Ht((e, { expression: t }, { evaluate: n }) => typeof t == "string" ? !!t.trim() && n(t, {}, !1) : n(t, {}, !1)));
Oe("text", (e, { expression: t }, { effect: n, evaluateLater: r }) => {
  let i = r(t);
  n(() => {
    i((o) => {
      $e(() => {
        e.textContent = o;
      });
    });
  });
});
Oe("html", (e, { expression: t }, { effect: n, evaluateLater: r }) => {
  let i = r(t);
  n(() => {
    i((o) => {
      $e(() => {
        e.innerHTML = o, e._x_ignoreSelf = !0, lt(e), delete e._x_ignoreSelf;
      });
    });
  });
});
Xr(Xi(":", Zi(nn("bind:"))));
var Po = (e, { value: t, modifiers: n, expression: r, original: i }, { effect: o }) => {
  if (!t) {
    let c = {};
    Ha(c), Fe(e, r)((_) => {
      go(e, _, i);
    }, { scope: c });
    return;
  }
  if (t === "key")
    return Bs(e, r);
  if (e._x_inlineBindings && e._x_inlineBindings[t] && e._x_inlineBindings[t].extract)
    return;
  let s = Fe(e, r);
  o(() => s((c) => {
    c === void 0 && typeof r == "string" && r.match(/\./) && (c = ""), $e(() => so(e, t, c, n));
  }));
};
Po.inline = (e, { value: t, modifiers: n, expression: r }) => {
  t && (e._x_inlineBindings || (e._x_inlineBindings = {}), e._x_inlineBindings[t] = { expression: r, extract: !1 });
};
Oe("bind", Po);
function Bs(e, t) {
  e._x_keyExpression = t;
}
Ii(() => `[${nn("data")}]`);
Oe("data", (e, { expression: t }, { cleanup: n }) => {
  if (Hs(e))
    return;
  t = t === "" ? "{}" : t;
  let r = {};
  Tr(r, e);
  let i = {};
  Wa(i, r);
  let o = kt(e, t, { scope: i });
  (o === void 0 || o === !0) && (o = {}), Tr(o, e);
  let s = en(o);
  qi(s);
  let c = _n(e, s);
  s.init && kt(e, s.init), n(() => {
    s.destroy && kt(e, s.destroy), c();
  });
});
Yn((e, t) => {
  e._x_dataStack && (t._x_dataStack = e._x_dataStack, t.setAttribute("data-has-alpine-state", !0));
});
function Hs(e) {
  return Ct ? Pr ? !0 : e.hasAttribute("data-has-alpine-state") : !1;
}
Oe("show", (e, { modifiers: t, expression: n }, { effect: r }) => {
  let i = Fe(e, n);
  e._x_doHide || (e._x_doHide = () => {
    $e(() => {
      e.style.setProperty("display", "none", t.includes("important") ? "important" : void 0);
    });
  }), e._x_doShow || (e._x_doShow = () => {
    $e(() => {
      e.style.length === 1 && e.style.display === "none" ? e.removeAttribute("style") : e.style.removeProperty("display");
    });
  });
  let o = () => {
    e._x_doHide(), e._x_isShown = !1;
  }, s = () => {
    e._x_doShow(), e._x_isShown = !0;
  }, c = () => setTimeout(s), v = Lr(
    (F) => F ? s() : o(),
    (F) => {
      typeof e._x_toggleAndCascadeWithTransitions == "function" ? e._x_toggleAndCascadeWithTransitions(e, F, s, o) : F ? c() : o();
    }
  ), _, C = !0;
  r(() => i((F) => {
    !C && F === _ || (t.includes("immediate") && (F ? c() : o()), v(F), _ = F, C = !1);
  }));
});
Oe("for", (e, { expression: t }, { effect: n, cleanup: r }) => {
  let i = Ws(t), o = Fe(e, i.items), s = Fe(
    e,
    // the x-bind:key expression is stored for our use instead of evaluated.
    e._x_keyExpression || "index"
  );
  e._x_prevKeys = [], e._x_lookup = {}, n(() => qs(e, i, o, s)), r(() => {
    Object.values(e._x_lookup).forEach((c) => c.remove()), delete e._x_prevKeys, delete e._x_lookup;
  });
});
function qs(e, t, n, r) {
  let i = (s) => typeof s == "object" && !Array.isArray(s), o = e;
  n((s) => {
    Us(s) && s >= 0 && (s = Array.from(Array(s).keys(), (R) => R + 1)), s === void 0 && (s = []);
    let c = e._x_lookup, v = e._x_prevKeys, _ = [], C = [];
    if (i(s))
      s = Object.entries(s).map(([R, te]) => {
        let ie = Oi(t, te, R, s);
        r((xe) => {
          C.includes(xe) && Ge("Duplicate key on x-for", e), C.push(xe);
        }, { scope: { index: R, ...ie } }), _.push(ie);
      });
    else
      for (let R = 0; R < s.length; R++) {
        let te = Oi(t, s[R], R, s);
        r((ie) => {
          C.includes(ie) && Ge("Duplicate key on x-for", e), C.push(ie);
        }, { scope: { index: R, ...te } }), _.push(te);
      }
    let F = [], j = [], ae = [], Ne = [];
    for (let R = 0; R < v.length; R++) {
      let te = v[R];
      C.indexOf(te) === -1 && ae.push(te);
    }
    v = v.filter((R) => !ae.includes(R));
    let Ze = "template";
    for (let R = 0; R < C.length; R++) {
      let te = C[R], ie = v.indexOf(te);
      if (ie === -1)
        v.splice(R, 0, te), F.push([Ze, R]);
      else if (ie !== R) {
        let xe = v.splice(R, 1)[0], be = v.splice(ie - 1, 1)[0];
        v.splice(R, 0, be), v.splice(ie, 0, xe), j.push([xe, be]);
      } else
        Ne.push(te);
      Ze = te;
    }
    for (let R = 0; R < ae.length; R++) {
      let te = ae[R];
      c[te]._x_effects && c[te]._x_effects.forEach(Ci), c[te].remove(), c[te] = null, delete c[te];
    }
    for (let R = 0; R < j.length; R++) {
      let [te, ie] = j[R], xe = c[te], be = c[ie], Qe = document.createElement("div");
      $e(() => {
        be || Ge('x-for ":key" is undefined or invalid', o, ie, c), be.after(Qe), xe.after(be), be._x_currentIfEl && be.after(be._x_currentIfEl), Qe.before(xe), xe._x_currentIfEl && xe.after(xe._x_currentIfEl), Qe.remove();
      }), be._x_refreshXForScope(_[C.indexOf(ie)]);
    }
    for (let R = 0; R < F.length; R++) {
      let [te, ie] = F[R], xe = te === "template" ? o : c[te];
      xe._x_currentIfEl && (xe = xe._x_currentIfEl);
      let be = _[ie], Qe = C[ie], Ce = document.importNode(o.content, !0).firstElementChild, we = en(be);
      _n(Ce, we, o), Ce._x_refreshXForScope = (De) => {
        Object.entries(De).forEach(([Me, Ie]) => {
          we[Me] = Ie;
        });
      }, $e(() => {
        xe.after(Ce), Ht(() => lt(Ce))();
      }), typeof Qe == "object" && Ge("x-for key cannot be an object, it must be a string or an integer", o), c[Qe] = Ce;
    }
    for (let R = 0; R < Ne.length; R++)
      c[Ne[R]]._x_refreshXForScope(_[C.indexOf(Ne[R])]);
    o._x_prevKeys = C;
  });
}
function Ws(e) {
  let t = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/, n = /^\s*\(|\)\s*$/g, r = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/, i = e.match(r);
  if (!i)
    return;
  let o = {};
  o.items = i[2].trim();
  let s = i[1].replace(n, "").trim(), c = s.match(t);
  return c ? (o.item = s.replace(t, "").trim(), o.index = c[1].trim(), c[2] && (o.collection = c[2].trim())) : o.item = s, o;
}
function Oi(e, t, n, r) {
  let i = {};
  return /^\[.*\]$/.test(e.item) && Array.isArray(t) ? e.item.replace("[", "").replace("]", "").split(",").map((s) => s.trim()).forEach((s, c) => {
    i[s] = t[c];
  }) : /^\{.*\}$/.test(e.item) && !Array.isArray(t) && typeof t == "object" ? e.item.replace("{", "").replace("}", "").split(",").map((s) => s.trim()).forEach((s) => {
    i[s] = t[s];
  }) : i[e.item] = t, e.index && (i[e.index] = n), e.collection && (i[e.collection] = r), i;
}
function Us(e) {
  return !Array.isArray(e) && !isNaN(e);
}
function Do() {
}
Do.inline = (e, { expression: t }, { cleanup: n }) => {
  let r = zn(e);
  r._x_refs || (r._x_refs = {}), r._x_refs[t] = e, n(() => delete r._x_refs[t]);
};
Oe("ref", Do);
Oe("if", (e, { expression: t }, { effect: n, cleanup: r }) => {
  e.tagName.toLowerCase() !== "template" && Ge("x-if can only be used on a <template> tag", e);
  let i = Fe(e, t), o = () => {
    if (e._x_currentIfEl)
      return e._x_currentIfEl;
    let c = e.content.cloneNode(!0).firstElementChild;
    return _n(c, {}, e), $e(() => {
      e.after(c), Ht(() => lt(c))();
    }), e._x_currentIfEl = c, e._x_undoIf = () => {
      Ot(c, (v) => {
        v._x_effects && v._x_effects.forEach(Ci);
      }), c.remove(), delete e._x_currentIfEl;
    }, c;
  }, s = () => {
    e._x_undoIf && (e._x_undoIf(), delete e._x_undoIf);
  };
  n(() => i((c) => {
    c ? o() : s();
  })), r(() => e._x_undoIf && e._x_undoIf());
});
Oe("id", (e, { expression: t }, { evaluate: n }) => {
  n(t).forEach((i) => $s(e, i));
});
Yn((e, t) => {
  e._x_ids && (t._x_ids = e._x_ids);
});
Xr(Xi("@", Zi(nn("on:"))));
Oe("on", Ht((e, { value: t, modifiers: n, expression: r }, { cleanup: i }) => {
  let o = r ? Fe(e, r) : () => {
  };
  e.tagName.toLowerCase() === "template" && (e._x_forwardEvents || (e._x_forwardEvents = []), e._x_forwardEvents.includes(t) || e._x_forwardEvents.push(t));
  let s = Fr(e, t, n, (c) => {
    o(() => {
    }, { scope: { $event: c }, params: [c] });
  });
  i(() => s());
}));
Zn("Collapse", "collapse", "collapse");
Zn("Intersect", "intersect", "intersect");
Zn("Focus", "trap", "focus");
Zn("Mask", "mask", "mask");
function Zn(e, t, n) {
  Oe(t, (r) => Ge(`You can't use [x-${t}] without first installing the "${e}" plugin here: https://alpinejs.dev/plugins/${n}`, r));
}
wn.setEvaluator(Ki);
wn.setReactivityEngine({ reactive: si, effect: Qa, release: es, raw: ve });
var Vs = wn, jo = Vs, zs = Object.create, ui = Object.defineProperty, Ks = Object.getPrototypeOf, Ys = Object.prototype.hasOwnProperty, Gs = Object.getOwnPropertyNames, Js = Object.getOwnPropertyDescriptor, Xs = (e) => ui(e, "__esModule", { value: !0 }), ko = (e, t) => () => (t || (t = { exports: {} }, e(t.exports, t)), t.exports), Zs = (e, t, n) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let r of Gs(t))
      !Ys.call(e, r) && r !== "default" && ui(e, r, { get: () => t[r], enumerable: !(n = Js(t, r)) || n.enumerable });
  return e;
}, Fo = (e) => Zs(Xs(ui(e != null ? zs(Ks(e)) : {}, "default", e && e.__esModule && "default" in e ? { get: () => e.default, enumerable: !0 } : { value: e, enumerable: !0 })), e), Qs = ko((e) => {
  Object.defineProperty(e, "__esModule", { value: !0 });
  function t(u) {
    var a = u.getBoundingClientRect();
    return {
      width: a.width,
      height: a.height,
      top: a.top,
      right: a.right,
      bottom: a.bottom,
      left: a.left,
      x: a.left,
      y: a.top
    };
  }
  function n(u) {
    if (u == null)
      return window;
    if (u.toString() !== "[object Window]") {
      var a = u.ownerDocument;
      return a && a.defaultView || window;
    }
    return u;
  }
  function r(u) {
    var a = n(u), f = a.pageXOffset, m = a.pageYOffset;
    return {
      scrollLeft: f,
      scrollTop: m
    };
  }
  function i(u) {
    var a = n(u).Element;
    return u instanceof a || u instanceof Element;
  }
  function o(u) {
    var a = n(u).HTMLElement;
    return u instanceof a || u instanceof HTMLElement;
  }
  function s(u) {
    if (typeof ShadowRoot > "u")
      return !1;
    var a = n(u).ShadowRoot;
    return u instanceof a || u instanceof ShadowRoot;
  }
  function c(u) {
    return {
      scrollLeft: u.scrollLeft,
      scrollTop: u.scrollTop
    };
  }
  function v(u) {
    return u === n(u) || !o(u) ? r(u) : c(u);
  }
  function _(u) {
    return u ? (u.nodeName || "").toLowerCase() : null;
  }
  function C(u) {
    return ((i(u) ? u.ownerDocument : u.document) || window.document).documentElement;
  }
  function F(u) {
    return t(C(u)).left + r(u).scrollLeft;
  }
  function j(u) {
    return n(u).getComputedStyle(u);
  }
  function ae(u) {
    var a = j(u), f = a.overflow, m = a.overflowX, y = a.overflowY;
    return /auto|scroll|overlay|hidden/.test(f + y + m);
  }
  function Ne(u, a, f) {
    f === void 0 && (f = !1);
    var m = C(a), y = t(u), w = o(a), S = {
      scrollLeft: 0,
      scrollTop: 0
    }, O = {
      x: 0,
      y: 0
    };
    return (w || !w && !f) && ((_(a) !== "body" || ae(m)) && (S = v(a)), o(a) ? (O = t(a), O.x += a.clientLeft, O.y += a.clientTop) : m && (O.x = F(m))), {
      x: y.left + S.scrollLeft - O.x,
      y: y.top + S.scrollTop - O.y,
      width: y.width,
      height: y.height
    };
  }
  function Ze(u) {
    var a = t(u), f = u.offsetWidth, m = u.offsetHeight;
    return Math.abs(a.width - f) <= 1 && (f = a.width), Math.abs(a.height - m) <= 1 && (m = a.height), {
      x: u.offsetLeft,
      y: u.offsetTop,
      width: f,
      height: m
    };
  }
  function R(u) {
    return _(u) === "html" ? u : u.assignedSlot || u.parentNode || (s(u) ? u.host : null) || C(u);
  }
  function te(u) {
    return ["html", "body", "#document"].indexOf(_(u)) >= 0 ? u.ownerDocument.body : o(u) && ae(u) ? u : te(R(u));
  }
  function ie(u, a) {
    var f;
    a === void 0 && (a = []);
    var m = te(u), y = m === ((f = u.ownerDocument) == null ? void 0 : f.body), w = n(m), S = y ? [w].concat(w.visualViewport || [], ae(m) ? m : []) : m, O = a.concat(S);
    return y ? O : O.concat(ie(R(S)));
  }
  function xe(u) {
    return ["table", "td", "th"].indexOf(_(u)) >= 0;
  }
  function be(u) {
    return !o(u) || j(u).position === "fixed" ? null : u.offsetParent;
  }
  function Qe(u) {
    var a = navigator.userAgent.toLowerCase().indexOf("firefox") !== -1, f = navigator.userAgent.indexOf("Trident") !== -1;
    if (f && o(u)) {
      var m = j(u);
      if (m.position === "fixed")
        return null;
    }
    for (var y = R(u); o(y) && ["html", "body"].indexOf(_(y)) < 0; ) {
      var w = j(y);
      if (w.transform !== "none" || w.perspective !== "none" || w.contain === "paint" || ["transform", "perspective"].indexOf(w.willChange) !== -1 || a && w.willChange === "filter" || a && w.filter && w.filter !== "none")
        return y;
      y = y.parentNode;
    }
    return null;
  }
  function Ce(u) {
    for (var a = n(u), f = be(u); f && xe(f) && j(f).position === "static"; )
      f = be(f);
    return f && (_(f) === "html" || _(f) === "body" && j(f).position === "static") ? a : f || Qe(u) || a;
  }
  var we = "top", De = "bottom", Me = "right", Ie = "left", qt = "auto", ot = [we, De, Me, Ie], qe = "start", Wt = "end", Qn = "clippingParents", Ut = "viewport", Le = "popper", En = "reference", On = /* @__PURE__ */ ot.reduce(function(u, a) {
    return u.concat([a + "-" + qe, a + "-" + Wt]);
  }, []), rn = /* @__PURE__ */ [].concat(ot, [qt]).reduce(function(u, a) {
    return u.concat([a, a + "-" + qe, a + "-" + Wt]);
  }, []), er = "beforeRead", tr = "read", nr = "afterRead", rr = "beforeMain", ir = "main", ft = "afterMain", Cn = "beforeWrite", or = "write", Tn = "afterWrite", at = [er, tr, nr, rr, ir, ft, Cn, or, Tn];
  function ar(u) {
    var a = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Set(), m = [];
    u.forEach(function(w) {
      a.set(w.name, w);
    });
    function y(w) {
      f.add(w.name);
      var S = [].concat(w.requires || [], w.requiresIfExists || []);
      S.forEach(function(O) {
        if (!f.has(O)) {
          var I = a.get(O);
          I && y(I);
        }
      }), m.push(w);
    }
    return u.forEach(function(w) {
      f.has(w.name) || y(w);
    }), m;
  }
  function Ue(u) {
    var a = ar(u);
    return at.reduce(function(f, m) {
      return f.concat(a.filter(function(y) {
        return y.phase === m;
      }));
    }, []);
  }
  function dt(u) {
    var a;
    return function() {
      return a || (a = new Promise(function(f) {
        Promise.resolve().then(function() {
          a = void 0, f(u());
        });
      })), a;
    };
  }
  function et(u) {
    for (var a = arguments.length, f = new Array(a > 1 ? a - 1 : 0), m = 1; m < a; m++)
      f[m - 1] = arguments[m];
    return [].concat(f).reduce(function(y, w) {
      return y.replace(/%s/, w);
    }, u);
  }
  var tt = 'Popper: modifier "%s" provided an invalid %s property, expected %s but got %s', sr = 'Popper: modifier "%s" requires "%s", but "%s" modifier is not available', Re = ["name", "enabled", "phase", "fn", "effect", "requires", "options"];
  function ur(u) {
    u.forEach(function(a) {
      Object.keys(a).forEach(function(f) {
        switch (f) {
          case "name":
            typeof a.name != "string" && console.error(et(tt, String(a.name), '"name"', '"string"', '"' + String(a.name) + '"'));
            break;
          case "enabled":
            typeof a.enabled != "boolean" && console.error(et(tt, a.name, '"enabled"', '"boolean"', '"' + String(a.enabled) + '"'));
          case "phase":
            at.indexOf(a.phase) < 0 && console.error(et(tt, a.name, '"phase"', "either " + at.join(", "), '"' + String(a.phase) + '"'));
            break;
          case "fn":
            typeof a.fn != "function" && console.error(et(tt, a.name, '"fn"', '"function"', '"' + String(a.fn) + '"'));
            break;
          case "effect":
            typeof a.effect != "function" && console.error(et(tt, a.name, '"effect"', '"function"', '"' + String(a.fn) + '"'));
            break;
          case "requires":
            Array.isArray(a.requires) || console.error(et(tt, a.name, '"requires"', '"array"', '"' + String(a.requires) + '"'));
            break;
          case "requiresIfExists":
            Array.isArray(a.requiresIfExists) || console.error(et(tt, a.name, '"requiresIfExists"', '"array"', '"' + String(a.requiresIfExists) + '"'));
            break;
          case "options":
          case "data":
            break;
          default:
            console.error('PopperJS: an invalid property has been provided to the "' + a.name + '" modifier, valid properties are ' + Re.map(function(m) {
              return '"' + m + '"';
            }).join(", ") + '; but "' + f + '" was provided.');
        }
        a.requires && a.requires.forEach(function(m) {
          u.find(function(y) {
            return y.name === m;
          }) == null && console.error(et(sr, String(a.name), m, m));
        });
      });
    });
  }
  function cr(u, a) {
    var f = /* @__PURE__ */ new Set();
    return u.filter(function(m) {
      var y = a(m);
      if (!f.has(y))
        return f.add(y), !0;
    });
  }
  function Be(u) {
    return u.split("-")[0];
  }
  function lr(u) {
    var a = u.reduce(function(f, m) {
      var y = f[m.name];
      return f[m.name] = y ? Object.assign({}, y, m, {
        options: Object.assign({}, y.options, m.options),
        data: Object.assign({}, y.data, m.data)
      }) : m, f;
    }, {});
    return Object.keys(a).map(function(f) {
      return a[f];
    });
  }
  function Sn(u) {
    var a = n(u), f = C(u), m = a.visualViewport, y = f.clientWidth, w = f.clientHeight, S = 0, O = 0;
    return m && (y = m.width, w = m.height, /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || (S = m.offsetLeft, O = m.offsetTop)), {
      width: y,
      height: w,
      x: S + F(u),
      y: O
    };
  }
  var Ve = Math.max, St = Math.min, pt = Math.round;
  function An(u) {
    var a, f = C(u), m = r(u), y = (a = u.ownerDocument) == null ? void 0 : a.body, w = Ve(f.scrollWidth, f.clientWidth, y ? y.scrollWidth : 0, y ? y.clientWidth : 0), S = Ve(f.scrollHeight, f.clientHeight, y ? y.scrollHeight : 0, y ? y.clientHeight : 0), O = -m.scrollLeft + F(u), I = -m.scrollTop;
    return j(y || f).direction === "rtl" && (O += Ve(f.clientWidth, y ? y.clientWidth : 0) - w), {
      width: w,
      height: S,
      x: O,
      y: I
    };
  }
  function on(u, a) {
    var f = a.getRootNode && a.getRootNode();
    if (u.contains(a))
      return !0;
    if (f && s(f)) {
      var m = a;
      do {
        if (m && u.isSameNode(m))
          return !0;
        m = m.parentNode || m.host;
      } while (m);
    }
    return !1;
  }
  function vt(u) {
    return Object.assign({}, u, {
      left: u.x,
      top: u.y,
      right: u.x + u.width,
      bottom: u.y + u.height
    });
  }
  function $n(u) {
    var a = t(u);
    return a.top = a.top + u.clientTop, a.left = a.left + u.clientLeft, a.bottom = a.top + u.clientHeight, a.right = a.left + u.clientWidth, a.width = u.clientWidth, a.height = u.clientHeight, a.x = a.left, a.y = a.top, a;
  }
  function Mn(u, a) {
    return a === Ut ? vt(Sn(u)) : o(a) ? $n(a) : vt(An(C(u)));
  }
  function Vt(u) {
    var a = ie(R(u)), f = ["absolute", "fixed"].indexOf(j(u).position) >= 0, m = f && o(u) ? Ce(u) : u;
    return i(m) ? a.filter(function(y) {
      return i(y) && on(y, m) && _(y) !== "body";
    }) : [];
  }
  function zt(u, a, f) {
    var m = a === "clippingParents" ? Vt(u) : [].concat(a), y = [].concat(m, [f]), w = y[0], S = y.reduce(function(O, I) {
      var B = Mn(u, I);
      return O.top = Ve(B.top, O.top), O.right = St(B.right, O.right), O.bottom = St(B.bottom, O.bottom), O.left = Ve(B.left, O.left), O;
    }, Mn(u, w));
    return S.width = S.right - S.left, S.height = S.bottom - S.top, S.x = S.left, S.y = S.top, S;
  }
  function At(u) {
    return u.split("-")[1];
  }
  function We(u) {
    return ["top", "bottom"].indexOf(u) >= 0 ? "x" : "y";
  }
  function In(u) {
    var a = u.reference, f = u.element, m = u.placement, y = m ? Be(m) : null, w = m ? At(m) : null, S = a.x + a.width / 2 - f.width / 2, O = a.y + a.height / 2 - f.height / 2, I;
    switch (y) {
      case we:
        I = {
          x: S,
          y: a.y - f.height
        };
        break;
      case De:
        I = {
          x: S,
          y: a.y + a.height
        };
        break;
      case Me:
        I = {
          x: a.x + a.width,
          y: O
        };
        break;
      case Ie:
        I = {
          x: a.x - f.width,
          y: O
        };
        break;
      default:
        I = {
          x: a.x,
          y: a.y
        };
    }
    var B = y ? We(y) : null;
    if (B != null) {
      var A = B === "y" ? "height" : "width";
      switch (w) {
        case qe:
          I[B] = I[B] - (a[A] / 2 - f[A] / 2);
          break;
        case Wt:
          I[B] = I[B] + (a[A] / 2 - f[A] / 2);
          break;
      }
    }
    return I;
  }
  function Ln() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }
  function Rn(u) {
    return Object.assign({}, Ln(), u);
  }
  function Pn(u, a) {
    return a.reduce(function(f, m) {
      return f[m] = u, f;
    }, {});
  }
  function ht(u, a) {
    a === void 0 && (a = {});
    var f = a, m = f.placement, y = m === void 0 ? u.placement : m, w = f.boundary, S = w === void 0 ? Qn : w, O = f.rootBoundary, I = O === void 0 ? Ut : O, B = f.elementContext, A = B === void 0 ? Le : B, ne = f.altBoundary, de = ne === void 0 ? !1 : ne, ee = f.padding, X = ee === void 0 ? 0 : ee, ue = Rn(typeof X != "number" ? X : Pn(X, ot)), Z = A === Le ? En : Le, ge = u.elements.reference, ce = u.rects.popper, me = u.elements[de ? Z : A], q = zt(i(me) ? me : me.contextElement || C(u.elements.popper), S, I), se = t(ge), re = In({
      reference: se,
      element: ce,
      strategy: "absolute",
      placement: y
    }), pe = vt(Object.assign({}, ce, re)), fe = A === Le ? pe : se, Ee = {
      top: q.top - fe.top + ue.top,
      bottom: fe.bottom - q.bottom + ue.bottom,
      left: q.left - fe.left + ue.left,
      right: fe.right - q.right + ue.right
    }, ye = u.modifiersData.offset;
    if (A === Le && ye) {
      var _e = ye[y];
      Object.keys(Ee).forEach(function(Ye) {
        var Pe = [Me, De].indexOf(Ye) >= 0 ? 1 : -1, ut = [we, De].indexOf(Ye) >= 0 ? "y" : "x";
        Ee[Ye] += _e[ut] * Pe;
      });
    }
    return Ee;
  }
  var Dn = "Popper: Invalid reference or popper argument provided. They must be either a DOM element or virtual element.", fr = "Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.", Kt = {
    placement: "bottom",
    modifiers: [],
    strategy: "absolute"
  };
  function $t() {
    for (var u = arguments.length, a = new Array(u), f = 0; f < u; f++)
      a[f] = arguments[f];
    return !a.some(function(m) {
      return !(m && typeof m.getBoundingClientRect == "function");
    });
  }
  function Yt(u) {
    u === void 0 && (u = {});
    var a = u, f = a.defaultModifiers, m = f === void 0 ? [] : f, y = a.defaultOptions, w = y === void 0 ? Kt : y;
    return function(O, I, B) {
      B === void 0 && (B = w);
      var A = {
        placement: "bottom",
        orderedModifiers: [],
        options: Object.assign({}, Kt, w),
        modifiersData: {},
        elements: {
          reference: O,
          popper: I
        },
        attributes: {},
        styles: {}
      }, ne = [], de = !1, ee = {
        state: A,
        setOptions: function(ge) {
          ue(), A.options = Object.assign({}, w, A.options, ge), A.scrollParents = {
            reference: i(O) ? ie(O) : O.contextElement ? ie(O.contextElement) : [],
            popper: ie(I)
          };
          var ce = Ue(lr([].concat(m, A.options.modifiers)));
          A.orderedModifiers = ce.filter(function(ye) {
            return ye.enabled;
          });
          {
            var me = cr([].concat(ce, A.options.modifiers), function(ye) {
              var _e = ye.name;
              return _e;
            });
            if (ur(me), Be(A.options.placement) === qt) {
              var q = A.orderedModifiers.find(function(ye) {
                var _e = ye.name;
                return _e === "flip";
              });
              q || console.error(['Popper: "auto" placements require the "flip" modifier be', "present and enabled to work."].join(" "));
            }
            var se = j(I), re = se.marginTop, pe = se.marginRight, fe = se.marginBottom, Ee = se.marginLeft;
            [re, pe, fe, Ee].some(function(ye) {
              return parseFloat(ye);
            }) && console.warn(['Popper: CSS "margin" styles cannot be used to apply padding', "between the popper and its reference element or boundary.", "To replicate margin, use the `offset` modifier, as well as", "the `padding` option in the `preventOverflow` and `flip`", "modifiers."].join(" "));
          }
          return X(), ee.update();
        },
        forceUpdate: function() {
          if (!de) {
            var ge = A.elements, ce = ge.reference, me = ge.popper;
            if (!$t(ce, me)) {
              console.error(Dn);
              return;
            }
            A.rects = {
              reference: Ne(ce, Ce(me), A.options.strategy === "fixed"),
              popper: Ze(me)
            }, A.reset = !1, A.placement = A.options.placement, A.orderedModifiers.forEach(function(_e) {
              return A.modifiersData[_e.name] = Object.assign({}, _e.data);
            });
            for (var q = 0, se = 0; se < A.orderedModifiers.length; se++) {
              if (q += 1, q > 100) {
                console.error(fr);
                break;
              }
              if (A.reset === !0) {
                A.reset = !1, se = -1;
                continue;
              }
              var re = A.orderedModifiers[se], pe = re.fn, fe = re.options, Ee = fe === void 0 ? {} : fe, ye = re.name;
              typeof pe == "function" && (A = pe({
                state: A,
                options: Ee,
                name: ye,
                instance: ee
              }) || A);
            }
          }
        },
        update: dt(function() {
          return new Promise(function(Z) {
            ee.forceUpdate(), Z(A);
          });
        }),
        destroy: function() {
          ue(), de = !0;
        }
      };
      if (!$t(O, I))
        return console.error(Dn), ee;
      ee.setOptions(B).then(function(Z) {
        !de && B.onFirstUpdate && B.onFirstUpdate(Z);
      });
      function X() {
        A.orderedModifiers.forEach(function(Z) {
          var ge = Z.name, ce = Z.options, me = ce === void 0 ? {} : ce, q = Z.effect;
          if (typeof q == "function") {
            var se = q({
              state: A,
              name: ge,
              instance: ee,
              options: me
            }), re = function() {
            };
            ne.push(se || re);
          }
        });
      }
      function ue() {
        ne.forEach(function(Z) {
          return Z();
        }), ne = [];
      }
      return ee;
    };
  }
  var Gt = {
    passive: !0
  };
  function dr(u) {
    var a = u.state, f = u.instance, m = u.options, y = m.scroll, w = y === void 0 ? !0 : y, S = m.resize, O = S === void 0 ? !0 : S, I = n(a.elements.popper), B = [].concat(a.scrollParents.reference, a.scrollParents.popper);
    return w && B.forEach(function(A) {
      A.addEventListener("scroll", f.update, Gt);
    }), O && I.addEventListener("resize", f.update, Gt), function() {
      w && B.forEach(function(A) {
        A.removeEventListener("scroll", f.update, Gt);
      }), O && I.removeEventListener("resize", f.update, Gt);
    };
  }
  var an = {
    name: "eventListeners",
    enabled: !0,
    phase: "write",
    fn: function() {
    },
    effect: dr,
    data: {}
  };
  function pr(u) {
    var a = u.state, f = u.name;
    a.modifiersData[f] = In({
      reference: a.rects.reference,
      element: a.rects.popper,
      strategy: "absolute",
      placement: a.placement
    });
  }
  var sn = {
    name: "popperOffsets",
    enabled: !0,
    phase: "read",
    fn: pr,
    data: {}
  }, vr = {
    top: "auto",
    right: "auto",
    bottom: "auto",
    left: "auto"
  };
  function hr(u) {
    var a = u.x, f = u.y, m = window, y = m.devicePixelRatio || 1;
    return {
      x: pt(pt(a * y) / y) || 0,
      y: pt(pt(f * y) / y) || 0
    };
  }
  function un(u) {
    var a, f = u.popper, m = u.popperRect, y = u.placement, w = u.offsets, S = u.position, O = u.gpuAcceleration, I = u.adaptive, B = u.roundOffsets, A = B === !0 ? hr(w) : typeof B == "function" ? B(w) : w, ne = A.x, de = ne === void 0 ? 0 : ne, ee = A.y, X = ee === void 0 ? 0 : ee, ue = w.hasOwnProperty("x"), Z = w.hasOwnProperty("y"), ge = Ie, ce = we, me = window;
    if (I) {
      var q = Ce(f), se = "clientHeight", re = "clientWidth";
      q === n(f) && (q = C(f), j(q).position !== "static" && (se = "scrollHeight", re = "scrollWidth")), q = q, y === we && (ce = De, X -= q[se] - m.height, X *= O ? 1 : -1), y === Ie && (ge = Me, de -= q[re] - m.width, de *= O ? 1 : -1);
    }
    var pe = Object.assign({
      position: S
    }, I && vr);
    if (O) {
      var fe;
      return Object.assign({}, pe, (fe = {}, fe[ce] = Z ? "0" : "", fe[ge] = ue ? "0" : "", fe.transform = (me.devicePixelRatio || 1) < 2 ? "translate(" + de + "px, " + X + "px)" : "translate3d(" + de + "px, " + X + "px, 0)", fe));
    }
    return Object.assign({}, pe, (a = {}, a[ce] = Z ? X + "px" : "", a[ge] = ue ? de + "px" : "", a.transform = "", a));
  }
  function l(u) {
    var a = u.state, f = u.options, m = f.gpuAcceleration, y = m === void 0 ? !0 : m, w = f.adaptive, S = w === void 0 ? !0 : w, O = f.roundOffsets, I = O === void 0 ? !0 : O;
    {
      var B = j(a.elements.popper).transitionProperty || "";
      S && ["transform", "top", "right", "bottom", "left"].some(function(ne) {
        return B.indexOf(ne) >= 0;
      }) && console.warn(["Popper: Detected CSS transitions on at least one of the following", 'CSS properties: "transform", "top", "right", "bottom", "left".', `

`, 'Disable the "computeStyles" modifier\'s `adaptive` option to allow', "for smooth transitions, or remove these properties from the CSS", "transition declaration on the popper element if only transitioning", "opacity or background-color for example.", `

`, "We recommend using the popper element as a wrapper around an inner", "element that can have any CSS property transitioned for animations."].join(" "));
    }
    var A = {
      placement: Be(a.placement),
      popper: a.elements.popper,
      popperRect: a.rects.popper,
      gpuAcceleration: y
    };
    a.modifiersData.popperOffsets != null && (a.styles.popper = Object.assign({}, a.styles.popper, un(Object.assign({}, A, {
      offsets: a.modifiersData.popperOffsets,
      position: a.options.strategy,
      adaptive: S,
      roundOffsets: I
    })))), a.modifiersData.arrow != null && (a.styles.arrow = Object.assign({}, a.styles.arrow, un(Object.assign({}, A, {
      offsets: a.modifiersData.arrow,
      position: "absolute",
      adaptive: !1,
      roundOffsets: I
    })))), a.attributes.popper = Object.assign({}, a.attributes.popper, {
      "data-popper-placement": a.placement
    });
  }
  var d = {
    name: "computeStyles",
    enabled: !0,
    phase: "beforeWrite",
    fn: l,
    data: {}
  };
  function h(u) {
    var a = u.state;
    Object.keys(a.elements).forEach(function(f) {
      var m = a.styles[f] || {}, y = a.attributes[f] || {}, w = a.elements[f];
      !o(w) || !_(w) || (Object.assign(w.style, m), Object.keys(y).forEach(function(S) {
        var O = y[S];
        O === !1 ? w.removeAttribute(S) : w.setAttribute(S, O === !0 ? "" : O);
      }));
    });
  }
  function x(u) {
    var a = u.state, f = {
      popper: {
        position: a.options.strategy,
        left: "0",
        top: "0",
        margin: "0"
      },
      arrow: {
        position: "absolute"
      },
      reference: {}
    };
    return Object.assign(a.elements.popper.style, f.popper), a.styles = f, a.elements.arrow && Object.assign(a.elements.arrow.style, f.arrow), function() {
      Object.keys(a.elements).forEach(function(m) {
        var y = a.elements[m], w = a.attributes[m] || {}, S = Object.keys(a.styles.hasOwnProperty(m) ? a.styles[m] : f[m]), O = S.reduce(function(I, B) {
          return I[B] = "", I;
        }, {});
        !o(y) || !_(y) || (Object.assign(y.style, O), Object.keys(w).forEach(function(I) {
          y.removeAttribute(I);
        }));
      });
    };
  }
  var M = {
    name: "applyStyles",
    enabled: !0,
    phase: "write",
    fn: h,
    effect: x,
    requires: ["computeStyles"]
  };
  function T(u, a, f) {
    var m = Be(u), y = [Ie, we].indexOf(m) >= 0 ? -1 : 1, w = typeof f == "function" ? f(Object.assign({}, a, {
      placement: u
    })) : f, S = w[0], O = w[1];
    return S = S || 0, O = (O || 0) * y, [Ie, Me].indexOf(m) >= 0 ? {
      x: O,
      y: S
    } : {
      x: S,
      y: O
    };
  }
  function E(u) {
    var a = u.state, f = u.options, m = u.name, y = f.offset, w = y === void 0 ? [0, 0] : y, S = rn.reduce(function(A, ne) {
      return A[ne] = T(ne, a.rects, w), A;
    }, {}), O = S[a.placement], I = O.x, B = O.y;
    a.modifiersData.popperOffsets != null && (a.modifiersData.popperOffsets.x += I, a.modifiersData.popperOffsets.y += B), a.modifiersData[m] = S;
  }
  var Y = {
    name: "offset",
    enabled: !0,
    phase: "main",
    requires: ["popperOffsets"],
    fn: E
  }, H = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  function U(u) {
    return u.replace(/left|right|bottom|top/g, function(a) {
      return H[a];
    });
  }
  var G = {
    start: "end",
    end: "start"
  };
  function oe(u) {
    return u.replace(/start|end/g, function(a) {
      return G[a];
    });
  }
  function he(u, a) {
    a === void 0 && (a = {});
    var f = a, m = f.placement, y = f.boundary, w = f.rootBoundary, S = f.padding, O = f.flipVariations, I = f.allowedAutoPlacements, B = I === void 0 ? rn : I, A = At(m), ne = A ? O ? On : On.filter(function(X) {
      return At(X) === A;
    }) : ot, de = ne.filter(function(X) {
      return B.indexOf(X) >= 0;
    });
    de.length === 0 && (de = ne, console.error(["Popper: The `allowedAutoPlacements` option did not allow any", "placements. Ensure the `placement` option matches the variation", "of the allowed placements.", 'For example, "auto" cannot be used to allow "bottom-start".', 'Use "auto-start" instead.'].join(" ")));
    var ee = de.reduce(function(X, ue) {
      return X[ue] = ht(u, {
        placement: ue,
        boundary: y,
        rootBoundary: w,
        padding: S
      })[Be(ue)], X;
    }, {});
    return Object.keys(ee).sort(function(X, ue) {
      return ee[X] - ee[ue];
    });
  }
  function Q(u) {
    if (Be(u) === qt)
      return [];
    var a = U(u);
    return [oe(u), a, oe(a)];
  }
  function le(u) {
    var a = u.state, f = u.options, m = u.name;
    if (!a.modifiersData[m]._skip) {
      for (var y = f.mainAxis, w = y === void 0 ? !0 : y, S = f.altAxis, O = S === void 0 ? !0 : S, I = f.fallbackPlacements, B = f.padding, A = f.boundary, ne = f.rootBoundary, de = f.altBoundary, ee = f.flipVariations, X = ee === void 0 ? !0 : ee, ue = f.allowedAutoPlacements, Z = a.options.placement, ge = Be(Z), ce = ge === Z, me = I || (ce || !X ? [U(Z)] : Q(Z)), q = [Z].concat(me).reduce(function(D, K) {
        return D.concat(Be(K) === qt ? he(a, {
          placement: K,
          boundary: A,
          rootBoundary: ne,
          padding: B,
          flipVariations: X,
          allowedAutoPlacements: ue
        }) : K);
      }, []), se = a.rects.reference, re = a.rects.popper, pe = /* @__PURE__ */ new Map(), fe = !0, Ee = q[0], ye = 0; ye < q.length; ye++) {
        var _e = q[ye], Ye = Be(_e), Pe = At(_e) === qe, ut = [we, De].indexOf(Ye) >= 0, It = ut ? "width" : "height", bt = ht(a, {
          placement: _e,
          boundary: A,
          rootBoundary: ne,
          altBoundary: de,
          padding: B
        }), ct = ut ? Pe ? Me : Ie : Pe ? De : we;
        se[It] > re[It] && (ct = U(ct));
        var cn = U(ct), _t = [];
        if (w && _t.push(bt[Ye] <= 0), O && _t.push(bt[ct] <= 0, bt[cn] <= 0), _t.every(function(D) {
          return D;
        })) {
          Ee = _e, fe = !1;
          break;
        }
        pe.set(_e, _t);
      }
      if (fe)
        for (var Jt = X ? 3 : 1, ln = function(K) {
          var J = q.find(function(Se) {
            var Ae = pe.get(Se);
            if (Ae)
              return Ae.slice(0, K).every(function(nt) {
                return nt;
              });
          });
          if (J)
            return Ee = J, "break";
        }, g = Jt; g > 0; g--) {
          var L = ln(g);
          if (L === "break")
            break;
        }
      a.placement !== Ee && (a.modifiersData[m]._skip = !0, a.placement = Ee, a.reset = !0);
    }
  }
  var k = {
    name: "flip",
    enabled: !0,
    phase: "main",
    fn: le,
    requiresIfExists: ["offset"],
    data: {
      _skip: !1
    }
  };
  function V(u) {
    return u === "x" ? "y" : "x";
  }
  function z(u, a, f) {
    return Ve(u, St(a, f));
  }
  function P(u) {
    var a = u.state, f = u.options, m = u.name, y = f.mainAxis, w = y === void 0 ? !0 : y, S = f.altAxis, O = S === void 0 ? !1 : S, I = f.boundary, B = f.rootBoundary, A = f.altBoundary, ne = f.padding, de = f.tether, ee = de === void 0 ? !0 : de, X = f.tetherOffset, ue = X === void 0 ? 0 : X, Z = ht(a, {
      boundary: I,
      rootBoundary: B,
      padding: ne,
      altBoundary: A
    }), ge = Be(a.placement), ce = At(a.placement), me = !ce, q = We(ge), se = V(q), re = a.modifiersData.popperOffsets, pe = a.rects.reference, fe = a.rects.popper, Ee = typeof ue == "function" ? ue(Object.assign({}, a.rects, {
      placement: a.placement
    })) : ue, ye = {
      x: 0,
      y: 0
    };
    if (re) {
      if (w || O) {
        var _e = q === "y" ? we : Ie, Ye = q === "y" ? De : Me, Pe = q === "y" ? "height" : "width", ut = re[q], It = re[q] + Z[_e], bt = re[q] - Z[Ye], ct = ee ? -fe[Pe] / 2 : 0, cn = ce === qe ? pe[Pe] : fe[Pe], _t = ce === qe ? -fe[Pe] : -pe[Pe], Jt = a.elements.arrow, ln = ee && Jt ? Ze(Jt) : {
          width: 0,
          height: 0
        }, g = a.modifiersData["arrow#persistent"] ? a.modifiersData["arrow#persistent"].padding : Ln(), L = g[_e], D = g[Ye], K = z(0, pe[Pe], ln[Pe]), J = me ? pe[Pe] / 2 - ct - K - L - Ee : cn - K - L - Ee, Se = me ? -pe[Pe] / 2 + ct + K + D + Ee : _t + K + D + Ee, Ae = a.elements.arrow && Ce(a.elements.arrow), nt = Ae ? q === "y" ? Ae.clientTop || 0 : Ae.clientLeft || 0 : 0, fn = a.modifiersData.offset ? a.modifiersData.offset[a.placement][q] : 0, rt = re[q] + J - fn - nt, Xt = re[q] + Se - fn;
        if (w) {
          var Lt = z(ee ? St(It, rt) : It, ut, ee ? Ve(bt, Xt) : bt);
          re[q] = Lt, ye[q] = Lt - ut;
        }
        if (O) {
          var xt = q === "x" ? we : Ie, gr = q === "x" ? De : Me, wt = re[se], Rt = wt + Z[xt], ci = wt - Z[gr], li = z(ee ? St(Rt, rt) : Rt, wt, ee ? Ve(ci, Xt) : ci);
          re[se] = li, ye[se] = li - wt;
        }
      }
      a.modifiersData[m] = ye;
    }
  }
  var N = {
    name: "preventOverflow",
    enabled: !0,
    phase: "main",
    fn: P,
    requiresIfExists: ["offset"]
  }, p = function(a, f) {
    return a = typeof a == "function" ? a(Object.assign({}, f.rects, {
      placement: f.placement
    })) : a, Rn(typeof a != "number" ? a : Pn(a, ot));
  };
  function Te(u) {
    var a, f = u.state, m = u.name, y = u.options, w = f.elements.arrow, S = f.modifiersData.popperOffsets, O = Be(f.placement), I = We(O), B = [Ie, Me].indexOf(O) >= 0, A = B ? "height" : "width";
    if (!(!w || !S)) {
      var ne = p(y.padding, f), de = Ze(w), ee = I === "y" ? we : Ie, X = I === "y" ? De : Me, ue = f.rects.reference[A] + f.rects.reference[I] - S[I] - f.rects.popper[A], Z = S[I] - f.rects.reference[I], ge = Ce(w), ce = ge ? I === "y" ? ge.clientHeight || 0 : ge.clientWidth || 0 : 0, me = ue / 2 - Z / 2, q = ne[ee], se = ce - de[A] - ne[X], re = ce / 2 - de[A] / 2 + me, pe = z(q, re, se), fe = I;
      f.modifiersData[m] = (a = {}, a[fe] = pe, a.centerOffset = pe - re, a);
    }
  }
  function W(u) {
    var a = u.state, f = u.options, m = f.element, y = m === void 0 ? "[data-popper-arrow]" : m;
    if (y != null && !(typeof y == "string" && (y = a.elements.popper.querySelector(y), !y))) {
      if (o(y) || console.error(['Popper: "arrow" element must be an HTMLElement (not an SVGElement).', "To use an SVG arrow, wrap it in an HTMLElement that will be used as", "the arrow."].join(" ")), !on(a.elements.popper, y)) {
        console.error(['Popper: "arrow" modifier\'s `element` must be a child of the popper', "element."].join(" "));
        return;
      }
      a.elements.arrow = y;
    }
  }
  var st = {
    name: "arrow",
    enabled: !0,
    phase: "main",
    fn: Te,
    effect: W,
    requires: ["popperOffsets"],
    requiresIfExists: ["preventOverflow"]
  };
  function ze(u, a, f) {
    return f === void 0 && (f = {
      x: 0,
      y: 0
    }), {
      top: u.top - a.height - f.y,
      right: u.right - a.width + f.x,
      bottom: u.bottom - a.height + f.y,
      left: u.left - a.width - f.x
    };
  }
  function gt(u) {
    return [we, Me, De, Ie].some(function(a) {
      return u[a] >= 0;
    });
  }
  function mt(u) {
    var a = u.state, f = u.name, m = a.rects.reference, y = a.rects.popper, w = a.modifiersData.preventOverflow, S = ht(a, {
      elementContext: "reference"
    }), O = ht(a, {
      altBoundary: !0
    }), I = ze(S, m), B = ze(O, y, w), A = gt(I), ne = gt(B);
    a.modifiersData[f] = {
      referenceClippingOffsets: I,
      popperEscapeOffsets: B,
      isReferenceHidden: A,
      hasPopperEscaped: ne
    }, a.attributes.popper = Object.assign({}, a.attributes.popper, {
      "data-popper-reference-hidden": A,
      "data-popper-escaped": ne
    });
  }
  var yt = {
    name: "hide",
    enabled: !0,
    phase: "main",
    requiresIfExists: ["preventOverflow"],
    fn: mt
  }, je = [an, sn, d, M], He = /* @__PURE__ */ Yt({
    defaultModifiers: je
  }), Ke = [an, sn, d, M, Y, k, N, st, yt], Mt = /* @__PURE__ */ Yt({
    defaultModifiers: Ke
  });
  e.applyStyles = M, e.arrow = st, e.computeStyles = d, e.createPopper = Mt, e.createPopperLite = He, e.defaultModifiers = Ke, e.detectOverflow = ht, e.eventListeners = an, e.flip = k, e.hide = yt, e.offset = Y, e.popperGenerator = Yt, e.popperOffsets = sn, e.preventOverflow = N;
}), No = ko((e) => {
  Object.defineProperty(e, "__esModule", { value: !0 });
  var t = Qs(), n = '<svg width="16" height="6" xmlns="http://www.w3.org/2000/svg"><path d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z"></svg>', r = "tippy-box", i = "tippy-content", o = "tippy-backdrop", s = "tippy-arrow", c = "tippy-svg-arrow", v = {
    passive: !0,
    capture: !0
  };
  function _(l, d) {
    return {}.hasOwnProperty.call(l, d);
  }
  function C(l, d, h) {
    if (Array.isArray(l)) {
      var x = l[d];
      return x ?? (Array.isArray(h) ? h[d] : h);
    }
    return l;
  }
  function F(l, d) {
    var h = {}.toString.call(l);
    return h.indexOf("[object") === 0 && h.indexOf(d + "]") > -1;
  }
  function j(l, d) {
    return typeof l == "function" ? l.apply(void 0, d) : l;
  }
  function ae(l, d) {
    if (d === 0)
      return l;
    var h;
    return function(x) {
      clearTimeout(h), h = setTimeout(function() {
        l(x);
      }, d);
    };
  }
  function Ne(l, d) {
    var h = Object.assign({}, l);
    return d.forEach(function(x) {
      delete h[x];
    }), h;
  }
  function Ze(l) {
    return l.split(/\s+/).filter(Boolean);
  }
  function R(l) {
    return [].concat(l);
  }
  function te(l, d) {
    l.indexOf(d) === -1 && l.push(d);
  }
  function ie(l) {
    return l.filter(function(d, h) {
      return l.indexOf(d) === h;
    });
  }
  function xe(l) {
    return l.split("-")[0];
  }
  function be(l) {
    return [].slice.call(l);
  }
  function Qe(l) {
    return Object.keys(l).reduce(function(d, h) {
      return l[h] !== void 0 && (d[h] = l[h]), d;
    }, {});
  }
  function Ce() {
    return document.createElement("div");
  }
  function we(l) {
    return ["Element", "Fragment"].some(function(d) {
      return F(l, d);
    });
  }
  function De(l) {
    return F(l, "NodeList");
  }
  function Me(l) {
    return F(l, "MouseEvent");
  }
  function Ie(l) {
    return !!(l && l._tippy && l._tippy.reference === l);
  }
  function qt(l) {
    return we(l) ? [l] : De(l) ? be(l) : Array.isArray(l) ? l : be(document.querySelectorAll(l));
  }
  function ot(l, d) {
    l.forEach(function(h) {
      h && (h.style.transitionDuration = d + "ms");
    });
  }
  function qe(l, d) {
    l.forEach(function(h) {
      h && h.setAttribute("data-state", d);
    });
  }
  function Wt(l) {
    var d, h = R(l), x = h[0];
    return !(x == null || (d = x.ownerDocument) == null) && d.body ? x.ownerDocument : document;
  }
  function Qn(l, d) {
    var h = d.clientX, x = d.clientY;
    return l.every(function(M) {
      var T = M.popperRect, E = M.popperState, Y = M.props, H = Y.interactiveBorder, U = xe(E.placement), G = E.modifiersData.offset;
      if (!G)
        return !0;
      var oe = U === "bottom" ? G.top.y : 0, he = U === "top" ? G.bottom.y : 0, Q = U === "right" ? G.left.x : 0, le = U === "left" ? G.right.x : 0, k = T.top - x + oe > H, V = x - T.bottom - he > H, z = T.left - h + Q > H, P = h - T.right - le > H;
      return k || V || z || P;
    });
  }
  function Ut(l, d, h) {
    var x = d + "EventListener";
    ["transitionend", "webkitTransitionEnd"].forEach(function(M) {
      l[x](M, h);
    });
  }
  var Le = {
    isTouch: !1
  }, En = 0;
  function On() {
    Le.isTouch || (Le.isTouch = !0, window.performance && document.addEventListener("mousemove", rn));
  }
  function rn() {
    var l = performance.now();
    l - En < 20 && (Le.isTouch = !1, document.removeEventListener("mousemove", rn)), En = l;
  }
  function er() {
    var l = document.activeElement;
    if (Ie(l)) {
      var d = l._tippy;
      l.blur && !d.state.isVisible && l.blur();
    }
  }
  function tr() {
    document.addEventListener("touchstart", On, v), window.addEventListener("blur", er);
  }
  var nr = typeof window < "u" && typeof document < "u", rr = nr ? navigator.userAgent : "", ir = /MSIE |Trident\//.test(rr);
  function ft(l) {
    var d = l === "destroy" ? "n already-" : " ";
    return [l + "() was called on a" + d + "destroyed instance. This is a no-op but", "indicates a potential memory leak."].join(" ");
  }
  function Cn(l) {
    var d = /[ \t]{2,}/g, h = /^[ \t]*/gm;
    return l.replace(d, " ").replace(h, "").trim();
  }
  function or(l) {
    return Cn(`
  %ctippy.js

  %c` + Cn(l) + `

  %c👷‍ This is a development-only message. It will be removed in production.
  `);
  }
  function Tn(l) {
    return [
      or(l),
      "color: #00C584; font-size: 1.3em; font-weight: bold;",
      "line-height: 1.5",
      "color: #a6a095;"
    ];
  }
  var at;
  ar();
  function ar() {
    at = /* @__PURE__ */ new Set();
  }
  function Ue(l, d) {
    if (l && !at.has(d)) {
      var h;
      at.add(d), (h = console).warn.apply(h, Tn(d));
    }
  }
  function dt(l, d) {
    if (l && !at.has(d)) {
      var h;
      at.add(d), (h = console).error.apply(h, Tn(d));
    }
  }
  function et(l) {
    var d = !l, h = Object.prototype.toString.call(l) === "[object Object]" && !l.addEventListener;
    dt(d, ["tippy() was passed", "`" + String(l) + "`", "as its targets (first) argument. Valid types are: String, Element,", "Element[], or NodeList."].join(" ")), dt(h, ["tippy() was passed a plain object which is not supported as an argument", "for virtual positioning. Use props.getReferenceClientRect instead."].join(" "));
  }
  var tt = {
    animateFill: !1,
    followCursor: !1,
    inlinePositioning: !1,
    sticky: !1
  }, sr = {
    allowHTML: !1,
    animation: "fade",
    arrow: !0,
    content: "",
    inertia: !1,
    maxWidth: 350,
    role: "tooltip",
    theme: "",
    zIndex: 9999
  }, Re = Object.assign({
    appendTo: function() {
      return document.body;
    },
    aria: {
      content: "auto",
      expanded: "auto"
    },
    delay: 0,
    duration: [300, 250],
    getReferenceClientRect: null,
    hideOnClick: !0,
    ignoreAttributes: !1,
    interactive: !1,
    interactiveBorder: 2,
    interactiveDebounce: 0,
    moveTransition: "",
    offset: [0, 10],
    onAfterUpdate: function() {
    },
    onBeforeUpdate: function() {
    },
    onCreate: function() {
    },
    onDestroy: function() {
    },
    onHidden: function() {
    },
    onHide: function() {
    },
    onMount: function() {
    },
    onShow: function() {
    },
    onShown: function() {
    },
    onTrigger: function() {
    },
    onUntrigger: function() {
    },
    onClickOutside: function() {
    },
    placement: "top",
    plugins: [],
    popperOptions: {},
    render: null,
    showOnCreate: !1,
    touch: !0,
    trigger: "mouseenter focus",
    triggerTarget: null
  }, tt, {}, sr), ur = Object.keys(Re), cr = function(d) {
    Ve(d, []);
    var h = Object.keys(d);
    h.forEach(function(x) {
      Re[x] = d[x];
    });
  };
  function Be(l) {
    var d = l.plugins || [], h = d.reduce(function(x, M) {
      var T = M.name, E = M.defaultValue;
      return T && (x[T] = l[T] !== void 0 ? l[T] : E), x;
    }, {});
    return Object.assign({}, l, {}, h);
  }
  function lr(l, d) {
    var h = d ? Object.keys(Be(Object.assign({}, Re, {
      plugins: d
    }))) : ur, x = h.reduce(function(M, T) {
      var E = (l.getAttribute("data-tippy-" + T) || "").trim();
      if (!E)
        return M;
      if (T === "content")
        M[T] = E;
      else
        try {
          M[T] = JSON.parse(E);
        } catch {
          M[T] = E;
        }
      return M;
    }, {});
    return x;
  }
  function Sn(l, d) {
    var h = Object.assign({}, d, {
      content: j(d.content, [l])
    }, d.ignoreAttributes ? {} : lr(l, d.plugins));
    return h.aria = Object.assign({}, Re.aria, {}, h.aria), h.aria = {
      expanded: h.aria.expanded === "auto" ? d.interactive : h.aria.expanded,
      content: h.aria.content === "auto" ? d.interactive ? null : "describedby" : h.aria.content
    }, h;
  }
  function Ve(l, d) {
    l === void 0 && (l = {}), d === void 0 && (d = []);
    var h = Object.keys(l);
    h.forEach(function(x) {
      var M = Ne(Re, Object.keys(tt)), T = !_(M, x);
      T && (T = d.filter(function(E) {
        return E.name === x;
      }).length === 0), Ue(T, ["`" + x + "`", "is not a valid prop. You may have spelled it incorrectly, or if it's", "a plugin, forgot to pass it in an array as props.plugins.", `

`, `All props: https://atomiks.github.io/tippyjs/v6/all-props/
`, "Plugins: https://atomiks.github.io/tippyjs/v6/plugins/"].join(" "));
    });
  }
  var St = function() {
    return "innerHTML";
  };
  function pt(l, d) {
    l[St()] = d;
  }
  function An(l) {
    var d = Ce();
    return l === !0 ? d.className = s : (d.className = c, we(l) ? d.appendChild(l) : pt(d, l)), d;
  }
  function on(l, d) {
    we(d.content) ? (pt(l, ""), l.appendChild(d.content)) : typeof d.content != "function" && (d.allowHTML ? pt(l, d.content) : l.textContent = d.content);
  }
  function vt(l) {
    var d = l.firstElementChild, h = be(d.children);
    return {
      box: d,
      content: h.find(function(x) {
        return x.classList.contains(i);
      }),
      arrow: h.find(function(x) {
        return x.classList.contains(s) || x.classList.contains(c);
      }),
      backdrop: h.find(function(x) {
        return x.classList.contains(o);
      })
    };
  }
  function $n(l) {
    var d = Ce(), h = Ce();
    h.className = r, h.setAttribute("data-state", "hidden"), h.setAttribute("tabindex", "-1");
    var x = Ce();
    x.className = i, x.setAttribute("data-state", "hidden"), on(x, l.props), d.appendChild(h), h.appendChild(x), M(l.props, l.props);
    function M(T, E) {
      var Y = vt(d), H = Y.box, U = Y.content, G = Y.arrow;
      E.theme ? H.setAttribute("data-theme", E.theme) : H.removeAttribute("data-theme"), typeof E.animation == "string" ? H.setAttribute("data-animation", E.animation) : H.removeAttribute("data-animation"), E.inertia ? H.setAttribute("data-inertia", "") : H.removeAttribute("data-inertia"), H.style.maxWidth = typeof E.maxWidth == "number" ? E.maxWidth + "px" : E.maxWidth, E.role ? H.setAttribute("role", E.role) : H.removeAttribute("role"), (T.content !== E.content || T.allowHTML !== E.allowHTML) && on(U, l.props), E.arrow ? G ? T.arrow !== E.arrow && (H.removeChild(G), H.appendChild(An(E.arrow))) : H.appendChild(An(E.arrow)) : G && H.removeChild(G);
    }
    return {
      popper: d,
      onUpdate: M
    };
  }
  $n.$$tippy = !0;
  var Mn = 1, Vt = [], zt = [];
  function At(l, d) {
    var h = Sn(l, Object.assign({}, Re, {}, Be(Qe(d)))), x, M, T, E = !1, Y = !1, H = !1, U = !1, G, oe, he, Q = [], le = ae(ce, h.interactiveDebounce), k, V = Mn++, z = null, P = ie(h.plugins), N = {
      isEnabled: !0,
      isVisible: !1,
      isDestroyed: !1,
      isMounted: !1,
      isShown: !1
    }, p = {
      id: V,
      reference: l,
      popper: Ce(),
      popperInstance: z,
      props: h,
      state: N,
      plugins: P,
      clearDelayTimeouts: ut,
      setProps: It,
      setContent: bt,
      show: ct,
      hide: cn,
      hideWithInteractivity: _t,
      enable: Ye,
      disable: Pe,
      unmount: Jt,
      destroy: ln
    };
    if (!h.render)
      return dt(!0, "render() function has not been supplied."), p;
    var Te = h.render(p), W = Te.popper, st = Te.onUpdate;
    W.setAttribute("data-tippy-root", ""), W.id = "tippy-" + p.id, p.popper = W, l._tippy = p, W._tippy = p;
    var ze = P.map(function(g) {
      return g.fn(p);
    }), gt = l.hasAttribute("aria-expanded");
    return ue(), y(), a(), f("onCreate", [p]), h.showOnCreate && ye(), W.addEventListener("mouseenter", function() {
      p.props.interactive && p.state.isVisible && p.clearDelayTimeouts();
    }), W.addEventListener("mouseleave", function(g) {
      p.props.interactive && p.props.trigger.indexOf("mouseenter") >= 0 && (Ke().addEventListener("mousemove", le), le(g));
    }), p;
    function mt() {
      var g = p.props.touch;
      return Array.isArray(g) ? g : [g, 0];
    }
    function yt() {
      return mt()[0] === "hold";
    }
    function je() {
      var g;
      return !!((g = p.props.render) != null && g.$$tippy);
    }
    function He() {
      return k || l;
    }
    function Ke() {
      var g = He().parentNode;
      return g ? Wt(g) : document;
    }
    function Mt() {
      return vt(W);
    }
    function u(g) {
      return p.state.isMounted && !p.state.isVisible || Le.isTouch || G && G.type === "focus" ? 0 : C(p.props.delay, g ? 0 : 1, Re.delay);
    }
    function a() {
      W.style.pointerEvents = p.props.interactive && p.state.isVisible ? "" : "none", W.style.zIndex = "" + p.props.zIndex;
    }
    function f(g, L, D) {
      if (D === void 0 && (D = !0), ze.forEach(function(J) {
        J[g] && J[g].apply(void 0, L);
      }), D) {
        var K;
        (K = p.props)[g].apply(K, L);
      }
    }
    function m() {
      var g = p.props.aria;
      if (g.content) {
        var L = "aria-" + g.content, D = W.id, K = R(p.props.triggerTarget || l);
        K.forEach(function(J) {
          var Se = J.getAttribute(L);
          if (p.state.isVisible)
            J.setAttribute(L, Se ? Se + " " + D : D);
          else {
            var Ae = Se && Se.replace(D, "").trim();
            Ae ? J.setAttribute(L, Ae) : J.removeAttribute(L);
          }
        });
      }
    }
    function y() {
      if (!(gt || !p.props.aria.expanded)) {
        var g = R(p.props.triggerTarget || l);
        g.forEach(function(L) {
          p.props.interactive ? L.setAttribute("aria-expanded", p.state.isVisible && L === He() ? "true" : "false") : L.removeAttribute("aria-expanded");
        });
      }
    }
    function w() {
      Ke().removeEventListener("mousemove", le), Vt = Vt.filter(function(g) {
        return g !== le;
      });
    }
    function S(g) {
      if (!(Le.isTouch && (H || g.type === "mousedown")) && !(p.props.interactive && W.contains(g.target))) {
        if (He().contains(g.target)) {
          if (Le.isTouch || p.state.isVisible && p.props.trigger.indexOf("click") >= 0)
            return;
        } else
          f("onClickOutside", [p, g]);
        p.props.hideOnClick === !0 && (p.clearDelayTimeouts(), p.hide(), Y = !0, setTimeout(function() {
          Y = !1;
        }), p.state.isMounted || A());
      }
    }
    function O() {
      H = !0;
    }
    function I() {
      H = !1;
    }
    function B() {
      var g = Ke();
      g.addEventListener("mousedown", S, !0), g.addEventListener("touchend", S, v), g.addEventListener("touchstart", I, v), g.addEventListener("touchmove", O, v);
    }
    function A() {
      var g = Ke();
      g.removeEventListener("mousedown", S, !0), g.removeEventListener("touchend", S, v), g.removeEventListener("touchstart", I, v), g.removeEventListener("touchmove", O, v);
    }
    function ne(g, L) {
      ee(g, function() {
        !p.state.isVisible && W.parentNode && W.parentNode.contains(W) && L();
      });
    }
    function de(g, L) {
      ee(g, L);
    }
    function ee(g, L) {
      var D = Mt().box;
      function K(J) {
        J.target === D && (Ut(D, "remove", K), L());
      }
      if (g === 0)
        return L();
      Ut(D, "remove", oe), Ut(D, "add", K), oe = K;
    }
    function X(g, L, D) {
      D === void 0 && (D = !1);
      var K = R(p.props.triggerTarget || l);
      K.forEach(function(J) {
        J.addEventListener(g, L, D), Q.push({
          node: J,
          eventType: g,
          handler: L,
          options: D
        });
      });
    }
    function ue() {
      yt() && (X("touchstart", ge, {
        passive: !0
      }), X("touchend", me, {
        passive: !0
      })), Ze(p.props.trigger).forEach(function(g) {
        if (g !== "manual")
          switch (X(g, ge), g) {
            case "mouseenter":
              X("mouseleave", me);
              break;
            case "focus":
              X(ir ? "focusout" : "blur", q);
              break;
            case "focusin":
              X("focusout", q);
              break;
          }
      });
    }
    function Z() {
      Q.forEach(function(g) {
        var L = g.node, D = g.eventType, K = g.handler, J = g.options;
        L.removeEventListener(D, K, J);
      }), Q = [];
    }
    function ge(g) {
      var L, D = !1;
      if (!(!p.state.isEnabled || se(g) || Y)) {
        var K = ((L = G) == null ? void 0 : L.type) === "focus";
        G = g, k = g.currentTarget, y(), !p.state.isVisible && Me(g) && Vt.forEach(function(J) {
          return J(g);
        }), g.type === "click" && (p.props.trigger.indexOf("mouseenter") < 0 || E) && p.props.hideOnClick !== !1 && p.state.isVisible ? D = !0 : ye(g), g.type === "click" && (E = !D), D && !K && _e(g);
      }
    }
    function ce(g) {
      var L = g.target, D = He().contains(L) || W.contains(L);
      if (!(g.type === "mousemove" && D)) {
        var K = Ee().concat(W).map(function(J) {
          var Se, Ae = J._tippy, nt = (Se = Ae.popperInstance) == null ? void 0 : Se.state;
          return nt ? {
            popperRect: J.getBoundingClientRect(),
            popperState: nt,
            props: h
          } : null;
        }).filter(Boolean);
        Qn(K, g) && (w(), _e(g));
      }
    }
    function me(g) {
      var L = se(g) || p.props.trigger.indexOf("click") >= 0 && E;
      if (!L) {
        if (p.props.interactive) {
          p.hideWithInteractivity(g);
          return;
        }
        _e(g);
      }
    }
    function q(g) {
      p.props.trigger.indexOf("focusin") < 0 && g.target !== He() || p.props.interactive && g.relatedTarget && W.contains(g.relatedTarget) || _e(g);
    }
    function se(g) {
      return Le.isTouch ? yt() !== g.type.indexOf("touch") >= 0 : !1;
    }
    function re() {
      pe();
      var g = p.props, L = g.popperOptions, D = g.placement, K = g.offset, J = g.getReferenceClientRect, Se = g.moveTransition, Ae = je() ? vt(W).arrow : null, nt = J ? {
        getBoundingClientRect: J,
        contextElement: J.contextElement || He()
      } : l, fn = {
        name: "$$tippy",
        enabled: !0,
        phase: "beforeWrite",
        requires: ["computeStyles"],
        fn: function(Lt) {
          var xt = Lt.state;
          if (je()) {
            var gr = Mt(), wt = gr.box;
            ["placement", "reference-hidden", "escaped"].forEach(function(Rt) {
              Rt === "placement" ? wt.setAttribute("data-placement", xt.placement) : xt.attributes.popper["data-popper-" + Rt] ? wt.setAttribute("data-" + Rt, "") : wt.removeAttribute("data-" + Rt);
            }), xt.attributes.popper = {};
          }
        }
      }, rt = [{
        name: "offset",
        options: {
          offset: K
        }
      }, {
        name: "preventOverflow",
        options: {
          padding: {
            top: 2,
            bottom: 2,
            left: 5,
            right: 5
          }
        }
      }, {
        name: "flip",
        options: {
          padding: 5
        }
      }, {
        name: "computeStyles",
        options: {
          adaptive: !Se
        }
      }, fn];
      je() && Ae && rt.push({
        name: "arrow",
        options: {
          element: Ae,
          padding: 3
        }
      }), rt.push.apply(rt, (L == null ? void 0 : L.modifiers) || []), p.popperInstance = t.createPopper(nt, W, Object.assign({}, L, {
        placement: D,
        onFirstUpdate: he,
        modifiers: rt
      }));
    }
    function pe() {
      p.popperInstance && (p.popperInstance.destroy(), p.popperInstance = null);
    }
    function fe() {
      var g = p.props.appendTo, L, D = He();
      p.props.interactive && g === Re.appendTo || g === "parent" ? L = D.parentNode : L = j(g, [D]), L.contains(W) || L.appendChild(W), re(), Ue(p.props.interactive && g === Re.appendTo && D.nextElementSibling !== W, ["Interactive tippy element may not be accessible via keyboard", "navigation because it is not directly after the reference element", "in the DOM source order.", `

`, "Using a wrapper <div> or <span> tag around the reference element", "solves this by creating a new parentNode context.", `

`, "Specifying `appendTo: document.body` silences this warning, but it", "assumes you are using a focus management solution to handle", "keyboard navigation.", `

`, "See: https://atomiks.github.io/tippyjs/v6/accessibility/#interactivity"].join(" "));
    }
    function Ee() {
      return be(W.querySelectorAll("[data-tippy-root]"));
    }
    function ye(g) {
      p.clearDelayTimeouts(), g && f("onTrigger", [p, g]), B();
      var L = u(!0), D = mt(), K = D[0], J = D[1];
      Le.isTouch && K === "hold" && J && (L = J), L ? x = setTimeout(function() {
        p.show();
      }, L) : p.show();
    }
    function _e(g) {
      if (p.clearDelayTimeouts(), f("onUntrigger", [p, g]), !p.state.isVisible) {
        A();
        return;
      }
      if (!(p.props.trigger.indexOf("mouseenter") >= 0 && p.props.trigger.indexOf("click") >= 0 && ["mouseleave", "mousemove"].indexOf(g.type) >= 0 && E)) {
        var L = u(!1);
        L ? M = setTimeout(function() {
          p.state.isVisible && p.hide();
        }, L) : T = requestAnimationFrame(function() {
          p.hide();
        });
      }
    }
    function Ye() {
      p.state.isEnabled = !0;
    }
    function Pe() {
      p.hide(), p.state.isEnabled = !1;
    }
    function ut() {
      clearTimeout(x), clearTimeout(M), cancelAnimationFrame(T);
    }
    function It(g) {
      if (Ue(p.state.isDestroyed, ft("setProps")), !p.state.isDestroyed) {
        f("onBeforeUpdate", [p, g]), Z();
        var L = p.props, D = Sn(l, Object.assign({}, p.props, {}, g, {
          ignoreAttributes: !0
        }));
        p.props = D, ue(), L.interactiveDebounce !== D.interactiveDebounce && (w(), le = ae(ce, D.interactiveDebounce)), L.triggerTarget && !D.triggerTarget ? R(L.triggerTarget).forEach(function(K) {
          K.removeAttribute("aria-expanded");
        }) : D.triggerTarget && l.removeAttribute("aria-expanded"), y(), a(), st && st(L, D), p.popperInstance && (re(), Ee().forEach(function(K) {
          requestAnimationFrame(K._tippy.popperInstance.forceUpdate);
        })), f("onAfterUpdate", [p, g]);
      }
    }
    function bt(g) {
      p.setProps({
        content: g
      });
    }
    function ct() {
      Ue(p.state.isDestroyed, ft("show"));
      var g = p.state.isVisible, L = p.state.isDestroyed, D = !p.state.isEnabled, K = Le.isTouch && !p.props.touch, J = C(p.props.duration, 0, Re.duration);
      if (!(g || L || D || K) && !He().hasAttribute("disabled") && (f("onShow", [p], !1), p.props.onShow(p) !== !1)) {
        if (p.state.isVisible = !0, je() && (W.style.visibility = "visible"), a(), B(), p.state.isMounted || (W.style.transition = "none"), je()) {
          var Se = Mt(), Ae = Se.box, nt = Se.content;
          ot([Ae, nt], 0);
        }
        he = function() {
          var rt;
          if (!(!p.state.isVisible || U)) {
            if (U = !0, W.offsetHeight, W.style.transition = p.props.moveTransition, je() && p.props.animation) {
              var Xt = Mt(), Lt = Xt.box, xt = Xt.content;
              ot([Lt, xt], J), qe([Lt, xt], "visible");
            }
            m(), y(), te(zt, p), (rt = p.popperInstance) == null || rt.forceUpdate(), p.state.isMounted = !0, f("onMount", [p]), p.props.animation && je() && de(J, function() {
              p.state.isShown = !0, f("onShown", [p]);
            });
          }
        }, fe();
      }
    }
    function cn() {
      Ue(p.state.isDestroyed, ft("hide"));
      var g = !p.state.isVisible, L = p.state.isDestroyed, D = !p.state.isEnabled, K = C(p.props.duration, 1, Re.duration);
      if (!(g || L || D) && (f("onHide", [p], !1), p.props.onHide(p) !== !1)) {
        if (p.state.isVisible = !1, p.state.isShown = !1, U = !1, E = !1, je() && (W.style.visibility = "hidden"), w(), A(), a(), je()) {
          var J = Mt(), Se = J.box, Ae = J.content;
          p.props.animation && (ot([Se, Ae], K), qe([Se, Ae], "hidden"));
        }
        m(), y(), p.props.animation ? je() && ne(K, p.unmount) : p.unmount();
      }
    }
    function _t(g) {
      Ue(p.state.isDestroyed, ft("hideWithInteractivity")), Ke().addEventListener("mousemove", le), te(Vt, le), le(g);
    }
    function Jt() {
      Ue(p.state.isDestroyed, ft("unmount")), p.state.isVisible && p.hide(), p.state.isMounted && (pe(), Ee().forEach(function(g) {
        g._tippy.unmount();
      }), W.parentNode && W.parentNode.removeChild(W), zt = zt.filter(function(g) {
        return g !== p;
      }), p.state.isMounted = !1, f("onHidden", [p]));
    }
    function ln() {
      Ue(p.state.isDestroyed, ft("destroy")), !p.state.isDestroyed && (p.clearDelayTimeouts(), p.unmount(), Z(), delete l._tippy, p.state.isDestroyed = !0, f("onDestroy", [p]));
    }
  }
  function We(l, d) {
    d === void 0 && (d = {});
    var h = Re.plugins.concat(d.plugins || []);
    et(l), Ve(d, h), tr();
    var x = Object.assign({}, d, {
      plugins: h
    }), M = qt(l);
    {
      var T = we(x.content), E = M.length > 1;
      Ue(T && E, ["tippy() was passed an Element as the `content` prop, but more than", "one tippy instance was created by this invocation. This means the", "content element will only be appended to the last tippy instance.", `

`, "Instead, pass the .innerHTML of the element, or use a function that", "returns a cloned version of the element instead.", `

`, `1) content: element.innerHTML
`, "2) content: () => element.cloneNode(true)"].join(" "));
    }
    var Y = M.reduce(function(H, U) {
      var G = U && At(U, x);
      return G && H.push(G), H;
    }, []);
    return we(l) ? Y[0] : Y;
  }
  We.defaultProps = Re, We.setDefaultProps = cr, We.currentInput = Le;
  var In = function(d) {
    var h = d === void 0 ? {} : d, x = h.exclude, M = h.duration;
    zt.forEach(function(T) {
      var E = !1;
      if (x && (E = Ie(x) ? T.reference === x : T.popper === x.popper), !E) {
        var Y = T.props.duration;
        T.setProps({
          duration: M
        }), T.hide(), T.state.isDestroyed || T.setProps({
          duration: Y
        });
      }
    });
  }, Ln = Object.assign({}, t.applyStyles, {
    effect: function(d) {
      var h = d.state, x = {
        popper: {
          position: h.options.strategy,
          left: "0",
          top: "0",
          margin: "0"
        },
        arrow: {
          position: "absolute"
        },
        reference: {}
      };
      Object.assign(h.elements.popper.style, x.popper), h.styles = x, h.elements.arrow && Object.assign(h.elements.arrow.style, x.arrow);
    }
  }), Rn = function(d, h) {
    var x;
    h === void 0 && (h = {}), dt(!Array.isArray(d), ["The first argument passed to createSingleton() must be an array of", "tippy instances. The passed value was", String(d)].join(" "));
    var M = d, T = [], E, Y = h.overrides, H = [], U = !1;
    function G() {
      T = M.map(function(P) {
        return P.reference;
      });
    }
    function oe(P) {
      M.forEach(function(N) {
        P ? N.enable() : N.disable();
      });
    }
    function he(P) {
      return M.map(function(N) {
        var p = N.setProps;
        return N.setProps = function(Te) {
          p(Te), N.reference === E && P.setProps(Te);
        }, function() {
          N.setProps = p;
        };
      });
    }
    function Q(P, N) {
      var p = T.indexOf(N);
      if (N !== E) {
        E = N;
        var Te = (Y || []).concat("content").reduce(function(W, st) {
          return W[st] = M[p].props[st], W;
        }, {});
        P.setProps(Object.assign({}, Te, {
          getReferenceClientRect: typeof Te.getReferenceClientRect == "function" ? Te.getReferenceClientRect : function() {
            return N.getBoundingClientRect();
          }
        }));
      }
    }
    oe(!1), G();
    var le = {
      fn: function() {
        return {
          onDestroy: function() {
            oe(!0);
          },
          onHidden: function() {
            E = null;
          },
          onClickOutside: function(p) {
            p.props.showOnCreate && !U && (U = !0, E = null);
          },
          onShow: function(p) {
            p.props.showOnCreate && !U && (U = !0, Q(p, T[0]));
          },
          onTrigger: function(p, Te) {
            Q(p, Te.currentTarget);
          }
        };
      }
    }, k = We(Ce(), Object.assign({}, Ne(h, ["overrides"]), {
      plugins: [le].concat(h.plugins || []),
      triggerTarget: T,
      popperOptions: Object.assign({}, h.popperOptions, {
        modifiers: [].concat(((x = h.popperOptions) == null ? void 0 : x.modifiers) || [], [Ln])
      })
    })), V = k.show;
    k.show = function(P) {
      if (V(), !E && P == null)
        return Q(k, T[0]);
      if (!(E && P == null)) {
        if (typeof P == "number")
          return T[P] && Q(k, T[P]);
        if (M.includes(P)) {
          var N = P.reference;
          return Q(k, N);
        }
        if (T.includes(P))
          return Q(k, P);
      }
    }, k.showNext = function() {
      var P = T[0];
      if (!E)
        return k.show(0);
      var N = T.indexOf(E);
      k.show(T[N + 1] || P);
    }, k.showPrevious = function() {
      var P = T[T.length - 1];
      if (!E)
        return k.show(P);
      var N = T.indexOf(E), p = T[N - 1] || P;
      k.show(p);
    };
    var z = k.setProps;
    return k.setProps = function(P) {
      Y = P.overrides || Y, z(P);
    }, k.setInstances = function(P) {
      oe(!0), H.forEach(function(N) {
        return N();
      }), M = P, oe(!1), G(), he(k), k.setProps({
        triggerTarget: T
      });
    }, H = he(k), k;
  }, Pn = {
    mouseover: "mouseenter",
    focusin: "focus",
    click: "click"
  };
  function ht(l, d) {
    dt(!(d && d.target), ["You must specity a `target` prop indicating a CSS selector string matching", "the target elements that should receive a tippy."].join(" "));
    var h = [], x = [], M = !1, T = d.target, E = Ne(d, ["target"]), Y = Object.assign({}, E, {
      trigger: "manual",
      touch: !1
    }), H = Object.assign({}, E, {
      showOnCreate: !0
    }), U = We(l, Y), G = R(U);
    function oe(V) {
      if (!(!V.target || M)) {
        var z = V.target.closest(T);
        if (z) {
          var P = z.getAttribute("data-tippy-trigger") || d.trigger || Re.trigger;
          if (!z._tippy && !(V.type === "touchstart" && typeof H.touch == "boolean") && !(V.type !== "touchstart" && P.indexOf(Pn[V.type]) < 0)) {
            var N = We(z, H);
            N && (x = x.concat(N));
          }
        }
      }
    }
    function he(V, z, P, N) {
      N === void 0 && (N = !1), V.addEventListener(z, P, N), h.push({
        node: V,
        eventType: z,
        handler: P,
        options: N
      });
    }
    function Q(V) {
      var z = V.reference;
      he(z, "touchstart", oe, v), he(z, "mouseover", oe), he(z, "focusin", oe), he(z, "click", oe);
    }
    function le() {
      h.forEach(function(V) {
        var z = V.node, P = V.eventType, N = V.handler, p = V.options;
        z.removeEventListener(P, N, p);
      }), h = [];
    }
    function k(V) {
      var z = V.destroy, P = V.enable, N = V.disable;
      V.destroy = function(p) {
        p === void 0 && (p = !0), p && x.forEach(function(Te) {
          Te.destroy();
        }), x = [], le(), z();
      }, V.enable = function() {
        P(), x.forEach(function(p) {
          return p.enable();
        }), M = !1;
      }, V.disable = function() {
        N(), x.forEach(function(p) {
          return p.disable();
        }), M = !0;
      }, Q(V);
    }
    return G.forEach(k), U;
  }
  var Dn = {
    name: "animateFill",
    defaultValue: !1,
    fn: function(d) {
      var h;
      if (!((h = d.props.render) != null && h.$$tippy))
        return dt(d.props.animateFill, "The `animateFill` plugin requires the default render function."), {};
      var x = vt(d.popper), M = x.box, T = x.content, E = d.props.animateFill ? fr() : null;
      return {
        onCreate: function() {
          E && (M.insertBefore(E, M.firstElementChild), M.setAttribute("data-animatefill", ""), M.style.overflow = "hidden", d.setProps({
            arrow: !1,
            animation: "shift-away"
          }));
        },
        onMount: function() {
          if (E) {
            var H = M.style.transitionDuration, U = Number(H.replace("ms", ""));
            T.style.transitionDelay = Math.round(U / 10) + "ms", E.style.transitionDuration = H, qe([E], "visible");
          }
        },
        onShow: function() {
          E && (E.style.transitionDuration = "0ms");
        },
        onHide: function() {
          E && qe([E], "hidden");
        }
      };
    }
  };
  function fr() {
    var l = Ce();
    return l.className = o, qe([l], "hidden"), l;
  }
  var Kt = {
    clientX: 0,
    clientY: 0
  }, $t = [];
  function Yt(l) {
    var d = l.clientX, h = l.clientY;
    Kt = {
      clientX: d,
      clientY: h
    };
  }
  function Gt(l) {
    l.addEventListener("mousemove", Yt);
  }
  function dr(l) {
    l.removeEventListener("mousemove", Yt);
  }
  var an = {
    name: "followCursor",
    defaultValue: !1,
    fn: function(d) {
      var h = d.reference, x = Wt(d.props.triggerTarget || h), M = !1, T = !1, E = !0, Y = d.props;
      function H() {
        return d.props.followCursor === "initial" && d.state.isVisible;
      }
      function U() {
        x.addEventListener("mousemove", he);
      }
      function G() {
        x.removeEventListener("mousemove", he);
      }
      function oe() {
        M = !0, d.setProps({
          getReferenceClientRect: null
        }), M = !1;
      }
      function he(k) {
        var V = k.target ? h.contains(k.target) : !0, z = d.props.followCursor, P = k.clientX, N = k.clientY, p = h.getBoundingClientRect(), Te = P - p.left, W = N - p.top;
        (V || !d.props.interactive) && d.setProps({
          getReferenceClientRect: function() {
            var ze = h.getBoundingClientRect(), gt = P, mt = N;
            z === "initial" && (gt = ze.left + Te, mt = ze.top + W);
            var yt = z === "horizontal" ? ze.top : mt, je = z === "vertical" ? ze.right : gt, He = z === "horizontal" ? ze.bottom : mt, Ke = z === "vertical" ? ze.left : gt;
            return {
              width: je - Ke,
              height: He - yt,
              top: yt,
              right: je,
              bottom: He,
              left: Ke
            };
          }
        });
      }
      function Q() {
        d.props.followCursor && ($t.push({
          instance: d,
          doc: x
        }), Gt(x));
      }
      function le() {
        $t = $t.filter(function(k) {
          return k.instance !== d;
        }), $t.filter(function(k) {
          return k.doc === x;
        }).length === 0 && dr(x);
      }
      return {
        onCreate: Q,
        onDestroy: le,
        onBeforeUpdate: function() {
          Y = d.props;
        },
        onAfterUpdate: function(V, z) {
          var P = z.followCursor;
          M || P !== void 0 && Y.followCursor !== P && (le(), P ? (Q(), d.state.isMounted && !T && !H() && U()) : (G(), oe()));
        },
        onMount: function() {
          d.props.followCursor && !T && (E && (he(Kt), E = !1), H() || U());
        },
        onTrigger: function(V, z) {
          Me(z) && (Kt = {
            clientX: z.clientX,
            clientY: z.clientY
          }), T = z.type === "focus";
        },
        onHidden: function() {
          d.props.followCursor && (oe(), G(), E = !0);
        }
      };
    }
  };
  function pr(l, d) {
    var h;
    return {
      popperOptions: Object.assign({}, l.popperOptions, {
        modifiers: [].concat((((h = l.popperOptions) == null ? void 0 : h.modifiers) || []).filter(function(x) {
          var M = x.name;
          return M !== d.name;
        }), [d])
      })
    };
  }
  var sn = {
    name: "inlinePositioning",
    defaultValue: !1,
    fn: function(d) {
      var h = d.reference;
      function x() {
        return !!d.props.inlinePositioning;
      }
      var M, T = -1, E = !1, Y = {
        name: "tippyInlinePositioning",
        enabled: !0,
        phase: "afterWrite",
        fn: function(he) {
          var Q = he.state;
          x() && (M !== Q.placement && d.setProps({
            getReferenceClientRect: function() {
              return H(Q.placement);
            }
          }), M = Q.placement);
        }
      };
      function H(oe) {
        return vr(xe(oe), h.getBoundingClientRect(), be(h.getClientRects()), T);
      }
      function U(oe) {
        E = !0, d.setProps(oe), E = !1;
      }
      function G() {
        E || U(pr(d.props, Y));
      }
      return {
        onCreate: G,
        onAfterUpdate: G,
        onTrigger: function(he, Q) {
          if (Me(Q)) {
            var le = be(d.reference.getClientRects()), k = le.find(function(V) {
              return V.left - 2 <= Q.clientX && V.right + 2 >= Q.clientX && V.top - 2 <= Q.clientY && V.bottom + 2 >= Q.clientY;
            });
            T = le.indexOf(k);
          }
        },
        onUntrigger: function() {
          T = -1;
        }
      };
    }
  };
  function vr(l, d, h, x) {
    if (h.length < 2 || l === null)
      return d;
    if (h.length === 2 && x >= 0 && h[0].left > h[1].right)
      return h[x] || d;
    switch (l) {
      case "top":
      case "bottom": {
        var M = h[0], T = h[h.length - 1], E = l === "top", Y = M.top, H = T.bottom, U = E ? M.left : T.left, G = E ? M.right : T.right, oe = G - U, he = H - Y;
        return {
          top: Y,
          bottom: H,
          left: U,
          right: G,
          width: oe,
          height: he
        };
      }
      case "left":
      case "right": {
        var Q = Math.min.apply(Math, h.map(function(W) {
          return W.left;
        })), le = Math.max.apply(Math, h.map(function(W) {
          return W.right;
        })), k = h.filter(function(W) {
          return l === "left" ? W.left === Q : W.right === le;
        }), V = k[0].top, z = k[k.length - 1].bottom, P = Q, N = le, p = N - P, Te = z - V;
        return {
          top: V,
          bottom: z,
          left: P,
          right: N,
          width: p,
          height: Te
        };
      }
      default:
        return d;
    }
  }
  var hr = {
    name: "sticky",
    defaultValue: !1,
    fn: function(d) {
      var h = d.reference, x = d.popper;
      function M() {
        return d.popperInstance ? d.popperInstance.state.elements.reference : h;
      }
      function T(U) {
        return d.props.sticky === !0 || d.props.sticky === U;
      }
      var E = null, Y = null;
      function H() {
        var U = T("reference") ? M().getBoundingClientRect() : null, G = T("popper") ? x.getBoundingClientRect() : null;
        (U && un(E, U) || G && un(Y, G)) && d.popperInstance && d.popperInstance.update(), E = U, Y = G, d.state.isMounted && requestAnimationFrame(H);
      }
      return {
        onMount: function() {
          d.props.sticky && H();
        }
      };
    }
  };
  function un(l, d) {
    return l && d ? l.top !== d.top || l.right !== d.right || l.bottom !== d.bottom || l.left !== d.left : !0;
  }
  We.setDefaultProps({
    render: $n
  }), e.animateFill = Dn, e.createSingleton = Rn, e.default = We, e.delegate = ht, e.followCursor = an, e.hideAll = In, e.inlinePositioning = sn, e.roundArrow = n, e.sticky = hr;
}), Nr = Fo(No()), eu = Fo(No()), tu = (e) => {
  const t = {
    plugins: []
  }, n = (i) => e[e.indexOf(i) + 1];
  if (e.includes("animation") && (t.animation = n("animation")), e.includes("duration") && (t.duration = parseInt(n("duration"))), e.includes("delay")) {
    const i = n("delay");
    t.delay = i.includes("-") ? i.split("-").map((o) => parseInt(o)) : parseInt(i);
  }
  if (e.includes("cursor")) {
    t.plugins.push(eu.followCursor);
    const i = n("cursor");
    ["x", "initial"].includes(i) ? t.followCursor = i === "x" ? "horizontal" : "initial" : t.followCursor = !0;
  }
  e.includes("on") && (t.trigger = n("on")), e.includes("arrowless") && (t.arrow = !1), e.includes("html") && (t.allowHTML = !0), e.includes("interactive") && (t.interactive = !0), e.includes("border") && t.interactive && (t.interactiveBorder = parseInt(n("border"))), e.includes("debounce") && t.interactive && (t.interactiveDebounce = parseInt(n("debounce"))), e.includes("max-width") && (t.maxWidth = parseInt(n("max-width"))), e.includes("theme") && (t.theme = n("theme")), e.includes("placement") && (t.placement = n("placement"));
  const r = {};
  return e.includes("no-flip") && (r.modifiers || (r.modifiers = []), r.modifiers.push({ name: "flip", enabled: !1 })), t.popperOptions = r, t;
};
function Br(e) {
  e.magic("tooltip", (t) => (n, r = {}) => {
    const i = r.timeout;
    delete r.timeout;
    const o = (0, Nr.default)(t, {
      content: n,
      trigger: "manual",
      ...r
    });
    o.show(), setTimeout(() => {
      o.hide(), setTimeout(() => o.destroy(), r.duration || 300);
    }, i || 2e3);
  }), e.directive("tooltip", (t, { modifiers: n, expression: r }, { evaluateLater: i, effect: o }) => {
    const s = n.length > 0 ? tu(n) : {};
    t.__x_tippy || (t.__x_tippy = (0, Nr.default)(t, s));
    const c = () => t.__x_tippy.enable(), v = () => t.__x_tippy.disable(), _ = (C) => {
      C ? (c(), t.__x_tippy.setContent(C)) : v();
    };
    if (n.includes("raw"))
      _(r);
    else {
      const C = i(r);
      o(() => {
        C((F) => {
          typeof F == "object" ? (t.__x_tippy.setProps(F), c()) : _(F);
        });
      });
    }
  });
}
Br.defaultProps = (e) => (Nr.default.setDefaultProps(e), Br);
var nu = Br, ru = nu;
jo.plugin(ru);
window.Alpine = jo;
window.Alpine.start();
