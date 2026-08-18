# Plano de Ajustes Finais: Barbeiros e Agendamentos

Implementação do novo barbeiro "Ferreira Black", atualização do barbeiro atual para "OneTwo", aplicação das novas fotos e ajustes na lógica de agendamento independente.

## Ações Sugeridas

### 1. Banco de Dados e Migração
- Criar migração para atribuir o valor "OneTwo" à coluna `barbeiro` em todos os registros que atualmente estão como nulos ou com valores genéricos (como "Barbeiro 1" ou "Geral").
- Garantir a integridade dos agendamentos existentes, sem exclusões.

### 2. Assets (Fotos)
- Criar ponteiros de assets para as fotos enviadas:
    - `image-43.png` -> **Ferreira Black**
    - `anexo-2` (assumindo ser a foto do OneTwo, ou `logo-onetwo-round.png` se for a intenção, mas usarei o arquivo enviado se identificado) -> **OneTwo**
- *Nota: Identificarei qual arquivo corresponde a qual barbeiro com base na ordem do upload/descrição.*

### 3. Frontend (Página Inicial)
- Atualizar os cards de seleção de profissional em `ClientHomePage.tsx`:
    - Substituir "Barbeiro 1" por "OneTwo".
    - Substituir "Barbeiro 2" por "Ferreira Black".
    - Usar as fotos carregadas.
    - Remover descrições ("Especialista em...").
    - Garantir o enquadramento circular dourado e o layout lado a lado.
- Ajustar o título da seção de serviços para "Nossos Serviços" (removendo "Escolha um...").

### 4. Lógica de Agendamento (Edge Function)
- Atualizar `appointments-api` para garantir que o valor padrão de `barbeiro` seja "OneTwo" caso não seja fornecido (para retrocompatibilidade).
- Validar que a lógica de `list_reserved_times` já suporta o filtro por `barbeiro` (confirmado na leitura do código).

## Detalhes Técnicos
- **Migração SQL**: `UPDATE public.appointments SET barbeiro = 'OneTwo' WHERE barbeiro IS NULL OR barbeiro = 'Barbeiro 1' OR barbeiro = 'Geral';`
- **Componentes React**: Modificações em `src/pages/ClientHomePage.tsx` para refletir os novos nomes e fotos.
- **Enquadramento de Imagens**: Uso de `object-fit: cover` e `object-position: center` nos containers circulares para garantir visibilidade do rosto.

---
*Este plano foca na preservação total dos dados e na atualização visual conforme solicitado.*
