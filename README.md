# 🤖 ZapFoodBot — Sistema de Delivery via WhatsApp

Um sistema completo de **automação de pedidos via WhatsApp**, com painel administrativo, controle multi-tenant e integração com **WhatsApp Cloud API**.  
O bot permite gerenciar clientes, operadores, mensagens automáticas, tickets de suporte e planos de assinatura.

---

## 🚀 Tecnologias Utilizadas
- **Frontend:** React , TailwindCSS, Axios, Recharts
- **Backend:** Node.js, Express, MySQL, JWT, bcrypt
- **Bot:** WhatsApp Cloud API (Meta)
- **Outros:** dotenv, nodemailer, venom-bot *(opcional para WhatsApp Web)*

---

## 📦 Funcionalidades
- **Autenticação com JWT** (login, registro e recuperação de senha)
- **Sistema Multi-Tenant** (superadmin, admin e operador)
- **Bot de WhatsApp** com respostas automáticas
- **Painel Admin**
  - Configurações do bot
  - Gerenciamento de clientes e contatos
  - Tickets de suporte
  - Planos e pagamentos
  - Mensagens automáticas
- **Painel do Operador**
  - Atendimento em tempo real
  - Histórico de conversas
  - Resposta inline para clientes
  - Filtros por cliente/data
- **Painel Superadmin**
  - Gerenciamento de tenants
  - Controle de planos
  - Visão geral do sistema

---

## 🛠️ Como rodar localmente

```bash
# 1. Clonar o repositório
git clone https://github.com/seuusuario/zapfoodbot.git

# 2. Instalar dependências
cd zapfoodbot/backend
npm install

cd ../frontend
npm install

# 3. Criar arquivo .env no backend
cp .env.example .env
