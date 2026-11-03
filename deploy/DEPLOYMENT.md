# Optimum Health — New Server Migration (Free SSL, no CloudFront)

**Goal:** serve the main website **and** the CRM from one server with free,
auto-renewing SSL (Let's Encrypt), DNS on Route 53, **no CloudFront**.

**Three sites on one server**

```
Browser ──HTTPS──> nginx (ports 80/443, SSL terminated here)
   ├── optimumhealth.in / www   ->  main website      (/var/www/optimum-main)
   ├── crm.optimumhealth.in     ->  CRM frontend build (/var/www/optimum-crm)
   └── api.optimumhealth.in     ->  CRM backend (proxy to Node 127.0.0.1:5001)
Route 53 holds A records for all four names -> this server's Elastic IP.
```

nginx terminates TLS and forwards plain HTTP to the Node API — the backend needs
no SSL of its own. Free SSL = **Let's Encrypt via certbot**, auto-renewing.

Assumes Ubuntu 22.04/24.04 on EC2. Adjust package commands for other distros.

---

## 1. Route 53 — point all names at the new server

In the hosted zone for `optimumhealth.in`:

1. Allocate an **Elastic IP** on EC2 and associate it with the instance (so the IP
   never changes).
2. **Delete** the old records that point to CloudFront (the `A`/`ALIAS` records for
   `optimumhealth.in`, `www`, `crm`, `api` targeting the CloudFront distribution).
3. Create **A records** → the Elastic IP:

   | Name                     | Type | Value (Elastic IP) | TTL |
   |--------------------------|------|--------------------|-----|
   | `optimumhealth.in`       | A    | `<ELASTIC_IP>`     | 300 |
   | `www.optimumhealth.in`   | A    | `<ELASTIC_IP>`     | 300 |
   | `crm.optimumhealth.in`   | A    | `<ELASTIC_IP>`     | 300 |
   | `api.optimumhealth.in`   | A    | `<ELASTIC_IP>`     | 300 |

4. Confirm all resolve to the Elastic IP **before** running certbot:
   ```bash
   dig +short optimumhealth.in
   dig +short crm.optimumhealth.in
   dig +short api.optimumhealth.in
   ```

> DNS staying on Route 53 is all that's needed — certbot's HTTP-01 challenge just
> needs these A records live. (Route 53 API / wildcard option is in the Appendix.)

---

## 2. EC2 Security Group / firewall

Open **only**: `22` (SSH), `80` (HTTP — needed for certbot + redirect), `443`
(HTTPS). Do **not** expose the Node port (5001); nginx reaches it on localhost.

---

## 3. Install the stack

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx

# Node.js 20 LTS (backend is ESM)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pm2
sudo apt install -y certbot python3-certbot-nginx
```

---

## 4. Deploy the CRM BACKEND (api.optimumhealth.in)

```bash
sudo mkdir -p /var/www/optimum-be
# upload/clone the backend there, then:
cd /var/www/optimum-be

sudo nano .env        # use deploy/.env.example; set MONGO_URI, JWT_SECRET
                      # (SAME as old server), AWS_*, PORT=5001

npm install --omit=dev
pm2 start app.js --name optimum-api
pm2 save
pm2 startup           # run the command it prints (restart API on reboot)

curl -I http://127.0.0.1:5001   # should respond, not connection-refused
```

> Keep **JWT_SECRET** identical to the old server (else everyone is logged out),
> and point **MONGO_URI** at the **same database** so all CRM data carries over.

---

## 5. Deploy the CRM FRONTEND (crm.optimumhealth.in)

The uploaded CRM frontend zip is already a **built dist** — just copy its contents:

```bash
sudo mkdir -p /var/www/optimum-crm
sudo cp -r /path/to/OptimumFE-main/* /var/www/optimum-crm/
sudo chown -R www-data:www-data /var/www/optimum-crm
```

> The build already calls `https://api.optimumhealth.in`, and its asset paths are
> absolute, so it works at crm.optimumhealth.in with **no rebuild**. Rebuild only
> if you change the API domain.

---

## 6. Deploy the MAIN WEBSITE (optimumhealth.in)

```bash
sudo mkdir -p /var/www/optimum-main
sudo cp -r /path/to/main-site/* /var/www/optimum-main/
sudo chown -R www-data:www-data /var/www/optimum-main
```

> ⚠️ The provided `optimumhealth.in.conf` assumes the main site is **static**
> (plain HTML or a built dist). If it's **WordPress/PHP or a Node app**, say so —
> I'll swap that one config's root for PHP-FPM or a proxy block. The SSL flow is
> the same regardless.

---

## 7. nginx config

```bash
sudo cp deploy/nginx/optimumhealth.in.conf      /etc/nginx/sites-available/
sudo cp deploy/nginx/crm.optimumhealth.in.conf  /etc/nginx/sites-available/
sudo cp deploy/nginx/api.optimumhealth.in.conf  /etc/nginx/sites-available/

# ⚠️ in the API config, set proxy_pass port to match .env PORT (5001)
sudo nano /etc/nginx/sites-available/api.optimumhealth.in.conf

sudo ln -s /etc/nginx/sites-available/optimumhealth.in.conf     /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/crm.optimumhealth.in.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.optimumhealth.in.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx
```

All three should now load over **plain HTTP**. Fix any issue before SSL.

---

## 8. Free SSL — issue the certificates (Let's Encrypt)

One command covers all four names and auto-adds HTTPS + redirects:

```bash
sudo certbot --nginx \
  -d optimumhealth.in -d www.optimumhealth.in \
  -d crm.optimumhealth.in -d api.optimumhealth.in \
  --redirect --agree-tos -m ravi@hackgenix.com --no-eff-email
```

certbot rewrites the three config files to add the `listen 443 ssl` blocks and
the HTTP→HTTPS redirect. Confirm auto-renewal:

```bash
sudo certbot renew --dry-run
systemctl list-timers | grep certbot
sudo nginx -t && sudo systemctl reload nginx
```

---

## 9. Verify

```bash
curl -I https://optimumhealth.in          # main site, valid cert
curl -I https://crm.optimumhealth.in       # CRM loads
curl -I https://api.optimumhealth.in       # reaches Node over HTTPS
```

In the browser: open `https://crm.optimumhealth.in`, log in, test a **bulk upload**
(the 100 MB `client_max_body_size` in the API config prevents large uploads
failing with HTTP 413).

---

## Redeploying later

- **CRM frontend:** rebuild, replace `/var/www/optimum-crm` contents, hard-refresh.
- **Main site:** replace `/var/www/optimum-main` contents.
- **Backend:** pull code, `npm install`, `pm2 restart optimum-api`.
- **Certs:** nothing — they renew automatically.

---

## Appendix — optional: DNS-01 via Route 53 (only for a *wildcard* cert)

Not needed for the four fixed names. Use only if you later want `*.optimumhealth.in`:

```bash
sudo apt install -y python3-certbot-dns-route53
# attach IAM keys/role with route53:ChangeResourceRecordSets on the zone, then:
sudo certbot certonly --dns-route53 -d optimumhealth.in -d '*.optimumhealth.in'
```

---

## What changed in the code (and why it's safe)

Only two **additive** backend changes — no existing logic touched:

1. **`app.js`** — added `app.set("trust proxy", 1);` so Express sees the real
   client protocol/IP behind nginx (correct Secure-cookie handling). Verified no
   code reads `req.ip/protocol/secure/hostname`, so behaviour is unchanged.
2. **`package.json`** — added `"start": "node app.js"` for pm2; `dev` untouched.

Everything else (routes, CORS, compression, 100 MB limits, S3 uploads, business
logic) is exactly as it was. SSL is handled entirely by nginx + certbot on top.
