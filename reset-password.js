const SUPABASE_URL = "https://djfcaaefzgcbevynlroc.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_m3U08GJ6lB8K-mISu9IUHg_wRy-Lxnk";
const SUPABASE_AUTH_URL = `${SUPABASE_URL}/auth/v1`;

const resetForm = document.querySelector("[data-reset-form]");
const passwordInput = document.querySelector("#new-password");
const confirmPasswordInput = document.querySelector("#confirm-password");
const submitButton = document.querySelector("[data-reset-submit]");
const message = document.querySelector("[data-reset-message]");
const params = new URLSearchParams(window.location.search);
const hashParams = new URLSearchParams(window.location.hash.slice(1));
const hasError = params.has("error") || params.has("error_description") || hashParams.has("error") || hashParams.has("error_description");
const isConfigured = !SUPABASE_URL.includes("YOUR_PROJECT_ID") && !SUPABASE_PUBLIC_KEY.includes("YOUR_SUPABASE");
let recoveryAccessToken = "";
let resetSessionReady = false;
let isUpdating = false;

function setMessage(text, type = "neutral") {
    message.textContent = text;
    message.dataset.status = type;
}

function setButtonEnabled(isEnabled) {
    submitButton.disabled = !isEnabled;
}

function getUrlValue(name) {
    return params.get(name) || hashParams.get(name);
}

function clearSensitiveUrl() {
    if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function getPasswordValidation() {
    const password = passwordInput.value;
    const confirmedPassword = confirmPasswordInput.value;
    const missingRequirements = [];

    if (!resetSessionReady) {
        return {
            isValid: false,
            message: "This reset link is not active. Open the latest password reset email before updating.",
            type: "error"
        };
    }

    if (password.length > 0 && password.length < 8) {
        missingRequirements.push("at least 8 characters");
    }

    if (password.length > 0 && !/[A-Z]/.test(password)) {
        missingRequirements.push("one uppercase letter");
    }

    if (password.length > 0 && !/[0-9]/.test(password)) {
        missingRequirements.push("one number");
    }

    if (password.length > 0 && !/[^A-Za-z0-9]/.test(password)) {
        missingRequirements.push("one special character");
    }

    if (!password && !confirmedPassword) {
        return {
            isValid: false,
            message: "Use at least 8 characters, one uppercase letter, one number, and one special character.",
            type: "neutral"
        };
    }

    if (missingRequirements.length > 0) {
        return {
            isValid: false,
            message: `Password needs ${missingRequirements.join(", ")}.`,
            type: "error"
        };
    }

    if (confirmedPassword.length > 0 && password !== confirmedPassword) {
        return {
            isValid: false,
            message: "The passwords do not match.",
            type: "error"
        };
    }

    if (!password || !confirmedPassword) {
        return {
            isValid: false,
            message: "Confirm your new password to continue.",
            type: "neutral"
        };
    }

    return {
        isValid: true,
        message: "Passwords match. You can update your password now.",
        type: "success"
    };
}

function refreshFormState() {
    if (isUpdating) return;

    const validation = getPasswordValidation();
    const canSubmit = resetSessionReady && validation.isValid;
    const passwordIsWeak = passwordInput.value.length > 0 && (
        passwordInput.value.length < 8 ||
        !/[A-Z]/.test(passwordInput.value) ||
        !/[0-9]/.test(passwordInput.value) ||
        !/[^A-Za-z0-9]/.test(passwordInput.value)
    );
    const confirmationMismatch = confirmPasswordInput.value.length > 0 && passwordInput.value !== confirmPasswordInput.value;

    passwordInput.setAttribute("aria-invalid", String(passwordIsWeak));
    confirmPasswordInput.setAttribute("aria-invalid", String(confirmationMismatch));
    passwordInput.setCustomValidity(passwordIsWeak ? "Use at least 8 characters, one uppercase letter, one number, and one special character." : "");
    confirmPasswordInput.setCustomValidity(confirmationMismatch ? "The passwords do not match." : "");

    setButtonEnabled(canSubmit);
    setMessage(validation.message, validation.type);
}

function showError(title, lead, detail) {
    document.body.classList.add("verify-error");
    document.querySelector("[data-reset-eyebrow]").textContent = "Reset failed";
    document.querySelector("[data-reset-title]").textContent = title;
    document.querySelector("[data-reset-lead]").textContent = lead;
    setMessage(detail, "error");
    resetSessionReady = false;
    setButtonEnabled(false);
}

function showMissingSession() {
    document.body.classList.remove("verify-error");
    document.querySelector("[data-reset-eyebrow]").textContent = "Password reset";
    document.querySelector("[data-reset-title]").textContent = "Open the reset link from your email.";
    document.querySelector("[data-reset-lead]").textContent = "For your security, this page can update a password only when it is opened from a valid Drite Guide reset email.";
    recoveryAccessToken = "";
    resetSessionReady = false;
    refreshFormState();
}

async function requestSupabase(path, options = {}) {
    const headers = {
        apikey: SUPABASE_PUBLIC_KEY,
        "Content-Type": "application/json",
        ...options.headers
    };
    const response = await fetch(`${SUPABASE_AUTH_URL}${path}`, {
        ...options,
        headers,
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer"
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error_description || data.msg || data.message || "The Supabase request failed.");
    }

    return data;
}

async function prepareResetSession() {
    if (!isConfigured) {
        showError(
            "Supabase is not configured.",
            "Add your Supabase project URL and public anon or publishable key to this page before using password reset.",
            "The reset form is disabled until the Supabase config is added."
        );
        return;
    }

    if (hasError) {
        const errorDescription = params.get("error_description") || hashParams.get("error_description");
        showError(
            "The reset link could not be used.",
            "The link may have expired or already been used. Request a new password reset email and try again.",
            errorDescription || "Please request a new password reset email."
        );
        return;
    }

    try {
        const accessToken = getUrlValue("access_token");
        const tokenHash = getUrlValue("token_hash");
        const email = getUrlValue("email");
        const token = getUrlValue("token");
        const type = getUrlValue("type");

        if ((accessToken || tokenHash || token) && type !== "recovery") {
            throw new Error("This link is not a password recovery link.");
        }

        if (accessToken) {
            recoveryAccessToken = accessToken;
        } else if (tokenHash && type) {
            const data = await requestSupabase("/verify", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`
                },
                body: JSON.stringify({
                    token_hash: tokenHash,
                    type
                })
            });
            recoveryAccessToken = data.access_token || "";
        } else if (email && token && type) {
            const data = await requestSupabase("/verify", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`
                },
                body: JSON.stringify({
                    email,
                    token,
                    type
                })
            });
            recoveryAccessToken = data.access_token || "";
        } else {
            showMissingSession();
            return;
        }

        if (!recoveryAccessToken) {
            throw new Error("No active password reset session was found.");
        }

        resetSessionReady = true;
        clearSensitiveUrl();
        refreshFormState();
        passwordInput.focus();
    } catch (error) {
        showError(
            "The reset link could not be used.",
            "The link may have expired or already been used. Request a new password reset email and try again.",
            error.message || "Please request a new password reset email."
        );
    }
}

resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = passwordInput.value;
    const confirmedPassword = confirmPasswordInput.value;
    const validation = getPasswordValidation();

    if (!validation.isValid) {
        refreshFormState();
        return;
    }

    if (!resetSessionReady || !recoveryAccessToken) {
        showMissingSession();
        return;
    }

    isUpdating = true;
    submitButton.disabled = true;
    passwordInput.disabled = true;
    confirmPasswordInput.disabled = true;
    setMessage("Updating your password...", "neutral");

    try {
        await requestSupabase("/user", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${recoveryAccessToken}`
            },
            body: JSON.stringify({ password })
        });
    } catch (error) {
        isUpdating = false;
        submitButton.disabled = false;
        passwordInput.disabled = false;
        confirmPasswordInput.disabled = false;
        setMessage(error.message || "Could not update your password. Please try again.", "error");
        return;
    }

    recoveryAccessToken = "";
    resetSessionReady = false;
    setButtonEnabled(false);
    resetForm.reset();
    document.querySelector("[data-reset-eyebrow]").textContent = "Password updated";
    document.querySelector("[data-reset-title]").textContent = "Your password has been reset.";
    document.querySelector("[data-reset-lead]").textContent = "You can now sign in to Drite Guide with your new password.";
    setMessage("Password updated successfully.", "success");
});

passwordInput.addEventListener("input", refreshFormState);
confirmPasswordInput.addEventListener("input", refreshFormState);

prepareResetSession();

requestAnimationFrame(() => {
    document.querySelector(".reveal").classList.add("is-visible");
});
