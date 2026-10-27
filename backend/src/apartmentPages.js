// Adresy apartamentów w postaci /nazwa-apartamentu (np. /florianska-12),
// dynamiczny sitemap.xml oraz przekierowanie starych linków
// apartament.html?id=12 → /florianska-12.
//
// Strona apartamentu to wciąż jeden plik (apartament.html) — backend
// podstawia w nim tytuł, opis, adres kanoniczny i dane strukturalne
// (JSON-LD) konkretnego apartamentu, dzięki czemu Google widzi
// poprawne treści już w kodzie HTML, nie dopiero po uruchomieniu JS.

const fs = require("fs");
const path = require("path");
const store = require("./store");

const SITE_URL = (process.env.SITE_URL || "https://www.apartmentcracow.com").replace(/\/+$/, "");

const escHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));
const escXml = escHtml;

function typeLabel(a){
  if (a.bedrooms === 0) return "Studio";
  return a.bedrooms === 1 ? "1 sypialnia" : a.bedrooms + " sypialnie";
}

function absoluteUrl(u){
  if (!u) return "";
  if (/^data:/i.test(u)) return "";          // placeholdery SVG nie nadają się do og:image
  if (/^https?:\/\//i.test(u)) return u;
  return SITE_URL + "/" + String(u).replace(/^\/+/, "");
}

function findBySlug(slug){
  return store.getApartments().find((a) => a.slug === slug);
}

function renderApartmentHtml(template, apt){
  const title = `${apt.name} — apartament w Krakowie | P&J Apartamenty`;
  const desc = String(apt.description || "").slice(0, 300);
  const url = `${SITE_URL}/${apt.slug}`;
  const image = absoluteUrl((apt.images || [])[0]);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: apt.name,
    description: desc,
    url,
    numberOfRooms: apt.bedrooms === 0 ? 1 : apt.bedrooms,
    numberOfBedrooms: apt.bedrooms,
    occupancy: { "@type": "QuantitativeValue", maxValue: apt.capacity },
    address: { "@type": "PostalAddress", addressLocality: "Kraków", addressCountry: "PL", streetAddress: apt.address || undefined },
    amenityFeature: (apt.amenities || []).map((n) => ({ "@type": "LocationFeatureSpecification", name: n, value: true })),
  };
  if (apt.area) ld.floorSize = { "@type": "QuantitativeValue", value: apt.area, unitCode: "MTK" };
  if (apt.floor !== null && apt.floor !== undefined) ld.floorLevel = String(apt.floor);
  if (image) ld.image = image;
  const ldJson = JSON.stringify(ld).replace(/</g, "\\u003c");

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escHtml(desc)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escHtml(desc)}$2`);
  if (image) html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${escHtml(image)}$2`);

  const head =
    `<link rel="canonical" href="${escHtml(url)}">\n` +
    `<meta property="og:url" content="${escHtml(url)}">\n` +
    `<script type="application/ld+json">${ldJson}</script>\n`;
  return html.replace("</head>", head + "</head>");
}

function attachApartmentPages(app, siteRoot){
  const templatePath = path.join(siteRoot, "apartament.html");

  // Stare linki: /apartament.html?id=12 → 301 na /florianska-12
  app.get("/apartament.html", (req, res, next) => {
    const apt = req.query.id ? store.getApartment(req.query.id) : null;
    if (!apt || !apt.slug) return next();
    const qs = new URLSearchParams();
    for (const k of ["checkin", "checkout", "guests"]) if (req.query[k]) qs.set(k, String(req.query[k]));
    res.redirect(301, "/" + apt.slug + (qs.toString() ? "?" + qs.toString() : ""));
  });

  // sitemap.xml zawsze aktualny — strony główne + wszystkie apartamenty z bazy.
  app.get("/sitemap.xml", (req, res) => {
    const pages = [
      ["index.html", "1.0"], ["apartamenty.html", "0.9"], ["rezerwacja.html", "0.8"],
      ["okolica.html", "0.7"], ["kontakt.html", "0.7"], ["regulamin.html", "0.3"], ["polityka-prywatnosci.html", "0.3"], ["transfery.html", "0.6"],
      ["parking.html", "0.6"], ["sniadania.html", "0.6"], ["wycieczki.html", "0.6"],
    ];
    const urls = [
      ...pages.map(([p, prio]) => `  <url><loc>${escXml(SITE_URL + "/" + p)}</loc><priority>${prio}</priority></url>`),
      ...store.getApartments().filter((a) => a.slug)
        .map((a) => `  <url><loc>${escXml(SITE_URL + "/" + a.slug)}</loc><priority>0.8</priority></url>`),
    ];
    res.type("application/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
    );
  });

  return {
    mountSlugRoute(){
      app.get("/:slug", (req, res, next) => {
        const slug = req.params.slug;
        if (!/^[a-z0-9-]+$/.test(slug)) return next();
        const apt = findBySlug(slug);
        if (!apt) return next();
        // /florianska-12/ → /florianska-12 (względne ścieżki do CSS/JS wymagają adresu bez ukośnika)
        if (req.path.length > 1 && req.path.endsWith("/")){
          const q = req.originalUrl.slice(req.path.length);
          return res.redirect(301, "/" + slug + q);
        }
        fs.readFile(templatePath, "utf-8", (err, template) => {
          if (err) return next(err);
          res.type("html").send(renderApartmentHtml(template, apt));
        });
      });
    },
  };
}

module.exports = { attachApartmentPages, renderApartmentHtml };
