const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const rootDir = __dirname;
const applicationsDir = path.join(rootDir, "applications");
const port = Number(process.env.PORT) || 3000;

const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".txt": "text/plain; charset=utf-8"
};

function send(response, statusCode, body, contentType = "text/plain; charset=utf-8") {
    response.writeHead(statusCode, { "Content-Type": contentType });
    response.end(body);
}

function sanitizeFileNamePart(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "application";
}

function formatApplication(application) {
    return [
        "Drite Guide Partner Application",
        "================================",
        "",
        `Submitted at: ${application.submittedAt}`,
        `Full name: ${application.fullName}`,
        `Business name: ${application.businessName}`,
        `Business type: ${application.businessType}`,
        `Phone: ${application.phone}`,
        `Email: ${application.email}`,
        "",
        "Message:",
        application.message
    ].join("\n");
}

async function readRequestBody(request) {
    let body = "";

    for await (const chunk of request) {
        body += chunk;

        if (body.length > 100_000) {
            throw new Error("Request body is too large");
        }
    }

    return body;
}

async function handlePartnerApplication(request, response) {
    try {
        const body = await readRequestBody(request);
        const application = JSON.parse(body);
        const requiredFields = ["fullName", "businessName", "businessType", "phone", "email", "message"];

        for (const field of requiredFields) {
            if (!String(application[field] || "").trim()) {
                send(response, 400, JSON.stringify({ error: `${field} is required` }), "application/json; charset=utf-8");
                return;
            }
        }

        const submittedAt = new Date().toISOString();
        const savedApplication = {
            fullName: String(application.fullName).trim(),
            businessName: String(application.businessName).trim(),
            businessType: String(application.businessType).trim(),
            phone: String(application.phone).trim(),
            email: String(application.email).trim(),
            message: String(application.message).trim(),
            submittedAt
        };
        const fileName = `${submittedAt.replace(/[:.]/g, "-")}-${sanitizeFileNamePart(savedApplication.businessName)}.txt`;
        const filePath = path.join(applicationsDir, fileName);

        await fs.mkdir(applicationsDir, { recursive: true });
        await fs.writeFile(filePath, formatApplication(savedApplication), "utf8");

        send(response, 200, JSON.stringify({ ok: true, fileName }), "application/json; charset=utf-8");
    } catch (error) {
        send(response, 500, JSON.stringify({ error: "Application could not be saved" }), "application/json; charset=utf-8");
    }
}

async function serveStaticFile(request, response) {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const filePath = path.normalize(path.join(rootDir, requestedPath));

    if (!filePath.startsWith(rootDir)) {
        send(response, 403, "Forbidden");
        return;
    }

    try {
        const file = await fs.readFile(filePath);
        send(response, 200, file, mimeTypes[path.extname(filePath)] || "application/octet-stream");
    } catch (error) {
        send(response, 404, "Not found");
    }
}

const server = http.createServer(async (request, response) => {
    if (request.method === "POST" && request.url === "/api/partner") {
        await handlePartnerApplication(request, response);
        return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
        await serveStaticFile(request, response);
        return;
    }

    send(response, 405, "Method not allowed");
});

server.listen(port, () => {
    console.log(`Drite Guide site running at http://localhost:${port}`);
    console.log(`Applications will be saved in ${applicationsDir}`);
});
