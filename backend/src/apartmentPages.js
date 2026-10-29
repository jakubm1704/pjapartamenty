// Adresy apartamentów: /nazwa-apartamentu (PL) i /en/nazwa-apartamentu (EN),
// dynamiczny sitemap.xml (obie wersje językowe) oraz przekierowanie starych linków
// apartament.html?id=12 → /florianska-12  i  en/apartment.html?id=12 → /en/florianska-12.
//
// Strona apartamentu to wciąż jeden plik na język (apartament.html / en/apartment.html) —
// backend podstawia w nim tytuł, opis, adres kanoniczny, znaczniki hreflang i dane
// strukturalne (JSON-LD) konkretnego apartamentu, dzięki czemu Google widzi
// poprawne treści już w kodzie HTML, nie dopiero po uruchomieniu JS.

const fs = require("fs");
const path = require("path");
const store = require("./store");
const shared = require("../../js/config-data.js");

const SITE_URL = (process.env.SITE_URL || "https://www.apartmentcracow.com").replace(/\/+$/, "");

const escHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));
const escXml = escHtml;

function absoluteUrl(u){
  if (!u) return "";
  if (/^data:/i.test(u)) return "";          // placeholdery SVG nie nadają się do og:image
  if (/^https?:\/\//i.test(u)) return u;
  return SITE_URL + "/" + String(u).replace(/^\/+/, "");
}

// Apartament ukryty w panelu nie ma własnej strony (404).
function findBySlug(slug){
  return store.getApartments().find((a) => a.slug === slug && !a.hidden);
}

const urlFor = (apt, lang) => `${SITE_URL}${lang === "en" ? "/en" : ""}/${apt.slug}`;

function renderApartmentHtml(template, apt, lang){
  lang = lang === "en" ? "en" : "pl";
  const en = lang === "en";
  const title = en
    ? `${apt.name} — apartment in Kraków | P&J Apartments`
    : `${apt.name} — apartament w Krakowie | P&J Apartamenty`;
  const descSrc = en ? (apt.description_en || apt.description) : apt.description;
  const desc = String(descSrc || "").slice(0, 300);
  const url = urlFor(apt, lang);
  const image = absoluteUrl((apt.images || [])[0]);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: apt.name,
    description: desc,
    url,
    inLanguage: lang,
    numberOfRooms: apt.bedrooms === 0 ? 1 : apt.bedrooms,
    numberOfBedrooms: apt.bedrooms,
    occupancy: { "@type": "QuantitativeValue", maxValue: apt.capacity },
    address: {
      "@type": "PostalAddress", addressLocality: "Kraków", addressCountry: "PL",
      streetAddress: (en ? shared.addressLabel(apt, "en") : apt.address) || undefined,
    },
    amenityFeature: shared.amenitiesFor(apt, lang).map((n) => ({ "@type": "LocationFeatureSpecification", name: n, value: true })),
  };
  if (apt.area) ld.floorSize = { "@type": "QuantitativeValue", value: apt.area, unitCode: "MTK" };
  if (apt.floor !== null && apt.floor !== undefined) ld.floorLevel = String(apt.floor);
  if (image) ld.image = image;
  const ldJson = JSON.stringify(ld).replace(/</g, "\\u003c");

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escHtml(desc)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escHtml(desc)}$2`)
    // szablon nie ma kanonicznego adresu ani hreflang — usuwamy ewentualne, by nie dublować
    .replace(/<link rel="(canonical|alternate)"[^>]*>\s*/g, "")
    .replace(/<meta property="og:url"[^>]*>\s*/g, "");
  if (image) html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${escHtml(image)}$2`);

  const plUrl = urlFor(apt, "pl");
  const enUrl = urlFor(apt, "en");
  const head =
    `<link rel="canonical" href="${escHtml(url)}">\n` +
    `<link rel="alternate" hreflang="pl" href="${escHtml(plUrl)}">\n` +
    `<link rel="alternate" hreflang="en" href="${escHtml(enUrl)}">\n` +
    `<link rel="alternate" hreflang="x-default" href="${escHtml(plUrl)}">\n` +
    `<meta property="og:url" content="${escHtml(url)}">\n` +
    `<script type="application/ld+json">${ldJson}</script>\n`;
  return html.replace("</head>", head + "</head>");
}

// Pary stron statycznych PL ↔ EN (do sitemap.xml). [PL, EN, priorytet]
const STATIC_PAGES = [
  ["", "en/", "1.0"],
  ["apartamenty.html", "en/apartments.html", "0.9"],
  ["rezerwacja.html", "en/booking.html", "0.8"],
  ["okolica.html", "en/attractions.html", "0.7"],
  ["kontakt.html", "en/contact.html", "0.7"],
  ["transfery.html", "en/transfers.html", "0.6"],
  ["parking.html", "en/parking.html", "0.6"],
  ["sniadania.html", "en/breakfast.html", "0.6"],
  ["wycieczki.html", "en/tours.html", "0.6"],
  ["regulamin.html", "en/terms.html", "0.3"],
  ["polityka-prywatnosci.html", "en/privacy-policy.html", "0.3"],
];

function buildSitemap(){
  const entry = (plUrl, enUrl, prio) => {
    const alt =
      `\n    <xhtml:link rel="alternate" hreflang="pl" href="${escXml(plUrl)}"/>` +
      `\n    <xhtml:link rel="alternate" hreflang="en" href="${escXml(enUrl)}"/>` +
      `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escXml(plUrl)}"/>`;
    return [plUrl, enUrl].map((u) =>
      `  <url>\n    <loc>${escXml(u)}</loc>${alt}\n    <priority>${prio}</priority>\n  </url>`).join("\n");
  };
  const urls = [
    ...STATIC_PAGES.map(([pl, en, prio]) => entry(`${SITE_URL}/${pl}`, `${SITE_URL}/${en}`, prio)),
    ...store.getApartments().filter((a) => a.slug && !a.hidden)
      .map((a) => entry(urlFor(a, "pl"), urlFor(a, "en"), "0.8")),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
}

function attachApartmentPages(app, siteRoot){
  const templates = { pl: path.join(siteRoot, "apartament.html"), en: path.join(siteRoot, "en", "apartment.html") };

  const keepQuery = (req) => {
    const qs = new URLSearchParams();
    for (const k of ["checkin", "checkout", "guests"]) if (req.query[k]) qs.set(k, String(req.query[k]));
    return qs.toString() ? "?" + qs.toString() : "";
  };

  // Stare linki: /apartament.html?id=12 → 301 na /florianska-12
  app.get("/apartament.html", (req, res, next) => {
    const apt = req.query.id ? store.getApartment(req.query.id) : null;
    if (!apt || !apt.slug || apt.hidden) return next();
    res.redirect(301, "/" + apt.slug + keepQuery(req));
  });
  // … i angielska wersja: /en/apartment.html?id=12 → 301 na /en/florianska-12
  app.get("/en/apartment.html", (req, res, next) => {
    const apt = req.query.id ? store.getApartment(req.query.id) : null;
    if (!apt || !apt.slug || apt.hidden) return next();
    res.redirect(301, "/en/" + apt.slug + keepQuery(req));
  });

  // sitemap.xml zawsze aktualny — strony statyczne + wszystkie widoczne apartamenty, w obu językach.
  app.get("/sitemap.xml", (req, res) => res.type("application/xml").send(buildSitemap()));

  function serve(lang){
    return (req, res, next) => {
      const slug = req.params.slug;
      if (!/^[a-z0-9-]+$/.test(slug)) return next();
      const apt = findBySlug(slug);
      if (!apt) return next();
      // /florianska-12/ → /florianska-12 (względne ścieżki do CSS/JS wymagają adresu bez ukośnika)
      if (req.path.length > 1 && req.path.endsWith("/")){
        const q = req.originalUrl.slice(req.path.length);
        return res.redirect(301, (lang === "en" ? "/en/" : "/") + slug + q);
      }
      fs.readFile(templates[lang], "utf-8", (err, template) => {
        if (err) return next(err);
        res.type("html").send(renderApartmentHtml(template, apt, lang));
      });
    };
  }

  return {
    mountSlugRoute(){
      app.get("/en/:slug", serve("en"));
      app.get("/:slug", serve("pl"));
    },
  };
}

module.exports = { attachApartmentPages, renderApartmentHtml, buildSitemap };
