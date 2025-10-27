# 🐾 Obomvet V2 - Plataforma de Emergências Veterinárias

![Status](https://img.shields.io/badge/status-em_desenvolvimento-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-2.0-orange)

---

## 📋 Visão Geral do Projeto

O **Obomvet V2** é uma plataforma online para **comunicação rápida e eficiente** entre **tutores de animais**, **clínicas veterinárias** e **veterinários autônomos** em situações de emergência.  
Através de **alertas geolocalizados**, o sistema notifica automaticamente as clínicas e profissionais mais próximos do local da ocorrência, **agilizando o atendimento** e **aumentando as chances de sucesso no socorro ao animal**.

---

## 🎯 Objetivo Principal

Reduzir o tempo de resposta em emergências veterinárias por meio de uma **conexão direta, geolocalizada e automatizada** entre tutores e profissionais de atendimento veterinário.

---

## 🧩 Documentos e Funcionalidades Principais

| Nº | Documento / Caso de Uso                              | Ator Envolvido                           | Descrição                                                                               |
| -- | ---------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| 1  | **Registrar-se**                                     | Clínica / Veterinário / Tutor  | Permite o cadastro de novos perfis com informações pessoais e profissionais.            |
| 2  | **Efetuar Login**                                    | Clínica / Veterinário / Tutor  | Autentica usuários registrados e libera acesso ao painel conforme o tipo de perfil.     |
| 3  | **Manter Clínica no Mapa**                           | Clínica                        | Atualiza a localização e status da clínica para exibição no mapa de atendimento.        |
| 4  | **Gerenciar Veterinários**                           | Clínica                        | Adiciona, remove ou atualiza veterinários vinculados à clínica.                         |
| 5  | **Receber Notificações de Emergência** *(extend: 6)* | Clínica / Veterinário          | Recebe alertas de emergências próximas conforme localização e disponibilidade.          |
| 6  | **Aceitar Emergência** *(extend: 7)*                 | Clínica / Veterinário          | Visualiza detalhes e confirma o atendimento de uma emergência recebida.                 |
| 7  | **Receber Notificação de Emergência Aceita**         | Tutor / Usuário Não Registrado | Notifica os envolvidos quando uma emergência é aceita por uma clínica ou veterinário.   |
| 8  | **Vincular Pets à Emergência**                       | Tutor                          | Associa um ou mais pets cadastrados ao registro de emergência.                          |
| 9  | **Manter Pets**                                      | Tutor                          | Cadastra, edita e remove informações de animais de estimação do tutor.                  |
| 10 | **Gerar Emergência** *(include: 7 e 8)*              | Tutor / Usuário Não Registrado | Cria um alerta de emergência geolocalizado e notifica clínicas e veterinários próximos. |


---

## 🧠 Regras de Negócio

| ID   | Regra de Negócio | Descrição |
|------|------------------|------------|
| RN01 | Comunicação rápida e eficiente | O aplicativo deve garantir comunicação rápida e direta entre tutores e clínicas. |
| RN02 | Gestão de pets por tutor | O tutor pode cadastrar e gerenciar múltiplos pets vinculados à sua conta. |
| RN03 | Criação de emergência por tutor (atualizada) | Usuários não registrados podem criar alertas de emergência; o cadastro é opcional e pode ser feito após o envio do alerta. |
| RN04 | Notificação automática por proximidade | O sistema identifica clínicas dentro de um raio pré-definido a partir da localização da emergência. |
| RN05 | Disparo simultâneo de notificações | Todas as clínicas próximas recebem o alerta ao mesmo tempo. |
| RN06 | Aceitação de emergência por clínicas | Clínicas e veterinários autônomos podem visualizar detalhes básicos e confirmar disponibilidade. |
| RN07 | Confirmação de aceitação ao tutor | Após aceitação, o tutor recebe os dados da clínica para organizar o transporte do pet. |
| RN08 | Designação de veterinários por clínica | Clínicas podem designar profissionais específicos para emergências conforme especialidade e disponibilidade. |
| RN09 | Atendimento por veterinários autônomos | Veterinários independentes podem definir áreas de atuação e horários e receber alertas compatíveis. |
| RN10 | Transcrição de áudio para texto | O tutor pode relatar a emergência por áudio, que será transcrito automaticamente e usado para preencher o formulário. |
| RN11 | Mapa de clínicas | Tutores podem visualizar clínicas cadastradas, com filtros por especialidade, horário e distância. |
| RN12 | Proteção de dados (LGPD) | Dados pessoais e de localização exata do tutor só são exibidos após a aceitação da emergência pela clínica. Uma solução de perímetro visual é usada para evitar conflito com a LGPD. |

---

## ⚙️ Requisitos Funcionais

| ID | Requisito Funcional | Categoria |
|----|----------------------|------------|
| RF01 | Registrar e autenticar tutores, clínicas e veterinários. | Técnica |
| RF02 | Cadastrar e gerenciar múltiplos pets com informações completas. | Usuário |
| RF03 | Criar emergências com pet, descrição e localização. | Usuário |
| RF04 | Capturar automaticamente as coordenadas GPS da emergência. | Técnica |
| RF05 | Identificar clínicas e veterinários próximos. | Negócio |
| RF06 | Enviar notificações push em tempo real para clínicas elegíveis. | Técnica |
| RF07 | Interface de listagem de emergências pendentes para clínicas. | Usuário |
| RF08 | Configurar área de cobertura de clínicas para receber alertas. | Negócio |
| RF09 | Configurar área de cobertura de veterinários autônomos. | Negócio |
| RF10 | Relatar emergências por áudio. | Usuário |
| RF11 | Transcrever áudio para texto automaticamente. | Técnica |
| RF12 | Exibir mapa com todas as clínicas cadastradas. | Técnica |
| RF13 | Filtrar clínicas por especialidade, horário e outros critérios. | Usuário |
| RF14 | Notificar tutor após aceitação de emergência. | Técnica |
| RF15 | Exibir histórico de emergências e atendimentos por pet. | Usuário |
| RF16 | Permitir contato direto com clínica (telefone ou WhatsApp). | Usuário |
| RF17 | Tutor pode cancelar alerta de emergência. | Usuário |
| RF18 | Veterinários podem acessar histórico de atendimentos. | Negócio |
| RF19 | Clínicas podem gerenciar seus veterinários e designar atendimentos. | Negócio |
| RF20 | Veterinários autônomos podem gerenciar disponibilidade e serviços. | Negócio |

---

## 📊 Requisitos Não Funcionais

* **Desempenho:** Latência máxima de 5s entre criação e notificação.
* **Confiabilidade:** Disponibilidade alvo de 99,5%.
* **Segurança:** Criptografia TLS e controle de acesso baseado em roles.
* **Usabilidade:** Interface simples e otimizada para uso em emergências.
* **Compatibilidade:** Compatível com navegadores modernos e apps Android/iOS.
* **Escalabilidade:** Suporte a múltiplas emergências simultâneas.

---

## 🏗️ Modelo de Dados (Entidades Principais)

-- **Usuário** (id, nome, email, senha, tipo)
-- **Tutor** (id, usuario_id, nome_completo, telefone_principal, telefone_alternativo, cpf)
-- **Pet** (id, nome, espécie, raça, data_nascimento, peso, alergias, tutor_id)
-- **Clínica** (id, usuario_id, nome_fantasia, cnpj, endereço, telefone_emergencia, localizacao, disponivel_24h)
-- **Veterinário** (id, usuario_id, clinica_id, nome_completo, crmv, especialidade, visita_tipo, telefone_emergencia, disponivel_24h, localizacao)
-- **Emergência** (id, pet_id, tutor_id, veterinario_id, clinica_id, descricao_sintomas, nivel_urgencia, status, data_abertura, localizacao)
-- **HistóricoAtendimento** (id, emergencia_id, veterinario_id, acao_realizada, data_acao)
-- **Prontuário** (id, pet_id, veterinario_id, clinica_id, emergencia_id, tipo_registro, descricao, diagnostico, prescricao, data_registro)
-- **Anexo** (id, arquivo, descricao, anexable_id, anexable_type)
---

## 🧱 Arquitetura e Tecnologias

| Camada | Tecnologia |
|--------|-------------|
| **Frontend** | React (PWA) |
| **Backend** | Laravel (PHP) |
| **Banco de Dados** | MySQL |
| **Geolocalização** | OpenStreetMap / Nomination |
| **Notificações** | Pusher |
| **Armazenamento** | Hostgator (WebHost) |

---

## 🔐 Segurança

- Autenticação por **JWT**
- Comunicação via **HTTPS (TLS)**
- Criptografia de dados sensíveis
- Controle de acesso por **papel (role-based access)**
- Logs e auditoria para rastreabilidade
- Cumprimento da **LGPD** (com mitigação via perímetro de visualização)

---

## 🧩 Observações Importantes e Ideias

> 🔒 **LGPD e RN07:**  
> A exibição de dados pessoais do tutor só ocorre após a aceitação da emergência pela clínica.  
> Antes disso, é exibido apenas um **perímetro aproximado** da ocorrência, garantindo conformidade com a legislação.

> 🩺 **Prontuário Eletrônico:**  
> Cada atendimento gera um registro contendo dados do animal, histórico médico, diagnóstico e prescrição.

---

## 🤝 Contribuindo

1. Faça um fork deste repositório  
2. Crie uma branch para sua feature:  
   ```bash
   git checkout -b feature/nome-da-feature
