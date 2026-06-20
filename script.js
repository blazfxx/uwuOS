var biggestIndex = 10;
var selectedIcon = null;
var notes = [];

function setCookie(name, value) {
  var expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
  var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function bootSequence() {
  var boot = document.querySelector("#boot");
  var progress = document.querySelector("#bootprogress");
  var bar = document.querySelector("#bootbar");
  var greeting = document.querySelector("#bootgreeting");
  var nameScreen = document.querySelector("#namescreen");
  var input = document.querySelector("#bootnameinput");
  var savedName = localStorage.getItem("uwuos_username");
  var value = 0;

  function dismissBoot(delay) {
    setTimeout(function () {
      boot.classList.add("hidden");
    }, delay);
  }

  function showNameScreen() {
    boot.classList.add("hidden");
    nameScreen.classList.add("visible");
    setTimeout(function () {
      input.focus();
    }, 400);
  }

  function submitName() {
    var name = input.value.trim();
    if (!name) return;
    localStorage.setItem("uwuos_username", name);
    nameScreen.classList.remove("visible");
  }

  document.querySelector("#bootnamesubmit").addEventListener("click", submitName);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitName();
  });

  var interval = setInterval(function () {
    value += Math.random() * 22 + 8;
    if (value >= 100) {
      value = 100;
      clearInterval(interval);
      setTimeout(function () {
        if (savedName) {
          bar.style.display = "none";
          greeting.textContent = "Welcome back, " + savedName + "... UwU~";
          greeting.classList.add("visible");
          dismissBoot(1600);
        } else {
          showNameScreen();
        }
      }, 350);
    }
    progress.style.width = value + "%";
  }, 200);
}

function updateClock() {
  var now = new Date();
  var time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  var date = now.toLocaleDateString([], { month: "short", day: "numeric" });
  document.querySelector("#clock").textContent = date + "  " + time;
}

function controlVideos(element, command) {
  element.querySelectorAll("iframe").forEach(function (frame) {
    if (frame.src.indexOf("youtube.com") === -1) return;
    frame.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: command, args: [] }),
      "*"
    );
  });
}

function openWindow(element) {
  element.style.display = "flex";
  bringToFront(element);
  updateDock();
  controlVideos(element, "playVideo");
}

function closeWindow(element) {
  element.style.display = "none";
  updateDock();
  controlVideos(element, "pauseVideo");
}

function bringToFront(element) {
  biggestIndex++;
  element.style.zIndex = biggestIndex;
  document.querySelector("#topbar").style.zIndex = biggestIndex + 1;
  document.querySelector("#dock").style.zIndex = biggestIndex + 1;
}

function dragElement(element) {
  var header = document.getElementById(element.id + "header");
  var target = header || element;
  var startX = 0;
  var startY = 0;

  target.addEventListener("mousedown", startDragging);

  function startDragging(e) {
    if (e.target.closest(".window-close")) return;
    var rect = element.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    if (x < 8 || x > rect.width - 8 || y < 8 || y > rect.height - 8) return;
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDragging);
  }

  function drag(e) {
    e.preventDefault();
    var deltaX = startX - e.clientX;
    var deltaY = startY - e.clientY;
    startX = e.clientX;
    startY = e.clientY;
    element.style.top = element.offsetTop - deltaY + "px";
    element.style.left = element.offsetLeft - deltaX + "px";
  }

  function stopDragging() {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDragging);
  }
}

function resizeElement(element) {
  var edge = 8;
  var minWidth = 280;
  var minHeight = 140;
  var active = null;
  var startX = 0;
  var startY = 0;
  var startRect = null;

  element.addEventListener("mousemove", updateCursor);
  element.addEventListener("mousedown", startResizing);

  function hitTest(e) {
    var rect = element.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    return {
      left: x < edge,
      right: x > rect.width - edge,
      top: y < edge,
      bottom: y > rect.height - edge
    };
  }

  function cursorFor(hit) {
    if ((hit.left && hit.top) || (hit.right && hit.bottom)) return "nwse-resize";
    if ((hit.right && hit.top) || (hit.left && hit.bottom)) return "nesw-resize";
    if (hit.left || hit.right) return "ew-resize";
    if (hit.top || hit.bottom) return "ns-resize";
    return "";
  }

  function updateCursor(e) {
    if (active) return;
    var cursor = cursorFor(hitTest(e));
    element.style.cursor = cursor;
    var header = document.getElementById(element.id + "header");
    if (header) header.style.cursor = cursor || "";
  }

  function startResizing(e) {
    var hit = hitTest(e);
    if (!hit.left && !hit.right && !hit.top && !hit.bottom) return;
    e.preventDefault();
    e.stopPropagation();
    active = hit;
    startX = e.clientX;
    startY = e.clientY;
    startRect = {
      width: element.offsetWidth,
      height: element.offsetHeight,
      top: element.offsetTop,
      left: element.offsetLeft
    };
    bringToFront(element);
    document.body.style.cursor = cursorFor(hit);
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResizing);
  }

  function resize(e) {
    e.preventDefault();
    var deltaX = e.clientX - startX;
    var deltaY = e.clientY - startY;

    if (active.right) {
      element.style.width = Math.max(minWidth, startRect.width + deltaX) + "px";
    }
    if (active.bottom) {
      element.style.height = Math.max(minHeight, startRect.height + deltaY) + "px";
    }
    if (active.left) {
      var width = Math.max(minWidth, startRect.width - deltaX);
      element.style.width = width + "px";
      element.style.left = startRect.left + (startRect.width - width) + "px";
    }
    if (active.top) {
      var height = Math.max(minHeight, startRect.height - deltaY);
      element.style.height = height + "px";
      element.style.top = startRect.top + (startRect.height - height) + "px";
    }
  }

  function stopResizing() {
    active = null;
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResizing);
  }
}

function setupWindow(id) {
  var element = document.querySelector("#" + id);

  dragElement(element);
  resizeElement(element);

  element.addEventListener("mousedown", function () {
    bringToFront(element);
  });

  var closeButton = element.querySelector("[data-close]");
  closeButton.addEventListener("click", function () {
    closeWindow(element);
  });
}

function setupIcons() {
  var icons = document.querySelectorAll(".icon");

  icons.forEach(function (icon) {
    icon.addEventListener("click", function () {
      if (selectedIcon && selectedIcon !== icon) {
        selectedIcon.classList.remove("selected");
      }
      icon.classList.add("selected");
      selectedIcon = icon;
    });

    icon.addEventListener("dblclick", function () {
      openWindow(document.querySelector("#" + icon.dataset.window));
    });
  });

  document.querySelector("#desktop").addEventListener("click", function (e) {
    if (e.target === e.currentTarget && selectedIcon) {
      selectedIcon.classList.remove("selected");
      selectedIcon = null;
    }
  });
}

function setupDock() {
  var dock = document.querySelector("#dock");

  applyDockOrder();

  document.querySelectorAll(".dock-icon").forEach(function (button) {
    button.draggable = true;
    var dragging = false;

    button.addEventListener("click", function () {
      if (dragging) return;
      var target = document.querySelector("#" + button.dataset.window);
      if (target.style.display === "none") {
        openWindow(target);
      } else {
        bringToFront(target);
      }
    });

    button.addEventListener("dragstart", function () {
      dragging = true;
      button.classList.add("dragging");
    });

    button.addEventListener("dragend", function () {
      button.classList.remove("dragging");
      saveDockOrder();
      setTimeout(function () {
        dragging = false;
      }, 0);
    });
  });

  dock.addEventListener("dragover", function (e) {
    e.preventDefault();
    var moving = dock.querySelector(".dragging");
    if (!moving) return;
    var after = dockTargetAfter(dock, e.clientX);
    if (after === null) {
      dock.appendChild(moving);
    } else {
      dock.insertBefore(moving, after);
    }
  });

  updateDock();
}

function dockTargetAfter(dock, x) {
  var icons = Array.prototype.slice.call(dock.querySelectorAll(".dock-icon:not(.dragging)"));
  var closest = null;
  var closestOffset = -Infinity;
  icons.forEach(function (icon) {
    var box = icon.getBoundingClientRect();
    var offset = x - (box.left + box.width / 2);
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closest = icon;
    }
  });
  return closest;
}

function saveDockOrder() {
  var order = Array.prototype.map.call(
    document.querySelectorAll(".dock-icon"),
    function (icon) {
      return icon.dataset.window;
    }
  );
  localStorage.setItem("uwuos_dockorder", JSON.stringify(order));
}

function applyDockOrder() {
  var dock = document.querySelector("#dock");
  var saved;
  try {
    saved = JSON.parse(localStorage.getItem("uwuos_dockorder") || "null");
  } catch (e) {
    saved = null;
  }
  if (!saved) return;
  saved.forEach(function (id) {
    var icon = dock.querySelector('.dock-icon[data-window="' + id + '"]');
    if (icon) dock.appendChild(icon);
  });
}

function updateDock() {
  document.querySelectorAll(".dock-icon").forEach(function (button) {
    var target = document.querySelector("#" + button.dataset.window);
    button.classList.toggle("open", target.style.display !== "none");
  });
}

function loadNotes() {
  var saved = getCookie("uwuos_notes");
  if (!saved) return;
  try {
    notes = JSON.parse(saved);
  } catch (e) {
    notes = [];
  }
}

function saveNotes() {
  setCookie("uwuos_notes", JSON.stringify(notes));
}

function renderNotes() {
  var list = document.querySelector("#notelist");
  list.innerHTML = "";

  notes.forEach(function (text, index) {
    var item = document.createElement("li");

    var content = document.createElement("span");
    content.textContent = text;

    var remove = document.createElement("button");
    remove.className = "note-delete";
    remove.setAttribute("aria-label", "Delete note");
    remove.innerHTML =
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>';
    remove.addEventListener("click", function () {
      notes.splice(index, 1);
      saveNotes();
      renderNotes();
    });

    item.appendChild(content);
    item.appendChild(remove);
    list.appendChild(item);
  });
}

function setupNotes() {
  var input = document.querySelector("#noteinput");
  var save = document.querySelector("#notesave");

  save.addEventListener("click", function () {
    var text = input.value.trim();
    if (!text) return;
    notes.unshift(text);
    saveNotes();
    renderNotes();
    input.value = "";
    input.focus();
  });

  loadNotes();
  renderNotes();
}

function setupCalculator() {
  var display = document.querySelector("#calcdisplay");
  var current = "0";
  var stored = null;
  var operator = null;
  var fresh = true;

  function show(value) {
    var text = String(value);
    if (text.length > 12) text = Number(value).toPrecision(8).replace(/\.?0+$/, "");
    display.textContent = text;
  }

  function compute() {
    var a = parseFloat(stored);
    var b = parseFloat(current);
    if (operator === "+") return a + b;
    if (operator === "-") return a - b;
    if (operator === "*") return a * b;
    if (operator === "/") return b === 0 ? "Error" : a / b;
    return b;
  }

  function press(key) {
    if (key >= "0" && key <= "9") {
      current = fresh || current === "0" ? key : current + key;
      fresh = false;
    } else if (key === ".") {
      if (fresh) {
        current = "0.";
        fresh = false;
      } else if (current.indexOf(".") === -1) {
        current += ".";
      }
    } else if (key === "clear") {
      current = "0";
      stored = null;
      operator = null;
      fresh = true;
    } else if (key === "negate") {
      current = String(-parseFloat(current));
    } else if (key === "percent") {
      current = String(parseFloat(current) / 100);
    } else if (key === "=") {
      if (operator !== null && stored !== null) {
        current = String(compute());
        stored = null;
        operator = null;
        fresh = true;
      }
    } else {
      if (operator !== null && stored !== null && !fresh) {
        current = String(compute());
      }
      stored = current;
      operator = key;
      fresh = true;
    }
    show(current);
  }

  document.querySelectorAll(".calc-key").forEach(function (button) {
    button.addEventListener("click", function () {
      press(button.dataset.key);
    });
  });
}

function setupTerminal() {
  var output = document.querySelector("#termoutput");
  var input = document.querySelector("#terminput");
  var body = document.querySelector("#terminal .term-body");
  var bootTime = Date.now();

  var commands = {
    help: function () {
      return "available commands: " + Object.keys(commands).sort().join(", ");
    },
    about: function () {
      return "uwuOS v0.3 - a tiny os in the browser";
    },
    clear: function () {
      output.innerHTML = "";
      return null;
    },
    date: function () {
      return new Date().toLocaleString();
    },
    echo: function (args) {
      return args.join(" ");
    },
    whoami: function () {
      return "blazfxx";
    },
    github: function () {
      window.open("https://github.com/blazfxx", "_blank");
      return "opening github.com/blazfxx";
    },
    notes: function () {
      if (!notes.length) return "no notes saved";
      return notes.map(function (n, i) {
        return i + 1 + ". " + n;
      }).join("\n");
    },
    uptime: function () {
      var seconds = Math.floor((Date.now() - bootTime) / 1000);
      return "up " + Math.floor(seconds / 60) + "m " + (seconds % 60) + "s";
    },
    open: function (args) {
      var id = (args[0] || "").toLowerCase();
      var target = document.querySelector("#" + id);
      if (!target || !target.classList.contains("window")) {
        return "no app named " + (args[0] || "(nothing)");
      }
      openWindow(target);
      return "opening " + id;
    },
    neofetch: function () {
      return [
        "  ___  uwuOS v0.3",
        " /   \\ host: browser",
        "| ( ) | shell: uwush",
        " \\___/ user: blazfxx"
      ].join("\n");
    }
  };

  function print(text, className) {
    var line = document.createElement("div");
    line.className = "term-line" + (className ? " " + className : "");
    line.textContent = text;
    output.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function run(raw) {
    var parts = raw.trim().split(/\s+/);
    var name = (parts[0] || "").toLowerCase();
    if (!name) return;
    print("blazfxx@uwuos % " + raw, "term-echo");
    var command = commands[name];
    if (!command) {
      print("command not found: " + name + " (try 'help')");
      return;
    }
    var result = command(parts.slice(1));
    if (result !== null && result !== undefined) {
      result.split("\n").forEach(function (line) {
        print(line);
      });
    }
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      run(input.value);
      input.value = "";
    }
  });

  document.querySelector("#terminal .term-body").addEventListener("mousedown", function (e) {
    if (e.target === input) return;
    setTimeout(function () {
      input.focus();
    }, 0);
  });

  print("welcome to uwush. type 'help' to get started");
}

function setupSketch() {
  var canvas = document.querySelector("#sketchcanvas");
  var context = canvas.getContext("2d");
  var drawing = false;
  var color = "#f5f6f7";
  var size = 4;

  function fitCanvas() {
    var rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    if (canvas.width === Math.floor(rect.width) && canvas.height === Math.floor(rect.height)) return;
    var snapshot = document.createElement("canvas");
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext("2d").drawImage(canvas, 0, 0);
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
    context.drawImage(snapshot, 0, 0);
  }

  function point(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener("mousedown", function (e) {
    e.stopPropagation();
    fitCanvas();
    drawing = true;
    var p = point(e);
    context.beginPath();
    context.moveTo(p.x, p.y);
  });

  document.addEventListener("mousemove", function (e) {
    if (!drawing) return;
    var p = point(e);
    context.lineTo(p.x, p.y);
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
  });

  document.addEventListener("mouseup", function () {
    drawing = false;
  });

  document.querySelectorAll(".sketch-color").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelector(".sketch-color.selected").classList.remove("selected");
      button.classList.add("selected");
      color = button.dataset.color;
    });
  });

  document.querySelector("#sketchsize").addEventListener("input", function (e) {
    size = parseInt(e.target.value, 10);
  });

  document.querySelector("#sketchclear").addEventListener("click", function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
  });

  new ResizeObserver(fitCanvas).observe(canvas);
}

function getDeviceId() {
  var id = localStorage.getItem("uwuos_device");
  if (!id) {
    id = "user-" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("uwuos_device", id);
  }
  return id;
}

function getDisplayName() {
  var name = localStorage.getItem("uwuos_username") || "anon";
  var tag = getDeviceId().slice(-4);
  return name + "#" + tag;
}

function setupShorts() {
  var player = document.querySelector("#shortsplayer");
  var counter = document.querySelector("#shortscounter");
  var likeButton = document.querySelector("#shortslike");
  var likeCount = document.querySelector("#shortslikecount");
  var commentCount = document.querySelector("#shortscommentcount");
  var commentsPanel = document.querySelector("#shortscomments");
  var commentList = document.querySelector("#shortscommentlist");
  var commentInput = document.querySelector("#shortscommentinput");
  var addPanel = document.querySelector("#shortsaddpanel");
  var addInput = document.querySelector("#shortsaddinput");

  var counterBase = "https://abacus.jasoncameron.dev";
  var namespace = "uwuos-blazfxx";
  var videos = [];
  var index = 0;
  var loaded = false;

  var liked = JSON.parse(localStorage.getItem("uwuos_liked") || "{}");
  var localComments = JSON.parse(localStorage.getItem("uwuos_comments") || "{}");
  var customShorts = JSON.parse(localStorage.getItem("uwuos_myshorts") || "[]");

  var fallback = ["tPEE9ZwTmy0", "0ZP0P1WyJTA", "rUWxSEwctFU", "QH2-TGUlwu4", "8ELbX5CMomE"];

  var channels = [
    "UCi7wDE2ZTiR5QYYrUY5WhtA",
    "UCT0vMR2SGHIsB0Uscj2DOXQ",
    "UCERpfFL1aRqsrJhmKkGAEPA"
  ];

  function current() {
    return videos[index];
  }

  function fetchCount(action, key) {
    return fetch(counterBase + "/" + action + "/" + namespace + "/" + key)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return data.value || 0;
      })
      .catch(function () {
        return null;
      });
  }

  function updateLikeUI() {
    var id = current();
    likeButton.classList.toggle("liked", !!liked[id]);
    fetchCount("get", "like_" + id).then(function (value) {
      likeCount.textContent = value === null ? "0" : value;
    });
  }

  function renderComments() {
    var id = current();
    var items = localComments[id] || [];
    commentList.innerHTML = "";
    commentCount.textContent = items.length;
    if (!items.length) {
      var empty = document.createElement("li");
      empty.className = "shorts-comment-empty";
      empty.textContent = "No comments yet. Be the first.";
      commentList.appendChild(empty);
      return;
    }
    items.forEach(function (entry) {
      var item = document.createElement("li");
      var author = document.createElement("span");
      author.className = "shorts-comment-author";
      author.textContent = entry.user;
      var text = document.createElement("span");
      text.textContent = entry.text;
      item.appendChild(author);
      item.appendChild(text);
      commentList.appendChild(item);
    });
  }

  function render() {
    if (!videos.length) return;
    var id = current();
    player.innerHTML = "";
    var frame = document.createElement("iframe");
    frame.src = "https://www.youtube.com/embed/" + id +
      "?autoplay=1&rel=0&controls=0&modestbranding=1&playsinline=1&enablejsapi=1&loop=1&playlist=" + id;
    frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    frame.allowFullscreen = true;
    player.appendChild(frame);
    counter.textContent = index + 1 + " / " + videos.length;
    commentsPanel.classList.remove("open");
    addPanel.classList.remove("open");
    updateLikeUI();
    renderComments();
  }

  function show(next) {
    if (!videos.length) return;
    index = (index + next + videos.length) % videos.length;
    render();
  }

  function fetchFeed(channelId) {
    var feed = "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelId;
    var proxy = "https://api.allorigins.win/raw?url=" + encodeURIComponent(feed);
    return fetch(proxy)
      .then(function (response) {
        return response.text();
      })
      .then(function (xml) {
        var doc = new DOMParser().parseFromString(xml, "text/xml");
        return Array.prototype.slice.call(doc.querySelectorAll("entry"), 0, 10).map(function (entry) {
          var id = entry.querySelector("videoId");
          return id ? id.textContent : null;
        }).filter(Boolean);
      })
      .catch(function () {
        return [];
      });
  }

  function load() {
    if (loaded) return;
    loaded = true;
    player.innerHTML = '<p class="shorts-loading">Loading shorts...</p>';
    Promise.all(channels.map(fetchFeed)).then(function (results) {
      var ids = customShorts.slice();
      results.forEach(function (list) {
        list.forEach(function (id) {
          if (ids.indexOf(id) === -1) ids.push(id);
        });
      });
      videos = ids.length ? ids.sort(function () {
        return Math.random() - 0.5;
      }) : fallback;
      index = 0;
      render();
    });
  }

  function parseVideoId(raw) {
    var text = raw.trim();
    var match = text.match(/(?:shorts\/|watch\?v=|youtu\.be\/|embed\/)([\w-]{11})/);
    if (match) return match[1];
    if (/^[\w-]{11}$/.test(text)) return text;
    return null;
  }

  likeButton.addEventListener("click", function () {
    var id = current();
    if (!id || liked[id]) return;
    liked[id] = true;
    localStorage.setItem("uwuos_liked", JSON.stringify(liked));
    likeButton.classList.add("liked");
    likeCount.textContent = parseInt(likeCount.textContent, 10) + 1;
    fetchCount("hit", "like_" + id).then(function (value) {
      if (value !== null) likeCount.textContent = value;
    });
  });

  document.querySelector("#shortscommentstoggle").addEventListener("click", function () {
    addPanel.classList.remove("open");
    commentsPanel.classList.toggle("open");
  });

  document.querySelector("#shortscommentsclose").addEventListener("click", function () {
    commentsPanel.classList.remove("open");
  });

  function sendComment() {
    var text = commentInput.value.trim();
    var id = current();
    if (!text || !id) return;
    if (!localComments[id]) localComments[id] = [];
    localComments[id].push({ user: getDisplayName(), text: text });
    localStorage.setItem("uwuos_comments", JSON.stringify(localComments));
    commentInput.value = "";
    fetchCount("hit", "comments_" + id);
    renderComments();
  }

  document.querySelector("#shortscommentsend").addEventListener("click", sendComment);
  commentInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendComment();
  });

  document.querySelector("#shortsadd").addEventListener("click", function () {
    commentsPanel.classList.remove("open");
    addPanel.classList.toggle("open");
  });

  document.querySelector("#shortsaddclose").addEventListener("click", function () {
    addPanel.classList.remove("open");
  });

  function addShort() {
    var id = parseVideoId(addInput.value);
    if (!id) {
      addInput.value = "";
      addInput.placeholder = "Invalid link, try again";
      return;
    }
    if (customShorts.indexOf(id) === -1) {
      customShorts.push(id);
      localStorage.setItem("uwuos_myshorts", JSON.stringify(customShorts));
    }
    if (videos.indexOf(id) === -1) videos.push(id);
    index = videos.indexOf(id);
    addInput.value = "";
    addInput.placeholder = "youtube.com/shorts/...";
    render();
  }

  document.querySelector("#shortsaddsend").addEventListener("click", addShort);
  addInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") addShort();
  });

  document.querySelector("#shortsprev").addEventListener("click", function () {
    show(-1);
  });

  document.querySelector("#shortsnext").addEventListener("click", function () {
    show(1);
  });

  document.querySelectorAll('[data-window="shorts"]').forEach(function (button) {
    button.addEventListener("click", load);
    button.addEventListener("dblclick", load);
  });
}

function updateWidgets() {
  var now = new Date();
  document.querySelector("#widgettime").textContent =
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.querySelector("#widgetdate").textContent =
    now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  var name = localStorage.getItem("uwuos_username") || "anon";
  document.querySelector("#widgetuser").textContent = name;

  document.querySelector("#widgetnotes").textContent =
    notes.length + (notes.length === 1 ? " note" : " notes");

  var liked = JSON.parse(localStorage.getItem("uwuos_liked") || "{}");
  var likedCount = Object.keys(liked).length;
  document.querySelector("#widgetlikes").textContent = likedCount + " liked";
}

var settings = {
  bg: "#161719",
  bgImage: "",
  idleDelay: 60000,
  idleSize: 96,
  idleDate: true,
  idleHint: true,
  idleBg: "#161719"
};

function loadSettings() {
  try {
    var saved = JSON.parse(localStorage.getItem("uwuos_settings") || "{}");
    Object.keys(saved).forEach(function (key) {
      if (key in settings) settings[key] = saved[key];
    });
  } catch (e) {}
}

function saveSettings() {
  localStorage.setItem("uwuos_settings", JSON.stringify(settings));
}

function applySettings() {
  document.body.style.backgroundColor = settings.bg;
  if (settings.bgImage) {
    document.body.style.backgroundImage = "url('" + settings.bgImage + "')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";
  } else {
    document.body.style.backgroundImage = "none";
  }
  var afk = document.querySelector("#afk");
  afk.style.backgroundColor = settings.idleBg;
  document.querySelector("#afktime").style.fontSize = settings.idleSize + "px";
  document.querySelector("#afkdate").style.display = settings.idleDate ? "" : "none";
  document.querySelector(".afk-hint").style.display = settings.idleHint ? "" : "none";
}

function setupSettings() {
  loadSettings();
  applySettings();

  document.querySelectorAll("#bgswatches .settings-swatch").forEach(function (button) {
    button.classList.toggle("selected", button.dataset.bg === settings.bg && !settings.bgImage);
    button.addEventListener("click", function () {
      settings.bg = button.dataset.bg;
      settings.bgImage = "";
      document.querySelector("#bgimage").value = "";
      document.querySelectorAll("#bgswatches .settings-swatch").forEach(function (b) {
        b.classList.toggle("selected", b === button);
      });
      saveSettings();
      applySettings();
    });
  });

  var bgImageInput = document.querySelector("#bgimage");

  var customBg = document.querySelector("#bgcustom");
  customBg.value = settings.bg;
  customBg.addEventListener("input", function () {
    settings.bg = customBg.value;
    settings.bgImage = "";
    bgImageInput.value = "";
    document.querySelectorAll("#bgswatches .settings-swatch").forEach(function (b) {
      b.classList.remove("selected");
    });
    saveSettings();
    applySettings();
  });

  bgImageInput.value = settings.bgImage;
  function applyBgImage() {
    settings.bgImage = bgImageInput.value.trim();
    saveSettings();
    applySettings();
  }
  bgImageInput.addEventListener("change", applyBgImage);
  bgImageInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") applyBgImage();
  });
  bgImageInput.addEventListener("paste", function () {
    setTimeout(applyBgImage, 0);
  });
  document.querySelector("#bgimageclear").addEventListener("click", function () {
    bgImageInput.value = "";
    settings.bgImage = "";
    saveSettings();
    applySettings();
  });

  var delay = document.querySelector("#idledelay");
  delay.value = String(settings.idleDelay);
  delay.addEventListener("change", function () {
    settings.idleDelay = parseInt(delay.value, 10);
    saveSettings();
    resetIdleTimer();
  });

  var size = document.querySelector("#idlesize");
  size.value = String(settings.idleSize);
  size.addEventListener("change", function () {
    settings.idleSize = parseInt(size.value, 10);
    saveSettings();
    applySettings();
  });

  function bindToggle(id, key) {
    var toggle = document.querySelector(id);
    toggle.classList.toggle("on", settings[key]);
    toggle.setAttribute("aria-checked", String(settings[key]));
    toggle.addEventListener("click", function () {
      settings[key] = !settings[key];
      toggle.classList.toggle("on", settings[key]);
      toggle.setAttribute("aria-checked", String(settings[key]));
      saveSettings();
      applySettings();
    });
  }

  bindToggle("#idledate", "idleDate");
  bindToggle("#idlehint", "idleHint");

  document.querySelectorAll("#idleswatches .settings-swatch").forEach(function (button) {
    button.classList.toggle("selected", button.dataset.idlebg === settings.idleBg);
    button.addEventListener("click", function () {
      settings.idleBg = button.dataset.idlebg;
      document.querySelectorAll("#idleswatches .settings-swatch").forEach(function (b) {
        b.classList.toggle("selected", b === button);
      });
      saveSettings();
      applySettings();
    });
  });

  var nameInput = document.querySelector("#settingsname");
  nameInput.value = localStorage.getItem("uwuos_username") || "";
  nameInput.addEventListener("change", function () {
    var name = nameInput.value.trim();
    if (!name) return;
    localStorage.setItem("uwuos_username", name);
    updateWidgets();
  });
}

var resetIdleTimer = function () {};

function setupAFK() {
  var afk = document.querySelector("#afk");
  var afkTime = document.querySelector("#afktime");
  var afkDate = document.querySelector("#afkdate");
  var timer = null;
  var active = false;
  var digits = [];

  function buildClock(text) {
    afkTime.innerHTML = "";
    digits = [];
    text.split("").forEach(function (character) {
      var slot = document.createElement("span");
      slot.className = "afk-digit";
      var inner = document.createElement("span");
      inner.className = "afk-digit-inner";
      inner.textContent = character;
      slot.appendChild(inner);
      afkTime.appendChild(slot);
      digits.push(inner);
    });
  }

  function updateAFKClock() {
    var now = new Date();
    var text = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    afkDate.textContent = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

    if (digits.length !== text.length) {
      buildClock(text);
      return;
    }

    text.split("").forEach(function (character, i) {
      var inner = digits[i];
      if (inner.textContent === character) return;
      var replacement = inner.cloneNode(false);
      replacement.textContent = character;
      replacement.classList.add("afk-slide-in");
      inner.classList.add("afk-slide-out");
      inner.parentNode.appendChild(replacement);
      var old = inner;
      digits[i] = replacement;
      setTimeout(function () {
        if (old.parentNode) old.parentNode.removeChild(old);
        replacement.classList.remove("afk-slide-in");
      }, 450);
    });
  }

  function enterAFK() {
    active = true;
    buildClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    updateAFKClock();
    afk.classList.add("visible");
  }

  function exitAFK() {
    if (active) {
      active = false;
      afk.classList.remove("visible");
    }
    resetIdleTimer();
  }

  resetIdleTimer = function () {
    clearTimeout(timer);
    if (settings.idleDelay > 0) {
      timer = setTimeout(enterAFK, settings.idleDelay);
    }
  };

  ["mousemove", "mousedown", "keydown", "touchstart", "wheel"].forEach(function (event) {
    document.addEventListener(event, exitAFK, { passive: true });
  });

  setInterval(function () {
    if (active) updateAFKClock();
  }, 1000);

  resetIdleTimer();
}

var APP_LIST = [
  { id: "welcome", name: "Welcome", keywords: "home about me profile" },
  { id: "notes", name: "Notes", keywords: "write text memo" },
  { id: "about", name: "About", keywords: "info version" },
  { id: "calculator", name: "Calculator", keywords: "math numbers calc" },
  { id: "terminal", name: "Terminal", keywords: "shell command uwush console" },
  { id: "sketch", name: "Sketch", keywords: "draw paint canvas art" },
  { id: "shorts", name: "Shorts", keywords: "video youtube feed watch" },
  { id: "weather", name: "Weather", keywords: "forecast temperature climate" },
  { id: "music", name: "Music", keywords: "songs audio mp3 player play tracks" },
  { id: "settings", name: "Settings", keywords: "preferences background idle wallpaper theme" }
];

function appIconMarkup(id) {
  var icon = document.querySelector('.icon[data-window="' + id + '"] .icon-glyph svg');
  return icon ? icon.outerHTML : "";
}

function setupSpotlight() {
  var overlay = document.querySelector("#spotlight");
  var input = document.querySelector("#spotlightinput");
  var results = document.querySelector("#spotlightresults");
  var activeIndex = 0;
  var matches = [];

  function open() {
    overlay.classList.add("visible");
    input.value = "";
    render("");
    setTimeout(function () {
      input.focus();
    }, 50);
  }

  function close() {
    overlay.classList.remove("visible");
  }

  function render(query) {
    var q = query.trim().toLowerCase();
    matches = APP_LIST.filter(function (app) {
      if (!q) return true;
      return (app.name + " " + app.keywords).toLowerCase().indexOf(q) !== -1;
    });
    activeIndex = 0;
    results.innerHTML = "";
    if (!matches.length) {
      var empty = document.createElement("li");
      empty.className = "spotlight-empty";
      empty.textContent = "No results";
      results.appendChild(empty);
      return;
    }
    matches.forEach(function (app, i) {
      var item = document.createElement("li");
      item.className = "spotlight-item" + (i === 0 ? " active" : "");
      item.innerHTML = '<span class="spotlight-icon">' + appIconMarkup(app.id) + "</span>" +
        '<span class="spotlight-name">' + app.name + "</span>";
      item.addEventListener("click", function () {
        launch(app.id);
      });
      item.addEventListener("mousemove", function () {
        setActive(i);
      });
      results.appendChild(item);
    });
  }

  function setActive(i) {
    activeIndex = i;
    Array.prototype.forEach.call(results.children, function (child, index) {
      child.classList.toggle("active", index === i);
    });
  }

  function launch(id) {
    close();
    openWindow(document.querySelector("#" + id));
  }

  input.addEventListener("input", function () {
    render(input.value);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (matches.length) setActive((activeIndex + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (matches.length) setActive((activeIndex - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      if (matches[activeIndex]) launch(matches[activeIndex].id);
    } else if (e.key === "Escape") {
      close();
    }
  });

  overlay.addEventListener("mousedown", function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      overlay.classList.contains("visible") ? close() : open();
    }
  });

  document.querySelector("#searchbutton").addEventListener("click", open);
  document.querySelector("#searchfab").addEventListener("click", open);
}

function setupWeather() {
  var body = document.querySelector("#weather .weather-body");
  var loaded = false;

  function codeText(code) {
    if (code === 0) return "Clear sky";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 82) return "Rain showers";
    if (code <= 99) return "Thunderstorm";
    return "Unknown";
  }

  function load() {
    if (loaded) return;
    loaded = true;
    body.innerHTML = '<p class="weather-loading">Locating...</p>';

    function fetchWeather(lat, lon, place) {
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
        "&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto";
      fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var c = data.current;
          var d = data.daily;
          body.innerHTML =
            '<p class="weather-place">' + place + "</p>" +
            '<p class="weather-temp">' + Math.round(c.temperature_2m) + "&deg;</p>" +
            '<p class="weather-desc">' + codeText(c.weather_code) + "</p>" +
            '<div class="weather-stats">' +
            '<div><span>High</span><strong>' + Math.round(d.temperature_2m_max[0]) + "&deg;</strong></div>" +
            '<div><span>Low</span><strong>' + Math.round(d.temperature_2m_min[0]) + "&deg;</strong></div>" +
            '<div><span>Wind</span><strong>' + Math.round(c.wind_speed_10m) + " km/h</strong></div>" +
            "</div>";
        })
        .catch(function () {
          body.innerHTML = '<p class="weather-loading">Could not load weather.</p>';
        });
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          fetchWeather(pos.coords.latitude.toFixed(2), pos.coords.longitude.toFixed(2), "Your location");
        },
        function () {
          fetchWeather(40.71, -74.01, "New York");
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeather(40.71, -74.01, "New York");
    }
  }

  document.querySelectorAll('[data-window="weather"]').forEach(function (button) {
    button.addEventListener("click", load);
    button.addEventListener("dblclick", load);
  });
}

function setupMusic() {
  var audio = new Audio();
  var titleEl = document.querySelector("#musictitle");
  var subEl = document.querySelector("#musicsub");
  var disc = document.querySelector("#musicdisc");
  var playIcon = document.querySelector("#musicplayicon");
  var seek = document.querySelector("#musicseek");
  var currentEl = document.querySelector("#musiccurrent");
  var durationEl = document.querySelector("#musicduration");
  var input = document.querySelector("#musicinput");
  var list = document.querySelector("#musiclist");
  var tracks = JSON.parse(localStorage.getItem("uwuos_tracks") || "[]");
  var index = -1;
  var seeking = false;

  var playPath = "M8 5v14l11-7z";
  var pausePath = "M6 5h4v14H6zM14 5h4v14h-4z";

  function save() {
    localStorage.setItem("uwuos_tracks", JSON.stringify(tracks));
  }

  function fmt(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function nameFromUrl(url) {
    try {
      var path = decodeURIComponent(url.split("?")[0].split("/").pop());
      return path.replace(/\.[^.]+$/, "") || "Track";
    } catch (e) {
      return "Track";
    }
  }

  function renderList() {
    list.innerHTML = "";
    tracks.forEach(function (track, i) {
      var item = document.createElement("li");
      item.className = "music-item" + (i === index ? " active" : "");

      var name = document.createElement("span");
      name.className = "music-item-name";
      name.textContent = track.name;
      name.addEventListener("click", function () {
        playTrack(i);
      });

      var remove = document.createElement("button");
      remove.className = "music-item-remove";
      remove.setAttribute("aria-label", "Remove track");
      remove.innerHTML =
        '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>';
      remove.addEventListener("click", function () {
        tracks.splice(i, 1);
        if (i === index) {
          audio.pause();
          index = -1;
          updateNowPlaying();
        } else if (i < index) {
          index--;
        }
        save();
        renderList();
      });

      item.appendChild(name);
      item.appendChild(remove);
      list.appendChild(item);
    });
  }

  function updateNowPlaying() {
    if (index < 0 || !tracks[index]) {
      titleEl.textContent = "Nothing playing";
      subEl.textContent = "paste an mp3 link below";
      return;
    }
    titleEl.textContent = tracks[index].name;
    subEl.textContent = "now playing";
  }

  function setPlayingState(playing) {
    playIcon.setAttribute("d", playing ? pausePath : playPath);
    disc.classList.toggle("spinning", playing);
  }

  function playTrack(i) {
    if (i < 0 || i >= tracks.length) return;
    index = i;
    audio.src = tracks[i].url;
    audio.play().catch(function () {
      subEl.textContent = "couldn't play that link";
    });
    updateNowPlaying();
    renderList();
  }

  function addTrack() {
    var url = input.value.trim();
    if (!url) return;
    tracks.push({ url: url, name: nameFromUrl(url) });
    input.value = "";
    save();
    renderList();
    if (index < 0) playTrack(tracks.length - 1);
  }

  document.querySelector("#musicadd").addEventListener("click", addTrack);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") addTrack();
  });

  document.querySelector("#musicplay").addEventListener("click", function () {
    if (index < 0 && tracks.length) {
      playTrack(0);
      return;
    }
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  document.querySelector("#musicprev").addEventListener("click", function () {
    if (!tracks.length) return;
    playTrack((index - 1 + tracks.length) % tracks.length);
  });

  document.querySelector("#musicnext").addEventListener("click", function () {
    if (!tracks.length) return;
    playTrack((index + 1) % tracks.length);
  });

  audio.addEventListener("play", function () {
    setPlayingState(true);
  });
  audio.addEventListener("pause", function () {
    setPlayingState(false);
  });
  audio.addEventListener("ended", function () {
    if (tracks.length) playTrack((index + 1) % tracks.length);
  });
  audio.addEventListener("loadedmetadata", function () {
    durationEl.textContent = fmt(audio.duration);
  });
  audio.addEventListener("timeupdate", function () {
    if (seeking || !audio.duration) return;
    seek.value = (audio.currentTime / audio.duration) * 100;
    currentEl.textContent = fmt(audio.currentTime);
  });

  seek.addEventListener("input", function () {
    seeking = true;
  });
  seek.addEventListener("change", function () {
    if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
    seeking = false;
  });

  renderList();
  updateNowPlaying();
}

document.querySelector("#oslabel").addEventListener("click", function () {
  openWindow(document.querySelector("#welcome"));
});

["welcome", "notes", "about", "calculator", "terminal", "sketch", "shorts", "settings", "weather", "music"].forEach(setupWindow);
setupIcons();
setupDock();
setupNotes();
setupCalculator();
setupTerminal();
setupSketch();
setupShorts();
setupSettings();
setupWeather();
setupMusic();
setupSpotlight();
setupAFK();
bootSequence();
updateClock();
updateWidgets();
setInterval(updateClock, 1000);
setInterval(updateWidgets, 5000);
