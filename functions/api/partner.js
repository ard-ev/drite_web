const MAX_LENGTHS = {
    fullName: 120,
    businessName: 140,
    businessType: 40,
    phone: 32,
    email: 160,
    message: 1200
};

const BUSINESS_TYPES = new Set(["Hotel", "Restaurant", "Coffee shop", "Bar", "Other"]);

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    });
}

function clean(value, maxLength) {
    return String(value || "").trim().slice(0, maxLength);
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function emailHtml(data) {
    const rows = [
        ["Full name", data.fullName],
        ["Business name", data.businessName],
        ["Business type", data.businessType],
        ["Phone", data.phone],
        ["Email", data.email],
        ["Message", data.message]
    ];

    return `
        <h2>New partner application</h2>
        <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;">
            ${rows
                .map(([label, value]) => `
                    <tr>
                        <th align="left" style="border:1px solid #ddd;background:#f6f6f6;">${escapeHtml(label)}</th>
                        <td style="border:1px solid #ddd;white-space:pre-wrap;">${escapeHtml(value)}</td>
                    </tr>
                `)
                .join("")}
        </table>
    `;
}

function validate(data) {
    if (data.website) {
        return { ok: true, spam: true };
    }

    const required = ["fullName", "businessName", "businessType", "phone", "email", "message"];
    const missing = required.some((field) => !data[field]);

    if (missing) {
        return { ok: false, error: "Missing required fields." };
    }

    if (!BUSINESS_TYPES.has(data.businessType)) {
        return { ok: false, error: "Invalid business type." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return { ok: false, error: "Invalid email address." };
    }

    if (!/^[0-9+() .-]{7,32}$/.test(data.phone)) {
        return { ok: false, error: "Invalid phone number." };
    }

    return { ok: true, spam: false };
}

export async function onRequestPost({ request, env }) {
    const origin = request.headers.get("Origin");
    const requestUrl = new URL(request.url);

    try {
        if (origin && new URL(origin).host !== requestUrl.host) {
            return jsonResponse({ ok: false, error: "Invalid form origin." }, 403);
        }
    } catch (error) {
        return jsonResponse({ ok: false, error: "Invalid form origin." }, 403);
    }

    let body;

    try {
        body = await request.json();
    } catch (error) {
        return jsonResponse({ ok: false, error: "Invalid form payload." }, 400);
    }

    const data = {
        fullName: clean(body.fullName, MAX_LENGTHS.fullName),
        businessName: clean(body.businessName, MAX_LENGTHS.businessName),
        businessType: clean(body.businessType, MAX_LENGTHS.businessType),
        phone: clean(body.phone, MAX_LENGTHS.phone),
        email: clean(body.email, MAX_LENGTHS.email),
        message: clean(body.message, MAX_LENGTHS.message),
        website: clean(body.website, 200)
    };

    const validation = validate(data);

    if (!validation.ok) {
        return jsonResponse({ ok: false, error: validation.error }, 400);
    }

    if (validation.spam) {
        return jsonResponse({ ok: true });
    }

    if (!env.RESEND_API_KEY) {
        return jsonResponse({ ok: false, error: "Email service is not configured." }, 500);
    }

    const to = env.PARTNER_TO_EMAIL || "support@driteguide.com";
    const from = env.PARTNER_FROM_EMAIL || "Drite Guide <onboarding@resend.dev>";
    const subject = `Partner application: ${data.businessName}`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from,
            to,
            subject,
            reply_to: data.email,
            html: emailHtml(data)
        })
    });

    if (!resendResponse.ok) {
        return jsonResponse({ ok: false, error: "Email could not be sent." }, 502);
    }

    return jsonResponse({ ok: true });
}
