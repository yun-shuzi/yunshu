document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });

  const scroll = document.querySelector("[data-detail-scroll]");
  const sections = Array.from(document.querySelectorAll("[data-detail-section]"));
  const navItems = Array.from(document.querySelectorAll("[data-detail-nav-item]"));
  const progress = document.querySelector("[data-detail-progress]");

  if (!scroll || !sections.length || !navItems.length) {
    return;
  }

  sections.forEach((section) => {
    if (section.querySelector(".detail-section__lead")) {
      return;
    }

    const head = section.querySelector(".detail-section__head");
    const copy = section.querySelector(".detail-panel__copy");
    const art = section.querySelector(".detail-panel__art");
    const panel = section.querySelector(".detail-panel");

    if (!head || !copy || !art) {
      return;
    }

    const heading = head.querySelector(".detail-section__heading");
    const tag = head.querySelector(".detail-section__tag");
    const intro = copy.querySelector("p");
    if (!heading || !tag || !intro) {
      return;
    }

    const introText = intro.textContent.trim();
    if (introText.length > 20) {
      intro.textContent = "";
      introText.split("").forEach((char, index) => {
        intro.append(document.createTextNode(char));
        if (index === 19) {
          intro.append(document.createElement("br"));
        }
      });
    }

    const content = document.createElement("div");
    content.className = "detail-section__content";

    const lead = document.createElement("div");
    lead.className = "detail-section__lead";
    lead.append(heading, intro);

    const meta = document.createElement("div");
    meta.className = "detail-section__meta";

    tag.classList.add("detail-section__theme");
    const themeMap = {
      "portfolio-1": "城市",
      "portfolio-2": "古建筑",
      "portfolio-3": "校园",
      "portfolio-4": "校园",
      "portfolio-5": "校园",
      "blog-1": "高中",
      "blog-2": "高中",
      "blog-3": "高考",
      "blog-4": "大学",
      "blog-5": "活动",
      "travel-1": "",
      "travel-2": "",
      "travel-3": "",
      "travel-4": "",
      "travel-5": "",
    };
    tag.textContent = themeMap[section.id] || "主题";

    const place = document.createElement("span");
    place.className = "detail-section__place";
    const placeMap = {
      "portfolio-1": "深圳 · 莲花山",
      "portfolio-2": "东莞 · 黄旗",
      "portfolio-3": "深圳 · 沧海",
      "portfolio-4": "深圳 · 粤海",
      "portfolio-5": "东莞 · 东正",
      "blog-1": "东莞 · 东正",
      "blog-2": "东莞 · 东正",
      "blog-3": "东莞 · 同沙",
      "blog-4": "深圳 · 粤海",
      "blog-5": "深圳",
      "travel-1": "湖南",
      "travel-2": "湖南",
      "travel-3": "贵州",
      "travel-4": "山东",
      "travel-5": "湛江",
    };
    place.textContent = placeMap[section.id] || "中国 深圳";

    const time = document.createElement("span");
    time.className = "detail-section__time";
    const timeMap = {
      "portfolio-1": "2025",
      "portfolio-2": "2025",
      "portfolio-3": "2025",
      "portfolio-4": "2025",
      "portfolio-5": "2023",
      "blog-1": "2025",
      "blog-2": "2024",
      "blog-3": "2025",
      "blog-4": "2025",
      "blog-5": "2025",
      "travel-1": "2025",
      "travel-2": "2025",
      "travel-3": "2025",
      "travel-4": "2025",
      "travel-5": "2026",
    };
    time.textContent = timeMap[section.id] || "2006.3";

    meta.append(tag, place, time);
    content.append(lead, meta);

    section.insertBefore(content, head);
    section.append(art);

    head.remove();
    copy.remove();

    if (panel) {
      panel.remove();
    }
  });

  const setActive = (id) => {
    navItems.forEach((item) => {
      const active = item.getAttribute("href") === `#${id}`;
      item.classList.toggle("is-active", active);
      if (active) {
        item.setAttribute("aria-current", "true");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    if (progress) {
      const index = Math.max(0, sections.findIndex((section) => section.id === id));
      progress.textContent = `${String(index + 1).padStart(2, "0")} / ${String(sections.length).padStart(2, "0")}`;
    }
  };

  navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      const target = item.getAttribute("href");
      if (!target) {
        return;
      }

      const section = scroll.querySelector(target);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        setActive(visible.target.id);
      }
    },
    {
      root: scroll,
      threshold: [0.4, 0.55, 0.7],
    }
  );

  sections.forEach((section) => observer.observe(section));

  const initialHash = window.location.hash ? window.location.hash.slice(1) : "";
  const initialSection = sections.find((section) => section.id === initialHash) || sections[0];
  if (initialSection) {
    setActive(initialSection.id);
  }
});

