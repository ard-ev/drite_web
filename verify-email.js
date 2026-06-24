const params = new URLSearchParams(window.location.search);
const hasError = params.has("error") || params.has("error_description");

if (hasError) {
    document.body.classList.add("verify-error");
    document.querySelector("[data-verify-eyebrow]").textContent = "Verification failed";
    document.querySelector("[data-verify-title]").textContent = "The link could not be verified.";
    document.querySelector("[data-verify-lead]").textContent = "The link may have expired or already been used. Request a new verification email and try again.";
}

requestAnimationFrame(() => {
    document.querySelector(".reveal").classList.add("is-visible");
});
