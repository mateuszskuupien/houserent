let isScrolling = false;

window.scrollTo(0, 0);

// ===============================================

const fadeSections = document.querySelectorAll(".reveal");

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.01,
  }
);

fadeSections.forEach((section) => {
  fadeObserver.observe(section);
});

// ===============================================

function scrollToSection(sectionId) {
  const targetSection = document.getElementById(sectionId);
  if (targetSection && !isScrolling) {
    smoothScrollTo(targetSection, 1200);
  }
}

function smoothScrollTo(element, duration) {
  if (isScrolling) return;

  isScrolling = true;
  const targetPosition = element.offsetTop;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animationScroll(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const scrollAmount = easeInOutQuad(
      timeElapsed,
      startPosition,
      distance,
      duration
    );
    window.scrollTo(0, scrollAmount);

    if (timeElapsed < duration) {
      requestAnimationFrame(animationScroll);
    } else {
      isScrolling = false;
    }
  }

  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animationScroll);
}

// ===============================================

document
  .getElementById("scrollToTopBtn")
  .addEventListener("click", function () {
    smoothScrollTo(document.body, 1200);
  });

window.addEventListener("scroll", function () {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  scrollToTopBtn.style.display = window.scrollY > 100 ? "block" : "none";
});

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("calendarModal");
  const openBtn = document.getElementById("openCalendar");
  const calendar = document.getElementById("calendar");
  const monthYear = document.getElementById("monthYear");
  const prevMonthButton = document.getElementById("prevMonth");
  const nextMonthButton = document.getElementById("nextMonth");

  let reservations = [];
  let today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    loadReservations();
  });

  ["click", "touchstart"].forEach((evt) => {
    window.addEventListener(evt, function (e) {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  });

  prevMonthButton.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentYear, currentMonth);
  });

  nextMonthButton.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentYear, currentMonth);
  });

  async function loadReservations() {
    try {
      const response = await fetch("static/bookings.json");
      reservations = await response.json();
      generateCalendar(currentYear, currentMonth);
    } catch (err) {
      console.error("Błąd wczytywania bookings.json:", err);
    }
  }

  function generateCalendar(year, month) {
    calendar.innerHTML = "";
    const weekdays = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
    weekdays.forEach((dayName) => {
      const hd = document.createElement("div");
      hd.classList.add("calendar-header-day");
      hd.textContent = dayName;
      calendar.appendChild(hd);
    });
    const months = [
      "Styczeń",
      "Luty",
      "Marzec",
      "Kwiecień",
      "Maj",
      "Czerwiec",
      "Lipiec",
      "Sierpień",
      "Wrzesień",
      "Październik",
      "Listopad",
      "Grudzień",
    ];
    monthYear.textContent = `${months[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    for (let i = 0; i < firstDay.getDay(); i++) {
      const empty = document.createElement("div");
      calendar.appendChild(empty);
    }
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();

    for (let i = 0; i < firstDay.getDay(); i++) {
      const empty = document.createElement("div");
      calendar.appendChild(empty);
    }

    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, month, day);
      const div = document.createElement("div");
      div.classList.add("day");
      div.textContent = day;

      if (
        date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      ) {
        div.classList.add("past");
      } else if (isBooked(date)) {
        div.classList.add("booked");
      }

      calendar.appendChild(div);
    }
  }

  function isBooked(date) {
    for (let r of reservations) {
      const start = new Date(r.start);
      const end = new Date(r.end);
      if (date >= start && date <= end) {
        return true;
      }
    }
    return false;
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/15e178aa09baea80d0ccb0e046c1f98a",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        // Pokazujemy popup sukcesu
        Swal.fire({
          icon: "success",
          title: "Wysłano!",
          text: "Dziękujemy za kontakt — odpowiemy wkrótce.",
          confirmButtonText: "OK",
        });
        form.reset();
      } else {
        throw new Error("Status " + response.status);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Ups!",
        text: "Coś poszło nie tak przy wysyłce.",
        confirmButtonText: "OK",
      });
      console.error(err);
    }
  });
});
document.addEventListener("DOMContentLoaded", function () {
  // Modal Regulaminu
  const regulaminModal = document.getElementById("regulamin-modal");
  const regulaminModalContent = regulaminModal.querySelector(".modal-content");
  const openRegulaminBtn = document.getElementById("open-regulamin");

  // Po kliknięciu na link otwieramy modal i ładujemy regulamin
  openRegulaminBtn.addEventListener("click", function (event) {
    event.preventDefault(); // Zatrzymujemy domyślne działanie linku (przewijanie)

    // Ładowanie zawartości regulaminu
    fetch("regulamin.html")
      .then((response) => {
        if (!response.ok)
          throw new Error("Nie udało się załadować regulaminu.");
        return response.text();
      })
      .then((html) => {
        regulaminModalContent.innerHTML = html; // Wstawiamy załadowaną zawartość do modalu
        regulaminModal.style.display = "flex"; // Pokazujemy modal
      })
      .catch((error) => {
        regulaminModalContent.innerHTML = "<p>Błąd ładowania regulaminu.</p>"; // W razie błędu wyświetlamy komunikat
        regulaminModal.style.display = "flex"; // Pokazujemy modal w razie błędu
      });
  });

  // Zamknięcie modalu Regulaminu po kliknięciu poza oknem modalu
  window.addEventListener("click", function (event) {
    if (event.target === regulaminModal) {
      regulaminModal.style.display = "none"; // Ukrywamy modal
    }
  });

  // Modal Polityki Prywatności
  const politykaModal = document.getElementById("polityka-modal");
  const politykaModalContent = politykaModal.querySelector(".modal-content");
  const openPolitykaBtn = document.getElementById("open-polityka");

  // Po kliknięciu na link otwieramy modal i ładujemy politykę prywatności
  openPolitykaBtn.addEventListener("click", function (event) {
    event.preventDefault(); // Zatrzymujemy domyślne działanie linku (przewijanie)

    // Ładowanie zawartości polityki prywatności
    fetch("polityka.html")
      .then((response) => {
        if (!response.ok)
          throw new Error("Nie udało się załadować polityki prywatności.");
        return response.text();
      })
      .then((html) => {
        politykaModalContent.innerHTML = html; // Wstawiamy załadowaną zawartość do modalu
        politykaModal.style.display = "flex"; // Pokazujemy modal
      })
      .catch((error) => {
        politykaModalContent.innerHTML =
          "<p>Błąd ładowania polityki prywatności.</p>"; // W razie błędu wyświetlamy komunikat
        politykaModal.style.display = "flex"; // Pokazujemy modal w razie błędu
      });
  });

  // Zamknięcie modalu Polityki Prywatności po kliknięciu poza oknem modalu
  window.addEventListener("click", function (event) {
    if (event.target === politykaModal) {
      politykaModal.style.display = "none"; // Ukrywamy modal
    }
  });
});
document.querySelectorAll(".accordion-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.parentElement;
    item.classList.toggle("active");
  });
});
