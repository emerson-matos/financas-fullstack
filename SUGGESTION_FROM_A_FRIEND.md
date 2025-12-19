Nós trabalhamos em uma Startup e a nossa tarefa hoje é criar um modelo de dados inicial faça perguntas para esclarecer possíveis dúvidas, não assuma nada como verdade, não invente coisas. Parte da premissa aqui atualmente só temos o usuário. Nós Startup tem como objetivo fornecer uma ferramenta de gerenciamento de gastos pessoal o principal caso de uso é a gestão de finanças individual, contas bancárias, cartão de crédito essas coisas o segundo caso de uso mais importante é o compartilhamento de orçamentos onde auxiliamos os usuários a dividir a cobrança entre um grupo de pessoas sendo elas usuários ou vão da plataforma.
Considerações:

- A autenticação de nossos usuários será via supabase auth ele vai administrar as informações dos usuários, a principio nao vemos necessidade de armazenamento local, apenas uma referencia fraca identificavel.
- Será interessante ter informações para poder identificar o usuário, para poder personalizar a experiencia(idioma talvez?) e para poder enviar emails de convite. mas podemos também usar a API do supabase auth.
- Mais de um perfil por usuario é interessante(algo como "Pessoal", "Trabalho", "Família"), mas não é o foco atual
- Usuarios podem ser excluidos. acredito nao ser necessario manter historico
- Inicialmenete pensamos no suporte para cartão de crédito, poupança/investimento, crypto(no futuro, gestao manual a principio) e carteira de dinheiro fisico (que seria a opcao inicial padrao)
- Uma conta pode ter um unico dono, mas pode ter mais de um usuario com permissao de interagir com ela, para ter funcionalidade de especie de conta conjunta (todos com mesmo nivel de permissao)
- saldo será sempre derivado das transações, porem pode ser util algum tipo de precomputação
- Algumas cntas podem ter informações especificas como data de vencimento ou limite de crédito
- Gostariamos de ter transacoes recorrentes
- Queremos ter informação de transferencias entre contas de um mesmo usuario para auxiliar a analise (evitar contar uma transacao crédito ou débito por mais de uma vez)
- queremos ter orçamento de periodo flexivel (ex: do dia 10 ao 25) ou de periodo fixo(ex: recorrente de mês inteiro) (escolha do usuario)
- Pretendemos ter serviço de classificação, mas o usuario pode classificar manualmente as transações
- O orçamento pode ser para um grupo ou para um usuario
- Orcamentos podem ser por valor total livre ou por categorias
- precisamos ter historico para poder gerar relatorios
- Orçamentos são apenas sobre transações e valor livre ou transações e categorias.
- Uma pessoa convidada receberia só a informação final das transacoes do grupo/orçamento
- O usuario administrador pode inserir ou remover as transacoes (soft delete), membros podem adicionar items e visualizadores podem visualizar mas nao podem inserir ou alterar
- A divisão do grupo deve poder personalizar um percentual de contribuição dos participantes definido pelo administrador do grupo que é valido para o tempo de vida do grupo ou até ser alterado (ter historico é interessante) (membros que pagam valor fixo podem ser tratados como pagando contribuição zero)
- só o administrador do grupo gerencia ele (adiciona ou remove membros, define divisão).
- um grupo pode ter um ou mais usuarios administradores
- seria interessante ter o registro de contribuições "Splitwise", mas não é necessidade para agora.
- auditoria/historico de informação pode ser simples (algo como quem criou e o ultimo a mudar provavelmente é suficiente)
- Usuarios convidados(nao cadastrados) recebem informação sobre o grupo via email, caso se cadastrem com o email que pertence a um grupo passam a ser visualizadores, administradores gerenciam o acesso dos membros do grupo
- Nao temos interesse em open banking no momento, por hora apenas importação manual de arquivos (como ofx)
- um usuario excluido nao pode impactar no historico (orçamentos dos grupos) dos grupos ao qual ele participou
- As contas podem apenas ter interação pelos administradores da mesma
- Apenas transferencias tem relacao a duas contas, o restante é apenas uma transacao para uma conta.
- Recorrencia de transacoes pode ser regras básicas para começar
- Pensamos em ter relatórios prontos no sistema (ex: “Gastos por categoria/mês”)
- Queremos ter multi moeda
  aceito sugestoes
  ERD é um bom inicio, use mermaid
  erDiagram
  USER {
  string id PK "supabase auth_user_id"
  string email
  string name
  string locale
  datetime created_at
  datetime updated_at
  datetime deleted_at
  }

      ACCOUNT {
          int id PK
          string name
          string type "wallet | savings | credit_card | crypto"
          string currency
          datetime created_at
          datetime updated_at
          datetime deleted_at
      }

      ACCOUNT_USER {
          int id PK
          int account_id FK
          string user_id FK
          string role "admin | member | viewer"
          datetime created_at
      }

      TRANSACTION {
          int id PK
          int account_id FK
          int category_id FK
          int transfer_id FK "link to another transaction if transfer"
          decimal amount
          string currency
          string description
          datetime date
          string recurrence_rule
          string created_by
          datetime created_at
          string updated_by
          datetime updated_at
          string deleted_by
          datetime deleted_at
      }

      CATEGORY {
          int id PK
          string name
          string type "expense | income | transfer"
      }

      BUDGET {
          int id PK
          string scope "user | group"
          string type "total | category"
          decimal amount
          date start_date
          date end_date
          string recurrence_rule
          string created_by
          datetime created_at
          string updated_by
          datetime updated_at
      }

      BUDGET_CATEGORY_LIMIT {
          int id PK
          int budget_id FK
          int category_id FK
          decimal limit_amount
      }

      "GROUP" {
          int id PK
          string name
          datetime created_at
          datetime updated_at
      }

      GROUP_MEMBER {
          int id PK
          int group_id FK
          string user_id FK
          string role "admin | member | viewer"
          datetime joined_at
      }

      GROUP_INVITE {
          int id PK
          int group_id FK
          string email
          string role
          string status "pending | accepted | revoked"
          datetime invited_at
      }

      GROUP_SPLIT_RULE {
          int id PK
          int group_id FK
          string user_id FK
          decimal percentage
          date valid_from
          date valid_to
      }

      %% RELATIONSHIPS
      USER ||--o{ ACCOUNT_USER : has
      ACCOUNT ||--o{ ACCOUNT_USER : shared_with
      ACCOUNT ||--o{ TRANSACTION : has
      CATEGORY ||--o{ TRANSACTION : classifies
      BUDGET ||--o{ BUDGET_CATEGORY_LIMIT : defines
      "GROUP" ||--o{ GROUP_MEMBER : has
      "GROUP" ||--o{ GROUP_INVITE : invites
      "GROUP" ||--o{ GROUP_SPLIT_RULE : defines
      USER ||--o{ GROUP_MEMBER : participates
      USER ||--o{ TRANSACTION : creates
      USER ||--o{ BUDGET : owns

Esse ERD já cobre:

Usuário (ligado ao supabase auth)

Contas compartilhadas

Transações (recorrentes, transferências)

Categorias

Orçamentos (individuais ou de grupo)

Grupos (membros, convites, regras de divisão)

👉 Quer que eu deixe esse diagrama mais minimalista (só entidades e relações principais) para uma visão de alto nível, ou já detalhado como está (com audit fields e atributos específicos)?
