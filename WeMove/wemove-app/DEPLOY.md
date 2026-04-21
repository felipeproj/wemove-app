# WeMove — Deploy no Vercel

## Pré-requisitos

- Node.js ≥ 18 instalado
- Conta no [Vercel](https://vercel.com) (gratuita serve)
- Vercel CLI instalado globalmente: `npm install -g vercel`

---

## 1. Instalar dependências e testar o build localmente

Na pasta `wemove-app`, execute:

```bash
npm install
npm run build
```

O build deve terminar sem erros e gerar a pasta `dist/`.  
Se aparecer erro de TypeScript, leia a mensagem e corrija antes de prosseguir.

Para visualizar localmente antes do deploy:

```bash
npm run preview
```

Acesse `http://localhost:4173/?lista=SEU_TOKEN` no navegador.

---

## 2. Configurar variável de ambiente de produção

O arquivo `.env` **não é enviado** ao Vercel. A variável precisa ser configurada
no painel ou via CLI.

### Via CLI (recomendado)

```bash
vercel env add VITE_API_URL production
# quando pedir o valor, cole: https://api.wemoveapp.co
```

### Via painel

1. Acesse vercel.com → seu projeto → **Settings → Environment Variables**
2. Adicione:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://api.wemoveapp.co`
   - **Environment:** Production (e Preview se quiser)

---

## 3. Fazer o deploy

Na pasta `wemove-app`:

```bash
vercel
```

Na primeira vez, o CLI vai perguntar:
- **Set up and deploy?** → `Y`
- **Which scope?** → escolha sua conta
- **Link to existing project?** → `N` (primeiro deploy)
- **Project name?** → `wemove-app` (ou o que preferir)
- **Directory?** → `.` (já estamos na pasta certa)
- **Want to modify settings?** → `N`

Após o deploy você receberá uma URL de preview (ex: `wemove-app-xxx.vercel.app`).

Para promover a produção:

```bash
vercel --prod
```

---

## 4. Configurar domínio personalizado (app.wemoveapp.co)

### No Vercel

```bash
vercel domains add app.wemoveapp.co
```

Ou pelo painel: **Settings → Domains → Add** → `app.wemoveapp.co`

O Vercel vai mostrar os registros DNS necessários. Normalmente é um `CNAME`.

### Na Cloudflare

1. Acesse o painel Cloudflare → zona `wemoveapp.co`
2. DNS → **Add Record**:
   - **Type:** `CNAME`
   - **Name:** `app`
   - **Target:** `cname.vercel-dns.com`
   - **Proxy status:** 🟠 **DNS only** (nuvem cinza — igual ao que foi feito para api.wemoveapp.co)
3. Salve e aguarde alguns minutos para propagar

> ⚠️ Mantenha o proxy **desativado** (DNS only / nuvem cinza). O Vercel gerencia
> o SSL automaticamente e não funciona corretamente com o proxy da Cloudflare ativado.

### Verificar

Após configurar, acesse:
```
https://app.wemoveapp.co
```

O Vercel emitirá o certificado SSL automaticamente em alguns minutos.

---

## 5. Atualizar depois de mudanças no código

```bash
# Commit e push para o repositório
git add .
git commit -m "feat: ..."
git push

# Re-deploy manual (ou configure o git integration no Vercel para auto-deploy)
vercel --prod
```

### Integração contínua (opcional, recomendado)

No painel do Vercel → **Settings → Git** → conecte o repositório GitHub.  
A partir daí, todo `git push` na branch `main` faz deploy automático.

---

## Resumo de URLs

| Serviço         | URL                            |
|-----------------|-------------------------------|
| API (Railway)   | https://api.wemoveapp.co      |
| App (Vercel)    | https://app.wemoveapp.co      |
| Health check    | https://api.wemoveapp.co/health |
