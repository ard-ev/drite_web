const translations = {
    sq: {
        navAbout: "Rreth nesh",
        navWhy: "Pse Shqipëria",
        navBusiness: "Biznese",
        navContact: "Kontakt",
        contactCta: "Kontakt",
        heroTitle: "Zbulo Shqipërinë me dritë të qartë.",
        heroLead: "Dritë Guide ndihmon udhëtarët të gjejnë restorante, hotele, vende lokale dhe përvoja autentike pa zhurmë, pa konfuzion, vetëm rekomandime të zgjedhura me kujdes.",
        heroPrimary: "Eksploro guidën",
        heroSecondary: "Kontakto",
        heroMark: "Guida jote në Shqipëri",
        aboutEyebrow: "Rreth nesh",
        aboutTitle: "Një mënyrë më e pastër për të udhëtuar.",
        aboutBody: "Ne ndërtojmë një guidë digjitale për njerëzit që duan të përjetojnë Shqipërinë me më shumë besim: ku të hanë, ku të qëndrojnë, çfarë të vizitojnë dhe cilat biznese ia vlejnë.",
        statOneTitle: "Të zgjedhura",
        statOneBody: "vende me kujdes",
        statTwoTitle: "Vendase",
        statTwoBody: "biznese shqiptare",
        statThreeTitle: "Të qarta",
        statThreeBody: "udhëzim i lehtë",
        featureOneTitle: "Guidë për turistët",
        featureOneBody: "Rekomandime të shkurtra, të besueshme dhe të lehta për t'u përdorur gjatë udhëtimit.",
        featureTwoTitle: "Dukshmëri për bizneset",
        featureTwoBody: "Prezencë profesionale për restorante, hotele, bare, transport dhe përvoja lokale.",
        featureThreeTitle: "Identitet shqiptar",
        featureThreeBody: "Një platformë që e prezanton vendin me shije moderne dhe respekt për kulturën lokale.",
        whyEyebrow: "Pse Shqipëria?",
        whyTitle: "Sepse destinacionet më të mira shpesh fshihen në detaje.",
        whyBody: "Nga bregdeti te qytetet historike, nga kuzhina tradicionale te mikpritja, Shqipëria ka shumë për të treguar. Dritë e bën këtë histori më të lehtë për t'u gjetur.",
        businessEyebrow: "Për bizneset",
        businessTitle: "Na kontakto për Dritë Guide.",
        businessBody: "Nëse ke një biznes turistik në Shqipëri, na shkruaj direkt dhe ekipi ynë do të të përgjigjet.",
        businessButton: "Kontakto ekipin",
        categoriesTitle: "Kategoritë",
        categoryOne: "Restorante",
        categoryTwo: "Kafene",
        categoryThree: "Hotele dhe akomodime",
        categoryFour: "Bare dhe ambiente nate",
        categoryFive: "Taksi dhe transport",
        categorySix: "Përvoja lokale",
        categorySeven: "Vende të veçanta",
        benefitsEyebrow: "Avantazhet",
        benefitsTitle: "Pse bizneset zgjedhin Dritë?",
        benefitOneTitle: "Më shumë dukshmëri",
        benefitOneBody: "Shfaq biznesin te udhëtarët që po kërkojnë rekomandime reale.",
        benefitTwoTitle: "Prezencë e pastër",
        benefitTwoBody: "Një faqe e kuruar me informacion të qartë, pamje moderne dhe kontakt të lehtë.",
        benefitThreeTitle: "Besim më i madh",
        benefitThreeBody: "Rekomandimet e zgjedhura ndihmojnë turistët të vendosin më shpejt.",
        footerBrand: "© 2026 Dritë Guide",
        footerLine: "Ndiq dritën tënde."
    },
    en: {
        navAbout: "About",
        navWhy: "Why Albania",
        navBusiness: "Businesses",
        navContact: "Contact",
        contactCta: "Contact",
        heroTitle: "Discover Albania with a clearer guide.",
        heroLead: "Dritë Guide helps travelers find restaurants, hotels, local places, and authentic experiences without noise or confusion, only carefully selected recommendations.",
        heroPrimary: "Explore the guide",
        heroSecondary: "Contact us",
        heroMark: "Your guide in Albania",
        aboutEyebrow: "About",
        aboutTitle: "A cleaner way to travel.",
        aboutBody: "We are building a digital guide for people who want to experience Albania with more confidence: where to eat, where to stay, what to visit, and which local businesses are worth their time.",
        statOneTitle: "Curated",
        statOneBody: "carefully chosen places",
        statTwoTitle: "Local",
        statTwoBody: "Albanian businesses",
        statThreeTitle: "Simple",
        statThreeBody: "easy guidance",
        featureOneTitle: "Guide for travelers",
        featureOneBody: "Short, trusted, and easy recommendations for people already on the move.",
        featureTwoTitle: "Visibility for businesses",
        featureTwoBody: "A professional presence for restaurants, hotels, bars, transport, and local experiences.",
        featureThreeTitle: "Albanian identity",
        featureThreeBody: "A platform that presents the country with modern taste and respect for local culture.",
        whyEyebrow: "Why Albania?",
        whyTitle: "Because the best destinations are often hidden in the details.",
        whyBody: "From the coast to historic cities, from traditional food to hospitality, Albania has a lot to show. Dritë makes that story easier to find.",
        businessEyebrow: "For businesses",
        businessTitle: "Contact us about Dritë Guide.",
        businessBody: "If you have a tourism business in Albania, write to us directly and our team will reply.",
        businessButton: "Contact the team",
        categoriesTitle: "Categories",
        categoryOne: "Restaurants",
        categoryTwo: "Coffee shops",
        categoryThree: "Hotels and stays",
        categoryFour: "Bars and lounges",
        categoryFive: "Taxi and transport",
        categorySix: "Local experiences",
        categorySeven: "Hidden gems",
        benefitsEyebrow: "Benefits",
        benefitsTitle: "Why businesses choose Dritë?",
        benefitOneTitle: "More visibility",
        benefitOneBody: "Show your business to travelers looking for real recommendations.",
        benefitTwoTitle: "Clean presence",
        benefitTwoBody: "A curated page with clear information, modern visuals, and easy contact.",
        benefitThreeTitle: "More trust",
        benefitThreeBody: "Selected recommendations help travelers decide faster.",
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
