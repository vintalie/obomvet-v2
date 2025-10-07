# Obomvet V2 - Plataforma de Emergências Veterinárias

![Status](https://img.shields.io/badge/status--planejamento-orange) ![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Visão Geral do Projeto

O **Obomvet V2** é uma plataforma online para comunicação rápida e eficiente entre tutores de animais e clínicas veterinárias em situações de emergência. Através de alertas geolocalizados, o sistema notifica automaticamente clínicas próximas do local do incidente, agilizando o atendimento e aumentando as chances de sucesso no socorro ao animal.

## Objetivo Principal

Reduzir o tempo de resposta em emergências veterinárias por meio de uma conexão direta e geolocalizada entre tutores e clínicas, garantindo atendimento rápido e adequado.

---

## 🎯 Regras de Negócio

| ID   | Regra de Negócio                       | Descrição                                                                                             |
| ---- | -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| RN01 | Criação de Emergência por Tutor        | Apenas tutores registrados e autenticados podem criar alertas de emergência.                          |
| RN02 | Gestão de Pets por Tutor               | Cada tutor pode cadastrar e gerenciar múltiplos pets vinculados à sua conta.                          |
| RN03 | Notificação Automática por Proximidade | O sistema identifica clínicas dentro de um raio predeterminado a partir da localização da emergência. |
| RN04 | Disparo Simultâneo de Notificações     | Todas as clínicas próximas recebem a notificação simultaneamente.                                     |
| RN05 | Aceitação de Emergência por Clínicas   | Clínicas podem visualizar detalhes básicos e confirmar disponibilidade para atender.                  |
| RN06 | Confirmação de Aceitação ao Tutor      | Após aceitação pela clínica, o tutor recebe notificação com os dados da clínica.                      |
| RN07 | Proteção de Dados do Tutor             | Dados de contato e localização exata só são revelados após a clínica aceitar a emergência.            |
| RN08 | Histórico de Atendimentos              | Cada emergência permite registro de histórico após ser estabelecida.                                  |

---

## 👥 Casos de Uso

### Atores

* **Tutor**: Proprietário do animal que cria a emergência.
* **Clínica**: Estabelecimento veterinário que responde às emergências.

### Fluxos Principais

| Ator    | Caso de Uso                       | Descrição                                                                                   |
| ------- | --------------------------------- | ------------------------------------------------------------------------------------------- |
| Tutor   | Cadastrar Pets                    | Cadastrar e gerenciar pets (espécie, raça, idade, condições médicas, etc.).                 |
| Tutor   | Criar Alerta de Emergência        | Iniciar alerta, selecionar pet, descrever emergência e confirmar localização via GPS.       |
| Tutor   | Visualizar Respostas das Clínicas | Visualizar notificações de clínicas que aceitaram o pedido.                                 |
| Tutor   | Acompanhar Histórico              | Visualizar histórico completo de atendimentos por emergência.                               |
| Clínica | Receber Notificação de Emergência | Receber notificações em tempo real sobre emergências na área.                               |
| Clínica | Aceitar Emergência                | Analisar resumo e confirmar disponibilidade; ao aceitar, ganha acesso aos dados do tutor.   |
| Clínica | Registrar Atendimento             | Adicionar informações ao histórico da emergência (diagnóstico, procedimentos, observações). |

---

## 📝 Requisitos

### Requisitos Funcionais

| ID   | Requisito Funcional                                                              | Categoria  |
| ---- | -------------------------------------------------------------------------------- | ---------- |
| RF01 | Registrar e autenticar utilizadores (tutores e clínicas).                        | Técnica    |
| RF02 | Tutores podem cadastrar e gerenciar múltiplos pets com dados completos.          | Utilizador |
| RF03 | Formulário para tutor criar emergências, selecionando pet e descrevendo o caso.  | Utilizador |
| RF04 | Captura automática das coordenadas GPS do local da emergência.                   | Técnica    |
| RF05 | Identificar clínicas registadas dentro de um raio pré-definido.                  | Negócio    |
| RF06 | Enviar notificação push para todas as clínicas identificadas.                    | Técnica    |
| RF07 | Interface para clínicas visualizarem emergências pendentes com detalhes básicos. | Utilizador |
| RF08 | Permitir que clínica aceite a emergência e notifique o tutor.                    | Negócio    |
| RF09 | Disponibilizar info de contacto do tutor somente após aceitação pela clínica.    | Negócio    |
| RF10 | Clínicas registarem histórico de atendimentos por emergência.                    | Negócio    |
| RF11 | Manter histórico completo de emergências e atendimentos para tutores e clínicas. | Negócio    |

### Requisitos Não Funcionais

* **Desempenho**: Latência baixa no envio de notificações — meta: < 5s entre criação do alerta e recebimento.
* **Confiabilidade**: Disponibilidade alvo de **99,5% uptime**.
* **Segurança**: Criptografia em trânsito e em repouso; controles de acesso e auditoria.
* **Usabilidade**: Interface simples e direta; mínimo de passos para criar alertas em situações de stress.
* **Compatibilidade**: Suporte às versões estáveis mais recentes de iOS e Android.
* **Escalabilidade**: Suportar picos de uso durante emergências múltiplas.

---

## 🏗️ Modelo de Dados (Entidades Principais)

* **Tutor**: id, nome, email, telefone, localização (coordenadas), dados de verificação
* **Pet**: id, tutor_id, nome, espécie, raça, idade, histórico médico, alergias
* **Emergência**: id, tutor_id, pet_id, descrição, latitude, longitude, status, data_criação
* **Clínica**: id, nome, endereço, localização (coordenadas), raio_atendimento, contatos
* **Atendimento**: id, emergencia_id, clinica_id, data_hora, procedimentos, observações

---

## 🛠️ Tecnologias e Implementação (Sugestão de Stack)

* **Frontend:** React Native ou Flutter (aplicativo móvel)
* **Backend:** Node.js / Python (FastAPI) / Java (Spring Boot) — API REST
* **Banco de Dados:** PostgreSQL (recomendado) / MongoDB
* **Geolocalização:** Google Maps Platform ou Mapbox
* **Notificações:** Firebase Cloud Messaging (FCM)
* **Armazenamento de Arquivos:** AWS S3 ou Google Cloud Storage

### Integrações Necessárias

* API de Geolocalização (cálculo de proximidade)
* Serviço de Push Notifications (FCM)
* Gateways de Pagamento (se oferecer serviços pagos)

---

## 🔐 Considerações de Segurança

* Autenticação com JWT
* Criptografia TLS para todas as comunicações
* Criptografia de campos sensíveis em repouso (ex.: dados de contato)
* Controle de acesso baseado em roles (tutor vs clínica)
* Logs e auditoria para ações sensíveis
* Validação e sanitização rigorosa de inputs

---

## 📦 Implantação (Pontos Importantes)

* Deploy do backend em infraestrutura redundante (ex.: AWS ECS/EKS, GCP Cloud Run)
* Uso de CDN e balanceamento de carga para reduzir latência
* Monitoramento e alertas (Prometheus/Grafana, Sentry)
* Backup periódico do banco de dados e testes de restauração

---

## 🤝 Contribuindo

1. Fork este repositório
2. Crie uma branch com sua feature: `git checkout -b feature/nome-da-feature`
3. Faça commits claros e atômicos
4. Abra um Pull Request descrevendo a mudança

---

## 🧾 Licença

Este projeto pode ser licenciado sob MIT — ajuste conforme necessidade.

---

> *Este README será atualizado conforme o desenvolvimento do projeto avança e novas funcionalidades são implementadas.*

*Gerado com base na especificação fornecida.*
