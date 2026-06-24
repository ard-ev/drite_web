const translations = {
    sq: {
        navAbout: "Rreth nesh",
        navWhy: "Pse Shqipëria",
        navBusiness: "Biznese",
        navContact: "Kontakt",
        backButton: "Kthehu",
        pageEyebrow: "Kontakt për biznese",
        pageTitle: "Flasim direkt.",
        pageLead: "Nëse ke një biznes në Shqipëri dhe dëshiron të flasësh me Dritë Guide, na kontakto me të dhënat më poshtë.",
        emailLabel: "Email",
        phoneLabel: "Telefon",
        websiteLabel: "Website",
        instagramLabel: "Instagram",
        locationLabel: "Vendndodhja",
        locationValue: "Tiranë, Shqipëri",
        footerBrand: "© 2026 Dritë Guide",
        footerLine: "Ndiq dritën tënde."
    },
    en: {
        navAbout: "About",
        navWhy: "Why Albania",
        navBusiness: "Businesses",
        navContact: "Contact",
        backButton: "Back",
        pageEyebrow: "Business contact",
        pageTitle: "Let’s talk directly.",
        pageLead: "If you have a business in Albania and want to speak with Dritë Guide, contact us using the details below.",
        emailLabel: "Email",
        phoneLabel: "Phone",
        websiteLabel: "Website",
        instagramLabel: "Instagram",
        locationLabel: "Location",
        locationValue: "Tirana, Albania",
        footerBrand: "© 2026 Dritë Guide",
        footerLine: "Follow your light."
    }
};

const languageButton = document.querySelector("[data-lang-toggle]");
const languageLabel = document.querySelector("[data-lang-label]");

function setLanguage(language) {
    document.documentElement.lang = language === "sq" ? "sq" : "en";
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        element.textContent = translations[language][key];
    });
    languageLabel.textContent = language === "sq" ? "EN" : "SQ";
    localStorage.setItem("drite-language", language);
}

languageButton.addEventListener("click", () => {
    const nextLanguage = document.documentElement.lang === "sq" ? "en" : "sq";
    setLanguage(nextLanguage);
});

setLanguage(localStorage.getItem("drite-language") || "sq");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
