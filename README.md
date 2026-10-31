# opticircle.com: static website

Plain HTML and CSS, about 1 MB in total, no build step needed to host it, no cookies, no trackers, no forms. Contact is by `mailto:` and `tel:` links only.

```
website/
  index.html  services.html  about.html  insights.html  contact.html  privacy.html  404.html
  services/   7 case-style service pages
  insights/   3 sourced notes
  mn/         Mongolian placeholder (noindex) for the translated site
  assets/     site.css, site.js, fonts/ (self-hosted, SIL OFL), img/
  CNAME  .nojekyll  robots.txt  sitemap.xml  site.webmanifest  _headers  netlify.toml
  screens/    review screenshots (desktop 1440 px and mobile 390 px)
```

## 1. Hosting (recommended: GitHub Pages, free)

GitHub Pages is free for public repositories, has no bandwidth credit meter and issues the HTTPS certificate itself.

1. Frank signs in to GitHub (create a free account with 2FA if needed).
2. New repository, for example `opticircle-site`, **Public**.
3. Upload the **contents** of this `website/` folder (not the folder itself) to the repository root. Leave out `screens/` and `README.md` if you prefer; they do no harm.
4. Settings → Pages → Build and deployment → Source: **Deploy from a branch**, Branch: `main`, folder `/ (root)`. Save.
5. Settings → Pages → Custom domain: `opticircle.com`. The `CNAME` file already contains it.
6. Verify the domain: GitHub (profile) Settings → Pages → Add a domain. It gives a TXT record named `_github-pages-challenge-<user>`; add it in Microsoft 365 DNS (step 2 below).
7. When the DNS check turns green, tick **Enforce HTTPS** (the certificate can take up to 24 hours).

Note: GitHub Pages ignores `_headers`, so the security headers there (CSP etc.) only apply on Netlify or Cloudflare. The site works the same either way.

**Alternative: Netlify (free plan).** Go to https://app.netlify.com/drop and drag the `website/` folder in. Then Domain management → Add `opticircle.com`. `netlify.toml` and `_headers` are picked up automatically, including the www → apex redirect. The free plan runs on a monthly credit allowance (300 credits; a production deploy uses about 15, bandwidth about 20 per GB), which is ample for a site of this size but is a meter to watch.

**Not recommended: Cloudflare Pages.** Using it on the bare domain means moving opticircle.com's nameservers to Cloudflare and re-creating every Microsoft 365 record there. One missed record breaks email.

## 2. DNS in Microsoft 365, without breaking email

The domain's DNS is hosted by Microsoft (nameservers `ns1-4.bdm.microsoftonline.com`). Today there is no A record at the apex or on www, so nothing currently answers on the web address.

Microsoft 365 admin centre → Settings → Domains → opticircle.com → DNS records → **+ Add record**. Add **only** these:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | @ | 185.199.108.153 | 1 hour |
| A | @ | 185.199.109.153 | 1 hour |
| A | @ | 185.199.110.153 | 1 hour |
| A | @ | 185.199.111.153 | 1 hour |
| AAAA (optional) | @ | 2606:50c0:8000::153, 8001::153, 8002::153, 8003::153 | 1 hour |
| CNAME | www | `<github-username>.github.io` | 1 hour |
| TXT | `_github-pages-challenge-<user>` | value GitHub shows you | 1 hour |

For Netlify instead: A @ `75.2.60.5` and CNAME www `<site-name>.netlify.app`.

**Do not change or delete** any existing record. As read on 31 Oct 2026 these are:

- MX `@` → `0 opticircle-com.mail.protection.outlook.com`
- TXT `@` → `v=spf1 include:spf.protection.outlook.com -all` and the `MS=`/`mscid` verification value
- CNAME `autodiscover` → `autodiscover.outlook.com`
- CNAME `enterpriseregistration` → `enterpriseregistration.windows.net`
- CNAME `lyncdiscover` → `webdir.online.lync.com`; CNAME `sip` → `sipdir.online.lync.com`
- SRV `_sip._tls` → `100 1 443 sipdir.online.lync.com`

An A record at `@` does not affect MX or TXT records, so mail keeps flowing. After the change, send a test email to frankschepers@opticircle.com.

**Recommended while you are there (improves deliverability of outreach):**
- TXT `_dmarc` → `v=DMARC1; p=none; rua=mailto:frankschepers@opticircle.com` (move to `p=quarantine` after a month of clean reports).
- Turn on DKIM for opticircle.com at https://security.microsoft.com/dkimv2 (it gives two CNAMEs, `selector1._domainkey` and `selector2._domainkey`).

## 3. After launch

- Google Search Console: add the domain property, verify by TXT, submit `https://opticircle.com/sitemap.xml`.
- Bing Webmaster Tools: import from Search Console.
- Check the Open Graph preview with LinkedIn Post Inspector (https://www.linkedin.com/post-inspector/).

## 4. Mongolian version

- `mn/index.html` is a placeholder marked `noindex`, and `robots.txt` disallows `/mn/` until the translation is ready.
- To publish: translate each page into `mn/` with the same file names, set `lang="mn"` (the builder's `head()` takes `lang`), add `<link rel="alternate" hreflang="mn" ...>` on both language versions (the slot is commented in every page head), add the pages to `sitemap.xml`, and remove the `/mn/` line in `robots.txt`.
- Fonts: Cormorant Garamond covers Cyrillic (a separate `cormorant-cyrillic.woff2`, loaded only when needed). Jost has no ө or ү, so body text in `:lang(mn)` falls back to the system font by design.

## 5. Editing and rebuilding

The HTML is generated by Python scripts in `../_build/` (Python 3 with Pillow; Playwright with Chrome for images):

| Script | Makes |
|---|---|
| `build_site.py` | every HTML page, from the copy, prices (approved list, 31 Oct 2026) and JSON-LD in the script |
| `visuals.py` | the shared graphic system: icons, method loop, timelines, charts |
| `export_graphics.py` | brand/graphics and brand/icons (SVG + PNG) |
| `social.py` | social templates, the launch posts and all banners (SVG + PNG/JPG) |
| `graphics.py` | web photo crops, favicons and avatars |
| `guidelines.py` | brand/Opticircle_Brand_Guidelines.pdf |
| `shoot.py` | screenshots: `python3 _build/shoot.py website/screens index.html about.html` with a local server on port 8931 |

Run `python3 _build/build_site.py` after any copy change, then re-upload the `website/` contents. To preview locally: `cd website && python3 -m http.server 8931` and open http://127.0.0.1:8931.

## 6. Licences

Fonts: Cormorant Garamond and Jost, SIL Open Font License 1.1 (`assets/fonts/OFL-*.txt`). Photos of Frank Schepers: his own, used with his permission, cropped only. Logo: Opticircle Consulting Ltd.
